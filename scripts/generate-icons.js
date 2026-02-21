#!/usr/bin/env node
/**
 * generate-icons.js - Create basic placeholder icons for MindSweeper extension
 * 
 * This script generates simple colored square PNG icons for the extension.
 * For production, these should be replaced with proper brand icons.
 * 
 * Usage: node scripts/generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple 1x1 transparent PNG base64
// This is a minimal valid PNG file that can be scaled by the browser
const TINY_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Colored PNGs for different sizes (blue background, white M)
const ICON_16_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAnklEQVR4nGNgYGD4z4AEWJgYGBgYGBgY/jMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDD8Z2BgYGBgYGBgYPj/n4GBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgeH/fwYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGhv8MDAwMDAwMDAwMDAwMDAwMDAwMDP8BAKvaKAPgjZ1XAAAAAElFTkSuQmCC';

const ICON_48_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA5klEQVRoge2YQQ6AIAxEn8S7ePeBeRSNsXFTCm3pgiXxJbqC6WtLoAAIIYQQQgghhBDyOQCsgA2wAXpDz1Xn5vmuC2AFbIAdcANswAZYARvgBmyADbABdsAG2AEbYAXsgB2wATbADtgAK2AHbIANsAN2wAbYATtgA+yAHbDVtWkDK2AH7IANsAN2wAbYATtgB+yAHbACdsAO2AE7YANswAbYATtgB+yADbACdsAO2AAbYAdsgA2wA3bADtgAK2AHbIAdsAN2wAbYATtgA2yATReoBVk5f5O8n3+G+PsJ8fy0AEIIIYQQQoj5AwFtLkwzxfW+AAAAAElFTkSuQmCC';

const ICON_128_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAA2klEQVR42u3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOBnAGCWAAFqc4wzAAAAAElFTkSuQmCC';

const sizes = [
  { size: 16, data: TINY_PNG_BASE64 },
  { size: 48, data: TINY_PNG_BASE64 },
  { size: 128, data: TINY_PNG_BASE64 }
];

const publicDir = path.join(__dirname, '..', 'public');

console.log('Generating placeholder icons...');

sizes.forEach(({ size, data }) => {
  const filename = `icon${size}.png`;
  const filepath = path.join(publicDir, filename);
  
  const buffer = Buffer.from(data, 'base64');
  fs.writeFileSync(filepath, buffer);
  
  console.log(`✅ Created ${filename} (${buffer.length} bytes)`);
});

console.log('\n✅ All placeholder icons generated!');
console.log('📝 Note: These are minimal placeholder icons.');
console.log('💡 For production, replace with proper branded icons at:');
console.log('   - public/icon16.png (16×16)');
console.log('   - public/icon48.png (48×48)');
console.log('   - public/icon128.png (128×128)');
