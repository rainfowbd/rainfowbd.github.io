# RainFow Bangladesh — Progress

## Working Pages (One Line Each)
| Page | Status | Notes |
|------|--------|-------|
| `index.html` | **Working** | Hero slider, promo banners, promo modal, product sections render via `products.js` |
| `about.html` | **Working** | Static content, team, values — no dynamic data |
| `services.html` | **Working** | Bilingual EN/BN, 6 accordion services, discovery survey, inquiry form → WhatsApp |
| `products.html` | **Working** | Search, category chips, sort, lazy load sentinel (single chunk), cart integration |
| `product.html` | **Working** | Gallery/zoom, specs, reviews (localStorage), similar products, OG meta, add to cart |
| `cart.html` | **Working** | Item list, qty controls, WhatsApp enquiry, cart persistence, cross-tab sync |
| `thank-you.html` | **Working** | Static confirmation (uses Tailwind CDN — anomaly) |
| Error pages (8) | **Working** | Styled, branded, WhatsApp CTAs — but link to missing `contact.html`/`login.html` |
| `offline.html` | **Unknown** | Exists but no service worker registration found |

---

## In-Progress Markers (TODO / FIXME / onerror=)

### `onerror=` Handlers (Silent Image Failures)
| File | Line | Code | Risk |
|------|------|------|------|
| `assets/js/products.js` | 52 | `onerror="this.style.display='none'"` | Hides broken image, leaves empty card media |
| `assets/js/products-page.js` | 54 | `onerror="this.style.display='none'"` | Same |
| `assets/js/product-similar.js` | 40 | `onerror="this.style.display='none'"` | Same |
| `assets/css/style.css` | 541–545 | `.cat-card-media--empty` class | No fallback image defined |

### TODO / FIXME Comments (grep)
- `catalog.js:31` — "NO Supabase calls from the browser. Ever." (documentation, not TODO)
- `products-page.js:246` — "AJAX lazy loading (currently a no-op with 1 chunk)" — sentinel exists but `hasMore()` returns false
- `products.js:14` — "Exposes window.__rfRenderDynamic() so dynamic sections added after init() can still be rendered"
- `include.js:68` — `wireAddToCart()` uses delegation — works for dynamically added cards

### Inline Script TODOs (services.html)
- Survey persistence uses `localStorage` with no TTL/cleanup
- Bilingual font load has no fallback if Google Fonts blocked
- Inquiry form validation minimal (HTML5 only)

---

## Broken Internal Links (Verified Every `<a href>` Against Filesystem)

### Critical — In Partials (Injected on Every Page)
**`partials/header.html`** — all links valid ✓

**`partials/footer.html`** — **7 BROKEN LINKS:**
| Line | HREF | Target File | Exists? |
|------|------|-------------|---------|
| 39 | `help.html` | `help.html` | ❌ NO |
| 40 | `orders.html` | `orders.html` | ❌ NO |
| 41 | `returns.html` | `returns.html` | ❌ NO |
| 42 | `shipping.html` | `shipping.html` | ❌ NO |
| 48 | `contact.html` | `contact.html` | ❌ NO |
| 49 | `careers.html` | `careers.html` | ❌ NO |
| 50 | `blog.html` | `blog.html` | ❌ NO |

**Impact:** Every page shows 7 broken footer links.

### Error Pages (Protected but Broken)
| Page | Broken HREF | Target | Exists? |
|------|-------------|--------|---------|
| `400.html:39` | `contact.html` | `contact.html` | ❌ |
| `403.html:37` | `contact.html` | `contact.html` | ❌ |
| `403.html:41` | `contact.html` | `contact.html` | ❌ |
| `404.html:46` | `contact.html` | `contact.html` | ❌ |
| `429.html:38` | `contact.html` | `contact.html` | ❌ |
| `500.html:45` | `contact.html` | `contact.html` | ❌ |
| `401.html:36` | `login.html` | `login.html` | ❌ |
| `401.html:41` | `register.html` | `register.html` | ❌ |

### Sitemap Gaps (`sitemap.xml` only lists 4 URLs)
| Missing Page | Should Be In Sitemap? |
|--------------|----------------------|
| `services.html` | YES — core page |
| `product.html` | YES — product detail (dynamic but crawlable) |
| `thank-you.html` | NO — post-action only |
| Error pages | Optional |
| `offline.html` | NO |

### Other
- `about.html:16` — `og:url` uses `https://rainfowbd.github.io/about.html` (GitHub Pages URL, not custom domain)

---

## Known Issues (Duplicate Classes, Double Loads, etc.)

### Duplicate CSS Class Definitions
| Class | File 1 | File 2 | Conflict |
|-------|--------|--------|----------|
| `.product-page` | `style.css:1136` | `product.css:7` | Two different layouts for same page |
| `.product-loading` | `style.css:1142` | `product.css:9` | Duplicate |
| `.btn-whatsapp` / `.btn-lg` | `style.css:1253` | `product.css:239` | Similar purpose, different names |
| `.product-detail` vs `.pd-grid` | `style.css:1149` | `product.css:28` | Different grid structures |

### Script Loading
- `include.js` loads on every page via `<head>` — IIFE prevents re-declaration, safe
- `cart.js` loads on all commerce pages — exposes `window.RainFowCart` globally, safe
- `catalog.js` loads where needed — singleton `window.RainFowCatalog`, safe
- **No script loads twice on same page** (verified per page script tags)

### Promo Modal
- `index.html` references `#promoModal` (line 248) but **no such element in file** — modal markup not in partials, not in index.html. `promo-modal.js` expects `document.getElementById('promoModal')` — will return null, modal never shows. **Unverified: is it injected elsewhere?**

### gtag Not Loaded
- `promo-modal.js` calls `gtag()` but no GA snippet in any HTML → ReferenceError on modal open/close

### Formspree Placeholder
- `index.html` contact form `action="https://formspree.io/f/YOUR_FORM_ID_HERE"` — not configured

### Tailwind CDN on thank-you.html Only
- Inconsistent with zero-build philosophy; all other pages use local CSS

### Catalog Chunking Not Used
- `manifest.json` shows `chunkSize: 24`, `chunks: [{file: "catalog-1.json", count: 10}]` — only 1 chunk, 10 products. Lazy load sentinel on `products.html` is dead code.

### Survey localStorage No TTL
- `rainfow_survey` persists forever; no expiry, no versioning

### Bilingual Only on services.html
- No i18n infrastructure elsewhere; hardcoded `data-en`/`data-bn` only on services.html