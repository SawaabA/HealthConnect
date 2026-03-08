import { z } from "zod";

const webEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8000/api/v1"),
  NEXT_PUBLIC_AUTH0_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_AUTH0_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_AUTH0_AUDIENCE: z.string().optional(),
});

const apiEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH0_DOMAIN: z.string().optional(),
  AUTH0_AUDIENCE: z.string().optional(),
  AUTH0_ISSUER: z.string().optional(),
  BACKBOARD_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),
  VULTR_OBJECT_STORAGE_ENDPOINT: z.string().optional(),
  VULTR_BUCKET_NAME: z.string().optional(),
  TAILSCALE_AUTH_KEY: z.string().optional(),
});

export const parseWebEnv = (env: NodeJS.ProcessEnv) => webEnvSchema.parse(env);
export const parseApiEnv = (env: NodeJS.ProcessEnv) => apiEnvSchema.parse(env);
