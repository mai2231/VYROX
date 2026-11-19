/** Admin growth and system pages: reviews, coupons, reports, settings, users. */
import { $, $$, escapeHtml, icon, money, toast, confirmDialog } from './ui.js';
import { reviews as demoReviews, demoCoupons, demoAdminUsers, products } from './data/catalog.js';
import { getAdminState, setAdminState, resetDemo } from './store.js';
import { effectiveOrders, exportCsv, drawLine, drawBars } from './admin.js';

/* ----------------------------------------------------------------- reviews */
const reviewStatus = (review) => getAdminState().reviews?.[review.id] ?? review.status;

const renderReviews = () => {
  const body = $('[data-admin-reviews-body]');
  if (!body) return;
  const query = String($('[data-admin-review-search]')?.value ?? '').trim().toLowerCase();
  const filter = $('[data-admin-review-filter]')?.value ?? 'all';
  const list = demoReviews.filter((review) => {
    const status = reviewStatus(review);
    if (filter !== 'all' && status !== filter) return false;
    const product = products.find((item) => item.id === review.productId);
    return !query || `${review.name} ${review.title} ${review.body} ${product?.name ?? ''}`.toLowerCase().includes(query);
  });

  body.innerHTML = list.map((review) => {
    const status = reviewStatus(review);
    const product = products.find((item) => item.id === review.productId);
    return `
      <tr>
        <td>
          <div class="flex items-start gap-3">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-display text-[10px] text-white">${escapeHtml(review.name.slice(0, 2).toUpperCase())}</span>
            <div class="min-w-0">
              <p class="text-xs font-semibold">${escapeHtml(review.name)} ${review.verified ? '<span class="ml-1 text-[9px] text-emerald-600 dark:text-emerald-400">Verified</span>' : ''}</p>
              <p class="text-[10px] text-subtle">${escapeHtml(review.date)} · ${escapeHtml(product?.name ?? review.productId)}</p>
            </div>
          </div>
        </td>
        <td class="hidden lg:table-cell">
          <p class="text-xs font-semibold">${escapeHtml(review.title)}</p>
          <p class="mt-1 max-w-md text-[11px] leading-relaxed text-subtle">${escapeHtml(review.body)}</p>
        </td>
        <td><span class="text-xs font-bold text-amber-600 dark:text-amber-300">${review.rating}★</span></td>
        <td><span class="status ${status === 'approved' ? 'status-delivered' : status === 'rejected' ? 'status-cancelled' : 'status-pending'}">${escapeHtml(status)}</span></td>
        <td class="text-right">
          <div class="flex justify-end gap-1">
            <button type="button" class="btn btn-outline btn-sm" data-review-status="${escapeHtml(review.id)}" data-status="approved">Approve</button>
            <button type="button" class="btn btn-outline btn-sm" data-review-status="${escapeHtml(review.id)}" data-status="rejected">Reject</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  $('[data-admin-reviews-empty]')?.classList.toggle('hidden', list.length > 0);
  $$('[data-admin-reviews-count]').forEach((node) => { node.textContent = String(list.length); });
  $$('[data-admin-reviews-pending]').forEach((node) => { node.textContent = String(demoReviews.filter((review) => reviewStatus(review) === 'pending').length); });
};

export const initAdminReviews = () => {
  if (!$('[data-admin-reviews-body]')) return;
  renderReviews();

  $('[data-admin-review-search]')?.addEventListener('input', renderReviews);
  $('[data-admin-review-filter]')?.addEventListener('change', renderReviews);
  $('[data-admin-reviews-export]')?.addEventListener('click', () => {
    exportCsv('vyrox-reviews.csv', [
      ['Review', 'Product', 'Author', 'Rating', 'Date', 'Status', 'Body'],
      ...demoReviews.map((review) => [review.id, review.productId, review.name, review.rating, review.date, reviewStatus(review), review.body])
    ]);
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-review-status]');
    if (!button) return;
    const state = getAdminState();
    setAdminState({ reviews: { ...(state.reviews ?? {}), [button.dataset.reviewStatus]: button.dataset.status } });
    renderReviews();
    toast(`Review ${button.dataset.status} in the demo console.`, { type: 'info', title: 'Moderation' });
  });
};

/* ----------------------------------------------------------------- coupons */
const couponRows = () => {
  const state = getAdminState();
  const added = state.newCoupons ?? [];
  const statuses = state.couponStatus ?? {};
  return [...demoCoupons, ...added].map((coupon) => ({ ...coupon, status: statuses[coupon.code] ?? coupon.status }));
};

const renderCoupons = () => {
  const body = $('[data-admin-coupons-body]');
  if (!body) return;
  const query = String($('[data-admin-coupon-search]')?.value ?? '').trim().toLowerCase();
  const filter = $('[data-admin-coupon-filter]')?.value ?? 'all';
  const list = couponRows().filter((coupon) => {
    if (filter !== 'all' && coupon.status !== filter) return false;
    return !query || `${coupon.code} ${coupon.note}`.toLowerCase().includes(query);
  });

  body.innerHTML = list.map((coupon) => `
    <tr>
      <td>
        <p class="font-mono text-xs font-bold tracking-wide">${escapeHtml(coupon.code)}</p>
        <p class="text-[10px] text-subtle">${escapeHtml(coupon.note || '')}</p>
      </td>
      <td class="hidden md:table-cell text-[11px] capitalize">${escapeHtml(coupon.type)}${coupon.value ? ` · ${coupon.type === 'percent' ? `${coupon.value}%` : money(coupon.value)}` : ''}</td>
      <td class="text-right text-[11px]">${coupon.minimum ? money(coupon.minimum) : '—'}</td>
      <td class="hidden sm:table-cell text-right text-[11px]">${coupon.usage ?? 0} / ${coupon.limit ?? '∞'}</td>
      <td class="hidden lg:table-cell text-[11px] text-subtle">${escapeHtml(coupon.expires || '—')}</td>
      <td><span class="status ${coupon.status === 'active' ? 'status-delivered' : 'status-cancelled'}">${escapeHtml(coupon.status)}</span></td>
      <td class="text-right"><button type="button" class="btn btn-outline btn-sm" data-coupon-toggle="${escapeHtml(coupon.code)}">${coupon.status === 'active' ? 'Pause' : 'Activate'}</button></td>
    </tr>`).join('');

  $('[data-admin-coupons-empty]')?.classList.toggle('hidden', list.length > 0);
  $$('[data-admin-coupons-count]').forEach((node) => { node.textContent = String(list.length); });
};

export const initAdminCoupons = () => {
  if (!$('[data-admin-coupons-body]')) return;
  renderCoupons();

  $('[data-admin-coupon-search]')?.addEventListener('input', renderCoupons);
  $('[data-admin-coupon-filter]')?.addEventListener('change', renderCoupons);
  $('[data-admin-coupons-export]')?.addEventListener('click', () => {
    exportCsv('vyrox-coupons.csv', [
      ['Code', 'Type', 'Value', 'Minimum', 'Usage', 'Limit', 'Status', 'Expires'],
      ...couponRows().map((coupon) => [coupon.code, coupon.type, coupon.value, coupon.minimum, coupon.usage, coupon.limit, coupon.status, coupon.expires])
    ]);
  });

  $('[data-admin-coupon-new]')?.addEventListener('click', () => {
    $('[data-coupon-modal]')?.classList.add('is-open');
    $('[data-coupon-form]')?.reset();
    $('[data-coupon-form] [name="code"]')?.focus();
  });
  $$('[data-coupon-modal-close], [data-coupon-modal-cancel]').forEach((button) => button.addEventListener('click', () => $('[data-coupon-modal]')?.classList.remove('is-open')));

  $('[data-coupon-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const code = String(data.get('code') || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!code) return;
    if (couponRows().some((coupon) => coupon.code === code)) {
      toast('That coupon code already exists in the demo list.', { type: 'error', title: 'Duplicate code' });
      return;
    }
    const type = String(data.get('type') || 'percent');
    const value = Number(data.get('value')) || 0;
    const state = getAdminState();
    const coupon = {
      code,
      type,
      value,
      cap: Number(data.get('cap')) || 0,
      minimum: Number(data.get('minimum')) || 0,
      usage: 0,
      limit: Number(data.get('limit')) || 0,
      status: 'active',
      expires: String(data.get('expires') || ''),
      note: type === 'percent' ? `${value}% off demo coupon` : type === 'fixed' ? `${money(value)} off demo coupon` : 'Free shipping demo coupon',
      demo: true
    };
    setAdminState({ newCoupons: [...(state.newCoupons ?? []), coupon] });
    $('[data-coupon-modal]')?.classList.remove('is-open');
    event.target.reset();
    renderCoupons();
    toast(`${code} created in the demo console.`, { title: 'Coupon created' });
  });

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-coupon-toggle]');
    if (!toggle) return;
    const state = getAdminState();
    const statuses = { ...(state.couponStatus ?? {}) };
    const current = couponRows().find((coupon) => coupon.code === toggle.dataset.couponToggle);
    statuses[toggle.dataset.couponToggle] = current?.status === 'active' ? 'paused' : 'active';
    setAdminState({ couponStatus: statuses });
    renderCoupons();
  });
};

/* ----------------------------------------------------------------- reports */
const reportSeries = (range) => {
  const base = { '7d': [38, 52, 44, 61, 58, 77, 84], '30d': [42, 58, 47, 72, 65, 88, 96], '90d': [30, 44, 52, 48, 66, 74, 89] }[range] ?? [42, 58, 47, 72, 65, 88, 96];
  const orders = effectiveOrders();
  const lift = Math.max(1, orders.length);
  return base.map((value) => Math.round(value * 1000 + lift * 240));
};

export const initAdminReports = () => {
  if (!$('[data-report-revenue]')) return;
  const draw = () => {
    const range = $('[data-report-range]')?.value ?? '30d';
    const orders = effectiveOrders();
    const paid = orders.filter((order) => order.payment === 'paid');
    const revenue = paid.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const set = (selector, value) => $$(selector).forEach((node) => { node.textContent = value; });
    set('[data-report-revenue]', money(revenue));
    set('[data-report-orders]', String(orders.length));
    set('[data-report-aov]', money(Math.round(revenue / Math.max(1, paid.length))));
    set('[data-report-conversion]', `${(2.4 + orders.length * 0.06).toFixed(2)}%`);
    set('[data-report-repeat]', `${Math.round(38 + orders.length * 0.9)}%`);

    const line = $('[data-chart="revenue"]');
    if (line) drawLine(line, reportSeries(range));
    const bars = $('[data-chart="orders"]');
    if (bars) drawBars(bars, [12, 18, 14, 21, 27, 24, 32].map((value) => value + Math.round(orders.length / 4)));

    const top = $('[data-report-top-products]');
    if (top) {
      top.innerHTML = [...products].sort((a, b) => b.sold - a.sold).slice(0, 6).map((product, index) => `
        <tr>
          <td class="text-subtle">0${index + 1}</td>
          <td><p class="text-xs font-semibold">${escapeHtml(product.name)}</p><p class="text-[10px] text-subtle">${escapeHtml(product.categoryName)}</p></td>
          <td class="text-right">${product.sold}</td>
          <td class="text-right font-semibold">${money(product.price * product.sold)}</td>
        </tr>`).join('');
    }
  };

  $('[data-report-range]')?.addEventListener('change', draw);
  $('[data-admin-reports-export]')?.addEventListener('click', () => {
    exportCsv('vyrox-report.csv', [
      ['Order', 'Date', 'Customer', 'Total', 'Status', 'Payment'],
      ...effectiveOrders().map((order) => [order.id, order.date, order.customer, order.total, order.status, order.payment])
    ]);
  });
  draw();
  let resize;
  window.addEventListener('resize', () => {
    window.clearTimeout(resize);
    resize = window.setTimeout(draw, 180);
  });
};

/* ---------------------------------------------------------------- settings */
export const initAdminSettings = () => {
  const form = $('[data-admin-settings-form]');
  if (!form) return;
  const state = getAdminState();
  const set = (name, value) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (!field) return;
    if (field.type === 'checkbox') field.checked = Boolean(value);
    else field.value = value ?? '';
  };
  set('storeName', state.storeName);
  set('supportEmail', state.supportEmail);
  set('shippingFee', state.shippingFee);
  set('provincialFee', state.provincialFee);
  set('freeShipping', state.freeShipping);
  ['codEnabled', 'gcashEnabled', 'mayaEnabled', 'bankEnabled', 'maintenance'].forEach((key) => set(key, state[key]));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    setAdminState({
      storeName: String(data.get('storeName') || 'VYROX').trim(),
      supportEmail: String(data.get('supportEmail') || '').trim(),
      shippingFee: Math.max(0, Number(data.get('shippingFee')) || 0),
      provincialFee: Math.max(0, Number(data.get('provincialFee')) || 0),
      freeShipping: Math.max(0, Number(data.get('freeShipping')) || 0),
      codEnabled: data.get('codEnabled') === 'on',
      gcashEnabled: data.get('gcashEnabled') === 'on',
      mayaEnabled: data.get('mayaEnabled') === 'on',
      bankEnabled: data.get('bankEnabled') === 'on',
      maintenance: data.get('maintenance') === 'on'
    });
    toast('Demo settings saved in this browser.', { title: 'Settings' });
  });

  $('[data-admin-settings-reset]')?.addEventListener('click', async () => {
    const ok = await confirmDialog({ title: 'Reset demo data?', body: 'Cart, wishlist, addresses, orders and admin changes stored in this browser will be cleared.', confirmLabel: 'Reset', danger: true });
    if (!ok) return;
    resetDemo();
    toast('Demo data cleared. Reloading…', { type: 'info', title: 'Reset' });
    window.setTimeout(() => window.location.reload(), 600);
  });

  void icon;
};

/* ------------------------------------------------------------------- users */
const userRows = () => {
  const state = getAdminState();
  const added = state.newUsers ?? [];
  const statuses = state.userStatus ?? {};
  const roles = state.userRoles ?? {};
  return [...demoAdminUsers, ...added].map((user) => ({
    ...user,
    role: roles[user.id] ?? user.role,
    status: statuses[user.id] ?? user.status
  }));
};

const renderUsers = () => {
  const body = $('[data-admin-users-body]');
  if (!body) return;
  body.innerHTML = userRows().map((user) => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center bg-ink font-display text-[10px] text-white">${escapeHtml(user.name.split(' ').map((part) => part[0]).join('').slice(0, 2))}</span>
          <div class="min-w-0"><p class="truncate text-xs font-semibold">${escapeHtml(user.name)}</p><p class="truncate text-[10px] text-subtle">${escapeHtml(user.email)}</p></div>
        </div>
      </td>
      <td class="hidden md:table-cell text-[11px]">${escapeHtml(user.role)}</td>
      <td>
        <label class="sr-only" for="role-${escapeHtml(user.id)}">Role for ${escapeHtml(user.name)}</label>
        <select id="role-${escapeHtml(user.id)}" class="input input-sm w-auto min-w-[120px]" data-user-role="${escapeHtml(user.id)}">
          ${['Owner', 'Store Manager', 'Fulfilment', 'Support', 'Analyst'].map((role) => `<option ${role === user.role ? 'selected' : ''}>${role}</option>`).join('')}
        </select>
      </td>
      <td><span class="status ${user.status === 'active' ? 'status-delivered' : user.status === 'invited' ? 'status-pending' : 'status-cancelled'}">${escapeHtml(user.status)}</span></td>
      <td class="hidden lg:table-cell text-[10px] text-subtle">${escapeHtml(user.lastActive || '—')}</td>
      <td class="text-right"><button type="button" class="btn btn-outline btn-sm" data-user-status="${escapeHtml(user.id)}">${user.status === 'active' ? 'Suspend' : 'Activate'}</button></td>
    </tr>`).join('');
  $$('[data-admin-users-count]').forEach((node) => { node.textContent = String(userRows().length); });
};

export const initAdminUsers = () => {
  if (!$('[data-admin-users-body]')) return;
  renderUsers();

  $('[data-admin-user-new]')?.addEventListener('click', () => {
    $('[data-user-modal]')?.classList.add('is-open');
    $('[data-user-form]')?.reset();
    $('[data-user-form] [name="name"]')?.focus();
  });
  $$('[data-user-modal-close], [data-user-modal-cancel]').forEach((button) => button.addEventListener('click', () => $('[data-user-modal]')?.classList.remove('is-open')));

  $('[data-user-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    if (!name || !email) return;
    const state = getAdminState();
    const user = {
      id: `USR-demo-${Date.now()}`,
      name,
      email,
      role: String(data.get('role') || 'Support'),
      level: 'staff',
      status: 'invited',
      lastActive: '—',
      demo: true
    };
    setAdminState({ newUsers: [...(state.newUsers ?? []), user] });
    $('[data-user-modal]')?.classList.remove('is-open');
    event.target.reset();
    renderUsers();
    toast(`Invite prepared for ${name}. No email is sent in Phase 1.`, { title: 'Demo invite' });
  });

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-user-role]');
    if (!select) return;
    const state = getAdminState();
    setAdminState({ userRoles: { ...(state.userRoles ?? {}), [select.dataset.userRole]: select.value } });
    toast('Role updated in the demo console.', { type: 'info', title: 'Users' });
  });

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-user-status]');
    if (!toggle) return;
    const state = getAdminState();
    const statuses = { ...(state.userStatus ?? {}) };
    const current = userRows().find((user) => user.id === toggle.dataset.userStatus);
    statuses[toggle.dataset.userStatus] = current?.status === 'active' ? 'suspended' : 'active';
    setAdminState({ userStatus: statuses });
    renderUsers();
  });
};
