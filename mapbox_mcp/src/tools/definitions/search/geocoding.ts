/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:39:32
 * @Description: Geocoding Definition
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GEOCODING_TOOL: Tool = {
  name: "mapbox_geocoding",
  description: "Search for places and convert addresses into coordinates",
  inputSchema: {
    type: "object",
    properties: {
      searchText: {
        type: "string",
        description: "The search text to geocode",
      },
      limit: {
        type: "number",
        description: "Limit the number of results",
        minimum: 1,
        maximum: 10,
        default: 5,
      },
      types: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "country",
            "region",
            "postcode",
            "district",
            "place",
            "locality",
            "neighborhood",
            "address",
            "poi",
          ],
        },
        description: "Filter results by feature types",
      },
      language: {
        type: "string",
        description: "Language of the search results",
        pattern: "^[a-z]{2}$",
      },
      fuzzyMatch: {
        type: "boolean",
        description: "Enable/disable fuzzy matching",
        default: true,
      },
    },
    required: ["searchText"],
  },
};
