const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const brandDir = path.join(root, 'public', 'brand');
const backgroundPath = path.join(brandDir, 'nebula-glass-background.png');
const markPath = path.join(brandDir, 'telegram-hub-mark.svg');

function splashOverlay() {
  return Buffer.from(`
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#050817" stop-opacity="0.2"/>
          <stop offset="0.58" stop-color="#050817" stop-opacity="0.12"/>
          <stop offset="1" stop-color="#050817" stop-opacity="0.7"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#veil)"/>
      <text x="540" y="930" text-anchor="middle" fill="#F8FAFC" font-family="Sora, Inter, Arial, sans-serif" font-size="78" font-weight="800" letter-spacing="-2">Telegram <tspan fill="#38BDF8">Hub</tspan></text>
      <text x="540" y="1000" text-anchor="middle" fill="#BAE6FD" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="500" letter-spacing="3">DESCUBRA · CONECTE · COMPARTILHE</text>
      <rect x="440" y="1050" width="200" height="4" rx="2" fill="#38BDF8" fill-opacity="0.8"/>
      <text x="540" y="1770" text-anchor="middle" fill="#E0F2FE" fill-opacity="0.82" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="500">Seu hub de comunidades no Telegram</text>
    </svg>
  `);
}

function featureOverlay() {
  return Buffer.from(`
    <svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
          <stop stop-color="#050817" stop-opacity="0.78"/>
          <stop offset="0.58" stop-color="#050817" stop-opacity="0.25"/>
          <stop offset="1" stop-color="#050817" stop-opacity="0.18"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="500" fill="url(#veil)"/>
      <text x="72" y="170" fill="#BAE6FD" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4">NEBULA GLASS</text>
      <text x="72" y="246" fill="#F8FAFC" font-family="Sora, Inter, Arial, sans-serif" font-size="62" font-weight="800" letter-spacing="-2">Telegram <tspan fill="#38BDF8">Hub</tspan></text>
      <text x="75" y="292" fill="#E0F2FE" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="500">Descubra. Conecte. Compartilhe.</text>
      <rect x="76" y="326" width="138" height="4" rx="2" fill="#38BDF8"/>
    </svg>
  `);
}

async function generate() {
  fs.mkdirSync(brandDir, { recursive: true });
  const iconBuffer = await sharp(markPath).resize(300, 300).png().toBuffer();

  const splashBase = await sharp(backgroundPath)
    .resize(1080, 1920, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.82, saturation: 1.08 })
    .png()
    .toBuffer();
  await sharp(splashBase)
    .composite([
      { input: splashOverlay() },
      { input: iconBuffer, left: 390, top: 486 },
    ])
    .png()
    .toFile(path.join(brandDir, 'telegram-hub-splash-1080x1920.png'));

  const featureBase = await sharp(backgroundPath)
    .resize(1024, 500, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 0.9, saturation: 1.06 })
    .png()
    .toBuffer();
  await sharp(featureBase)
    .composite([
      { input: featureOverlay() },
      { input: await sharp(markPath).resize(338, 338).png().toBuffer(), left: 735, top: 74 },
    ])
    .png()
    .toFile(path.join(brandDir, 'telegram-hub-feature-1024x500.png'));

  console.log('Telegram Hub brand assets generated successfully.');
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
