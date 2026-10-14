const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a192f"/>
      <stop offset="50%" stop-color="#172a45"/>
      <stop offset="100%" stop-color="#0b132b"/>
    </linearGradient>
    <linearGradient id="orbGrad1" x1="0" y1="0" x2="250" y2="250" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="orbGrad2" x1="200" y1="200" x2="500" y2="500" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.1"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="40%" stop-color="#38bdf8" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
    </linearGradient>
    <linearGradient id="planeGrad" x1="120" y1="120" x2="380" y2="380" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#bae6fd"/>
    </linearGradient>
    <filter id="glassBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Deep Glass Background -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  
  <!-- Glowing Liquid Neon Orbs -->
  <circle cx="140" cy="140" r="130" fill="url(#orbGrad1)" filter="blur(40px)"/>
  <circle cx="360" cy="360" r="140" fill="url(#orbGrad2)" filter="blur(45px)"/>

  <!-- Frosted Glass Rounded Shield -->
  <rect x="56" y="56" width="400" height="400" rx="90" fill="url(#glassGrad)" stroke="rgba(255, 255, 255, 0.45)" stroke-width="4"/>
  
  <!-- Glass Inner Highlight -->
  <rect x="62" y="62" width="388" height="190" rx="84" fill="rgba(255, 255, 255, 0.12)"/>

  <!-- Telegram Iconic Paperplane Icon -->
  <g transform="translate(110, 115) scale(0.58)">
    <path d="M472 73.1c-6.8-5.7-16.1-7.7-24.8-5.3L31.3 194.5c-9 2.5-16.1 9.1-18.7 17.8s-.3 18.2 6.1 24.6l96.6 96.6c6.4 6.4 15.3 9.7 24.3 9.1l80.2-5.4 122.9 88.5c5.3 3.8 11.8 5.8 18.3 5.4 6.5-.4 12.6-3.1 17.1-7.7L489 89.6c6.2-6.4 8.7-15.6 5.8-24.2-2.9-8.6-10.2-14.7-19.1-16.5l-3.7 24.2z" fill="none"/>
    <path d="M485.4 79.4L114.7 289.8l105.4 105.4 265.3-315.8z" fill="#38bdf8" opacity="0.4"/>
    <path d="M485.4 79.4L37.1 230.7c-11.7 4.7-10.8 21.6 1.3 25.1l111.4 32.2 257.4-162.2c3.5-2.2 7.1 2.4 4.3 5.5L181.8 349.5l-7.7 109.8c.8 13.9 16.9 20.9 26.6 10.9l59.6-60.8 119.5 88.2c10.8 8 26.1 2.3 29.3-10.9l77.4-386.7c3.1-15.4-12.7-27.5-27.5-20.6z" fill="url(#planeGrad)"/>
    <path d="M174.1 459.3l43.7-56.8-43.7-12.8v69.6z" fill="#93c5fd" opacity="0.85"/>
  </g>
</svg>
`;

async function generate() {
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(svgIcon);

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));

  // Maskable 512x512 (with padding for safe area)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-maskable-512.png'));

  // Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));

  // Favicon 64x64
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(iconsDir, 'favicon.png'));

  console.log('PWA Icons generated successfully!');
}

generate().catch(console.error);
