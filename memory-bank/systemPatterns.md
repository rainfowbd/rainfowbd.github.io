# RainFow Bangladesh — System Patterns

---

## Partials Contract
**Engine:** `assets/js/include.js`
- **Placeholder:** `<div data-include="partials/header.html"></div>` (and footer)
- **Fetch options:** `fetch(url, { cache: 'no-cache' })` — no caching, always fresh
- **Injection:** `el.outerHTML = html` — replaces placeholder with partial's outer HTML
- **Event dispatched:** `document.dispatchEvent(new CustomEvent('includes:loaded'))` after all partials load
- **Post-load wiring (in `includes:loaded` handler):**
  1. `wireMobileMenu()` — toggles `#mobile-menu` via `#mobile-menu-btn`
  2. `wireFooterYear()` — sets `#footer-year` to current year
  3. `wireCategoryDropdown()` — toggles `.cat-dropdown-menu` on `.cat-dropdown-toggle` click; closes on outside click
  4. `wireAddToCart()` — delegates `[data-add-to-cart]` clicks → `window.RainFowCart.add(product)`
  5. `renderCartPreview()` — reads `localStorage.rainfow_cart`, updates header counts + preview dropdown
- **Re-render hook:** `window.RainFow.renderCartPreview()` exposed; called on `rainfow:cart-updated` and `storage` events

---

## Script Load Order (verified across 3 pages)

### `index.html` (head)
```html
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/hero-slider.css">
<link rel="stylesheet" href="assets/css/promo-modal.css">
<script src="assets/js/include.js"></script>
<script src="assets/js/hero-slider.js"></script>
<script src="assets/js/promo-modal.js"></script>
<script src="assets/js/products.js"></script>
<script src="assets/js/catalog.js"></script>
<script src="assets/js/cart.js"></script>
```

### `products.html` (head)
```html
<link rel="stylesheet" href="assets/css/style.css">
<script src="assets/js/include.js"></script>
<script src="assets/js/products-page.js"></script>
<script src="assets/js/catalog.js"></script>
<script src="assets/js/cart.js"></script>
```

### `product.html` (head)
```html
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/product.css">
<script src="assets/js/include.js"></script>
<script src="assets/js/product-page.js"></script>
<script src="assets/js/product-zoom.js"></script>
<script src="assets/js/product-reviews.js"></script>
<script src="assets/js/product-similar.js"></script>
<script src="assets/js/catalog.js"></script>
<script src="assets/js/cart.js"></script>
```

### `cart.html` (head)
```html
<link rel="stylesheet" href="assets/css/style.css">
<script src="assets/js/include.js"></script>
<script src="assets/js/cart-page.js"></script>
<script src="assets/js/cart.js"></script>
```

### `services.html` (head + inline)
```html
<link rel="stylesheet" href="assets/css/style.css">
<!-- inline <style> block with .svc-page tokens + all component CSS -->
<script src="assets/js/include.js"></script>
<!-- inline <script> at </body> for survey, lang, form -->
```

### `about.html` (head)
```html
<link rel="stylesheet" href="assets/css/style.css">
<!-- inline <style> block with .about-page CSS -->
<script src="assets/js/include.js"></script>
<script src="assets/js/app.js"></script>
```

**Pattern:** `include.js` always first (loads partials → dispatches `includes:loaded`). Page-specific JS after. `cart.js` on all commerce pages. `catalog.js` where product data needed.

---

## CSS Scoping Rule — Page-Root Classes
Every top-level page owns a **page-root class** on a wrapper element. All page-specific styles must be nested under this class (or in a page-specific CSS file loaded only on that page).

| Page-Root Class | Owner Page | Defined In |
|-----------------|------------|------------|
| `.products-page` | `products.html` | `style.css:1073` |
| `.product-page` | `product.html` | `style.css:1136` **AND** `product.css:7` — **CONFLICT** |
| `.cart-page` | `cart.html` | `style.css:1277` |
| `.svc-page` | `services.html` | Inline `<style>` (line 32) — **only owner** |
| `.about-page` | `about.html` | Inline `<style>` (line 36) — **only owner** |
| `.error-page` | All error pages | `style.css:1597` |
| `.hero-promo-section` | `index.html` | `hero-slider.css:8` |

**Rule:** New page → add unique page-root class. Do not reuse `.product-page` across files.

---

## localStorage Keys (exhaustive grep of all .js/.html)

| Key | Pattern | Writers | Readers | TTL / Scope |
|-----|---------|---------|---------|-------------|
| `rainfow_cart` | exact | `cart.js:write()`, `cart-page.js`, `include.js` | `cart.js:read()`, `cart-page.js`, `include.js:renderCartPreview()` | Persistent |
| `rainfow_reviews_<SKU>` | prefix | `product-reviews.js:writeLocal()` | `product-reviews.js:readLocal()` | Persistent per SKU |
| `rainfow_survey` | exact | `services.html` inline script | `services.html` inline script | Persistent |
| `rainfow_lang` | exact | `services.html` inline script | `services.html` inline script | Persistent |
| `rainfow_promo_seen_v1` | exact | `promo-modal.js` | `promo-modal.js` | Session (`sessionStorage`) |
| `rainfow_v4_manifest` | prefix `rainfow_v4_` | `catalog.js:lsSet()` | `catalog.js:lsGet()` | 6h TTL |
| `rainfow_v4_categories` | prefix | `catalog.js` | `catalog.js` | 6h TTL |
| `rainfow_v4_chunk-<n>` | prefix | `catalog.js` | `catalog.js` | 6h TTL |

**No other localStorage keys found.**

---

## Catalog Pipeline (exists: scripts + workflow)
- **Script:** `scripts/snapshot-catalog.mjs` (Node 20, ES modules)
  - Reads from Supabase REST API (`SD_SUPABASE_URL`, `SD_SUPABASE_SERVICE_KEY` env vars)
  - Normalizes products (sku→id, title→name, images[], specifications, pricingMode, etc.)
  - Chunks products (default 24 per file) → `data/catalog-1.json`, `catalog-2.json`, ...
  - Writes `data/manifest.json` (totals, chunks[], featuredIds[], generatedAt, version)
  - Writes `data/categories.json` (tree, visible, topLevel, withProducts, counts)
  - Wipes old `catalog-*.json` before write
- **Workflow:** `.github/workflows/snapshot-catalog.yml`
  - Trigger: schedule `0 */6 * * *` (every 6h UTC) + `workflow_dispatch`
  - Runs on `ubuntu-latest`, Node 20
  - Commits changed `data/*.json` back to repo with `[skip ci]`
- **Client consumption:** `assets/js/catalog.js` (v4) — loads manifest → chunks on demand → localStorage cache (6h TTL, prefix `rainfow_v4_`). **No Supabase calls from browser.**

---

## Relative-Path Rule
**All asset references must be relative** (no absolute `https://rainfowbd.com/...` in HTML/JS/CSS).
- Scripts: `<script src="assets/js/...">`
- Styles: `<link rel="stylesheet" href="assets/css/...">`
- Images: `<img src="images/logo.svg">`, `<img src="data/catalog-1.json">` (fetch)
- Partials: `data-include="partials/header.html"`
- JSON fetches: `fetch('data/manifest.json')`, `fetch('data/catalog-1.json')`
- Verified: grep for `href="http` and `src="http` in all HTML → only external CDNs (fonts, images, Tailwind) and WhatsApp links

---

## Local-Testing Rule
**Never open via `file://`** — CORS blocks `fetch()` for partials and JSON.
- Use: `python -m http.server 8000`, VS Code Live Server, `npx serve`, or any static HTTP server
- Test on `http://localhost:8000` (or similar)

---

## Protected Files List (NEVER modify unless explicitly requested)
From `.clinerules` section 4:
- `CNAME`
- `.nojekyll`
- `robots.txt`
- `sitemap.xml`
- `offline.html`
- HTTP Error Pages: `400.html`, `401.html`, `403.html`, `404.html`, `408.html`, `429.html`, `500.html`, `503.html`
- `.github/workflows/`