/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:41:35
 * @Description: Matrix By Places Schema
 */
import { z } from "zod";

// Matrix By Places Arguments Schema
export const MatrixByPlacesArgsSchema = z.object({
  places: z.array(z.string()).min(2).max(25).describe("Array of place names"),
  profile: z
    .enum(["driving", "walking", "cycling"])
    .default("driving")
    .describe("Navigation mode"),
  annotations: z
    .enum(["duration", "distance", "duration,distance"])
    .default("duration,distance")
    .describe("Type of matrix to return"),
  language: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional()
    .describe("Language for geocoding results"),
  sources: z
    .array(z.number().min(0))
    .optional()
    .describe("Indices of source places"),
  destinations: z
    .array(z.number().min(0))
    .optional()
    .describe("Indices of destination places"),
  fallback_speed: z
    .number()
    .positive()
    .optional()
    .describe("Speed for direct path calculation when no route exists"),
  depart_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    .optional()
    .describe("Departure time in ISO 8601 format"),
});
