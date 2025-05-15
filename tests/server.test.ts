import { describe, it, expect } from 'vitest';
import { createMem0Server } from '../src/server';
import { getDefaultConfig } from '../src/config';

describe('Mem0 MCP Server', () => {
  it('should create a server with all required tools', () => {
    const config = getDefaultConfig();
    const server = createMem0Server(config, 'test-user');
    
    // Get the list of tools
    const tools = server['tools'];
    
    // Check that all expected tools are registered
    expect(tools.has('add')).toBe(true);
    expect(tools.has('getAll')).toBe(true);
    expect(tools.has('get')).toBe(true);
    expect(tools.has('search')).toBe(true);
    expect(tools.has('update')).toBe(true);
    expect(tools.has('history')).toBe(true);
    expect(tools.has('delete')).toBe(true);
    expect(tools.has('deleteAll')).toBe(true);
    expect(tools.has('reset')).toBe(true);
  });
});
