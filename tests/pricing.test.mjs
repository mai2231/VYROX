import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPHP,
  lineTotal,
  subtotal,
  couponFor,
  discountFor,
  shippingFor,
  totals,
  FREE_SHIPPING_THRESHOLD
} from '../src/js/pricing.js';

const item = (price, qty = 1) => ({ price, qty });

test('formats Philippine pesos with separators and no decimals', () => {
  assert.equal(formatPHP(1290), '₱1,290');
  assert.equal(formatPHP(0), '₱0');
  assert.equal(formatPHP(54990), '₱54,990');
});

test('lineTotal multiplies price by quantity', () => {
  assert.equal(lineTotal(item(1290, 3)), 3870);
});

test('subtotal sums every line', () => {
  assert.equal(subtotal([item(1290, 2), item(500, 1)]), 3080);
  assert.equal(subtotal([]), 0);
});

test('coupon lookup is case-insensitive and ignores whitespace', () => {
  assert.equal(couponFor(' vyrox10 ')?.code, 'VYROX10');
  assert.equal(couponFor('NOPE'), null);
});

test('VYROX10 takes ten percent with a 500 peso cap', () => {
  assert.equal(discountFor(couponFor('VYROX10'), 3000), 300);
  assert.equal(discountFor(couponFor('VYROX10'), 8000), 500);
});

test('URBAN500 requires a 3000 peso minimum', () => {
  assert.equal(discountFor(couponFor('URBAN500'), 2999), 0);
  assert.equal(discountFor(couponFor('URBAN500'), 3000), 500);
});

test('shipping is 99 metro, 149 provincial, free over threshold', () => {
  assert.equal(FREE_SHIPPING_THRESHOLD, 2500);
  assert.equal(shippingFor('Metro Manila', 1200, null), 99);
  assert.equal(shippingFor('Cebu', 1200, null), 149);
  assert.equal(shippingFor('Cebu', 2500, null), 0);
});

test('FREESHIP waives shipping below the threshold only', () => {
  assert.equal(shippingFor('Cebu', 1200, couponFor('FREESHIP')), 0);
  assert.equal(shippingFor('Cebu', 1200, couponFor('VYROX10')), 149);
});

test('totals stay consistent for the checkout surfaces', () => {
  const result = totals({
    items: [{ ...item(1290, 2), id: 'fashion-tee' }],
    coupon: couponFor('VYROX10'),
    region: 'Metro Manila'
  });
  assert.deepEqual(result, {
    subtotal: 2580,
    discount: 258,
    shipping: 0,
    total: 2322,
    itemCount: 2
  });
});

test('totals never go negative and ignore unknown coupons', () => {
  const result = totals({ items: [item(100, 1)], coupon: null, region: 'Cebu' });
  assert.equal(result.total, 249);
  assert.equal(result.discount, 0);
  assert.equal(result.shipping, 149);
});
