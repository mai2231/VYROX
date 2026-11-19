/** Product rendering, quick view, wishlist toggles and add-to-cart feedback. */
import { $, $$, escapeHtml, icon, money, openModal, refreshCounts, root, stars, toast } from './ui.js';
import { getProduct, products } from './data/catalog.js';
import * as store from './store.js';
import { formatPHP } from './pricing.js';

export const fallbackFor = (product) => `${root()}assets/images/fallback/${product?.category || 'product'}.svg`;

export const productImage = (product, index = 0, cls = '') => {
  const src = product.images[index] ?? product.images[0] ?? fallbackFor(product);
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(product.name)}" class="${cls}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackFor(product)}'">`;
};

export const discountPercent = (product) => product.compareAt
  ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
  : 0;

export const priceBlock = (product, size = 'md') => `
  <span class="inline-flex flex-wrap items-baseline gap-2">
    <span class="${size === 'lg' ? 'font-display text-3xl' : 'text-sm font-semibold'}">${money(product.price)}</span>
    ${product.compareAt ? `<span class="${size === 'lg' ? 'text-base' : 'text-[11px]'} text-subtle line-through">${money(product.compareAt)}</span>` : ''}
  </span>`;

export const productCard = (product) => {
  const wished = store.isWishlisted(product.id);
  const soldOut = product.stock < 1;
  return `
  <article class="product-card group" data-product-card="${product.id}" data-tilt>
    <div class="product-media">
      <a href="${root()}product-details.html?id=${encodeURIComponent(product.id)}" class="block h-full w-full" aria-label="${escapeHtml(product.name)}">
        ${productImage(product, 0, 'h-full w-full object-cover')}
        ${product.images[1] ? `<img src="${escapeHtml(product.images[1])}" alt="" class="product-img-swap h-full w-full object-cover" loading="lazy" onerror="this.style.display='none'">` : ''}
      </a>
      <div class="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div class="flex flex-col items-start gap-1">
          ${product.compareAt ? `<span class="badge badge-red">-${discountPercent(product)}%</span>` : ''}
          ${product.isNew ? '<span class="badge bg-white text-ink">New</span>' : ''}
          ${soldOut ? '<span class="badge badge-soft">Sold out</span>' : ''}
        </div>
        <button type="button" class="pointer-events-auto flex h-9 w-9 items-center justify-center border border-line bg-surface/90 text-body backdrop-blur transition hover:border-red hover:text-red ${wished ? 'text-red' : ''}" data-wish="${product.id}" aria-label="${wished ? 'Remove' : 'Add'} ${escapeHtml(product.name)} ${wished ? 'from' : 'to'} wishlist" aria-pressed="${wished}">
          <svg class="h-4 w-4" fill="${wished ? 'currentColor' : 'none'}" aria-hidden="true"><use href="${root()}assets/icons/lucide-sprite.svg#i-heart"></use></svg>
        </button>
      </div>
      <div class="product-actions">
        <button type="button" class="flex h-10 flex-1 items-center justify-center gap-2 bg-ink px-3 text-[10px] font-bold uppercase tracking-wide2 text-white transition hover:bg-red disabled:opacity-50" data-add="${product.id}" ${soldOut ? 'disabled' : ''}>
          ${icon('shopping-bag', 'h-4 w-4')} ${soldOut ? 'Sold out' : 'Add to bag'}
        </button>
        <button type="button" class="flex h-10 w-10 shrink-0 items-center justify-center bg-surface text-body transition hover:bg-red hover:text-white" data-quickview="${product.id}" aria-label="Quick view ${escapeHtml(product.name)}">
          ${icon('eye', 'h-4 w-4')}
        </button>
        <button type="button" class="flex h-10 w-10 shrink-0 items-center justify-center bg-surface text-body transition hover:bg-red hover:text-white" data-compare="${product.id}" aria-label="${store.isCompared(product.id) ? 'Remove from' : 'Add to'} comparison ${escapeHtml(product.name)}" aria-pressed="${store.isCompared(product.id)}">
          ${icon('sliders-horizontal', 'h-4 w-4')}
        </button>
      </div>
    </div>
    <div class="flex flex-1 flex-col p-3.5">
      <p class="text-[9px] font-bold uppercase tracking-brand text-subtle">${escapeHtml(product.categoryName)}</p>
      <h3 class="mt-1 text-sm font-semibold normal-case leading-snug tracking-normal">
        <a href="${root()}product-details.html?id=${encodeURIComponent(product.id)}" class="transition hover:text-red">${escapeHtml(product.name)}</a>
      </h3>
      <div class="mt-1.5 flex items-center gap-2 text-[10px] text-subtle">
        ${stars(product.rating)}
        <span>${product.rating} (${product.reviewCount})</span>
      </div>
      <div class="mt-auto flex items-end justify-between gap-2 pt-3">
        ${priceBlock(product)}
        <span class="text-[9px] uppercase tracking-wide2 ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red'}">${product.stock > 0 ? `${product.stock} in stock` : 'Waitlist'}</span>
      </div>
    </div>
  </article>`;
};

export const skeletonCard = () => `
  <div class="border border-line bg-surface">
    <div class="skeleton aspect-[4/5]"></div>
    <div class="space-y-3 p-4"><div class="skeleton h-2.5 w-1/3"></div><div class="skeleton h-4 w-4/5"></div><div class="skeleton h-4 w-1/2"></div></div>
  </div>`;

export const renderProducts = (container, list, { skeleton = false } = {}) => {
  if (!container) return;
  if (skeleton) {
    container.innerHTML = Array.from({ length: 6 }, skeletonCard).join('');
    return;
  }
  container.innerHTML = list.length
    ? list.map(productCard).join('')
    : `<div class="col-span-full border border-line bg-surface px-6 py-16 text-center">
        <p class="font-display text-2xl uppercase">Nothing in this edit</p>
        <p class="mx-auto mt-2 max-w-sm text-sm text-subtle">Adjust the filters, or explore the full catalogue. New pieces land weekly.</p>
        <a href="${root()}shop.html" class="btn btn-dark mt-5">Reset filters</a>
      </div>`;
};

export const renderRail = (name) => {
  const container = $(`[data-rail="${name}"]`);
  if (!container) return;
  const map = {
    trending: [...products].sort((a, b) => b.sold - a.sold).slice(0, 4),
    new: products.filter((p) => p.isNew).slice(0, 4),
    best: products.filter((p) => p.bestSeller).slice(0, 4),
    sale: products.filter((p) => p.compareAt).slice(0, 4),
    recommended: [...products].filter((p) => p.featured).slice(0, 4)
  };
  renderProducts(container, map[name] ?? products.slice(0, 4));
};

const quickViewHtml = (product) => {
  const soldOut = product.stock < 1;
  return `
  <div class="grid md:grid-cols-2">
    <div class="relative aspect-square bg-panel md:aspect-auto md:min-h-[520px]">
      ${productImage(product, 0, 'h-full w-full object-cover')}
      ${product.compareAt ? `<span class="badge badge-red absolute left-4 top-4">-${discountPercent(product)}%</span>` : ''}
    </div>
    <div class="flex flex-col p-5 sm:p-7">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-[9px] font-bold uppercase tracking-brand text-red">${escapeHtml(product.categoryName)} · Quick view</p>
          <h2 class="mt-2 font-display text-2xl uppercase leading-none sm:text-3xl">${escapeHtml(product.name)}</h2>
        </div>
        <button type="button" class="icon-btn -mr-2 -mt-2 shrink-0" data-quickview-close aria-label="Close quick view">${icon('x')}</button>
      </div>
      <div class="mt-3 flex items-center gap-2 text-[11px] text-subtle">${stars(product.rating)} <span>${product.rating} · ${product.reviewCount} reviews</span></div>
      <div class="mt-4">${priceBlock(product, 'lg')}</div>
      <p class="mt-4 text-sm leading-relaxed text-subtle">${escapeHtml(product.description)}</p>
      <form class="mt-5 space-y-4" data-quickview-form="${product.id}">
        ${product.colors.length ? `
        <fieldset>
          <legend class="label">Colour · <span data-qv-color-label>${escapeHtml(product.colors[0].name)}</span></legend>
          <div class="flex flex-wrap gap-2">
            ${product.colors.map((color, i) => `<button type="button" class="swatch" style="background:${color.hex}" data-qv-color="${escapeHtml(color.name)}" aria-label="${escapeHtml(color.name)}" aria-checked="${i === 0}" role="radio"></button>`).join('')}
          </div>
        </fieldset>` : ''}
        ${product.sizes.length ? `
        <fieldset>
          <legend class="label">Size</legend>
          <div class="flex flex-wrap gap-2">
            ${product.sizes.map((size, i) => `<button type="button" class="size-option" data-qv-size="${escapeHtml(size)}" aria-checked="${i === 0}" role="radio">${escapeHtml(size)}</button>`).join('')}
          </div>
        </fieldset>` : ''}
        <div class="flex items-center gap-3">
          <div class="qty-control">
            <button type="button" data-qv-dec aria-label="Decrease quantity">${icon('minus', 'h-4 w-4')}</button>
            <input type="number" min="1" max="${product.stock}" value="1" data-qv-qty aria-label="Quantity" ${soldOut ? 'disabled' : ''}>
            <button type="button" data-qv-inc aria-label="Increase quantity">${icon('plus', 'h-4 w-4')}</button>
          </div>
          <button type="submit" class="btn btn-primary flex-1" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : `Add to bag · ${money(product.price)}`}</button>
        </div>
      </form>
      <a href="${root()}product-details.html?id=${encodeURIComponent(product.id)}" class="mt-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide2 text-red">Full product details ${icon('arrow-right', 'h-4 w-4')}</a>
      <p class="mt-auto pt-5 text-[10px] text-subtle">Demo quick view · price and stock are sample data.</p>
    </div>
  </div>`;
};

export const openQuickView = (id) => {
  const product = products.find((p) => p.id === id);
  const content = $('[data-quickview-content]');
  if (!product || !content) return;
  content.innerHTML = quickViewHtml(product);
  openModal('quick-view');
  initQuickView(content, product);
};

const initQuickView = (scope, product) => {
  let color = product.colors[0]?.name;
  let size = product.sizes[0];
  const qty = scope.querySelector('[data-qv-qty]');
  scope.querySelectorAll('[data-qv-color]').forEach((button) => {
    button.addEventListener('click', () => {
      color = button.dataset.qvColor;
      scope.querySelectorAll('[data-qv-color]').forEach((node) => node.setAttribute('aria-checked', String(node === button)));
      const label = scope.querySelector('[data-qv-color-label]');
      if (label) label.textContent = color;
    });
  });
  scope.querySelectorAll('[data-qv-size]').forEach((button) => {
    button.addEventListener('click', () => {
      size = button.dataset.qvSize;
      scope.querySelectorAll('[data-qv-size]').forEach((node) => node.setAttribute('aria-checked', String(node === button)));
    });
  });
  scope.querySelector('[data-qv-dec]')?.addEventListener('click', () => {
    qty.value = String(Math.max(1, Number(qty.value) - 1));
  });
  scope.querySelector('[data-qv-inc]')?.addEventListener('click', () => {
    qty.value = String(Math.min(product.stock, Number(qty.value) + 1));
  });
  scope.querySelector('[data-quickview-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = store.addToCart(product.id, { qty: Number(qty.value), color, size });
    if (!result.ok) {
      toast(result.reason === 'stock' ? `Only ${result.available ?? product.stock} left in stock.` : 'That product is unavailable.', { type: 'error', title: 'Bag unchanged' });
      return;
    }
    toast(`${product.name} added to your bag.`, { title: 'Added' });
    refreshCounts();
  });
};

export const initProductInteractions = () => {
  document.addEventListener('click', (event) => {
    const wish = event.target.closest('[data-wish]');
    if (wish) {
      event.preventDefault();
      const product = getProduct(wish.dataset.wish);
      const added = store.toggleWishlist(wish.dataset.wish);
      wish.setAttribute('aria-pressed', String(added));
      wish.classList.toggle('text-red', added);
      wish.querySelector('svg')?.setAttribute('fill', added ? 'currentColor' : 'none');
      toast(added ? `${product.name} saved to wishlist.` : `${product.name} removed from wishlist.`, { title: added ? 'Saved' : 'Removed' });
      refreshCounts();
      return;
    }

    const quick = event.target.closest('[data-quickview]');
    if (quick) {
      event.preventDefault();
      openQuickView(quick.dataset.quickview);
      return;
    }

    const add = event.target.closest('[data-add]');
    if (add) {
      event.preventDefault();
      const product = getProduct(add.dataset.add);
      const result = store.addToCart(add.dataset.add, { qty: 1 });
      if (!result.ok) {
        toast(result.reason === 'stock' ? `${product.name} is out of stock.` : 'Could not add this item.', { type: 'error', title: 'Bag unchanged' });
        return;
      }
      add.classList.add('btn-loading');
      window.setTimeout(() => add.classList.remove('btn-loading'), 420);
      toast(`${product.name} added to your bag.`, { title: 'Added' });
      refreshCounts();
      document.dispatchEvent(new CustomEvent('vyrox:cart-added', { detail: { product } }));
    }

    const cmp = event.target.closest('[data-compare]');
    if (cmp) {
      event.preventDefault();
      const id = cmp.dataset.compare;
      const product = getProduct(id);
      const currently = store.isCompared(id);
      if (currently) {
        store.removeCompared(id);
        cmp.setAttribute('aria-pressed', 'false');
        cmp.setAttribute('aria-label', `Add to comparison ${escapeHtml(product?.name ?? id)}`);
        toast('Removed from comparison.', { type: 'info', title: 'Comparison' });
      } else {
        const result = store.addCompared(id);
        if (!result.ok) {
          toast('Compare up to 4 products.', { type: 'info', title: 'Comparison full' });
          return;
        }
        cmp.setAttribute('aria-pressed', 'true');
        cmp.setAttribute('aria-label', `Remove from comparison ${escapeHtml(product?.name ?? id)}`);
        toast('Added to comparison.', { title: 'Comparison' });
      }
      return;
    }
  });
};

export const initRails = () => {
  ['trending', 'new', 'best', 'sale', 'recommended'].forEach(renderRail);
};

export const initProducts = initProductInteractions;
