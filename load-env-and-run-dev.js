import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local file
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Set NODE_ENV
process.env.NODE_ENV = 'development';

console.log('✓ Environment loaded');
console.log('Starting development server...\n');

// Spawn tsx process with inherited stdio
const tsx = spawn('npx', ['tsx', 'server/index-dev.ts'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: process.platform === 'win32',
});

tsx.on('error', (error) => {
  console.error('Failed to start dev server:', error);
  process.exit(1);
});

tsx.on('exit', (code) => {
  process.exit(code || 0);
});
