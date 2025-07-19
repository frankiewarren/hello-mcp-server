#!/usr/bin/env node

/**
 * HELLO MCP SERVER - Educational Implementation
 * 
 * This file demonstrates a complete Model Context Protocol (MCP) server implementation
 * that showcases all three core MCP primitives: Tools, Resources, and Prompts.
 * 
 * WHAT IS MCP?
 * Model Context Protocol (MCP) is a standardized way for AI assistants like Claude
 * to connect to external tools, data sources, and services. Think of it as a "bridge"
 * that lets AI assistants securely access and interact with your local applications,
 * databases, APIs, and other resources.
 * 
 * THE THREE MCP PRIMITIVES:
 * 1. TOOLS: Functions the AI can call to perform actions (like "say hello" or "send email")
 * 2. RESOURCES: Data sources the AI can read from (like files, databases, or APIs)  
 * 3. PROMPTS: Template instructions that help guide the AI's responses
 * 
 * HOW IT WORKS:
 * 1. This server runs as a separate process on your computer
 * 2. Claude Desktop connects to it using stdio (standard input/output)
 * 3. They communicate using JSON-RPC 2.0 protocol (structured message passing)
 * 4. Claude can then use the tools, read resources, and apply prompts you provide
 */

// IMPORTS: Bringing in external code libraries we need
// The '@modelcontextprotocol/sdk' is the official MCP Software Development Kit

// Server: The main class that creates our MCP server
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// StdioServerTransport: Handles communication via standard input/output
// This allows Claude Desktop to talk to our server through text messages
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Request Schemas: These define the structure of messages between Claude and our server
// Think of them as "message templates" that ensure both sides understand each other
import {
  CallToolRequestSchema,        // When Claude wants to use a tool
  ListToolsRequestSchema,       // When Claude asks "what tools are available?"
  ListResourcesRequestSchema,   // When Claude asks "what resources can I read?"
  ReadResourceRequestSchema,    // When Claude wants to read a specific resource
  ListPromptsRequestSchema,     // When Claude asks "what prompts are available?"
  GetPromptRequestSchema,       // When Claude wants to use a specific prompt
} from "@modelcontextprotocol/sdk/types.js";

// =============================================================================
// SERVER STATISTICS AND HELPER FUNCTIONS
// =============================================================================

// Record when our server starts up - we'll use this to calculate uptime
// 'const' means this value cannot be changed after it's set
// 'new Date()' creates a timestamp of the current moment
const serverStartTime = new Date();

/**
 * HELPER FUNCTION: Generate Server Information
 * 
 * This function creates a detailed status report about our MCP server.
 * It's called whenever Claude requests the "server-info" resource.
 * 
 * WHAT IT DOES:
 * - Calculates how long the server has been running (uptime)
 * - Gathers system information (Node.js version, platform, etc.)
 * - Formats everything into a human-readable report
 * 
 * RETURN VALUE: A string containing formatted server information
 */
function generateServerInfo(): string {
  // UPTIME CALCULATION: How long has the server been running?
  // Date.now() = current time in milliseconds since January 1, 1970
  // serverStartTime.getTime() = when server started, also in milliseconds
  // Subtracting gives us the difference = how long we've been running
  const uptime = Date.now() - serverStartTime.getTime();
  
  // Convert milliseconds to more readable time units
  // Math.floor() removes decimal places (rounds down to whole numbers)
  const uptimeSeconds = Math.floor(uptime / 1000);        // 1000 ms = 1 second
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);    // 60 seconds = 1 minute  
  const uptimeHours = Math.floor(uptimeMinutes / 60);      // 60 minutes = 1 hour

  // BUILD THE STATUS REPORT
  // Using template literals (backticks `) to create multi-line formatted text
  // ${variable} syntax inserts variable values into the string
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
  
  // EXPLANATION OF TEMPLATE VARIABLES:
  // ${uptimeMinutes % 60} - The % is "modulo" operator, gives remainder after division
  //   This converts total minutes to "minutes within the current hour"
  //   Example: 125 minutes % 60 = 5 minutes (2 hours and 5 minutes)
  // ${process.pid} - Process ID, a unique number the operating system assigns to our program
  // ${process.version} - Which version of Node.js is running our server
  // ${process.platform} - Operating system (darwin=macOS, win32=Windows, linux=Linux)
  // ${process.arch} - Processor architecture (arm64, x64, etc.)
}

/**
 * HELPER FUNCTION: Generate Greeting Prompt Template
 * 
 * This function creates a prompt template that guides AI assistants in generating
 * appropriate greetings for different situations and tones.
 * 
 * WHAT IS A PROMPT?
 * A prompt is like giving instructions to the AI. Instead of the AI guessing
 * what you want, the prompt tells it exactly how to behave and what to consider.
 * 
 * PARAMETERS EXPLAINED:
 * @param tone - How the greeting should sound (formal, casual, friendly, etc.)
 * @param context - Where/when the greeting will be used (meeting, email, etc.)
 * @returns A formatted prompt template as a string
 * 
 * TYPESCRIPT SYNTAX NOTE:
 * 'tone: string' means the parameter 'tone' must be text (not a number or other type)
 * ': string' after the function name means this function returns text
 */
function generateGreetingPrompt(tone: string, context: string): string {
  // CLEAN TEMPLATE APPROACH:
  // Instead of hardcoding assumptions about what different tones/contexts mean,
  // we create a simple template that just plugs in whatever values the user provides.
  // This makes the prompt flexible and lets the AI interpret the parameters naturally.
  
  return `Create a greeting that is ${tone} and is written for ${context}.

TONE: ${tone}
CONTEXT: ${context}

Please generate a greeting using the specified tone and context.`;
  
  // WHY THIS APPROACH WORKS:
  // 1. Simple and clear instructions
  // 2. No built-in biases about what tones/contexts should mean
  // 3. Trusts the AI to understand natural language descriptions
  // 4. Easy to extend with new tones and contexts
}

//==============================================================================
// MCP SERVER INITIALIZATION
//==============================================================================

/**
 * CREATE THE MCP SERVER
 * 
 * This is where we create our MCP server instance. Think of this as setting up
 * a new restaurant - we need to tell customers (Claude) what our name is,
 * what we serve (capabilities), and how to order (the protocol).
 */
const server = new Server(
  // FIRST PARAMETER: Server Information
  // This is like the restaurant's business card
  {
    name: "hello-mcp-server",    // How Claude will identify our server
    version: "1.0.0",           // Helps track updates and compatibility
  },
  
  // SECOND PARAMETER: Server Capabilities
  // This tells Claude what types of services we offer
  {
    capabilities: {
      // TOOLS: Functions Claude can call to perform actions
      tools: {
        listChanged: true,  // "Yes, I can provide a list of my tools"
      },
      
      // RESOURCES: Data sources Claude can read from
      resources: {
        listChanged: true,  // "Yes, I can provide a list of my resources"
      },
      
      // PROMPTS: Template instructions to guide Claude's responses
      prompts: {
        listChanged: true,  // "Yes, I can provide a list of my prompts"
      },
    },
  }
);

// IMPORTANT: listChanged: true
// This tells Claude that our server supports listing these features.
// Without this, Claude won't know to ask us about resources and prompts!

//==============================================================================
// TOOLS IMPLEMENTATION
// Tools are functions that Claude can call to perform actions
//==============================================================================

/**
 * TOOL LISTING HANDLER
 * 
 * When Claude asks "What tools are available?", this function responds.
 * It's like showing Claude a menu of actions they can request.
 * 
 * ASYNC/AWAIT EXPLANATION:
 * 'async' means this function can handle time-consuming operations
 * It lets our server stay responsive while processing requests
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        // TOOL DEFINITION: say_hello
        name: "say_hello",
        description: "Says hello to the specified person",
        
        // INPUT SCHEMA: Defines what parameters this tool accepts
        // This is like a form that tells Claude what information to provide
        inputSchema: {
          type: "object",              // The input is a collection of key-value pairs
          properties: {
            name: {
              type: "string",          // The 'name' parameter must be text
              description: "The name of the person to greet",
            },
          },
          required: ["name"],          // The 'name' parameter is mandatory
        },
      },
    ],
  };
});

/**
 * TOOL EXECUTION HANDLER
 * 
 * When Claude wants to actually USE a tool, this function runs it.
 * It's like a waiter taking an order and bringing back the result.
 * 
 * PARAMETER DESTRUCTURING:
 * const { name, arguments: args } = request.params;
 * This extracts 'name' and 'arguments' from the request object
 * 'arguments: args' renames 'arguments' to 'args' (because 'arguments' is a reserved word)
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // SWITCH STATEMENT: Handle different tools
  // Like a telephone operator directing calls to the right department
  switch (name) {
    case "say_hello": {
      // EXTRACT THE USER'S NAME from the arguments
      // The '?.name' syntax is "optional chaining" - safely access properties
      // If 'args' is null/undefined, this won't crash but returns undefined
      const userName = args?.name;
      
      // INPUT VALIDATION: Check that we received valid data
      // TypeScript helps catch errors, but we still need runtime checks
      if (typeof userName !== "string") {
        throw new Error("Invalid argument: name must be a string");
      }

      // CREATE THE GREETING MESSAGE
      // Using template literals to insert the user's name
      const greeting = `Hello, ${userName}! Welcome to my MCP server!`;
      
      // RETURN THE RESULT in MCP format
      // All tool responses must have this structure
      return {
        content: [
          {
            type: "text",           // This is a text response (could be images, etc.)
            text: greeting,         // The actual message content
          },
        ],
      };
    }

    // HANDLE UNKNOWN TOOLS
    // If Claude asks for a tool we don't have, tell them clearly
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

//==============================================================================
// RESOURCES IMPLEMENTATION
// Resources are data sources that Claude can read from
//==============================================================================

/**
 * RESOURCE LISTING HANDLER
 * 
 * When Claude asks "What resources can I access?", this function responds.
 * Resources are like books in a library - Claude can read them but not change them.
 * 
 * WHAT ARE RESOURCES?
 * - Files, databases, API endpoints, real-time data
 * - Claude can READ them to get information
 * - Unlike tools (which DO things), resources provide information
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        // RESOURCE DEFINITION: server-info
        uri: "mcp://server-info",                    // Unique identifier (like a web address)
        name: "Server Information",                   // Human-readable name
        description: "Current server status, statistics, and configuration details",
        mimeType: "text/plain",                      // What type of data this is
      },
    ],
  };
});

/**
 * RESOURCE READING HANDLER
 * 
 * When Claude wants to actually READ a resource, this function provides the content.
 * It's like a librarian retrieving a specific book from the shelf.
 * 
 * URI EXPLANATION:
 * URI = Uniform Resource Identifier, like a unique address
 * We use custom "mcp://" protocol to identify our resources
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  // SWITCH STATEMENT: Handle different resources
  switch (uri) {
    case "mcp://server-info": {
      // GENERATE FRESH DATA: Call our helper function
      // This runs every time Claude requests it, so data is always current
      const content = generateServerInfo();
      
      // RETURN THE CONTENT in MCP format
      return {
        contents: [
          {
            uri: "mcp://server-info",     // Echo back which resource this is
            mimeType: "text/plain",       // What type of content this is
            text: content,                // The actual data
          },
        ],
      };
    }

    // HANDLE UNKNOWN RESOURCES
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

//==============================================================================
// PROMPTS IMPLEMENTATION  
// Prompts are template instructions that guide Claude's responses
//==============================================================================

/**
 * PROMPT LISTING HANDLER
 * 
 * When Claude asks "What prompts are available?", this function responds.
 * Prompts are like giving Claude a specific role or set of instructions.
 * 
 * WHAT ARE PROMPTS?
 * - Template instructions that shape how Claude responds
 * - Like giving an actor a script or a chef a recipe
 * - Can be customized with parameters (variables)
 * - Help ensure consistent, appropriate responses
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        // PROMPT DEFINITION: greeting-generator
        name: "greeting-generator",
        description: "Generate customized greeting templates based on tone and context",
        
        // PROMPT ARGUMENTS: What parameters this prompt accepts
        arguments: [
          {
            name: "tone",
            description: "The tone of the greeting (formal, casual, friendly)",
            required: true,              // Claude must provide this parameter
          },
          {
            name: "context", 
            description: "The context where the greeting will be used (meeting, email, introduction)",
            required: true,              // Claude must provide this parameter
          },
        ],
      },
    ],
  };
});

/**
 * PROMPT EXECUTION HANDLER
 * 
 * When Claude wants to USE a prompt, this function generates the customized instructions.
 * It's like filling in a template with specific values.
 * 
 * PROMPT FLOW:
 * 1. Claude provides prompt name and parameters
 * 2. We generate customized instructions
 * 3. Claude receives these instructions and follows them
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "greeting-generator": {
      // EXTRACT PARAMETERS from the request
      // 'as string' is a TypeScript "type assertion" - we're telling TypeScript
      // "trust us, we know this will be a string"
      const tone = args?.tone as string;
      const context = args?.context as string;
      
      // VALIDATE REQUIRED PARAMETERS
      // Even though we marked them as required, we should double-check
      if (!tone || !context) {
        throw new Error("Both 'tone' and 'context' arguments are required");
      }

      // GENERATE THE CUSTOMIZED PROMPT
      // Call our helper function to create the specific instructions
      const promptContent = generateGreetingPrompt(tone, context);
      
      // RETURN THE PROMPT in MCP format
      return {
        // Description shown to Claude about what this prompt does
        description: `A customized greeting template for ${context} situations with a ${tone} tone`,
        
        // The actual prompt messages
        messages: [
          {
            role: "user",              // This prompt acts like a user instruction
            content: {
              type: "text",            // The prompt is text-based
              text: promptContent,     // The actual prompt instructions
            },
          },
        ],
      };
    }

    // HANDLE UNKNOWN PROMPTS
    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

//==============================================================================
// SERVER STARTUP AND MAIN FUNCTION
//==============================================================================

/**
 * MAIN FUNCTION: Start the MCP Server
 * 
 * This is the entry point of our program - where everything begins.
 * It sets up communication with Claude and starts listening for requests.
 * 
 * ASYNC FUNCTION EXPLANATION:
 * This function is marked 'async' because starting a server involves
 * waiting for network operations, which take time.
 */
async function main() {
  // CREATE COMMUNICATION TRANSPORT
  // StdioServerTransport lets our server talk to Claude via standard input/output
  // This is like setting up a telephone line between our server and Claude
  const transport = new StdioServerTransport();
  
  // CONNECT THE SERVER TO THE TRANSPORT
  // 'await' means "wait for this to complete before continuing"
  // This establishes the connection with Claude Desktop
  await server.connect(transport);
  
  // LOG SUCCESS MESSAGE
  // console.error() sends messages to stderr (error stream)
  // Even though this isn't an error, stderr is used for status messages
  // because stdout (normal output) is used for MCP communication
  console.error("Hello MCP Server running on stdio transport");
}

// START THE SERVER
// This calls our main function and handles any startup errors
main().catch((error) => {
  // If anything goes wrong during startup, log the error and exit
  console.error("Server error:", error);
  process.exit(1);  // Exit with error code 1 (indicates failure)
});

//==============================================================================
// END OF HELLO MCP SERVER
//==============================================================================

/**
 * CONGRATULATIONS! 
 * 
 * You've just explored a complete MCP server implementation that demonstrates:
 * 
 * 1. TOOLS - Interactive functions Claude can call
 * 2. RESOURCES - Data sources Claude can read  
 * 3. PROMPTS - Instructions that guide Claude's behavior
 * 
 * This server can be extended with additional tools, resources, and prompts
 * to create powerful integrations between Claude and your applications.
 * 
 * To learn more about MCP, visit: https://modelcontextprotocol.io/
 */