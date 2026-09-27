const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(process.cwd(), 'client', 'package.json'))) {
  console.log('[Build] Detected client directory. Installing and building client bundle...');
  execSync('npm --prefix client run build', { stdio: 'inherit' });
} else if (fs.existsSync(path.join(process.cwd(), 'vite.config.js'))) {
  console.log('[Build] Running in client directory directly. Building bundle...');
  execSync('vite build', { stdio: 'inherit' });
} else {
  console.log('[Build] Executing fallback build...');
  execSync('npm run build', { stdio: 'inherit' });
}
