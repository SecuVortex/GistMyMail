import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

function loadEnvironmentFiles() {
  if (typeof process.loadEnvFile === 'function') {
    const candidates = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '../../.env'),
      path.resolve(process.cwd(), '../.env')
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          process.loadEnvFile(p);
          break;
        } catch {
          // Ignore parsing or access errors
        }
      }
    }
  }
}

loadEnvironmentFiles();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().default('http://localhost:5173'),
  API_BASE_URL: z.string().default('http://localhost:3000'),
  SESSION_SECRET: z.string().default('gistmymail_dev_session_secret_32bytes_min_length!!'),
  TOKEN_ENCRYPTION_KEY: z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  DATABASE_URL: z.string().optional().default(''),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
  GOOGLE_REDIRECT_URI: z.string().default('http://localhost:3000/auth/google/callback'),
  AI_PROVIDER: z.enum(['mock', 'openrouter', 'ollama']).default('mock'),
  AI_MODEL: z.string().default('llama3.2:3b'),
  OPENROUTER_API_KEY: z.string().optional().default(''),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  SCHEDULER_ENABLED: z.coerce.boolean().default(true),
  DEFAULT_TIMEZONE: z.string().default('Asia/Kolkata'),
  DEFAULT_DELIVERY_TIME: z.string().default('08:00')
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(): AppConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment configuration:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const config = loadConfig();
