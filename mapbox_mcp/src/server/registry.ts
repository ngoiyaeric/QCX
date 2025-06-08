/*
 * @Author: AidenYangX
 * @Email: xscs709560271@gmail.com
 * @Date: 2024-12-21 23:53:59
 * @Description: Handler Registry
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  Tool,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * @interface IHandler
 * @description Interface for MCP tool handlers that process specific tool requests
 */
export interface IHandler {
  /**
   * Get the tools that this handler can process
   * @returns {Tool[]} Array of tools
   */
  getTools(): Tool[];

  /**
   * Check if this handler can process the given tool
   * @param {string} toolName - Name of the tool to check
   * @returns {boolean} True if this handler can process the tool
   */
  canHandle(toolName: string): boolean;

  /**
   * Process the tool request
   * @param {object} params - Tool request parameters
   * @returns {Promise<any>} Tool execution result
   */
  handle(params: any): Promise<any>;
}

/**
 * @class HandlerRegistry
 * @description Registry for managing and coordinating multiple MCP tool handlers
 *
 * The HandlerRegistry serves as a central management system for all tool handlers in the MCP server.
 * It provides functionality for:
 * - Registering new tool handlers
 * - Routing incoming requests to appropriate handlers
 * - Centralizing error handling
 *
 * @example
 * ```typescript
 * const registry = new HandlerRegistry();
 * registry.register(new NavigationHandler());
 * registry.register(new GeocodingHandler());
 * registry.registerAll(server);
 * ```
 */
export class HandlerRegistry {
  /** @private Array of registered tool handlers */
  private handlers: IHandler[] = [];
  private tools: Tool[] = [];

  /**
   * Register a new tool handler
   * @param {IHandler} handler - The handler instance to register
   * @throws {Error} If handler is invalid or already registered
   */
  register(handler: IHandler): void {
    this.handlers.push(handler);
    this.tools.push(...handler.getTools());
  }

  /**
   * Register all handlers with the MCP server and set up request routing
   * @param {Server} server - The MCP server instance
   * @throws {Error} If registration fails or if there are conflicting handlers
   */
  registerAll(server: Server): void {
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.tools,
    }));

    // Set up central request handling
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      const handler = this.handlers.find((h) => h.canHandle(name));

      if (!handler) {
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
      }

      try {
        return await handler.handle({ name, args });
      } catch (error) {
        return this.handleError(error);
      }
    });
  }

  /**
   * Handle errors that occur during tool execution
   * @private
   * @param {unknown} error - The error that occurred
   * @returns {object} Formatted error response for the MCP client
   */
  private handleError(error: unknown) {
    if (error instanceof Error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: `Unknown error: ${String(error)}` }],
      isError: true,
    };
  }
}
