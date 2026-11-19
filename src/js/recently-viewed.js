/** Recently viewed products: tracks viewed items in localStorage and renders a rail. */
import { $, root, escapeHtml, toast } from './ui.js';
import { getProduct } from './data/catalog.js';
import { productCard } from './products.js';
import * as store from './store.js';

const MAX = 8;

const renderRail = () => {
  const container = $('[data-recently-viewed]');
  if (!container) return;
  const ids = store.getRecentlyViewed();
  const products = ids.map((id) => getProduct(id)).filter(Boolean);
  if (!products.length) {
    container.innerHTML = `
      <div class="col-span-full border border-line bg-surface px-6 py-16 text-center">
        <p class="font-display text-xl uppercase">Nothing viewed yet.</p>
        <p class="mt-2 text-sm text-subtle">Pieces you look at will appear here.</p>
      </div>`;
    return;
  }
  container.innerHTML = products.map(productCard).join('');
};

/** Call on product details pages to record the current product as viewed. */
export const trackRecentlyViewed = (id) => {
  if (!id) return;
  store.addRecentlyViewed(id);
  renderRail();
};

export const initRecentlyViewed = () => {
  renderRail();
  store.subscribe(renderRail);
  $('[data-recently-viewed-clear]')?.addEventListener('click', () => {
    store.clearRecentlyViewed();
    toast('Recently viewed cleared.', { type: 'info', title: 'History' });
  });
};
