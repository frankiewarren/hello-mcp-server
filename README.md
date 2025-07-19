# Hello MCP Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-0.6.0-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple TypeScript MCP (Model Context Protocol) server that demonstrates basic tool implementation with a friendly greeting service.

## 🚀 Features

- **TypeScript-based** MCP server using stdio transport
- **Simple Tool Implementation**: `say_hello` tool that greets users
- **Proper Error Handling** and logging to stderr
- **Type Safety** with TypeScript strict mode
- **Ready for Testing** with MCP Inspector
- **Modern ES Modules** for clean, maintainable code

## 📋 Prerequisites

- Node.js 18.0 or later
- npm or yarn package manager
- Basic understanding of TypeScript (helpful but not required)

## 🛠️ Installation

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/hello-mcp-server.git
cd hello-mcp-server
```

### Install Dependencies

```bash
npm install
```

## 🏗️ Building

Build the TypeScript code to JavaScript:

```bash
npm run build
```

For development with automatic rebuilding on changes:

```bash
npm run dev
```

## 🚀 Running the Server

After building, you can run the server:

```bash
npm start
```

The server will run on stdio transport, ready to communicate with MCP clients.

## 🧪 Testing with MCP Inspector

MCP Inspector is a powerful tool for testing and debugging your MCP server:

1. **Build the server** (if not already built):
   ```bash
   npm run build
   ```

2. **Launch MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector node build/index.js
   ```

3. **Test the Tool**:
   - The inspector will open in your browser
   - Navigate to the "Tools" section
   - Find and test the `say_hello` tool
   - Enter a name in the parameters and execute

## 📚 API Documentation

### Tools

#### `say_hello`

A friendly greeting tool that welcomes users to the MCP server.

**Description**: Says hello to the specified person

**Input Schema**:
```typescript
{
  name: string  // Required - The name of the person to greet
}
```

**Example Request**:
```json
{
  "name": "Alice"
}
```

**Example Response**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Hello, Alice! Welcome to my MCP server!"
    }
  ]
}
```

### Resources

#### `server-info`

A comprehensive information resource providing real-time server status and statistics.

**URI**: `mcp://server-info`  
**Name**: Server Information  
**Description**: Current server status, statistics, and configuration details  
**MIME Type**: `text/plain`

**Example Response**:
```
Hello MCP Server Information
=============================

Server Details:
- Name: hello-mcp-server
- Version: 1.0.0
- Description: A simple demonstration MCP server with greeting tools and server information resources

Available Features:
- Tools: say_hello - Interactive greeting tool that welcomes users with personalized messages
- Resources: server-info - Real-time server information and statistics

Server Statistics:
- Started: 2024-07-19T20:30:15.123Z
- Current Time: 2024-07-19T20:35:42.456Z
- Uptime: 0h 5m 27s
- Process ID: 12345
- Node.js Version: v22.9.0
- Platform: darwin
- Architecture: arm64

Capabilities:
✓ Tool execution via CallTool requests
✓ Resource discovery via ListResources requests  
✓ Resource reading via ReadResource requests
✓ Standard I/O transport communication
✓ JSON-RPC 2.0 protocol compliance

This server demonstrates basic MCP functionality including both interactive tools and informational resources.
For more information about the Model Context Protocol, visit: https://modelcontextprotocol.io/
```

## 📁 Project Structure

```
hello-mcp-server/
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript output (git-ignored)
├── node_modules/         # Dependencies (git-ignored)
├── .github/              # GitHub-specific files
│   └── ISSUE_TEMPLATE/   # Issue templates
├── .gitignore           # Git ignore rules
├── CONTRIBUTING.md      # Contribution guidelines
├── LICENSE              # MIT license
├── package.json         # Project configuration
├── package-lock.json    # Locked dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🔧 Configuration

### TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:

- Target: ES2022
- Module: ES2022
- Strict mode enabled
- Source maps for debugging
- Declaration files for type definitions

### Package Configuration

- Type: ES Module
- Main entry: `build/index.js`
- Scripts available: `build`, `dev`, `start`

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development process
- Submitting pull requests
- Reporting issues

### Quick Start for Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎯 Use Cases

This server serves as a great starting point for:

- Learning MCP server development
- Building more complex MCP tools
- Understanding TypeScript + MCP integration
- Creating custom AI tool integrations

## 🔮 Future Enhancements

Potential areas for expansion:

- [ ] Add more greeting variations
- [ ] Support multiple languages
- [ ] Add personalization options
- [ ] Implement additional tools
- [ ] Add resource providers
- [ ] Create prompt templates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) team for the excellent SDK
- The TypeScript community for the amazing tooling
- Contributors and users of this project

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/hello-mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/hello-mcp-server/discussions)
- **MCP Documentation**: [modelcontextprotocol.io](https://modelcontextprotocol.io/)

---

Made with ❤️ by the MCP community