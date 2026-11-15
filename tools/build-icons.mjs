/**
 * Builds assets/icons/lucide-sprite.svg from lucide-static, plus VYROX socials.
 * Run: node tools/build-icons.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const iconDir = resolve(root, 'node_modules/lucide-static/icons');

const icons = [
  'search', 'user', 'heart', 'shopping-bag', 'menu', 'x', 'chevron-down',
  'chevron-right', 'chevron-left', 'chevron-up', 'arrow-right', 'arrow-up-right',
  'arrow-left', 'star', 'plus', 'minus', 'trash-2', 'truck', 'shield-check',
  'rotate-ccw', 'credit-card', 'check', 'check-circle-2', 'alert-circle', 'info',
  'filter', 'sliders-horizontal', 'grid-2x2', 'list', 'eye', 'sun', 'moon',
  'mail', 'phone', 'map-pin', 'package',
  'clock', 'download', 'printer', 'upload', 'image', 'tag', 'percent', 'coins',
  'wallet', 'bar-chart-3', 'users', 'layout-dashboard', 'box', 'folder-tree',
  'receipt', 'settings', 'log-out', 'panel-left', 'more-horizontal', 'copy',
  'external-link', 'lock', 'key', 'sparkles', 'zap', 'calendar', 'trending-up',
  'trending-down', 'refresh-cw', 'circle', 'megaphone', 'gift', 'badge-check',
  'ruler', 'palette', 'globe', 'send', 'play', 'quote', 'flame', 'crown',
  'shirt', 'smartphone', 'watch', 'spray-can', 'lamp', 'dumbbell', 'shopping-cart'
];

const socials = {
  instagram:
    '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  facebook:
    '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  youtube:
    '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>'
};

const missing = [];
const symbols = icons.filter((name) => {
  if (!existsSync(resolve(iconDir, `${name}.svg`))) {
    missing.push(name);
    return false;
  }
  return true;
}).map((name) => {
  const raw = readFileSync(resolve(iconDir, `${name}.svg`), 'utf8');
  const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim();
  return `  <symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`;
});

for (const [name, inner] of Object.entries(socials)) {
  symbols.push(`  <symbol id="i-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</symbol>`);
}

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n${symbols.join('\n')}\n</svg>\n`;
writeFileSync(resolve(root, 'assets/icons/lucide-sprite.svg'), sprite);
console.log(`icon sprite: ${symbols.length} symbols`);
if (missing.length) console.log(`missing: ${missing.join(', ')}`);
