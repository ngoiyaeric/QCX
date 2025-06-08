/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:39:32
 * @Description: Matrix Definition
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const MATRIX_TOOL: Tool = {
  name: "mapbox_matrix",
  description:
    "Calculate travel time and distance matrices between coordinates",
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
        minItems: 2,
        maxItems: 25,
        description: "Array of coordinates",
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
      approaches: {
        type: "array",
        items: {
          type: "string",
          enum: ["unrestricted", "curb"],
        },
        description: "Approaches to coordinates",
      },
      bearings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            angle: {
              type: "number",
              minimum: 0,
              maximum: 360,
              description: "Angle in degrees from true north",
            },
            deviation: {
              type: "number",
              minimum: 0,
              maximum: 180,
              description: "Allowed deviation in degrees",
            },
          },
          required: ["angle", "deviation"],
        },
        description: "Bearings for coordinates",
      },
      sources: {
        type: "array",
        items: {
          type: "number",
          minimum: 0,
        },
        description: "Indices of source coordinates",
      },
      destinations: {
        type: "array",
        items: {
          type: "number",
          minimum: 0,
        },
        description: "Indices of destination coordinates",
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
    required: ["coordinates"],
  },
};
