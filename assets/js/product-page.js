/* =========================================================
   RainFow — product-page.js   (SINGULAR — single product view)
   Used by: product.html
   Reads ?id=RFFA00001, finds product in catalog, renders
   gallery + info, and wires Add to Cart.
   ========================================================= */
(function () {
  'use strict';

  console.log('[product-page] Script loaded.');

  const $ = (sel, root = document) => root.querySelector(sel);

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function showError(msg) {
    console.warn('[product-page]', msg);
    const loading = $('#product-loading');
    const err     = $('#product-error');
    const detail  = $('#product-detail');
    if (loading) loading.classList.add('hidden');
    if (err)     err.classList.remove('hidden');
    if (detail)  detail.classList.add('hidden');
  }

  function renderGallery(images, name) {
    const main   = $('#gallery-main');
    const thumbs = $('#gallery-thumbs');
    if (!main || !thumbs || !images.length) return;

    main.src = images[0];
    main.alt = name;

    thumbs.innerHTML = images.map((url, i) => `
      <button type="button" class="gallery-thumb ${i === 0 ? 'is-active' : ''}"
              data-src="${esc(url)}">
        <img src="${esc(url)}" alt="${esc(name)} view ${i + 1}" loading="lazy">
      </button>
    `).join('');

    thumbs.querySelectorAll('.gallery-thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        main.src = btn.dataset.src;
        thumbs.querySelectorAll('.gallery-thumb')
              .forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  }

  function renderProduct(p) {
    document.title = `${p.name} — RainFow BD`;

    const crumbProduct = $('#crumb-product');
    if (crumbProduct) crumbProduct.textContent = p.name;

    const catLink = $('#crumb-cat-link');
    if (catLink) {
      catLink.textContent = p.category;
      catLink.href = `products.html?cat=${encodeURIComponent(p.category)}`;
    }

    const t = $('#p-title');       if (t) t.textContent = p.name;
    const s = $('#p-sku');         if (s) s.textContent = p.id;
    const d = $('#p-description'); if (d) d.textContent = p.description || '';
    const c = $('#p-category');    if (c) c.textContent = `Category: ${p.category}`;
    const k = $('#p-stock');       if (k) k.textContent = p.stock > 0
      ? `In stock (${p.stock})`
      : 'Out of stock';

    renderGallery(p.images && p.images.length ? p.images : [p.image], p.name);

    const btn = $('#p-add-to-cart');
    if (btn) {
      btn.dataset.id    = p.id;
      btn.dataset.name  = p.name;
      btn.dataset.price = '0';
      btn.dataset.image = p.image;
    }
  }

  function init() {
    const id = getParam('id');
    console.log('[product-page] id param:', id);

    if (!id) return showError('No ?id= param');

    if (!window.RainFowCatalog) {
      return showError('RainFowCatalog not loaded — check script order');
    }

    window.RainFowCatalog.getProducts().then(products => {
      console.log('[product-page] catalog size:', products.length);
      const p = products.find(x => x.id === id);
      console.log('[product-page] matched product:', p);

      if (!p) return showError('Product not found: ' + id);

      renderProduct(p);
      const loading = $('#product-loading');
      const err     = $('#product-error');
      const detail  = $('#product-detail');
      if (loading) loading.classList.add('hidden');
      if (err)     err.classList.add('hidden');
      if (detail)  detail.classList.remove('hidden');
    }).catch(err => {
      console.error('[product-page] fetch failed:', err);
      showError('Catalog fetch failed');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();