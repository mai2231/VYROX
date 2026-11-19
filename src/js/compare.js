import { $, $$, root, escapeHtml, icon, money, toast } from './ui.js';
import { getProduct } from './data/catalog.js';
import * as store from './store.js';

const stars = (rating = 0) => {
  const full = Math.round(Number(rating));
  const items = Array.from({ length: 5 }, (_, i) =>
    i < full
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
      : '<svg viewBox="0 0 24 24" class="empty" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
  );
  return '<span class="rating" aria-label="' + rating + ' out of 5 stars">' + items.join('') + '</span>';
};

const td = (html) => '<td class="border-b border-line px-4 py-3 text-sm">' + html + '</td>';
const th = (html) => '<th class="border-b border-line bg-panel px-4 py-3">' + html + '</th>';

const renderCompare = () => {
  const body = $('[data-compare-body]');
  const ids = store.getCompared();
  $$('[data-compare-count]').forEach((node) => { node.textContent = String(ids.length); });
  const count = $('[data-compare-count]');
  if (count) count.textContent = String(ids.length);

  if (!ids.length) {
    const empty = $('[data-compare-empty]');
    const table = $('[data-compare-table]');
    empty?.classList.remove('hidden');
    body?.classList.add('hidden');
    if (table) table.innerHTML = '';
    return;
  }
  const empty = $('[data-compare-empty]');
  const table = $('[data-compare-table]');
  empty?.classList.add('hidden');
  body?.classList.remove('hidden');

  const listed = ids.map((id) => getProduct(id)).filter(Boolean);

  const headerCells = listed.map((product) => th(
    '<div class="flex flex-col items-start gap-1">' +
    '<button type="button" class="text-left w-full" data-compare-remove="' + escapeHtml(product.id) + '" aria-label="Remove ' + escapeHtml(product.name) + ' from comparison">' +
    escapeHtml(product.name) +
    '<svg class="ml-1 h-3 w-3 text-subtle" aria-hidden="true"><use href="' + root() + 'assets/icons/lucide-sprite.svg#i-x"></use></svg>' +
    '</button>' +
    '<span class="text-[10px] text-subtle">' + escapeHtml(product.categoryName) + '</span>' +
    '</div>'
  )).join('');

  const header = '<thead><tr><th class="whitespace-nowrap border-b border-line bg-panel px-4 py-3 text-[10px] font-bold uppercase tracking-wide2 text-subtle">Feature</th>' + headerCells +
    '<th class="border-b border-line bg-panel px-4 py-3 text-right">' +
    '<button type="button" class="text-[10px] font-bold uppercase tracking-wide2 text-red hover:text-red" data-compare-clear-all>Clear all</button>' +
    '</th></tr></thead>';

  const priceCell = (p) => '<span class="font-semibold">' + money(p.price) + '</span>' + (p.compareAt ? '<span class="text-[10px] text-subtle line-through ml-1">' + money(p.compareAt) + '</span>' : '');
  const discountCell = (p) => p.compareAt ? '<span class="badge badge-red">-' + Math.round(((p.compareAt - p.price) / p.compareAt) * 100) + '% off</span>' : '<span class="text-[10px] text-subtle">—</span>';
  const stockCell = (p) => '<span class="' + (p.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red') + ' font-semibold">' + (p.stock > 0 ? p.stock + ' in stock' : 'Out of stock') + '</span>';
  const ratingCell = (p) => '<span>' + stars(p.rating) + '</span><span class="text-[10px] text-subtle ml-1">' + p.rating + ' (' + p.reviewCount + ')</span>';
  const colorsCell = (p) => p.colors.length ? p.colors.map((c) => '<span class="inline-block h-3 w-3 rounded-full border border-line" style="background:' + c.hex + '" title="' + escapeHtml(c.name) + '"></span>').join('') : '<span class="text-[10px] text-subtle">—</span>';
  const sizesCell = (p) => p.sizes.length ? p.sizes.map((s) => '<span class="inline-block h-6 min-w-[28px] rounded border border-line px-2 text-[10px] text-center leading-6">' + escapeHtml(s) + '</span>').join('') : '<span class="text-[10px] text-subtle">—</span>';
  const categoryCell = (p) => escapeHtml(p.categoryName);

  const rows = [
    ['Price', priceCell],
    ['Discount', discountCell],
    ['Stock', stockCell],
    ['Rating', ratingCell],
    ['Colors', colorsCell],
    ['Sizes', sizesCell],
    ['Category', categoryCell]
  ];

  let tbody = '';
  rows.forEach(([label, cell]) => {
    const cells = listed.map((product) => td(cell(product))).join('');
    tbody += '<tr><td class="border-b border-line px-4 py-3 text-[10px] font-bold uppercase tracking-wide2 text-subtle">' + escapeHtml(label) + '</td>' + cells + '<td class="border-b border-line px-4 py-3 text-right"></td></tr>';
  });

  table.innerHTML = header + '<tbody>' + tbody + '</tbody>';

  $$('[data-compare-remove]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.compareRemove;
    store.removeCompared(id);
    renderCompare();
    toast('Removed from comparison.', { type: 'info', title: 'Comparison' });
  }));
  $('[data-compare-clear-all]')?.addEventListener('click', () => {
    store.clearCompared();
    renderCompare();
    toast('Comparison cleared.', { type: 'info', title: 'Comparison' });
  });
};

export const initCompare = () => {
  if (!$('[data-compare-table]')) return;
  renderCompare();
  store.subscribe(renderCompare);
};
