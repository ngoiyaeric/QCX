/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:39:32
 * @Description: Direction Definition
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const DIRECTIONS_TOOL: Tool = {
  name: "mapbox_directions",
  description: "Get navigation route between two points",
  inputSchema: {
    type: "object",
    properties: {
      coordinates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            longitude: {
              type: "number",
              description: "Longitude",
              minimum: -180,
              maximum: 180,
            },
            latitude: {
              type: "number",
              description: "Latitude",
              minimum: -90,
              maximum: 90,
            },
          },
          required: ["longitude", "latitude"],
        },
        description: "Array of coordinates",
      },
      profile: {
        type: "string",
        description: "Navigation mode",
        enum: ["driving-traffic", "driving", "walking", "cycling"],
        default: "driving-traffic",
      },
    },
    required: ["coordinates"],
  },
};
