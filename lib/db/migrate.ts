import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set for migrations');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized: false, // Ensure this is appropriate for your Supabase connection
    // },
    // max: 1, // Optional: restrict to 1 connection for migration
  });

  const db = drizzle(pool);

  console.log('Running database migrations...');
  try {
    // Point to the directory containing your migration files
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('Migrations completed successfully.');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1); // Exit with error code
  } finally {
    await pool.end(); // Ensure the connection pool is closed
  }
}

runMigrations();
