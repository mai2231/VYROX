/** Admin orders, payments (read-only verification state) and customers. */
import { $, $$, escapeHtml, icon, money, toast } from './ui.js';
import { demoCustomers } from './data/catalog.js';
import { getAdminState, setAdminState } from './store.js';
import { effectiveOrders, exportCsv, paymentLabel, statusClass } from './admin.js';

const readStatus = (order) => order.status;

const orderRow = (order) => `
  <tr>
    <td>
      <button type="button" class="text-left font-semibold hover:text-red" data-order-view="${escapeHtml(order.id)}">${escapeHtml(order.id)}</button>
      <p class="text-[10px] text-subtle">${escapeHtml(order.date)}</p>
    </td>
    <td>
      <p class="text-xs font-semibold">${escapeHtml(order.customer)}</p>
      <p class="text-[10px] text-subtle">${escapeHtml(order.region || '—')}</p>
    </td>
    <td class="hidden md:table-cell text-[11px]">${escapeHtml(order.method || '—')}</td>
    <td class="text-right font-semibold">${money(order.total)}</td>
    <td><span class="${statusClass(order.status)}">${escapeHtml(order.status)}</span></td>
    <td class="hidden sm:table-cell"><span class="text-[10px] font-semibold ${order.payment === 'paid' ? 'text-emerald-600 dark:text-emerald-400' : order.payment === 'refunded' ? 'text-subtle' : 'text-amber-600 dark:text-amber-300'}">${escapeHtml(paymentLabel(order.payment))}</span></td>
    <td class="text-right">
      <button type="button" class="text-[10px] font-bold uppercase tracking-wide2 text-red" data-order-view="${escapeHtml(order.id)}">View</button>
    </td>
  </tr>`;

const initOrderFilters = ({ body, count, search, status }) => {
  const render = () => {
    if (!body) return;
    const query = String(search?.value ?? '').trim().toLowerCase();
    const statusValue = status?.value ?? 'all';
    const list = effectiveOrders().filter((order) => {
      if (statusValue !== 'all' && order.status !== statusValue) return false;
      if (query && !`${order.id} ${order.customer} ${order.method} ${order.region}`.toLowerCase().includes(query)) return false;
      return true;
    });
    body.innerHTML = list.map(orderRow).join('');
    $('[data-admin-orders-empty]')?.classList.toggle('hidden', list.length > 0);
    $$(count).forEach((node) => { node.textContent = String(list.length); });
  };
  search?.addEventListener('input', render);
  status?.addEventListener('change', render);
  render();
  return render;
};

const drawer = () => $('[data-admin-order-drawer]');
const closeDrawer = () => drawer()?.classList.remove('is-open');

const openOrder = (id) => {
  const order = effectiveOrders().find((item) => item.id === id);
  const host = $('[data-admin-order-view]');
  if (!order || !host) return;
  host.innerHTML = `
    <div class="flex items-start justify-between gap-3 border-b border-line p-5">
      <div>
        <p class="text-[9px] font-bold uppercase tracking-brand text-subtle">Order</p>
        <h2 class="mt-1 font-display text-2xl uppercase leading-none">${escapeHtml(order.id)}</h2>
        <p class="mt-1 text-[10px] text-subtle">${escapeHtml(order.date)} · ${escapeHtml(order.region || '—')}</p>
      </div>
      <button type="button" class="icon-btn" data-admin-order-close aria-label="Close order">${icon('x', 'h-4 w-4')}</button>
    </div>
    <div class="space-y-5 p-5">
      <div class="flex flex-wrap gap-2">
        <span class="${statusClass(order.status)}">${escapeHtml(order.status)}</span>
        <span class="status ${order.payment === 'paid' ? 'status-paid' : order.payment === 'refunded' ? 'status-refunded' : 'status-unpaid'}">${escapeHtml(paymentLabel(order.payment))}</span>
      </div>
      <div>
        <p class="label">Customer</p>
        <p class="text-sm font-semibold">${escapeHtml(order.customer)}</p>
        <p class="text-[11px] text-subtle">${escapeHtml(order.email || '—')}</p>
        <p class="text-[11px] text-subtle">${escapeHtml(order.phone || order.address || order.region || '—')}</p>
      </div>
      <div>
        <p class="label">Fulfilment status</p>
        <select class="input input-sm" data-admin-order-status-select="${escapeHtml(order.id)}" aria-label="Update order status">
          ${['pending', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'].map((value) => `<option value="${value}" ${value === order.status ? 'selected' : ''}>${value[0].toUpperCase() + value.slice(1)}</option>`).join('')}
        </select>
        <p class="mt-2 text-[10px] leading-relaxed text-subtle">Status changes are demo-only. Payment state is never changed here: marking an order paid requires verified backend confirmation.</p>
      </div>
      <div class="border border-line">
        <table class="data-table">
          <thead><tr><th>Item</th><th>Qty</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${(order.items ?? []).map((item) => `<tr><td><p class="font-semibold">${escapeHtml(item.name)}</p><p class="text-[10px] text-subtle">${money(item.price)}</p></td><td>${item.qty}</td><td class="text-right font-semibold">${money(item.price * item.qty)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <dl class="space-y-2 text-sm">
        <div class="flex justify-between"><dt class="text-subtle">Subtotal</dt><dd>${money(order.subtotal ?? order.total)}</dd></div>
        ${order.discount ? `<div class="flex justify-between text-emerald-600 dark:text-emerald-400"><dt>Discount</dt><dd>−${money(order.discount)}</dd></div>` : ''}
        <div class="flex justify-between"><dt class="text-subtle">Shipping</dt><dd>${order.shipping ? money(order.shipping) : 'Free'}</dd></div>
        <div class="flex justify-between border-t border-line pt-2 font-semibold"><dt>Total</dt><dd>${money(order.total)}</dd></div>
      </dl>
      <div class="border border-amber-400/40 bg-amber-400/10 p-3 text-[10px] leading-relaxed text-amber-700 dark:text-amber-200">
        Sample order. Payment verification, refunds and fulfilment sync are backend features planned for later phases.
      </div>
    </div>`;
  drawer()?.classList.add('is-open');
};

export const initAdminOrders = () => {
  if (!$('[data-admin-orders-body]')) return;
  initOrderFilters({
    body: $('[data-admin-orders-body]'),
    count: '[data-admin-orders-count]',
    search: $('[data-admin-order-search]'),
    status: $('[data-admin-order-status-filter]')
  });

  $('[data-admin-orders-export]')?.addEventListener('click', () => {
    exportCsv('vyrox-orders.csv', [
      ['Order', 'Date', 'Customer', 'Region', 'Method', 'Total', 'Status', 'Payment'],
      ...effectiveOrders().map((order) => [order.id, order.date, order.customer, order.region, order.method, order.total, order.status, order.payment])
    ]);
  });

  document.addEventListener('click', (event) => {
    const open = event.target.closest('[data-order-view]');
    if (open) openOrder(open.dataset.orderView);
    if (event.target.closest('[data-admin-order-close]')) closeDrawer();
    if (event.target === drawer()) closeDrawer();
  });

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-admin-order-status-select]');
    if (!select) return;
    const state = getAdminState();
    setAdminState({ orderStatus: { ...(state.orderStatus ?? {}), [select.dataset.adminOrderStatusSelect]: select.value } });
    toast('Demo order status updated in this browser.', { type: 'info', title: 'Status saved' });
    const search = $('[data-admin-order-search]');
    const status = $('[data-admin-order-status-filter]');
    const body = $('[data-admin-orders-body]');
    if (body) {
      const query = String(search?.value ?? '').trim().toLowerCase();
      const statusValue = status?.value ?? 'all';
      const list = effectiveOrders().filter((order) => {
        if (statusValue !== 'all' && order.status !== statusValue) return false;
        return !query || `${order.id} ${order.customer} ${order.method} ${order.region}`.toLowerCase().includes(query);
      });
      body.innerHTML = list.map(orderRow).join('');
      $$('[data-admin-orders-count]').forEach((node) => { node.textContent = String(list.length); });
    }
  });
};

/* ---------------------------------------------------------------- payments */
export const initAdminPayments = () => {
  const body = $('[data-admin-payments-body]');
  if (!body) return;

  const render = () => {
    const query = String($('[data-admin-payment-search]')?.value ?? '').trim().toLowerCase();
    const filter = $('[data-admin-payment-status]')?.value ?? 'all';
    const list = effectiveOrders().filter((order) => {
      if (filter !== 'all' && order.payment !== filter) return false;
      return !query || `${order.id} ${order.customer} ${order.method}`.toLowerCase().includes(query);
    });
    body.innerHTML = list.map((order) => `
      <tr>
        <td><p class="text-xs font-semibold">${escapeHtml(order.id)}</p><p class="text-[10px] text-subtle">${escapeHtml(order.date)}</p></td>
        <td><p class="text-xs font-semibold">${escapeHtml(order.customer)}</p><p class="text-[10px] text-subtle">${escapeHtml(order.method || '—')}</p></td>
        <td class="hidden md:table-cell text-[10px] text-subtle">${escapeHtml(order.reference || 'No reference')}</td>
        <td class="text-right font-semibold">${money(order.total)}</td>
        <td><span class="status ${order.payment === 'paid' ? 'status-paid' : order.payment === 'refunded' ? 'status-refunded' : 'status-unpaid'}">${escapeHtml(paymentLabel(order.payment))}</span></td>
        <td class="text-right"><span class="text-[10px] font-semibold uppercase tracking-wide2 text-subtle">Backend only</span></td>
      </tr>`).join('');
    $('[data-admin-payments-empty]')?.classList.toggle('hidden', list.length > 0);
    $$('[data-admin-payments-count]').forEach((node) => { node.textContent = String(list.length); });
  };

  $('[data-admin-payment-search]')?.addEventListener('input', render);
  $('[data-admin-payment-status]')?.addEventListener('change', render);
  $('[data-admin-payments-export]')?.addEventListener('click', () => {
    exportCsv('vyrox-payments.csv', [
      ['Order', 'Date', 'Customer', 'Method', 'Reference', 'Total', 'Payment state'],
      ...effectiveOrders().map((order) => [order.id, order.date, order.customer, order.method, order.reference || '', order.total, order.payment])
    ]);
  });
  render();
};

/* --------------------------------------------------------------- customers */
export const initAdminCustomers = () => {
  const body = $('[data-admin-customers-body]');
  if (!body) return;

  const customers = () => demoCustomers.map((customer) => {
    const orders = effectiveOrders().filter((order) => order.customer === customer.name);
    return { ...customer, liveOrders: orders.length, liveSpend: orders.reduce((sum, order) => sum + order.total, 0) };
  });

  const render = () => {
    const query = String($('[data-admin-customer-search]')?.value ?? '').trim().toLowerCase();
    const region = $('[data-admin-customer-region]')?.value ?? 'all';
    const list = customers().filter((customer) => {
      if (region !== 'all' && customer.region !== region) return false;
      return !query || `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query);
    });
    body.innerHTML = list.map((customer) => `
      <tr>
        <td>
          <div class="flex items-center gap-3">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-display text-[10px] text-white">${escapeHtml(customer.name.split(' ').map((part) => part[0]).join('').slice(0, 2))}</span>
            <div class="min-w-0"><p class="truncate text-xs font-semibold">${escapeHtml(customer.name)}</p><p class="truncate text-[10px] text-subtle">${escapeHtml(customer.email)}</p></div>
          </div>
        </td>
        <td class="hidden md:table-cell text-[11px]">${escapeHtml(customer.region)}</td>
        <td class="text-right font-semibold">${customer.orders}</td>
        <td class="hidden sm:table-cell text-right">${money(customer.spent)}</td>
        <td><span class="status ${customer.status === 'active' ? 'status-delivered' : 'status-cancelled'}">${escapeHtml(customer.status)}</span></td>
        <td class="text-right"><button type="button" class="text-[10px] font-bold uppercase tracking-wide2 text-red" data-customer-view="${escapeHtml(customer.id)}">View</button></td>
      </tr>`).join('');
    $('[data-admin-customers-empty]')?.classList.toggle('hidden', list.length > 0);
    $$('[data-admin-customers-count]').forEach((node) => { node.textContent = String(list.length); });
  };

  $('[data-admin-customer-search]')?.addEventListener('input', render);
  $('[data-admin-customer-region]')?.addEventListener('change', render);
  $('[data-admin-customers-export]')?.addEventListener('click', () => {
    exportCsv('vyrox-customers.csv', [
      ['ID', 'Name', 'Email', 'Phone', 'Region', 'Orders', 'Spent', 'Joined', 'Status'],
      ...customers().map((customer) => [customer.id, customer.name, customer.email, customer.phone, customer.region, customer.orders, customer.spent, customer.joined, customer.status])
    ]);
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-customer-view]');
    if (!button) return;
    const customer = customers().find((item) => item.id === button.dataset.customerView);
    const host = $('[data-admin-customer-view]');
    if (!customer || !host) return;
    const orders = effectiveOrders().filter((order) => order.customer === customer.name);
    host.innerHTML = `
      <div class="flex items-start justify-between gap-3 border-b border-line p-5">
        <div><p class="text-[9px] font-bold uppercase tracking-brand text-subtle">Customer</p><h2 class="mt-1 font-display text-2xl uppercase leading-none">${escapeHtml(customer.name)}</h2><p class="mt-1 text-[10px] text-subtle">${escapeHtml(customer.email)}</p></div>
        <button type="button" class="icon-btn" data-admin-customer-close aria-label="Close customer">${icon('x', 'h-4 w-4')}</button>
      </div>
      <div class="space-y-5 p-5">
        <div class="grid grid-cols-2 gap-3">
          <div class="border border-line bg-panel p-3"><p class="text-[9px] font-bold uppercase tracking-wide2 text-subtle">Orders</p><p class="font-display text-2xl leading-none">${customer.orders}</p></div>
          <div class="border border-line bg-panel p-3"><p class="text-[9px] font-bold uppercase tracking-wide2 text-subtle">Lifetime</p><p class="font-display text-2xl leading-none">${money(customer.spent)}</p></div>
        </div>
        <div class="text-xs leading-relaxed text-subtle">
          <p><strong class="text-body">Phone:</strong> ${escapeHtml(customer.phone)}</p>
          <p><strong class="text-body">Region:</strong> ${escapeHtml(customer.region)}</p>
          <p><strong class="text-body">Joined:</strong> ${escapeHtml(customer.joined)}</p>
          <p><strong class="text-body">Status:</strong> ${escapeHtml(customer.status)}</p>
        </div>
        <div>
          <p class="label">Recent orders</p>
          <ul class="divide-y divide-line border-y border-line">
            ${orders.length ? orders.map((order) => `<li class="flex items-center justify-between gap-3 py-2.5"><span><span class="block text-xs font-semibold">${escapeHtml(order.id)}</span><span class="text-[10px] text-subtle">${escapeHtml(order.date)}</span></span><span class="text-xs font-semibold">${money(order.total)}</span></li>`).join('') : '<li class="py-3 text-xs text-subtle">No live demo orders. Sample history only.</li>'}
          </ul>
        </div>
        <p class="border border-line bg-panel p-3 text-[10px] leading-relaxed text-subtle">Customer records are sample data. Account management, password resets and GDPR-style exports require the Phase 3 backend.</p>
      </div>`;
    $('[data-admin-customer-drawer]')?.classList.add('is-open');
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-admin-customer-close]')) $('[data-admin-customer-drawer]')?.classList.remove('is-open');
  });

  render();
  void readStatus;
};
