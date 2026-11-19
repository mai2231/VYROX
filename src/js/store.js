/**
 * VYROX demo persistence layer.
 * Only non-sensitive demonstration data is stored in localStorage.
 * Phase 4 replaces this module's reads/writes with PHP/MySQL-backed endpoints.
 */
import { products } from './data/catalog.js';

export const CART_KEY = 'vyrox_cart_v1';
export const WISH_KEY = 'vyrox_wishlist_v1';
export const THEME_KEY = 'vyrox_theme_v1';
export const ADMIN_KEY = 'vyrox_admin_v1';
export const ORDERS_KEY = 'vyrox_orders_v1';
export const ADDRESS_KEY = 'vyrox_addresses_v1';
export const RECENTLY_VIEWED_KEY = 'vyrox_recently_viewed_v1';
export const COMPARE_KEY = 'vyrox_compare_v1';

const listeners = new Set();
const memory = new Map();

const storage = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const read = (key, fallback) => {
  const s = storage();
  if (s) {
    try {
      const raw = s.getItem(key);
      if (raw != null) return JSON.parse(raw);
    } catch {
      /* corrupt demo storage falls back */
    }
    return fallback;
  }
  return memory.has(key) ? memory.get(key) : fallback;
};

const write = (key, value) => {
  const s = storage();
  if (!s) {
    memory.set(key, value);
    return;
  }
  try {
    s.setItem(key, JSON.stringify(value));
  } catch {
    memory.set(key, value);
  }
};

const findProduct = (id) => products.find((p) => p.id === id) ?? null;
const variantKey = (id, color, size) => `${id}|${color ?? ''}|${size ?? ''}`;

const rawCart = () => {
  const value = read(CART_KEY, []);
  return Array.isArray(value) ? value.filter((line) => line && findProduct(line.id)) : [];
};

const rawWishlist = () => {
  const value = read(WISH_KEY, []);
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
};

const emit = (reason) => {
  const detail = { reason, cart: getCart(), wishlist: getWishlist() };
  listeners.forEach((fn) => {
    try {
      fn(detail);
    } catch (error) {
      console.error('[vyrox store] subscriber failed', error);
    }
  });
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new window.CustomEvent('vyrox:change', { detail }));
  }
};

export const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getCart = () => rawCart().map((line) => {
  const product = findProduct(line.id);
  return {
    ...line,
    product,
    name: product.name,
    price: product.price,
    compareAt: product.compareAt,
    image: product.images[0],
    stock: product.stock,
    category: product.category
  };
}).filter((line) => line.product);

export const cartCount = () => rawCart().reduce((n, line) => n + Number(line.qty || 0), 0);

export const addToCart = (id, { qty = 1, color, size } = {}) => {
  const product = findProduct(id);
  if (!product) return { ok: false, reason: 'missing' };
  if (!product.stock) return { ok: false, reason: 'stock', product };

  const chosenColor = color ?? product.colors[0]?.name ?? '';
  const chosenSize = size ?? product.sizes[0] ?? '';
  const key = variantKey(id, chosenColor, chosenSize);
  const cart = rawCart();
  const existing = cart.find((line) => line.key === key);
  const nextQty = (existing?.qty ?? 0) + Math.max(1, Number(qty) || 1);

  if (nextQty > product.stock) {
    return { ok: false, reason: 'stock', available: product.stock, product };
  }

  if (existing) {
    existing.qty = nextQty;
  } else {
    cart.push({ key, id, qty: Math.min(nextQty, product.stock), color: chosenColor, size: chosenSize });
  }

  write(CART_KEY, cart);
  emit('cart:add');
  return { ok: true, key, qty: nextQty, product };
};

export const updateQty = (key, qty) => {
  const cart = rawCart();
  const line = cart.find((item) => item.key === key);
  if (!line) return { ok: false, reason: 'missing' };
  const product = findProduct(line.id);
  const next = Math.min(Math.max(0, Number(qty) || 0), product?.stock ?? 0);

  if (next <= 0) {
    const rest = cart.filter((item) => item.key !== key);
    write(CART_KEY, rest);
    emit('cart:remove');
    return { ok: true, removed: true };
  }

  line.qty = next;
  write(CART_KEY, cart);
  emit('cart:qty');
  return { ok: true, qty: next };
};

export const removeItem = (key) => {
  const cart = rawCart().filter((line) => line.key !== key);
  write(CART_KEY, cart);
  emit('cart:remove');
};

export const clearCart = () => {
  write(CART_KEY, []);
  emit('cart:clear');
};

export const getWishlist = () => rawWishlist();
export const isWishlisted = (id) => rawWishlist().includes(id);

export const toggleWishlist = (id) => {
  const list = rawWishlist();
  const exists = list.includes(id);
  const next = exists ? list.filter((item) => item !== id) : [id, ...list];
  write(WISH_KEY, next);
  emit('wishlist');
  return !exists;
};

export const clearWishlist = () => {
  write(WISH_KEY, []);
  emit('wishlist');
};

/* ------------------------------------------------------------------ theme */
export const getTheme = () => {
  const stored = read(THEME_KEY, null);
  if (stored === 'dark' || stored === 'light') return stored;
  try {
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const setTheme = (theme) => {
  const value = theme === 'dark' ? 'dark' : 'light';
  write(THEME_KEY, value);
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', value === 'dark');
    document.documentElement.dataset.theme = value;
  }
  return value;
};

export const toggleTheme = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');

/* ------------------------------------------------------------ demo orders */
export const getOrders = () => {
  const value = read(ORDERS_KEY, []);
  return Array.isArray(value) ? value : [];
};

export const addOrder = (order) => {
  const orders = [order, ...getOrders()];
  write(ORDERS_KEY, orders);
  return order;
};

export const getDemoAccount = () => ({
  firstName: 'Mika',
  lastName: 'Reyes',
  email: 'mika.reyes@example.com',
  phone: '+63 917 420 8841',
  since: 'March 2025',
  tier: 'VYROX Red',
  points: 1840,
  demo: true
});

/* --------------------------------------------------------------- addresses */
const defaultAddresses = [
  { id: 'ADR-1', label: 'Home', name: 'Mika Reyes', phone: '+63 917 420 8841', line1: 'Unit 12B, The Meridian', line2: '42 Kalayaan Avenue', city: 'Makati City', region: 'Metro Manila', postal: '1210', isDefault: true },
  { id: 'ADR-2', label: 'Studio', name: 'Mika Reyes', phone: '+63 917 420 8841', line1: '7F, 88 Esteban Street', line2: 'Legazpi Village', city: 'Makati City', region: 'Metro Manila', postal: '1229', isDefault: false }
];

export const getAddresses = () => {
  const value = read(ADDRESS_KEY, null);
  return Array.isArray(value) ? value : defaultAddresses;
};

export const setAddresses = (addresses) => {
  write(ADDRESS_KEY, addresses);
  return addresses;
};

/* ----------------------------------------------------------- demo admin state */
const defaultAdminState = () => ({
  storeName: 'VYROX',
  supportEmail: 'care@vyrox.ph',
  currency: 'PHP',
  shippingFee: 99,
  provincialFee: 149,
  freeShipping: 2500,
  codEnabled: true,
  gcashEnabled: true,
  mayaEnabled: true,
  bankEnabled: true,
  maintenance: false,
  orderStatus: {},
  stock: {},
  coupons: [],
  reviews: {},
  settings: {}
});

export const getAdminState = () => {
  const stored = read(ADMIN_KEY, null);
  return { ...defaultAdminState(), ...(stored && typeof stored === 'object' ? stored : {}) };
};

export const setAdminState = (patch) => {
  const next = { ...getAdminState(), ...(patch ?? {}) };
  write(ADMIN_KEY, next);
  return next;
};

export const resetAdminState = () => {
  const next = defaultAdminState();
  write(ADMIN_KEY, next);
  return next;
};

export const resetDemo = () => {
  [CART_KEY, WISH_KEY, ADMIN_KEY, ORDERS_KEY, ADDRESS_KEY, RECENTLY_VIEWED_KEY, COMPARE_KEY].forEach((key) => {
    memory.delete(key);
    try {
      storage()?.removeItem(key);
    } catch {
      /* noop */
    }
  });
  emit('reset');
};

/* ---------------------------------------------------------- recently viewed */
export const getRecentlyViewed = () => {
  const value = read(RECENTLY_VIEWED_KEY, []);
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
};

export const addRecentlyViewed = (id) => {
  if (!id) return;
  const list = getRecentlyViewed().filter((existing) => existing !== id);
  const next = [id, ...list].slice(0, 8);
  write(RECENTLY_VIEWED_KEY, next);
  emit('recently-viewed');
};

export const clearRecentlyViewed = () => {
  write(RECENTLY_VIEWED_KEY, []);
  emit('recently-viewed');
};

/* ------------------------------------------------------------ comparison */
export const COMPARE_MAX = 4;

export const getCompared = () => {
  const value = read(COMPARE_KEY, []);
  return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
};

export const isCompared = (id) => getCompared().includes(id);

export const addCompared = (id) => {
  if (!id) return { added: false, list: getCompared() };
  const list = getCompared();
  if (list.includes(id)) return { added: false, list };
  if (list.length >= COMPARE_MAX) return { added: false, list, reason: 'max' };
  const next = [...list, id];
  write(COMPARE_KEY, next);
  emit('compare');
  return { added: true, list: next };
};

export const removeCompared = (id) => {
  write(COMPARE_KEY, getCompared().filter((existing) => existing !== id));
  emit('compare');
};

export const clearCompared = () => {
  write(COMPARE_KEY, []);
  emit('compare');
};
