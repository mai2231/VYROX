# VYROX — Phase 1 Frontend Design

Date: 2026-11-15
Status: awaiting approval
Scope: Phase 1 only (frontend). No PHP, MySQL, Docker, or real auth.

## Intent

Build the complete customer-facing storefront and admin interface for VYROX, a
premium general-purpose Philippine e-commerce platform. The result must look like
a shipped commercial product, not a school prototype: bold black/red urban identity,
real catalog interactions, working cart, wishlist, checkout demonstration, order
tracking, and a full admin console.

Why: establish the visual and interaction contract now so the Phase 3 PHP/MySQL
backend can be dropped in behind it without redesigning screens.

## Goals

- 19 storefront pages + 12 admin pages, all responsive (360 / 768 / 1024 / 1440).
- A real Tailwind build (v3.4 CLI), no Play CDN.
- Dedicated keyframe library (all 27 required animations) with reduced-motion support.
- Working demo commerce: add/update/remove cart, wishlist, coupons, filters, sorting,
  quick view, gallery, form validation, toasts, drawers, modals.
- Shared, reusable layout shells so Phase 4 can swap demo data for PHP-rendered data.
- Clearly labelled sample data everywhere (storefront demo catalogue, admin numbers).
- Zero console errors; every button/link does something real or shows an honest
  "coming in Phase 3" state.

## Non-goals / anti-goals

- No authentication, sessions, tokens, or password storage in the browser.
- No payment processing; payment UI is an interface only, never "paid" by default.
- No fabricated "live" revenue; admin figures are labelled SAMPLE DATA.
- No React/Vue/Bootstrap/jQuery, no CSS-in-JS.
- Not a static mockup: catalog, cart, wishlist, filters and admin tables must work.

## Constraints

- Windows, Node 24 / npm 11, no existing files.
- Static hosting compatibility (`file://` will not support ES modules; documented
  `npm start` static server is the supported way to view the site).
- Images: remote Unsplash CDN with local on-brand SVG fallbacks (user-selected).
- All money in PHP (₱), formatted `en-PH`.
- Phase 1 must remain unauthenticated; account screens are demonstration-only.

## Approaches considered

### A. Hand-write 31 HTML pages, shared header/footer duplicated (rejected)
Max fidelity per page, but ~1,900 lines of duplicated chrome, drift between pages,
and painful Phase 4 surgery.

### B. JS-injected header/footer on every page (rejected)
Single source of truth, but flash-of-unstyled-content, no content without JS, and a
pattern PHP would have to throw away.

### C. Static HTML generated from partials by a small Node build script (chosen)
Header, footer, announcement bar, cart drawer, search overlay, toast host, auth shell
and admin shell live once in `src/partials/`. Each page supplies only its unique
`<main>` content in `src/pages/` (admin in `src/pages/admin/`). `npm run build`
emits real static HTML at the repo root and `admin/`. Output is exactly what PHP
templates will later produce, no runtime templating, no FOUC, SEO-friendly.

### Data handling (sub-decision)
- **Chosen:** one demo catalogue module (`src/js/data/catalog.js`) + a demo-data flag,
  consumed by storefront JS renderers. Cart/wishlist in `localStorage` behind a small
  store API with events, so Phase 4 replaces the data source and checkout payload only.
- Rejected: hardcoded product markup in each page (unmaintainable, cannot filter/sort);
  JSON fetched at runtime (extra request, awkward offline, no benefit in Phase 1).

## Architecture

```
vyrox/  (repository root = C:\Users\User\Documents\E-comerce)
├─ index.html … terms.html          generated storefront pages
├─ admin/*.html                     generated admin pages
├─ src/
│  ├─ input.css                     Tailwind entry + @layer components
│  ├─ css/animations.css            keyframes + animation utilities
│  ├─ css/custom.css                tokens, base, component refinements
│  ├─ partials/                     head, storefront header/footer, admin shell, overlays
│  ├─ pages/                        page bodies (storefront + admin/)
│  └─ js/
│     ├─ main.js                    entry: boots modules per data-page
│     ├─ data/catalog.js            demo products, categories, reviews, orders
│     ├─ store.js                   cart/wishlist/theme persistence + pub/sub
│     ├─ ui.js                      header counts, drawers, toasts, modals, theme
│     ├─ navigation.js              sticky nav, mega menu, mobile menu, search
│     ├─ products.js                cards, filtering, sorting, quick view, gallery
│     ├─ cart.js                    drawer + cart page + totals
│     ├─ wishlist.js                wishlist page + heart state
│     ├─ checkout.js                steps, shipping, coupon, payment selection
│     ├─ validation.js              accessible form validation
│     ├─ animations.js              IntersectionObserver, counters, tilt, marquee
│     └─ admin.js                   sidebar, charts (canvas), tables, modals, forms
├─ assets/logo, assets/icons, assets/images
├─ tools/build-html.mjs, tools/serve.mjs
├─ dist/css/vyrox.css               compiled Tailwind + custom CSS
├─ tailwind.config.js, package.json, README.md
```

Build: `npm run build` = compile CSS (Tailwind CLI, PostCSS @import) + generate HTML.
`npm start` = build then serve on localhost:4173. `npm run dev` = CSS watch + serve.

## Design system

- Palette tokens: ink `#111111`, red `#E31B32`, charcoal `#1C1C1F`, white, muted
  `#A1A1AA`, soft `#F5F5F5`, plus derived surfaces/borders. Dark mode via
  `class="dark"` and CSS variables (theme toggle persisted).
- Type: display `Anton` (condensed uppercase headlines, tracking-tight), UI `Inter`.
- Geometry: sharp 2–4px radii, 1px borders, oversized numerals, red slash accents,
  diagonal rule motifs, no glassmorphism soup.
- Components in `@layer components`: `.btn` variants, `.input`, `.card`, `.badge`,
  `.chip`, `.section-title`, `.data-table`, `.skeleton`, `.nav-link`, `.qty-control`, etc.
- Logo family: angular notch wordmark; black, white, red, favicon, mobile monogram.

## Page inventory

Storefront (19): index, shop, product-details, categories, cart, checkout, login,
register, forgot-password, profile, addresses, wishlist, orders, tracking, about,
contact, faq, privacy-policy, terms.

Admin (12): index (overview), products, categories, orders, customers, inventory,
payments, reviews, coupons, reports, settings, users.

## Behaviour detail

- **Catalog:** 24 demo products, 8 categories, ratings, stock, variants, badges;
  filter by category/price/availability/rating, sort (featured/new/price/rating),
  search, load-more pagination, URL query sync on shop.
- **Cart:** drawer + page, quantity stepper, remove with collapse animation, free
  shipping threshold, coupon codes (`VYROX10`, `FREESHIP`, `URBAN500`), animated totals,
  persisted demo cart, cross-tab sync via `storage` event.
- **Wishlist:** persisted, animated heart, header counter, move-to-cart.
- **Checkout:** 3 steps (details → delivery/payment → review), PH regions, GCash/Maya/
  COD/Bank Transfer panels with QR placeholder + reference field + proof upload UI,
  validation, place-order demo writes a local demo order and redirects to tracking.
  No payment is ever marked paid; COD pending, e-wallet "awaiting verification".
- **Orders/tracking:** demo order list + timeline with 6 statuses, printable summary.
- **Admin:** sidebar shell, KPI cards, canvas sales chart + best sellers, searchable
  filterable tables, status modals, inventory adjustments, coupon CRUD-in-UI,
  review moderation, settings forms, role list. "SAMPLE DATA" chips on every figure.
- **Accessibility:** skip link, focus-visible rings, aria labels on icon buttons,
  dialogs with focus trap + Esc, labelled form errors, `prefers-reduced-motion`.

## Animations

All 27 keyframes in `animations.css` (fadeIn/Out, fadeInUp/Down, slideUp/Down/Left/
Right, scaleIn/Out, zoomIn/Out, float, bounce, pulse, shimmer, glow, rotate,
gradientMove, blurIn, reveal, marquee, heartbeat, ripple, borderGlow, textReveal,
imageReveal) plus utilities, stagger delays, hover/interaction states, and
IntersectionObserver reveals. Only transform/opacity animated on loop; reduced motion
disables loops and shortens transitions.

## Testing plan (Phase 1 completion evidence)

- `npm run build` clean; HTML validator-style checks for unclosed tags via script.
- Link check: every href resolves to a file or in-page anchor.
- Browser pass at 3 widths for every page; console error check.
- Interaction pass: filter/sort/search, quick view, add to cart from card/detail,
  quantity, remove, coupon, wishlist, checkout validation + place order, tracking,
  admin table filters/modals, theme toggle, mobile menu, keyboard Esc.
- Record results in README + final report; list known gaps.

## Builder-check resolutions (my calls unless marked)

1. **Product detail:** one `product-details.html?id=<slug>` rendering the catalogue
   client-side, with a sensible default product and `?id=` fallback to 404-style notice.
   24 generated product pages are out of scope for Phase 1.
2. **Admin persistence:** demo mutations persist in `localStorage` under
   `vyrox_admin_v1` (order status, stock, coupons, review moderation, settings) and
   reset via a "Reset demo data" control. All screens keep the SAMPLE DATA label.
3. **Demo account story:** no session, no token, header stays "Account". Login/register
   validate, then redirect to `profile.html?demo=1` which shows sample profile data
   behind a persistent "DEMO ACCOUNT — no real authentication in Phase 1" banner.
   Checkout step 1 prefills from that sample profile when `demo=1`.
4. **Commerce math (single `pricing.js` used by every surface):** VAT-inclusive PHP
   prices; shipping ₱99 Metro Manila / ₱149 provincial, free over ₱2,500; `VYROX10`
   = 10% off (cap ₱500); `URBAN500` = ₱500 off orders ≥ ₱3,000; `FREESHIP` waives
   shipping; one coupon at a time; COD adds no fee.
5. **Accessibility:** WCAG 2.1 AA for text and controls. Brand red is kept for large
   text, icons, and accents; a slightly lighter red (`#F0354B`) is used where small
   text sits on dark surfaces. Audited during the testing phase.
6. **Animations:** all 27 keyframes must exist *and* each one is used on at least one
   real surface; a coverage table ships in the README and is verified in testing.
7. **Fonts:** Anton + Inter via Google Fonts with preconnect, `display=swap`, and a
   matched system fallback stack. No font binaries are vendored.
8. **Deliverable:** generated HTML at the root is part of the deliverable (the site is
   openable via the documented static server). The build is deterministic and the
   README states that root/admin HTML is generated, never hand-edited.

## Risks

- Remote imagery availability → local SVG fallback + `onerror` handler.
- Volume of pages → generator + shared partials; build script catches missing pages.
- Canvas charts need DPR handling → single helper with resize observer.
