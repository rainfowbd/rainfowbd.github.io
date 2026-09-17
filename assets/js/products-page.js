/* =========================================================
   RainFow — products-page.js
   Filters + sorts the catalog on products.html
   ========================================================= */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);

  let currentCat  = 'all';
  let currentSort = 'default';

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

  function getFiltered() {
    const all = (window.RAINFOW_PRODUCTS || []).slice();
    let items = currentCat === 'all' ? all : all.filter(p => p.category === currentCat);

    switch (currentSort) {
      case 'name-asc':  items.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': items.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'sku-asc':   items.sort((a, b) => a.id.localeCompare(b.id));     break;
      case 'sku-desc':  items.sort((a, b) => b.id.localeCompare(a.id));     break;
    }
    return items;
  }

  function render() {
    const grid    = $('#all-products');
    const empty   = $('#products-empty');
    const countEl = $('#product-count-line');
    if (!grid) return;

    const items = getFiltered();

    if (!items.length) {
      grid.innerHTML = '';
      grid.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      if (countEl) countEl.textContent = 'No products found.';
      return;
    }

    grid.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');

    grid.innerHTML = items.map(cardTpl).join('');
    if (countEl) countEl.textContent = items.length === 1 ? '1 product' : `${items.length} products`;
  }

  function wireChips() {
    document.querySelectorAll('.chip[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.chip[data-cat]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentCat = btn.dataset.cat;
        render();
      });
    });
  }

  function wireSort() {
    const sel = $('#sort-select');
    if (!sel) return;
    sel.addEventListener('change', () => { currentSort = sel.value; render(); });
  }

  function init() { wireChips(); wireSort(); render(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();