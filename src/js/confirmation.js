/** Order confirmation page: populates the placed order summary from demo data. */
import { $, escapeHtml, money } from './ui.js';
import { getOrders } from './store.js';
import { demoOrders } from './data/catalog.js';

const allOrders = () => {
  const mine = getOrders();
  const ids = new Set(mine.map((order) => order.id));
  return [...mine, ...demoOrders.filter((order) => !ids.has(order.id))];
};

export const initConfirmation = () => {
  if (!$('[data-confirmation-order]')) return;
  const ref = new URLSearchParams(window.location.search).get('order');
  const order = ref ? allOrders().find((item) => item.id.toLowerCase() === ref.toLowerCase()) : null;

  const set = (selector, value) => $$(selector).forEach((node) => { node.textContent = value; });

  if (!order) {
    set('[data-confirmation-order]', 'Not found');
    set('[data-confirmation-ref]', '—');
    return;
  }

  set('[data-confirmation-order]', order.id);
  set('[data-confirmation-ref]', order.id);
  set('[data-confirmation-date]', order.date);
  set('[data-confirmation-payment]', order.payment === 'paid' ? 'Paid · verified' : order.payment === 'refunded' ? 'Refunded' : 'Awaiting verification');

  const lines = $('[data-confirmation-lines]');
  if (lines) {
    lines.innerHTML = (order.items ?? []).map((item) => `
      <div class="flex items-center justify-between gap-3 py-2 text-sm">
        <div class="min-w-0 flex-1">
          <p class="font-semibold">${escapeHtml(item.name)}</p>
          <p class="text-[10px] text-subtle">${[item.color, item.size].filter(Boolean).map(escapeHtml).join(' · ') || 'Standard'} × ${item.qty}</p>
        </div>
        <p class="text-right font-semibold">${money(item.price * item.qty)}</p>
      </div>`).join('');
  }

  set('[data-confirmation-total]', money(order.total));
};
