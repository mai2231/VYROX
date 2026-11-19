/** Admin console shell, shared demo-state helpers, dashboard and charts. */
import { $, $$, escapeHtml, icon, money, toast } from './ui.js';
import { demoOrders, demoCustomers, demoLog, products, categories } from './data/catalog.js';
import { getOrders, getAdminState, setAdminState, resetDemo } from './store.js';

export const effectiveOrders = () => {
  const state = getAdminState();
  const saved = getOrders();
  const merged = [...saved, ...demoOrders.filter((order) => !saved.some((item) => item.id === order.id))];
  return merged.map((order) => ({
    ...order,
    status: state.orderStatus?.[order.id] ?? order.status,
    payment: state.payments?.[order.id] ?? order.payment
  }));
};

export const statusClass = (status) => `status status-${status || 'pending'}`;

export const paymentLabel = (payment) => {
  if (payment === 'paid') return 'Paid · verified';
  if (payment === 'pending') return 'Awaiting verification';
  if (payment === 'refunded') return 'Refunded';
  return 'Unpaid · on delivery';
};

export const exportCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`${filename} exported from sample data.`, { type: 'info', title: 'Export' });
};

/* ------------------------------------------------------------------ charts */
export const drawLine = (canvas, series) => {
  const ctx = canvas.getContext?.('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, rect.width || canvas.parentElement?.clientWidth || 640);
  const height = Math.max(180, rect.height || 240);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  const pad = { top: 18, right: 14, bottom: 26, left: 14 };
  const max = Math.max(...series) * 1.12;
  const stepX = (width - pad.left - pad.right) / (series.length - 1);
  const y = (value) => pad.top + (height - pad.top - pad.bottom) * (1 - value / max);
  const x = (index) => pad.left + stepX * index;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(161,161,170,.22)';
  ctx.lineWidth = 1;
  for (let line = 0; line < 4; line += 1) {
    const gy = pad.top + ((height - pad.top - pad.bottom) / 3) * line;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(width - pad.right, gy);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
  gradient.addColorStop(0, 'rgba(227,27,50,.28)');
  gradient.addColorStop(1, 'rgba(227,27,50,0)');

  let progress = 0;
  const paint = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(161,161,170,.22)';
    for (let line = 0; line < 4; line += 1) {
      const gy = pad.top + ((height - pad.top - pad.bottom) / 3) * line;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(width - pad.right, gy);
      ctx.stroke();
    }
    const count = Math.max(2, Math.ceil(series.length * progress));
    ctx.beginPath();
    series.slice(0, count).forEach((value, index) => {
      if (index === 0) ctx.moveTo(x(index), y(value));
      else ctx.lineTo(x(index), y(value));
    });
    ctx.lineTo(x(count - 1), height - pad.bottom);
    ctx.lineTo(x(0), height - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    series.slice(0, count).forEach((value, index) => {
      if (index === 0) ctx.moveTo(x(index), y(value));
      else ctx.lineTo(x(index), y(value));
    });
    ctx.strokeStyle = '#E31B32';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    series.slice(0, count).forEach((value, index) => {
      ctx.beginPath();
      ctx.arc(x(index), y(value), 3, 0, Math.PI * 2);
      ctx.fillStyle = '#E31B32';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    if (progress < 1) {
      progress = Math.min(1, progress + 0.04);
      requestAnimationFrame(paint);
    }
  };
  paint();
};

export const drawBars = (canvas, series) => {
  const ctx = canvas.getContext?.('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, rect.width || canvas.parentElement?.clientWidth || 520);
  const height = Math.max(150, rect.height || 190);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  const max = Math.max(...series) * 1.15 || 1;
  const gap = 10;
  const barWidth = (width - gap * (series.length + 1)) / series.length;
  ctx.clearRect(0, 0, width, height);
  series.forEach((value, index) => {
    const h = (height - 28) * (value / max);
    const x = gap + index * (barWidth + gap);
    ctx.fillStyle = index === series.length - 1 ? '#E31B32' : '#1C1C1F';
    ctx.fillRect(x, height - 22 - h, barWidth, h);
    ctx.fillStyle = 'rgba(161,161,170,.9)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] ?? '', x + barWidth / 2, height - 7);
  });
};

/* ------------------------------------------------------------------- shell */
export const initAdmin = () => {
  const sidebar = $('[data-admin-sidebar]');
  const scrim = $('[data-admin-scrim]');
  const open = $('[data-admin-open]');
  const close = $('[data-admin-close]');
  const collapse = $('[data-admin-collapse]');

  const setDrawer = (isOpen) => {
    sidebar?.classList.toggle('is-open', isOpen);
    scrim?.classList.toggle('hidden', !isOpen);
    open?.setAttribute('aria-expanded', String(isOpen));
  };
  open?.addEventListener('click', () => setDrawer(true));
  close?.addEventListener('click', () => setDrawer(false));
  scrim?.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setDrawer(false); });

  if (collapse && sidebar) {
    let collapsed = false;
    try { collapsed = sessionStorage.getItem('vyrox_admin_collapsed') === '1'; } catch { collapsed = false; }
    const apply = (value) => {
      collapsed = value;
      sidebar.classList.toggle('is-collapsed', value);
      collapse.setAttribute('aria-pressed', String(value));
      collapse.setAttribute('aria-label', value ? 'Expand sidebar' : 'Collapse sidebar');
      try { sessionStorage.setItem('vyrox_admin_collapsed', value ? '1' : '0'); } catch { /* demo */ }
    };
    apply(collapsed);
    collapse.addEventListener('click', () => apply(!collapsed));
  }

  const date = $('[data-admin-date]');
  if (date) date.textContent = new Date().toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  $('[data-admin-profile]')?.addEventListener('click', () => {
    toast('Demo owner profile. Role management lives in Admin users.', { type: 'info', title: 'Alexis Ramos' });
  });

  const search = $('[data-admin-global-search]');
  search?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const term = search.value.trim();
    if (!term) return;
    window.location.href = `${document.body.dataset.root || '../'}admin/products.html?q=${encodeURIComponent(term)}`;
  });
};

/* --------------------------------------------------------------- dashboard */
export const initAdminDashboard = () => {
  const orders = effectiveOrders();
  const revenue = orders.filter((order) => order.payment === 'paid').reduce((sum, order) => sum + Number(order.total || 0), 0);
  const lowStock = products.filter((product) => product.stock <= 10);
  const set = (selector, value) => $$(selector).forEach((node) => { node.textContent = value; });
  set('[data-kpi-revenue]', money(revenue));
  set('[data-kpi-orders]', String(orders.length));
  set('[data-kpi-customers]', String(demoCustomers.length));
  set('[data-kpi-low-stock]', String(lowStock.length));
  set('[data-kpi-aov]', money(Math.round(revenue / Math.max(1, orders.filter((order) => order.payment === 'paid').length))));
  set('[data-kpi-pending]', String(orders.filter((order) => order.payment === 'pending').length));

  const recent = $('[data-admin-recent-orders]');
  if (recent) {
    recent.innerHTML = orders.slice(0, 6).map((order) => `
      <tr>
        <td><a href="${document.body.dataset.root || '../'}admin/orders.html?id=${encodeURIComponent(order.id)}" class="font-semibold hover:text-red">${escapeHtml(order.id)}</a><p class="text-[10px] text-subtle">${escapeHtml(order.date)}</p></td>
        <td><p class="font-semibold">${escapeHtml(order.customer)}</p><p class="text-[10px] text-subtle">${escapeHtml(order.region || '—')}</p></td>
        <td class="text-right font-semibold">${money(order.total)}</td>
        <td><span class="${statusClass(order.status)}">${escapeHtml(order.status)}</span></td>
        <td class="text-right"><a href="${document.body.dataset.root || '../'}admin/orders.html?id=${encodeURIComponent(order.id)}" class="text-[10px] font-bold uppercase tracking-wide2 text-red">Open</a></td>
      </tr>`).join('');
  }

  const low = $('[data-admin-low-stock]');
  if (low) {
    low.innerHTML = products.filter((product) => product.stock <= 12).sort((a, b) => a.stock - b.stock).slice(0, 5).map((product) => `
      <li class="flex items-center gap-3 border-b border-line py-3 last:border-0">
        <img src="${product.images[0]}" alt="" class="h-10 w-10 shrink-0 object-cover" loading="lazy" onerror="this.style.opacity=0">
        <div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold">${escapeHtml(product.name)}</p><p class="text-[10px] text-subtle">${escapeHtml(product.categoryName)}</p></div>
        <span class="text-[10px] font-bold ${product.stock < 5 ? 'text-red' : 'text-amber-600 dark:text-amber-300'}">${product.stock} left</span>
      </li>`).join('');
  }

  const best = $('[data-admin-best-sellers]');
  if (best) {
    best.innerHTML = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5).map((product, index) => `
      <li class="flex items-center gap-3 border-b border-line py-3 last:border-0">
        <span class="w-4 font-display text-lg text-subtle">0${index + 1}</span>
        <div class="min-w-0 flex-1"><p class="truncate text-xs font-semibold">${escapeHtml(product.name)}</p><p class="text-[10px] text-subtle">${product.sold} sold · ${product.stock} in stock</p></div>
        <span class="text-[11px] font-semibold">${money(product.price)}</span>
      </li>`).join('');
  }

  const log = $('[data-admin-log]');
  if (log) {
    log.innerHTML = demoLog.map((entry) => `
      <li class="flex gap-3 border-b border-line py-3 last:border-0">
        <span class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center bg-panel">${icon('activity', 'h-3.5 w-3.5 text-subtle')}</span>
        <div class="min-w-0 flex-1"><p class="text-xs font-semibold">${escapeHtml(entry.action)}</p><p class="text-[10px] text-subtle">${escapeHtml(entry.subject)} · ${escapeHtml(entry.detail)}</p></div>
        <span class="shrink-0 text-[9px] text-subtle">${escapeHtml(entry.at.slice(0, 10))}</span>
      </li>`).join('');
  }

  const revenueSeries = [42, 58, 47, 72, 65, 88, 96].map((value) => Math.round(value * 1000 + revenue / 24));
  const line = $('[data-chart="revenue"]');
  if (line) {
    drawLine(line, revenueSeries);
    let resize;
    window.addEventListener('resize', () => { window.clearTimeout(resize); resize = window.setTimeout(() => drawLine(line, revenueSeries), 180); });
  }
  const bars = $('[data-chart="orders"]');
  if (bars) drawBars(bars, [12, 18, 14, 21, 27, 24, 32]);

  $('[data-dashboard-range]')?.addEventListener('change', (event) => {
    toast(`Dashboard sample window: ${event.target.options[event.target.selectedIndex].text}.`, { type: 'info', title: 'Sample data' });
  });

  $('[data-admin-reset]')?.addEventListener('click', () => {
    resetDemo();
    toast('Demo state cleared. Reloading console…', { type: 'info', title: 'Reset' });
    window.setTimeout(() => window.location.reload(), 600);
  });

  $$('[data-admin-quick-filter]').forEach((button) => button.addEventListener('click', () => {
    $$('[data-admin-quick-filter]').forEach((node) => node.classList.toggle('chip-active', node === button));
    const range = button.dataset.adminQuickFilter;
    toast(`Showing ${range} sample figures.`, { type: 'info', title: 'Range' });
  }));

  void getAdminState;
  void setAdminState;
  void categories;
};
