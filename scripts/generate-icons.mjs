import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Simple SVG to PNG converter using canvas
async function convertSvgToPng() {
  try {
    // Try to use sharp if available
    const sharp = await import('sharp');
    
    const publicDir = join(process.cwd(), 'public');
    
    // Convert light theme icon
    const lightSvg = readFileSync(join(publicDir, 'icon-light.svg'));
    await sharp.default(lightSvg)
      .resize(32, 32)
      .png()
      .toFile(join(publicDir, 'icon-light-32x32.png'));
    
    console.log('✓ Created icon-light-32x32.png');
    
    // Convert dark theme icon
    const darkSvg = readFileSync(join(publicDir, 'icon-dark.svg'));
    await sharp.default(darkSvg)
      .resize(32, 32)
      .png()
      .toFile(join(publicDir, 'icon-dark-32x32.png'));
    
    console.log('✓ Created icon-dark-32x32.png');
    
    // Also create apple-icon.png from light theme (180x180)
    await sharp.default(lightSvg)
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-icon.png'));
    
    console.log('✓ Created apple-icon.png');
    
  } catch (error) {
    console.log('Sharp not available, installing...');
    console.log('Run: pnpm add -D sharp');
    console.log('Then run this script again.');
    process.exit(1);
  }
}

convertSvgToPng().catch(console.error);
