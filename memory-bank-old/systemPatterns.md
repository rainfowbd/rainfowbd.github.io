# System Patterns: RainFow BD

## Architecture & Partials
- **Shared Components**: Reusable partials (`partials/header.html`, `partials/footer.html`) are injected at runtime.
- **Inclusion Engine**: `assets/js/include.js` fetches each partial asynchronously via `fetch(url, { cache: 'no-cache' })` and injects its outer HTML into `<div data-include="..."></div>` placeholders, dispatching a `includes:loaded` custom event and initializing UI components.
- **Script Loading Order**: Every standard page loads scripts in this exact sequence:
  `config.js` → `cart.js` → `include.js` → `app.js`

## CSS Architecture
- `assets/css/style.css` is the core shared stylesheet and is off-limits for page-specific styling.
- Page-specific CSS lives inline within each page's `<style>` block, scoped under a unique page root class:
  - `.about-page` + `.about-*` on `about.html`
  - `.svc-page` + `.svc-*` on `services.html`

## LocalStorage Keys in Use
- `rainfow_cart`: Managed by `cart.js` for client-side shopping cart state.
- `rainfow_lang`: Manages language preference ('en' or 'bn') on `services.html`.
- `rainfow_survey`: Stores Business Discovery survey answers on `services.html`.

## Catalog Data Flow
- Supabase → `.github/workflows/snapshot-catalog.yml` → `scripts/snapshot-catalog.mjs` → `data/catalog-1.json`.
- **Warning**: Never manually edit `data/catalog-1.json` as it is automatically synced from Supabase.

## Paths & Testing Conventions
- **Relative Paths**: All asset references, stylesheet links, image paths (`images/`, `assets/`), partial includes, and JSON fetch URLs must remain fully relative.
- **Local Testing**: Always test changes locally over an HTTP server (`python -m http.server 8000`) and never via `file://` protocols.
