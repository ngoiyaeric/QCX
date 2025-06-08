/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:31:32
 * @Description: Geocoding Interface
 */

/**
 * Mapbox Geocoding API Response Schema
 *
 * @see{https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object}
 */
export interface MapboxGeocodingResponse {
  type: "FeatureCollection";
  query: string[];
  features: Array<{
    id: string;
    type: "Feature";
    place_type: string[];
    relevance: number;
    properties: {
      accuracy?: string;
      address?: string;
      category?: string;
      maki?: string;
    };
    text: string;
    place_name: string;
    center: [number, number];
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    context?: Array<{
      id: string;
      text: string;
      wikidata?: string;
      short_code?: string;
    }>;
  }>;
  attribution: string;
}
