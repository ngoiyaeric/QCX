import { createStreamableUI } from 'ai/rsc'
import { retrieveTool } from './retrieve'
import { searchTool } from './search'
import { videoSearchTool } from './video-search'
import { geospatialTool, useGeospatialToolMcp } from './geospatial'; // Added import

export interface ToolProps {
  uiStream: ReturnType<typeof createStreamableUI>
  fullResponse: string
}

export const getTools = ({ uiStream, fullResponse }: ToolProps) => {
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
       mcp: useGeospatialToolMcp()
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

export const useTools = ({ uiStream, fullResponse }: ToolProps) => {
  const mcp = useGeospatialToolMcp();

  const tools: any = {
    search: searchTool({ uiStream, fullResponse }),
    retrieve: retrieveTool({ uiStream, fullResponse }),
    geospatialQueryTool: geospatialTool({ uiStream, fullResponse, mcp }),
  };

  if (process.env.SERPER_API_KEY) {
    tools.videoSearch = videoSearchTool({ uiStream, fullResponse });
  }

  return tools;
};
