/** Shared UI mechanics: counters, drawers, modals, toasts, theme, focus. */
import * as store from './store.js';
import { formatPHP } from './pricing.js';

export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
export const root = () => document.body?.dataset.root || './';
export const icon = (name, cls = 'h-5 w-5') => `<svg class="${cls}" aria-hidden="true"><use href="${root()}assets/icons/lucide-sprite.svg#i-${name}"></use></svg>`;
export const money = formatPHP;

export const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const stars = (rating = 0, cls = '') => {
  const full = Math.round(Number(rating));
  return `<span class="rating ${cls}" aria-label="${rating} out of 5 stars">${Array.from({ length: 5 }, (_, i) => `<svg viewBox="0 0 24 24" class="${i < full ? '' : 'empty'}" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`).join('')}</span>`;
};

const scrim = () => $('[data-scrim]');
const overlayIds = ['cart-drawer', 'mobile-menu', 'search-panel'];
let lastTrigger = null;
let openOverlay = null;

const lockScroll = (lock) => document.body.classList.toggle('overflow-hidden', lock);

export const refreshCounts = () => {
  const cart = store.cartCount();
  $$('[data-cart-count]').forEach((node) => {
    node.textContent = String(cart);
    node.classList.toggle('hidden', cart === 0);
  });
  $$('[data-cart-count-drawer]').forEach((node) => { node.textContent = String(cart); });
  const wish = store.getWishlist().length;
  $$('[data-wishlist-count]').forEach((node) => {
    node.textContent = String(wish);
    node.classList.toggle('hidden', wish === 0);
  });
  $$('[data-cart-checkout]').forEach((node) => {
    node.setAttribute('aria-disabled', cart === 0 ? 'true' : 'false');
    node.classList.toggle('pointer-events-none', cart === 0);
    node.classList.toggle('opacity-40', cart === 0);
  });
};

export const showScrim = () => {
  const node = scrim();
  if (!node) return;
  node.hidden = false;
  node.classList.remove('hidden');
  node.classList.add('anim-fade-in');
};

export const hideScrim = () => {
  const node = scrim();
  if (!node) return;
  node.hidden = true;
  node.classList.add('hidden');
};

export const closeOverlays = ({ restoreFocus = true } = {}) => {
  overlayIds.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.classList.remove('is-open', 'translate-x-0', 'translate-y-0');
    if (id === 'cart-drawer' || id === 'mobile-menu') node.classList.add(id === 'cart-drawer' ? 'translate-x-full' : '-translate-x-full');
    if (id === 'search-panel') node.classList.add('-translate-y-full');
    node.setAttribute('aria-hidden', 'true');
  });
  const menuTrigger = $('[data-menu-open]');
  if (menuTrigger) menuTrigger.setAttribute('aria-expanded', 'false');
  const cartTrigger = $('[data-cart-open]');
  if (cartTrigger) cartTrigger.setAttribute('aria-expanded', 'false');
  hideScrim();
  lockScroll(false);
  openOverlay = null;
  document.dispatchEvent(new CustomEvent('vyrox:overlay-closed'));
  if (restoreFocus && lastTrigger instanceof HTMLElement) lastTrigger.focus({ preventScroll: true });
};

const openPanel = (id, trigger) => {
  closeOverlays({ restoreFocus: false });
  const node = document.getElementById(id);
  if (!node) return;
  lastTrigger = trigger ?? document.activeElement;
  node.setAttribute('aria-hidden', 'false');
  node.classList.remove('translate-x-full', '-translate-x-full', '-translate-y-full');
  node.classList.add('is-open');
  if (id === 'search-panel') node.classList.remove('-translate-y-full');
  else node.classList.add('translate-x-0');
  showScrim();
  lockScroll(true);
  openOverlay = node;
  const target = node.querySelector('input:not([type="hidden"]), button, a[href]');
  window.setTimeout(() => target?.focus({ preventScroll: true }), 120);
};

export const openCart = () => {
  openPanel('cart-drawer', document.activeElement);
  $('[data-cart-open]')?.setAttribute('aria-expanded', 'true');
};

export const openMenu = () => {
  openPanel('mobile-menu', document.activeElement);
  $('[data-menu-open]')?.setAttribute('aria-expanded', 'true');
};

export const openSearch = () => {
  openPanel('search-panel', document.activeElement);
  $('[data-search-input]')?.focus();
  document.dispatchEvent(new CustomEvent('vyrox:search-opened'));
};

export const toast = (message, { type = 'success', title = '' } = {}) => {
  const host = $('[data-toast-host]');
  if (!host) return;
  const palette = {
    success: ['bg-emerald-500', 'check'],
    error: ['bg-red', 'alert-circle'],
    info: ['bg-ink', 'info']
  }[type] ?? ['bg-ink', 'info'];
  const node = document.createElement('div');
  node.className = 'toast anim-slide-left';
  node.setAttribute('role', type === 'error' ? 'alert' : 'status');
  node.innerHTML = `
    <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center ${palette[0]} text-white">${icon(palette[1], 'h-3.5 w-3.5')}</span>
    <div class="min-w-0 flex-1">
      ${title ? `<p class="text-[11px] font-bold uppercase tracking-wide2">${escapeHtml(title)}</p>` : ''}
      <p class="text-xs leading-relaxed text-subtle">${escapeHtml(message)}</p>
    </div>
    <button type="button" class="text-subtle transition hover:text-body" aria-label="Dismiss notification">${icon('x', 'h-4 w-4')}</button>`;
  node.querySelector('button').addEventListener('click', () => node.remove());
  host.appendChild(node);
  window.setTimeout(() => {
    node.classList.add('anim-fade-out');
    window.setTimeout(() => node.remove(), 350);
  }, 4200);
};

/* ------------------------------------------------------------------ modals */
export const openModal = (id) => {
  const node = document.getElementById(id);
  if (!node) return;
  lastTrigger = document.activeElement;
  node.classList.remove('hidden');
  node.classList.add('flex');
  lockScroll(true);
  const focusable = node.querySelector('input, select, textarea, button:not([data-quickview-close])');
  window.setTimeout(() => focusable?.focus({ preventScroll: true }), 60);
  document.dispatchEvent(new CustomEvent('vyrox:modal-open', { detail: { id } }));
};

export const closeModal = (id) => {
  const node = document.getElementById(id);
  if (!node) return;
  node.classList.add('hidden');
  node.classList.remove('flex');
  lockScroll(false);
  if (lastTrigger instanceof HTMLElement) lastTrigger.focus({ preventScroll: true });
  document.dispatchEvent(new CustomEvent('vyrox:modal-close', { detail: { id } }));
};

export const confirmDialog = ({ title = 'Are you sure?', body = '', confirmLabel = 'Confirm', danger = false } = {}) => new Promise((resolve) => {
  const modal = $('[data-confirm-modal]');
  if (!modal) return resolve(window.confirm(`${title}\n\n${body}`));
  $('[data-confirm-title]', modal).textContent = title;
  $('[data-confirm-body]', modal).textContent = body;
  const ok = $('[data-confirm-ok]', modal);
  const cancel = $('[data-confirm-cancel]', modal);
  ok.textContent = confirmLabel;
  ok.classList.toggle('btn-primary', !danger);
  ok.classList.toggle('btn-dark', danger);
  const finish = (value) => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    lockScroll(false);
    ok.replaceWith(ok.cloneNode(true));
    cancel.replaceWith(cancel.cloneNode(true));
    resolve(value);
  };
  const freshOk = $('[data-confirm-ok]', modal);
  const freshCancel = $('[data-confirm-cancel]', modal);
  freshOk.addEventListener('click', () => finish(true), { once: true });
  freshCancel.addEventListener('click', () => finish(false), { once: true });
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  freshCancel.focus();
});

/* ------------------------------------------------------------------- theme */
export const applyTheme = () => {
  const theme = store.setTheme(store.getTheme());
  $$('[data-theme-toggle]').forEach((btn) => btn.setAttribute('aria-pressed', String(theme === 'dark')));
  return theme;
};

export const initUI = () => {
  applyTheme();
  refreshCounts();
  store.subscribe(refreshCounts);

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, a');
    if (!target) return;
    if (target.matches('[data-cart-open]')) { event.preventDefault(); openCart(); }
    if (target.matches('[data-cart-close]')) { event.preventDefault(); closeOverlays(); }
    if (target.matches('[data-menu-open]')) { event.preventDefault(); openMenu(); }
    if (target.matches('[data-menu-close]')) { event.preventDefault(); closeOverlays(); }
    if (target.matches('[data-search-open], [data-search-trigger]')) { event.preventDefault(); openSearch(); }
    if (target.matches('[data-search-close]')) { event.preventDefault(); closeOverlays(); }
    if (target.matches('[data-quickview-close]')) { event.preventDefault(); closeModal('quick-view'); }
    if (target.matches('[data-theme-toggle]')) {
      event.preventDefault();
      store.toggleTheme();
      applyTheme();
      toast(store.getTheme() === 'dark' ? 'Dark mode on.' : 'Light mode on.', { type: 'info' });
    }
    if (target.matches('[data-scrim]')) closeOverlays();
  });

  scrim()?.addEventListener('click', () => closeOverlays());

  const account = $('[data-account-menu]');
  const accountBtn = $('[data-account-toggle]');
  accountBtn?.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = account.classList.toggle('is-open');
    account.classList.toggle('invisible', !open);
    account.classList.toggle('opacity-0', !open);
    account.classList.toggle('translate-y-2', !open);
    accountBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (!account || account.contains(event.target) || accountBtn?.contains(event.target)) return;
    account.classList.add('invisible', 'opacity-0', 'translate-y-2');
    account.classList.remove('is-open');
    accountBtn?.setAttribute('aria-expanded', 'false');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (openOverlay) closeOverlays();
    $$('.fixed.flex[id]').forEach((node) => {
      if (!node.classList.contains('hidden') && node.id !== 'site-header') closeModal(node.id);
    });
  });

  // focus trap for overlay panels and modals
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const panel = openOverlay ?? $('.fixed.flex[role="dialog"]:not(.hidden)');
    if (!panel) return;
    const focusables = $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', panel)
      .filter((node) => node.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  $$('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  // sync demo cart across tabs
  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('vyrox_')) {
      refreshCounts();
      document.dispatchEvent(new CustomEvent('vyrox:store-sync'));
    }
  });
};
