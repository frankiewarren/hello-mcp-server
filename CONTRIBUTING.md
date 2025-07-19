# Contributing to Hello MCP Server

First off, thank you for considering contributing to Hello MCP Server! It's people like you that make this project such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible using the issue template.

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain which behavior you expected to see instead
- Explain why this enhancement would be useful

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `beginner` and `help-wanted` issues:

- Beginner issues - issues which should only require a few lines of code, and a test or two
- Help wanted issues - issues which should be a bit more involved than beginner issues

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### Setting Up Your Development Environment

1. Fork and clone the repository
   ```bash
   git clone https://github.com/YOUR_USERNAME/hello-mcp-server.git
   cd hello-mcp-server
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a new branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. Make your changes and test them
   ```bash
   npm run build
   npm start
   ```

### Coding Standards

- We use TypeScript strict mode - ensure your code compiles without errors
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

### Testing Your Changes

Before submitting a pull request:

1. Build the project
   ```bash
   npm run build
   ```

2. Test with MCP Inspector
   ```bash
   npx @modelcontextprotocol/inspector node build/index.js
   ```

3. Verify your changes work as expected

### Commit Message Guidelines

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
- `Add support for multiple languages in say_hello tool`
- `Fix error handling in tool execution`
- `Update documentation for TypeScript configuration`

## Project Structure

Understanding the project structure will help you navigate the codebase:

```
hello-mcp-server/
├── src/              # TypeScript source files
│   └── index.ts      # Main server implementation
├── build/            # Compiled JavaScript (generated)
├── .github/          # GitHub-specific files
├── docs/             # Additional documentation (if any)
└── tests/            # Test files (if any)
```

## Adding New Tools

To add a new tool to the server:

1. Update the tool list in the `ListToolsRequestSchema` handler
2. Add the tool implementation in the `CallToolRequestSchema` handler
3. Update the README.md with documentation for the new tool
4. Add tests if applicable

Example:
```typescript
// In ListToolsRequestSchema handler
{
  name: "your_tool_name",
  description: "What your tool does",
  inputSchema: {
    type: "object",
    properties: {
      // Define your parameters
    },
    required: ["required_params"]
  }
}

// In CallToolRequestSchema handler
case "your_tool_name": {
  // Implement your tool logic
}
```

## Questions?

Feel free to open an issue with your question or reach out to the maintainers directly.

## Recognition

Contributors will be recognized in the project README. Thank you for your contributions!