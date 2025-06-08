/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:45:51
 * @Description: Tools
 */

import { DIRECTIONS_TOOL } from "./definitions/navigation/direction.js";
import { DIRECTIONS_BY_PLACES_TOOL } from "./definitions/navigation/direction-by-places.js";
import { MATRIX_TOOL } from "./definitions/navigation/matrix.js";
import { MATRIX_BY_PLACES_TOOL } from "./definitions/navigation/matrix-by-places.js";
import { GEOCODING_TOOL } from "./definitions/search/geocoding.js";

export const MAPBOX_TOOLS = [
  DIRECTIONS_TOOL,
  DIRECTIONS_BY_PLACES_TOOL,
  MATRIX_TOOL,
  MATRIX_BY_PLACES_TOOL,
  GEOCODING_TOOL,
] as const;
