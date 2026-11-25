# Project Brief: RainFow BD

## Overview
RainFow BD is a Bangladesh-based business solution center and digital e-commerce platform operating from Mohakhali DOHS, Dhaka. It serves both international B2B buyers sourcing from Bangladesh and local entrepreneurs looking to scale operations, offering physical product marketplaces, product sourcing, international shipping support, custom web development, media production, branding, and CRM solutions.

## Technical Stack & Infrastructure
- **Architecture**: Pure Vanilla HTML5, CSS3, and ES6 JavaScript (zero heavy frameworks, zero complex build tooling required for runtime).
- **Hosting & Deployment**: Deployed on **GitHub Pages** with custom domain routing (`rainfowbd.com`, configured via `CNAME`).
- **Jekyll Bypassing**: Uses `.nojekyll` in the root directory to disable Jekyll so files with leading underscores or custom assets are served directly without filtering.
- **Automated Workflows**: `.github/workflows/snapshot-catalog.yml` runs scheduled catalog snapshots (`node scripts/snapshot-catalog.mjs`) against Supabase and commits updated JSON files back to the repository.

## Live Pages List
- `index.html`: Home page with featured categories, hero slider, and promotional banners.
- `products.html`: Product catalog with search, category filtering, and lazy loading.
- `product.html`: Detailed product view with image galleries, zoom, and specs.
- `cart.html`: Cart review, quantity updates, and WhatsApp order inquiry builder.
- `thank-you.html`: Order confirmation and post-action feedback.
- `about.html`: Corporate overview, address, leadership team, and company values.
- `services.html`: Business Solution Center featuring bilingual content (English/Bengali), interactive discovery survey, accordion cards, process overview, and prefilled WhatsApp inquiry form.
- `cart.html`, `offline.html`, and standard HTTP error pages (`400.html`, `401.html`, `403.html`, `404.html`, `408.html`, `429.html`, `500.html`, `503.html`).

## Non-Goals
- No heavy frontend frameworks (React, Vue, Angular).
- No complex build step or npm bundlers required for runtime execution.
- No server-side backend code on GitHub Pages (static hosting with client-side state management and WhatsApp integration).
