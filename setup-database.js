import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local file
dotenv.config({ path: path.join(__dirname, '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in .env.local');
  process.exit(1);
}

console.log('Setting up database...\n');

// Create session table schema
const SESSION_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" on "session" ("expire");
`;

async function setupDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log('✓ Creating session table if not exists...');
    await pool.query(SESSION_TABLE_SQL);
    console.log('✓ Session table ready\n');
    
    console.log('Running drizzle-kit push...\n');
    execSync('npx drizzle-kit push', { stdio: 'inherit', cwd: __dirname });
    
    console.log('\n✓ Database setup completed successfully!');
  } catch (error) {
    console.error('Error during database setup:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
