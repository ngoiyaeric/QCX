/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:41:35
 * @Description: Geocoding Schema
 */
import { z } from "zod";

// Geocoding Arguments Schema
export const GeocodingArgsSchema = z.object({
  searchText: z.string().min(1).describe("The search text to geocode"),
  limit: z
    .number()
    .min(1)
    .max(10)
    .default(5)
    .describe("Limit the number of results"),
  types: z
    .array(
      z.enum([
        "country",
        "region",
        "postcode",
        "district",
        "place",
        "locality",
        "neighborhood",
        "address",
        "poi",
      ])
    )
    .optional()
    .describe("Filter results by feature types"),
  language: z
    .string()
    .regex(/^[a-z]{2}$/)
    .optional()
    .describe("Language of the search results"),
  fuzzyMatch: z
    .boolean()
    .default(true)
    .describe("Enable/disable fuzzy matching"),
});
