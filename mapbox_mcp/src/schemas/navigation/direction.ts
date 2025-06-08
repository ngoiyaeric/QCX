/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:41:35
 * @Description: Direction Schema
 */
import { z } from "zod";

export const CoordinateSchema = z.object({
  longitude: z.number().describe("Longitude"),
  latitude: z.number().describe("Latitude"),
});

export const CoordinatesSchema = z
  .array(CoordinateSchema)
  .min(2)
  .describe("Array of coordinates");

// Directions Arguments Schema
export const DirectionsArgsSchema = z.object({
  coordinates: CoordinatesSchema,
  profile: z
    .enum(["driving-traffic", "driving", "walking", "cycling"])
    .default("driving"),
});
