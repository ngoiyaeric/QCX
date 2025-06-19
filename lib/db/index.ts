import { drizzle } from 'drizzle-orm/node-postgres'; // Changed from postgres-js
import { Pool } from 'pg'; // Uses Pool from pg
import * as dotenv from 'dotenv';
import * as schema from './schema';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set for Drizzle client');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false, // Required for Supabase, but ensure this is okay for your security policies
  // },
});

export const db = drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' });
