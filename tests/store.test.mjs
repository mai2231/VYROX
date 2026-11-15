import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
globalThis.window = dom.window;
globalThis.localStorage = dom.window.localStorage;
globalThis.document = dom.window.document;

const store = await import('../src/js/store.js');

test.beforeEach(() => {
  localStorage.clear();
});

test('adds a product with its default variant and snapshots price', () => {
  const res = store.addToCart('fashion-tee', { qty: 2 });
  assert.equal(res.ok, true);
  const cart = store.getCart();
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 2);
  assert.equal(cart[0].color, 'Black');
  assert.equal(cart[0].size, 'S');
  assert.equal(cart[0].price, 1290);
  assert.equal(cart[0].key, 'fashion-tee|Black|S');
});

test('merges quantities for the same variant', () => {
  store.addToCart('fashion-tee', { qty: 1, color: 'White', size: 'M' });
  store.addToCart('fashion-tee', { qty: 2, color: 'White', size: 'M' });
  assert.equal(store.getCart().length, 1);
  assert.equal(store.getCart()[0].qty, 3);
});

test('keeps different variants as separate lines', () => {
  store.addToCart('fashion-tee', { qty: 1, color: 'Black', size: 'M' });
  store.addToCart('fashion-tee', { qty: 1, color: 'White', size: 'M' });
  assert.equal(store.getCart().length, 2);
});

test('refuses to add beyond available stock', () => {
  const res = store.addToCart('eclipse-sunglasses', { qty: 1 });
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'stock');
  assert.equal(store.getCart().length, 0);
});

test('clamps quantity updates and removes at zero', () => {
  store.addToCart('fashion-tee', { qty: 1 });
  const key = store.getCart()[0].key;
  store.updateQty(key, 999);
  assert.equal(store.getCart()[0].qty, 42);
  store.updateQty(key, 0);
  assert.equal(store.getCart().length, 0);
});

test('toggles wishlist entries and persists them', () => {
  assert.equal(store.toggleWishlist('auralis-anc-headphones'), true);
  assert.deepEqual(store.getWishlist(), ['auralis-anc-headphones']);
  assert.equal(store.isWishlisted('auralis-anc-headphones'), true);
  assert.equal(store.toggleWishlist('auralis-anc-headphones'), false);
  assert.deepEqual(store.getWishlist(), []);
});

test('notifies subscribers when the cart changes', () => {
  let calls = 0;
  const off = store.subscribe(() => { calls += 1; });
  store.addToCart('motion-yoga-mat', { qty: 1 });
  assert.equal(calls, 1);
  off();
  store.addToCart('motion-yoga-mat', { qty: 1 });
  assert.equal(calls, 1);
});

test('merges and persists demo admin state', () => {
  store.resetAdminState();
  store.setAdminState({ shippingFee: 120 });
  assert.equal(store.getAdminState().shippingFee, 120);
  assert.equal(store.getAdminState().storeName, 'VYROX');
});

test('theme defaults to light and toggles both ways', () => {
  document.documentElement.classList.remove('dark');
  assert.equal(store.getTheme(), 'light');
  assert.equal(store.toggleTheme(), 'dark');
  assert.equal(store.getTheme(), 'dark');
  assert.equal(store.toggleTheme(), 'light');
});
