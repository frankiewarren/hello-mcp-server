# Automated GitHub Repository Setup

Follow these steps to automatically create and push your repository using GitHub CLI.

## Step 1: Authenticate with GitHub CLI

Run this command and follow the prompts:
```bash
gh auth login
```

Choose:
- GitHub.com
- HTTPS or SSH (your preference)
- Login with a web browser (easiest)
- Follow the browser prompts to authenticate

## Step 2: Create and Push Repository

Once authenticated, run this single command from your project directory:

```bash
gh repo create hello-mcp-server \
  --public \
  --description "A simple Hello World MCP (Model Context Protocol) server built with TypeScript" \
  --source . \
  --remote origin \
  --push
```

## Step 3: Add Topics

After creation, add topics to your repository:
```bash
gh repo edit --add-topic "mcp,model-context-protocol,typescript,llm,ai"
```

## Alternative: Manual Commands

If the above doesn't work, use these separate commands:

1. Create the repository:
```bash
gh repo create hello-mcp-server --public --description "A simple Hello World MCP (Model Context Protocol) server built with TypeScript"
```

2. Add the remote:
```bash
git remote add origin https://github.com/$(gh api user -q .login)/hello-mcp-server.git
```

3. Push the code:
```bash
git push -u origin main
```

4. Add topics:
```bash
gh repo edit hello-mcp-server --add-topic "mcp,model-context-protocol,typescript,llm,ai"
```

## Verify Success

After pushing, open your repository in the browser:
```bash
gh repo view --web
```

Or get the URL:
```bash
gh repo view --json url -q .url
```