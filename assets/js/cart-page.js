/* =========================================================
   RainFow — cart-page.js
   Renders the full cart page (cart.html)
   Layout: card-style rows matching the product cards
   ========================================================= */
(function () {
  'use strict';

  const WA_NUMBER = '8801700000000'; // ← change to your real number

  const $ = (sel, root = document) => root.querySelector(sel);

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  const PLACEHOLDER = 'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" fill="#f3f4f6"/>' +
      '<text x="50" y="58" font-size="36" text-anchor="middle" fill="#9ca3af">📦</text></svg>'
    );

  /* -------- Render one cart row (card style) -------- */
  function rowTpl(item) {
    const id   = esc(item.id || '');
    const name = esc(item.name || 'Product');
    const img  = item.image ? esc(item.image) : PLACEHOLDER;
    const qty  = Number(item.qty) || 1;

    return `
      <article class="cart-card" data-id="${id}">

        <a class="cart-card-media" href="product.html?id=${encodeURIComponent(id)}">
          <div class="cart-card-media-inner">
            <img src="${img}" alt="${name}" loading="lazy">
          </div>
        </a>

        <div class="cart-card-body">

          <h3 class="cart-card-title">
            <a href="product.html?id=${encodeURIComponent(id)}">${name}</a>
          </h3>

          <div class="product-sku-row">
            <span class="sku-label">SKU</span>
            <span class="sku-value">${id}</span>
          </div>

          <div class="cart-card-controls">
            <div class="qty-control" role="group" aria-label="Quantity">
              <button type="button" class="qty-btn" data-qty="dec" aria-label="Decrease quantity">−</button>
              <input type="text" class="qty-input" value="${qty}" inputmode="numeric" pattern="[0-9]*" aria-label="Quantity">
              <button type="button" class="qty-btn" data-qty="inc" aria-label="Increase quantity">+</button>
            </div>

            <button type="button" class="remove-btn" data-remove aria-label="Remove item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6M14 11v6"></path>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
              </svg>
              Remove
            </button>
          </div>

        </div>
      </article>
    `;
  }

  /* -------- Render entire cart -------- */
  function render() {
    const cart = (window.RainFowCart && window.RainFowCart.items()) || [];

    const itemsEl     = $('#cart-items');
    const emptyEl     = $('#cart-empty');
    const summaryCol  = $('#cart-summary-col');
    const summaryN    = $('#summary-items');
    const summaryLine = $('#cart-summary-line');
    const waBtn       = $('#wa-enquiry-btn');

    if (!itemsEl) return;

    if (!cart.length) {
      itemsEl.innerHTML = '';
      itemsEl.classList.add('hidden');
      if (emptyEl) emptyEl.classList.remove('hidden');
      if (summaryCol) summaryCol.style.display = 'none';
      if (summaryLine) summaryLine.textContent = 'Your cart is empty.';
      return;
    }

    itemsEl.classList.remove('hidden');
    if (emptyEl) emptyEl.classList.add('hidden');
    if (summaryCol) summaryCol.style.display = '';

    itemsEl.innerHTML = cart.map(rowTpl).join('');

    const totalQty = cart.reduce((s, i) => s + (Number(i.qty) || 1), 0);
    if (summaryN) summaryN.textContent = totalQty;
    if (summaryLine) {
      summaryLine.textContent = totalQty === 1
        ? '1 item in your cart'
        : `${totalQty} items in your cart`;
    }

    if (waBtn) {
      const lines = cart.map(i => `• ${i.name} (SKU: ${i.id}) × ${i.qty || 1}`).join('%0A');
      const msg = `Hi RainFow! I'd like to enquire about these items:%0A%0A${lines}%0A%0APlease share pricing and availability.`;
      waBtn.href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
    }

    wireRows();
  }

  /* -------- Wire qty + remove -------- */
  function wireRows() {
    document.querySelectorAll('.cart-card').forEach(card => {
      const id    = card.dataset.id;
      const input = card.querySelector('.qty-input');

      card.querySelectorAll('[data-qty]').forEach(btn => {
        btn.addEventListener('click', () => {
          const current = parseInt(input.value, 10) || 1;
          const next = btn.dataset.qty === 'inc'
            ? current + 1
            : Math.max(1, current - 1);
          input.value = next;
          window.RainFowCart.setQty(id, next);
        });
      });

      input.addEventListener('change', () => {
        let v = parseInt(input.value, 10);
        if (!v || v < 1) v = 1;
        input.value = v;
        window.RainFowCart.setQty(id, v);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') input.blur();
      });

      card.querySelector('[data-remove]')?.addEventListener('click', () => {
        window.RainFowCart.remove(id);
      });
    });
  }

  /* -------- Clear cart -------- */
  function wireClear() {
    const btn = $('#clear-cart-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (confirm('Remove all items from your cart?')) {
        window.RainFowCart.clear();
      }
    });
  }

  /* -------- Boot -------- */
  function init() {
    wireClear();
    render();
    document.addEventListener('rainfow:cart-updated', render);
    window.addEventListener('storage', (e) => {
      if (e.key === 'rainfow_cart') render();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();