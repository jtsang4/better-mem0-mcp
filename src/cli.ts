#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMem0Server } from './server.js';
import { getDefaultConfig, loadConfig } from './config.js';

// Parse command line arguments
const args = process.argv.slice(2);
let configPath = '';
let userId = 'default';

// Process command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--config' && i + 1 < args.length) {
    configPath = args[i + 1];
    i++;
  } else if (args[i] === '--user-id' && i + 1 < args.length) {
    userId = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Mem0 MCP Server - STDIO Mode

Usage:
  npx -y @jtsang/better-mem0-mcp@latest [options]

Options:
  --config <path>    Path to the configuration file (YAML)
  --user-id <id>     User ID for memory operations (default: 'default')
  --help, -h         Show this help message
`);
    process.exit(0);
  }
}

async function main() {
  try {
    // Load configuration
    const config = configPath
      ? loadConfig(configPath)
      : getDefaultConfig();

    console.error(`Starting Mem0 MCP Server with user ID: ${userId}`);
    
    // Create server
    const server = createMem0Server(config, userId);
    
    // Create transport
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await server.connect(transport);
    
    console.error('Mem0 MCP Server started in STDIO mode');
  } catch (error) {
    console.error('Error starting Mem0 MCP Server:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
