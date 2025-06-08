/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:31:32
 * @Description: Direction Interface
 */

/**
 * Mapbox Directions API Response Schema
 *
 * @see{https://docs.mapbox.com/api/navigation/directions/}
 */
export interface MapboxDirectionsResponse {
  code: string;
  message?: string;
  routes: Array<{
    geometry: string;
    distance: number;
    duration: number;
    weight: number;
    weight_name: string;
    legs: Array<{
      summary: string;
      distance: number;
      duration: number;
      weight: number;
      steps: Array<{
        distance: number;
        duration: number;
        geometry: string;
        mode: string;
        driving_side: string;
        weight: number;
        name: string;
        maneuver: {
          location: [number, number];
          type: string;
          modifier?: string;
          bearing_before: number;
          bearing_after: number;
          instruction: string;
        };
        intersections: Array<{
          location: [number, number];
          bearings: number[];
          entry: boolean[];
          in?: number;
          out?: number;
        }>;
      }>;
    }>;
    weight_typical?: number;
  }>;
  waypoints: Array<{
    name: string;
    location: [number, number];
  }>;
  uuid: string;
}
