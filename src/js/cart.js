/** Shopping bag drawer, cart page, coupon demo and shared totals display. */
import { $, $$, escapeHtml, icon, money, refreshCounts, root, toast } from './ui.js';
import * as store from './store.js';
import { couponFor, totals, FREE_SHIPPING_THRESHOLD } from './pricing.js';

export const COUPON_KEY = 'vyrox_coupon_v1';
let region = 'Metro Manila';

const readCoupon = () => {
  try { return JSON.parse(sessionStorage.getItem(COUPON_KEY) || 'null'); } catch { return null; }
};

const writeCoupon = (coupon) => {
  try {
    if (coupon) sessionStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
    else sessionStorage.removeItem(COUPON_KEY);
  } catch { /* demo only */ }
};

export const currentCoupon = () => readCoupon();
export const setCurrentCoupon = (coupon) => writeCoupon(coupon);
export const getCouponCode = () => readCoupon()?.code || '';
export const setCouponCode = (code) => {
  const coupon = code ? couponFor(code) : null;
  writeCoupon(coupon);
  document.dispatchEvent(new CustomEvent('vyrox:coupon-change', { detail: { coupon } }));
};
export const currentRegion = () => region;

const lineImage = (line) => line.image || `${root()}assets/images/fallback/${line.category || 'product'}.svg`;

const cartLine = (line) => `
  <div class="flex gap-3 border-b border-line py-4" data-cart-line="${escapeHtml(line.key)}">
    <a href="${root()}product-details.html?id=${encodeURIComponent(line.id)}" class="h-20 w-16 shrink-0 overflow-hidden bg-panel">
      <img src="${escapeHtml(lineImage(line))}" alt="${escapeHtml(line.name)}" class="h-full w-full object-cover" loading="lazy" onerror="this.onerror=null;this.src='${root()}assets/images/fallback/${line.category || 'product'}.svg'">
    </a>
    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <a href="${root()}product-details.html?id=${encodeURIComponent(line.id)}" class="line-clamp-2 text-xs font-semibold leading-snug hover:text-red">${escapeHtml(line.name)}</a>
        <button type="button" class="text-subtle transition hover:text-red" data-cart-remove="${escapeHtml(line.key)}" aria-label="Remove ${escapeHtml(line.name)} from bag">${icon('x', 'h-3.5 w-3.5')}</button>
      </div>
      ${line.color || line.size ? `<p class="mt-1 text-[10px] uppercase tracking-wide2 text-subtle">${escapeHtml([line.color, line.size].filter(Boolean).join(' · '))}</p>` : ''}
      <div class="mt-2 flex items-center justify-between gap-2">
        <div class="qty-control !h-8">
          <button type="button" data-qty-dec="${escapeHtml(line.key)}" aria-label="Decrease quantity of ${escapeHtml(line.name)}">${icon('minus', 'h-3 w-3')}</button>
          <input type="number" value="${Number(line.qty)}" min="1" max="${line.stock}" data-qty-input="${escapeHtml(line.key)}" aria-label="Quantity of ${escapeHtml(line.name)}">
          <button type="button" data-qty-inc="${escapeHtml(line.key)}" aria-label="Increase quantity of ${escapeHtml(line.name)}">${icon('plus', 'h-3 w-3')}</button>
        </div>
        <div class="text-right">
          <span class="block text-xs font-semibold" data-line-total>${money(line.price * line.qty)}</span>
          ${line.compareAt ? `<span class="text-[9px] text-subtle line-through">${money(line.compareAt * line.qty)}</span>` : ''}
        </div>
      </div>
    </div>
  </div>`;

const cartPageRow = (line) => `
  <tr data-cart-page-line="${escapeHtml(line.key)}">
    <td class="!px-3">
      <div class="flex items-center gap-3">
        <a href="${root()}product-details.html?id=${encodeURIComponent(line.id)}" class="h-20 w-16 shrink-0 overflow-hidden bg-panel">
          <img src="${escapeHtml(lineImage(line))}" alt="${escapeHtml(line.name)}" class="h-full w-full object-cover" loading="lazy" onerror="this.onerror=null;this.src='${root()}assets/images/fallback/${line.category || 'product'}.svg'">
        </a>
        <div class="min-w-0">
          <a href="${root()}product-details.html?id=${encodeURIComponent(line.id)}" class="line-clamp-2 text-sm font-semibold hover:text-red">${escapeHtml(line.name)}</a>
          <p class="mt-1 text-[10px] uppercase tracking-wide2 text-subtle">${escapeHtml(line.categoryName || line.category)}</p>
          <p class="mt-1 text-[10px] text-subtle">${escapeHtml([line.color, line.size].filter(Boolean).join(' · '))}</p>
          <button type="button" class="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide2 text-subtle hover:text-red" data-cart-remove="${escapeHtml(line.key)}">${icon('trash-2', 'h-3 w-3')} Remove</button>
        </div>
      </div>
    </td>
    <td class="hidden text-sm sm:table-cell">${money(line.price)}</td>
    <td>
      <div class="qty-control !h-9">
        <button type="button" data-qty-dec="${escapeHtml(line.key)}" aria-label="Decrease quantity">${icon('minus', 'h-3 w-3')}</button>
        <input type="number" value="${Number(line.qty)}" min="1" max="${line.stock}" data-qty-input="${escapeHtml(line.key)}" aria-label="Quantity">
        <button type="button" data-qty-inc="${escapeHtml(line.key)}" aria-label="Increase quantity">${icon('plus', 'h-3 w-3')}</button>
      </div>
    </td>
    <td class="text-right text-sm font-semibold">${money(line.price * line.qty)}</td>
  </tr>`;

const couponNotice = (coupon, totalsValue) => {
  if (!coupon) return '';
  if (coupon.code === 'FREESHIP') return `<p class="mt-2 text-[10px] font-semibold uppercase tracking-wide2 text-emerald-600 dark:text-emerald-400">${escapeHtml(coupon.code)} applied · shipping waived</p>`;
  if (totalsValue.discount > 0) return `<p class="mt-2 text-[10px] font-semibold uppercase tracking-wide2 text-emerald-600 dark:text-emerald-400">${escapeHtml(coupon.code)} applied · ${money(totalsValue.discount)} off</p>`;
  return `<p class="mt-2 text-[10px] text-amber-600 dark:text-amber-300">${escapeHtml(coupon.code)} does not meet the ${money(coupon.minimum || 0)} minimum yet.</p>`;
};

const totalsMarkup = (value, coupon) => `
  <dl class="space-y-3 text-sm">
    <div class="flex items-center justify-between"><dt class="text-subtle">Subtotal <span class="text-[10px]">(${value.itemCount} item${value.itemCount === 1 ? '' : 's'})</span></dt><dd class="font-semibold">${money(value.subtotal)}</dd></div>
    <div class="flex items-center justify-between"><dt class="text-subtle">Discount</dt><dd class="font-semibold ${value.discount ? 'text-emerald-600 dark:text-emerald-400' : ''}">${value.discount ? `−${money(value.discount)}` : '—'}</dd></div>
    <div class="flex items-center justify-between"><dt class="text-subtle">Shipping <span class="text-[10px]">(${escapeHtml(region)})</span></dt><dd class="font-semibold">${value.shipping ? money(value.shipping) : 'Free'}</dd></div>
    <div class="flex items-center justify-between border-t border-line pt-3"><dt class="text-xs font-bold uppercase tracking-wide2">Total</dt><dd class="font-display text-2xl">${money(value.total)}</dd></div>
  </dl>
  ${couponNotice(coupon, value)}
  <p class="mt-3 text-[10px] text-subtle">VAT inclusive · demo totals, re-verified at checkout in Phase 3.</p>`;

const renderDrawer = () => {
  const cart = store.getCart();
  const drawerLines = $('[data-cart-lines]');
  const empty = $('[data-cart-empty]');
  const footer = $('[data-cart-footer]');
  if (!drawerLines) return;
  const value = totals({ items: cart, coupon: readCoupon(), region });
  drawerLines.innerHTML = cart.map(cartLine).join('');
  drawerLines.classList.toggle('hidden', cart.length === 0);
  empty?.classList.toggle('hidden', cart.length > 0);
  empty?.classList.toggle('flex', cart.length === 0);
  footer?.classList.toggle('hidden', cart.length === 0);
  const subtotalNode = $('[data-cart-subtotal]');
  const totalNode = $('[data-cart-total]');
  if (subtotalNode) subtotalNode.textContent = money(value.subtotal);
  if (totalNode) totalNode.textContent = money(value.total);
  $$('[data-cart-count-drawer]').forEach((node) => { node.textContent = String(value.itemCount); });
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - value.subtotal);
  const shipText = $('[data-ship-text]');
  const shipBar = $('[data-ship-bar]');
  if (shipText) shipText.innerHTML = remaining > 0
    ? `Spend <strong class="text-body">${money(remaining)}</strong> more for free shipping.`
    : 'Free shipping unlocked. Nice.';
  if (shipBar) shipBar.style.width = `${Math.min(100, (value.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`;
};

const renderCartPage = () => {
  const container = $('[data-cart-page-lines]');
  if (!container) return;
  const cart = store.getCart();
  const coupon = readCoupon();
  const value = totals({ items: cart, coupon, region });
  container.innerHTML = cart.map(cartPageRow).join('');
  $('[data-cart-page-empty]')?.classList.toggle('hidden', cart.length > 0);
  $('[data-cart-page-body]')?.classList.toggle('hidden', cart.length === 0);
  const summary = $('[data-cart-summary]');
  if (summary) summary.innerHTML = totalsMarkup(value, coupon);
  const couponInput = $('[data-coupon-code]');
  if (couponInput && coupon) couponInput.value = coupon.code;
};

export const renderCart = (nextRegion) => {
  if (typeof nextRegion === 'string' && nextRegion) region = nextRegion;
  renderDrawer();
  renderCartPage();
  refreshCounts();
  document.dispatchEvent(new CustomEvent('vyrox:cart-pulse', { detail: { region } }));
};

const setQty = (key, qty) => {
  const result = store.updateQty(key, qty);
  if (!result.ok) toast('That quantity is not available.', { type: 'error' });
  renderCart();
};

export const initCart = () => {
  const cart = store.getCart();
  void cart;
  renderCart();
  store.subscribe(renderCart);

  document.addEventListener('click', (event) => {
    const inc = event.target.closest('[data-qty-inc]');
    if (inc) {
      const line = store.getCart().find((item) => item.key === inc.dataset.qtyInc);
      if (line) setQty(line.key, Number(line.qty) + 1);
      return;
    }
    const dec = event.target.closest('[data-qty-dec]');
    if (dec) {
      const line = store.getCart().find((item) => item.key === dec.dataset.qtyDec);
      if (line) setQty(line.key, Number(line.qty) - 1);
      return;
    }
    const remove = event.target.closest('[data-cart-remove]');
    if (remove) {
      const line = store.getCart().find((item) => item.key === remove.dataset.cartRemove);
      const row = remove.closest('[data-cart-line], [data-cart-page-line]');
      row?.classList.add('anim-fade-out');
      window.setTimeout(() => {
        store.removeItem(remove.dataset.cartRemove);
        toast(line ? `${line.name} removed from your bag.` : 'Item removed.', { title: 'Removed' });
      }, 180);
      return;
    }
  });

  document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-qty-input]');
    if (input) setQty(input.dataset.qtyInput, Number(input.value));
    const regionSelect = event.target.closest('[data-cart-region]');
    if (regionSelect) {
      region = regionSelect.value;
      renderCart();
    }
  });

  $('[data-coupon-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('[data-coupon-code]');
    const message = $('[data-coupon-message]');
    const coupon = couponFor(input?.value);
    if (!coupon) {
      if (message) {
        message.textContent = 'That code is not recognised in this demo. Try VYROX10, URBAN500 or FREESHIP.';
        message.className = 'mt-2 text-[11px] text-red';
      }
      toast('Coupon code not recognised.', { type: 'error', title: 'Coupon' });
      return;
    }
    writeCoupon(coupon);
    renderCart();
    if (message) {
      message.textContent = `${coupon.code} applied. ${coupon.note}.`;
      message.className = 'mt-2 text-[11px] text-emerald-600 dark:text-emerald-400';
    }
    toast(`${coupon.code} applied to your bag.`, { title: 'Coupon' });
  });

  $('[data-coupon-clear]')?.addEventListener('click', () => {
    writeCoupon(null);
    const input = $('[data-coupon-code]');
    if (input) input.value = '';
    const message = $('[data-coupon-message]');
    if (message) message.textContent = '';
    renderCart();
    toast('Coupon removed.', { type: 'info', title: 'Coupon' });
  });

  $('[data-cart-clear]')?.addEventListener('click', async () => {
    if (!store.getCart().length) return;
    const { confirmDialog } = await import('./ui.js');
    const confirmed = await confirmDialog({
      title: 'Clear your bag?',
      body: 'Every demo item will be removed from this browser. This cannot be undone.',
      confirmLabel: 'Clear bag',
      danger: true
    });
    if (!confirmed) return;
    store.clearCart();
    toast('Your bag is now empty.', { type: 'info', title: 'Bag cleared' });
  });
};

export const clearCouponIfEmpty = () => {
  if (!store.getCart().length) writeCoupon(null);
};
