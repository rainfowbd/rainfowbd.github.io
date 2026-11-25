Mirror of /.clinerules. The root file is authoritative — edit the root, not this mirror. Kept here so the whole ruleset travels with the Memory Bank.

# RainFow Bangladesh GitHub Pages E-commerce Codebase Rules (.clinerules)

## 1. Tech Stack & Hosting
- **Frontend Architecture**: Pure Vanilla HTML5, CSS3, and ES6 JavaScript (zero heavy frameworks, zero complex build tooling required for runtime).
- **Hosting & Deployment**: Deployed on **GitHub Pages** with custom domain routing (`rainfowbd.com`, configured via `CNAME`).
- **Jekyll Bypassing**: Uses `.nojekyll` in the root directory to disable Jekyll so files with leading underscores or custom assets are served directly without filtering.
- **Automated Workflows**: `.github/workflows/snapshot-catalog.yml` runs scheduled catalog snapshots (`node scripts/snapshot-catalog.mjs`) against Supabase and commits updated JSON files back to the repository.

---

## 2. Partials & Rendering
- **Shared Components**: Reusable partials (e.g., `partials/header.html`, `partials/footer.html`) are stored in the `partials/` directory.
- **Client-Side Injection**: Root HTML pages include placeholders using the `data-include` attribute (e.g., `<div data-include="partials/header.html"></div>`).
- **Inclusion Engine**: `assets/js/include.js` fetches each partial asynchronously via `fetch(url, { cache: 'no-cache' })` and injects its outer HTML into the placeholder element, dispatching a `includes:loaded` custom event and initializing UI components (mobile menu, footer year, category dropdowns, add-to-cart handlers, and cart preview).

---

## 3. Data & Cart Flow
- **Product & Catalog Data**: Stored as static JSON files within the `data/` directory:
  - `data/catalog-1.json`: Main product inventory and details.
  - `data/categories.json`: Hierarchical category tree.
  - `data/content.json`, `data/manifest.json`, `data/reviews.json`: Additional content, manifest, and review metadata.
- **Auto-Generated Data Warning**: `data/catalog-1.json` (and any JSON files written by `scripts/snapshot-catalog.mjs`) is synced automatically from Supabase via GitHub Actions. **MUST NOT** manually edit `data/catalog-1.json` unless explicitly instructed—manual edits will be overwritten on the next scheduled snapshot unless updated in Supabase or in the snapshot script.
- **Product Rendering**:
  - `products.html` (backed by `assets/js/products-page.js` and `assets/js/catalog.js`) handles filtering by query parameters (`?q=`, `?cat=`), sorting, dynamic category chips, and lazy loading via `IntersectionObserver`.
  - `product.html` (backed by `assets/js/product-page.js`) parses query parameters (`?id=SKU`), dynamically populates product details, image galleries, zoom functionality, breadcrumbs, and Open Graph meta tags.
- **Cart & Checkout State**:
  - `assets/js/cart.js` manages client-side cart state persisted in `localStorage` under the key `'rainfow_cart'`, dispatching a `rainfow:cart-updated` custom event on state changes.
  - `cart.html` (backed by `assets/js/cart-page.js`) reviews items, adjusts quantities, computes totals, and constructs WhatsApp order enquiries (`wa.me`) or redirects.
  - `thank-you.html` provides post-action confirmation.

---

## 4. Strict Guardrails
- **Protected Files (NEVER modify unless explicitly requested)**:
  - `CNAME`
  - `.nojekyll`
  - `robots.txt`
  - `sitemap.xml`
  - `offline.html`
  - HTTP Error Pages (`400.html`, `401.html`, `403.html`, `404.html`, `408.html`, `429.html`, `500.html`, `503.html`)
  - `.github/workflows/`
- **Asset & Fetch Path Conventions**:
  - Keep all script references, stylesheet links, image paths (`images/` and `assets/`), partial includes, and JSON fetch URLs **relative** (e.g., `assets/css/style.css`, `data/catalog-1.json`, `images/logo.svg`).
  - Ensure paths remain fully compatible with GitHub Pages custom domain routing without absolute host prefix mismatches.
- **Local Testing Requirement**:
  - Always test changes locally over an HTTP server (e.g., `python -m http.server 8000`, VS Code Live Server, or `npx serve`) and **never** via `file://` protocols due to CORS restrictions on `fetch()` calls loading JSON and partials.
