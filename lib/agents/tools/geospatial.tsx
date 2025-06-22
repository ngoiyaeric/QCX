import { createStreamableUI } from 'ai/rsc'; // createStreamableUI is often from ai/rsc
import { createStreamableValue } from 'ai'; // createStreamableValue is often from 'ai' directly
import { BotMessage } from '@/components/message';
import { geospatialQuerySchema } from '@/lib/schema/geospatial';

// New MCP Client imports
import { Client as MCPClientClass } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createSmitheryUrl } from '@smithery/sdk';
import type { ToolCallResultMessage } from '@modelcontextprotocol/sdk';


// Define proper MCP type from the new SDK
export type McpClient = MCPClientClass; // Renamed to avoid conflict with 'Client'

// Helper function to get and connect the new MCP client
async function getConnectedMcpClient(): Promise<McpClient | null> {
  const apiKey = process.env.NEXT_PUBLIC_SMITHERY_API_KEY;
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const profileId = process.env.NEXT_PUBLIC_SMITHERY_PROFILE_ID;

  if (!apiKey) {
    console.error('[GeospatialTool] Environment variable NEXT_PUBLIC_SMITHERY_API_KEY is not set.');
    return null;
  }
  if (!mapboxAccessToken) {
    console.error('[GeospatialTool] Environment variable NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set.');
    return null;
  }
  if (!profileId) {
    console.error('[GeospatialTool] Environment variable NEXT_PUBLIC_SMITHERY_PROFILE_ID is not set.');
    return null;
  }

  const config = {
    mapboxAccessToken: mapboxAccessToken
  };

  const mcpServerBaseUrl = "https://server.smithery.ai/mapbox-mcp-server";

  const smitheryUrlOptions = {
    config,
    apiKey,
    profileId
  };

  let serverUrlToUse;
  try {
    serverUrlToUse = createSmitheryUrl(mcpServerBaseUrl, smitheryUrlOptions);
  } catch (e: any) {
    console.error('[GeospatialTool] Error creating Smithery URL:', e.message);
    return null;
  }

  // Server-side logging
  // console.log(`[GeospatialTool] Generated MCP Server URL (parameters hidden for security): ${serverUrlToUse.split('?')[0]}...`);


  const transport = new StreamableHTTPClientTransport(serverUrlToUse);
  const client = new MCPClientClass({ // Use the aliased MCPClientClass
    name: "GeospatialToolClient",
    version: "1.0.0"
  });

  try {
    // Server-side logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[GeospatialTool] Attempting to connect to MCP server...');
    }
    await client.connect(transport);
    if (process.env.NODE_ENV === 'development') {
      console.log('[GeospatialTool] Successfully connected to MCP server.');
      // const tools = await client.listTools();
      // console.log(`[GeospatialTool] Available tools: ${tools.map(t => t.name).join(", ")}`);
    }
    return client;
  } catch (error) {
    console.error('[GeospatialTool] MCP connection failed:', error);
    // Attempt to close client, though connect might have failed before it's fully open
    try {
      await client.close();
    } catch (closeError) {
      // console.error('[GeospatialTool] Error closing MCP client after connection failure:', closeError);
    }
    return null;
  }
}


export const geospatialTool = ({
  uiStream,
}: {
  uiStream: ReturnType<typeof createStreamableUI>;
  // mcp: McpClient | null; // MCP client will now be managed internally by the tool
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
    const uiFeedbackStream = createStreamableValue<string>();
    uiFeedbackStream.done(`Geospatial query: "${query}". Contacting mapping service...`);
    uiStream.append(<BotMessage content={uiFeedbackStream.value} />);

    const mcpClient = await getConnectedMcpClient();

    if (!mcpClient) {
      // console.warn is fine for server-side logs
      console.warn('[GeospatialTool] MCP client could not be initialized or connected.');
      const errorStream = createStreamableValue<string>();
      errorStream.done('Geospatial functionality is currently unavailable.');
      uiStream.append(<BotMessage content={errorStream.value} />);
      return {
        type: 'MAP_QUERY_TRIGGER',
        originalUserInput: query,
        timestamp: new Date().toISOString(),
        mcp_response: null,
        error: 'MCP client initialization failed',
      };
    }

    // Server-side logging (won't appear in chat)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[GeospatialTool] Using NEXT_PUBLIC_SMITHERY_PROFILE_ID: "${process.env.NEXT_PUBLIC_SMITHERY_PROFILE_ID}"`
      );
      // API key is not logged directly for security, even masked, if using createSmitheryUrl correctly
    }

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
    let toolError: string | null = null;

    try {
      const geocodeParams = { query, includeMapPreview: true };
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[GeospatialTool] Calling "geocode_location" tool with params:',
          geocodeParams
        );
      }

      const geocodeResult: ToolCallResultMessage = await mcpClient.callTool(
        'geocode_location', // Ensure this tool name is correct
        geocodeParams
      );

      if (process.env.NODE_ENV === 'development') {
         // console.log('[GeospatialTool] Raw geocode_location result:', JSON.stringify(geocodeResult, null, 2));
      }

      // Process tool_results from MCP
      // The new SDK's callTool likely returns a structured object.
      // We need to inspect `geocodeResult.tool_results` which should be an array.
      // Each item in tool_results would have `content` (often a string, potentially JSON string).
      const toolResults = geocodeResult.tool_results;
      if (toolResults && toolResults.length > 0 && toolResults[0].content) {
        // Assuming the relevant JSON is in the first tool_result's content
        // The content might be a string that itself contains a JSON block.
        let contentToParse = toolResults[0].content;
        if (typeof contentToParse === 'string') {
            const jsonRegex = /```json\n([\s\S]*?)\n```/;
            const match = contentToParse.match(jsonRegex);
            if (match?.[1]) {
                contentToParse = match[1]; // Extract content from Markdown code block
            }
        }

        try {
          // If contentToParse is already an object due to MCP parsing, this might not be needed.
          // If it's a string, it needs parsing.
          const parsedJson = typeof contentToParse === 'string' ? JSON.parse(contentToParse) : contentToParse;

          if (parsedJson.location) {
            mcpData = {
              location: {
                latitude: parsedJson.location.latitude,
                longitude: parsedJson.location.longitude,
                place_name: parsedJson.location.place_name,
                address: parsedJson.location.address,
              },
              mapUrl: parsedJson.mapUrl, // Assuming mapUrl is at the top level of parsedJson
            };
            if (process.env.NODE_ENV === 'development') {
              console.log('[GeospatialTool] Successfully parsed MCP geocode data:', mcpData);
            }
          } else {
            console.warn(
              "[GeospatialTool] Parsed JSON from MCP does not contain expected 'location' field. Response:", parsedJson
            );
            toolError = "Unexpected data structure from mapping service.";
          }
        } catch (parseError: any) {
          console.error(
            '[GeospatialTool] Error parsing JSON from MCP response:',
            parseError.message,
            '\nRaw content was:',
            toolResults[0].content
          );
          toolError = "Failed to parse response from mapping service.";
        }
      } else {
        console.warn(
          '[GeospatialTool] Geocode result from MCP is not in the expected format or content is missing.',
          geocodeResult
        );
        toolError = "No valid result from mapping service.";
      }
    } catch (error: any) {
      console.error('[GeospatialTool] MCP tool call failed:', error.message);
      toolError = `Error calling mapping service: ${error.message}`;
    } finally {
      if (mcpClient) {
        try {
          await mcpClient.close();
          if (process.env.NODE_ENV === 'development') {
            // console.log('[GeospatialTool] MCP client closed.');
          }
        } catch (e: any) {
          console.error('[GeospatialTool] Error closing MCP client:', e.message);
        }
      }
    }

    if (toolError && !mcpData) {
      const errorStream = createStreamableValue<string>();
      errorStream.done(toolError);
      uiStream.update(<BotMessage content={errorStream.value} />); // Update instead of append if appropriate
    }


    return {
      type: 'MAP_QUERY_TRIGGER',
      originalUserInput: query,
      timestamp: new Date().toISOString(),
      mcp_response: mcpData,
      error: toolError, // Include error information if any
    };
  },
});
