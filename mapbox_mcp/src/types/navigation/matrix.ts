/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:31:32
 * @Description: Matrix Interface
 */

/**
 * Mapbox Matrix API Response Schema
 *
 * @see{https://docs.mapbox.com/api/navigation/matrix/#retrieve-a-matrix}
 */
export interface MapboxMatrixResponse {
  code: "Ok" | "NoRoute" | "ProfileNotFound" | "InvalidInput";
  durations?: number[][]; // Travel times in seconds
  distances?: number[][]; // Travel distances in meters
  sources: Array<{
    name: string;
    location: [number, number]; // [longitude, latitude]
    distance: number; // Distance from the input coordinate to the nearest network point
  }>;
  destinations: Array<{
    name: string;
    location: [number, number]; // [longitude, latitude]
    distance: number; // Distance from the input coordinate to the nearest network point
  }>;
}

export type MatrixAnnotation = "duration" | "distance" | "duration,distance";
export type MatrixApproach = "unrestricted" | "curb";

export interface MatrixBearing {
  angle: number; // 0-360 degrees from true north
  deviation: number; // Allowed deviation in degrees
}

export interface MatrixError {
  code: string;
  message: string;
}
