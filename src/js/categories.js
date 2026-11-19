/** Categories index: category tiles and a featured rail per category. */
import { $, escapeHtml, icon, root } from './ui.js';
import { categories, products } from './data/catalog.js';
import { productCard } from './products.js';

const tile = (category, index) => {
  const count = products.filter((product) => product.category === category.slug).length;
  return `
  <article class="group border border-line bg-surface" data-reveal>
    <a href="${root()}shop.html?category=${category.slug}" class="block">
      <div class="relative aspect-[16/10] overflow-hidden bg-panel">
        <img src="${category.image}" alt="" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" onerror="this.style.display='none'">
        <div class="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent"></div>
        <span class="absolute left-4 top-4 badge bg-white text-ink">0${index + 1}</span>
        <div class="absolute inset-x-4 bottom-4 flex items-end justify-between text-white">
          <div>
            <h2 class="font-display text-3xl uppercase leading-none">${escapeHtml(category.name)}</h2>
            <p class="mt-1 text-[11px] text-white/70">${escapeHtml(category.tagline)}</p>
          </div>
          <span class="flex h-9 w-9 shrink-0 items-center justify-center border border-white/30 transition group-hover:bg-red group-hover:border-red">${icon('arrow-up-right', 'h-4 w-4')}</span>
        </div>
      </div>
    </a>
    <div class="p-4">
      <div class="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide2">
        <span class="text-subtle">${count} pieces</span>
        <a href="${root()}shop.html?category=${category.slug}" class="text-red hover:underline">Shop category</a>
      </div>
    </div>
  </article>`;
};

export const initCategories = () => {
  const grid = $('[data-category-grid]');
  if (grid) grid.innerHTML = categories.map(tile).join('');
  const strips = $('[data-category-strips]');
  if (strips) {
    strips.innerHTML = categories.slice(0, 4).map((category) => {
      const list = products.filter((product) => product.category === category.slug).slice(0, 3);
      return `
      <section class="border-t border-line py-10" data-reveal>
        <div class="mb-6 flex items-end justify-between gap-4">
          <div><p class="eyebrow">Curated</p><h2 class="mt-2 font-display text-3xl uppercase">${escapeHtml(category.name)}</h2></div>
          <a href="${root()}shop.html?category=${category.slug}" class="text-[10px] font-bold uppercase tracking-wide2 text-red">View all ${icon('arrow-right', 'inline h-3 w-3')}</a>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">${list.map(productCard).join('')}</div>
      </section>`;
    }).join('');
  }
};
