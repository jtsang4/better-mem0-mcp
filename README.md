# Better Mem0 MCP

A Model Context Protocol (MCP) server for [Mem0](https://docs.mem0.ai/open-source/node-quickstart), providing memory capabilities to LLMs through the MCP protocol.

## Features

- Supports all Mem0 memory operations
- Works with both STDIO and StreamableHTTP transports
- Configurable through YAML files
- Supports user-specific memory contexts
- Easy to deploy via NPX or Docker

## Installation & Usage

### STDIO Mode (CLI)

Run the MCP server directly using npx:

```bash
npx -y @jtsang/better-mem0-mcp@latest
```

With configuration file and user ID:

```bash
npx -y @jtsang/better-mem0-mcp@latest --config ./config.yaml --user-id alice
```

### StreamableHTTP Mode (Docker)

Build and run the Docker image:

```bash
# Build the Docker image
docker build -t better-mem0-mcp .

# Run the container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_api_key \
  -e MEM0_USER_ID=alice \
  -v $(pwd)/config.yaml:/app/config.yaml \
  better-mem0-mcp --config /app/config.yaml
```

## Configuration

Create a `config.yaml` file with your Mem0 configuration:

```yaml
version: v1.1
embedder:
  provider: openai
  config:
    apiKey: ${OPENAI_API_KEY}
    model: text-embedding-3-small
vectorStore:
  provider: memory
  config:
    collectionName: memories
    dimension: 1536
llm:
  provider: openai
  config:
    apiKey: ${OPENAI_API_KEY}
    model: gpt-4-turbo-preview
historyDbPath: memory.db
```

## Available Tools

This MCP server exposes the following tools:

- `storeMemory` - Store a new memory in the system
- `getAllMemories` - Retrieve all memories for the current user
- `getMemoryById` - Get a specific memory by its unique ID
- `searchMemories` - Search memories using semantic search
- `updateMemory` - Update the content of an existing memory
- `getMemoryHistory` - Retrieve the history of changes for a memory
- `deleteMemory` - Delete a specific memory by its ID
- `deleteAllMemories` - Delete all memories for the current user
- `resetAllMemorySystems` - Reset the entire memory system

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Start the STDIO server
npm start

# Start the HTTP server
npm run start:http
```

## License

MIT