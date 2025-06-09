/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 22:26:50
 * @Description: Mapbox Access Token Configuration
 */

/**
 * Get Mapbox Access Token
 *
 * @returns {string} Mapbox Access Token
 */
function getApiKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!apiKey) {
    console.error("MAPBOX_ACCESS_TOKEN environment variable is not set");
    process.exit(1);
  }
  return apiKey;
}

export const MAPBOX_ACCESS_TOKEN = getApiKey();
