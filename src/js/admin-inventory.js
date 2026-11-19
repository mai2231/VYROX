/** Admin inventory: stock levels, adjustments and low-stock view. */
import { $, $$, escapeHtml, icon, money, toast } from './ui.js';
import { products } from './data/catalog.js';
import { getAdminState, setAdminState } from './store.js';
import { exportCsv } from './admin.js';

const stockMap = () => getAdminState().stock ?? {};

const stockOf = (product) => Number(stockMap()[product.id] ?? product.stock ?? 0);

const merged = () => products.map((product) => ({ ...product, stock: stockOf(product) }));

const render = () => {
  const body = $('[data-admin-inventory-body]');
  if (!body) return;
  const query = String($('[data-admin-inventory-search]')?.value ?? '').trim().toLowerCase();
  const filter = $('[data-admin-inventory-filter]')?.value ?? 'all';
  const list = merged().filter((product) => {
    if (filter === 'low' && (product.stock <= 0 || product.stock > 12)) return false;
    if (filter === 'out' && product.stock > 0) return false;
    return !query || `${product.name} ${product.id} ${product.categoryName}`.toLowerCase().includes(query);
  });

  body.innerHTML = list.map((product) => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden bg-panel">
            <img src="${escapeHtml(product.images?.[0] ?? '')}" alt="" class="h-full w-full object-cover" loading="lazy" onerror="this.style.opacity=0">
          </span>
          <div class="min-w-0"><p class="truncate text-xs font-semibold">${escapeHtml(product.name)}</p><p class="text-[10px] text-subtle">${escapeHtml(product.id)}</p></div>
        </div>
      </td>
      <td class="hidden md:table-cell text-[11px] text-subtle">${escapeHtml(product.categoryName)}</td>
      <td class="text-right text-[11px]">${money(product.price)}</td>
      <td class="text-right">
        <span class="text-xs font-bold ${product.stock <= 0 ? 'text-red' : product.stock <= 12 ? 'text-amber-600 dark:text-amber-300' : ''}">${product.stock}</span>
      </td>
      <td><span class="status ${product.stock <= 0 ? 'status-cancelled' : product.stock <= 12 ? 'status-pending' : 'status-delivered'}">${product.stock <= 0 ? 'Out of stock' : product.stock <= 12 ? 'Low stock' : 'Healthy'}</span></td>
      <td>
        <div class="flex items-center justify-end gap-1">
          <button type="button" class="flex h-7 w-7 items-center justify-center border border-line text-subtle hover:border-ink hover:text-body" data-stock-adjust="${escapeHtml(product.id)}" data-delta="-1" aria-label="Remove one unit">−</button>
          <label class="sr-only" for="stock-${escapeHtml(product.id)}">Stock for ${escapeHtml(product.name)}</label>
          <input id="stock-${escapeHtml(product.id)}" type="number" min="0" value="${product.stock}" data-stock-input="${escapeHtml(product.id)}" class="h-7 w-16 border border-line bg-surface px-2 text-right text-xs focus:border-red focus:outline-none">
          <button type="button" class="flex h-7 w-7 items-center justify-center border border-line text-subtle hover:border-ink hover:text-body" data-stock-adjust="${escapeHtml(product.id)}" data-delta="1" aria-label="Add one unit">+</button>
          <button type="button" class="ml-1 text-[10px] font-bold uppercase tracking-wide2 text-red" data-stock-save="${escapeHtml(product.id)}">Save</button>
        </div>
      </td>
    </tr>`).join('');

  $('[data-admin-inventory-empty]')?.classList.toggle('hidden', list.length > 0);
  $$('[data-admin-inventory-count]').forEach((node) => { node.textContent = String(list.length); });
  const all = merged();
  $$('[data-admin-inventory-total]').forEach((node) => { node.textContent = String(all.length); });
  $$('[data-admin-inventory-low]').forEach((node) => { node.textContent = String(all.filter((product) => product.stock > 0 && product.stock <= 12).length); });
  $$('[data-admin-inventory-out]').forEach((node) => { node.textContent = String(all.filter((product) => product.stock <= 0).length); });
  $$('[data-admin-inventory-units]').forEach((node) => { node.textContent = all.reduce((sum, product) => sum + product.stock, 0).toLocaleString('en-PH'); });
};

const writeStock = (id, value) => {
  const next = { ...stockMap(), [id]: Math.max(0, Math.round(Number(value) || 0)) };
  setAdminState({ stock: next });
};

export const initAdminInventory = () => {
  if (!$('[data-admin-inventory-body]')) return;
  render();

  $('[data-admin-inventory-search]')?.addEventListener('input', render);
  $('[data-admin-inventory-filter]')?.addEventListener('change', render);

  $('[data-admin-inventory-export]')?.addEventListener('click', () => {
    exportCsv('vyrox-inventory.csv', [
      ['ID', 'Product', 'Category', 'Price', 'Stock', 'Status'],
      ...merged().map((product) => [product.id, product.name, product.categoryName, product.price, product.stock, product.stock <= 0 ? 'out' : product.stock <= 12 ? 'low' : 'healthy'])
    ]);
  });

  document.addEventListener('click', (event) => {
    const adjust = event.target.closest('[data-stock-adjust]');
    if (adjust) {
      const id = adjust.dataset.stockAdjust;
      const product = merged().find((item) => item.id === id);
      if (!product) return;
      writeStock(id, product.stock + Number(adjust.dataset.delta || 0));
      render();
      return;
    }
    const save = event.target.closest('[data-stock-save]');
    if (save) {
      const id = save.dataset.stockSave;
      const input = document.querySelector(`[data-stock-input="${id}"]`);
      writeStock(id, input?.value ?? 0);
      toast('Stock level saved to the demo inventory.', { title: 'Inventory' });
      render();
    }
  });

  document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-stock-input]');
    if (!input) return;
    writeStock(input.dataset.stockInput, input.value);
    render();
  });

  void icon;
};
