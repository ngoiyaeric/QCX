// This script provides a command-line test utility for the Mapbox MCP server.
// It uses the Vercel AI SDK's `experimental_createMCPClient` to connect to the server,
// list available tools, and perform a sample tool call.
// It's intended for development and testing purposes.

import { experimental_createMCPClient } from 'ai';

// Environment variables required by this script to connect to the Smithery-hosted MCP server.
// - SMITHERY_PROFILE_ID: Your Smithery profile ID.
// - SMITHERY_API_KEY: Your Smithery API key for authentication.
// Note: The Mapbox Access Token (MAPBOX_ACCESS_TOKEN) is configured on the server-side (on Smithery)
// and is not directly passed by this client script during the connection setup for this particular example.
const profileId = process.env.SMITHERY_PROFILE_ID;
const apiKey = process.env.SMITHERY_API_KEY;
const serverName = "@ngoiyaeric/mapbox-mcp-server"; // The unique name of your MCP server deployed on Smithery.


async function testMCPConnection() {
  // Check for required environment variables for Smithery connection.
  if (!profileId || !apiKey) {
    console.error("SMITHERY_PROFILE_ID and SMITHERY_API_KEY environment variables are required for this script.");
    // For a standalone script, exiting might be preferable:
    // process.exit(1); 
    return; // Return early if essential credentials are missing.
  }

  // Construct the server URL for SSE (Server-Sent Events) transport.
  // This URL points to your specific MCP server instance hosted on Smithery.
  const serverUrl = `https://server.smithery.ai/${serverName}/mcp?profile=${profileId}&api_key=${apiKey}`;
  
  // Declare client variable here to ensure it's accessible in the finally block for cleanup.
  let client: any; // Ideally, this would have a more specific type from `experimental_createMCPClient`
                   // e.g., Awaited<ReturnType<typeof experimental_createMCPClient>> for better type safety.

  try {
    // Log the connection attempt (masking API key in logs for security).
    const urlToLog = serverUrl.split('?')[0] + `?profile=${profileId}&api_key=****`; // Mask API key
    console.log(`Attempting to connect to MCP server at ${urlToLog}...`);
    
    // Initialize the MCP client using Server-Sent Events (SSE) transport.
    // SSE is suitable for scenarios where the server pushes updates to the client.
    client = await experimental_createMCPClient({
      transport: {
        type: 'sse', // Specify SSE as the transport type.
        url: serverUrl, // Full URL including profile ID and API key for authentication.
      },
    });

    console.log("✅ Successfully connected to MCP server.");

    // Fetch and list available tools from the server.
    // This helps verify that the client can communicate and understand the server's capabilities.
    const tools = await client.tools();
    console.log("🛠️ Available tools:", Object.keys(tools));

    // Optional: Perform a sample tool call if 'geocode_location' tool is available.
    // This demonstrates how to invoke a specific tool and handle its response.
    if (tools.geocode_location) {
      console.log("\n📞 Attempting to call 'geocode_location' tool for 'Eiffel Tower'...");
      const geocodeParams = { query: "Eiffel Tower", includeMapPreview: true };
      try {
        // Call the tool directly using client.callTool().
        const geocodeResult = await client.callTool('geocode_location', geocodeParams);
        
        // The server tools (as defined in server.ts) typically return content in two blocks:
        // 1. User-friendly formatted text.
        // 2. A JSON string of the structured result, wrapped in ```json ... ```.
        // This section attempts to parse and log the structured JSON for better readability.
        let resultOutput = geocodeResult; // Default to the raw result object.
        if (Array.isArray(geocodeResult?.content) && geocodeResult.content.length > 0) {
            // Assuming the detailed JSON might be in the last content block, as per server.ts structure.
            const lastContentItem = geocodeResult.content[geocodeResult.content.length -1]; 
            if (lastContentItem && typeof lastContentItem.text === 'string') {
                const jsonMatch = lastContentItem.text.match(/```json\n([\s\S]*?)\n```/); // Regex to extract JSON from markdown code block.
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        resultOutput = JSON.parse(jsonMatch[1]); // Parse the extracted JSON string.
                    } catch (parseError) {
                        // If JSON parsing fails, log a warning and use the raw text.
                        console.warn("Could not parse JSON from tool result text block, logging raw text.");
                        resultOutput = lastContentItem.text; 
                    }
                } else {
                     // If no JSON block found in the expected format, join all text content.
                     resultOutput = geocodeResult.content.map((c:any) => c.text).join('\n');
                }
            }
        }
        console.log("🗺️ Geocode Result:", JSON.stringify(resultOutput, null, 2));
      } catch (toolError) {
        console.error("❌ Error calling 'geocode_location':", toolError);
      }
    } else {
      console.warn("⚠️ 'geocode_location' tool not found, skipping sample call.");
    }

  } catch (error) {
    // Catch any errors during connection, tool listing, or tool invocation.
    console.error("❌ MCP connection or operation failed:", error);
  } finally {
    // Ensure the client connection is closed regardless of success or failure.
    // This is crucial for releasing resources.
    if (client) {
      console.log("\nClosing MCP client connection...");
      await client.close();
      console.log("🔌 Client connection closed.");
    }
  }
}

// Run the test connection function when the script is executed.
testMCPConnection();