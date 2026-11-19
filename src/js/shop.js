/** Shop catalogue: URL-synced filters, sorting and load-more pagination. */
import { $, $$, icon, toast } from './ui.js';
import { queryProducts } from './data/catalog.js';
import { productCard, skeletonCard } from './products.js';

const PER_PAGE = 9;
let state = { q: '', category: 'all', min: 0, max: 0, rating: 0, inStock: false, sale: false, sort: 'featured', page: 1 };
let loaded = [];

const params = () => new URLSearchParams(window.location.search);

const readUrl = () => {
  const p = params();
  state = {
    q: p.get('q') || '',
    category: p.get('category') || 'all',
    min: Number(p.get('min')) || 0,
    max: Number(p.get('max')) || 0,
    rating: Number(p.get('rating')) || 0,
    inStock: p.get('stock') === '1',
    sale: p.get('sale') === '1',
    sort: p.get('sort') || 'featured',
    page: Math.max(1, Number(p.get('page')) || 1)
  };
};

const writeUrl = () => {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  if (state.category !== 'all') p.set('category', state.category);
  if (state.min) p.set('min', state.min);
  if (state.max) p.set('max', state.max);
  if (state.rating) p.set('rating', state.rating);
  if (state.inStock) p.set('stock', '1');
  if (state.sale) p.set('sale', '1');
  if (state.sort !== 'featured') p.set('sort', state.sort);
  if (state.page > 1) p.set('page', state.page);
  const qs = p.toString();
  history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
};

const fillControls = () => {
  const search = $('[data-shop-search]');
  if (search) search.value = state.q;
  const sort = $('[data-shop-sort]');
  if (sort) sort.value = state.sort;
  $$('[data-filter-category]').forEach((node) => { node.checked = node.value === state.category || (state.category === 'all' && node.value === 'all'); });
  $$('[data-filter-rating]').forEach((node) => { node.checked = Number(node.value) === state.rating; });
  const stock = $('[data-filter-stock]');
  if (stock) stock.checked = state.inStock;
  const min = $('[data-filter-min]');
  const max = $('[data-filter-max]');
  if (min) min.value = state.min || '';
  if (max) max.value = state.max || '';
  const active = $('[data-filter-count]');
  if (active) {
    const count = [state.category !== 'all', state.min, state.max, state.rating, state.inStock, state.sale].filter(Boolean).length;
    active.textContent = String(count);
    active.classList.toggle('hidden', count === 0);
  }
};

const render = ({ append = false } = {}) => {
  const grid = $('[data-shop-grid]');
  if (!grid) return;
  if (!append) {
    grid.innerHTML = Array.from({ length: 6 }, skeletonCard).join('');
    window.setTimeout(() => draw({ append: false }), 180);
  } else {
    draw({ append: true });
  }
};

const draw = ({ append }) => {
  const grid = $('[data-shop-grid]');
  if (!grid) return;
  const result = queryProducts({ ...state, perPage: PER_PAGE, page: state.page, sale: state.sale });
  if (append) {
    const html = result.items.map(productCard).join('');
    grid.insertAdjacentHTML('beforeend', html);
    loaded = loaded.concat(result.items);
  } else {
    loaded = result.items;
    grid.innerHTML = result.items.length
      ? result.items.map(productCard).join('')
      : `<div class="col-span-full border border-line bg-surface px-6 py-16 text-center">
          <p class="font-display text-2xl uppercase">No pieces match</p>
          <p class="mx-auto mt-2 max-w-sm text-sm text-subtle">Try removing a filter, widening the price range, or searching a broader term.</p>
          <button type="button" class="btn btn-dark mt-5" data-shop-reset>Reset everything</button>
        </div>`;
  }
  const count = $('[data-shop-count]');
  if (count) count.textContent = `${result.total} product${result.total === 1 ? '' : 's'}`;
  const more = $('[data-load-more]');
  if (more) {
    more.classList.toggle('hidden', state.page >= result.pages);
    const label = more.querySelector('[data-load-label]');
    if (label) label.textContent = `Load more · ${Math.min(PER_PAGE, Math.max(0, result.total - loaded.length))} left`;
  }
  const heading = $('[data-shop-heading]');
  if (heading && state.category !== 'all') {
    const label = document.querySelector(`[data-filter-category][value="${state.category}"]`)?.dataset.label;
    if (label) heading.textContent = label;
  }
  grid.classList.toggle('grid-cols-1', grid.dataset.layout === 'list');
};

const apply = () => {
  state.page = 1;
  writeUrl();
  fillControls();
  render();
};

export const initShop = () => {
  readUrl();
  fillControls();
  render();

  $$('[data-filter-category]').forEach((node) => node.addEventListener('change', () => {
    if (!node.checked) return;
    state.category = node.value;
    apply();
  }));

  $$('[data-filter-rating]').forEach((node) => node.addEventListener('change', () => {
    state.rating = node.checked ? Number(node.value) : 0;
    apply();
  }));

  $('[data-filter-stock]')?.addEventListener('change', (event) => { state.inStock = event.target.checked; apply(); });
  $('[data-filter-sale]')?.addEventListener('change', (event) => { state.sale = event.target.checked; apply(); });

  $('[data-filter-min]')?.addEventListener('change', (event) => { state.min = Math.max(0, Number(event.target.value) || 0); apply(); });
  $('[data-filter-max]')?.addEventListener('change', (event) => { state.max = Math.max(0, Number(event.target.value) || 0); apply(); });

  $('[data-shop-sort]')?.addEventListener('change', (event) => { state.sort = event.target.value; apply(); });

  $('[data-shop-search]')?.addEventListener('change', (event) => { state.q = event.target.value.trim(); apply(); });
  $('[data-shop-search-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    state.q = $('[data-shop-search]')?.value.trim() || '';
    apply();
  });

  $('[data-load-more]')?.addEventListener('click', () => {
    state.page += 1;
    writeUrl();
    render({ append: true });
  });

  $('[data-shop-reset]')?.addEventListener('click', () => {
    state = { q: '', category: 'all', min: 0, max: 0, rating: 0, inStock: false, sale: false, sort: 'featured', page: 1 };
    apply();
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-shop-reset]')) {
      state = { q: '', category: 'all', min: 0, max: 0, rating: 0, inStock: false, sale: false, sort: 'featured', page: 1 };
      apply();
    }
  });

  const filters = $('[data-shop-filters]');
  const toggle = $('[data-shop-filter-toggle]');
  toggle?.addEventListener('click', () => {
    const open = filters.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  $('[data-shop-filter-close]')?.addEventListener('click', () => {
    filters.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  });

  const layoutButtons = $$('[data-layout]');
  layoutButtons.forEach((button) => button.addEventListener('click', () => {
    layoutButtons.forEach((node) => node.classList.toggle('chip-active', node === button));
    const grid = $('[data-shop-grid]');
    if (!grid) return;
    grid.dataset.layout = button.dataset.layout;
    grid.classList.toggle('grid-cols-1', button.dataset.layout === 'list');
    grid.classList.toggle('sm:grid-cols-2', button.dataset.layout !== 'list');
    grid.classList.toggle('lg:grid-cols-3', button.dataset.layout !== 'list');
  }));

  if (state.sale) toast('Showing sale pieces only.', { type: 'info', title: 'Sale filter' });
  void icon;
};
