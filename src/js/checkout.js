/** Checkout steps, delivery, payment interface, demo order placement. */
import { getCart, addOrder, clearCart, getDemoAccount } from './store.js';
import { totals, couponFor, formatPHP } from './pricing.js';
import { $, $$, icon, escapeHtml, toast, money } from './ui.js';
import { getCouponCode, setCouponCode, renderCart } from './cart.js';
import { validateForm } from './validation.js';

const EXPRESS_FEE = 150;

const state = { step: 1, region: 'Metro Manila', delivery: 'standard', payment: 'gcash' };

const orderTotals = () => {
  const base = totals({ items: getCart(), coupon: couponFor(getCouponCode()), region: state.region });
  const express = state.delivery === 'express' ? EXPRESS_FEE : 0;
  return { ...base, express, shippingTotal: base.shipping + express, grand: base.total + express };
};

const summaryLine = (line) => `
  <div class="flex gap-3 py-3">
    <div class="relative w-14 shrink-0 border border-line bg-panel">
      <img src="${line.image}" alt="${escapeHtml(line.name)}" class="aspect-[4/5] w-full object-cover" loading="lazy">
      <span class="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">${line.qty}</span>
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-xs font-semibold">${escapeHtml(line.name)}</p>
      <p class="mt-0.5 text-[10px] text-subtle">${[line.color, line.size].filter(Boolean).map(escapeHtml).join(' · ')}</p>
    </div>
    <p class="text-xs font-semibold">${formatPHP(line.price * line.qty)}</p>
  </div>`;

const renderSummary = () => {
  const cart = getCart();
  const empty = $('[data-checkout-empty]');
  const content = $('[data-checkout-content]');
  if (empty) empty.classList.toggle('hidden', cart.length > 0);
  if (content) content.classList.toggle('hidden', cart.length === 0);

  const lines = $('[data-checkout-lines]');
  if (lines) lines.innerHTML = cart.map(summaryLine).join('');

  const t = orderTotals();
  const set = (selector, value) => $$(selector).forEach((node) => { node.textContent = value; });
  set('[data-checkout-subtotal]', formatPHP(t.subtotal));
  set('[data-checkout-discount]', t.discount ? `−${formatPHP(t.discount)}` : '₱0');
  set('[data-checkout-shipping]', t.shippingTotal ? formatPHP(t.shippingTotal) : 'Free');
  set('[data-checkout-total]', formatPHP(t.grand));
  set('[data-checkout-count]', String(t.itemCount));
  set('[data-checkout-express]', t.express ? formatPHP(t.express) : '—');

  const couponLabel = $('[data-checkout-coupon]');
  const coupon = couponFor(getCouponCode());
  if (couponLabel) {
    couponLabel.classList.toggle('hidden', !coupon);
    if (coupon) $('[data-checkout-coupon-code]', couponLabel).textContent = coupon.code;
  }

  const review = $('[data-review-summary]');
  if (review && cart.length) {
    const value = (name) => document.querySelector(`[name="${name}"]`)?.value?.trim() || '—';
    review.innerHTML = `
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="label">Contact</p>
          <p class="text-sm font-semibold">${escapeHtml(value('firstName'))} ${escapeHtml(value('lastName'))}</p>
          <p class="text-xs text-subtle">${escapeHtml(value('email'))}</p>
          <p class="text-xs text-subtle">${escapeHtml(value('phone'))}</p>
        </div>
        <div>
          <p class="label">Ship to</p>
          <p class="text-sm">${escapeHtml(value('line1'))}${value('line2') !== '—' ? `, ${escapeHtml(value('line2'))}` : ''}</p>
          <p class="text-xs text-subtle">${escapeHtml(value('city'))}, ${escapeHtml(state.region)} ${escapeHtml(value('postal'))}</p>
        </div>
        <div>
          <p class="label">Delivery</p>
          <p class="text-sm font-semibold capitalize">${state.delivery === 'express' ? 'Express (1–2 days)' : 'Standard (3–5 days)'}</p>
        </div>
        <div>
          <p class="label">Payment</p>
          <p class="text-sm font-semibold capitalize">${state.payment === 'cod' ? 'Cash on delivery' : state.payment === 'bank' ? 'Bank transfer' : state.payment.toUpperCase()}</p>
        </div>
      </div>`;
  }
};

const goStep = (step) => {
  state.step = Math.min(3, Math.max(1, step));
  $$('[data-step]').forEach((panel) => panel.classList.toggle('hidden', Number(panel.dataset.step) !== state.step));
  $$('[data-step-dot]').forEach((dot) => {
    const n = Number(dot.dataset.stepDot);
    dot.classList.toggle('is-active', n === state.step);
    dot.classList.toggle('is-done', n < state.step);
  });
  if (state.step === 3) renderSummary();
  const top = $('[data-checkout-title]');
  if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const validateStep = (step) => {
  const panel = $(`[data-step="${step}"]`);
  if (!panel) return true;
  const form = $('form[data-checkout]');
  let valid = true;
  $$('[data-rules]', panel).forEach((field) => {
    const rules = field.dataset.rules.split('|');
    const value = field.type === 'checkbox' ? (field.checked ? 'on' : '') : field.value.trim();
    for (const rule of rules) {
      if (rule === 'required' && !value) {
        valid = false;
        field.classList.add('input-invalid');
        const error = document.querySelector(`[data-error-for="${field.id}"]`);
        if (error) { error.textContent = 'This field is required.'; error.hidden = false; }
      }
      if (rule === 'email' && value && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) {
        valid = false;
        field.classList.add('input-invalid');
      }
      if (rule === 'phone' && value && !/^(?:\+63|0)9\d{9}$/.test(value.replaceAll(' ', ''))) {
        valid = false;
        field.classList.add('input-invalid');
      }
    }
  });
  if (!valid) {
    toast('Complete the highlighted fields to continue.', { type: 'error', title: 'Missing details' });
    $('.input-invalid', panel)?.focus();
    return false;
  }
  return true;
};

const renderPaymentPanel = () => {
  $$('[data-payment-panel]').forEach((panel) => panel.classList.toggle('hidden', panel.dataset.paymentPanel !== state.payment));
  $$('[data-payment-option]').forEach((option) => {
    const active = option.dataset.paymentOption === state.payment;
    option.classList.toggle('border-red', active);
    option.classList.toggle('bg-red/5', active);
    option.setAttribute('aria-checked', String(active));
  });
  const place = $('[data-place-order]');
  if (place) {
    place.textContent = state.payment === 'cod' ? 'Place order · Pay on delivery' : 'Place order · Awaiting payment verification';
  }
};

const placeOrder = () => {
  if (!validateStep(1)) { goStep(1); return; }
  if (!validateStep(2)) { goStep(2); return; }
  const cart = getCart();
  if (!cart.length) {
    toast('Your bag is empty.', { type: 'error' });
    return;
  }
  const form = $('form[data-checkout]');
  const value = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim() || '';
  const t = orderTotals();
  const now = new Date();
  const order = {
    id: `VYX-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: `${value('firstName')} ${value('lastName')}`.trim() || 'Demo customer',
    email: value('email'),
    phone: value('phone'),
    address: [value('line1'), value('line2'), value('city'), state.region, value('postal')].filter(Boolean).join(', '),
    region: state.region,
    date: now.toISOString().slice(0, 10),
    status: 'pending',
    payment: state.payment === 'cod' ? 'unpaid' : 'pending',
    method: state.payment === 'cod' ? 'COD' : state.payment === 'bank' ? 'Bank Transfer' : state.payment === 'maya' ? 'Maya' : 'GCash',
    reference: value('reference'),
    delivery: state.delivery,
    items: cart.map((line) => ({ id: line.id, name: line.name, qty: line.qty, price: line.price, image: line.image, color: line.color, size: line.size })),
    subtotal: t.subtotal,
    discount: t.discount,
    shipping: t.shippingTotal,
    total: t.grand,
    coupon: getCouponCode() || null,
    timeline: [
      ['Order placed', now.toISOString().slice(0, 16).replace('T', ' '), true],
      ['Payment verification', 'Awaiting confirmation', false],
      ['Processing', 'Pending', false],
      ['Ready to ship', 'Pending', false],
      ['Shipped', 'Pending', false],
      ['Delivered', 'Pending', false]
    ],
    demo: true
  };
  addOrder(order);
  clearCart();
  setCouponCode('');
  toast('Demo order created. Payment is not captured in Phase 1.', { title: 'Order placed' });
  window.setTimeout(() => {
    window.location.href = `${document.body.dataset.root || './'}confirmation.html?order=${encodeURIComponent(order.id)}`;
  }, 700);
};

export const initCheckout = () => {
  if (!$('form[data-checkout]')) return;
  renderSummary();
  renderPaymentPanel();

  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === '1') {
    const account = getDemoAccount();
    const set = (name, value) => { const field = document.querySelector(`[name="${name}"]`); if (field) field.value = value; };
    set('firstName', account.firstName);
    set('lastName', account.lastName);
    set('email', account.email);
    set('phone', account.phone);
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-next-step]')) {
      event.preventDefault();
      const step = Number(event.target.closest('[data-next-step]').dataset.nextStep);
      if (step === 3 && !validateStep(2)) return;
      if (step === 2 && !validateStep(1)) return;
      goStep(step);
    }
    if (event.target.closest('[data-prev-step]')) {
      event.preventDefault();
      goStep(Number(event.target.closest('[data-prev-step]').dataset.prevStep));
    }
    const pay = event.target.closest('[data-payment-option]');
    if (pay) {
      state.payment = pay.dataset.paymentOption;
      renderPaymentPanel();
    }
    const delivery = event.target.closest('[data-delivery-option]');
    if (delivery) {
      state.delivery = delivery.dataset.deliveryOption;
      $$('[data-delivery-option]').forEach((option) => {
        const active = option === delivery;
        option.classList.toggle('border-red', active);
        option.setAttribute('aria-checked', String(active));
      });
      renderSummary();
    }
    if (event.target.closest('[data-place-order]')) {
      event.preventDefault();
      placeOrder();
    }
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-region]')) {
      state.region = event.target.value;
      renderSummary();
    }
    if (event.target.matches('[data-proof-upload]')) {
      const file = event.target.files?.[0];
      const label = $('[data-proof-label]');
      if (label) label.textContent = file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB (preview only)` : 'PNG or JPG, up to 5MB';
    }
    if (event.target.matches('[data-checkout] [name]')) renderSummary();
  });

  document.addEventListener('input', (event) => {
    if (event.target.matches('[data-checkout] [name]')) {
      event.target.classList.remove('input-invalid');
    }
  });

  document.addEventListener('vyrox:cart-pulse', renderSummary);
  document.addEventListener('vyrox:store-sync', renderSummary);
  document.addEventListener('vyrox:coupon-change', () => { renderSummary(); renderCart(state.region); });

  goStep(1);
};
