import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!doctype html><html><body>
  <form id="form" novalidate>
    <input id="name" name="name" data-rules="required" value="">
    <input id="email" name="email" data-rules="required|email" value="not-an-email">
    <input id="phone" name="phone" data-rules="phone-ph" value="0917 420 8841">
    <input id="password" name="password" data-rules="required|min:8" value="short">
    <input id="confirm" name="confirm" data-rules="match:#password" value="different">
  </form>
</body></html>`, { url: 'http://localhost/' });

globalThis.window = dom.window;
globalThis.document = dom.window.document;

const { validateForm } = await import('../src/js/validation.js');

test('reports required, email, min-length and match errors', () => {
  const result = validateForm(document.getElementById('form'));
  assert.equal(result.valid, false);
  assert.equal(result.errors.name, 'This field is required.');
  assert.equal(result.errors.email, 'Enter a valid email address.');
  assert.equal(result.errors.password, 'Use at least 8 characters.');
  assert.equal(result.errors.confirm, 'Values do not match.');
  assert.equal(result.errors.phone, undefined);
});

test('accepts valid Philippine mobile numbers', () => {
  document.querySelector('#email').value = 'hello@vyrox.ph';
  document.querySelector('#phone').value = '0917 420 8841';
  document.querySelector('#password').value = 'longenough';
  document.querySelector('#confirm').value = 'longenough';
  document.querySelector('#name').value = 'Mika';
  const result = validateForm(document.getElementById('form'));
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});
