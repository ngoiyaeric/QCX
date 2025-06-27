import { z } from 'zod';

export const geospatialQuerySchema = z.object({
  query: z.string()
    .min(1, "Query cannot be empty")
    .describe("The user's location-based query - can be an address, place name, landmark, or geographic reference"),
  
  queryType: z.enum([
    'geocode',      // Find coordinates for a place
    'reverse',      // Find place name from coordinates  
    'directions',   // Get directions between places
    'distance',     // Calculate distance between places
    'search',       // Search for places/POIs
    'map'          // General map request
  ])
    .optional()
    .default('geocode')
    .describe("The type of geospatial operation to perform"),
  
  includeMap: z.boolean()
    .optional()
    .default(true)
    .describe("Whether to include a map preview/URL in the response"),
  
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  })
    .optional()
    .describe("Optional coordinates for reverse geocoding or as a reference point"),
  
  destination: z.string()
    .optional()
    .describe("Destination for directions queries (when different from main query)"),
  
  radius: z.number()
    .positive()
    .optional()
    .describe("Search radius in kilometers for place searches"),
  
  maxResults: z.number()
    .int()
    .positive()
    .max(20)
    .optional()
    .default(5)
    .describe("Maximum number of results to return for search queries")
});

export type GeospatialQuery = z.infer<typeof geospatialQuerySchema>;

// Helper function to classify query type based on content
export function classifyGeospatialQuery(query: string): GeospatialQuery['queryType'] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('direction') || lowerQuery.includes('route') || lowerQuery.includes('how to get')) {
    return 'directions';
  }
  
  if (lowerQuery.includes('distance') || lowerQuery.includes('how far')) {
    return 'distance';
  }
  
  if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('near')) {
    return 'search';
  }
  
  if (lowerQuery.includes('map') || lowerQuery.includes('show me')) {
    return 'map';
  }
  
  // Check if query contains coordinates (lat/lng pattern)
  if (/[-]?\d+\.?\d*\s*,\s*[-]?\d+\.?\d*/.test(query)) {
    return 'reverse';
  }
  
  return 'geocode';
}