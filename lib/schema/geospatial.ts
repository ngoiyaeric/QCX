import { z } from 'zod';

export const geospatialQuerySchema = z.object({
  query: z.string().describe("The user's original query or the relevant part of it that pertains to a location, place, distance, directions, or map interaction.")
});
