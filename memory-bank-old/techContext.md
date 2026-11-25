# Technical Context: RainFow BD

## Tooling & Environment
- **Development Environment**: VS Code + Cline on Windows (`win32`).
- **Build Tools**: None (no Node build toolchains or package managers required for runtime execution).
- **Hosting**: GitHub Pages (static site hosting, serverless).
- **Custom Domain**: `rainfowbd.com` configured via `CNAME`.
- **Jekyll Bypass**: `.nojekyll` file present in root to ensure underscored folders/assets are served without Jekyll filtering.

## External Dependencies (CDN Only)
- **Google Fonts**: Inter & Noto Sans Bengali (`preconnect` + stylesheet link).
- **WhatsApp**: `wa.me` URLs with encoded prefilled message strings (`?text=...`) for order and service inquiries.
- **Analytics / Tracking**: None (privacy-first, zero tracking scripts).

## Protected Files & Guardrails
- **Protected Files (NEVER modify without explicit instruction)**:
  - `CNAME`
  - `.nojekyll`
  - `robots.txt`
  - `sitemap.xml`
  - `offline.html`
  - All HTTP Error Pages (`400.html`, `401.html`, `403.html`, `404.html`, `408.html`, `429.html`, `500.html`, `503.html`)
  - `.github/workflows/`
