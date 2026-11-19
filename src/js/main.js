/** VYROX entry point: shared chrome first, then the page module. */
import { initUI } from './ui.js';
import { initNavigation } from './navigation.js';
import { initValidation } from './validation.js';
import { initAnimations } from './animations.js';
import { initProducts } from './products.js';
import { initCart } from './cart.js';
import { initContent } from './content.js';
import { initRecentlyViewed } from './recently-viewed.js';
import { initCompare } from './compare.js';
import { initConfirmation } from './confirmation.js';

const page = document.body.dataset.page || 'home';
const isAdmin = document.body.hasAttribute('data-admin');

initUI();
initNavigation();
initValidation();
initAnimations();
initProducts();
initCart();
initContent();
initRecentlyViewed();
initCompare();
initConfirmation();

const storefront = {
  home: () => import('./home.js').then((m) => m.initHome()),
  shop: () => import('./shop.js').then((m) => m.initShop()),
  categories: () => import('./categories.js').then((m) => m.initCategories()),
  product: () => import('./product.js').then((m) => m.initProductDetails()),
  wishlist: () => import('./wishlist.js').then((m) => m.initWishlist()),
  compare: () => import('./compare.js').then((m) => m.initCompare()),
  confirmation: () => import('./confirmation.js').then((m) => m.initConfirmation()),
  checkout: () => import('./checkout.js').then((m) => m.initCheckout()),
  orders: () => import('./orders.js').then((m) => m.initOrders()),
  tracking: () => import('./orders.js').then((m) => m.initTracking()),
  login: () => import('./auth.js').then((m) => m.initAuth()),
  register: () => import('./auth.js').then((m) => m.initAuth()),
  forgot: () => import('./auth.js').then((m) => m.initAuth()),
  profile: () => import('./account.js').then((m) => m.initAccount()),
  addresses: () => import('./account.js').then((m) => m.initAccount())
};

const adminPages = {
  index: () => import('./admin.js').then((m) => m.initAdminDashboard()),
  products: () => import('./admin-products.js').then((m) => m.initAdminProducts()),
  categories: () => import('./admin-products.js').then((m) => m.initAdminCategories()),
  orders: () => import('./admin-orders.js').then((m) => m.initAdminOrders()),
  payments: () => import('./admin-orders.js').then((m) => m.initAdminPayments()),
  customers: () => import('./admin-orders.js').then((m) => m.initAdminCustomers()),
  inventory: () => import('./admin-inventory.js').then((m) => m.initAdminInventory()),
  reviews: () => import('./admin-misc.js').then((m) => m.initAdminReviews()),
  coupons: () => import('./admin-misc.js').then((m) => m.initAdminCoupons()),
  reports: () => import('./admin-misc.js').then((m) => m.initAdminReports()),
  settings: () => import('./admin-misc.js').then((m) => m.initAdminSettings()),
  users: () => import('./admin-misc.js').then((m) => m.initAdminUsers())
};

const boot = isAdmin
  ? import('./admin.js').then((m) => m.initAdmin()).then(() => adminPages[page]?.())
  : Promise.resolve(storefront[page]?.());

boot.catch((error) => {
  console.error('[VYROX] page failed to initialise', error);
});

document.documentElement.classList.add('js-ready');
