/** Wishlist page rendering and move-to-bag actions. */
import { $, escapeHtml, icon, money, root, toast } from './ui.js';
import * as store from './store.js';
import { getProduct } from './data/catalog.js';
import { productImage } from './products.js';

const row = (product) => `
  <article class="flex gap-4 border border-line bg-surface p-3.5" data-wish-row="${product.id}">
    <a href="${root()}product-details.html?id=${encodeURIComponent(product.id)}" class="h-32 w-24 shrink-0 overflow-hidden bg-panel">
      ${productImage(product, 0, 'h-full w-full object-cover transition duration-500 hover:scale-105')}
    </a>
    <div class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-[9px] font-bold uppercase tracking-brand text-subtle">${escapeHtml(product.categoryName)}</p>
          <h2 class="mt-1 text-sm font-semibold normal-case leading-snug tracking-normal"><a href="${root()}product-details.html?id=${encodeURIComponent(product.id)}" class="hover:text-red">${escapeHtml(product.name)}</a></h2>
          <div class="mt-2 flex items-center gap-2">${money(product.price)}${product.compareAt ? `<span class="text-[11px] text-subtle line-through">${money(product.compareAt)}</span>` : ''}</div>
        </div>
        <button type="button" class="text-subtle transition hover:text-red" data-wish="${product.id}" aria-label="Remove ${escapeHtml(product.name)} from wishlist" aria-pressed="true">${icon('x', 'h-4 w-4')}</button>
      </div>
      <div class="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <button type="button" class="btn btn-dark btn-sm" data-wish-add="${product.id}" ${product.stock < 1 ? 'disabled' : ''}>${icon('shopping-bag', 'h-3.5 w-3.5')} ${product.stock < 1 ? 'Sold out' : 'Move to bag'}</button>
        <a href="${root()}product-details.html?id=${encodeURIComponent(product.id)}" class="btn btn-outline btn-sm">View</a>
      </div>
    </div>
  </article>`;

export const renderWishlist = () => {
  const grid = $('[data-wishlist-grid]');
  if (!grid) return;
  const items = store.getWishlist().map(getProduct).filter(Boolean);
  const empty = $('[data-wishlist-empty]');
  const count = $('[data-wishlist-total]');
  if (count) count.textContent = String(items.length);
  grid.classList.toggle('hidden', !items.length);
  empty?.classList.toggle('hidden', items.length > 0);
  empty?.classList.toggle('flex', items.length === 0);
  grid.innerHTML = items.map(row).join('');
};

export const initWishlist = () => {
  renderWishlist();
  store.subscribe(renderWishlist);

  document.addEventListener('click', (event) => {
    const move = event.target.closest('[data-wish-add]');
    if (!move) return;
    const product = getProduct(move.dataset.wishAdd);
    const result = store.addToCart(move.dataset.wishAdd, { qty: 1 });
    if (!result.ok) {
      toast(result.reason === 'stock' ? `${product.name} is out of stock.` : 'Could not add this item.', { type: 'error', title: 'Bag unchanged' });
      return;
    }
    store.toggleWishlist(move.dataset.wishAdd);
    toast(`${product.name} moved to your bag.`, { title: 'Moved' });
  });
};
