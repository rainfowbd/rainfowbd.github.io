# Active Context: RainFow BD

## Current Focus
Finalizing `services.html` features including bilingual survey routing, accordion cards, overlapping logo badge, banner image fallback handling, and WhatsApp inquiry prefill.

## Recent Decisions (from `services.html` code)
- **Scoped CSS**: Page-specific CSS for `services.html` is scoped strictly under `.svc-page` and never modifies `assets/css/style.css`.
- **Banner Asset**: Uses `images/service-banner.jpeg` (1600×900) with an `onerror` gradient fallback.
- **Logo Badge**: 140px on desktop / 120px on mobile, black border (`4px solid #000` / `3px`), `object-fit: contain`.
- **Navigation Integration**: "About Our Service" link added to the shared header (`partials/header.html` desktop + mobile) and footer Company column (`partials/footer.html`).

## Pending Verification Items & TODOs
- Add `services.html` manually to `sitemap.xml` (noting that `sitemap.xml` is a protected file and requires explicit instruction if modified).
- Confirm whether `images/services-process.jpg` exists in the filesystem; verify if any image references need updating or fallback handling.
- Verify that footer link targets (`help.html`, `orders.html`, `returns.html`, `shipping.html`, `contact.html`, `careers.html`, `blog.html`) resolve correctly across the site.
