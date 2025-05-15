import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

// Define the schema for the LLM configuration
const LlmConfigSchema = z.object({
  provider: z.string().default('openai'),
  config: z.object({
    // Common parameters for all LLM providers
    apiKey: z.string().default(process.env.OPENAI_API_KEY || ''),
    model: z.string().default('gpt-4-turbo-preview'),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    topP: z.number().optional(),
    topK: z.number().optional(),
    // OpenAI specific parameters
    openaiBaseUrl: z.string().optional(),
  }).default({}),
}).default({});

// Define the schema for the Vector Store configuration
const VectorStoreConfigSchema = z.object({
  provider: z.string().default('memory'),
  config: z.object({
    // Common parameters for vector stores
    collectionName: z.string().default('memories'),
    dimension: z.number().default(1536),
    embeddingModelDims: z.number().optional(),
    // Connection parameters
    host: z.string().optional(),
    port: z.number().optional(),
    url: z.string().optional(),
    apiKey: z.string().optional(),
    path: z.string().optional(),
    onDisk: z.boolean().optional(),
    redisUrl: z.string().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
  }).default({}),
}).default({});

// Define the schema for the Embedder configuration
const EmbedderConfigSchema = z.object({
  provider: z.string().default('openai'),
  config: z.object({
    // Common parameters for embedders
    apiKey: z.string().default(process.env.OPENAI_API_KEY || ''),
    model: z.string().default('text-embedding-3-small'),
    embeddingDims: z.number().optional(),
  }).default({}),
}).default({});

// Define the schema for the History Store configuration
const HistoryStoreConfigSchema = z.object({
  provider: z.string().optional(),
  config: z.record(z.any()).optional(),
}).optional();

// Define the schema for the configuration file
export const Mem0ConfigSchema = z.object({
  version: z.string().default('v1.1'),
  embedder: EmbedderConfigSchema,
  vectorStore: VectorStoreConfigSchema,
  llm: LlmConfigSchema,
  historyStore: HistoryStoreConfigSchema,
  historyDbPath: z.string().optional(),
  disableHistory: z.boolean().optional(),
  customPrompt: z.string().optional(),
});

export type Mem0Config = z.infer<typeof Mem0ConfigSchema>;

/**
 * Load configuration from a YAML file
 * @param configPath Path to the configuration file
 * @returns Parsed and validated configuration
 */
export function loadConfig(configPath: string): Mem0Config {
  try {
    const configFile = fs.readFileSync(path.resolve(configPath), 'utf8');
    const parsedConfig = parse(configFile);
    return Mem0ConfigSchema.parse(parsedConfig);
  } catch (error) {
    console.error(`Error loading configuration from ${configPath}:`, error);
    throw new Error(`Failed to load configuration from ${configPath}`);
  }
}

/**
 * Get default configuration
 * @returns Default configuration
 */
export function getDefaultConfig(): Mem0Config {
  return Mem0ConfigSchema.parse({});
}
