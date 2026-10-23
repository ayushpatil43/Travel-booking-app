import { execSync } from 'child_process';
import fs from 'fs';

console.log('[Build] Starting frontend build script...');

try {
  if (fs.existsSync('./src')) {
    console.log('[Build] Building Vite inside frontend directory...');
    execSync('npx vite build', { stdio: 'inherit' });
  } else if (fs.existsSync('./frontend')) {
    console.log('[Build] Root directory detected...');
    execSync('npm --prefix frontend run build', { stdio: 'inherit' });
  }
  console.log('[Build] Build complete! ✨');
} catch (err) {
  console.error('[Build Error]:', err.message);
  process.exit(1);
}
