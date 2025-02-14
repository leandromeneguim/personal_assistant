import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Execute migrations
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const checkTableExists = async (tableName: string) => {
  const result = await pool.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
    [tableName]
  );
  return result.rows[0].exists;
};

const tablesExist = await checkTableExists('users');
if (!tablesExist) {
  const migrationQuery = readFileSync(join(__dirname, 'migrations/0000_initial.sql'), 'utf-8');
  await pool.query(migrationQuery);
}

// Run the is_active migration
const isActiveMigration = readFileSync(join(__dirname, 'migrations/0001_add_is_active.sql'), 'utf-8');
await pool.query(isActiveMigration);
