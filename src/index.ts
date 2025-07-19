#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Server start time for statistics
const serverStartTime = new Date();

// Helper function to generate server info content
function generateServerInfo(): string {
  const uptime = Date.now() - serverStartTime.getTime();
  const uptimeSeconds = Math.floor(uptime / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  return `Hello MCP Server Information
=============================

Server Details:
- Name: hello-mcp-server
- Version: 1.0.0
- Description: A simple demonstration MCP server with greeting tools and server information resources

Available Features:
- Tools: say_hello - Interactive greeting tool that welcomes users with personalized messages
- Resources: server-info - Real-time server information and statistics

Server Statistics:
- Started: ${serverStartTime.toISOString()}
- Current Time: ${new Date().toISOString()}
- Uptime: ${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s
- Process ID: ${process.pid}
- Node.js Version: ${process.version}
- Platform: ${process.platform}
- Architecture: ${process.arch}

Capabilities:
✓ Tool execution via CallTool requests
✓ Resource discovery via ListResources requests  
✓ Resource reading via ReadResource requests
✓ Standard I/O transport communication
✓ JSON-RPC 2.0 protocol compliance

This server demonstrates basic MCP functionality including both interactive tools and informational resources.
For more information about the Model Context Protocol, visit: https://modelcontextprotocol.io/`;
}

// Helper function to generate greeting prompt template
function generateGreetingPrompt(tone: string, context: string): string {
  return `Create a greeting that is ${tone} and is written for ${context}.

TONE: ${tone}
CONTEXT: ${context}

Please generate a greeting using the specified tone and context.`;
}

const server = new Server(
  {
    name: "hello-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
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

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "mcp://server-info",
        name: "Server Information",
        description: "Current server status, statistics, and configuration details",
        mimeType: "text/plain",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "mcp://server-info": {
      const content = generateServerInfo();
      
      return {
        contents: [
          {
            uri: "mcp://server-info",
            mimeType: "text/plain",
            text: content,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// Prompt handlers
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "greeting-generator",
        description: "Generate customized greeting templates based on tone and context",
        arguments: [
          {
            name: "tone",
            description: "The tone of the greeting (formal, casual, friendly)",
            required: true,
          },
          {
            name: "context", 
            description: "The context where the greeting will be used (meeting, email, introduction)",
            required: true,
          },
        ],
      },
    ],
  };
});

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "greeting-generator": {
      const tone = args?.tone as string;
      const context = args?.context as string;
      
      if (!tone || !context) {
        throw new Error("Both 'tone' and 'context' arguments are required");
      }

      const promptContent = generateGreetingPrompt(tone, context);
      
      return {
        description: `A customized greeting template for ${context} situations with a ${tone} tone`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: promptContent,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
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