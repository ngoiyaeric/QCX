/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:39:32
 * @Description: Matrix By Places Definition
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const MATRIX_BY_PLACES_TOOL: Tool = {
  name: "mapbox_matrix_by_places",
  description:
    "Calculate travel time and distance matrices between places using their names",
  inputSchema: {
    type: "object",
    properties: {
      places: {
        type: "array",
        items: {
          type: "string",
        },
        minItems: 2,
        maxItems: 25,
        description: "Array of place names",
      },
      profile: {
        type: "string",
        description: "Navigation mode",
        enum: ["driving", "walking", "cycling"],
        default: "driving",
      },
      annotations: {
        type: "string",
        description: "Type of matrix to return",
        enum: ["duration", "distance", "duration,distance"],
        default: "duration,distance",
      },
      language: {
        type: "string",
        description: "Language for geocoding results",
        pattern: "^[a-z]{2}$",
      },
      sources: {
        type: "array",
        items: {
          type: "number",
          minimum: 0,
        },
        description: "Indices of source places",
      },
      destinations: {
        type: "array",
        items: {
          type: "number",
          minimum: 0,
        },
        description: "Indices of destination places",
      },
      fallback_speed: {
        type: "number",
        minimum: 0,
        description: "Speed for direct path calculation when no route exists",
      },
      depart_at: {
        type: "string",
        pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$",
        description: "Departure time in ISO 8601 format",
      },
    },
    required: ["places"],
  },
};
