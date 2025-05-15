import express from 'express';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createMem0Server } from './server.js';
import { getDefaultConfig, loadConfig } from './config.js';

// Parse command line arguments
const args = process.argv.slice(2);
let configPath = '';
let userId = process.env.MEM0_USER_ID || 'default';
let port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Process command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--config' && i + 1 < args.length) {
    configPath = args[i + 1];
    i++;
  } else if (args[i] === '--user-id' && i + 1 < args.length) {
    userId = args[i + 1];
    i++;
  } else if (args[i] === '--port' && i + 1 < args.length) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Mem0 MCP Server - HTTP Mode

Usage:
  node dist/http.js [options]

Options:
  --config <path>    Path to the configuration file (YAML)
  --user-id <id>     User ID for memory operations (default: 'default' or MEM0_USER_ID env var)
  --port <number>    Port to listen on (default: 3000 or PORT env var)
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

    console.log(`Starting Mem0 MCP Server with user ID: ${userId}`);
    
    // Create Express app
    const app = express();
    app.use(express.json());
    
    // Map to store transports by session ID
    const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
    
    // Handle POST requests for client-to-server communication
    app.post('/mcp', async (req, res) => {
      // Check for existing session ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;
    
      if (sessionId && transports[sessionId]) {
        // Reuse existing transport
        transport = transports[sessionId];
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            // Store the transport by session ID
            transports[sessionId] = transport;
          }
        });
    
        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            delete transports[transport.sessionId];
          }
        };
        
        // Create server
        const server = createMem0Server(config, userId);
    
        // Connect to the MCP server
        await server.connect(transport);
      } else {
        // Invalid request
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: No valid session ID provided',
          },
          id: null,
        });
        return;
      }
    
      // Handle the request
      await transport.handleRequest(req, res, req.body);
    });
    
    // Reusable handler for GET and DELETE requests
    const handleSessionRequest = async (req: express.Request, res: express.Response) => {
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }
      
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    };
    
    // Handle GET requests for server-to-client notifications via SSE
    app.get('/mcp', handleSessionRequest);
    
    // Handle DELETE requests for session termination
    app.delete('/mcp', handleSessionRequest);
    
    // Start the server
    app.listen(port, () => {
      console.log(`Mem0 MCP Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting Mem0 MCP Server:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
