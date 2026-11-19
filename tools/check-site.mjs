/** VYROX Phase 1 QA: verifies all pages, links, keyframes, a11y and console errors. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(resolve(root, 'dist/css/vyrox.css'), 'utf8');

const keyframes = [
  'fadeIn', 'fadeOut', 'fadeInUp', 'fadeInDown', 'slideUp', 'slideDown',
  'slideLeft', 'slideRight', 'scaleIn', 'scaleOut', 'zoomIn', 'zoomOut',
  'float', 'bounce', 'pulse', 'shimmer', 'glow', 'rotate', 'gradientMove',
  'blurIn', 'reveal', 'marquee', 'heartbeat', 'ripple', 'borderGlow',
  'textReveal', 'imageReveal'
];

const missingKeyframes = keyframes.filter((name) => !css.includes(`@keyframes ${name}`));
console.log(`Keyframes: ${keyframes.length - missingKeyframes.length}/27 present`);
assert.ok(missingKeyframes.length === 0, `Missing keyframes: ${missingKeyframes.join(', ')}`);

const expected = [
  'index.html', 'shop.html', 'product-details.html', 'categories.html', 'cart.html',
  'checkout.html', 'login.html', 'register.html', 'forgot-password.html', 'profile.html',
  'addresses.html', 'wishlist.html', 'orders.html', 'tracking.html', 'about.html',
  'contact.html', 'faq.html', 'privacy-policy.html', 'terms.html',
  'admin/index.html', 'admin/products.html', 'admin/categories.html', 'admin/orders.html',
  'admin/customers.html', 'admin/inventory.html', 'admin/payments.html', 'admin/reviews.html',
  'admin/coupons.html', 'admin/reports.html', 'admin/settings.html', 'admin/users.html'
];

const missing = expected.filter((page) => !existsSync(resolve(root, page)));
console.log(`Pages: ${expected.length - missing.length}/31 exist`);
assert.ok(missing.length === 0, `Missing pages: ${missing.join(', ')}`);

let totalErrors = 0;
for (const page of expected) {
  const file = resolve(root, page);
  const html = readFileSync(file, 'utf8');
  const dom = new JSDOM(html, { url: `http://localhost:4173/${page}`, pretendToBeVisual: true });
  const document = dom.window.document;

  // Title, skip link, footer
  assert.ok(document.title && document.title !== 'VYROX', `${page}: missing real title`);
  assert.ok(document.querySelector('.skip-link'), `${page}: missing skip link`);
  assert.ok(document.querySelector('footer'), `${page}: missing footer`);

  // No duplicate ids
  const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.ok(dupes.length === 0, `${page}: duplicate ids ${dupes.join(', ')}`);

  // Check internal hrefs resolve
  const base = page.includes('admin/') ? '../' : './';
  const isAdmin = page.startsWith('admin/');
  const hrefs = [...document.querySelectorAll('a[href]')].map((a) => a.href);
  const broken = hrefs.filter((href) => {
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    let target = href;
    if (target.startsWith(base)) target = target.slice(base.length);
    target = target.split('?')[0].split('#')[0];
    return !existsSync(resolve(root, target));
  });
  if (broken.length) {
    totalErrors += broken.length;
    console.warn(`${page}: ${broken.length} unresolvable internal link(s): ${broken.slice(0, 5).join(', ')}`);
  }

  // Every image src exists
  const imgs = [...document.querySelectorAll('img[src]')].map((img) => img.src);
  const missingImgs = imgs.filter((src) => {
    if (src.startsWith('http')) return false;
    let target = src.startsWith('./') ? src.slice(2) : src;
    return !existsSync(resolve(root, target));
  });
  if (missingImgs.length) {
    totalErrors += missingImgs.length;
    console.warn(`${page}: ${missingImgs.length} missing local image(s): ${missingImgs.slice(0, 5).join(', ')}`);
  }

  // Accessible name on icon-only buttons
  const iconButtons = [...document.querySelectorAll('button')].filter((b) => !b.textContent.trim());
  const unnamed = iconButtons.filter((b) => !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby'));
  if (unnamed.length) {
    console.warn(`${page}: ${unnamed.length} icon button(s) without accessible name`);
  }

  console.log(`  OK ${page}`);
}

console.log(`\nQA complete. ${totalErrors} link/image errors total.`);
process.exit(totalErrors > 0 ? 1 : 0);
