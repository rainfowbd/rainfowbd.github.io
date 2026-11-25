# RainFow Bangladesh — Tech Context

## Agents & Governance
- **Kilo Code** — AI-assisted development (this session)
- **`.clinerules`** — Authoritative project rules (47 lines). Covers stack, partials, data flow, guardrails, protected files, path conventions, local testing. Root file is source of truth; `memory-bank/clinerules-mirror.md` is a read-only mirror.

---

## No Node/npm/Bundler/Test-Runner (Confirmed)
**Root directory listing shows:**
- No `package.json`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- No `node_modules/`
- No `webpack.config.js`, `vite.config.js`, `rollup.config.js`, `esbuild.*`
- No `jest.config.js`, `vitest.config.js`, `playwright.config.js`, `cypress.config.js`
- No `.github/workflows/` for CI (except `snapshot-catalog.yml` which runs Node for Supabase snapshot only)
- No `tsconfig.json`, `.eslintrc`, `.prettierrc`

**Build/Deploy:** Pure static files. GitHub Pages serves directly. Only Node usage is in `scripts/snapshot-catalog.mjs` (runs in GitHub Action, not locally required).

---

## Hosting & Domain
- **Platform:** GitHub Pages (static hosting)
- **Custom Domain:** `rainfowbd.com` → configured via `CNAME` (content: `rainfowbd.com`)
- **DNS:** A/ALIAS/CNAME records point to `<user>.github.io` (standard GH Pages setup)
- **HTTPS:** Automatic via GitHub Pages
- **Jekyll Bypass:** `.nojekyll` in root (empty file)

---

## CNAME Contents
```
rainfowbd.com
```

---

## .nojekyll
Empty file (0 bytes). Disables Jekyll processing so:
- Files/folders starting with `_` are served (not ignored)
- No front matter required
- Raw file serving for all paths

---

## External CDN Dependencies (grep `<link href="http` and `<script src="http` across all HTML)

| URL | Used In | Purpose |
|-----|---------|---------|
| `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap` | `index.html`, `about.html`, `products.html`, `product.html`, `cart.html`, `thank-you.html` | Primary font (Inter) |
| `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700;800&display=swap` | `services.html` | Inter + Noto Sans Bengali for bilingual |
| `https://fonts.gstatic.com` (preconnect) | `index.html`, `about.html`, `services.html`, `products.html`, `product.html`, `cart.html` | Font preconnect |
| `https://images.unsplash.com` (preconnect) | `index.html` | Hero/promo images (unsplash) |
| `https://res.cloudinary.com` (preconnect) | `index.html` | Product images (cloudinary) |
| `https://cdn.tailwindcss.com` | `thank-you.html` **only** | Tailwind JIT — **anomaly: only page using a build tool** |
| `https://www.facebook.com/p/RainFow-Bangladesh-61593164260020/` | `partials/footer.html`, `index.html` (JSON-LD) | Facebook page |
| `https://www.instagram.com/rainfowbangladesh/` | `partials/footer.html`, `index.html` (JSON-LD) | Instagram |
| `https://www.youtube.com/@RainFowBangladesh` | `partials/footer.html`, `index.html` (JSON-LD) | YouTube |
| `https://wa.me/8801876757033` | **Everywhere** (header, footer, cart, product, services, error pages) | WhatsApp deep links |

**No other external CDNs** (no jQuery, no Bootstrap, no Analytics CDN, no React CDN).

---

## All wa.me Numbers (grep `wa.me` across all .html and .js)

| Number | Count | Locations |
|--------|-------|-----------|
| `8801876757033` | 20+ | `partials/header.html` (Contact Us, cart preview), `partials/footer.html` (float + footer links), `index.html` (hero slides, promo banners, promo modal), `products.html` (empty state), `product.html` (WhatsApp button), `cart.html` (enquiry button), `services.html` (survey routes, inquiry form, banner CTAs), `about.html` (CTAs), error pages (`404.html`, `503.html`, etc.) |

**Single WhatsApp number used everywhere:** `8801876757033` (Bangladesh country code 880).

---

## Analytics Check
**grep results for:** `gtag`, `analytics`, `pixel`, `fbq`, `dataLayer`

| Match | File | Context |
|-------|------|---------|
| `gtag('event', 'promo_modal_view', ...)` | `assets/js/promo-modal.js:35` | Fires when promo modal opens |
| `gtag('event', 'promo_modal_close', ...)` | `assets/js/promo-modal.js:51` | Fires when promo modal closes |
| **No** `gtag` config / `gtag('config', ...)` | — | **Not found** |
| **No** `Google Analytics` / `gtag.js` script tag | — | **Not loaded** |
| **No** `fbq`, `pixel`, `dataLayer` | — | **Not found** |

**Conclusion:** `gtag` is **called but never loaded**. Promo modal analytics will silently fail (ReferenceError caught by try/catch? No — not wrapped). This is a bug. Either add GA snippet or remove `gtag` calls.

---

## Supabase (Server-Side Only)
- **Access:** Via `SD_SUPABASE_URL` + `SD_SUPABASE_SERVICE_KEY` (GitHub Actions secrets)
- **Client:** **Never** — `catalog.js` comment: "NO Supabase calls from the browser. Ever."
- **Data Flow:** Supabase → GitHub Action (Node) → static JSON in `data/` → browser fetches JSON

---

## Error Pages (Protected)
All use shared `.error-page` styles from `style.css:1597`. Each has unique error code/title/message. All link back to `index.html` or `products.html` or `contact.html` (broken). WhatsApp links use same number.

---

## Formspree (Placeholder)
`index.html` contact form: `action="https://formspree.io/f/YOUR_FORM_ID_HERE"` — **not configured**. `app.js` shows alert if placeholder detected.