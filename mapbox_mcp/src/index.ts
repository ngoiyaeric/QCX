import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createSmitheryUrl } from "@smithery/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Environment variables
const profileId = process.env.SMITHERY_PROFILE_ID; // Fixed typo: SMITERY -> SMITHERY
const apiKey = process.env.SMITHERY_API_KEY;
const serverName = "@ngoiyaeric/mapbox-mcp-server";

if (!profileId || !apiKey) {
  throw new Error("SMITHERY_PROFILE_ID and SMITHERY_API_KEY environment variables are required");
}

// Configuration for your MCP server
const config = {
  mapboxAccessToken: process.env.MAPBOX_ACCESS_TOKEN || apiKey, // Use separate Mapbox token if available
  debug: true,
};

async function testMCPConnection() {
  try {
    // Option 1: Using createSmitheryUrl helper
    const serverUrl = createSmitheryUrl(
      `https://server.smithery.ai/${serverName}`, 
      { config, apiKey }
    );

    // Option 2: Manual URL construction (alternative)
    // const serverUrl = `https://server.smithery.ai/${serverName}/mcp?profile=${profileId}&api_key=${apiKey}`;

    const transport = new StreamableHTTPClientTransport(serverUrl);
    // Perform further actions with the transport if needed
    console.log("MCP connection test successful: Transport created");
  } catch (error) {
    console.error("MCP connection test failed:", error);
  }
}
// Run the test
testMCPConnection();