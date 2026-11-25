# RainFow Bangladesh — Product Context

## Target Users
- **Bangladeshi consumers** shopping for electronics, fashion, home & kitchen, beauty products
- **B2B buyers / small businesses** needing product sourcing from Bangladesh factories, international shipping, web development, branding, CRM setup
- **Bilingual audience** — English default, Bengali (BN) supported on `services.html` only

---

## Product Flow (Browse → Cart → WhatsApp)
1. **Browse** — `products.html` (search `?q=`, category filter `?cat=`, sort, lazy load)
2. **Detail** — `product.html?id=SKU` (gallery, specs, reviews, similar, add to cart)
3. **Cart** — `cart.html` (review items, adjust qty, see total)
4. **Enquire** — Click "Enquire on WhatsApp" → `https://wa.me/8801876757033?text=...` prefilled with cart items (SKU, name, qty)
5. **Thank You** — `thank-you.html` (shown after WhatsApp redirect returns or form submit)

**Cart persistence:** `localStorage` key `rainfow_cart` (array of `{id, name, price, image, qty}`). Managed by `assets/js/cart.js` → exposes `window.RainFowCart`. Custom event `rainfow:cart-updated` dispatched on every change. `include.js` listens and updates header cart preview + mobile menu count.

---

## Service Flow (Browse → Inquiry → WhatsApp)
1. **Browse services** — `services.html` (6 accordion cards: Product Sourcing, International Shipping, Website Development, Content & Media, Branding & Marketing, CRM & Operations)
2. **Discovery survey** (optional, 3–4 steps) — routes user to:
   - `products.html` (if product-based)
   - `#svc-inquiry` section on same page (if service-based or "Talk With Us")
   - `services.html` anchor (if explore services)
3. **Inquiry form** — at bottom of `services.html` (name, phone, email, service select, details) → submits to WhatsApp with prefilled message in current language (EN/BN)
4. **WhatsApp** — `https://wa.me/8801876757033?text=...`

---

## Bilingual Behavior
- **Only `services.html` is bilingual** — no other page has `data-en`/`data-bn` attributes
- **Language switch** — top-right pill buttons in banner (`.svc-lang-switch button`), toggles `html[lang="en"|"bn"]`
- **Persistence** — `localStorage` key `rainfow_lang` (value `"en"` or `"bn"`), loaded on init, saved on switch
- **CSS hook** — `html[lang="bn"] .svc-page { font-family: "Noto Sans Bengali", ... }` (loads via Google Fonts preconnect)
- **All translatable text** uses `data-en` / `data-bn` attributes on elements; inline script swaps `textContent` on lang change
- **Survey questions, options, result messages, form labels, toast** — all bilingual

---

## Survey on `services.html` (Questions + Routing)

| Step | Question (EN) | Options | Routing Logic |
|------|---------------|---------|---------------|
| **1** | "Business is simple with RainFow. Are you here to develop your business?" | **Yes** (green) → Step 2<br>**Not yet** (red) → Step 1B | `survey.interested = 'yes' \| 'no'` |
| **1B** (if No) | "No problem. What would you like to explore?" | **Explore Our Services** (blue) → `services.html#svc-list`<br>**Explore Our Products** (gold) → `products.html`<br>**Talk With Us** (ink) → `#svc-inquiry` scroll | `survey.route = 'services' \| 'products' \| 'inquiry'` → immediate `goToRoute()` |
| **2** (if Yes) | "What area of business do you prefer most?" | **Product-Based** (blue) → `survey.preference = 'product'`<br>**Service-Based** (gold) → `survey.preference = 'service'` | Advances to Step 3 |
| **3** | "Which market suits your business best?" | **Bangladesh** (green) → `survey.market = 'bangladesh'`<br>**Global Market** (blue) → `survey.market = 'global'` | Advances to Result |
| **Result** | "Perfect. Here is your next step." | **Continue** button → routes per `computeRoute()`:<br>• `preference === 'product'` → `products.html`<br>• `preference === 'service'` → `#svc-inquiry` scroll<br>• else / fallback → `#svc-list` scroll | `survey.route` set, saved, navigation |

**Persistence:** `localStorage` key `rainfow_survey` stores `{interested, preference, market, route, date}`. On revisit, prior answers prefill but survey still shows from Step 1 (user can retake via "Retake" link on result).

**Progress bar:** 3 dots — active/done states updated per step.

---

## Shared UX Patterns
- **WhatsApp as universal CTA** — every conversion ends at `wa.me/8801876757033` with context-specific prefill
- **Cart preview** — hover/focus on cart icon in header shows last 5 items + subtotal + "Enquire on WhatsApp" + "View full cart"
- **Floating WhatsApp button** — fixed bottom-right (`.wa-float`), pulse animation, on every page via `partials/footer.html`
- **Category navigation** — header second nav (`.cat-nav`) + dropdown + mobile drawer all point to `products.html?cat=<slug>`
- **Search** — header form submits `GET products.html?q=...`
- **Add to cart** — `[data-add-to-cart]` buttons on product cards (homepage, products.html, product.html, similar) wired by `include.js`
- **Lazy loading** — `loading="lazy"` on all product images; `IntersectionObserver` sentinel on `products.html` (currently single chunk)
- **Error boundaries** — product.html shows `#product-loading` → `#product-error` → `#product-detail`; products.html shows `#products-empty`
- **Promo modal** — shows once per session (`sessionStorage: rainfow_promo_seen_v1`), 1.5s delay, respects `prefers-reduced-motion`