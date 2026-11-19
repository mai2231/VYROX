/** VYROX Phase 1 smoke test: stub the browser globals, then genuinely import the entry
 * module (main.js) so Node resolves all relative ES imports for real. If any module has a
 * syntax error, a broken import, or throws at top level, the test fails.
 *
 * This validates that the entire module graph is wired and loadable.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---- Browser global stubs ----
class LocalStorage {
  constructor() { this.store = {}; }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
  get length() { return Object.keys(this.store).length; }
  key(i) { return Object.keys(this.store)[i] ?? null; }
}

globalThis.localStorage = new LocalStorage();
globalThis.sessionStorage = new LocalStorage();
globalThis.requestAnimationFrame = (fn) => { fn(); return 1; };
globalThis.cancelAnimationFrame = () => {};
globalThis.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.CustomEvent = class CustomEvent {
  constructor(type, init = {}) { this.type = type; this.detail = init.detail ?? null; this.bubbles = !!init.bubbles; this.cancelable = !!init.cancelable; }
};
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'vyrox-smoke', onLine: true }, writable: true });
Object.defineProperty(globalThis, 'location', { value: { href: 'http://localhost:4173/', search: '', pathname: '/' }, writable: true });

globalThis.document = {
  documentElement: { classList: { add: () => {}, toggle: () => {}, contains: () => false }, dataset: {} },
  body: { classList: { add: () => {}, toggle: () => {}, remove: () => {} }, dataset: {}, setAttribute: () => {}, removeAttribute: () => {}, hasAttribute: () => false, getAttribute: () => null, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true, focus: () => {}, scrollIntoView: () => {}, querySelector: () => null, querySelectorAll: () => [], appendChild: () => {} },
  head: { appendChild: () => {} },
  createElement: () => ({ classList: { add: () => {}, remove: () => {} }, dataset: {}, setAttribute: () => {}, addEventListener: () => {}, appendChild: () => {}, src: '', textContent: '', type: '', defer: false }),
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true
};
Object.defineProperty(globalThis.document, 'readyState', { get: () => 'complete' });
Object.defineProperty(globalThis, 'window', { value: globalThis, writable: true });
globalThis.addEventListener = () => {};
globalThis.removeEventListener = () => {};
globalThis.dispatchEvent = () => true;
globalThis.scrollTo = () => {};
globalThis.scrollBy = () => {};

const pages = [
  { file: 'index.html', page: 'home' },
  { file: 'shop.html', page: 'shop' },
  { file: 'categories.html', page: 'categories' },
  { file: 'product-details.html', page: 'product', search: '?id=fashion-tee' },
  { file: 'product-details.html', page: 'product', search: '?id=unknown-xyz' },
  { file: 'cart.html', page: 'cart' },
  { file: 'wishlist.html', page: 'wishlist' },
  { file: 'checkout.html', page: 'checkout' },
  { file: 'orders.html', page: 'orders' },
  { file: 'tracking.html', page: 'tracking', search: '?order=VYX-2611-8841' },
  { file: 'tracking.html', page: 'tracking' },
  { file: 'login.html', page: 'login' },
  { file: 'register.html', page: 'register' },
  { file: 'forgot-password.html', page: 'forgot' },
  { file: 'profile.html', page: 'profile', search: '?demo=1' },
  { file: 'addresses.html', page: 'addresses' },
  { file: 'about.html', page: 'about' },
  { file: 'contact.html', page: 'contact' },
  { file: 'faq.html', page: 'faq' },
  { file: 'privacy-policy.html', page: 'privacy-policy' },
  { file: 'terms.html', page: 'terms' },
  { file: 'admin/index.html', page: 'index', admin: true },
  { file: 'admin/products.html', page: 'products', admin: true },
  { file: 'admin/categories.html', page: 'categories', admin: true },
  { file: 'admin/orders.html', page: 'orders', admin: true },
  { file: 'admin/customers.html', page: 'customers', admin: true },
  { file: 'admin/inventory.html', page: 'inventory', admin: true },
  { file: 'admin/payments.html', page: 'payments', admin: true },
  { file: 'admin/reviews.html', page: 'reviews', admin: true },
  { file: 'admin/coupons.html', page: 'coupons', admin: true },
  { file: 'admin/reports.html', page: 'reports', admin: true },
  { file: 'admin/settings.html', page: 'settings', admin: true },
  { file: 'admin/users.html', page: 'users', admin: true }
];

const errors = [];
for (const { file, page, search, admin } of pages) {
  globalThis.document.body.dataset.page = page;
  globalThis.document.body.dataset.root = admin ? '../' : './';
  globalThis.location.search = search || '';
  globalThis.location.pathname = '/' + file;

  try {
    await import(pathToFileURL(resolve(root, 'src/js/main.js')).href);
    console.log(`  OK ${file}${search || ''}`);
  } catch (error) {
    errors.push(`${file}${search || ''}: ${error.message}`);
    console.error(`  FAIL ${file}${search || ''}: ${error.message}`);
    console.error(error.stack);
  }
}

if (errors.length) {
  console.error(`\n${errors.length} page(s) failed to boot`);
  process.exit(1);
}
console.log(`\nAll ${pages.length} pages boot cleanly.`);
