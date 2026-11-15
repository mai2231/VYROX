/**
 * Single source of truth for VYROX money math.
 * Phase 1 prices are VAT-inclusive and computed client-side for demonstration.
 * Phase 4 MUST recalculate all of this on the server.
 */

export const FREE_SHIPPING_THRESHOLD = 2500;
export const SHIPPING_RATES = { metro: 99, provincial: 149 };

const METRO_MANILA = ['Metro Manila', 'Makati', 'Quezon City', 'Pasig', 'Taguig', 'Manila', 'Caloocan', 'Pasay', 'Parañaque', 'Muntinlupa'];

export const COUPONS = {
  VYROX10: { code: 'VYROX10', type: 'percent', value: 10, cap: 500, minimum: 0, note: '10% off, capped at ₱500' },
  URBAN500: { code: 'URBAN500', type: 'fixed', value: 500, cap: 0, minimum: 3000, note: '₱500 off orders over ₱3,000' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 0, cap: 0, minimum: 0, note: 'Free shipping nationwide' }
};

export const formatPHP = (value) => {
  const amount = Number.isFinite(Number(value)) ? Number(value) : 0;
  return `₱${Math.round(amount).toLocaleString('en-PH')}`;
};

export const lineTotal = (item) => Math.round(Number(item.price) * Number(item.qty));

export const subtotal = (items = []) => items.reduce((sum, item) => sum + lineTotal(item), 0);

export const couponFor = (code) => {
  if (!code) return null;
  return COUPONS[String(code).trim().toUpperCase()] ?? null;
};

export const discountFor = (coupon, sub) => {
  if (!coupon) return 0;
  if (sub < (coupon.minimum ?? 0)) return 0;
  if (coupon.type === 'percent') {
    const raw = Math.round((sub * coupon.value) / 100);
    return coupon.cap ? Math.min(raw, coupon.cap) : raw;
  }
  if (coupon.type === 'fixed') return Math.min(coupon.value, sub);
  return 0;
};

export const isMetro = (region = '') => METRO_MANILA.some((area) => String(region).toLowerCase().includes(area.toLowerCase()));

export const shippingFor = (region, sub, coupon) => {
  if (!sub) return 0;
  if (coupon?.type === 'shipping') return 0;
  if (sub >= FREE_SHIPPING_THRESHOLD) return 0;
  return isMetro(region) ? SHIPPING_RATES.metro : SHIPPING_RATES.provincial;
};

export const totals = ({ items = [], coupon = null, region = 'Metro Manila' } = {}) => {
  const sub = subtotal(items);
  const discount = discountFor(coupon, sub);
  const shipping = shippingFor(region, sub, coupon);
  const total = Math.max(0, sub - discount + shipping);
  return {
    subtotal: sub,
    discount,
    shipping,
    total,
    itemCount: items.reduce((n, item) => n + Number(item.qty), 0)
  };
};
