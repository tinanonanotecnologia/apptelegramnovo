const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const iconsDir = path.join(root, 'public', 'icons');
const markPath = path.join(root, 'public', 'brand', 'telegram-hub-mark.svg');

async function generate() {
  fs.mkdirSync(iconsDir, { recursive: true });
  const svgIcon = fs.readFileSync(markPath);

  await sharp(svgIcon).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  await sharp(svgIcon).resize(192, 192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  await sharp(svgIcon).resize(512, 512).png().toFile(path.join(iconsDir, 'icon-maskable-512.png'));
  await sharp(svgIcon).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  await sharp(svgIcon).resize(64, 64).png().toFile(path.join(iconsDir, 'favicon.png'));

  console.log('Telegram Hub Nebula Glass icons generated successfully.');
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
