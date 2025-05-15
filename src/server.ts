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
    description: 'MCP Server for Mem0 memory operations - provides persistent memory capabilities for AI agents',
  });

  // Add tool: Store a memory
  server.tool(
    'add',
    {
      messages: z.array(
        z.object({
          role: z.string().describe('The role of the message sender (e.g., "user", "assistant")'),
          content: z.string().describe('The content of the message'),
        })
      ).describe('An array of messages to store as a memory. Each message has a role and content.'),
      metadata: z.record(z.any()).optional().describe('Optional metadata to associate with this memory for better organization and retrieval'),
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
    },
    {
      description: 'Store a new memory in the Mem0 system. This allows you to save conversation history or important information for later retrieval.',
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
    },
    {
      description: 'Retrieve all memories stored for the current user. This returns the complete list of memories without any filtering.',
    }
  );

  // Add tool: Get a single memory by ID
  server.tool(
    'get',
    {
      id: z.string().describe('The unique identifier of the memory to retrieve'),
    },
    async ({ id }) => {
      try {
        const memoryItem = await memory.get(id);
        return {
          content: [{ type: 'text', text: JSON.stringify(memoryItem, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Error retrieving memory: ${error}` }],
          isError: true,
        };
      }
    },
    {
      description: 'Retrieve a specific memory by its unique ID. Use this when you need to access a particular memory you know the ID for.',
    }
  );

  // Add tool: Search memories
  server.tool(
    'search',
    {
      query: z.string().describe('The search query to find relevant memories. This will perform semantic search using embeddings.'),
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
    },
    {
      description: 'Search for memories using semantic search. This finds memories that are conceptually related to your query, not just exact keyword matches.',
    }
  );

  // Add tool: Update a memory
  server.tool(
    'update',
    {
      id: z.string().describe('The unique identifier of the memory to update'),
      content: z.string().describe('The new content to replace the existing memory content'),
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
    },
    {
      description: 'Update the content of an existing memory. This modifies a memory while preserving its ID and creation timestamp.',
    }
  );

  // Add tool: Get memory history
  server.tool(
    'history',
    {
      id: z.string().describe('The unique identifier of the memory to retrieve history for'),
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
    },
    {
      description: 'Retrieve the history of changes for a specific memory. This shows all previous versions and modifications of the memory.',
    }
  );

  // Add tool: Delete a memory
  server.tool(
    'delete',
    {
      id: z.string().describe('The unique identifier of the memory to delete'),
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
    },
    {
      description: 'Delete a specific memory by its ID. This permanently removes the memory from storage.',
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
    },
    {
      description: 'Delete all memories for the current user. This is a destructive operation that removes all stored memories.',
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
    },
    {
      description: 'Reset the entire memory system. This clears all memories for all users and is a global operation.',
    }
  );

  return server;
}
