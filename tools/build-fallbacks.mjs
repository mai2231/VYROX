/** Generates on-brand local fallbacks for every product category. */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../assets/images/fallback');

const cats = {
  fashion: { label: 'FASHION', code: '01' },
  electronics: { label: 'ELECTRONICS', code: '02' },
  accessories: { label: 'ACCESSORIES', code: '03' },
  beauty: { label: 'BEAUTY', code: '04' },
  home: { label: 'HOME & LIVING', code: '05' },
  lifestyle: { label: 'LIFESTYLE', code: '06' },
  sports: { label: 'SPORTS', code: '07' },
  general: { label: 'ESSENTIALS', code: '08' }
};

const tpl = ({ label, code }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img" aria-label="VYROX ${label}">
  <rect width="800" height="1000" fill="#F5F5F5"/>
  <g stroke="#E4E4E7" stroke-width="1">
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${i * 70 + 20}" y1="0" x2="${i * 70 - 180}" y2="1000"/>`).join('')}
  </g>
  <rect x="0" y="0" width="800" height="8" fill="#111111"/>
  <path d="M56 70h44l34 112 34-112h44L166 262h-44L56 70Z" fill="#E31B32"/>
  <text x="200" y="176" font-family="Anton, Impact, 'Arial Black', sans-serif" font-size="76" fill="#111111" letter-spacing="2">VYROX</text>
  <text x="56" y="486" font-family="Anton, Impact, 'Arial Black', sans-serif" font-size="124" fill="#111111" letter-spacing="-2">${label}</text>
  <text x="60" y="540" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="6" fill="#A1A1AA">CATALOGUE / ${code}</text>
  <rect x="56" y="590" width="150" height="3" fill="#E31B32"/>
  <text x="56" y="930" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="5" fill="#A1A1AA">YOUR WORLD. YOUR RULES.</text>
  <rect x="690" y="60" width="54" height="54" fill="#E31B32"/>
  <rect x="700" y="70" width="34" height="34" fill="#F5F5F5"/>
</svg>
`;

for (const [slug, meta] of Object.entries(cats)) {
  writeFileSync(resolve(dir, `${slug}.svg`), tpl(meta));
}
writeFileSync(resolve(dir, 'product.svg'), tpl({ label: 'VYROX', code: '00' }));
console.log('fallbacks:', Object.keys(cats).length + 1);
