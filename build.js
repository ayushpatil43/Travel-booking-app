import { execSync } from 'child_process';
import fs from 'fs';

console.log('[Build] Starting universal build script...');

try {
  if (fs.existsSync('./frontend')) {
    console.log('[Build] Root directory detected. Building frontend subproject...');
    execSync('npm --prefix frontend install', { stdio: 'inherit' });
    execSync('npm --prefix frontend run build', { stdio: 'inherit' });

    if (fs.existsSync('./frontend/dist')) {
      fs.cpSync('./frontend/dist', './dist', { recursive: true });
      console.log('[Build] Copied frontend/dist to ./dist successfully.');
    }
  } else if (fs.existsSync('./src')) {
    console.log('[Build] Detected frontend folder as root. Building directly...');
    execSync('npx vite build', { stdio: 'inherit' });
  } else {
    console.log('[Build] Fallback build...');
    execSync('npx vite build', { stdio: 'inherit' });
  }
  console.log('[Build] Build completed successfully! ✨');
} catch (err) {
  console.error('[Build Error]:', err.message);
  process.exit(1);
}
