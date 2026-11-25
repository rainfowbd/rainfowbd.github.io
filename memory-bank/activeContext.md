# RainFow Bangladesh — Active Context

## Current Focus (from code state)
1. **`services.html` bilingual + survey** — largest single file (1646 lines), contains inline `<script>` handling language switch, survey state machine, inquiry form → WhatsApp, toast. This is the most complex page and likely the current work surface.
2. **Catalog snapshot pipeline** — `scripts/snapshot-catalog.mjs` + `.github/workflows/snapshot-catalog.yml` active (runs every 6h). `data/manifest.json` shows v3, chunkSize 24, 10 products in 1 chunk, 28 categories (7 visible).
3. **Promo modal** — `assets/js/promo-modal.js` + `assets/css/promo-modal.css` + `index.html` reference to `#promoModal` (modal markup not found in partials — unverified if injected elsewhere).
4. **Cart + product detail integration** — `product-page.js` wires "Add to cart" via `[data-add-to-cart]` on `#pd-add-to-cart`; `include.js` handles delegation.

---

## Decisions Visible in Code

### CSS Page-Root Classes (scoping)
| Class | Owner Page | Purpose |
|-------|------------|---------|
| `.products-page` | `products.html` | Catalog layout, toolbar, grid |
| `.product-page` | `product.html` (style.css) | Product detail layout |
| `.product-page` | `product.html` (product.css) — **DUPLICATE** | Single product page (gallery + info + specs + reviews + similar) |
| `.cart-page` | `cart.html` | Cart layout, summary, empty state |
| `.svc-page` | `services.html` | Entire page scoped — custom tokens, bilingual fonts |
| `.about-page` | `about.html` | About page sections |
| `.error-page` | All error pages | Centered error card |
| `.hero-promo-section` | `index.html` | Hero slider + promo banners grid |

### localStorage Keys (grepped from all .js/.html)
| Key | Source | Purpose |
|-----|--------|---------|
| `rainfow_cart` | `cart.js`, `include.js`, `cart-page.js` | Cart items array |
| `rainfow_reviews_<SKU>` | `product-reviews.js` | User-submitted reviews per product |
| `rainfow_survey` | `services.html` (inline) | Survey answers `{interested, preference, market, route, date}` |
| `rainfow_lang` | `services.html` (inline) | `"en"` or `"bn"` |
| `rainfow_promo_seen_v1` | `promo-modal.js` | Session flag to show modal once |
| `rainfow_v4_manifest` | `catalog.js` | Cached manifest (6h TTL) |
| `rainfow_v4_categories` | `catalog.js` | Cached categories (6h TTL) |
| `rainfow_v4_chunk-<n>` | `catalog.js` | Cached product chunks (6h TTL) |

### Nav Links Added (in `partials/header.html` + `partials/footer.html`)
- Header main bar: Logo → `index.html`, Search → `products.html`, Contact Us → WhatsApp, Cart → `cart.html`
- Header second nav: Home → `index.html`, Our Products → `products.html`, About Our Service → `services.html`, Category dropdown → `products.html?cat=...`, About Us → `about.html`
- Mobile drawer: same + Cart + WhatsApp
- Footer: Shop (4 category links), Customer Service (4 **broken** links), Company (5 links — 3 broken), Follow (4 social)

---

## Provable Pending TODOs (from code markers)

### Missing Assets with `onerror` Handlers
| File | Line | Issue |
|------|------|-------|
| `assets/js/products.js` | 52 | `<img onerror="this.style.display='none'">` — hides broken image but leaves empty space |
| `assets/js/products-page.js` | 54 | Same pattern |
| `assets/js/product-similar.js` | 40 | Same pattern |
| `assets/css/style.css` | 541–545 | `.cat-card-media--empty` class for empty category images — but no fallback image defined |
| `product.html` | — | No `onerror` on main gallery image (`#pd-main-image`) |

### Broken Internal Links (verified against filesystem)
**In `partials/footer.html` (injected on every page):**
- `help.html` — **does not exist**
- `orders.html` — **does not exist**
- `returns.html` — **does not exist**
- `shipping.html` — **does not exist**
- `contact.html` — **does not exist**
- `careers.html` — **does not exist**
- `blog.html` — **does not exist**

**In error pages:**
- `400.html`, `403.html`, `404.html`, `429.html`, `500.html` → `contact.html` — **does not exist**
- `401.html` → `login.html`, `register.html` — **do not exist**

**In `about.html`:**
- `href="https://rainfowbd.github.io/about.html"` (og:url) — uses github.io not custom domain

### Sitemap Gaps
` sitemap.xml` lists only 4 URLs:
- `https://rainfowbd.com/`
- `https://rainfowbd.com/products.html`
- `https://rainfowbd.com/about.html`
- `https://rainfowbd.com/cart.html`

**Missing:** `services.html`, `product.html`, `thank-you.html`, all error pages, `offline.html`

### Duplicate Class Definitions
- `.product-page` defined in both `assets/css/style.css` (lines 1136–1140) and `assets/css/product.css` (line 7) — **conflicting ownership**
- `.product-loading` in both (style.css:1142, product.css:9)
- `.btn-whatsapp` / `.btn-lg` overlap
- `.product-detail` (style.css:1149) vs `.pd-grid` (product.css:28) — different layouts for same page

### Script Loaded Twice Risk
- `include.js` loads on every page via `<div data-include="partials/header.html">` + `<div data-include="partials/footer.html">` → `include.js` included in `<head>` of each page. No guard against double execution (IIFE prevents re-declaration but `DOMContentLoaded` fires once per page — safe).
- `cart.js` included on all pages (via header/footer partials?) — check: `index.html`, `products.html`, `product.html`, `cart.html`, `about.html`, `services.html` all load `assets/js/cart.js`? **Need to verify per page script tags.**

---

## Unverified — What to Check
| Item | What to Check |
|------|---------------|
| **Promo modal markup** | `#promoModal` element — is it in `index.html` after line 248? Or injected by `promo-modal.js`? (Not in partials) |
| **Service worker** | Is there a SW registration? `offline.html` exists but no `navigator.serviceWorker.register()` found in any JS |
| **Product image CDN stability** | `data/catalog-1.json` images → `res.cloudinary.com`, `images.unsplash.com` — are these production URLs or placeholders? |
| **gtag / GA** | `promo-modal.js` calls `gtag()` but no `<script async src="https://www.googletagmanager.com/gtag/js?id=...">` in any HTML |
| **Formspree form** | `index.html` contact form `action="https://formspree.io/f/YOUR_FORM_ID_HERE"` — placeholder |
| **Survey → inquiry anchor** | `services.html` survey route `inquiry` scrolls to `#svc-inquiry` — verify that `id="svc-inquiry"` exists on the form section |
| **Bilingual font loading** | `services.html` preconnects to `fonts.gstatic.com` for `Noto Sans Bengali` — does it load correctly on slow connections? |
| **Cart script on all pages** | Which pages actually include `assets/js/cart.js`? (Needed for `window.RainFowCart` global) |