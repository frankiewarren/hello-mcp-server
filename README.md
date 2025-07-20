# Hello MCP Server - Learn MCP by Example

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![MCP SDK](https://img.shields.io/badge/MCP%20SDK-0.6.0-purple.svg)](https://modelcontextprotocol.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**The best way to learn Model Context Protocol (MCP) through hands-on exploration.** This isn't just a working MCP server—it's an interactive tutorial that teaches you MCP concepts through extensively commented, real-world code.

## 🎓 Why This Repository Exists

Learning MCP can feel overwhelming with abstract concepts and scattered documentation. This repository takes a different approach:

- **Learn by Reading**: Every line of code is extensively commented to explain both *what* it does and *why*
- **Learn by Testing**: Use MCP Inspector to interact with real tools, resources, and prompts
- **Learn by Modifying**: Start with working examples, then experiment and build your own features
- **Learn by Building**: Understand the complete MCP server architecture from setup to deployment

Perfect for developers who learn best through practical examples rather than theoretical documentation.

## 📚 Learning Path: Start Here!

### 🚀 **Step 1: Core MCP Understanding**

**Begin with `src/index.ts`** - This is your learning goldmine! The file includes:
- Clear explanations of what MCP is and why it matters
- The three core MCP primitives: **Tools**, **Resources**, and **Prompts**  
- How Claude communicates with MCP servers
- Working examples of each concept with detailed comments
- Real request/response patterns you can test

**Then read `README.md` (this file)** for the big picture and practical usage.

### 🔧 **Step 2: Project Configuration**

**Study `TSCONFIG_EXPLAINED.md`** - Learn why each TypeScript setting matters for MCP development, explained in beginner-friendly terms.

**Review `package.json`** - Understand the essential MCP dependencies and build process.

### 🧪 **Step 3: Hands-On Experimentation**

1. **Set up and test** (see Installation section below)
2. **Use MCP Inspector** to interact with the server
3. **Modify the code** - change greetings, add parameters, create new tools
4. **Build your own features** using the patterns you've learned

## 💡 What You'll Learn

This repository demonstrates all essential MCP concepts:

### **Tools** - Functions Claude Can Call
```typescript
// Example: A greeting tool that accepts parameters and returns results
{
  name: "say_hello",
  description: "Says hello to the specified person",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "The name to greet" }
    }
  }
}
```

### **Resources** - Data Claude Can Read  
```typescript
// Example: Server information that updates in real-time
{
  uri: "mcp://server-info",
  name: "Server Information", 
  description: "Current server status and statistics"
}
```

### **Prompts** - Templates That Guide Claude
```typescript
// Example: Customizable greeting templates
{
  name: "greeting-generator",
  description: "Generate greetings based on tone and context",
  arguments: [
    { name: "tone", description: "formal, casual, friendly" },
    { name: "context", description: "meeting, email, introduction" }
  ]
}
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager
- Basic TypeScript knowledge (helpful but not required)

### Quick Start
```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/hello-mcp-server.git
cd hello-mcp-server
npm install

# Build the project
npm run build

# Test with MCP Inspector
npx @modelcontextprotocol/inspector node build/index.js
```

### Development Mode
```bash
# Auto-rebuild on changes
npm run dev

# Run the compiled server
npm start
```

## 🧪 Interactive Testing with MCP Inspector

MCP Inspector is your best friend for learning. It provides a web interface to test your server:

1. **Launch Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector node build/index.js
   ```

2. **Test Each Primitive**:
   - **Tools**: Try the `say_hello` tool with different names
   - **Resources**: Read the `server-info` resource to see live data  
   - **Prompts**: Use `greeting-generator` with various tones and contexts

3. **Watch the Communication**: See the actual JSON-RPC messages between Claude and your server

## 📖 Detailed API Reference

### Tools

#### `say_hello`
Demonstrates basic tool implementation with parameter validation and response formatting.

**Input Schema**:
```json
{
  "name": "string"  // Required - The name of the person to greet
}
```

**Example Usage**:
```json
{
  "name": "Alice"
}
```

**Response**:
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

#### `server-info` (`mcp://server-info`)
Demonstrates dynamic resource generation with real-time data.

**Response**: Plain text with server statistics, uptime, system info, and capabilities.

### Prompts  

#### `greeting-generator`
Shows how to create flexible prompt templates with parameters.

**Arguments**:
- `tone` (required): The tone of the greeting (formal, casual, friendly, etc.)
- `context` (required): The context where the greeting will be used (meeting, email, etc.)

## 🎯 Learning Exercises

### Beginner Exercises
1. **Modify the greeting**: Change the `say_hello` response message
2. **Add a parameter**: Add an optional `language` parameter to `say_hello`
3. **Create a simple tool**: Build a `get_time` tool that returns the current time

### Intermediate Exercises  
1. **Add a new resource**: Create a `system-stats` resource with memory and CPU info
2. **Build a calculation tool**: Create a `calculator` tool with basic math operations
3. **Extend the prompt**: Add more parameters to `greeting-generator`

### Advanced Exercises
1. **File system integration**: Create tools that can read/write files safely
2. **API integration**: Build tools that call external APIs
3. **State management**: Create tools that maintain state between calls

## 📁 Project Structure

```
hello-mcp-server/
├── src/
│   └── index.ts             # 🎓 Main learning resource - extensively commented MCP implementation
├── build/                   # ⚙️ Compiled JavaScript output
├── TSCONFIG_EXPLAINED.md    # 📚 TypeScript configuration tutorial  
├── GITHUB_SETUP.md          # 🚀 Publishing guide
├── CONTRIBUTING.md          # 🤝 Contribution guidelines
├── package.json             # 📦 Dependencies and scripts (with educational comments)
├── tsconfig.json            # ⚙️ TypeScript configuration
└── README.md                # 📖 This learning guide
```

## 🎓 Educational Philosophy

This project follows the principle that **the best way to learn is through working examples**:

- **Comments Explain Context**: Not just what the code does, but why MCP works this way
- **Progressive Complexity**: Start simple, then explore advanced patterns
- **Real-World Patterns**: Learn practices you'll actually use in production
- **Interactive Learning**: Test and modify rather than just read

## 🤝 Contributing to Learning

Help make this an even better learning resource:

- **Improve Comments**: Make explanations clearer for beginners
- **Add Examples**: Contribute new tools, resources, or prompts with educational value
- **Share Use Cases**: Document how you've extended this for real projects
- **Fix Issues**: Help other learners by improving error messages and documentation

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🔮 Next Steps After Learning

Once you understand the patterns:

1. **Build Real Tools**: Create MCP servers for your specific use cases
2. **Explore the Ecosystem**: Check out other MCP servers and tools
3. **Join the Community**: Share your creations and learn from others
4. **Contribute Back**: Help improve MCP documentation and tooling

## 🌟 Success Stories

*Have you used this repository to learn MCP? Share your story by opening an issue or discussion!*

## 📞 Learning Support

- **Questions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/hello-mcp-server/discussions)
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/hello-mcp-server/issues)
- **MCP Documentation**: [modelcontextprotocol.io](https://modelcontextprotocol.io/)
- **Community**: Join the MCP community for broader discussions

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) team for creating an amazing standard
- The TypeScript and Node.js communities for excellent tooling
- Everyone who contributes to making MCP more accessible through education

---

**Ready to learn MCP?** Start with `src/index.ts` and let the commented code be your guide! 🚀
