import { execSync } from 'child_process';
import fs from 'fs';

console.log('[Build] Build triggered from backend directory...');

try {
  if (fs.existsSync('../frontend')) {
    console.log('[Build] Building frontend at ../frontend...');
    execSync('npm --prefix ../frontend install', { stdio: 'inherit' });
    execSync('npm --prefix ../frontend run build', { stdio: 'inherit' });

    if (fs.existsSync('../frontend/dist')) {
      fs.cpSync('../frontend/dist', './dist', { recursive: true });
      fs.cpSync('../frontend/dist', '../dist', { recursive: true });
      console.log('[Build] Copied dist successfully.');
    }
  } else {
    console.log('[Build] Done.');
  }
} catch (err) {
  console.error('[Build Error]:', err.message);
  process.exit(1);
}
