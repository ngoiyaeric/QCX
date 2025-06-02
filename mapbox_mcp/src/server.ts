// This file defines the Model Context Protocol (MCP) server for Mapbox functionalities.
// It uses the @modelcontextprotocol/sdk to create an MCP server and defines various tools
// (geocode_location, calculate_distance, etc.) that can be called by an MCP client.
// The server interacts with the Mapbox API for its operations.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod"; // Used for schema validation of tool inputs and server configuration.

// Defines the schema for the server's configuration.
// This configuration is typically provided when the server is instantiated.
export const configSchema = z.object({
  // The Mapbox API access token is essential for all interactions with Mapbox services.
  mapboxAccessToken: z.string().describe("Mapbox API access token required for Mapbox API calls."),
  // The debug flag can be used to enable more verbose logging or other debugging behaviors.
  debug: z.boolean().default(false).describe("Enable debug logging (currently not extensively used)."),
});

// Common Zod schemas for location data, used in tool input/output descriptions.
// While not strictly enforced for tool outputs in this setup, they document expected structures.
const LocationSchema = z.object({
  latitude: z.number().describe("Latitude coordinate"),
  longitude: z.number().describe("Longitude coordinate"),
  address: z.string().optional().describe("Human-readable address"),
  place_name: z.string().optional().describe("Place name"),
});

const MapLinkSchema = z.object({
  mapUrl: z.string().describe("URL to view location on map"),
  latitude: z.number(),
  longitude: z.number(),
  zoom: z.number().default(12).describe("Map zoom level"),
});

const DistanceResultSchema = z.object({
  distance: z.number().describe("Distance in kilometers"),
  duration: z.number().describe("Travel duration in minutes"),
  route_geometry: z.string().optional().describe("Encoded route geometry"),
  mapUrl: z.string().describe("URL to view route on map"),
});

export default function createStatelessServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const server = new McpServer({
    name: "Enhanced Mapbox MCP Server", // Name of the MCP server
    version: "1.0.0", // Version of the MCP server
  });

  /**
   * Resolves a location string (which can be an address or 'lat,lng' coordinates)
   * to an array of [longitude, latitude].
   * Uses Mapbox Geocoding API if the location is not already coordinates.
   * 
   * @param location The location string to resolve (e.g., "Eiffel Tower" or "48.8584,2.2945").
   * @param mapboxAccessToken The Mapbox API access token.
   * @returns A Promise resolving to `[longitude, latitude]` array if successful, or `null` if resolution fails.
   */
  const resolveLocationToCoordinates = async (location: string, mapboxAccessToken: string): Promise<[number, number] | null> => {
    // Check if the location string already represents coordinates (e.g., "lat,lng")
    if (location.includes(',')) {
      const [latStr, lngStr] = location.split(',');
      const lat = parseFloat(latStr.trim());
      const lng = parseFloat(lngStr.trim());
      // Ensure both are valid numbers and there are no extra parts
      if (!isNaN(lat) && !isNaN(lng) && location.split(',').length === 2) {
        return [lng, lat]; // Mapbox expects [lng, lat]
      }
    }
    // Geocode the address
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxAccessToken}&limit=1`;
    try {
      const response = await fetch(geocodeUrl);
      if (!response.ok) { // Check if response status is not OK (e.g. 4xx, 5xx)
        console.error(`Geocoding API error for "${location}": ${response.status} ${await response.text()}`);
        return null;
      }
      const data = await response.json();
      if (data.features && data.features.length > 0 && data.features[0].center) {
        return data.features[0].center; // [lng, lat]
      }
      return null; // Location not found
    } catch (error) {
      console.error(`Network or parsing error geocoding "${location}":`, error);
      return null; // Error during geocoding
    }
  };

  // Helper function to create map URLs
  const createMapUrl = (lat: number, lng: number, zoom = 12, route?: string) => {
    const baseUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static`;
    if (route) {
      return `${baseUrl}/path-5+f44(${route})/${lng},${lat},${zoom}/800x600@2x?access_token=${config.mapboxAccessToken}`;
    }
    return `${baseUrl}/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/800x600@2x?access_token=${config.mapboxAccessToken}`;
  };

  // Geocoding tool - converts addresses to coordinates
  // Tool definition for geocoding a location.
  // It converts a query (address or place name) into geographic coordinates.
  server.tool(
    "geocode_location",
    "Convert an address or place name to coordinates and get a map preview", // Tool description for AI
    { // Input schema for the tool, validated by Zod
      query: z.string().describe("Address, place name, or location to geocode"),
      includeMapPreview: z.boolean().default(true).describe("Include map preview URL"),
    },
    async ({ query, includeMapPreview }) => {
      try {
        // Use the helper to get coordinates [lng, lat]
        const coords = await resolveLocationToCoordinates(query, config.mapboxAccessToken);

        if (!coords) {
          return { // Return structure for MCP tool if location not found
            content: [{ 
              type: "text", 
              text: `No location found for "${query}"` 
            }]
          };
        }
        const [longitude, latitude] = coords;
        
        // For the `geocode_location` tool, a descriptive `placeName` is important for user output.
        // Since `resolveLocationToCoordinates` only returns coordinates, this section performs a
        // best-effort attempt to fetch the `placeName` by re-querying the Geocoding API if the
        // original query was not already in 'lat,lng' format.
        let placeName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`; // Default to "lat, lng" string
        // Check if the original query string looks like raw coordinates. If not, try to get a place name.
        if (!query.match(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/)) { 
            const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${config.mapboxAccessToken}&limit=1`;
            try {
                const response = await fetch(geocodeUrl);
                const data = await response.json();
                if (data.features && data.features.length > 0 && data.features[0].place_name) {
                    placeName = data.features[0].place_name; // Use the fetched place name
                }
            } catch (e) { /* If this secondary fetch fails, ignore and use the coordinate string as placeName */ }
        }

        const location = { // Structured location data
          latitude,
          longitude,
          place_name: placeName,
          address: placeName, // Using place_name also as address, consistent with previous behavior
        };

        const result = { // Overall result structure for this tool
          location,
          mapUrl: includeMapPreview ? createMapUrl(latitude, longitude) : undefined,
        };

        // MCP tool response typically includes:
        // 1. A user-friendly text block.
        // 2. A text block containing structured data as a JSON string for programmatic client use.
        return {
          content: [
            { 
              type: "text", 
              text: `📍 **${placeName}**\n\n**Coordinates:** ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\n${includeMapPreview ? `**[🗺️ View on Map](${result.mapUrl})**` : ''}` 
            },
            { // This block provides the full result as a JSON string.
              type: "text",
              text: `\n\n**Structured Data:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
            }
          ]
        };
      } catch (error) {
        // This top-level catch is for any unexpected errors within this tool's specific logic,
        // especially if `resolveLocationToCoordinates` itself doesn't throw but returns null,
        // and subsequent logic here fails.
        return {
          content: [{ 
            type: "text", 
            text: `Error geocoding "${query}": ${error}` 
          }]
        };
      }
    }
  );

  // Distance and directions tool
  server.tool(
    "calculate_distance",
    "Calculate distance and travel time between two locations with route preview",
    {
      from: z.string().describe("Starting location (address or 'lat,lng')"),
      to: z.string().describe("Destination location (address or 'lat,lng')"),
      profile: z.enum(["driving", "walking", "cycling"]).default("driving").describe("Travel mode"),
      includeRouteMap: z.boolean().default(true).describe("Include route map preview"),
    },
    async ({ from, to, profile, includeRouteMap }) => {
      try {
        // Resolve starting and destination locations to coordinates using the helper function.
        const fromCoords = await resolveLocationToCoordinates(from, config.mapboxAccessToken);
        if (!fromCoords) {
          return { content: [{ type: "text", text: `Starting location not found: ${from}` }] };
        }
        const [fromLng, fromLat] = fromCoords;

        const toCoords = await resolveLocationToCoordinates(to, config.mapboxAccessToken);
        if (!toCoords) {
          return { content: [{ type: "text", text: `Destination location not found: ${to}` }] };
        }
        const [toLng, toLat] = toCoords;
        
        // Call Mapbox Directions API to get route information.
        // `geometries=geojson` requests the route geometry in GeoJSON format.
        // `overview=full` requests the most detailed overview geometry.
        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${fromLng},${fromLat};${toLng},${toLat}?access_token=${config.mapboxAccessToken}&geometries=geojson&overview=full`;
        
        const dirResponse = await fetch(directionsUrl);
        const dirData = await dirResponse.json();
        
        if (!dirData.routes || dirData.routes.length === 0) {
          return {
            content: [{ 
              type: "text", 
              text: `No route found between "${from}" and "${to}"` 
            }]
          };
        }

        const route = dirData.routes[0];
        const distanceKm = (route.distance / 1000).toFixed(2); // Convert distance from meters to kilometers.
        const durationMin = Math.round(route.duration / 60); // Convert duration from seconds to minutes.
        
        // Construct URL for a static map image displaying the route, if requested.
        let routeMapUrl = '';
        if (includeRouteMap) {
          // The route geometry (GeoJSON) is URI-encoded and embedded in the URL for the Mapbox Static Images API.
          // The `auto` parameter in the path instructs Mapbox to automatically adjust the viewport to fit the GeoJSON.
          const geometry = route.geometry;
          const encodedRoute = encodeURIComponent(JSON.stringify(geometry));
          routeMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(${encodedRoute})/auto/800x600@2x?access_token=${config.mapboxAccessToken}`;
        }

        const result = { // Structure for the JSON result block
          from: { latitude: fromLat, longitude: fromLng, address: from }, // Retain original 'from' string as address
          to: { latitude: toLat, longitude: toLng, address: to },     // Retain original 'to' string as address
          distance: parseFloat(distanceKm),
          duration: durationMin,
          profile, // Travel profile used (driving, walking, cycling)
          route_geometry: route.geometry, // Include the raw route geometry for potential client-side rendering
          mapUrl: includeRouteMap ? routeMapUrl : undefined,
        };

        // Standard two-part content response: user-friendly text and structured JSON.
        return {
          content: [
            { 
              type: "text", 
              text: `🚗 **Route: ${from} → ${to}**\n\n**Distance:** ${distanceKm} km\n**Duration:** ${durationMin} minutes (${profile})\n\n${includeRouteMap ? `**[🗺️ View Route](${routeMapUrl})**` : ''}` 
            },
            {
              type: "text",
              text: `\n\n**Structured Data:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
            }
          ]
        };
      } catch (error) {
        return { // Catch-all for other errors during route calculation.
          content: [{ 
            type: "text", 
            text: `Error calculating route: ${error}` 
          }]
        };
      }
    }
  );

  // Nearby places search
  server.tool(
    "search_nearby_places",
    "Search for nearby places and points of interest",
    {
      location: z.string().describe("Center location (address or 'lat,lng')"),
      query: z.string().describe("What to search for (e.g., 'restaurants', 'gas stations', 'hotels')"),
      radius: z.number().default(1000).describe("Search radius in meters"),
      limit: z.number().default(5).describe("Maximum number of results"),
    },
    async ({ location, query, radius, limit }) => {
      try {
        // Resolve the central location for the search.
        const centerCoords = await resolveLocationToCoordinates(location, config.mapboxAccessToken);

        if (!centerCoords) {
          return {
            content: [{ type: "text", text: `Could not find center location: ${location}` }]
          };
        }
        const [centerLng, centerLat] = centerCoords;

        // Use Mapbox Geocoding API with proximity to search for nearby places.
        // The `proximity` parameter biases results towards the given coordinates.
        // The `bbox` (bounding box) parameter is also used here to attempt to constrain results
        // roughly by the specified radius. Note: This bbox calculation is a simplification.
        // For more advanced Points of Interest (POI) search, Mapbox Search API (Tilequery or Places endpoints)
        // might be more suitable if the API key supports them.
        const searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${config.mapboxAccessToken}&proximity=${centerLng},${centerLat}&limit=${limit}&bbox=${centerLng-radius/100000},${centerLat-radius/100000},${centerLng+radius/100000},${centerLat+radius/100000}`; 
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
          return {
            content: [{ 
              type: "text", 
              text: `No places found for "${query}" near ${location}` 
            }]
          };
        }

        // Map search results to a structured format for the client.
        const places = data.features.map((feature: any) => {
          const [lng, lat] = feature.center;
          return {
            name: feature.text, // Name of the place/feature
            address: feature.place_name, // Full address or descriptive place name
            latitude: lat,
            longitude: lng,
            mapUrl: createMapUrl(lat, lng, 15), // Generate a static map preview for each place
          };
        });

        // Construct user-friendly text output summarizing the found places.
        let resultText = `🏪 **Found ${places.length} places for "${query}" near ${location}:**\n\n`;
        places.forEach((place: { name: string; address: string; mapUrl: string }, index: number) => {
          resultText += `${index + 1}. **${place.name}**\n   📍 ${place.address}\n   **[🗺️ View](${place.mapUrl})**\n\n`;
        });

        // Return standard two-part content: user-friendly text and structured JSON.
        return {
          content: [
            { type: "text", text: resultText },
            {
              type: "text",
              text: `**Structured Data:**\n\`\`\`json\n${JSON.stringify({ places }, null, 2)}\n\`\`\``
            }
          ]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error searching places: ${error}` 
          }]
        };
      }
    }
  );

  // Map link generator tool
  server.tool(
    "generate_map_link",
    "Generate a shareable map link for coordinates or address",
    {
      location: z.string().describe("Location (address or 'lat,lng')"),
      zoom: z.number().default(12).describe("Map zoom level (1-22)"),
      style: z.enum(["streets", "satellite", "outdoors", "dark", "light"]).default("streets").describe("Map style"),
      size: z.enum(["400x400", "600x400", "800x600", "1024x768"]).default("800x600").describe("Image size"),
    },
    async ({ location, zoom, style, size }) => {
      try {
        // Resolve the input location (address or 'lat,lng') to coordinates.
        const resolvedCoords = await resolveLocationToCoordinates(location, config.mapboxAccessToken);

        if (!resolvedCoords) {
          return { content: [{ type: "text", text: `Location not found: ${location}` }] };
        }
        const coords = resolvedCoords; // Coordinates are [lng, lat]
        const [lng, lat] = coords;
        
        let placeName = `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // Default placeName to "lat, lng" string.

        // If the original location string was likely an address (i.e., not raw 'lat,lng' string),
        // attempt a geocoding call to get a descriptive placeName for the map title.
        // This is a secondary call to enrich the output, similar to the logic in `geocode_location` tool.
        if (!location.includes(',')) { // Heuristic: if no comma, it's likely an address.
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${config.mapboxAccessToken}&limit=1`;
          try {
            const response = await fetch(geocodeUrl);
            const data = await response.json();
            if (data.features && data.features.length > 0 && data.features[0].place_name) {
              placeName = data.features[0].place_name; // Use the fetched, more descriptive place name.
            }
          } catch (error) {
            // If this secondary fetch fails, log the error and fallback to using the coordinate string as placeName.
            console.error(`Error fetching place_name for ${location} in generate_map_link:`, error);
          }
        }

        // Map style short-names (used in input schema) to actual Mapbox style IDs.
        const styleMap = {
          streets: 'streets-v12',
          satellite: 'satellite-streets-v12', // Satellite imagery with streets overlay
          outdoors: 'outdoors-v12',
          dark: 'dark-v11', // Dark mode map style
          light: 'light-v11'  // Light mode map style
        };

        // Generate URL for a static map image using Mapbox Static Images API.
        // Includes a red pin at the location.
        const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/${styleMap[style]}/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/${size}@2x?access_token=${config.mapboxAccessToken}`;
        
        // Generate URL for an interactive map view on mapbox.com (updated to a modern format).
        const interactiveUrl = `https://www.mapbox.com/maps/${styleMap[style]}#${zoom}/${lat}/${lng}`;

        // This tool, unlike others, returns a single text block with formatted links and information.
        return {
          content: [
            { 
              type: "text", 
              text: `🗺️ **Map for ${placeName}**\n\n**Static Map:** [View Image](${mapUrl})\n**Interactive Map:** [Open Map](${interactiveUrl})\n\n**Coordinates:** ${lat.toFixed(6)}, ${lng.toFixed(6)}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [{ 
            type: "text", 
            text: `Error generating map link: ${error}` 
          }]
        };
      }
    }
  );

  return server.server;
}