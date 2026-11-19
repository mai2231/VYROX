/** Order history and tracking timeline. */
import { getOrders } from './store.js';
import { demoOrders } from './data/catalog.js';
import { $, $$, icon, money, escapeHtml, toast } from './ui.js';

const statuses = {
  pending: { label: 'Pending', cls: 'status-pending' },
  processing: { label: 'Processing', cls: 'status-processing' },
  ready: { label: 'Ready to ship', cls: 'status-ready' },
  shipped: { label: 'Shipped', cls: 'status-shipped' },
  delivered: { label: 'Delivered', cls: 'status-delivered' },
  cancelled: { label: 'Cancelled', cls: 'status-cancelled' }
};

const paymentStatus = (payment) => {
  if (payment === 'paid') return { label: 'Paid · verified (sample)', cls: 'status-paid' };
  if (payment === 'refunded') return { label: 'Refunded (sample)', cls: 'status-refunded' };
  if (payment === 'pending') return { label: 'Awaiting verification', cls: 'status-unpaid' };
  return { label: 'Unpaid · on delivery', cls: 'status-unpaid' };
};

const allOrders = () => {
  const mine = getOrders();
  const ids = new Set(mine.map((order) => order.id));
  return [...mine, ...demoOrders.filter((order) => !ids.has(order.id))];
};

const dateLabel = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
};

const orderCard = (order) => {
  const status = statuses[order.status] ?? statuses.pending;
  const pay = paymentStatus(order.payment);
  return `
  <article class="border border-line bg-surface" data-order-card="${escapeHtml(order.id)}" data-status="${order.status}">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-panel px-4 py-3">
      <div class="flex flex-wrap items-center gap-x-5 gap-y-1">
        <p class="text-[11px] font-bold uppercase tracking-wide2">${escapeHtml(order.id)}</p>
        <p class="text-[11px] text-subtle">${dateLabel(order.date)}</p>
        <p class="text-[11px] text-subtle">${order.items?.length ?? 0} ${(order.items?.length ?? 0) === 1 ? 'item' : 'items'}</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="status ${pay.cls}">${pay.label}</span>
        <span class="status ${status.cls}">${status.label}</span>
      </div>
    </div>
    <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div class="flex flex-1 items-center gap-2">
        ${(order.items ?? []).slice(0, 4).map((item) => `<img src="${item.image ?? ''}" alt="" class="h-14 w-12 border border-line object-cover" loading="lazy" onerror="this.style.opacity=0">`).join('')}
        <div class="min-w-0 pl-1">
          <p class="truncate text-xs font-semibold">${escapeHtml(order.items?.[0]?.name ?? 'Order items')}</p>
          <p class="text-[10px] text-subtle">${(order.items?.length ?? 0) > 1 ? `+ ${order.items.length - 1} more` : 'Single item order'} · ${escapeHtml(order.method ?? 'Payment')}</p>
        </div>
      </div>
      <div class="flex items-center justify-between gap-4 sm:justify-end">
        <div class="text-right">
          <p class="text-[9px] font-bold uppercase tracking-wide2 text-subtle">Total</p>
          <p class="font-display text-xl">${money(order.total)}</p>
        </div>
        <div class="flex gap-2">
          <a href="${document.body.dataset.root || './'}tracking.html?order=${encodeURIComponent(order.id)}" class="btn btn-outline btn-sm">Track</a>
          <a href="${document.body.dataset.root || './'}tracking.html?order=${encodeURIComponent(order.id)}#summary" class="btn btn-dark btn-sm">Details</a>
        </div>
      </div>
    </div>
  </article>`;
};

const renderOrders = (filter = 'all', term = '') => {
  const list = $('[data-orders-list]');
  if (!list) return;
  const query = term.trim().toLowerCase();
  const items = allOrders().filter((order) => {
    if (filter !== 'all' && order.status !== filter) return false;
    if (query && !`${order.id} ${order.customer} ${order.method}`.toLowerCase().includes(query)) return false;
    return true;
  });
  list.innerHTML = items.map(orderCard).join('');
  $('[data-orders-empty]')?.classList.toggle('hidden', items.length > 0);
  $$('[data-orders-total]').forEach((node) => { node.textContent = String(allOrders().length); });
  $$('[data-orders-active]').forEach((node) => { node.textContent = String(allOrders().filter((o) => !['delivered', 'cancelled'].includes(o.status)).length); });
};

export const initOrders = () => {
  if (!$('[data-orders-list]')) return;
  renderOrders();

  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-order-tab]');
    if (tab) {
      $$('[data-order-tab]').forEach((node) => {
        node.classList.toggle('chip-active', node === tab);
      });
      renderOrders(tab.dataset.orderTab, $('[data-orders-search]')?.value ?? '');
    }
    if (event.target.closest('[data-print-order]')) window.print();
  });

  $('[data-orders-search]')?.addEventListener('input', (event) => {
    const active = $('[data-order-tab].chip-active');
    renderOrders(active?.dataset.orderTab ?? 'all', event.target.value);
  });
};

/* ---------------------------------------------------------------- tracking */
const trackingSteps = (order) => {
  if (Array.isArray(order.timeline) && order.timeline.length) {
    return order.timeline.map(([label, date, done]) => ({ label, date, done: Boolean(done) }));
  }
  const index = ['pending', 'processing', 'ready', 'shipped', 'delivered'].indexOf(order.status);
  return ['Order placed', 'Processing', 'Ready to ship', 'Shipped', 'Delivered'].map((label, i) => ({
    label, date: i <= index ? order.date : 'Pending', done: i <= index
  }));
};

const renderTracking = (order) => {
  const host = $('[data-tracking-result]');
  if (!host) return;
  const status = statuses[order.status] ?? statuses.pending;
  const pay = paymentStatus(order.payment);
  host.classList.remove('hidden');
  host.innerHTML = `
    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
      <div>
        <p class="eyebrow">Order tracking</p>
        <h1 class="mt-2 font-display text-3xl uppercase leading-none sm:text-4xl">${escapeHtml(order.id)}</h1>
        <p class="mt-2 text-xs text-subtle">Placed ${dateLabel(order.date)} · ${escapeHtml(order.customer)}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="status ${pay.cls}">${pay.label}</span>
        <span class="status ${status.cls}">${status.label}</span>
        <button type="button" class="btn btn-outline btn-sm print:hidden" data-print-order>${icon('printer', 'h-3.5 w-3.5')} Print</button>
      </div>
    </div>

    <div class="grid gap-8 py-6 lg:grid-cols-[1fr_340px]">
      <div>
        <h2 class="mb-5 font-display text-xl uppercase">Timeline</h2>
        <ol class="space-y-5">
          ${trackingSteps(order).map((step) => `
            <li class="timeline-step ${step.done ? 'is-done' : ''}">
              <span class="timeline-dot">${step.done ? icon('check', 'h-3 w-3') : ''}</span>
              <p class="text-sm font-semibold ${step.done ? '' : 'text-subtle'}">${escapeHtml(step.label)}</p>
              <p class="text-[11px] text-subtle">${escapeHtml(step.date || 'Pending')}</p>
            </li>`).join('')}
        </ol>
        ${order.status === 'shipped' ? `<div class="mt-6 border border-line bg-panel p-4"><p class="text-[10px] font-bold uppercase tracking-wide2 text-subtle">Courier</p><p class="mt-1 text-sm font-semibold">2GO Express · TRK-994120</p><p class="text-[11px] text-subtle">Demo tracking number — live courier integration arrives in Phase 4.</p></div>` : ''}
      </div>

      <aside class="space-y-4">
        <div class="border border-line bg-panel p-4">
          <p class="text-[10px] font-bold uppercase tracking-wide2 text-subtle">Shipping address</p>
          <p class="mt-2 text-sm font-semibold">${escapeHtml(order.customer)}</p>
          <p class="text-xs leading-relaxed text-subtle">${escapeHtml(order.address || order.region || 'Metro Manila, Philippines')}</p>
          ${order.phone ? `<p class="mt-1 text-xs text-subtle">${escapeHtml(order.phone)}</p>` : ''}
        </div>
        <div class="border border-line bg-panel p-4">
          <p class="text-[10px] font-bold uppercase tracking-wide2 text-subtle">Payment</p>
          <p class="mt-2 text-sm font-semibold">${escapeHtml(order.method || 'Demo payment')}</p>
          <p class="text-xs text-subtle">${pay.label}</p>
          ${order.reference ? `<p class="mt-1 text-[11px] text-subtle">Ref: ${escapeHtml(order.reference)}</p>` : ''}
          <p class="mt-3 border-t border-line pt-3 text-[10px] leading-relaxed text-subtle">Phase 1 never captures money. A verified reference is required before any order is marked paid.</p>
        </div>
      </aside>
    </div>

    <div id="summary" class="border-t border-line pt-6">
      <h2 class="mb-4 font-display text-xl uppercase">Order summary</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>Item</th><th>Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${(order.items ?? []).map((item) => `<tr><td><p class="font-semibold">${escapeHtml(item.name)}</p><p class="text-[10px] text-subtle">${[item.color, item.size].filter(Boolean).map(escapeHtml).join(' · ')}</p></td><td>${item.qty}</td><td class="text-right">${money(item.price)}</td><td class="text-right font-semibold">${money(item.price * item.qty)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <dl class="ml-auto mt-4 max-w-xs space-y-2 text-sm">
        <div class="flex justify-between"><dt class="text-subtle">Subtotal</dt><dd>${money(order.subtotal ?? order.total)}</dd></div>
        ${order.discount ? `<div class="flex justify-between text-emerald-600 dark:text-emerald-400"><dt>Discount</dt><dd>−${money(order.discount)}</dd></div>` : ''}
        <div class="flex justify-between"><dt class="text-subtle">Shipping</dt><dd>${order.shipping ? money(order.shipping) : 'Free'}</dd></div>
        <div class="flex justify-between border-t border-line pt-2"><dt class="font-bold uppercase tracking-wide2">Total</dt><dd class="font-display text-xl">${money(order.total)}</dd></div>
      </dl>
      <p class="mt-6 text-[10px] text-subtle">This is a demonstration order receipt. It is not a tax invoice. Sample data is stored only in this browser.</p>
    </div>`;
};

export const initTracking = () => {
  if (!$('[data-tracking-result]')) return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('order');
  const orders = allOrders();
  const order = ref ? orders.find((item) => item.id.toLowerCase() === ref.toLowerCase()) : orders[0];

  const empty = $('[data-tracking-empty]');
  if (order) {
    empty?.classList.add('hidden');
    renderTracking(order);
    if (params.get('new') === '1') toast('Order placed. Payment awaits verification.', { title: 'Thank you' });
  } else {
    empty?.classList.remove('hidden');
  }

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-track-form]');
    if (!form) return;
    event.preventDefault();
    const input = form.querySelector('input[name="order"]');
    const value = input?.value.trim();
    const found = orders.find((item) => item.id.toLowerCase() === value?.toLowerCase());
    if (!found) {
      toast('No demo order matches that reference. Try VYX-2611-8841.', { type: 'error', title: 'Not found' });
      return;
    }
    window.location.href = `${document.body.dataset.root || './'}tracking.html?order=${encodeURIComponent(found.id)}`;
  });
};
