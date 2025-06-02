import { useState, useCallback, useRef } from 'react';
import { experimental_createMCPClient, generateText } from 'ai';
import { getModel } from 'QCX/lib/utils';

// Types for location and mapping data
interface LocationResult {
  location: {
    latitude: number;
    longitude: number;
    place_name?: string;
    address?: string;
  };
  mapUrl?: string;
}

interface DistanceResult {
  from: { latitude: number; longitude: number; address: string };
  to: { latitude: number; longitude: number; address: string };
  distance: number;
  duration: number;
  profile: string;
  mapUrl?: string;
}

interface PlaceResult {
  places: Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    mapUrl: string;
  }>;
}

// Custom hook for MCP client integration
export const useMCPMapClient = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<any>(null);
  const toolsRef = useRef<any>(null);

  const connect = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const client = await experimental_createMCPClient({
        transport: {
          type: 'sse',
          url: `https://server.smithery.ai/@ngoiyaeric/mapbox-mcp-server/mcp?profile=${process.env.NEXT_PUBLIC_SMITHERY_PROFILE_ID}&api_key=${process.env.NEXT_PUBLIC_SMITHERY_API_KEY}`,
        },
      });
      const tools = await client.tools();
      clientRef.current = client;
      toolsRef.current = tools;
      setIsConnected(true);
      console.log('✅ Connected to MCP server');
      console.log('Available tools:', Object.keys(tools));
    } catch (err) {
      setError(`Failed to connect to MCP server: ${err}`);
      console.error('❌ MCP connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (clientRef.current) {
      await clientRef.current.close();
      clientRef.current = null;
      toolsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const processLocationQuery = useCallback(async (query: string) => {
    if (!isConnected || !toolsRef.current) {
      throw new Error('MCP client not connected');
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await generateText({
        model: getModel(),
        tools: toolsRef.current,
        messages: [
          {
            role: 'system',
            content: `You are a helpful location assistant. For location-related queries:
1. For address/place queries: Use geocode_location to find coordinates and get map previews
2. For distance/travel queries: Use calculate_distance to get routes and travel times  
3. For nearby searches: Use search_nearby_places to find points of interest
4. For map generation: Use generate_map_link to create shareable maps

Always include map previews when relevant. Structure responses to be user-friendly.
When providing coordinates, also specify if the map should be toggled/shown.`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        maxSteps: 3,
      });

      let mapLocation = null;
      let shouldShowMap = false;
      const coordPattern = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
      const coordMatch = response.text.match(coordPattern);
      if (coordMatch) {
        mapLocation = {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2]),
          zoom: 12,
        };
        shouldShowMap = true;
      }
      if (
        response.text.toLowerCase().includes('map') ||
        response.text.toLowerCase().includes('location') ||
        response.text.toLowerCase().includes('coordinate')
      ) {
        shouldShowMap = true;
      }

      const typedResponse = response as typeof response & { toolInvocations?: any };
      return {
        result: {
          text: typedResponse.text,
          toolInvocations: typedResponse.toolInvocations,
          finishReason: typedResponse.finishReason,
        },
        mapLocation,
        shouldShowMap,
      };
    } catch (err) {
      setError(`Query processing failed: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  const geocodeLocation = useCallback(async (address: string): Promise<LocationResult> => {
    if (!isConnected || !clientRef.current) {
      throw new Error('MCP client not connected');
    }
    try {
      const result = await clientRef.current.callTool('geocode_location', {
        query: address,
        includeMapPreview: true,
      });
      const match = result.content[1]?.text?.match(/```json\n([\s\S]*?)\n```/);
      return JSON.parse(match?.[1] || '{}');
      
    } catch (err) {
      console.error('Geocoding error:', err);
      throw err;
    }
  }, [isConnected]);

  const calculateDistance = useCallback(async (from: string, to: string, profile: 'driving' | 'walking' | 'cycling' = 'driving'): Promise<DistanceResult> => {
    if (!isConnected || !clientRef.current) {
      throw new Error('MCP client not connected');
    }
    try {
      const result = await clientRef.current.callTool('calculate_distance', {
        from,
        to,
        profile,
        includeRouteMap: true,
      });
      return JSON.parse(result.content[1]?.text?.match(/```json\n(.*?)\n```/s)?.[1] || '{}');
    } catch (err) {
      console.error('Distance calculation error:', err);
      throw err;
    }
  }, [isConnected]);

  const searchNearbyPlaces = useCallback(async (location: string, query: string, radius: number = 1000, limit: number = 5): Promise<PlaceResult> => {
    if (!isConnected || !clientRef.current) {
      throw new Error('MCP client not connected');
    }
    try {
      const result = await clientRef.current.callTool('search_nearby_places', {
        location,
        query,
        radius,
        limit,
      });
      return JSON.parse(result.content[1]?.text?.match(/```json\n(.*?)\n```/s)?.[1] || '{}');
    } catch (err) {
      console.error('Places search error:', err);
      throw err;
    }
  }, [isConnected]);

  return {
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    processLocationQuery,
    geocodeLocation,
    calculateDistance,
    searchNearbyPlaces,
  };
};
