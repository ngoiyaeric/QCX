/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 23:58:32
 * @Description:
 */
import { BaseHandler } from "./base.js";
import { DirectionsArgsSchema } from "../../schemas/navigation/direction.js";
import { DirectionsByPlacesArgsSchema } from "../../schemas/navigation/direction-by-places.js";
import { MatrixArgsSchema } from "../../schemas/navigation/matrix.js";
import { MatrixByPlacesArgsSchema } from "../../schemas/navigation/matrix-by-places.js";
import { handleDirections } from "../../tools/handlers/navigation/direction.js";
import { handleDirectionsByPlaces } from "../../tools/handlers/navigation/direction-by-places.js";
import { handleMatrix } from "../../tools/handlers/navigation/matrix.js";
import { handleMatrixByPlaces } from "../../tools/handlers/navigation/matrix-by-places.js";
import { DIRECTIONS_TOOL } from "../../tools/definitions/navigation/direction.js";
import { DIRECTIONS_BY_PLACES_TOOL } from "../../tools/definitions/navigation/direction-by-places.js";
import { MATRIX_TOOL } from "../../tools/definitions/navigation/matrix.js";
import { MATRIX_BY_PLACES_TOOL } from "../../tools/definitions/navigation/matrix-by-places.js";

export class NavigationHandler extends BaseHandler {
  constructor() {
    super();
    this.tools.add("mapbox_directions");
    this.tools.add("mapbox_directions_by_places");
    this.tools.add("mapbox_matrix");
    this.tools.add("mapbox_matrix_by_places");
    this.toolDefinitions.push(DIRECTIONS_TOOL);
    this.toolDefinitions.push(DIRECTIONS_BY_PLACES_TOOL);
    this.toolDefinitions.push(MATRIX_TOOL);
    this.toolDefinitions.push(MATRIX_BY_PLACES_TOOL);
  }

  async handle({ name, args }: { name: string; args: any }) {
    switch (name) {
      case "mapbox_directions": {
        const { coordinates, profile } = DirectionsArgsSchema.parse(args);
        return await handleDirections(coordinates, profile);
      }
      case "mapbox_directions_by_places": {
        const validatedArgs = DirectionsByPlacesArgsSchema.parse(args);
        return await handleDirectionsByPlaces(validatedArgs);
      }
      case "mapbox_matrix": {
        const validatedArgs = MatrixArgsSchema.parse(args);
        return await handleMatrix(validatedArgs);
      }
      case "mapbox_matrix_by_places": {
        const validatedArgs = MatrixByPlacesArgsSchema.parse(args);
        return await handleMatrixByPlaces(validatedArgs);
      }
      default:
        throw new Error(`Unsupported navigation tool: ${name}`);
    }
  }
}
