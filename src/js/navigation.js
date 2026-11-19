/** Sticky navigation, mega menu, mobile menu and live search suggestions. */
import { $, $$, escapeHtml, icon, root } from './ui.js';
import { products, categories } from './data/catalog.js';

export const initNavigation = () => {
  const header = $('[data-header]');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      header?.classList.toggle('shadow-lift', window.scrollY > 12);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const wrap = $('[data-mega-wrap]');
  const trigger = $('[data-mega-trigger]');
  const panel = $('[data-mega-panel]');
  if (wrap && trigger && panel) {
    let closeTimer;
    const setOpen = (open) => {
      trigger.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('mega-open', open);
    };
    const open = () => {
      window.clearTimeout(closeTimer);
      setOpen(true);
    };
    const close = () => {
      closeTimer = window.setTimeout(() => setOpen(false), 120);
    };
    wrap.addEventListener('pointerenter', open);
    wrap.addEventListener('pointerleave', close);
    trigger.addEventListener('click', () => setOpen(trigger.getAttribute('aria-expanded') !== 'true'));
    trigger.addEventListener('focus', open);
    panel.addEventListener('pointerenter', open);
    panel.addEventListener('pointerleave', close);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (!wrap.contains(event.target) && !panel.contains(event.target)) setOpen(false);
    });
  }

  const searchInput = $('[data-search-input]');
  const results = $('[data-search-results]');
  if (searchInput && results) {
    let timer;
    const render = (term) => {
      const value = term.trim().toLowerCase();
      if (value.length < 2) {
        results.innerHTML = `
          <div class="grid gap-2 sm:grid-cols-4">
            ${categories.slice(0, 4).map((category) => `<a href="${root()}shop.html?category=${category.slug}" class="border border-line p-3 text-xs font-semibold transition hover:border-red hover:text-red">${escapeHtml(category.name)}<span class="mt-1 block text-[10px] font-normal text-subtle">${category.count} pieces</span></a>`).join('')}
          </div>`;
        return;
      }
      const matches = products.filter((product) => `${product.name} ${product.categoryName}`.toLowerCase().includes(value)).slice(0, 5);
      results.innerHTML = matches.length
        ? `<p class="mb-2 text-[10px] font-bold uppercase tracking-brand text-subtle">${matches.length} quick result${matches.length === 1 ? '' : 's'}</p>
          <ul class="divide-y divide-line border-y border-line">
            ${matches.map((product) => `
              <li><a href="${root()}product-details.html?id=${encodeURIComponent(product.id)}" class="flex items-center gap-3 py-3 transition hover:bg-panel">
                <img src="${product.images[0]}" alt="" class="h-12 w-12 object-cover" loading="lazy" onerror="this.src='${root()}assets/images/fallback/${product.category}.svg'">
                <span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">${escapeHtml(product.name)}</span><span class="block text-[10px] uppercase tracking-wide2 text-subtle">${escapeHtml(product.categoryName)}</span></span>
                <span class="text-xs font-semibold">₱${product.price.toLocaleString('en-PH')}</span>
              </a></li>`).join('')}
          </ul>
          <a href="${root()}shop.html?q=${encodeURIComponent(term.trim())}" class="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide2 text-red">View all results ${icon('arrow-right', 'h-4 w-4')}</a>`
        : `<div class="border border-line p-8 text-center"><p class="font-display text-xl uppercase">No match yet</p><p class="mt-2 text-xs text-subtle">Try a category, product name or a shorter word.</p></div>`;
    };
    render('');
    searchInput.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => render(searchInput.value), 120);
    });
    document.addEventListener('vyrox:search-opened', () => {
      searchInput.focus();
      render(searchInput.value);
    });
  }

  // Close the account menu on Escape.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const menu = $('[data-account-menu]');
    menu?.classList.add('invisible', 'opacity-0', 'translate-y-2');
    $('[data-account-toggle]')?.setAttribute('aria-expanded', 'false');
  });
};

export const initYear = () => {
  $$('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });
};
