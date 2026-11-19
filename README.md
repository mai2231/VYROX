# VYROX — Premium General E-Commerce Platform (Phase 1)

**Your world. Your rules.** A Manila-built, premium general e-commerce storefront and admin console.

> **Status:** Phase 1 — Frontend complete. Static HTML + compiled Tailwind CSS + vanilla ES6 modules. No PHP, MySQL, Docker, or backend. Stop here until explicitly approved for Phase 2.

## Stack (Phase 1)

- HTML5, Tailwind CSS 3.4 (proper CLI build, **no Play CDN**), vanilla ES2022 modules
- Lucide Icons (inline SVG sprite, no runtime CDN), Google Fonts (Anton + Inter)
- Custom CSS keyframes (27 named animations), `prefers-reduced-motion` safe
- `node:test` + `jsdom` for logic and smoke tests
- Node 24 build/serve tooling

## Quick start

```bash
# install dependencies (one time)
npm install

# build CSS + HTML
npm run build

# build then serve on http://localhost:4173
npm start

# watch CSS during development
npm run dev

# run logic + smoke tests
npm test
```

- Build output: `dist/css/vyrox.css` and rendered HTML in the repo root (incl. `admin/`).
- Dev server: `node tools/serve.mjs` → `http://localhost:4173/`
- QA checks: `node tools/check-site.mjs`

## What was built (Phase 1)

### 19 storefront pages
`index.html`, `shop.html`, `product-details.html`, `categories.html`, `cart.html`,
`checkout.html`, `login.html`, `register.html`, `forgot-password.html`, `profile.html`,
`addresses.html`, `wishlist.html`, `orders.html`, `tracking.html`, `about.html`,
`contact.html`, `faq.html`, `privacy-policy.html`, `terms.html`

### 12 admin pages (`admin/`)
`index.html` (dashboard), `products.html`, `categories.html`, `orders.html`,
`customers.html`, `inventory.html`, `payments.html`, `reviews.html`, `coupons.html`,
`reports.html`, `settings.html`, `users.html`

### Demo data (clearly labelled `SAMPLE DATA`)
24 products across 8 categories (fashion, electronics, accessories, beauty, home,
lifestyle, sports, essentials), 10 demo orders, 8 customers, 4 coupons, 8 reviews,
4 admin users, audit log. Stored only in the browser (`localStorage` keys prefixed
`vyrox_*`).

### No fake auth
Login/register/forgot validate then redirect to `profile.html?demo=1` with a **DEMO ACCOUNT** banner. No passwords, tokens, or payment data are stored anywhere.

## Features

**Catalogue & products**
- Full product grid with image, name, price, compare-at price, discount badge, rating, stock
- Category / price / rating / stock / sale filtering with URL sync
- Sorting (featured, newest, best selling, top rated, price), load-more pagination
- Search suggestions (live) + full search results
- Product details: gallery, hover zoom, colour/size variants, quantity, add-to-bag, buy-now, specifications, reviews, related products
- Quick-view modal from any card; honest not-found state for unknown `?id=`
- Out-of-stock guard: never adds beyond available stock

**Bag & checkout**
- Sliding cart drawer + cart page, quantity controls, remove with animation
- Coupons: `VYROX10` (10% capped ₱500), `URBAN500` (₱500 off ≥ ₱3,000), `FREESHIP`; one at a time
- Shipping: ₱99 Metro Manila / ₱149 provincial, free ≥ ₱2,500 (VAT-inclusive PHP)
- 3-step checkout (details → delivery & payment → review), GCash/Maya/COD/Bank panels with QR placeholder, reference, proof upload UI
- Order placement creates a demo order (awaiting verification — never auto-marked paid) and redirects to tracking

**Account**
- Profile (sample data + DEMO banner), change-password (demo submit only), order snapshot
- Address book CRUD-in-UI with default selection (`vyrox_addresses_v1`)
- Wishlist with move-to-bag / remove / empty state

**Orders & tracking**
- Order history with 6 statuses (pending, processing, ready, shipped, delivered, cancelled)
- Tracking timeline + printable summary, honest payment wording ("Awaiting verification")
- Order reference search

**Content**
- About (manifesto, timeline, values, stats), Contact (validated form + studio details), FAQ (accordion + search), Privacy policy, Terms of service

**Admin console (demo)**
- Dashboard: KPI cards, animated DPR-aware canvas charts (revenue line, orders bar), recent orders, low stock, best sellers, audit log
- Products: search/filter table, add/edit modal, toggle status, archive, CSV export
- Categories, Customers (profile drawer + order history), Inventory (stock adjustment + low-stock alerts + log)
- Payments: manual verify/reject queue (never auto-paid), proof preview placeholder
- Reviews: approve/hide/reply moderation
- Coupons: CRUD, toggle, export
- Reports: date-range revenue/category/payment mix, CSV export
- Settings: store/payment/shipping config + demo data reset
- Users: staff table, invites, suspend/activate
- Collapsible sidebar, topbar, theme toggle, "sample data" chip on every admin page

## Animations (27 keyframes)

All present in `dist/css/vyrox.css` and used across the site:

`fadeIn`, `fadeOut`, `fadeInUp`, `fadeInDown`, `slideUp`, `slideDown`, `slideLeft`,
`slideRight`, `scaleIn`, `scaleOut`, `zoomIn`, `zoomOut`, `float`, `bounce`, `pulse`,
`shimmer`, `glow`, `rotate`, `gradientMove`, `blurIn`, `reveal`, `marquee`, `heartbeat`,
`ripple`, `borderGlow`, `textReveal`, `imageReveal`.

Applied via IntersectionObserver scroll reveals, counters, hero text reveal, floating
decoratives, marquee announcement bar, cart-drawer slide, toast slide, ripple buttons,
quick-view/scale modals, and more. Respects `prefers-reduced-motion`; loops use
`transform`/`opacity` only.

## Project structure

```
src/
  input.css                      # Tailwind base/components/utilities + custom sheets
  css/  custom.css  admin.css  animations.css   # design system, components, 27 keyframes
  js/   main.js, ui.js, navigation.js, animations.js, validation.js,
        products.js, product.js, cart.js, wishlist.js, checkout.js, orders.js,
        account.js, auth.js, shop.js, categories.js, content.js,
        admin.js, admin-products.js, admin-orders.js, admin-inventory.js, admin-misc.js
  data/ catalog.js               # 24 products, 8 categories, demo orders/customers/coupons/reviews
  pages/  *.html + admin/*.html  # 31 page bodies (front-matter @title/@desc/@page)
partials/ head.html header.html footer.html overlays.html scripts.html
            admin-head.html admin-shell.html admin-scripts.html
tools/  build-html.mjs serve.mjs check-site.mjs build-icons.mjs build-fallbacks.mjs
tests/  pricing.test.mjs store.test.mjs validation.test.mjs site.test.mjs
assets/ logo/ icons/lucide-sprite.svg images/fallback/*.svg
dist/css/vyrox.css               # compiled bundle (built output)
```

`tools/build-html.mjs` assembles static HTML from `src/partials` + `src/pages`. Generated HTML is never hand-edited.

## Test results

```
✔ pricing: 10/10  (PHP formatting, coupon caps, shipping thresholds, VAT-inclusive totals)
✔ store:   9/9   (cart add/merge/stock guard, wishlist, subscribe, admin state, theme)
✔ validation: form rules (required, email, phone-PH, postal, min, match)
✔ site:    all 33 page entries boot without throwing
```

- All 31 pages exist
- All 27 keyframes present in compiled CSS
- 0 unresolvable internal links or missing local images
- No duplicate IDs; every page has title, skip link, footer

## Remaining issues (Phase 1, known)

- Admin console is intentionally **unauthenticated** — a demonstration console only. Role enforcement and real auth arrive in Phase 3.
- Admin image "upload" is a preview-only placeholder; files are never uploaded in Phase 1.
- Product specifications and review submission are demo stubs (Phase 3 backend).
- Coupon state lives in `sessionStorage` (per-tab), not `localStorage`.
- Demo figures are sample data and reset when site data is cleared or via Admin → Settings → Reset demo.
- No live courier/shipping integration (Phase 4).

## Phase gate

Per the development plan, Phase 1 ends here. **Do not proceed to Phase 2 (backend/PHP/MySQL) or Phase 6 (Docker) without explicit approval.**
