const fs = require('fs');
const path = require('path');

const packageName = process.env.ANDROID_PACKAGE_NAME?.trim();
const fingerprints = (process.env.ANDROID_SHA256_CERT_FINGERPRINTS || '')
  .split(',')
  .map((value) => value.trim().toUpperCase())
  .filter(Boolean);

const packageNamePattern = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;
const fingerprintPattern = /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/;

if (!packageName || !packageNamePattern.test(packageName)) {
  throw new Error(
    'ANDROID_PACKAGE_NAME is required and must look like com.example.app (the package_name from Bubblewrap).',
  );
}

if (fingerprints.length === 0 || fingerprints.some((value) => !fingerprintPattern.test(value))) {
  throw new Error(
    'ANDROID_SHA256_CERT_FINGERPRINTS is required: provide one or more colon-separated SHA-256 fingerprints, separated by commas.',
  );
}

const assetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: fingerprints,
    },
  },
];

const outputPath = path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(assetLinks, null, 2)}\n`, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)} for ${packageName}.`);
