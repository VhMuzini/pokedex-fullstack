import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  POKEAPI_BASE_URL: z.string().url().default('https://pokeapi.co/api/v2'),
  CACHE_TTL_SECONDS: z.coerce.number().default(3600),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(120),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Falha rapido e com uma mensagem clara: preferivel a um erro obscuro em runtime.
  console.error('Variaveis de ambiente invalidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
