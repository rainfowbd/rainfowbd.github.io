/* =========================================================
   RainFow — products.js (v3)
   Homepage renderer for [data-products][data-filter] blocks.

   data-filter values:
     "featured"              → featured products (from manifest)
     "category:<slug>"       → products in <slug> AND all descendants
     "<slug>"                → alias for "category:<slug>" (backward compat)

   data-limit="N"            → cap the number of products shown

   Safety: never touches #all-products (owned by products-page.js).

   Exposes window.__rfRenderDynamic() so dynamic sections added
   after init() can still be rendered.
   ========================================================= */
(function () {
  'use strict';

  // ---------- helpers ----------

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function priceBlock(p) {
    if (p.pricingMode === 'priced' && p.salePrice != null) {
      const market = p.marketPrice != null
        ? `<s>৳${Number(p.marketPrice).toLocaleString()}</s>`
        : '';
      return `<div class="product-price"><span class="price-now">৳${Number(p.salePrice).toLocaleString()}</span>${market}</div>`;
    }
    if (p.pricingMode === 'contact') {
      return `<div class="product-price"><span class="price-contact">Contact for Price</span></div>`;
    }
    return '';
  }

  function cardTpl(p) {
    const id   = esc(p.id);
    const name = esc(p.name);
    const img  = esc(p.image);
    const tag  = p.tag ? `<span class="product-tag">${esc(p.tag)}</span>` : '';

    return `
      <div class="product-card">
        <a href="product.html?id=${encodeURIComponent(id)}" class="product-media">
          <div class="product-media-inner">
            ${tag}
            <img src="${img}" alt="${name}" loading="lazy" onerror="this.style.display='none'">
          </div>
        </a>
        <div class="product-body">
          <h3><a href="product.html?id=${encodeURIComponent(id)}">${name}</a></h3>
          ${priceBlock(p)}
          <button class="btn-add"
                  data-add-to-cart
                  data-id="${id}"
                  data-name="${name}"
                  data-price="${p.salePrice ?? 0}"
                  data-image="${img}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }

  // True if productCat is the root OR a descendant of it.
  // Uses slug prefix convention: "fashion-girls" starts with "fashion-".
  function isUnder(productCat, rootSlug) {
    return productCat === rootSlug || productCat.startsWith(rootSlug + '-');
  }

  function renderContainer(el, all, featured) {
    if (el.id === 'all-products') return;

    const filter = el.dataset.filter;
    if (!filter) return;

    const limit = parseInt(el.dataset.limit, 10);

    let items;
    if (filter === 'featured') {
      items = featured.slice();
    } else {
      const slug = filter.startsWith('category:') ? filter.slice('category:'.length) : filter;
      items = all.filter(p => isUnder(p.category, slug));
    }

    if (!isNaN(limit) && limit > 0) items = items.slice(0, limit);

    if (!items.length) {
      el.innerHTML = `<p class="products-empty-inline">No products in this section yet.</p>`;
      return;
    }

    el.innerHTML = items.map(cardTpl).join('');
  }

  // Shared loader — avoids double-fetching all products across init + dynamic.
  let _dataPromise = null;
  function loadData() {
    if (_dataPromise) return _dataPromise;
    _dataPromise = Promise.all([
      window.RainFowCatalog.getAllProducts(),
      window.RainFowCatalog.getFeatured(),
      window.RainFowCatalog.getCategories(),
    ]).then(([all, featured, cats]) => ({ all, featured, cats }));
    return _dataPromise;
  }

  // ---------- main init ----------

  async function init() {
    const containers = document.querySelectorAll('[data-products]');
    if (!containers.length) return;

    if (!window.RainFowCatalog) {
      console.warn('[products.js] RainFowCatalog not loaded');
      return;
    }

    try {
      const { all, featured } = await loadData();
      containers.forEach(el => renderContainer(el, all, featured));
    } catch (err) {
      console.error('[products.js] Load failed:', err);
    }
  }

  // ---------- dynamic-render hook ----------
  // Called by index.html's inline script AFTER inserting new sections.
  // Only renders containers that are still empty (idempotent).
  async function renderDynamic() {
    if (!window.RainFowCatalog) return;

    const containers = document.querySelectorAll('[data-products]');
    if (!containers.length) return;

    try {
      const { all, featured } = await loadData();
      containers.forEach(el => {
        if (el.id === 'all-products') return;
        if (el.innerHTML.trim()) return;   // already rendered
        renderContainer(el, all, featured);
      });
    } catch (err) {
      console.error('[products.js] dynamic render failed:', err);
    }
  }

  window.__rfRenderDynamic = renderDynamic;

  // ---------- boot ----------

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();