import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { z } from 'zod';

// Define the schema for the configuration file
export const Mem0ConfigSchema = z.object({
  version: z.string().default('v1.1'),
  embedder: z.object({
    provider: z.string().default('openai'),
    config: z.object({
      apiKey: z.string().default(process.env.OPENAI_API_KEY || ''),
      model: z.string().default('text-embedding-3-small'),
    }),
  }).default({}),
  vectorStore: z.object({
    provider: z.string().default('memory'),
    config: z.object({
      collectionName: z.string().default('memories'),
      dimension: z.number().default(1536),
    }),
  }).default({}),
  llm: z.object({
    provider: z.string().default('openai'),
    config: z.object({
      apiKey: z.string().default(process.env.OPENAI_API_KEY || ''),
      model: z.string().default('gpt-4-turbo-preview'),
    }),
  }).default({}),
  historyStore: z.object({
    provider: z.string().optional(),
    config: z.record(z.any()).optional(),
  }).optional(),
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
