/* =========================================================
   RainFow — products-page.js
   Owns #all-products on products.html.
   Handles: ?q= search · ?cat= filter · sort · chips · clear
   Reads from window.RainFowCatalog (Supabase-backed).
   ========================================================= */
(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let ALL_PRODUCTS = [];
  let currentCat   = 'all';
  let currentSort  = 'default';
  let currentQuery = '';
  let loaded       = false;

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
    let items = ALL_PRODUCTS.slice();

    if (currentCat !== 'all') {
      items = items.filter(p => p.category === currentCat);
    }

    if (currentQuery) {
      const q = currentQuery.toLowerCase();
      items = items.filter(p =>
        String(p.name || '').toLowerCase().includes(q) ||
        String(p.id   || '').toLowerCase().includes(q) ||
        String(p.category || '').toLowerCase().includes(q)
      );
    }

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
    const hint    = $('#empty-hint');
    if (!grid) return;

    // Catalog hasn't loaded yet — keep "Loading products…" on screen
    if (!loaded) return;

    const items = getFiltered();

    if (!items.length) {
      grid.innerHTML = '';
      grid.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      if (countEl) {
        countEl.textContent = currentQuery
          ? `No products match “${currentQuery}”.`
          : 'No products found.';
      }
      if (hint) {
        hint.textContent = currentQuery
          ? 'Try a different keyword or clear the search.'
          : (ALL_PRODUCTS.length
              ? 'Try a different category or clear the filter.'
              : 'Couldn’t load products. Check your connection and try again.');
      }
      return;
    }

    grid.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    grid.innerHTML = items.map(cardTpl).join('');

    if (countEl) {
      countEl.textContent = items.length === 1
        ? '1 product'
        : `${items.length} products`;
    }
  }

  function readUrl() {
    const params = new URLSearchParams(window.location.search);

    const q = (params.get('q') || '').trim();
    currentQuery = q;

    const cat = (params.get('cat') || params.get('c') || '').trim();
    if (cat && cat !== 'all') {
      currentCat = cat;
      $$('.chip[data-cat]').forEach(b =>
        b.classList.toggle('is-active', b.dataset.cat === cat)
      );
    }

    updateSearchBanner();
  }

  function updateSearchBanner() {
    const banner = $('#search-banner');
    const term   = $('#search-term');
    if (!banner || !term) return;

    if (currentQuery) {
      banner.classList.remove('hidden');
      term.textContent = `“${currentQuery}”`;
    } else {
      banner.classList.add('hidden');
    }
  }

  function wireChips() {
    $$('.chip[data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.chip[data-cat]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentCat = btn.dataset.cat;

        const url = new URL(window.location.href);
        if (currentCat === 'all') url.searchParams.delete('cat');
        else                      url.searchParams.set('cat', currentCat);
        window.history.replaceState({}, '', url.toString());

        render();
      });
    });
  }

  function wireSort() {
    const sel = $('#sort-select');
    if (!sel) return;
    sel.addEventListener('change', () => {
      currentSort = sel.value;
      render();
    });
  }

  function resetAll() {
    currentQuery = '';
    currentCat = 'all';
    $$('.chip[data-cat]').forEach(b =>
      b.classList.toggle('is-active', b.dataset.cat === 'all')
    );

    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('cat');
    window.history.replaceState({}, '', url.toString());

    updateSearchBanner();
    render();
  }

  function wireClear() {
    const clearBtn = $('#clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        currentQuery = '';
        const url = new URL(window.location.href);
        url.searchParams.delete('q');
        window.history.replaceState({}, '', url.toString());
        updateSearchBanner();
        render();
      });
    }

    const emptyBtn = $('#empty-clear');
    if (emptyBtn) emptyBtn.addEventListener('click', resetAll);
  }

  function init() {
    readUrl();
    wireChips();
    wireSort();
    wireClear();

    if (!window.RainFowCatalog) {
      console.warn('[products-page] RainFowCatalog not loaded');
      loaded = true;
      render();
      return;
    }

    window.RainFowCatalog.getProducts()
      .then(products => {
        ALL_PRODUCTS = Array.isArray(products) ? products : [];
      })
      .catch(err => {
        console.error('[products-page] Catalog fetch failed:', err);
        ALL_PRODUCTS = [];
      })
      .finally(() => {
        loaded = true;
        render();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();