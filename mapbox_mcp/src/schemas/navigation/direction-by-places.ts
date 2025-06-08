/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:41:35
 * @Description: Direction By Places Schema
 */
import { z } from "zod";

// Direction By Places Arguments Schema
export const DirectionsByPlacesArgsSchema = z.object({
  places: z
    .array(z.string())
    .min(2)
    .describe("Array of place names to route between"),
  profile: z
    .enum(["driving-traffic", "driving", "walking", "cycling"])
    .default("driving"),
  language: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional()
    .describe("Language for geocoding results"),
});
