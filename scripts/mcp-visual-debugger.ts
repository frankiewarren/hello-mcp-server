#!/usr/bin/env node

import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

interface MCPInspectorConfig {
  inspectorUrl?: string;
  serverCommand: string;
  serverArgs: string[];
  screenshotPath?: string;
  headless?: boolean;
}

class MCPVisualDebugger {
  private browser: puppeteer.Browser | null = null;
  private page: puppeteer.Page | null = null;
  private inspectorProcess: any = null;

  async startInspector(config: MCPInspectorConfig): Promise<string> {
    console.log('🚀 Starting MCP Inspector...');
    
    // Kill any existing processes on MCP Inspector ports
    try {
      await new Promise((resolve) => {
        const cleanup = spawn('bash', ['-c', 'lsof -ti:6274,6277 | xargs kill -9 2>/dev/null || true'], {
          stdio: 'ignore'
        });
        cleanup.on('close', () => {
          setTimeout(resolve, 1000); // Wait 1 second after cleanup
        });
      });
      console.log('🧹 Cleaned up existing MCP Inspector processes');
    } catch (error) {
      console.log('ℹ️ No existing processes to clean up');
    }
    
    return new Promise((resolve, reject) => {
      const inspectorArgs = [
        '@modelcontextprotocol/inspector',
        config.serverCommand,
        ...config.serverArgs
      ];

      this.inspectorProcess = spawn('npx', inspectorArgs, {
        cwd: projectRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let inspectorUrl = '';

      this.inspectorProcess.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log('Inspector:', output);

        // Extract the URL from inspector output
        const urlMatch = output.match(/http:\/\/localhost:\d+\/\?MCP_PROXY_AUTH_TOKEN=[\w]+/);
        if (urlMatch && !inspectorUrl) {
          inspectorUrl = urlMatch[0];
          console.log('✅ Inspector URL found:', inspectorUrl);
          resolve(inspectorUrl);
        }
      });

      this.inspectorProcess.stderr.on('data', (data: Buffer) => {
        const error = data.toString();
        console.error('Inspector Error:', error);
        if (!inspectorUrl && error.includes('PORT IS IN USE')) {
          reject(new Error('Inspector port is already in use. Please kill existing processes.'));
        }
      });

      this.inspectorProcess.on('close', (code: number) => {
        if (code !== 0 && !inspectorUrl) {
          reject(new Error(`Inspector process exited with code ${code}`));
        }
      });

      // Timeout after 15 seconds if no URL is found
      setTimeout(() => {
        if (!inspectorUrl) {
          reject(new Error('Timeout waiting for inspector to start'));
        }
      }, 15000);
    });
  }

  async startBrowser(headless: boolean = false): Promise<void> {
    console.log('🌐 Starting Puppeteer browser...');
    this.browser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1200, height: 800 }
    });

    this.page = await this.browser.newPage();
    
    // Set up console logging
    this.page.on('console', (msg) => {
      console.log('Browser Console:', msg.text());
    });

    // Set up error handling
    this.page.on('pageerror', (err) => {
      console.error('Browser Page Error:', err.message);
    });
  }

  async navigateToInspector(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not started');

    console.log('🔗 Navigating to MCP Inspector...');
    await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the inspector to fully load
    await this.page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(button => 
        button.textContent?.includes('Connect')
      );
    }, { timeout: 10000 });
    console.log('✅ MCP Inspector loaded successfully');
  }

  async takeScreenshot(filename: string = 'mcp-inspector-screenshot.png'): Promise<string> {
    if (!this.page) throw new Error('Browser not started');

    const screenshotPath = path.join(projectRoot, 'screenshots', filename);
    
    // Ensure screenshots directory exists
    await this.page.evaluate(() => {
      // Scroll to ensure everything is visible
      window.scrollTo(0, 0);
    });

    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage: true,
      type: 'png'
    });

    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  async testConnection(): Promise<boolean> {
    if (!this.page) throw new Error('Browser not started');

    try {
      console.log('🔌 Setting up MCP server connection...');
      
      // First set the correct command and arguments
      const commandInput = await this.page.$('input[placeholder*="command"], input[type="text"]');
      if (commandInput) {
        await commandInput.click({ clickCount: 3 }); // Select all text
        await commandInput.type('/opt/homebrew/bin/node');
        console.log('✅ Command field updated');
      }

      const argsInput = await this.page.$('input[placeholder*="Arguments"], textarea[placeholder*="space-separated"]');
      if (argsInput) {
        await argsInput.click({ clickCount: 3 }); // Select all text
        await argsInput.type('build/index.js');
        console.log('✅ Arguments field updated');
      }

      // Wait a moment for the form to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Look for and click connect button
      const connectButton = await this.page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(button => 
          button.textContent?.includes('Connect')
        );
      });
      if (connectButton) {
        await connectButton.click();
        console.log('📤 Connect button clicked');
        
        // Wait for connection result
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check for success or error messages
        const connectionStatus = await this.page.evaluate(() => {
          const errorElement = document.querySelector('.connection-error, .error, [class*="error"]');
          const successElement = document.querySelector('.connected, .success, [class*="success"]');
          
          if (errorElement) {
            return { status: 'error', message: errorElement.textContent };
          } else if (successElement) {
            return { status: 'success', message: successElement.textContent };
          } else {
            return { status: 'unknown', message: 'No clear status indicator found' };
          }
        });

        console.log('Connection Status:', connectionStatus);
        return connectionStatus.status === 'success';
      } else {
        console.log('❌ Connect button not found');
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async testSayHelloTool(): Promise<any> {
    if (!this.page) throw new Error('Browser not started');

    try {
      console.log('🛠️ Testing say_hello tool...');
      
      // Navigate to tools section
      const toolsTab = await this.page.$('a[href*="tools"], button:has-text("Tools")');
      if (toolsTab) {
        await toolsTab.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Look for say_hello tool
      const sayHelloTool = await this.page.$('*:has-text("say_hello")');
      if (sayHelloTool) {
        console.log('✅ say_hello tool found');
        
        // Try to execute the tool
        const executeButton = await this.page.$('button:has-text("Execute"), button:has-text("Run")');
        if (executeButton) {
          // Fill in parameters if there's an input
          const nameInput = await this.page.$('input[name="name"], input[placeholder*="name"]');
          if (nameInput) {
            await nameInput.type('Puppeteer');
          }
          
          await executeButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Get the result
          const result = await this.page.evaluate(() => {
            const resultElement = document.querySelector('.result, .output, [class*="result"]');
            return resultElement ? resultElement.textContent : 'No result found';
          });

          console.log('🎉 Tool execution result:', result);
          return { success: true, result };
        } else {
          console.log('❌ Execute button not found');
          return { success: false, error: 'Execute button not found' };
        }
      } else {
        console.log('❌ say_hello tool not found');
        return { success: false, error: 'say_hello tool not found' };
      }
    } catch (error) {
      console.error('Tool test failed:', error);
      return { success: false, error: error.message };
    }
  }

  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up...');
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }

    if (this.inspectorProcess) {
      this.inspectorProcess.kill();
      this.inspectorProcess = null;
    }

    console.log('✅ Cleanup complete');
  }

  async runFullTest(config: MCPInspectorConfig): Promise<void> {
    try {
      // Create screenshots directory
      const screenshotsDir = path.join(projectRoot, 'screenshots');
      await import('fs/promises').then(fs => fs.mkdir(screenshotsDir, { recursive: true }));

      // Start inspector
      const inspectorUrl = await this.startInspector(config);
      
      // Start browser
      await this.startBrowser(config.headless ?? false);
      
      // Navigate to inspector
      await this.navigateToInspector(inspectorUrl);
      
      // Take initial screenshot
      await this.takeScreenshot('01-inspector-loaded.png');
      
      // Test connection
      const connectionSuccess = await this.testConnection();
      await this.takeScreenshot('02-after-connection.png');
      
      if (connectionSuccess) {
        // Test the say_hello tool
        const toolResult = await this.testSayHelloTool();
        await this.takeScreenshot('03-tool-execution.png');
        
        console.log('🎉 Full test completed successfully!');
        console.log('Tool Result:', toolResult);
      } else {
        console.log('❌ Connection failed, skipping tool test');
      }

    } catch (error) {
      console.error('❌ Test failed:', error);
      await this.takeScreenshot('error-state.png');
    } finally {
      await this.cleanup();
    }
  }
}

// CLI interface
async function main() {
  const mcpDebugger = new MCPVisualDebugger();
  
  const config: MCPInspectorConfig = {
    serverCommand: '/opt/homebrew/bin/node',
    serverArgs: ['build/index.js'],
    headless: process.argv.includes('--headless'),
  };

  console.log('🔍 Starting MCP Visual Debugger...');
  console.log('Server Command:', config.serverCommand, config.serverArgs.join(' '));
  
  await mcpDebugger.runFullTest(config);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MCPVisualDebugger, MCPInspectorConfig };