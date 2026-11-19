/** Admin catalogue: product table, product editor, categories. */
import { $, $$, escapeHtml, icon, money, toast, confirmDialog } from './ui.js';
import { products, categories as catalogCategories } from './data/catalog.js';
import { getAdminState, setAdminState } from './store.js';
import { exportCsv } from './admin.js';

const fallbackImage = (slug) => `${document.body.dataset.root || '../'}assets/images/fallback/${slug || 'product'}.svg`;

const categoryName = (slug) => catalogCategories.find((category) => category.slug === slug)?.name ?? slug;

const state = { search: '', category: 'all', stock: 'all', status: 'all' };

const adminState = () => getAdminState();
const overrides = () => adminState().products ?? {};
const newProducts = () => adminState().newProducts ?? [];

const mergedProducts = () => [...newProducts(), ...products].map((product) => {
  const patch = overrides()[product.id] ?? {};
  const merged = { ...product, ...patch };
  merged.categoryName = merged.categoryName || categoryName(merged.category);
  merged.status = merged.status || 'published';
  merged.stock = Number(merged.stock ?? 0);
  merged.price = Number(merged.price ?? 0);
  return merged;
});

const saveProducts = (list) => setAdminState({ newProducts: list });

const statusBadge = (status) => {
  const map = {
    published: 'status status-delivered',
    draft: 'status status-pending',
    archived: 'status status-cancelled'
  };
  return `<span class="${map[status] ?? map.draft}">${escapeHtml(status)}</span>`;
};

const row = (product) => `
  <tr data-product-row="${escapeHtml(product.id)}">
    <td>
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-panel">
          <img src="${escapeHtml(product.images?.[0] ?? fallbackImage(product.category))}" alt="" class="h-full w-full object-cover" loading="lazy" onerror="this.src='${fallbackImage(product.category)}';this.onerror=null">
        </span>
        <div class="min-w-0">
          <p class="truncate text-xs font-semibold">${escapeHtml(product.name)}</p>
          <p class="text-[10px] text-subtle">${escapeHtml(product.id)}</p>
        </div>
      </div>
    </td>
    <td class="hidden md:table-cell"><span class="text-[11px]">${escapeHtml(product.categoryName)}</span></td>
    <td class="text-right font-semibold">${money(product.price)}</td>
    <td class="text-right"><span class="text-xs font-semibold ${product.stock < 5 ? 'text-red' : product.stock <= 12 ? 'text-amber-600 dark:text-amber-300' : ''}">${product.stock}</span></td>
    <td class="hidden sm:table-cell">${statusBadge(product.status)}</td>
    <td class="text-right">
      <div class="flex justify-end gap-1">
        <button type="button" class="icon-btn !h-8 !w-8" data-product-edit="${escapeHtml(product.id)}" aria-label="Edit ${escapeHtml(product.name)}">${icon('pencil', 'h-3.5 w-3.5')}</button>
        <button type="button" class="icon-btn !h-8 !w-8 hover:text-red" data-product-delete="${escapeHtml(product.id)}" aria-label="Archive ${escapeHtml(product.name)}">${icon('trash-2', 'h-3.5 w-3.5')}</button>
      </div>
    </td>
  </tr>`;

const render = () => {
  const body = $('[data-admin-products-body]');
  if (!body) return;
  const query = state.search.trim().toLowerCase();
  const list = mergedProducts().filter((product) => {
    if (product.status === 'archived' && state.status !== 'archived' && state.status !== 'all') return false;
    if (state.status !== 'all' && product.status !== state.status) return false;
    if (state.category !== 'all' && product.category !== state.category) return false;
    if (state.stock === 'low' && product.stock > 12) return false;
    if (state.stock === 'out' && product.stock > 0) return false;
    if (query && !`${product.name} ${product.id} ${product.categoryName}`.toLowerCase().includes(query)) return false;
    return true;
  });
  body.innerHTML = list.map(row).join('');
  const empty = $('[data-admin-products-empty]');
  empty?.classList.toggle('hidden', list.length > 0);
  $$('[data-admin-products-count]').forEach((node) => { node.textContent = String(list.length); });
};

const modal = () => $('[data-product-modal]');

const openModal = (product = null) => {
  const panel = modal();
  if (!panel) return;
  panel.classList.add('is-open');
  panel.dataset.editing = product?.id ?? '';
  $('[data-product-modal-title]').textContent = product ? 'Edit product' : 'New product';
  const form = $('[data-product-form]');
  const set = (name, value) => {
    const field = form?.querySelector(`[name="${name}"]`);
    if (field) field.value = value ?? '';
  };
  set('name', product?.name ?? '');
  set('category', product?.category ?? catalogCategories[0].slug);
  set('price', product?.price ?? '');
  set('stock', product?.stock ?? '');
  set('status', product?.status ?? 'draft');
  set('description', product?.description ?? '');
  form?.querySelector('[name="name"]')?.focus();
};

const closeModal = () => modal()?.classList.remove('is-open');

const submitProduct = (form) => {
  const data = new FormData(form);
  const id = form.closest('[data-product-modal]')?.dataset.editing || '';
  const patch = {
    name: String(data.get('name') || 'Untitled product').trim(),
    category: String(data.get('category') || 'general'),
    categoryName: categoryName(String(data.get('category') || 'general')),
    price: Math.max(0, Number(data.get('price')) || 0),
    stock: Math.max(0, Math.round(Number(data.get('stock')) || 0)),
    status: String(data.get('status') || 'draft'),
    description: String(data.get('description') || '').trim()
  };
  const extras = newProducts();
  if (!id) {
    const created = {
      ...patch,
      id: `demo-${Date.now()}`,
      images: [fallbackImage(patch.category)],
      colors: [],
      sizes: [],
      rating: 0,
      reviewCount: 0,
      sold: 0,
      badge: 'NEW',
      demo: true
    };
    saveProducts([created, ...extras]);
    toast(`${created.name} added to the demo catalogue.`, { title: 'Product created' });
  } else if (extras.some((item) => item.id === id)) {
    saveProducts(extras.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    toast('Demo product updated.', { title: 'Saved' });
  } else {
    setAdminState({ products: { ...overrides(), [id]: { ...(overrides()[id] ?? {}), ...patch } } });
    toast('Product changes saved to the demo console.', { title: 'Saved' });
  }
  closeModal();
  render();
};

export const initAdminProducts = () => {
  if (!$('[data-admin-products-body]')) return;
  render();

  $('[data-admin-product-search]')?.addEventListener('input', (event) => { state.search = event.target.value; render(); });
  $('[data-admin-product-category]')?.addEventListener('change', (event) => { state.category = event.target.value; render(); });
  $('[data-admin-product-stock]')?.addEventListener('change', (event) => { state.stock = event.target.value; render(); });
  $('[data-admin-product-status]')?.addEventListener('change', (event) => { state.status = event.target.value; render(); });

  $('[data-admin-product-new]')?.addEventListener('click', () => openModal());
  $$('[data-product-modal-close], [data-product-modal-cancel]').forEach((button) => button.addEventListener('click', closeModal));
  modal()?.addEventListener('click', (event) => { if (event.target === modal()) closeModal(); });

  $('[data-product-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitProduct(event.target);
  });

  $('[data-admin-products-export]')?.addEventListener('click', () => {
    exportCsv('vyrox-products.csv', [
      ['ID', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Sold'],
      ...mergedProducts().map((product) => [product.id, product.name, product.categoryName, product.price, product.stock, product.status, product.sold ?? 0])
    ]);
  });

  document.addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-product-edit]');
    if (edit) { openModal(mergedProducts().find((product) => product.id === edit.dataset.productEdit)); return; }
    const del = event.target.closest('[data-product-delete]');
    if (!del) return;
    const id = del.dataset.productDelete;
    const product = mergedProducts().find((item) => item.id === id);
    const ok = await confirmDialog({ title: 'Archive product?', body: `${product?.name ?? 'This product'} will be hidden from the demo storefront. Sample data only.`, confirmLabel: 'Archive', danger: true });
    if (!ok) return;
    if (newProducts().some((item) => item.id === id)) saveProducts(newProducts().filter((item) => item.id !== id));
    else setAdminState({ products: { ...overrides(), [id]: { ...(overrides()[id] ?? {}), status: 'archived' } } });
    toast('Product archived in the demo catalogue.', { type: 'info', title: 'Archived' });
    render();
  });
};

/* -------------------------------------------------------------- categories */
const categoryRows = () => {
  const admin = adminState();
  const added = admin.newCategories ?? [];
  const statuses = admin.categoryStatus ?? {};
  return [...catalogCategories, ...added].map((category) => ({
    ...category,
    status: statuses[category.slug] ?? 'active',
    count: products.filter((product) => product.category === category.slug).length
  }));
};

const renderCategories = () => {
  const body = $('[data-admin-categories-body]');
  if (!body) return;
  const query = String($('[data-admin-category-search]')?.value ?? '').trim().toLowerCase();
  const list = categoryRows().filter((category) => !query || `${category.name} ${category.slug}`.toLowerCase().includes(query));
  body.innerHTML = list.map((category) => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center bg-panel">${icon(category.icon || 'package', 'h-4 w-4')}</span>
          <div><p class="text-xs font-semibold">${escapeHtml(category.name)}</p><p class="text-[10px] text-subtle">/shop.html?category=${escapeHtml(category.slug)}</p></div>
        </div>
      </td>
      <td class="hidden md:table-cell text-[11px] text-subtle">${escapeHtml(category.tagline || '—')}</td>
      <td class="text-right font-semibold">${category.count}</td>
      <td><span class="status ${category.status === 'active' ? 'status-delivered' : 'status-cancelled'}">${escapeHtml(category.status)}</span></td>
      <td class="text-right">
        <button type="button" class="btn btn-outline btn-sm" data-category-toggle="${escapeHtml(category.slug)}">${category.status === 'active' ? 'Hide' : 'Show'}</button>
      </td>
    </tr>`).join('');
  const empty = $('[data-admin-categories-empty]');
  empty?.classList.toggle('hidden', list.length > 0);
  $$('[data-admin-categories-count]').forEach((node) => { node.textContent = String(list.length); });
};

export const initAdminCategories = () => {
  if (!$('[data-admin-categories-body]')) return;
  renderCategories();

  $('[data-admin-category-search]')?.addEventListener('input', renderCategories);

  $('[data-admin-category-new]')?.addEventListener('click', () => {
    const panel = $('[data-category-modal]');
    panel?.classList.add('is-open');
    $('[data-category-form]')?.reset();
    $('[data-category-form] [name="name"]')?.focus();
  });
  $$('[data-category-modal-close], [data-category-modal-cancel]').forEach((button) => button.addEventListener('click', () => $('[data-category-modal]')?.classList.remove('is-open')));

  $('[data-category-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const name = String(data.get('name') || '').trim();
    if (!name) return;
    const slug = String(data.get('slug') || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const admin = adminState();
    const added = admin.newCategories ?? [];
    setAdminState({ newCategories: [...added, { slug, name, tagline: String(data.get('tagline') || '').trim(), icon: 'package', count: 0 }] });
    $('[data-category-modal]')?.classList.remove('is-open');
    event.target.reset();
    renderCategories();
    toast(`${name} added to the demo category list.`, { title: 'Category created' });
  });

  document.addEventListener('click', (event) => {
    const toggle = event.target.closest('[data-category-toggle]');
    if (!toggle) return;
    const admin = adminState();
    const statuses = { ...(admin.categoryStatus ?? {}) };
    statuses[toggle.dataset.categoryToggle] = statuses[toggle.dataset.categoryToggle] === 'hidden' ? 'active' : 'hidden';
    setAdminState({ categoryStatus: statuses });
    renderCategories();
    toast('Category visibility updated in this browser.', { type: 'info', title: 'Demo category' });
  });
};
