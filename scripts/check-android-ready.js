const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const missing = [];

if (!manifest.name || !manifest.short_name) missing.push('manifest name/short_name');
if (!manifest.start_url || !manifest.scope) missing.push('manifest start_url/scope');
if (manifest.display !== 'standalone' && manifest.display !== 'fullscreen') {
  missing.push('manifest display=standalone or fullscreen');
}

for (const icon of manifest.icons || []) {
  if (!icon.src) {
    missing.push('an icon src');
    continue;
  }
  const iconPath = path.join(projectRoot, 'public', icon.src.replace(/^\//, ''));
  if (!fs.existsSync(iconPath)) missing.push(icon.src);
}

if (missing.length > 0) {
  console.error('Android/TWA readiness check failed. Missing or invalid items:');
  for (const item of missing) console.error(`- ${item}`);
  console.error('Run `npm run generate:icons` before checking again.');
  process.exitCode = 1;
  return;
}

console.log('Android/TWA readiness check passed: manifest and referenced icons are present.');
console.log('The production HTTPS origin, Bubblewrap package name, signing key, and assetlinks.json still need deployment-specific values.');
