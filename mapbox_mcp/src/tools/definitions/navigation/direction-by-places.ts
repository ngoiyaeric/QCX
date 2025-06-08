/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:39:32
 * @Description: Direction By Places Definition
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const DIRECTIONS_BY_PLACES_TOOL: Tool = {
  name: "mapbox_directions_by_places",
  description: "Get navigation route between multiple places using their names",
  inputSchema: {
    type: "object",
    properties: {
      places: {
        type: "array",
        items: {
          type: "string",
        },
        minItems: 2,
        description: "Array of place names to route between",
      },
      profile: {
        type: "string",
        description: "Navigation mode",
        enum: ["driving-traffic", "driving", "walking", "cycling"],
        default: "driving",
      },
      language: {
        type: "string",
        description: "Language for geocoding results",
        pattern: "^[a-z]{2}$",
      },
    },
    required: ["places"],
  },
};
