/** Profile, address book, and account demonstration data. */
import { getDemoAccount, getAddresses, setAddresses, getOrders } from './store.js';
import { regions, demoOrders } from './data/catalog.js';
import { $, $$, icon, escapeHtml, toast, confirmDialog, money } from './ui.js';

const account = getDemoAccount();

const fillProfile = () => {
  const set = (selector, value) => $$(selector).forEach((node) => { node.textContent = value; });
  set('[data-demo-name]', `${account.firstName} ${account.lastName}`);
  set('[data-demo-first]', account.firstName);
  set('[data-demo-last]', account.lastName);
  set('[data-demo-email]', account.email);
  set('[data-demo-phone]', account.phone);
  set('[data-demo-since]', account.since);
  set('[data-demo-tier]', account.tier);
  set('[data-demo-points]', account.points.toLocaleString('en-PH'));
  const form = $('[data-profile-form]');
  if (form) {
    form.querySelector('[name="firstName"]').value = account.firstName;
    form.querySelector('[name="lastName"]').value = account.lastName;
    form.querySelector('[name="email"]').value = account.email;
    form.querySelector('[name="phone"]').value = account.phone;
  }
  const banner = $('[data-demo-banner]');
  if (banner && new URLSearchParams(window.location.search).get('demo') === '1') banner.classList.remove('hidden');

  const orderHost = $('[data-profile-orders]');
  if (orderHost) {
    const orders = [...getOrders(), ...demoOrders].slice(0, 3);
    orderHost.innerHTML = orders.map((order) => `
      <a href="${document.body.dataset.root || './'}tracking.html?order=${encodeURIComponent(order.id)}" class="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0 hover:text-red">
        <span class="min-w-0"><span class="block text-xs font-semibold">${escapeHtml(order.id)}</span><span class="text-[10px] text-subtle">${escapeHtml(order.date)} · ${order.items?.length ?? 0} items</span></span>
        <span class="shrink-0 text-right"><span class="block text-xs font-bold">${money(order.total)}</span><span class="text-[9px] uppercase tracking-wide2 text-subtle">${escapeHtml(order.status)}</span></span>
      </a>`).join('');
  }
};

const addressCard = (address) => `
  <article class="border ${address.isDefault ? 'border-red' : 'border-line'} bg-surface p-4" data-address-card="${address.id}">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide2">
          ${escapeHtml(address.label || 'Address')}
          ${address.isDefault ? '<span class="badge badge-red">Default</span>' : ''}
        </p>
        <p class="mt-2 text-sm font-semibold">${escapeHtml(address.name)}</p>
        <p class="text-xs text-subtle">${escapeHtml(address.phone)}</p>
      </div>
      <div class="flex gap-1">
        <button type="button" class="icon-btn !h-8 !w-8" data-address-edit="${address.id}" aria-label="Edit address">${icon('settings', 'h-4 w-4')}</button>
        <button type="button" class="icon-btn !h-8 !w-8 hover:text-red" data-address-delete="${address.id}" aria-label="Delete address">${icon('trash-2', 'h-4 w-4')}</button>
      </div>
    </div>
    <p class="mt-3 text-xs leading-relaxed text-subtle">${escapeHtml(address.line1)}${address.line2 ? `<br>${escapeHtml(address.line2)}` : ''}<br>${escapeHtml(address.city)}, ${escapeHtml(address.region)} ${escapeHtml(address.postal)}</p>
    <div class="mt-4 flex items-center gap-2">
      ${address.isDefault
        ? '<span class="text-[10px] font-semibold uppercase tracking-wide2 text-red">Ships here by default</span>'
        : `<button type="button" class="btn btn-outline btn-sm" data-address-default="${address.id}">Make default</button>`}
    </div>
  </article>`;

const renderAddresses = () => {
  const host = $('[data-address-list]');
  if (!host) return;
  const list = getAddresses();
  host.innerHTML = list.map(addressCard).join('');
  $('[data-address-empty]')?.classList.toggle('hidden', list.length > 0);
  $$('[data-address-count]').forEach((node) => { node.textContent = String(list.length); });
};

const addressForm = () => $('[data-address-form]');

const openAddressForm = (address = null) => {
  const form = addressForm();
  if (!form) return;
  form.classList.remove('hidden');
  form.dataset.editing = address?.id ?? '';
  $('[data-address-form-title]').textContent = address ? 'Edit address' : 'New address';
  const set = (name, value) => { const field = form.querySelector(`[name="${name}"]`); if (field) field.value = value ?? ''; };
  set('label', address?.label ?? '');
  set('fullName', address?.name ?? account.firstName + ' ' + account.lastName);
  set('phone', address?.phone ?? account.phone);
  set('line1', address?.line1 ?? '');
  set('line2', address?.line2 ?? '');
  set('city', address?.city ?? '');
  set('region', address?.region ?? 'Metro Manila');
  set('postal', address?.postal ?? '');
  form.querySelector('[name="isDefault"]').checked = Boolean(address?.isDefault);
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  form.querySelector('[name="line1"]')?.focus();
};

const saveAddress = (form) => {
  const data = new FormData(form);
  const list = getAddresses();
  const editing = form.dataset.editing;
  const address = {
    id: editing || `ADR-${Date.now()}`,
    label: String(data.get('label') || 'Address'),
    name: String(data.get('fullName') || ''),
    phone: String(data.get('phone') || ''),
    line1: String(data.get('line1') || ''),
    line2: String(data.get('line2') || ''),
    city: String(data.get('city') || ''),
    region: String(data.get('region') || 'Metro Manila'),
    postal: String(data.get('postal') || ''),
    isDefault: data.get('isDefault') === 'on'
  };
  let next = editing ? list.map((item) => (item.id === editing ? address : item)) : [...list, address];
  if (address.isDefault) next = next.map((item) => ({ ...item, isDefault: item.id === address.id }));
  if (!next.some((item) => item.isDefault) && next.length) next[0].isDefault = true;
  setAddresses(next);
  form.classList.add('hidden');
  form.reset();
  renderAddresses();
  toast(editing ? 'Address updated.' : 'Address added to this browser.', { title: 'Address book' });
};

export const initAccount = () => {
  if ($('[data-profile-page]')) {
    fillProfile();
    document.addEventListener('vyrox:form-valid', (event) => {
      const form = event.target;
      if (form.matches('[data-profile-form]')) {
        event.preventDefault();
        toast('Profile changes are demonstration-only until Phase 3.', { type: 'info', title: 'Not saved' });
      }
      if (form.matches('[data-password-form]')) {
        event.preventDefault();
        toast('Password changes require the secure PHP backend.', { type: 'info', title: 'Phase 3' });
        form.reset();
      }
    });
  }

  if ($('[data-address-list]')) {
    renderAddresses();
    $$('[data-region-select]').forEach((select) => {
      select.innerHTML = regions.map((region) => `<option>${region}</option>`).join('');
    });

    document.addEventListener('click', async (event) => {
      if (event.target.closest('[data-address-new]')) openAddressForm();
      if (event.target.closest('[data-address-cancel]')) addressForm()?.classList.add('hidden');
      const edit = event.target.closest('[data-address-edit]');
      if (edit) openAddressForm(getAddresses().find((item) => item.id === edit.dataset.addressEdit));
      const del = event.target.closest('[data-address-delete]');
      if (del) {
        const ok = await confirmDialog({ title: 'Delete address?', body: 'This address will be removed from the demo address book.', confirmLabel: 'Delete', danger: true });
        if (!ok) return;
        setAddresses(getAddresses().filter((item) => item.id !== del.dataset.addressDelete));
        renderAddresses();
        toast('Address deleted.', { type: 'info' });
      }
      const makeDefault = event.target.closest('[data-address-default]');
      if (makeDefault) {
        setAddresses(getAddresses().map((item) => ({ ...item, isDefault: item.id === makeDefault.dataset.addressDefault })));
        renderAddresses();
        toast('Default shipping address updated.', { type: 'success' });
      }
    });

    document.addEventListener('vyrox:form-valid', (event) => {
      if (event.target.matches('[data-address-form]')) {
        event.preventDefault();
        saveAddress(event.target);
      }
    });
  }
};
