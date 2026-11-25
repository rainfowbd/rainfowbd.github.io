# RainFow Bangladesh — Code Reference
*Staleness: 2026-11-25 (auto-generated — verify before relying)*

---

## :root Design Tokens (from `assets/css/style.css:35-64`)

```css
:root {
  /* Brand */
  --brand:        #3b82f6;
  --brand-dark:   #2563eb;
  --brand-glow:   rgba(59, 130, 246, 0.55);
  --brand-tint:   rgba(59, 130, 246, 0.12);

  /* Neutrals */
  --ink:          #111827;
  --text:         #111827;
  --muted:        #6b7280;
  --text-muted:   #6b7280;
  --line:         #e5e7eb;
  --border:       #e5e7eb;
  --border-strong:#d1d5db;
  --bg:           #ffffff;
  --bg-alt:       #f9fafb;
  --surface:      #ffffff;

  /* Header */
  --header-bg:    #000000;
  --header-line:  #1f2937;
  --header-mid:   #232f3e;

  /* Utility */
  --whatsapp:     #25d366;
  --page-gutter:  20px;
}
```

**services.html adds its own tokens** (inline `<style>: .svc-page { ... }`):
```css
.svc-page {
  --svc-blue:  #0057ff;
  --svc-red:   #e53935;
  --svc-gold:  #f4b400;
  --svc-green: #0f9d58;
  --svc-ink:   #14213d;
  --svc-muted: #64748b;
  --svc-line:  #e5eaf2;
  --svc-bg:    #f7f9fc;
}
```

---

## CSS File Map

| File | Lines | Purpose |
|------|-------|---------|
| `assets/css/style.css` | 1968 | Global reset, tokens, header, nav, footer, buttons, grids, product cards, cart, error pages, responsive |
| `assets/css/promo-modal.css` | 105 | Promo modal (square, image-only, backdrop, close, animations) |
| `assets/css/product.css` | 528 | Single product page (gallery, zoom, specs, reviews, similar) — **conflicts with style.css** |
| `assets/css/hero-slider.css` | 228 | Hero slider (480px) + 2 stacked promo banners (315×232) grid |

---

## Top 25 Shared Classes (appear in 3+ pages, skip .svc-*/.about-*)

| Class | Used In | Purpose |
|-------|---------|---------|
| `.container` | All pages | Full-width wrapper with `--page-gutter` |
| `.site-header` | All (via partial) | Sticky header wrapper |
| `.main-bar` | All (via partial) | Black top bar |
| `.main-bar-inner` | All (via partial) | Header flex layout |
| `.logo` / `.logo-img` | All (via partial) | Logo link + image |
| `.search-form` | All (via partial) | Search input + button |
| `.header-actions` | All (via partial) | Action icons row |
| `.header-action` | All (via partial) | Individual action (WhatsApp, cart) |
| `.cart-wrap` / `.cart-action` / `.cart-count` / `.cart-preview` | All (via partial) | Cart dropdown |
| `.cat-nav` / `.cat-nav-inner` | All (via partial) | Second nav bar |
| `.cat-link` | All (via partial) | Nav links |
| `.cat-dropdown` / `.cat-dropdown-menu` | All (via partial) | Category dropdown |
| `.mobile-menu-btn` / `.mobile-menu` | All (via partial) | Mobile drawer |
| `.site-footer` | All (via partial) | Footer wrapper |
| `.footer-top` / `.footer-logo` / `.footer-cols` | All (via partial) | Footer sections |
| `.wa-float` | All (via partial) | Floating WhatsApp button |
| `.breadcrumb` | products, product, cart | Breadcrumb nav |
| `.page-head` / `.page-head--left` | products, product, cart | Page title + subtitle |
| `.section` / `.section-alt` | index, about | Section spacing |
| `.btn` / `.btn-primary` | All | Button base + primary |
| `.product-grid` | index, products | Product card grid |
| `.product-card` | index, products, product (similar) | Product card |
| `.product-media` / `.product-media-inner` | index, products, product | Card image wrapper |
| `.product-body` | index, products, product | Card content |
| `.btn-add` | index, products, product (similar) | Add to cart button |
| `.cart-card` | cart | Cart item row |

---

## JS Module Contracts

### `window.RainFowCart` (`assets/js/cart.js:53`)
```js
{
  add(product, qty),      // product: {id, name, price, image}
  remove(id),
  setQty(id, qty),
  clear(),
  count(),                // → total quantity
  items(),                // → array
  STORAGE_KEY: 'rainfow_cart'
}
```
**Events:** Dispatches `rainfow:cart-updated` on every write. Listens to `storage` for cross-tab sync.

### `window.RainFowCatalog` (`assets/js/catalog.js:235`)
```js
{
  getManifest(),           // → {generatedAt, version, chunkSize, totals, chunks[], featuredIds[]}
  getCategories(),         // → {tree[], visible[], topLevel[], withProducts[], count, visibleCount}
  getChunk(n),             // → Product[] (normalized)
  getAllProducts(),        // → Product[] (all chunks concatenated)
  getFeatured(),           // → Product[] (filtered by manifest.featuredIds)
  getProductById(sku),     // → Product|null
  loadMore(),              // → Product[] (next chunk)
  hasMore(),               // → boolean
  clearCache(),            // → void (mem + localStorage)
  // v2 compat:
  getProducts(),           // → getAllProducts()
  refresh()                // → clearCache() + getAllProducts()
}
```
**Cache:** In-memory + `localStorage` prefix `rainfow_v4_` (6h TTL). `?nocache=1` forces fresh fetch.

### `window.RainFowReviews` (`assets/js/product-reviews.js:198`)
```js
{ init(sku) }  // Renders #pd-review-list, #pd-avg-stars, #pd-review-count; binds form → localStorage
```
**Storage:** `rainfow_reviews_<SKU>` (array of `{name, rating, comment, date}`). Merges with `data/reviews.json`.

### `window.RainFowSimilar` (`assets/js/product-similar.js:126`)
```js
{ render(currentProduct) }  // Fills #pd-similar grid (4 max) via category proximity scoring
```

### `window.RainFowZoom` (`assets/js/product-zoom.js:55`)
```js
{ open(src, alt), close() }  // Fullscreen zoom modal (#pd-zoom-modal)
```

### `window.RainFow` (`assets/js/include.js:133`)
```js
{
  renderCartPreview(),  // Re-reads cart, updates header counts + preview dropdown
  readCart()            // → parsed rainfow_cart array
}
```

### `window.__rfRenderDynamic` (`assets/js/products.js:155`)
```js
async function() { /* Renders [data-products] containers added after init */ }
```

### `window.RAINFOW_CONFIG` (`assets/js/config.js:7`)
```js
{
  FORMSPREE_ID: "YOUR_FORM_ID_HERE",
  CONTENT_URL: "data/content.json",
  WHATSAPP_NUMBER: "8801876757033",
  WHATSAPP_MESSAGE: "Hi RainFow! I'd like to discuss a project.",
  SITE_NAME: "RainFow Bangladesh",
  SITE_URL: "https://rainfowbd.com"
}
```

---

## Custom Events Dispatched / Listened

| Event | Dispatched By | Listened By |
|-------|---------------|-------------|
| `includes:loaded` | `include.js` (after partials) | `include.js` (wires menu, cart, etc.) |
| `rainfow:cart-updated` | `cart.js:write()` | `include.js`, `cart-page.js`, `product-page.js` |
| `rainfow:content-added` | `product-similar.js` (after render) | — (reserved for future) |

---

## Distinct `querySelector` Targets (by module)

| Module | Selectors |
|--------|-----------|
| `include.js` | `[data-include]`, `#mobile-menu-btn`, `#mobile-menu`, `#footer-year`, `.cat-dropdown-toggle`, `[data-add-to-cart]`, `#cart-count`, `#cart-count-mobile`, `#cart-preview-count`, `#cart-preview-items` |
| `cart-page.js` | `#cart-items`, `#cart-empty`, `#cart-summary-col`, `#summary-items`, `#cart-summary-line`, `#wa-enquiry-btn`, `.cart-card`, `.qty-btn`, `.qty-input`, `[data-remove]`, `#clear-cart-btn` |
| `products-page.js` | `#all-products`, `#products-empty`, `#product-count-line`, `#empty-hint`, `#search-banner`, `#search-term`, `#clear-search`, `#chip-bar`, `#sort-select`, `#load-sentinel` |
| `products.js` | `[data-products]` (not `#all-products`) |
| `product-page.js` | `#product-breadcrumb`, `#crumb-product`, `#pd-main-image`, `#pd-thumbs`, `#pd-main-wrap`, `#pd-zoom-btn`, `#pd-title`, `#pd-sku`, `#pd-tag`, `#pd-summary`, `#pd-price-block`, `#pd-contact-note`, `#pd-category`, `#pd-stock`, `#pd-moq`, `#pd-brand-wrap`, `#pd-brand`, `#pd-whatsapp`, `#pd-add-to-cart`, `#product-loading`, `#product-error`, `#product-detail`, `#pd-specs-section`, `#pd-specs`, `#pd-review-list`, `#pd-avg-stars`, `#pd-review-count`, `#pd-review-form`, `#pd-review-name`, `#pd-review-rating`, `#pd-review-comment`, `#pd-star-input`, `#pd-review-note`, `#pd-similar-section`, `#pd-similar` |
| `hero-slider.js` | `.hero-slider`, `.hero-slide`, `.hero-dot`, `.hero-dot-fill` |
| `promo-modal.js` | `#promoModal`, `.promo-modal-close`, `[data-promo-close]` |
| `product-zoom.js` | `#pd-zoom-modal`, `#pd-zoom-scroll`, `#pd-zoom-image`, `#pd-zoom-close` |
| `product-reviews.js` | `#pd-review-list`, `#pd-avg-stars`, `#pd-review-count`, `#pd-review-form`, `#pd-review-name`, `#pd-review-rating`, `#pd-review-comment`, `#pd-star-input`, `#pd-review-note` |
| `product-similar.js` | `#pd-similar-section`, `#pd-similar` |

---

## Shared Markup Snippets

### Product Card (from `products.html` / `assets/js/products.js:43-70`)
```html
<div class="product-card">
  <a href="product.html?id=SKU" class="product-media">
    <div class="product-media-inner">
      <span class="product-tag">TAG</span>  <!-- optional -->
      <img src="image.jpg" alt="Name" loading="lazy" onerror="this.style.display='none'">
    </div>
  </a>
  <div class="product-body">
    <h3><a href="product.html?id=SKU">Product Name</a></h3>
    <div class="product-price">
      <span class="price-now">৳1,234</span>
      <span class="price-market">৳1,500</span>  <!-- optional -->
    </div>
    <button class="btn-add"
            data-add-to-cart
            data-id="SKU"
            data-name="Product Name"
            data-price="1234"
            data-image="image.jpg">
      Add to Cart
    </button>
  </div>
</div>
```

### Cart Preview (from `partials/header.html:60-76`)
```html
<div class="cart-preview" role="dialog" aria-label="Cart preview">
  <div class="cart-preview-head">
    <strong>Your Cart</strong>
    <span id="cart-preview-count">0 items</span>
  </div>
  <div class="cart-preview-body" id="cart-preview-items">
    <p class="cart-empty">Your cart is empty.</p>
  </div>
  <div class="cart-preview-foot">
    <a class="btn-checkout wa-enquiry"
       href="https://wa.me/8801876757033?text=..."
       target="_blank" rel="noopener">
      Enquire on WhatsApp →
    </a>
    <a href="cart.html" class="cart-view-link">View full cart</a>
  </div>
</div>
```

### Footer Column (from `partials/footer.html:29-51`)
```html
<div>
  <h4>Shop</h4>
  <a href="products.html?cat=electronics">Electronics</a>
  <a href="products.html?cat=fashion">Fashion</a>
  <a href="products.html?cat=home">Home & Kitchen</a>
  <a href="products.html?cat=beauty">Beauty</a>
</div>
```

---

## Image Inventory (from filesystem + HTML references)

| Path | Used In | Notes |
|------|---------|-------|
| `images/logo.svg` | `partials/header.html`, `about.html`, `cart.html`, `401.html` | Primary logo |
| `images/logo.png` | `index.html` (favicon set) | PNG fallback |
| `images/logo-sq.svg` | `partials/footer.html` | Square logo for footer |
| `images/logo-sq.png` | `index.html` (apple-touch-icon) | Square PNG |
| `images/logo-sq-b.svg` | `services.html` (favicon) | Blue variant |
| `images/favicon.svg` | `index.html`, all error pages, `offline.html` | Favicon |
| `images/favicon.png` | `index.html` (16×16, 32×32) | PNG favicon |
| `images/service-banner.jpeg` | `services.html` (banner background) | Hero banner |
| `images/service-banner 2.jpeg` | `services.html` (alt banner?) | Unused? |
| `data/catalog-1.json` images | Product cards, product page | External URLs (cloudinary, unsplash) — not local |

**No other local images in `images/`.** Product images are external CDN URLs from catalog snapshot.