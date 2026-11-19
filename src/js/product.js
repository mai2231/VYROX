/** Product details page: gallery, variants, tabs, reviews and related pieces. */
import { $, $$, escapeHtml, icon, money, refreshCounts, root, stars, toast } from './ui.js';
import { products, reviews, categories } from './data/catalog.js';
import * as store from './store.js';
import { initReveals } from './animations.js';
import { productCard, productImage, priceBlock, discountPercent, fallbackFor } from './products.js';
import { trackRecentlyViewed } from './recently-viewed.js';

const activeReviews = (id) => reviews.filter((review) => review.productId === id);

const gallery = (product) => `
  <div class="grid gap-3 sm:grid-cols-[88px_1fr]">
    <div class="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible" role="tablist" aria-label="Product images">
      ${product.images.map((src, index) => `
        <button type="button" class="relative aspect-square w-20 shrink-0 overflow-hidden border ${index === 0 ? 'border-ink' : 'border-line'} bg-panel" data-gallery-thumb="${index}" role="tab" aria-selected="${index === 0}" aria-label="View image ${index + 1}">
          <img src="${escapeHtml(src)}" alt="" class="h-full w-full object-cover" loading="lazy" onerror="this.onerror=null;this.src='${fallbackFor(product)}'">
        </button>`).join('')}
    </div>
    <div class="order-1 relative aspect-square overflow-hidden bg-panel sm:order-2" data-zoom-host>
      <img src="${escapeHtml(product.images[0] ?? fallbackFor(product))}" alt="${escapeHtml(product.name)}" class="h-full w-full object-cover transition duration-500" data-gallery-main onerror="this.onerror=null;this.src='${fallbackFor(product)}'">
      ${product.compareAt ? `<span class="badge badge-red absolute left-4 top-4">-${discountPercent(product)}%</span>` : ''}
      <div class="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/70 to-transparent p-4 text-white">
        <span class="text-[9px] font-bold uppercase tracking-brand">${escapeHtml(product.categoryName)}</span>
        <span class="text-[9px] uppercase tracking-wide2 text-white/70">Hover to zoom</span>
      </div>
    </div>
  </div>`;

const variantControls = (product) => `
  ${product.colors.length ? `
  <fieldset>
    <legend class="label">Colour · <span class="text-body" data-detail-color-label>${escapeHtml(product.colors[0].name)}</span></legend>
    <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a colour">
      ${product.colors.map((color, i) => `<button type="button" class="swatch" style="background:${color.hex}" data-detail-color="${escapeHtml(color.name)}" role="radio" aria-checked="${i === 0}" aria-label="${escapeHtml(color.name)}" title="${escapeHtml(color.name)}"></button>`).join('')}
    </div>
  </fieldset>` : ''}
  ${product.sizes.length ? `
  <fieldset>
    <legend class="label">Size / format</legend>
    <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a size">
      ${product.sizes.map((size, i) => `<button type="button" class="size-option" data-detail-size="${escapeHtml(size)}" role="radio" aria-checked="${i === 0}">${escapeHtml(size)}</button>`).join('')}
    </div>
  </fieldset>` : ''}`;

const reviewBreakdown = (list, product) => {
  const counts = [5, 4, 3, 2, 1].map((star) => list.filter((review) => review.rating === star).length);
  const total = list.length || 1;
  return `
    <div class="border border-line bg-panel p-5">
      <div class="flex items-end gap-3">
        <p class="font-display text-5xl leading-none">${product.rating}</p>
        <div class="pb-1">
          ${stars(product.rating)}
          <p class="mt-1 text-[10px] uppercase tracking-wide2 text-subtle">${product.reviewCount} verified notes</p>
        </div>
      </div>
      <div class="mt-5 space-y-2">
        ${[5, 4, 3, 2, 1].map((star, i) => `
          <div class="flex items-center gap-2 text-[10px]">
            <span class="w-6 text-subtle">${star}★</span>
            <span class="h-1.5 flex-1 bg-line"><span class="block h-full bg-red" style="width:${Math.round((counts[i] / total) * 100)}%"></span></span>
            <span class="w-8 text-right text-subtle">${counts[i]}</span>
          </div>`).join('')}
      </div>
      <p class="mt-4 text-[10px] leading-relaxed text-subtle">Sample review data. Reviews are moderated in the admin console.</p>
    </div>`;
};

const reviewCard = (review) => `
  <article class="border-b border-line py-5 last:border-0">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">${stars(review.rating)}<p class="text-xs font-semibold">${escapeHtml(review.title)}</p></div>
      <span class="text-[10px] text-subtle">${escapeHtml(review.date)}</span>
    </div>
    <p class="mt-2 text-sm leading-relaxed text-subtle">${escapeHtml(review.body)}</p>
    <p class="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wide2 text-subtle">
      ${escapeHtml(review.name)}
      ${review.verified ? `<span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">${icon('badge-check', 'h-3 w-3')} Verified</span>` : ''}
    </p>
  </article>`;

const detailHtml = (product) => {
  const list = activeReviews(product.id);
  const soldOut = product.stock < 1;
  return `
  <div class="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-12">
    <div data-reveal="image">${gallery(product)}</div>

    <div data-reveal>
      <div class="flex flex-wrap items-center gap-2">
        <a href="${root()}shop.html?category=${encodeURIComponent(product.category)}" class="text-[9px] font-bold uppercase tracking-brand text-red">${escapeHtml(product.categoryName)}</a>
        <span class="text-subtle">/</span>
        <span class="text-[9px] uppercase tracking-brand text-subtle">${escapeHtml(product.badge || 'VYROX edit')}</span>
      </div>
      <h1 class="mt-3 font-display text-4xl uppercase leading-[.92] sm:text-5xl">${escapeHtml(product.name)}</h1>
      <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-subtle">
        ${stars(product.rating)}
        <span>${product.rating} · ${product.reviewCount} reviews</span>
        <span class="h-3 w-px bg-line"></span>
        <span class="${soldOut ? 'text-red' : 'text-emerald-600 dark:text-emerald-400'} font-semibold">${soldOut ? 'Out of stock' : `${product.stock} in stock`}</span>
      </div>
      <div class="mt-5 flex flex-wrap items-end gap-3">
        <span class="font-display text-4xl leading-none">${money(product.price)}</span>
        ${product.compareAt ? `<span class="text-base text-subtle line-through">${money(product.compareAt)}</span><span class="badge badge-red">Save ${money(product.compareAt - product.price)}</span>` : ''}
      </div>
      <p class="mt-2 text-[10px] uppercase tracking-wide2 text-subtle">VAT inclusive · free shipping over ₱2,500</p>

      <p class="mt-5 text-sm leading-relaxed text-subtle">${escapeHtml(product.description)}</p>

      <form class="mt-6 space-y-6" data-detail-form="${product.id}">
        ${variantControls(product)}
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="qty-control">
            <button type="button" data-detail-dec aria-label="Decrease quantity">${icon('minus', 'h-4 w-4')}</button>
            <input type="number" min="1" max="${product.stock || 1}" value="1" data-detail-qty aria-label="Quantity" ${soldOut ? 'disabled' : ''}>
            <button type="button" data-detail-inc aria-label="Increase quantity">${icon('plus', 'h-4 w-4')}</button>
          </div>
          <button type="submit" class="btn btn-primary flex-1" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : `${icon('shopping-bag', 'h-4 w-4')} Add to bag`}</button>
          <button type="button" class="icon-btn h-11 w-11 shrink-0 border border-line ${store.isWishlisted(product.id) ? 'text-red' : ''}" data-wish="${product.id}" aria-label="${store.isWishlisted(product.id) ? 'Remove from' : 'Add to'} wishlist" aria-pressed="${store.isWishlisted(product.id)}">
            <svg class="h-5 w-5" fill="${store.isWishlisted(product.id) ? 'currentColor' : 'none'}" aria-hidden="true"><use href="${root()}assets/icons/lucide-sprite.svg#i-heart"></use></svg>
          </button>
        </div>
        <button type="button" class="btn btn-dark btn-block" data-buy-now="${product.id}" ${soldOut ? 'disabled' : ''}>${icon('zap', 'h-4 w-4')} Buy now · ${money(product.price)}</button>
      </form>

      <dl class="mt-7 grid grid-cols-2 gap-px border border-line bg-line text-[11px]">
        <div class="bg-surface p-3"><dt class="font-bold uppercase tracking-wide2 text-subtle">Dispatch</dt><dd class="mt-1">Same day before 2PM</dd></div>
        <div class="bg-surface p-3"><dt class="font-bold uppercase tracking-wide2 text-subtle">Returns</dt><dd class="mt-1">30 days, unused</dd></div>
        <div class="bg-surface p-3"><dt class="font-bold uppercase tracking-wide2 text-subtle">Payment</dt><dd class="mt-1">GCash · Maya · COD</dd></div>
        <div class="bg-surface p-3"><dt class="font-bold uppercase tracking-wide2 text-subtle">SKU</dt><dd class="mt-1">${escapeHtml(product.specs[1]?.[1] ?? '—')}</dd></div>
      </dl>
    </div>
  </div>

  <section class="mt-14 border-t border-line pt-8">
    <div class="flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Product information">
      ${[['description', 'Description'], ['specs', 'Specifications'], ['reviews', `Reviews (${list.length})`]].map(([key, label], i) => `
        <button type="button" class="shrink-0 border-b-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wide2 transition ${i === 0 ? 'border-red text-body' : 'border-transparent text-subtle hover:text-body'}" data-product-tab="${key}" role="tab" aria-selected="${i === 0}" aria-controls="panel-${key}">${label}</button>`).join('')}
    </div>

    <div class="py-7" id="panel-description" data-product-panel="description" role="tabpanel">
      <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div class="prose-vyrox max-w-2xl">
          <h2>The short version</h2>
          <p>${escapeHtml(product.description)}</p>
          <h3>Why it is here</h3>
          <p>Every VYROX piece is chosen for material honesty, function and a point of view. This one earns its place in the edit — and in your rotation.</p>
          <ul><li>Designed in Manila, produced in small runs.</li><li>Demo photography and specifications for Phase 1.</li><li>Ships nationwide with tracked delivery.</li></ul>
        </div>
        <aside class="border border-line bg-panel p-5">
          <p class="text-[10px] font-bold uppercase tracking-wide2 text-subtle">In the box</p>
          <ul class="mt-3 space-y-2 text-xs">
            <li class="flex gap-2">${icon('check', 'h-3.5 w-3.5 text-red shrink-0')} ${escapeHtml(product.name)}</li>
            <li class="flex gap-2">${icon('check', 'h-3.5 w-3.5 text-red shrink-0')} VYROX care card</li>
            <li class="flex gap-2">${icon('check', 'h-3.5 w-3.5 text-red shrink-0')} Recycled protective packaging</li>
          </ul>
        </aside>
      </div>
    </div>

    <div class="hidden py-7" id="panel-specs" data-product-panel="specs" role="tabpanel">
      <div class="max-w-3xl table-scroll">
        <table class="data-table">
          <tbody>${product.specs.map(([key, value]) => `<tr><td class="w-40 text-[10px] font-bold uppercase tracking-wide2 text-subtle">${escapeHtml(key)}</td><td class="text-sm">${escapeHtml(value)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="mt-4 text-[10px] text-subtle">Specifications are sample data for Phase 1 and will be served from the product database later.</p>
    </div>

    <div class="hidden py-7" id="panel-reviews" data-product-panel="reviews" role="tabpanel">
      <div class="grid gap-6 lg:grid-cols-[320px_1fr]">
        ${reviewBreakdown(list, product)}
        <div>
          ${list.length ? list.map(reviewCard).join('') : `<div class="border border-line bg-surface p-6 text-center"><p class="font-display text-xl uppercase">No notes yet</p><p class="mt-2 text-sm text-subtle">Be the first to review this piece once accounts move to Phase 3.</p></div>`}
          <button type="button" class="btn btn-outline mt-5" data-review-demo>${icon('pen-line', 'h-4 w-4')} Write a review</button>
        </div>
      </div>
    </div>
  </section>`;
};

const setMainImage = (product, index) => {
  const main = $('[data-gallery-main]');
  const src = product.images[index] ?? product.images[0];
  if (main && src) {
    main.classList.add('anim-fade-in');
    main.src = src;
    window.setTimeout(() => main.classList.remove('anim-fade-in'), 450);
  }
  $$('[data-gallery-thumb]').forEach((thumb) => {
    const active = Number(thumb.dataset.galleryThumb) === index;
    thumb.setAttribute('aria-selected', String(active));
    thumb.classList.toggle('border-ink', active);
    thumb.classList.toggle('border-line', !active);
  });
};

export const initProductDetails = () => {
  const detail = $('[data-product-detail]');
  const notFound = $('[data-product-not-found]');
  if (!detail) return;

  const id = new URLSearchParams(window.location.search).get('id');
  const product = id ? products.find((item) => item.id === id) : null;

  if (!product) {
    detail.classList.add('hidden');
    notFound?.classList.remove('hidden');
    $('[data-related-section]')?.classList.add('hidden');
    const crumb = $('[data-product-crumb]');
    if (crumb) crumb.textContent = 'Unknown product';
    document.title = 'Product not found — VYROX';
    return;
  }

  trackRecentlyViewed(product.id);
  detail.innerHTML = detailHtml(product);
  initReveals(detail);

  const crumb = $('[data-product-crumb]');
  if (crumb) crumb.textContent = product.name;
  document.title = `${product.name} — VYROX`;

  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', product.description.slice(0, 155));

  /* gallery */
  $$('[data-gallery-thumb]').forEach((thumb) => thumb.addEventListener('click', () => setMainImage(product, Number(thumb.dataset.galleryThumb))));
  const zoomHost = $('[data-zoom-host]');
  const mainImage = $('[data-gallery-main]');
  if (zoomHost && mainImage) {
    zoomHost.addEventListener('pointermove', (event) => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches === false) return;
      const rect = zoomHost.getBoundingClientRect();
      mainImage.style.transformOrigin = `${((event.clientX - rect.left) / rect.width) * 100}% ${((event.clientY - rect.top) / rect.height) * 100}%`;
      mainImage.style.transform = 'scale(1.55)';
    });
    zoomHost.addEventListener('pointerleave', () => {
      mainImage.style.transform = '';
      mainImage.style.transformOrigin = '';
    });
  }

  /* variants */
  let color = product.colors[0]?.name;
  let size = product.sizes[0];
  const qty = $('[data-detail-qty]');
  $$('[data-detail-color]').forEach((button) => button.addEventListener('click', () => {
    color = button.dataset.detailColor;
    $$('[data-detail-color]').forEach((node) => node.setAttribute('aria-checked', String(node === button)));
    const label = $('[data-detail-color-label]');
    if (label) label.textContent = color;
  }));
  $$('[data-detail-size]').forEach((button) => button.addEventListener('click', () => {
    size = button.dataset.detailSize;
    $$('[data-detail-size]').forEach((node) => node.setAttribute('aria-checked', String(node === button)));
  }));
  $('[data-detail-dec]')?.addEventListener('click', () => { if (qty) qty.value = String(Math.max(1, Number(qty.value) - 1)); });
  $('[data-detail-inc]')?.addEventListener('click', () => { if (qty) qty.value = String(Math.min(product.stock, Number(qty.value) + 1)); });

  const add = (options) => {
    const result = store.addToCart(product.id, options);
    if (!result.ok) {
      toast(result.reason === 'stock' ? `Only ${result.available ?? product.stock} left in stock.` : 'That product is unavailable.', { type: 'error', title: 'Bag unchanged' });
      return false;
    }
    toast(`${product.name} added to your bag.`, { title: 'Added' });
    refreshCounts();
    return true;
  };

  $('[data-detail-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    add({ qty: Number(qty?.value) || 1, color, size });
  });

  $('[data-buy-now]')?.addEventListener('click', () => {
    if (add({ qty: Number(qty?.value) || 1, color, size })) window.location.href = `${root()}checkout.html`;
  });

  $('[data-review-demo]')?.addEventListener('click', () => {
    toast('Reviews open once secure accounts arrive in Phase 3.', { type: 'info', title: 'Demo only' });
  });

  /* tabs */
  const tabs = $$('[data-product-tab]');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((node) => {
      const active = node === tab;
      node.setAttribute('aria-selected', String(active));
      node.classList.toggle('border-red', active);
      node.classList.toggle('text-body', active);
      node.classList.toggle('border-transparent', !active);
      node.classList.toggle('text-subtle', !active);
    });
    $$('[data-product-panel]').forEach((panel) => panel.classList.toggle('hidden', panel.dataset.productPanel !== tab.dataset.productTab));
  }));

  /* related */
  const related = $('[data-related]');
  if (related) {
    const sameCategory = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);
    const fallback = products.filter((item) => item.category !== product.category).slice(0, 4);
    related.innerHTML = [...sameCategory, ...fallback].slice(0, 4).map(productCard).join('');
  }

  // Prime the page title breadcrumb category link
  const category = categories.find((item) => item.slug === product.category);
  if (category) document.body.dataset.productCategory = category.slug;
  void priceBlock;
};
