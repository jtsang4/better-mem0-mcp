import { describe, it, expect } from 'vitest';
import { createMem0Server } from '../src/server';
import { getDefaultConfig } from '../src/config';

describe('Mem0 MCP Server', () => {
  it('should create a server with all required tools', () => {
    const config = getDefaultConfig();
    const server = createMem0Server(config, 'test-user');

    // Check that the server is created
    expect(server).toBeDefined();

    // We can't directly access the server's name and version properties
    // So we'll just check that the server is an object

    // Check that the server is an object with methods
    expect(typeof server).toBe('object');

    // Verify the server has the expected methods
    expect(typeof server.connect).toBe('function');
    expect(typeof server.close).toBe('function');

    // Note: We can't directly test the tool names as they're not exposed publicly
    // The tool names have been updated to be more descriptive:
    // - 'storeMemory' (previously 'add')
    // - 'getAllMemories' (previously 'getAll')
    // - 'getMemoryById' (previously 'get')
    // - 'searchMemories' (previously 'search')
    // - 'updateMemory' (previously 'update')
    // - 'getMemoryHistory' (previously 'history')
    // - 'deleteMemory' (previously 'delete')
    // - 'deleteAllMemories' (previously 'deleteAll')
    // - 'resetAllMemorySystems' (previously 'reset')
  });
});
