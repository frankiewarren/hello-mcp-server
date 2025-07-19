#!/usr/bin/env node

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

interface ScreenshotOptions {
  url: string;
  filename?: string;
  selector?: string;
  fullPage?: boolean;
  wait?: number;
  viewport?: { width: number; height: number };
}

class ScreenshotTool {
  private browser: puppeteer.Browser | null = null;

  async init(headless: boolean = true): Promise<void> {
    this.browser = await puppeteer.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async takeScreenshot(options: ScreenshotOptions): Promise<string> {
    if (!this.browser) {
      await this.init();
    }

    const page = await this.browser!.newPage();

    try {
      // Set viewport if specified
      if (options.viewport) {
        await page.setViewport(options.viewport);
      }

      console.log(`📸 Navigating to: ${options.url}`);
      await page.goto(options.url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait additional time if specified
      if (options.wait) {
        await page.waitForTimeout(options.wait);
      }

      // Wait for specific selector if provided
      if (options.selector) {
        await page.waitForSelector(options.selector, { timeout: 10000 });
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = options.filename || `screenshot-${timestamp}.png`;
      const screenshotPath = path.join(projectRoot, 'screenshots', filename);

      // Ensure screenshots directory exists
      await import('fs/promises').then(fs => fs.mkdir(path.dirname(screenshotPath), { recursive: true }));

      // Take screenshot
      if (options.selector) {
        const element = await page.$(options.selector);
        if (element) {
          await element.screenshot({ path: screenshotPath, type: 'png' });
        } else {
          throw new Error(`Selector ${options.selector} not found`);
        }
      } else {
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: options.fullPage ?? true,
          type: 'png'
        });
      }

      console.log(`✅ Screenshot saved: ${screenshotPath}`);
      return screenshotPath;

    } finally {
      await page.close();
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const url = args[0];

  if (!url) {
    console.error('Usage: npm run screenshot <url> [filename]');
    process.exit(1);
  }

  const tool = new ScreenshotTool();
  
  try {
    await tool.takeScreenshot({
      url,
      filename: args[1],
      fullPage: true,
      wait: 2000, // Wait 2 seconds for page to settle
      viewport: { width: 1200, height: 800 }
    });
  } catch (error) {
    console.error('❌ Screenshot failed:', error);
  } finally {
    await tool.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ScreenshotTool, ScreenshotOptions };