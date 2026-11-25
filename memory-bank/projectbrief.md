# RainFow Bangladesh — Project Brief

## What This Project Is
A pure vanilla (zero-framework, zero-bundler) e-commerce + services site for RainFow Bangladesh, deployed on GitHub Pages with custom domain `rainfowbd.com`. The site sells physical products (electronics, fashion, home, beauty) and offers B2B services (product sourcing, international shipping, website development, content/media production, branding/marketing, CRM/operations). All checkout/enquiry flows route to WhatsApp — no payment gateway, no server-side code.

## Stack
- **HTML5 / CSS3 / ES6 JavaScript** — no React, Vue, Svelte, etc.
- **No Node/npm/bundler/test-runner** — confirmed by root listing (no package.json, node_modules, webpack, vite, jest, etc.)
- **GitHub Pages hosting** — push to `main` → auto-deploy
- **Custom domain** — `rainfowbd.com` via `CNAME`
- **Jekyll bypassed** — `.nojekyll` in root
- **Supabase as CMS** — catalog snapshots via GitHub Action (`.github/workflows/snapshot-catalog.yml` runs `node scripts/snapshot-catalog.mjs` every 6h)
- **Static JSON data** — `data/catalog-*.json`, `data/categories.json`, `data/manifest.json`, `data/content.json`, `data/reviews.json`
- **Client-side partials** — `partials/header.html`, `partials/footer.html` injected via `assets/js/include.js`

## Verified Page List (7 core pages + error pages)
| Page | Purpose | JS Entry |
|------|---------|----------|
| `index.html` | Homepage — hero slider, promo banners, promo modal, featured product sections | `include.js`, `hero-slider.js`, `promo-modal.js`, `products.js`, `catalog.js`, `cart.js` |
| `about.html` | Company info, team, values | `include.js`, `app.js` |
| `services.html` | **Bilingual EN/BN** — 6 accordion services, discovery survey, inquiry form → WhatsApp | `include.js` (inline script handles survey, lang switch, form) |
| `products.html` | Product catalog — search (`?q=`), category filter (`?cat=`), sort, dynamic chips, lazy load | `include.js`, `products-page.js`, `catalog.js`, `cart.js` |
| `product.html` | Single product — gallery/zoom, specs, reviews (localStorage), similar products, OG tags | `include.js`, `product-page.js`, `product-zoom.js`, `product-reviews.js`, `product-similar.js`, `catalog.js`, `cart.js` |
| `cart.html` | Cart review, qty adjust, WhatsApp order enquiry | `include.js`, `cart-page.js`, `cart.js` |
| `thank-you.html` | Post-form confirmation (anomaly: uses Tailwind CDN) | — |

**Error pages (protected, never modify):** `400.html`, `401.html`, `403.html`, `404.html`, `408.html`, `429.html`, `500.html`, `503.html`, `offline.html`

## Non-Goals
- No server-side rendering, no backend, no database on the client
- No payment processing (all orders via WhatsApp)
- No user accounts, auth, or session management beyond localStorage cart/reviews/survey
- No build step — edit HTML/CSS/JS directly, test via local HTTP server

## Deployment
- **Push to `main` branch → GitHub Pages serves automatically**
- Custom domain `rainfowbd.com` configured via `CNAME` (content: `rainfowbd.com`)
- `.nojekyll` ensures files with leading underscores (e.g., `_headers`) and dotfiles are served
- GitHub Action `snapshot-catalog.yml` runs every 6h (0, 6, 12, 18 UTC) + manual dispatch; commits updated `data/catalog-*.json`, `data/categories.json`, `data/manifest.json` back to repo

## .nojekyll Note
Empty file in root. Required because GitHub Pages runs Jekyll by default, which ignores folders starting with `_` and files without front matter. This project uses `data/`, `partials/`, `assets/` — all safe, but `.nojekyll` is defense-in-depth.