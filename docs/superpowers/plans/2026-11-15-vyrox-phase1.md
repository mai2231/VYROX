# VYROX Phase 1 Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the complete VYROX storefront (19 pages) and admin console (12 pages) as static HTML + compiled Tailwind + ES modules, with working demo commerce and a 27-keyframe animation system.

**Architecture:** Node build script assembles static HTML from partials and page bodies; Tailwind 3.4 CLI compiles one CSS bundle from `src/input.css` (which imports `custom.css` and `animations.css`); ES modules own state (localStorage), rendering, and interactions. No runtime templating, no CDN Tailwind, no fake auth.

**Tech Stack:** HTML5, Tailwind CSS 3.4 + postcss-import, vanilla ES2022 modules, Lucide icons (inline SVG sprite, no runtime CDN), Node 24 build/serve tooling, `node:test` + jsdom for logic/DOM tests.

**Spec:** `docs/superpowers/specs/2026-11-15-vyrox-phase1-design.md`

## Global Constraints

- Brand: VYROX, tagline "YOUR WORLD. YOUR RULES." Tokens: ink `#111111`, red `#E31B32`, charcoal `#1C1C1F`, white `#FFFFFF`, muted `#A1A1AA`, soft `#F5F5F5`.
- No PHP, MySQL, Docker, React/Vue/Bootstrap/jQuery, no Play CDN.
- No passwords/tokens/payment data in storage; only demo cart, wishlist, theme, admin-demo state.
- All demo figures labelled `SAMPLE DATA`. Payment is never auto-marked paid.
- PHP currency formatted `en-PH`; VAT-inclusive. Shipping ₱99 Metro Manila / ₱149 provincial, free ≥ ₱2,500. Coupons: `VYROX10` 10% (cap ₱500), `URBAN500` ₱500 off ≥ ₱3,000, `FREESHIP`; one at a time.
- Pages responsive at 360/768/1024/1440; WCAG 2.1 AA text contrast; reduced-motion respected.
- Generated root/admin HTML is never hand-edited; `npm run build` is deterministic.

## Review Focus

- Cart totals must reconcile identically across drawer, cart page, checkout, demo order and tracking (same `pricing.js`), including coupon caps and free-shipping threshold.
- Quick view / add-to-cart on out-of-stock or variant products must never add an invalid line; stock is checked at add time.
- `product-details.html` with a missing/unknown `?id=` must show an honest not-found state, not a broken page.
- Empty states (cart, wishlist, orders, admin tables) must render intentionally, not blank containers.
- Keyboard and mobile: Esc closes drawers/modals, focus returns to trigger, mobile menu traps scroll, and every icon-only control has an accessible name.

---

### Task 0: Toolchain and build skeleton

**Files:** Create `package.json`, `tailwind.config.js`, `postcss.config.js` (only if CLI needs it), `src/input.css`, `tools/build-html.mjs`, `tools/serve.mjs`, `.gitignore`, `README.md`.

**Interfaces:** Produces `npm run build` (CSS + HTML), `npm run dev`, `npm start` on `http://localhost:4173`, `npm test`.

- [ ] Step 1: `git init`; write `package.json` scripts and devDeps `tailwindcss@3.4.17`, `jsdom`.
- [ ] Step 2: `npm install`; verify Tailwind binary runs.
- [ ] Step 3: Write `src/input.css` with `@tailwind base/components/utilities` and `@import` of the two custom sheets; config content globs `./*.html`, `./admin/*.html`, `./src/**/*.{html,js}`.
- [ ] Step 4: Write `tools/build-html.mjs` placeholder that fails loudly if `src/pages` is missing; write static server.
- [ ] Step 5: `npm run build` → `dist/css/vyrox.css` exists and contains `.btn` (after Task 1). Commit.

### Task 1: Design system, brand assets, animation library

**Files:** Create `src/css/custom.css`, `src/css/animations.css`, `assets/logo/{logo,logo-white,logo-red,favicon,mobile-mark}.svg`, `assets/images/fallback/*.svg`, `assets/icons/lucide-sprite.svg`; modify `src/input.css`.

**Interfaces:** Produces CSS tokens `--color-ink|red|charcoal|white|muted|soft`, component classes `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.input`, `.label`, `.card`, `.badge`, `.chip`, `.section-eyebrow`, `.nav-link`, `.qty-control`, `.data-table`, `.skeleton`, `.field-error`, `.demo-chip`, and animation utilities `.anim-*` + `.reveal` states.

- [ ] Step 1: Define tokens (light/dark), base typography (Anton display, Inter UI), focus rings, selection, scrollbar, utilities.
- [ ] Step 2: Build logo SVGs: angular notch wordmark + monogram; favicon 32px; verify each opens.
- [ ] Step 3: Write all 27 keyframes with utilities and `@media (prefers-reduced-motion: reduce)` kill-switch; stagger helpers.
- [ ] Step 4: Add fallback SVGs per category (fashion, electronics, accessories, beauty, home, lifestyle, sports, general).
- [ ] Step 5: `npm run build`; `node -e` check asserts 27 keyframe names present in `dist/css/vyrox.css`. Commit.

### Task 2: Layout generator and shared chrome

**Files:** Create `src/partials/{head,announcement,header,footer,overlays,scripts}.html`, `src/pages/index.html`; modify `tools/build-html.mjs`.

**Interfaces:** Build maps `src/pages/**/*.html` → `./**/*.html`; page files carry front-matter comment `<!--@title: … @desc: … @page: home @root: ./-->`; partial tokens `{{TITLE}}`, `{{DESC}}`, `{{PAGE}}`, `{{ROOT}}`, `{{BODY}}`, `{{YEAR}}`.

- [ ] Step 1: Write generator with token replacement, nav active state, admin-vs-storefront base stub.
- [ ] Step 2: Header: announcement bar, logo, mega-menu triggers, search trigger, account/wishlist/cart with counters, sticky on scroll, mobile menu.
- [ ] Step 3: Footer: newsletter, 4 link columns, payment marks, legal row.
- [ ] Step 4: Overlays: cart drawer, search panel, toast host, mobile nav, quick-view modal shell, cookie/banner slot.
- [ ] Step 5: Generate `index.html`; serve and fetch 200; assert nav/footer/cart markers exist. Commit.

### Task 3: Demo catalogue, pricing, and store modules

**Files:** Create `src/js/data/catalog.js`, `src/js/pricing.js`, `src/js/store.js`, `tests/pricing.test.mjs`, `tests/store.test.mjs`.

**Interfaces:**
- `catalog.js`: `categories[{slug,name,tagline,image,fallback}]`, `products[{id,name,slug,category,brand,price,compareAt,rating,reviewCount,stock,badge,colors,sizes,images,description,specs,featured,isNew,bestSeller,createdAt}]`, `getProduct(id)`, `queryProducts({q,category,min,max,rating,inStock,sort,page,perPage})`, plus `demoOrders`, `demoCustomers`, `demoCoupons`, `demoReviews`, `demoAdminUsers`, `demoLog` and `img(photoId,w)` helper.
- `pricing.js`: `formatPHP(n)`, `lineTotal(item)`, `subtotal(items)`, `couponFor(code)`, `discountFor(coupon, sub)`, `shippingFor(region, sub, coupon)`, `totals({items,coupon,region}) → {subtotal,discount,shipping,total,itemCount}`.
- `store.js`: `getCart/addToCart/updateQty/removeItem/clearCart`, `getWishlist/toggleWishlist`, `getTheme/setTheme`, `getAdminState/setAdminState`, `subscribe(fn)`, `CART_KEY/WISH_KEY/THEME_KEY/ADMIN_KEY`, item `{key,id,qty,color,size}`.
- Stock guard: `addToCart` returns `{ok:false,reason:'stock'}` when qty would exceed `product.stock`.

- [ ] Step 1: Write pricing tests (threshold, caps, FREESHIP, provincial vs metro, VAT-inclusive rounding).
- [ ] Step 2: Run tests → fail.
- [ ] Step 3: Implement `pricing.js`; run tests → pass.
- [ ] Step 4: Write store tests with a jsdom localStorage shim (add/merge variants, qty guard, remove, wishlist toggle, subscribe).
- [ ] Step 5: Implement `store.js`; tests pass. Commit.

### Task 4: Core JavaScript (UI, navigation, animations, validation, entry)

**Files:** Create `src/js/{main,ui,navigation,animations,validation}.js`; modify `src/partials/scripts.html`.

**Interfaces:**
- `ui.js`: `initUI()`, `toast(message,{type,title})`, `refreshCounts()`, `openCart()/closeCart()`, `openSearch()`, `openMenu()`, `closeOverlays()`, `openModal(id)/closeModal(id)`, `confirmDialog({title,body,confirmLabel}) → Promise<boolean>`, `initFocusTrap`.
- `animations.js`: `initReveals()`, `initCounters()`, `initTilt()`, `initMarquee()`, `animateNumber(el,to)`.
- `validation.js`: `validateForm(form) → {valid, errors}`, rules via `data-rules="required|email|phone-ph|min:8|match:#id"`, `showFieldError`, `clearFieldError`, password toggle binding.
- `navigation.js`: sticky header state, mega menu hover/focus, search expand, mobile menu, scroll lock.
- `main.js`: reads `document.body.dataset.page`, boots shared modules, dynamically imports page modules.

- [ ] Step 1: UI shell wiring (counts, theme toggle, cart drawer open/close, toasts, Esc, focus return).
- [ ] Step 2: Navigation and search (live suggestions from catalogue, Enter → shop query).
- [ ] Step 3: Reveals/counters/tilt/reduced-motion guard; validation module.
- [ ] Step 4: `main.js` routing table; add jsdom DOM test asserting cart counter updates after `addToCart`. Commit.

### Task 5: Homepage

**Files:** Modify `src/pages/index.html`; create `src/js/home.js` if needed.

**Interfaces:** Consumes catalogue, store, ui, animations. Grids: `[data-rail="trending|new|best|recommended"]` rendered by `products.js` helper.

- [ ] Step 1: Announcement + hero (animated headline, promotional panel, floating chips, CTA).
- [ ] Step 2: Category tiles (8), trending rail, limited-offer countdown, promo split banner, new arrivals, best sellers, testimonials, newsletter, trust strip.
- [ ] Step 3: Render rails from catalogue; skeleton states; verify add-to-cart/wishlist from cards.
- [ ] Step 4: Responsive check 360/768/1440; commit.

### Task 6: Shop, filters, and categories

**Files:** Modify `src/pages/{shop,categories}.html`; create `src/js/shop.js`, `src/js/categories.js`.

- [ ] Step 1: Shop sidebar (category, price range, availability, rating), toolbar (count, sort, grid/list), URL query sync, load-more, mobile filter drawer.
- [ ] Step 2: Product card renderer shared with rails (badge, rating, wishlist, quick view, add).
- [ ] Step 3: Categories page: 8 large tiles + featured per category.
- [ ] Step 4: Verify filter/sort/search combinations and empty state; commit.

### Task 7: Product details and quick view

**Files:** Modify `src/pages/product-details.html`; create `src/js/product.js`; extend `ui.js` modal.

- [ ] Step 1: Gallery with thumbnails, zoom lens, image switching; breadcrumb; price/badge/stock; color/size; qty; add/buy-now; wishlist.
- [ ] Step 2: Tabs: description, specifications, reviews (rating breakdown); related products.
- [ ] Step 3: Quick-view modal populated from card; query-param product resolution + not-found state.
- [ ] Step 4: Test unknown id, out-of-stock, variant add; commit.

### Task 8: Cart, wishlist

**Files:** Modify `src/pages/{cart,wishlist}.html`; create `src/js/cart.js`, `src/js/wishlist.js`.

- [ ] Step 1: Cart page table/cards, qty controls, remove animation, coupon form, totals panel, shipping progress, empty state, cross-tab sync.
- [ ] Step 2: Drawer line items reuse cart renderer, free-shipping progress, checkout CTA.
- [ ] Step 3: Wishlist grid, move-to-cart, remove, empty state, header counters.
- [ ] Step 4: Verify totals match pricing tests; commit.

### Task 9: Checkout, orders, tracking

**Files:** Modify `src/pages/{checkout,orders,tracking}.html`; create `src/js/checkout.js`, `src/js/orders.js`.

- [ ] Step 1: Stepper (details → delivery & payment → review), address form with PH regions, delivery options, payment method panels (GCash/Maya/COD/Bank) with QR placeholder, reference, proof upload UI.
- [ ] Step 2: Order summary, coupon, validation, place-order creates demo order in localStorage (`vyrox_orders_v1`), clears cart, redirects to tracking with reference.
- [ ] Step 3: Orders list (statuses, empty state), tracking timeline + printable summary, payment status wording (never "Paid" without verification).
- [ ] Step 4: Verify full purchase path end-to-end and totals reconcile; commit.

### Task 10: Auth and account pages

**Files:** Modify `src/pages/{login,register,forgot-password,profile,addresses}.html`; create `src/js/auth.js`, `src/js/account.js`.

- [ ] Step 1: Login/register/forgot shells with validation, password visibility, strength meter, demo notice.
- [ ] Step 2: Profile overview (`?demo=1` sample data + DEMO ACCOUNT banner), update-profile and change-password forms (demo submit), order snapshot.
- [ ] Step 3: Addresses CRUD-in-UI with default selection, persisted under `vyrox_addresses_v1`.
- [ ] Step 4: Verify no credential storage, validation errors, mobile layout; commit.

### Task 11: Content pages

**Files:** Modify `src/pages/{about,contact,faq,privacy-policy,terms}.html`.

- [ ] Step 1: About (manifesto, timeline, values, stats), Contact (form + PH details + map placeholder), FAQ (accordion + search), Privacy and Terms (anchored legal layout + TOC).
- [ ] Step 2: Contact/FAQ interactions; validate form; commit.

### Task 12: Admin shell, overview, products, categories

**Files:** Create `src/partials/admin-{head,shell,scripts}.html`, `src/pages/admin/{index,products,categories}.html`, `src/js/admin.js`, `src/js/admin-products.js`, `src/css/admin.css` (imported).

- [ ] Step 1: Admin layout (collapsible sidebar, topbar, breadcrumb, SAMPLE DATA chip, mobile drawer).
- [ ] Step 2: Overview KPIs, animated line/bar charts (canvas, DPR-aware), recent orders, low stock, best sellers.
- [ ] Step 3: Products table (search, filter, pagination, status), add/edit modal with image upload preview, variants, activate/deactivate; persisted demo state.
- [ ] Step 4: Categories table + add/edit/delete demo; commit.

### Task 13: Admin orders, payments, customers, inventory

**Files:** Create `src/pages/admin/{orders,payments,customers,inventory}.html`, `src/js/admin-orders.js`, `src/js/admin-inventory.js`.

- [ ] Step 1: Orders table filters + detail drawer with status update, invoice print view, export CSV.
- [ ] Step 2: Payments queue: verify/reject demo actions, reference, proof preview, status semantics.
- [ ] Step 3: Customers list + profile drawer + order history.
- [ ] Step 4: Inventory stock table, inline adjustment modal, low-stock alerts, log table; commit.

### Task 14: Admin reviews, coupons, reports, settings, users

**Files:** Create `src/pages/admin/{reviews,coupons,reports,settings,users}.html`, `src/js/admin-misc.js`.

- [ ] Step 1: Review moderation (approve/hide/reply demo).
- [ ] Step 2: Coupons CRUD-in-UI with usage stats; reports with date range + export buttons.
- [ ] Step 3: Settings tabs (store, payments, shipping, appearance, security), users/roles table + invite modal; reset-demo-data control.
- [ ] Step 4: Verify every admin action gives feedback and persists; commit.

### Task 15: Phase 1 QA, documentation, report

**Files:** Create `tools/check-site.mjs`, `tests/site.test.mjs`, screenshots in `docs/qa/`, update `README.md`.

- [ ] Step 1: Automated checks: all 31 pages exist; every internal href/src resolves; no duplicate ids; 27 keyframes used; each page has title/description/skip-link/nav/footer.
- [ ] Step 2: jsdom smoke: each page's referenced module loads and `data-page` boots without throwing.
- [ ] Step 3: Serve site; Playwright (or manual fallback) screenshots at 390/768/1440 of home, shop, product, checkout, admin; inspect and fix visual defects.
- [ ] Step 4: Write README (run/build/test, structure, demo credentials note, phase status) and Phase 1 report (pages, features, animations, issues, results). Commit.

## Self-Review

Coverage: all 19 storefront + 12 admin pages, payment interface, 6 statuses, animations, account demo, filters, coupons, inventory, reports, settings, users → Tasks 2–15. Gaps fixed: explicit empty-state and not-found checks added to Review Focus and Tasks 7/8/9; admin persistence and reset in Tasks 3/14; per-page a11y in Task 15.
