#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "hello-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "say_hello",
        description: "Says hello to the specified person",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the person to greet",
            },
          },
          required: ["name"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "say_hello": {
      const userName = args?.name;
      
      if (typeof userName !== "string") {
        throw new Error("Invalid argument: name must be a string");
      }

      const greeting = `Hello, ${userName}! Welcome to my MCP server!`;
      
      return {
        content: [
          {
            type: "text",
            text: greeting,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("Hello MCP Server running on stdio transport");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});