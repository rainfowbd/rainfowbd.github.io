/* =========================================================
   RainFow — category-grid.js
   Renders [data-category-grid] containers with top-level
   categories that have products (productCountAll > 0).

   Data source: window.RainFowCatalog.getCategories()
   ========================================================= */
(function () {
  'use strict';

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  // Pick a representative image for a category.
  // Priority: direct product → any descendant → empty
  function pickImage(category, products) {
    const catSlug = category.slug;

    const direct = products.find(p => p.category === catSlug);
    if (direct && direct.image) return direct.image;

    for (const p of products) {
      if (p.category === catSlug) continue;
      if (p.category.startsWith(catSlug + '-') && p.image) {
        return p.image;
      }
    }
    return '';
  }

  function cardTpl(cat, products) {
    const img   = pickImage(cat, products);
    const name  = esc(cat.name);
    const slug  = esc(cat.slug);
    const count = cat.productCountAll || 0;

    const media = img
      ? `<img src="${esc(img)}" alt="${name}" loading="lazy" onerror="this.style.display='none';this.parentNode.classList.add('cat-card-media--empty');">`
      : '';

    return `
      <a href="products.html?cat=${encodeURIComponent(slug)}"
         class="cat-card"
         aria-label="${name} — ${count} item${count === 1 ? '' : 's'}">
        <div class="cat-card-media">
          ${media}
          <span class="cat-card-count">${count}</span>
        </div>
        <div class="cat-card-body">
          <h3 class="cat-card-title">${name}</h3>
          <span class="cat-card-sub">${count} item${count === 1 ? '' : 's'}</span>
        </div>
      </a>
    `;
  }

  async function render(el, topLevel, allProducts) {
    if (!topLevel.length) {
      el.innerHTML = `<p class="cat-empty">No categories to display yet.</p>`;
      return;
    }

    const sorted = topLevel.slice().sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });

    el.innerHTML = sorted.map(c => cardTpl(c, allProducts)).join('');
  }

  async function init() {
    const containers = document.querySelectorAll('[data-category-grid]');
    if (!containers.length) return;

    if (!window.RainFowCatalog) {
      console.warn('[category-grid] RainFowCatalog not loaded');
      return;
    }

    try {
      const cats = await window.RainFowCatalog.getCategories();
      const products = await window.RainFowCatalog.getAllProducts();
      containers.forEach(el => render(el, cats.topLevel || [], products));
    } catch (err) {
      console.error('[category-grid] Failed:', err);
      containers.forEach(el => {
        el.innerHTML = `<p class="cat-empty">Could not load categories.</p>`;
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();