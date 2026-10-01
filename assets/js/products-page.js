/* =========================================================
   RainFow — products-page.js (v3, lazy load + dynamic chips)
   Owns #all-products on products.html.

   Features:
     - ?q= search
     - ?cat= filter (matches category AND descendants)
     - sort
     - dynamic chips from categories.json → visible
     - AJAX lazy load: IntersectionObserver on sentinel
   ========================================================= */
(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  let ALL_PRODUCTS = [];
  let CATEGORIES   = null;
  let currentCat   = 'all';
  let currentSort  = 'default';
  let currentQuery = '';
  let loaded       = false;
  let observer     = null;

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function priceBlock(p) {
    if (p.pricingMode === 'priced' && p.salePrice != null) {
      const market = p.marketPrice != null ? `<s>৳${Number(p.marketPrice).toLocaleString()}</s>` : '';
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

  function isUnder(productCat, rootSlug) {
    return productCat === rootSlug || productCat.startsWith(rootSlug + '-');
  }

  function getFiltered() {
    let items = ALL_PRODUCTS.slice();

    if (currentCat !== 'all') {
      items = items.filter(p => isUnder(p.category, currentCat));
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
      case 'price-asc': items.sort((a, b) => (a.salePrice ?? 0) - (b.salePrice ?? 0)); break;
      case 'price-desc':items.sort((a, b) => (b.salePrice ?? 0) - (a.salePrice ?? 0)); break;
    }

    return items;
  }

  function renderChips() {
    const wrap = $('#chip-bar');
    if (!wrap || !CATEGORIES) return;

    const visible = CATEGORIES.visible || [];

    // Build chips: "All" + each visible category (indented by depth)
    const chips = [
      `<button type="button" class="chip ${currentCat === 'all' ? 'is-active' : ''}" data-cat="all">All</button>`
    ];

    visible.forEach(c => {
      const indent = '  '.repeat(c.depth);
      const label  = `${indent}${esc(c.name)}`;
      const count  = c.productCountAll;
      chips.push(
        `<button type="button" class="chip ${currentCat === c.slug ? 'is-active' : ''}"
                 data-cat="${esc(c.slug)}" data-depth="${c.depth}">
          ${label} <span class="chip-count">${count}</span>
        </button>`
      );
    });

    wrap.innerHTML = chips.join('');
    wireChips();
  }

  function render() {
    const grid    = $('#all-products');
    const empty   = $('#products-empty');
    const countEl = $('#product-count-line');
    const hint    = $('#empty-hint');
    if (!grid || !loaded) return;

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
    currentQuery = (params.get('q') || '').trim();
    const cat = (params.get('cat') || params.get('c') || '').trim();
    if (cat && cat !== 'all') currentCat = cat;
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
    if (clearBtn) clearBtn.addEventListener('click', () => {
      currentQuery = '';
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.replaceState({}, '', url.toString());
      updateSearchBanner();
      render();
    });
    const emptyBtn = $('#empty-clear');
    if (emptyBtn) emptyBtn.addEventListener('click', resetAll);
  }

  /* ---- AJAX lazy loading (currently a no-op with 1 chunk) ---- */
  function setupLazyLoad() {
    const sentinel = $('#load-sentinel');
    if (!sentinel) return;

    observer = new IntersectionObserver(async (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!window.RainFowCatalog.hasMore()) {
          observer.disconnect();
          sentinel.textContent = '';
          return;
        }
        sentinel.textContent = 'Loading more…';
        const more = await window.RainFowCatalog.loadMore();
        if (more.length) {
          ALL_PRODUCTS = ALL_PRODUCTS.concat(more);
          render();
        }
        sentinel.textContent = window.RainFowCatalog.hasMore() ? '' : 'No more products.';
      }
    }, { rootMargin: '300px' });

    observer.observe(sentinel);
  }

  async function init() {
    readUrl();
    wireSort();
    wireClear();

    if (!window.RainFowCatalog) {
      console.warn('[products-page] RainFowCatalog not loaded');
      loaded = true;
      render();
      return;
    }

    try {
      // Load everything in one go for now (single chunk).
      // When you add chunk 2, we'll switch to lazy loading only the first N.
      const [products, cats] = await Promise.all([
        window.RainFowCatalog.getAllProducts(),
        window.RainFowCatalog.getCategories(),
      ]);
      ALL_PRODUCTS = products;
      CATEGORIES = cats;
    } catch (err) {
      console.error('[products-page] Load failed:', err);
      ALL_PRODUCTS = [];
    } finally {
      loaded = true;
      renderChips();
      render();
      setupLazyLoad();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();