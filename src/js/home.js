/** Homepage composition: category tiles, product rails, countdown. */
import { $, escapeHtml, icon, root } from './ui.js';
import { categories, products } from './data/catalog.js';
import { initRails, productCard } from './products.js';
import { initCountdown } from './animations.js';

const categoryTile = (category, index) => `
  <a href="${root()}shop.html?category=${category.slug}" class="group relative block min-h-[220px] overflow-hidden bg-ink text-white sm:min-h-[280px]" data-reveal style="--reveal-delay:${index * 60}ms">
    <img src="${category.image}" alt="" class="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105 group-hover:opacity-70" loading="lazy" onerror="this.style.display='none'">
    <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent"></div>
    <div class="relative flex h-full flex-col justify-between p-5">
      <span class="flex items-center justify-between">
        <span class="text-[9px] font-bold uppercase tracking-brand text-white/60">0${index + 1} / Category</span>
        <span class="flex h-8 w-8 items-center justify-center border border-white/20 text-white/70 transition group-hover:border-red group-hover:bg-red group-hover:text-white">${icon('arrow-up-right', 'h-3.5 w-3.5')}</span>
      </span>
      <span>
        <span class="block font-display text-2xl uppercase leading-none sm:text-3xl">${escapeHtml(category.name)}</span>
        <span class="mt-2 block text-[11px] text-white/60">${escapeHtml(category.tagline)}</span>
        <span class="mt-3 inline-block text-[9px] font-bold uppercase tracking-wide2 text-red-bright">${category.count} pieces</span>
      </span>
    </div>
  </a>`;

export const initHome = () => {
  const tiles = $('[data-home-categories]');
  if (tiles) tiles.innerHTML = categories.map(categoryTile).join('');
  initRails();

  const rail = $('[data-home-editors]');
  if (rail) {
    const picks = [products.find((p) => p.id === 'nomad-biker-jacket'), products.find((p) => p.id === 'analog-field-camera'), products.find((p) => p.id === 'vector-pro-14-laptop')].filter(Boolean);
    rail.innerHTML = picks.map(productCard).join('');
  }

  document.querySelectorAll('[data-countdown]').forEach((node) => {
    initCountdown(node, new Date(Date.now() + 4 * 86400000 + 7 * 3600000).toISOString());
  });
};
