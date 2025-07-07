/**
 * Fixed geospatial tool with improved error handling and schema
 */
import { createStreamableUI, createStreamableValue } from 'ai/rsc';
import { BotMessage } from '@/components/message';
import { geospatialQuerySchema } from '@/lib/schema/geospatial';
import { Client as MCPClientClass } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createSmitheryUrl } from '@smithery/sdk';

export type McpClient = MCPClientClass;

async function getConnectedMcpClient(): Promise<McpClient | null> {
  const apiKey = process.env.NEXT_PUBLIC_SMITHERY_API_KEY;
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const profileId = process.env.NEXT_PUBLIC_SMITHERY_PROFILE_ID;

  console.log('[GeospatialTool] Environment check:', {
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING',
    mapboxAccessToken: mapboxAccessToken ? `${mapboxAccessToken.substring(0, 8)}...` : 'MISSING',
    profileId: profileId ? `${profileId.substring(0, 8)}...` : 'MISSING',
  });

  if (!apiKey || !mapboxAccessToken || !profileId) {
    console.error('[GeospatialTool] Missing required environment variables');
    return null;
  }

  if (!apiKey.trim() || !mapboxAccessToken.trim() || !profileId.trim()) {
    console.error('[GeospatialTool] Empty environment variables detected');
    return null;
  }

  let config;
  try {
    const mapboxMcpConfig = await import('QCX/mapbox_mcp_config.json');
    config = { 
      ...mapboxMcpConfig.default || mapboxMcpConfig, 
      mapboxAccessToken 
    };
    console.log('[GeospatialTool] Config loaded successfully');
  } catch (configError: any) {
    console.error('[GeospatialTool] Failed to load mapbox config:', configError.message);
    config = {
      mapboxAccessToken,
      version: '1.0.0',
      name: 'mapbox-mcp-server'
    };
    console.log('[GeospatialTool] Using fallback config');
  }

  const smitheryUrlOptions = { config, apiKey, profileId };
  const mcpServerBaseUrl = `https://server.smithery.ai/mapbox-mcp-server/mcp?api_key=${smitheryUrlOptions.apiKey}&profile=${smitheryUrlOptions.profileId}`;

  let serverUrlToUse;
  try {
    serverUrlToUse = createSmitheryUrl(mcpServerBaseUrl, smitheryUrlOptions);
    const urlDisplay = serverUrlToUse.toString().split('?')[0];
    console.log('[GeospatialTool] MCP Server URL created:', urlDisplay);
    
    if (!serverUrlToUse.href || !serverUrlToUse.href.startsWith('https://')) {
      throw new Error('Invalid server URL generated');
    }
  } catch (urlError: any) {
    console.error('[GeospatialTool] Error creating Smithery URL:', urlError.message);
    console.error('[GeospatialTool] URL options:', { 
      baseUrl: mcpServerBaseUrl,
      hasConfig: !!config,
      hasApiKey: !!apiKey,
      hasProfileId: !!profileId
    });
    return null;
  }

  let transport;
  let client;
  
  try {
    transport = new StreamableHTTPClientTransport(serverUrlToUse);
    console.log('[GeospatialTool] Transport created successfully');
  } catch (transportError: any) {
    console.error('[GeospatialTool] Failed to create transport:', transportError.message);
    return null;
  }

  try {
    client = new MCPClientClass({ 
      name: 'GeospatialToolClient', 
      version: '1.0.0' 
    });
    console.log('[GeospatialTool] MCP Client instance created');
  } catch (clientError: any) {
    console.error('[GeospatialTool] Failed to create MCP client:', clientError.message);
    return null;
  }

  try {
    console.log('[GeospatialTool] Attempting to connect to MCP server...');
    
    await Promise.race([
      client.connect(transport),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
      }),
    ]);
    
    console.log('[GeospatialTool] Successfully connected to MCP server');
    
    try {
      const tools = await client.listTools();
      console.log('[GeospatialTool] Available tools:', tools.tools?.map(t => t.name) || []);
    } catch (listError: any) {
      console.warn('[GeospatialTool] Could not list tools:', listError.message);
    }
    
    return client;
  } catch (connectionError: any) {
    console.error('[GeospatialTool] MCP connection failed:', connectionError.message);
    console.error('[GeospatialTool] Connection error details:', {
      name: connectionError.name,
      stack: connectionError.stack?.split('\n')[0],
      serverUrl: serverUrlToUse?.toString().split('?')[0],
    });
    
    await closeClient(client);
    return null;
  }
}

async function closeClient(client: MCPClientClass | null) {
  if (!client) return;
  
  try {
    await Promise.race([
      client.close(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Close timeout after 5 seconds')), 5000);
      }),
    ]);
    console.log('[GeospatialTool] MCP client closed successfully');
  } catch (error: any) {
    console.error('[GeospatialTool] Error closing MCP client:', error.message);
  }
}

export const geospatialTool = ({
  uiStream,
}: {
  uiStream: ReturnType<typeof createStreamableUI>;
}) => ({
  description: `Use this tool for location-based queries including:
- Finding specific places, addresses, or landmarks
- Getting coordinates for locations
- Distance calculations between places
- Direction queries
- Map-related requests
- Geographic information lookup`,
  parameters: geospatialQuerySchema,
  execute: async ({ query, queryType, includeMap }: { 
    query: string; 
    queryType?: string; 
    includeMap?: boolean; 
  }) => {
    console.log('[GeospatialTool] Execute called with:', { query, queryType, includeMap });
    
    const uiFeedbackStream = createStreamableValue<string>();
    uiStream.append(<BotMessage content={uiFeedbackStream.value} />);

    let feedbackMessage = `Processing geospatial query: "${query}". Connecting to mapping service...`;
    uiFeedbackStream.update(feedbackMessage);

    const mcpClient = await getConnectedMcpClient();
    
    if (!mcpClient) {
      feedbackMessage = 'Geospatial functionality is currently unavailable. Please check your configuration and try again.';
      uiFeedbackStream.update(feedbackMessage);
      uiFeedbackStream.done();
      uiStream.update(<BotMessage content={uiFeedbackStream.value} />);
      return {
        type: 'MAP_QUERY_TRIGGER',
        originalUserInput: query,
        timestamp: new Date().toISOString(),
        mcp_response: null,
        error: 'MCP client initialization failed - check environment variables and network connectivity',
      };
    }

    let mcpData: { 
      location: { 
        latitude?: number; 
        longitude?: number; 
        place_name?: string; 
        address?: string; 
      }; 
      mapUrl?: string; 
    } | null = null;
    let toolError: string | null = null;

    try {
      feedbackMessage = `Connected to mapping service. Processing "${query}"...`;
      uiFeedbackStream.update(feedbackMessage);
      uiStream.update(<BotMessage content={uiFeedbackStream.value} />);

      const toolName = queryType === 'directions' ? 'mapbox_directions' : 'mapbox_geocoding';
      
      // Fixed: Use the correct parameter name expected by the MCP tool
      let toolArgs;
      if (queryType === 'directions') {
        const parts = query.split(' to ');
        toolArgs = { 
          origin: parts[0]?.trim() || query,
          destination: parts[1]?.trim() || query,
          includeMapPreview: includeMap !== false
        };
      } else {
        toolArgs = { 
          searchText: query,  // This is the correct parameter name for geocoding
          includeMapPreview: includeMap !== false
        };
      }

      console.log('[GeospatialTool] Calling tool:', toolName, 'with args:', toolArgs);
      console.log('[GeospatialTool] Tool args stringified:', JSON.stringify(toolArgs, null, 2));

      // Retry logic for tool call
      const MAX_RETRIES = 3;
      let retryCount = 0;
      let geocodeResultUnknown;
      while (retryCount < MAX_RETRIES) {
        try {
          console.log('[GeospatialTool] About to call tool with:', { name: toolName, arguments: toolArgs });
          geocodeResultUnknown = await Promise.race([
            mcpClient.callTool({ name: toolName, arguments: toolArgs }),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Tool call timeout after 30 seconds')), 30000);
            }),
          ]);
          break;
        } catch (error: any) {
          retryCount++;
          if (retryCount === MAX_RETRIES) {
            throw error;
          }
          console.warn(`[GeospatialTool] Retry ${retryCount}/${MAX_RETRIES} after error: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('[GeospatialTool] Raw tool result:', geocodeResultUnknown);

      const geocodeResult = geocodeResultUnknown as { 
        tool_results?: Array<{ content?: unknown }>;
        content?: Array<{ type: string; text: string }>;
        isError?: boolean;
      };
      
      // Handle error response format - check if this is an error response
      if (geocodeResult.isError && geocodeResult.content) {
        const errorContent = geocodeResult.content[0]?.text || 'Unknown error';
        console.error('[GeospatialTool] MCP tool returned error:', errorContent);
        
        // Parse the error to see if it's a validation error
        try {
          const errorText = errorContent.replace('Error: ', '');
          const errorObj = JSON.parse(errorText);
          if (Array.isArray(errorObj) && errorObj[0]?.code === 'invalid_type') {
            const missingParam = errorObj[0]?.path?.[0];
            throw new Error(`MCP tool validation error: Missing required parameter '${missingParam}'. Current args: ${JSON.stringify(toolArgs)}`);
          }
        } catch (parseError) {
          // If we can't parse the error, use the original
        }
        
        throw new Error(`MCP tool error: ${errorContent}`);
      }
      
      // Handle successful response with tool_results
      const toolResults = Array.isArray(geocodeResult.tool_results) ? geocodeResult.tool_results : [];
      
      // Handle case where result is directly in content array (some MCP servers return this format)
      if (toolResults.length === 0 && geocodeResult.content && Array.isArray(geocodeResult.content)) {
        const directContent = geocodeResult.content[0];
        if (directContent && directContent.type === 'text' && directContent.text) {
          // Try to parse the text content as JSON
          try {
            const parsedContent = JSON.parse(directContent.text);
            if (parsedContent.location) {
              mcpData = {
                location: {
                  latitude: parsedContent.location.latitude,
                  longitude: parsedContent.location.longitude,
                  place_name: parsedContent.location.place_name || parsedContent.location.name,
                  address: parsedContent.location.address || parsedContent.location.formatted_address,
                },
                mapUrl: parsedContent.mapUrl || parsedContent.map_url,
              };
              
              feedbackMessage = `Successfully processed location query for: ${mcpData.location.place_name || query}`;
              uiFeedbackStream.update(feedbackMessage);
              
              // Skip the rest of the processing since we found the data
              return {
                type: 'MAP_QUERY_TRIGGER',
                originalUserInput: query,
                queryType: queryType || 'geocode',
                timestamp: new Date().toISOString(),
                mcp_response: mcpData,
                error: null,
              };
            }
          } catch (parseError) {
            console.warn('[GeospatialTool] Could not parse direct content as JSON:', directContent.text);
          }
        }
      }
      
      if (toolResults.length === 0 || !toolResults[0]?.content) {
        console.error('[GeospatialTool] No valid content in response:', {
          hasToolResults: toolResults.length > 0,
          hasContent: !!geocodeResult.content,
          contentType: Array.isArray(geocodeResult.content) ? 'array' : typeof geocodeResult.content,
          fullResult: geocodeResult
        });
        throw new Error('No content returned from mapping service');
      }

      let content = toolResults[0].content;
      
      if (typeof content === 'string') {
        const jsonRegex = /```(?:json)?\n?([\s\S]*?)\n?```/;
        const match = content.match(jsonRegex);
        if (match) {
          content = match[1].trim();
        }
        
        try {
          if (typeof content === 'string') {
            content = JSON.parse(content);
          }
        } catch (parseError) {
          console.warn('[GeospatialTool] Content is not JSON, using as string:', content);
        }
      }

      if (typeof content === 'object' && content !== null) {
        const parsedData = content as any;
        
        if (parsedData.location) {
          mcpData = {
            location: {
              latitude: parsedData.location.latitude,
              longitude: parsedData.location.longitude,
              place_name: parsedData.location.place_name || parsedData.location.name,
              address: parsedData.location.address || parsedData.location.formatted_address,
            },
            mapUrl: parsedData.mapUrl || parsedData.map_url,
          };
        } else {
          throw new Error("Response missing required 'location' field");
        }
      } else {
        throw new Error("Unexpected response format from mapping service");
      }

      feedbackMessage = `Successfully processed location query for: ${mcpData.location.place_name || query}`;
      uiFeedbackStream.update(feedbackMessage);

    } catch (error: any) {
      console.error('[GeospatialTool] Tool execution failed:', error.message);
      console.error('[GeospatialTool] Error stack:', error.stack);
      toolError = `Mapping service error: ${error.message}`;
      feedbackMessage = toolError;
      uiFeedbackStream.update(feedbackMessage);
    } finally {
      await closeClient(mcpClient);
      uiFeedbackStream.done();
      uiStream.update(<BotMessage content={uiFeedbackStream.value} />);
    }

    return {
      type: 'MAP_QUERY_TRIGGER',
      originalUserInput: query,
      queryType: queryType || 'geocode',
      timestamp: new Date().toISOString(),
      mcp_response: mcpData,
      error: toolError,
    };
  },
});
