/* =========================================================
   RainFow — cart-page.js
   Renders the full cart page (cart.html)
   ========================================================= */
(function () {
  'use strict';

  const WA_NUMBER = '8801700000000'; // ← change to your real number

  function $(sel, root = document) { return root.querySelector(sel); }

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  /* -------- Render one row -------- */
  function rowTpl(item) {
    const id = esc(item.id || '');
    const name = esc(item.name || 'Product');
    const img = item.image
      ? esc(item.image)
      : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="55" font-size="40" text-anchor="middle" fill="%239ca3af">📦</text></svg>';
    const qty = Number(item.qty) || 1;

    return `
      <div class="cart-row" data-id="${id}">
        <a class="cart-row-media" href="product.html?id=${encodeURIComponent(id)}">
          <img src="${img}" alt="${name}">
        </a>

        <div class="cart-row-info">
          <h3><a href="product.html?id=${encodeURIComponent(id)}">${name}</a></h3>
          <div class="cart-row-sku">
            <span class="sku-label">SKU</span>
            <span class="sku-value">${id}</span>
          </div>
          <div class="cart-row-actions">
            <div class="qty-control" role="group" aria-label="Quantity">
              <button type="button" class="qty-btn" data-qty="dec" aria-label="Decrease">−</button>
              <input type="text" class="qty-input" value="${qty}" inputmode="numeric" pattern="[0-9]*" aria-label="Quantity">
              <button type="button" class="qty-btn" data-qty="inc" aria-label="Increase">+</button>
            </div>
            <button type="button" class="remove-btn" data-remove aria-label="Remove item">
              🗑 Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* -------- Render entire cart -------- */
  function render() {
    const cart = (window.RainFowCart && window.RainFowCart.items()) || [];

    const itemsEl    = $('#cart-items');
    const emptyEl    = $('#cart-empty');
    const summaryCol = $('#cart-summary-col');
    const summaryN   = $('#summary-items');
    const summaryLine= $('#cart-summary-line');
    const waBtn      = $('#wa-enquiry-btn');

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
    if (summaryN)    summaryN.textContent = totalQty;
    if (summaryLine) {
      summaryLine.textContent = totalQty === 1
        ? '1 item in your cart'
        : `${totalQty} items in your cart`;
    }

    // Build WhatsApp message
    if (waBtn) {
      const lines = cart.map(i =>
        `• ${i.name} (SKU: ${i.id}) × ${i.qty || 1}`
      ).join('%0A');
      const msg = `Hi RainFow! I'd like to enquire about these items:%0A%0A${lines}%0A%0APlease share pricing and availability.`;
      waBtn.href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
    }

    wireRows();
  }

  /* -------- Wire qty + remove + change -------- */
  function wireRows() {
    document.querySelectorAll('.cart-row').forEach(row => {
      const id = row.dataset.id;
      const input = row.querySelector('.qty-input');

      row.querySelectorAll('[data-qty]').forEach(btn => {
        btn.addEventListener('click', () => {
          const current = parseInt(input.value, 10) || 1;
          const next = btn.dataset.qty === 'inc' ? current + 1 : Math.max(1, current - 1);
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

      row.querySelector('[data-remove]')?.addEventListener('click', () => {
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