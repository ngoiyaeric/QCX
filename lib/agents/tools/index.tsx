import { createStreamableUI } from 'ai/rsc'
import { retrieveTool } from './retrieve'
import { searchTool } from './search'
import { videoSearchTool } from './video-search'
import { geospatialTool, useGeospatialToolMcp } from './geospatial'; // Added import

export interface ToolProps {
  uiStream: ReturnType<typeof createStreamableUI>
  fullResponse: string
  mcp?: any // Made mcp optional
}

export const getTools = ({ uiStream, fullResponse, mcp }: ToolProps) => {
  const tools: any = {
    search: searchTool({
      uiStream,
      fullResponse
    }),
    retrieve: retrieveTool({
      uiStream,
      fullResponse
       }),

     geospatialQueryTool: geospatialTool({
       uiStream,
       fullResponse,
       mcp // Use the passed mcp
     })
  }

  if (process.env.SERPER_API_KEY) {
    tools.videoSearch = videoSearchTool({
      uiStream,
      fullResponse
    })
  }

  return tools
}
