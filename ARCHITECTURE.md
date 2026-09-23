---

# RainFow BD — Architecture & Control Reference

A guide to **what file controls what** across the site. Read this before editing anything.

---

## 📁 File Structure

```
/
├── ARCHITECTURE.md               ← this file
├── data/
│   └── products.js               ← product catalog (single source of truth)
├── partials/
│   ├── header.html               ← shared header (injected via JS)
│   └── footer.html               ← shared footer + floating WhatsApp
├── assets/
│   ├── css/
│   │   └── style.css             ← ALL styles for the whole site
│   └── js/
│       ├── config.js             ← global config values
│       ├── cart.js               ← cart storage API (localStorage)
│       ├── include.js            ← partial injection + cart UI + add-to-cart
│       ├── app.js                ← small global wiring (year, form guard)
│       ├── products.js           ← homepage product renderer (data-products)
│       ├── products-page.js      ← products.html controller (search/filter/sort)
│       └── cart-page.js          ← cart.html renderer
├── images/
│   └── logo.svg
├── index.html                    ← homepage
├── products.html                 ← all products page
├── cart.html                     ← cart page
├── robots.txt
└── sitemap.xml
```

---

## 🎛️ Who Controls What

### Content / Data

| What you want to change | Edit this file | Notes |
|---|---|---|
| Product list (names, SKU, images, discounts, categories) | `data/products.js` | Single source of truth. Every page reads from here. |
| Add a new product | `data/products.js` | Append to `window.RAINFOW_PRODUCTS` array. Use SKU scheme. |
| Change a product's image | `data/products.js` | Update the `image` field of that product. |
| Change a product's discount % | `data/products.js` | Update the `tag` field (e.g., `'-25% OFF'`). |
| Mark a product as featured (shown on homepage top section) | `data/products.js` | Add `featured: true`. |

---

### Header & Navigation

| What you want to change | Edit this file | Notes |
|---|---|---|
| Logo image | `images/logo.svg` | Used in header, footer, favicon. |
| Logo size | `assets/css/style.css` → `.logo-img` | Default `height: 52px`. |
| Search bar behavior | `partials/header.html` | Form submits to `products.html?q=...`. |
| Search bar size/position | `assets/css/style.css` → `.search-form` | Desktop: `flex: 0 1 480px; margin: 0 auto;` |
| Contact Us (WhatsApp) link | `partials/header.html` | Look for `wa.me/8801876757033`. |
| Cart icon + hover preview | `partials/header.html` + `assets/css/style.css` → `.cart-preview` | Preview rendered by `include.js`. |
| Second nav (Home / Our Products / Category / About Us) | `partials/header.html` → `<nav class="cat-nav">` | |
| Category dropdown items | `partials/header.html` → `.cat-dropdown-menu` | Links go to `products.html?cat=...`. |
| Category dropdown behavior | `assets/js/include.js` → `wireCategoryDropdown()` | |
| Mobile drawer content | `partials/header.html` → `#mobile-menu` | |
| Mobile header layout (logo left, icons right, search below) | `assets/css/style.css` → `@media (max-width: 768px)` | |

---

### Footer

| What you want to change | Edit this file | Notes |
|---|---|---|
| Floating WhatsApp button | `partials/footer.html` (first element) | Styled by `.wa-float` in `style.css`. |
| WhatsApp number | `partials/footer.html` + `partials/header.html` + `cart.html` + `assets/js/cart-page.js` | Currently `8801876757033`. |
| Footer columns (Shop / Customer Service / Company / Follow) | `partials/footer.html` → `.footer-cols` | |
| Newsletter form | `partials/footer.html` + `assets/css/style.css` → `.newsletter` | Not yet wired to a backend. |
| Copyright text | `partials/footer.html` → `.footer-bottom` | Year auto-set by `include.js`/`app.js`. |

---

### Homepage (`index.html`)

| What you want to change | Edit this file | Notes |
|---|---|---|
| Hero banner image | `assets/css/style.css` → `.hero-banner { background-image: url(...) }` | Stretched with `background-size: 100% 100%`. |
| Hero banner height | `assets/css/style.css` → `.hero-banner { height: ... }` | Currently `clamp(280px, 40vw, 520px)`. |
| Category cards (top section) | `index.html` → `.cat-grid` | Each card links to `products.html?cat=...`. |
| Featured products section | `index.html` → `<div data-products data-filter="featured" data-limit="4">` | Auto-rendered by `products.js`. |
| Electronics/Fashion/Home/Beauty sections | `index.html` → `<div data-products data-filter="X">` | Auto-rendered by `products.js`. |
| Add a new category section | `index.html` | Copy a section, change `data-filter` to the category slug. |
| Remove a section | `index.html` | Delete the whole `<section>`. |

---

### Products Page (`products.html`)

| What you want to change | Edit this file | Notes |
|---|---|---|
| Search results | Read from URL `?q=...` | Handled by `products-page.js` → `readUrl()`. |
| Category filter | Read from URL `?cat=...` | Chip auto-activates. |
| Filter chips (list of categories) | `products.html` → `.chip[data-cat]` | Add/remove chips here. |
| Sort options | `products.html` → `#sort-select` | Options: default / name / SKU. |
| Sort logic | `assets/js/products-page.js` → `getFiltered()` switch block | |
| Search banner ("Showing results for …") | `products.html` → `#search-banner` + `products-page.js` → `updateSearchBanner()` | |
| Empty state | `products.html` → `#products-empty` | Has a "Show all products" reset button. |
| Grid container | `products.html` → `#all-products` | **Must NOT have `data-products`.** |
| **Products page logic** | `assets/js/products-page.js` | Owns the grid. Do not add another renderer to this page. |

---

### Cart Page (`cart.html`)

| What you want to change | Edit this file | Notes |
|---|---|---|
| Cart item card design | `assets/css/style.css` → `.cart-card` | Uses same black-border style as product cards. |
| Quantity controls | `assets/css/style.css` → `.qty-control` + wired in `cart-page.js` | |
| Remove item button | `cart-page.js` → `wireRows()` | |
| Clear cart button | `cart-page.js` → `wireClear()` | With confirm dialog. |
| WhatsApp enquiry message | `cart-page.js` → `render()` → build of `msg` | Auto-lists every item's SKU + qty. |
| Summary card | `cart.html` → `.cart-summary` | |
| Empty cart state | `cart.html` → `#cart-empty` | |

---

### Cart Behavior (all pages)

| What you want to change | Edit this file | Notes |
|---|---|---|
| How items are stored | `assets/js/cart.js` | `localStorage` key: `rainfow_cart`. |
| Add to cart click handler | `assets/js/include.js` → `wireAddToCart()` | Reads `data-id`, `data-name`, `data-price`, `data-image` from button. |
| Cart count badge | `assets/js/include.js` → `renderCartPreview()` | Updates `#cart-count`, `#cart-count-mobile`. |
| Mini cart dropdown (header) | `partials/header.html` → `.cart-preview` + `include.js` → `renderCartPreview()` | Shows SKU + qty (no prices). |
| Cross-tab sync | `assets/js/include.js` (`storage` listener) + `cart.js` (`rainfow:cart-updated` event) | Opening two tabs syncs automatically. |

---

### Styles & Design

| What you want to change | Edit this file | Notes |
|---|---|---|
| Brand color (blue) | `assets/css/style.css` → `--brand` | Default `#3b82f6`. |
| Neon glow effect | `assets/css/style.css` → `--brand-glow` | |
| Header black bar | `assets/css/style.css` → `--header-bg` | Default `#000`. |
| 2nd nav navy bar | `assets/css/style.css` → `--header-mid` | Default `#232f3e` (with 20% transparency via `rgba`). |
| WhatsApp green | `assets/css/style.css` → `--whatsapp` | Default `#25d366`. |
| Product card design | `assets/css/style.css` → `.product-card` + `.product-media-inner` | Black border around image. |
| Discount badge (on image) | `assets/css/style.css` → `.product-tag` | |
| SKU row (below title) | `assets/css/style.css` → `.product-sku-row` | |
| Add to Cart button | `assets/css/style.css` → `.btn-add` | |
| Mobile breakpoints | `assets/css/style.css` → `@media (max-width: 768px)` and `@media (max-width: 400px)` | |

---

### Configuration

| What you want to change | Edit this file | Notes |
|---|---|---|
| Global config values | `assets/js/config.js` | `window.RAINFOW_CONFIG`. |
| WhatsApp number (global) | `partials/header.html`, `partials/footer.html`, `cart.html`, `assets/js/cart-page.js` | Hardcoded in 4 places — change all four together. |

---

## 🔗 Script Load Order (per page)

Order matters. Don't reorder.

### `index.html`
```html
<script src="assets/js/config.js"></script>
<script src="data/products.js"></script>
<script src="assets/js/cart.js"></script>
<script src="assets/js/include.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/products.js"></script>      <!-- homepage renderer -->
```

### `products.html`
```html
<script src="assets/js/config.js"></script>
<script src="data/products.js"></script>
<script src="assets/js/cart.js"></script>
<script src="assets/js/include.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/products-page.js"></script> <!-- NOT products.js -->
```

### `cart.html`
```html
<script src="assets/js/config.js"></script>
<script src="assets/js/cart.js"></script>
<script src="assets/js/include.js"></script>
<script src="assets/js/app.js"></script>
<script src="assets/js/cart-page.js"></script>
```

**Rules:**
- `products.js` (homepage) and `products-page.js` (products page) **must never both load on the same page**.
- `cart.js` always loads before `include.js` (include needs `RainFowCart`).
- `data/products.js` must load before any renderer script.

---

## 🏷️ SKU Scheme

Format: `RF` + **category code** + **5-digit number**

| Category slug | Code | Example |
|---|---|---|
| `electronics` | `IT` | `RFIT00001` |
| `fashion` | `FA` | `RFFA00001` |
| `home` | `HK` | `RFHK00001` |
| `beauty` | `BE` | `RFBE00001` |
| `sports` | `SP` | `RFSP00001` |
| `books` | `BK` | `RFBK00001` |

---

## 🧭 Page-by-Page Control Map

| Page | Who renders what |
|---|---|
| `index.html` | `products.js` fills every `[data-products]` container. |
| `products.html` | `products-page.js` alone controls `#all-products`. |
| `cart.html` | `cart-page.js` renders the cart from `RainFowCart.items()`. |
| All pages | `include.js` injects `partials/header.html` + `partials/footer.html`, wires the cart badge, add-to-cart, and mobile menu. |

---

## 🧪 How to Debug Common Issues

| Symptom | Likely cause | Fix |
|---|---|---|
| Products page shows ALL items even with `?q=` | `data-products` accidentally on `#all-products` **or** `products.js` loaded on `products.html` | Check `products.html` — must have neither. |
| Cart count doesn't update | `cart.js` loaded after `include.js` | Reorder scripts. |
| Header/footer missing | `partials/*.html` file is missing or path wrong | Check file exists at exact path (case-sensitive on GitHub Pages). |
| WhatsApp icon huge at bottom | A duplicate Tailwind-classed `<a>` exists somewhere | Search repo for `bottom-6 right-6` and delete it. |
| Styles not applying | Stale cached `style.css` on GitHub Pages CDN | Hard refresh (**Ctrl+Shift+R**) or append `?v=2` to URL. |
| Search shows all products | `products.js` and `products-page.js` both loaded | Remove `products.js` from `products.html`. |

---

## ✅ Quick "Where Do I Edit X?"

- **Add/remove a product** → `data/products.js`
- **Change a discount %** → `data/products.js` → `tag` field
- **Change a product image** → `data/products.js` → `image` field
- **Change the WhatsApp number** → 4 places (header, footer, cart.html, cart-page.js)
- **Change brand color** → `assets/css/style.css` → `--brand`
- **Add a new category chip** → `products.html` → `.toolbar-filters`
- **Change the hero banner image** → `assets/css/style.css` → `.hero-banner`
- **Change the logo** → `images/logo.svg`
- **Change search behavior** → `partials/header.html` (form) + `products-page.js` (logic)
- **Change cart storage** → `assets/js/cart.js`
- **Change footer links** → `partials/footer.html`

---

## 🚦 Current Status / Known Gaps

**Working:**
- Header/footer injection ✅
- Search → products page ✅
- Category filter ✅
- Add to cart ✅
- Cart page with qty + remove + WhatsApp enquiry ✅
- Floating WhatsApp ✅
- Mobile layout ✅

**Not yet built (planned):**
- `product.html` — single product detail page (all `?id=` links currently 404)
- `about.html`
- `contact.html`
- `checkout.html` (or enquiry form)
- Live search dropdown in header
- Backend (Supabase) for real inventory / orders

---


Here is a clean, professional summary of your project architecture and strategy that you can easily share with co-founders, developers, or stakeholders:

---

# Project Summary: Cost-Free, High-Performance E-Commerce Architecture

## Overview

A scalable, zero-dollar ($0) infrastructure model designed to host and manage an e-commerce catalog of **5,000 products (~20,000 images)** without incurring monthly cloud hosting or database fees.

## Technical Architecture

### 1. Database & Backend Layer

* **Platform:** **Supabase** (Free Tier)
* **Function:** Acts as the core relational database to securely store product information, pricing, categories, stock availability, and metadata.

### 2. Media Hosting & CDN Layer

* **Platform:** **GitHub + jsDelivr** (Free Public Repository & Global CDN)
* **Function:** Bypasses traditional expensive cloud storage and bandwidth costs.
* **Execution:**
* All 20,000 product images are optimized, converted to **WebP format**, standardized to a **1:1 square aspect ratio** (e.g., 1200x1200px), and compressed to **~30–50 KB per image** to maintain a total repository size under 1 GB.
* Images are stored in a public GitHub repository and served globally via ultra-fast **jsDelivr CDN** links.


* **Database Integration:** Product image columns store the direct CDN URLs (`[https://cdn.jsdelivr.net/gh/](https://cdn.jsdelivr.net/gh/)...`), allowing the frontend application to load images instantly with zero egress fees.

## Key Benefits

* **100% Lifetime Free Operating Cost:** Eliminates monthly server, media storage, and CDN bills.
* **High Performance:** Leverages a global CDN (jsDelivr) to ensure fast image load times for customers anywhere in the world.
* **Scalable Data Structure:** Clean separation of lightweight structured text (Supabase) and static asset delivery (GitHub).



Here's the **best approach** — the one I'd actually build if this were my project. It's still $0/month, handles 10k+/day comfortably, and gives you room to grow to 100k without re-architecting.

---

# 🎯 The Best Approach for RainFow BD

## The core idea

**Decouple the storefront from the database.**

- The **public site never talks to Supabase directly.** It reads static JSON files served from your own site (cached by Cloudflare).
- **Supabase is your admin backend.** Only you write to it. Only your admin panel reads from it.
- A **GitHub Action** syncs Supabase → static JSON every few hours.

This is the same pattern big e-commerce sites use (static-first, dynamic-when-needed). It's the difference between a site that **survives traffic spikes** and one that **dies under them**.

---

## 🏗️ Final architecture

```
                    ┌──────────────────────────┐
                    │      Cloudflare          │
                    │  (free · unlimited bw)   │
                    └────────────┬─────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
   GitHub Pages             jsDelivr CDN           Cloudflare R2
   HTML/CSS/JS              product images         (optional backup)
   data/*.json              (WebP, 1:1)
        ▲
        │  syncs every 6h
        │
   GitHub Action
        │
        ▼
   ┌──────────────────────────┐
   │       Supabase           │
   │  (admin backend only)    │
   │  products · images ·     │
   │  auth · RLS              │
   └────────────┬─────────────┘
                │
                ▼
        ┌──────────────────┐
        │   Admin Panel    │  ← only YOU access this
        │  (protected by   │
        │   Supabase Auth) │
        └──────────────────┘
```

**Traffic flow:**
- Customer visits site → Cloudflare edge → **cached static files** → instant
- Supabase is only hit by you (and the sync job)
- Images served by jsDelivr's global CDN

**Result:** Public traffic never touches a paid resource. Supabase's free tier stays unused. GitHub Pages' bandwidth stays tiny.

---

## 📦 What lives where

| Asset | Where | Why |
|---|---|---|
| HTML / CSS / JS | GitHub Pages | Static, versioned, easy to edit |
| Product images (WebP) | GitHub image repo → jsDelivr | Free CDN, unlimited bandwidth |
| Product catalog (JSON) | GitHub Pages (`data/*.json`) | Cached at Cloudflare edge |
| Product source-of-truth | Supabase (Postgres) | Structured, queryable, secure |
| Admin panel | GitHub Pages (auth-gated) | Simple, no server to run |
| Auth | Supabase Auth | Free, battle-tested |
| Caching / SSL / DDoS | Cloudflare | Free, unlimited |

---

## 🗂️ File structure

```
/
├── data/                          ← static JSON (auto-generated, cached)
│   ├── catalog.json               (all products, minimal fields)
│   ├── search-index.json          (id + name only, ~250 KB)
│   ├── categories.json            (category list + counts)
│   └── products/
│       ├── RFIT00001.json         (full product detail)
│       ├── RFIT00002.json
│       └── ... (5,000 files, ~5 KB each)
│
├── admin/                         ← password-protected
│   ├── index.html                 (login)
│   ├── dashboard.html             (product list + editor)
│   └── upload.html                (bulk image upload)
│
├── partials/                      ← header / footer
├── assets/                        ← css / js
├── index.html · products.html · cart.html · about.html · product.html
│
├── scripts/                       ← dev-only, not served
│   ├── sync-supabase-to-json.mjs  (GitHub Action runs this)
│   ├── optimize-images.mjs        (WebP conversion)
│   └── upload-images.mjs          (pushes to GitHub image repo)
│
└── .github/workflows/
    └── sync-catalog.yml           (runs every 6h)
```

---

## 💰 Cost breakdown

| Service | Free tier | Your usage at 10k/day | Headroom |
|---|---|---|---|
| **GitHub Pages** | 100 GB bw/month | ~2 GB (with Cloudflare) | **50×** |
| **Cloudflare** | Unlimited | Unlimited | **∞** |
| **jsDelivr** | Unlimited | ~100 GB/month | **∞** |
| **Supabase** | 5 GB bw/month | <100 MB (admin only) | **50×** |
| **GitHub Actions** | 2,000 min/month | ~30 min (6h syncs) | **60×** |
| **Cloudflare R2** (optional) | 10 GB storage, 0 egress | 800 MB | **12×** |
| **Total** | | | **$0/month** |

**Headroom:** You could 10× to **100k visitors/day** before any layer pushes limits.

---

## 🚦 Rollout plan (in order)

### Phase 1 — Harden the current site (today, ~1 hour)

**Goal:** Stop GitHub Pages from being the bottleneck.

1. ✅ Add **Cloudflare** in front of `rainfowbd.github.io`
   - Point domain → Cloudflare
   - Set SSL to "Full (strict)"
   - Enable "Auto Minify" + "Brotli"
   - Cache rule: cache everything, edge TTL 1 day
2. ✅ Add a **`data/products.json`** snapshot — even though it's still static today, it sets the pattern
3. ✅ Add **`localStorage` caching** to `products.js` — first visit fetches, rest read from cache for 24h
4. ✅ Add **image lazy loading** (`loading="lazy"` — already done) + **`decoding="async"`**

**Result:** Site can handle 10k/day today. No new services.

---

### Phase 2 — Introduce Supabase as admin backend (week 1)

**Goal:** Move product data out of code and into a real database you can edit without pushing.

1. ✅ Create Supabase project (free)
2. ✅ Run schema SQL:
   - `products` (id, name, sku, category, description, images[], stock, tags, created_at, updated_at)
   - `categories` (slug, name, order)
   - `admins` (user_id, role)
3. ✅ Enable **RLS on every table**
   - Public: read-only on `products` and `categories` (still useful for admin panel)
   - Admins: full access
4. ✅ Create **one admin user** in Supabase Auth
5. ✅ Build **`admin/` panel** (login + product list + editor)
6. ✅ Migrate your current 19 products → Supabase via a one-time script

**Result:** You can add/edit products via a web UI. No more manual edits.

---

### Phase 3 — Automated sync (week 2)

**Goal:** Public site reads static JSON that's auto-refreshed from Supabase.

1. ✅ Write `scripts/sync-supabase-to-json.mjs`
   - Pulls all products from Supabase
   - Writes `data/catalog.json`, `data/search-index.json`, `data/categories.json`
   - Writes `data/products/{SKU}.json` for each product
2. ✅ Add **GitHub Action** `.github/workflows/sync-catalog.yml`
   - Runs every 6 hours (and on-demand)
   - Runs the sync script
   - Commits changes back to repo
   - Cloudflare serves the new version automatically
3. ✅ Change frontend to fetch `data/catalog.json` (not Supabase)
4. ✅ Add `data/products/{SKU}.json` fetch to `product.html`

**Result:** You edit in admin → within 6 hours the public site updates. Zero manual deploys.

---

### Phase 4 — Images + product pages (week 3)

**Goal:** Handle 20,000 images cleanly, and give each product a real URL.

1. ✅ Create separate repo: `rainfow-images`
   - Split into subfolders by category
   - Each image: WebP, 1:1, 1200×1200, ~40 KB
   - Also generate a `thumb.webp` (400×400) for grids
2. ✅ Push to GitHub → served via jsDelivr
   - URL pattern: `https://cdn.jsdelivr.net/gh/rainfowbd/rainfow-images@v1/RFIT00001/full.webp`
   - Pin to a tag (`@v1`) for stability
3. ✅ Build `scripts/optimize-images.mjs`
   - Input: folder of JPGs from camera/vendor
   - Output: optimized WebP in two sizes
4. ✅ Build `scripts/upload-images.mjs`
   - Pushes images to the image repo
   - Updates the product's `images[]` in Supabase with the new CDN URLs
5. ✅ Build **`product.html`** (already needed)
   - Reads `?id=RFIT00001`
   - Fetches `data/products/RFIT00001.json`
   - Renders full detail with images from jsDelivr

**Result:** Full product detail pages. 20k images served globally for free.

---

### Phase 5 — Search + polish (week 4+)

1. ✅ **Client-side search** using `data/search-index.json` (~250 KB) — instant results
2. ✅ **Category pages** (`category.html?c=electronics`) — or reuse products.html
3. ✅ **JSON-LD structured data** for SEO on every product page
4. ✅ **Sitemap** auto-regenerated by the sync job (5,000 product URLs)
5. ✅ **Optional:** Cloudflare R2 as image backup if jsDelivr has issues

**Result:** Fast search, SEO-ready, resilient.

---

## 🔐 Security model

| Concern | Solution |
|---|---|
| Public users reading products | ✅ Fine — catalog is public anyway |
| Public users writing products | ❌ Blocked by RLS — anon role has no write policy |
| Admin access | ✅ Supabase Auth + email allowlist (only your 4 emails) |
| Admin editing 5,000 products | ✅ Admin panel uses service role only on the server (or RLS-admins policy) |
| Leaked anon key | ⚠️ Assumed public — RLS is what protects you |
| Leaked service_role key | 🔴 Never put this in frontend code — only in GitHub Secrets for scripts |

---

## 📈 How this handles growth

| Traffic | Status |
|---|---|
| **1k/day** | ✅ Trivial |
| **10k/day** | ✅ Comfortable |
| **50k/day** | ✅ Fine (Cloudflare caches everything) |
| **100k/day** | ✅ Fine |
| **500k/day** | ⚠️ Supabase not involved, so OK — but jsDelivr may ask you to move images |
| **1M+/day** | 💰 Time to pay for something. But you'll have revenue by then. |

---

## 💡 Why this is the *best* approach

| Decision | Why |
|---|---|
| **Static JSON, not live Supabase reads** | Public traffic never touches a metered resource. Infinite scale. |
| **Cloudflare in front of GitHub Pages** | Eliminates the only hard bandwidth cap in your stack. Free. |
| **jsDelivr for images** | Unlimited bandwidth. Purpose-built. |
| **Supabase as admin-only backend** | Uses its strengths (auth, RLS, relations) without its weaknesses (bandwidth limit). |
| **GitHub Action sync** | No server to maintain. Cron-as-a-service. Free. |
| **Static product pages** | SEO + speed. Google indexes them properly. |
| **Two image sizes** | 70% bandwidth saved. Grid pages load thumbnails, detail pages load full. |
| **Everything is portable** | If Supabase ever shuts down, swap it for anything else — the JSON format is your contract. |

---

## ⚡ What to do this week

**Minimum viable hardening (do these 4 today):**

1. **Cloudflare** → point `rainfowbd.github.io` at it
2. **`data/catalog.json`** → move your product array from `products.js` to a JSON file
3. **`localStorage` cache** → fetch once, cache 24h
4. **Add `product.html`** → makes the `?id=` links actually work

That alone upgrades you from "works" to "handles 10k/day."

**Next 3 weeks:** Supabase admin panel → sync job → images → polish.

---

## 🚦 Want me to start building?

Reply with the number(s) you want, and I'll write the code:

**1.** Cloudflare setup guide (step-by-step with screenshots-in-text)
**2.** Convert `data/products.js` → `data/catalog.json` + update frontend
**3.** `localStorage` caching layer (drop-in replacement for current fetch)
**4.** `product.html` — single product page (needed for the sync architecture to shine)
**5.** Supabase schema SQL + RLS policies
**6.** Admin panel (`admin/index.html`, `admin/dashboard.html`)
**7.** `scripts/sync-supabase-to-json.mjs` + GitHub Action YAML
**8.** Image optimization script
**9.** Search index + client-side search
**10.** All of it, in order

Tell me which numbers and I'll build them one by one.