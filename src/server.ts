import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Memory } from 'mem0ai/oss';
import { z } from 'zod';
import { Mem0Config } from './config.js';

/**
 * Create a Mem0 MCP server
 * @param config Mem0 configuration
 * @param userId User ID for memory operations
 * @returns MCP server instance
 */
export function createMem0Server(config: Mem0Config, userId: string = 'default'): McpServer {
  // Initialize Mem0 with the provided configuration
  const memory = new Memory(config);

  // Create MCP server
  const server = new McpServer({
    name: 'Mem0',
    version: '1.0.0',
    description: 'MCP Server for Mem0 memory operations',
  });

  // Add tool: Store a memory
  server.tool(
    'add',
    {
      messages: z.array(
        z.object({
          role: z.string(),
          content: z.string(),
        })
      ),
      metadata: z.record(z.any()).optional(),
    },
    async ({ messages, metadata }) => {
      try {
        const result = await memory.add(messages, { userId, metadata });
        return {
          content: [{ type: 'text', text: `Memory stored with ID: ${result.id}` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error storing memory: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Add tool: Get all memories
  server.tool(
    'getAll',
    {},
    async () => {
      try {
        const memories = await memory.getAll({ userId });
        return {
          content: [{ type: 'text', text: JSON.stringify(memories, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error retrieving memories: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Add tool: Get a single memory by ID
  server.tool(
    'get',
    {
      id: z.string(),
    },
    async ({ id }) => {
      try {
        const memory = await memory.get(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(memory, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error retrieving memory: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Add tool: Search memories
  server.tool(
    'search',
    {
      query: z.string(),
    },
    async ({ query }) => {
      try {
        const results = await memory.search(query, { userId });
        return {
          content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error searching memories: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Add tool: Update a memory
  server.tool(
    'update',
    {
      id: z.string(),
      content: z.string(),
    },
    async ({ id, content }) => {
      try {
        const result = await memory.update(id, content);
        return {
          content: [{ type: 'text', text: `Memory updated: ${JSON.stringify(result, null, 2)}` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error updating memory: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Add tool: Get memory history
  server.tool(
    'history',
    {
      id: z.string(),
    },
    async ({ id }) => {
      try {
        const history = await memory.history(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(history, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error retrieving memory history: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Add tool: Delete a memory
  server.tool(
    'delete',
    {
      id: z.string(),
    },
    async ({ id }) => {
      try {
        await memory.delete(id);
        return {
          content: [{ type: 'text', text: `Memory with ID ${id} deleted successfully` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error deleting memory: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Add tool: Delete all memories for a user
  server.tool(
    'deleteAll',
    {},
    async () => {
      try {
        await memory.deleteAll({ userId });
        return {
          content: [{ type: 'text', text: `All memories for user ${userId} deleted successfully` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error deleting memories: ${error}` }],
          isError: true,
        };
      }
    }
  );

  // Add tool: Reset memory
  server.tool(
    'reset',
    {},
    async () => {
      try {
        await memory.reset();
        return {
          content: [{ type: 'text', text: 'Memory reset successfully' }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error resetting memory: ${error}` }],
          isError: true,
        };
      }
    }
  );

  return server;
}
