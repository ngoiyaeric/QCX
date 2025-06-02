import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Configuration schema
export const configSchema = z.object({
  mapboxAccessToken: z.string().describe("Mapbox API access token"),
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

// Common schemas for location data
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
    name: "Enhanced Mapbox MCP Server",
    version: "1.0.0",
  });

  // Helper function to create map URLs
  const createMapUrl = (lat: number, lng: number, zoom = 12, route?: string) => {
    const baseUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static`;
    if (route) {
      return `${baseUrl}/path-5+f44(${route})/${lng},${lat},${zoom}/800x600@2x?access_token=${config.mapboxAccessToken}`;
    }
    return `${baseUrl}/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/800x600@2x?access_token=${config.mapboxAccessToken}`;
  };

  // Geocoding tool - converts addresses to coordinates
  server.tool(
    "geocode_location",
    "Convert an address or place name to coordinates and get a map preview",
    {
      query: z.string().describe("Address, place name, or location to geocode"),
      includeMapPreview: z.boolean().default(true).describe("Include map preview URL"),
    },
    async ({ query, includeMapPreview }) => {
      try {
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${config.mapboxAccessToken}&limit=1`;
        
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
          return {
            content: [{ 
              type: "text", 
              text: `No location found for "${query}"` 
            }]
          };
        }

        const feature = data.features[0];
        const [longitude, latitude] = feature.center;
        const placeName = feature.place_name;
        
        const location = {
          latitude,
          longitude,
          place_name: placeName,
          address: placeName,
        };

        const result = {
          location,
          mapUrl: includeMapPreview ? createMapUrl(latitude, longitude) : undefined,
        };

        return {
          content: [
            { 
              type: "text", 
              text: `📍 **${placeName}**\n\n**Coordinates:** ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n\n${includeMapPreview ? `**[🗺️ View on Map](${result.mapUrl})**` : ''}` 
            },
            {
              type: "text",
              text: `\n\n**Structured Data:**\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``
            }
          ]
        };
      } catch (error) {
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
        // Helper to get coordinates from address or parse lat,lng
        const getCoordinates = async (location: string): Promise<[number, number]> => {
          if (location.includes(',')) {
            const [lat, lng] = location.split(',').map(s => parseFloat(s.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
              return [lng, lat]; // Mapbox expects [lng, lat]
            }
          }
          
          // Geocode the address
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${config.mapboxAccessToken}&limit=1`;
          const response = await fetch(geocodeUrl);
          const data = await response.json();
          
          if (!data.features || data.features.length === 0) {
            throw new Error(`Location not found: ${location}`);
          }
          
          return data.features[0].center;
        };

        const [fromLng, fromLat] = await getCoordinates(from);
        const [toLng, toLat] = await getCoordinates(to);
        
        // Get directions
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
        const distanceKm = (route.distance / 1000).toFixed(2);
        const durationMin = Math.round(route.duration / 60);
        
        // Create route map URL if requested
        let routeMapUrl = '';
        if (includeRouteMap) {
          // Encode the route geometry for static map
          const geometry = route.geometry;
          const encodedRoute = encodeURIComponent(JSON.stringify(geometry));
          routeMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/geojson(${encodedRoute})/auto/800x600@2x?access_token=${config.mapboxAccessToken}`;
        }

        const result = {
          from: { latitude: fromLat, longitude: fromLng, address: from },
          to: { latitude: toLat, longitude: toLng, address: to },
          distance: parseFloat(distanceKm),
          duration: durationMin,
          profile,
          route_geometry: route.geometry,
          mapUrl: includeRouteMap ? routeMapUrl : undefined,
        };

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
        return {
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
        // Get center coordinates
        let centerCoords: [number, number];
        if (location.includes(',')) {
          const [lat, lng] = location.split(',').map(s => parseFloat(s.trim()));
          centerCoords = [lng, lat];
        } else {
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${config.mapboxAccessToken}&limit=1`;
          const response = await fetch(geocodeUrl);
          const data = await response.json();
          centerCoords = data.features[0]?.center;
        }

        if (!centerCoords) {
          return {
            content: [{ type: "text", text: `Could not find location: ${location}` }]
          };
        }

        // Search for places
        const searchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${config.mapboxAccessToken}&proximity=${centerCoords[0]},${centerCoords[1]}&limit=${limit}`;
        
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

        const places = data.features.map((feature: any) => {
          const [lng, lat] = feature.center;
          return {
            name: feature.text,
            address: feature.place_name,
            latitude: lat,
            longitude: lng,
            mapUrl: createMapUrl(lat, lng, 15),
          };
        });

        let resultText = `🏪 **Found ${places.length} places for "${query}" near ${location}:**\n\n`;
        places.forEach((place: { name: string; address: string; mapUrl: string }, index: number) => {
          resultText += `${index + 1}. **${place.name}**\n   📍 ${place.address}\n   **[🗺️ View](${place.mapUrl})**\n\n`;
        });

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
        let coords: [number, number];
        let placeName = location;
        
        if (location.includes(',')) {
          const [lat, lng] = location.split(',').map(s => parseFloat(s.trim()));
          coords = [lng, lat];
        } else {
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${config.mapboxAccessToken}&limit=1`;
          const response = await fetch(geocodeUrl);
          const data = await response.json();
          
          if (!data.features?.[0]) {
            return {
              content: [{ type: "text", text: `Location not found: ${location}` }]
            };
          }
          
          coords = data.features[0].center;
          placeName = data.features[0].place_name;
        }

        const [lng, lat] = coords;
        const styleMap = {
          streets: 'streets-v12',
          satellite: 'satellite-streets-v12',
          outdoors: 'outdoors-v12',
          dark: 'dark-v11',
          light: 'light-v11'
        };

        const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/${styleMap[style]}/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/${size}@2x?access_token=${config.mapboxAccessToken}`;
        
        const interactiveUrl = `https://api.mapbox.com/v4/mapbox.${style}/${lng},${lat},${zoom}/index.html?access_token=${config.mapboxAccessToken}`;

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