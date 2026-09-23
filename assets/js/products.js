/* =========================================================
   RainFow — products.js (homepage renderer)
   Renders [data-products][data-filter] containers on index.html.
   Reads from window.RainFowCatalog (Supabase-backed).

   Safety rules (do NOT remove):
     1. Never touch #all-products (owned by products-page.js)
     2. Only render containers that have a data-filter attribute
   ========================================================= */
(function () {
  'use strict';

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
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
            <img src="${img}" alt="${name}" loading="lazy">
          </div>
        </a>
        <div class="product-body">
          <h3><a href="product.html?id=${encodeURIComponent(id)}">${name}</a></h3>
          <div class="product-sku-row">
            <span class="sku-label">SKU</span>
            <span class="sku-value">${id}</span>
          </div>
          <button class="btn-add"
                  data-add-to-cart
                  data-id="${id}"
                  data-name="${name}"
                  data-price="0"
                  data-image="${img}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }

  function renderContainer(el, all) {
    if (el.id === 'all-products') {
      console.warn('[products.js] Skipped #all-products (reserved for products-page.js)');
      return;
    }

    const filter = el.dataset.filter;
    if (!filter) {
      console.warn('[products.js] Skipped container without data-filter:', el);
      return;
    }

    const limit = parseInt(el.dataset.limit, 10);

    let items = all.slice();
    if (filter === 'featured') items = items.filter(p => p.featured);
    else                       items = items.filter(p => p.category === filter);

    if (!isNaN(limit) && limit > 0) items = items.slice(0, limit);

    el.innerHTML = items.map(cardTpl).join('');
  }

  function init() {
    const containers = document.querySelectorAll('[data-products]');
    if (!containers.length) return;

    if (!window.RainFowCatalog) {
      console.warn('[products.js] RainFowCatalog not loaded');
      return;
    }

    window.RainFowCatalog.getProducts().then(all => {
      containers.forEach(el => renderContainer(el, all));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();