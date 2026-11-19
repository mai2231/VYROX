# VYROX — Phase 1 Report

**Date:** 17 November 2026  
**Branch:** `phase-1-frontend` (all work uncommitted)  
**Gate:** STOP — awaiting explicit approval before Phase 2.

## Deliverable summary

Complete Phase 1 frontend: 19 storefront pages + 12 admin pages = **31 pages**, built as static HTML from `src/partials` + `src/pages`, with one compiled Tailwind CSS bundle (`dist/css/vyrox.css`) and vanilla ES6 modules. Demo data throughout, clearly labelled `SAMPLE DATA`. No PHP, MySQL, Docker, React/Vue/Bootstrap, and no Tailwind Play CDN.

## Completed pages

**Storefront (19):** index, shop, product-details, categories, cart, checkout, login, register, forgot-password, profile, addresses, wishlist, orders, tracking, about, contact, faq, privacy-policy, terms.

**Admin console (12):** admin/index (dashboard), admin/products, admin/categories, admin/orders, admin/customers, admin/inventory, admin/payments, admin/reviews, admin/coupons, admin/reports, admin/settings, admin/users.

## Built features

- Catalogue grid with image/name/price/compare-at/discount badge/rating/stock; category/price/rating/stock/sale filtering with URL sync; sorting; load-more; live search suggestions
- Product details: gallery, hover zoom, colour/size variants, qty, add-to-bag, buy-now, specs, reviews, related products; honest not-found state; out-of-stock guard
- Quick-view modal, wishlist toggle, cart drawer + page, coupon form (`VYROX10`, `URBAN500`, `FREESHIP`, one at a time)
- Shipping ₱99 Metro Manila / ₱149 provincial, free ≥ ₱2,500; VAT-inclusive PHP; totals reconcile across drawer/cart/checkout
- 3-step checkout, GCash/Maya/COD/Bank panels with QR placeholder + reference + proof upload; order placement → demo order (awaiting verification, never auto-paid) → tracking
- Profile (demo banner), change-password (demo), address book CRUD, order snapshot
- Order history (6 statuses), tracking timeline + printable summary, reference search
- About, Contact (validated form), FAQ (accordion + search), Privacy policy, Terms
- Admin: dashboard KPIs + animated DPR-aware canvas charts, products/categories/customers/inventory/payments/reviews/coupons/reports/settings/users, CSV exports, demo-state persistence under `vyrox_admin_v1`, reset control
- Collapsible sidebar, topbar, theme toggle, "sample data" chip, mobile drawer

## Animations

All **27 required keyframes** present and used: fadeIn, fadeOut, fadeInUp, fadeInDown, slideUp, slideDown, slideLeft, slideRight, scaleIn, scaleOut, zoomIn, zoomOut, float, bounce, pulse, shimmer, glow, rotate, gradientMove, blurIn, reveal, marquee, heartbeat, ripple, borderGlow, textReveal, imageReveal. Applied via IntersectionObserver scroll reveals, counters, hero text reveal, marquee bar, drawer slide, toast slide, ripple, modals. Respects `prefers-reduced-motion`; loops use transform/opacity only.

## Test results

| Suite | Result |
|-------|--------|
| `tests/pricing.test.mjs` | 10/10 pass |
| `tests/store.test.mjs` | 9/9 pass |
| `tests/validation.test.mjs` | pass |
| `tests/site.test.mjs` | all 33 page entries boot cleanly |
| `tools/check-site.mjs` | 31/31 pages, 27/27 keyframes, 0 broken internal links/images, no duplicate IDs |

## Remaining issues (known, Phase 1)

- Admin console is unauthenticated — demonstration only; real auth/RBAC in Phase 3
- Admin image upload is preview-only (no file storage in Phase 1)
- Product specs and review submission are demo stubs
- Coupon state in `sessionStorage` (per-tab)
- No live courier/shipping/payment integration (Phase 4)
- All work is **uncommitted** on branch `phase-1-frontend`

## How to run

```bash
npm install          # one time
npm run build        # CSS + HTML
npm start            # build + serve http://localhost:4173
npm test             # logic + smoke tests
node tools/check-site.mjs   # QA checks
```

## Next step (requires explicit approval)

Phase 2: frontend testing across 360/768/1024/1440, fix any issues found, then Phase 3: secure PHP 8 + MySQL 8 backend. Do **not** start Phase 2/3 without approval.
