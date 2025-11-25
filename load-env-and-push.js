import dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local file
dotenv.config({ path: path.join(__dirname, '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in .env.local');
  console.error('Make sure your .env.local file contains: DATABASE_URL=postgresql://...');
  process.exit(1);
}

console.log('✓ DATABASE_URL loaded successfully');
console.log('Running drizzle-kit push...\n');

try {
  execSync('npx drizzle-kit push', { stdio: 'inherit', cwd: __dirname });
  console.log('\n✓ Database migration completed!');
} catch (error) {
  console.error('\n✗ Migration failed:', error.message);
  process.exit(1);
}
