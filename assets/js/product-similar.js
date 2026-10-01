/* =========================================================
   RainFow — product-similar.js
   Renders "You may also like" — same category first,
   then sibling categories under the same parent,
   then broader (same top-level).
   ========================================================= */
(function () {
  'use strict';

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

  // Top-level ancestor of a slug: "fashion-kids-girls" → "fashion"
  function topLevelOf(slug) {
    const i = slug.indexOf('-');
    return i === -1 ? slug : slug.slice(0, i);
  }

  // Parent of a slug (strip last segment): "fashion-kids-girls" → "fashion-kids"
  function parentOf(slug) {
    const i = slug.lastIndexOf('-');
    return i === -1 ? null : slug.slice(0, i);
  }

  function pickSimilar(current, all, max = 4) {
    const cat = current.category || '';
    const top = topLevelOf(cat);
    const parent = parentOf(cat);

    const scored = [];
    for (const p of all) {
      if (p.id === current.id) continue;

      const pc = p.category || '';
      let score = 0;
      if (pc === cat) score = 300;
      else if (parent && pc.startsWith(parent + '-')) score = 200;
      else if (pc === parent) score = 180;
      else if (pc.startsWith(top + '-')) score = 100;
      else if (pc === top) score = 90;
      else continue;

      // Featured bumps priority a little
      if (p.featured) score += 5;

      scored.push({ p, score });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, max).map(s => s.p);
  }

  async function render(current) {
    const section = document.getElementById('pd-similar-section');
    const grid = document.getElementById('pd-similar');
    if (!section || !grid) return;

    if (!window.RainFowCatalog) return;

    let all;
    try {
      all = await window.RainFowCatalog.getAllProducts();
    } catch (err) {
      return;
    }

    const picks = pickSimilar(current, all, 4);
    if (!picks.length) {
      section.hidden = true;
      return;
    }

    grid.innerHTML = picks.map(cardTpl).join('');
    section.hidden = false;

    // Let cart.js wire new buttons
    document.dispatchEvent(new CustomEvent('rainfow:content-added', { detail: { root: grid } }));
  }

  window.RainFowSimilar = { render };
})();