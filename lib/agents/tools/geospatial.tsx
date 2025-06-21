import dotenv from 'dotenv';
dotenv.config();

import { useMcp } from 'use-mcp/react';
import { createStreamableUI, createStreamableValue } from 'ai/rsc';
import { BotMessage } from '@/components/message';
import { geospatialQuerySchema } from '@/lib/schema/geospatial';

// Define proper MCP type
export type McpClient = ReturnType<typeof useMcp>;

export function useGeospatialToolMcp() {
  const mcpServerUrl =
    'https://server.smithery.ai/mapbox-mcp-server/mcp?api_key=705b0222-a657-4cd2-b180-80c406cf6179&profile=smooth-lemur-vfUbUE';
  // Alternative: Dynamic URL (uncomment if using environment variables)
  // const mcpServerUrl = `https://server.smithery.ai/@ngoiyaeric/mapbox-mcp-server/mcp?profile=${process.env.SMITHERY_PROFILE_ID}&api_key=${process.env.SMITHERY_API_KEY}`;

  const mcp = useMcp({
    url: mcpServerUrl,
    debug: process.env.NODE_ENV === 'development',
    autoReconnect: true,
    autoRetry: 5000,
  });

  return mcp;
}

export const geospatialTool = ({
  uiStream,
  mcp,
}: {
  uiStream: ReturnType<typeof createStreamableUI>;
  mcp: McpClient | null;
}) => ({
  description: `Use this tool for any queries that involve locations, places, addresses, distances between places, directions, or finding points of interest on a map. This includes questions like:
- 'Where is [place name/address]?'
- 'Show me [place name/address] on the map.'
- 'What's the latitude and longitude of [place name]?'
- 'How far is it from [location A] to [location B]?'
- 'Give me directions from [location A] to [location B].'
- 'Find cafes near [current location/specified location].'
- 'What's around the [specific landmark]?'
- Any query that implies needing a map or spatial understanding.`,
  parameters: geospatialQuerySchema,
  execute: async ({ query }: { query: string }) => {
    // Provide immediate UI feedback
    const uiFeedbackStream = createStreamableValue<string>();
    uiFeedbackStream.done(`Looking up map information for: "${query}"...`);
    uiStream.append(<BotMessage content={uiFeedbackStream.value} />);

    // Check if MCP client is available
    if (!mcp) {
      console.warn(
        'MCP client is not available, cannot proceed with geospatial query'
      );
      const errorStream = createStreamableValue<string>();
      errorStream.done('Geospatial functionality is currently unavailable.');
      uiStream.append(<BotMessage content={errorStream.value} />);
      return {
        type: 'MAP_QUERY_TRIGGER',
        originalUserInput: query,
        timestamp: new Date().toISOString(),
        mcp_response: null,
        error: 'MCP client not available',
      };
    }

    // Log environment variables for debugging (with API key masked)
    console.log(
      `[GeospatialTool] SMITHERY_PROFILE_ID: "${
        process.env.SMITHERY_PROFILE_ID ?? 'undefined'
      }"`
    );
    console.log(
      `[GeospatialTool] SMITHERY_API_KEY: ${
        process.env.SMITHERY_API_KEY
          ? `****${process.env.SMITHERY_API_KEY.slice(-4)} (masked)`
          : 'undefined'
      }`
    );

    let mcpData:
      | {
          location: {
            latitude?: number;
            longitude?: number;
            place_name?: string;
            address?: string;
          };
          mapUrl?: string;
        }
      | null = null;

    try {
      console.log(`Attempting to connect to MCP server...`);

      if (mcp.state !== 'ready') {
        console.warn(
          `MCP client not ready (state: ${mcp.state}), cannot proceed with tool call.`
        );
        const errorStream = createStreamableValue<string>();
        errorStream.done(
          `MCP client not ready (state: ${mcp.state}). Please try again.`
        );
        uiStream.append(<BotMessage content={errorStream.value} />);
        return {
          type: 'MAP_QUERY_TRIGGER',
          originalUserInput: query,
          timestamp: new Date().toISOString(),
          mcp_response: null,
          error: `MCP client not ready (state: ${mcp.state})`,
        };
      }

      console.log('✅ Successfully connected to MCP server.');

      const geocodeParams = { query, includeMapPreview: true };
      console.log(
        '📞 Attempting to call "geocode_location" tool with params:',
        geocodeParams
      );
      const geocodeResult = await mcp.callTool(
        'geocode_location',
        geocodeParams
      );

      if (geocodeResult?.content && Array.isArray(geocodeResult.content)) {
        const lastContentItem =
          geocodeResult.content[geocodeResult.content.length - 1];
        if (
          lastContentItem?.type === 'text' &&
          typeof lastContentItem.text === 'string'
        ) {
          const jsonRegex = /```json\n([\s\S]*?)\n```/;
          const match = lastContentItem.text.match(jsonRegex);
          if (match?.[1]) {
            try {
              const parsedJson = JSON.parse(match[1]);
              if (parsedJson.location) {
                mcpData = {
                  location: {
                    latitude: parsedJson.location.latitude,
                    longitude: parsedJson.location.longitude,
                    place_name: parsedJson.location.place_name,
                    address: parsedJson.location.address,
                  },
                  mapUrl: parsedJson.mapUrl,
                };
                console.log(
                  '✅ Successfully parsed MCP geocode data:',
                  mcpData
                );
              } else {
                console.warn(
                  "⚠️ Parsed JSON from MCP does not contain expected 'location' field."
                );
              }
            } catch (parseError) {
              console.error(
                '❌ Error parsing JSON from MCP response:',
                parseError,
                '\nRaw text was:',
                lastContentItem.text
              );
            }
          } else {
            console.warn(
              '⚠️ Could not find JSON block in the expected format in MCP response.'
            );
          }
        } else {
          console.warn(
            '⚠️ Last content item from MCP is not a text block or is missing.'
          );
        }
      } else {
        console.warn(
          '⚠️ Geocode result from MCP is not in the expected format (missing content array).',
          geocodeResult
        );
      }
    } catch (error) {
      console.error('❌ MCP connection or tool call failed:', error);
    } finally {
      if (mcp.state === 'ready') {
        console.log(
          '\nMCP client is ready; no explicit close method available for useMcp.'
        );
      }
    }

    // Return a marker object for client-side processing
    return {
      type: 'MAP_QUERY_TRIGGER',
      originalUserInput: query,
      timestamp: new Date().toISOString(),
      mcp_response: mcpData,
    };
  },
});
      }
    } catch (error) {
      console.error('❌ MCP connection or tool call failed:', error);
    } finally {
      if (mcp && mcp.state === 'ready') {
        console.log('\n[GeospatialTool] MCP client is ready; no explicit close method available for useMcp.');
      }
    }

    // Return a marker object for client-side processing
    return {
      type: 'MAP_QUERY_TRIGGER',
      originalUserInput: query,
      timestamp: new Date().toISOString(),
      mcp_response: mcpData,
    };
  },
});