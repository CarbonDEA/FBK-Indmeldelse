import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  
  // URLs
  APP_BASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  
  // Auth
  JWT_SECRET: z.string().min(32),
  BOARD_APPROVER_EMAILS: z.string(),
  
  // Mail
  MAIL_FROM: z.string(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  
  // Unifi
  UNIFI_BASE_URL: z.string().url().optional().or(z.literal('')),
  UNIFI_USERNAME: z.string().optional(),
  UNIFI_PASSWORD: z.string().optional(),
  UNIFI_SITE: z.string().default('default'),
  
  // Dinero
  DINERO_API_BASE: z.string().url().optional().or(z.literal('')),
  DINERO_ORG_ID: z.string().optional(),
  DINERO_API_KEY: z.string().optional(),
  
  // Payment
  PAYMENT_API_BASE: z.string().url().optional().or(z.literal('')),
  PAYMENT_API_KEY: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  
  // Encryption
  ENCRYPTION_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }
  
  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.flatten().fieldErrors);
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

export const env = validateEnv();
