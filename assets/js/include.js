/* =========================================================
   RainFow — include.js
   - Injects partials (header/footer) via fetch
   - Wires: mobile menu, footer year, category dropdown,
            cart preview, add-to-cart buttons
   - Listens for cart updates + cross-tab storage events
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. PARTIAL INJECTION
     --------------------------------------------------------- */
  const placeholders = document.querySelectorAll('[data-include]');

  const loadOne = (el) => {
    const url = el.getAttribute('data-include');
    return fetch(url, { cache: 'no-cache' })
      .then(r => {
        if (!r.ok) throw new Error(`${url} → ${r.status}`);
        return r.text();
      })
      .then(html => { el.outerHTML = html; })
      .catch(err => {
        console.error('[include] failed:', err);
        el.innerHTML = `<!-- include failed: ${url} -->`;
      });
  };

  const ready = placeholders.length
    ? Promise.all([...placeholders].map(loadOne))
    : Promise.resolve();

  /* ---------------------------------------------------------
     2. WIRING — runs after partials are in the DOM
     --------------------------------------------------------- */
  ready.then(() => {
    document.dispatchEvent(new CustomEvent('includes:loaded'));

    wireMobileMenu();
    wireFooterYear();
    wireCategoryDropdown();
    wireAddToCart();
    renderCartPreview();
  });

  /* ---------------------------------------------------------
     Mobile menu toggle
     --------------------------------------------------------- */
  function wireMobileMenu() {
    const btn  = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });

    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => menu.classList.add('hidden'));
    });
  }

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */
  function wireFooterYear() {
    const y = document.getElementById('footer-year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------
     Category dropdown — click support (touch) + click-outside close
     --------------------------------------------------------- */
  function wireCategoryDropdown() {
    document.querySelectorAll('.cat-dropdown-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        if (!menu) return;
        const isOpen = menu.style.opacity === '1';
        menu.style.opacity    = isOpen ? '0' : '1';
        menu.style.visibility = isOpen ? 'hidden' : 'visible';
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.cat-dropdown-menu').forEach(m => {
        m.style.opacity = '0';
        m.style.visibility = 'hidden';
      });
      document.querySelectorAll('.cat-dropdown-toggle').forEach(b =>
        b.setAttribute('aria-expanded', 'false')
      );
    });
  }

  /* ---------------------------------------------------------
     Add-to-cart — reads data-* attributes, calls RainFowCart.add
     --------------------------------------------------------- */
  function wireAddToCart() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add-to-cart]');
      if (!btn || btn.disabled) return;
      e.preventDefault();

      if (!window.RainFowCart) {
        console.warn('[cart] RainFowCart not loaded');
        return;
      }

      const product = {
        id:    btn.dataset.id,
        name:  btn.dataset.name  || 'Product',
        price: Number(btn.dataset.price) || 0,
        image: btn.dataset.image || ''
      };
      if (!product.id) return;

      window.RainFowCart.add(product, 1);

      const original = btn.textContent;
      btn.textContent = '✓ Added to Cart';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 1400);
    });
  }

  /* ---------------------------------------------------------
     Cart preview — reads localStorage 'rainfow_cart'
     --------------------------------------------------------- */
  function renderCartPreview() {
    const items = readCart();

    const countEl     = document.getElementById('cart-count');
    const countMobile = document.getElementById('cart-count-mobile');
    const previewN    = document.getElementById('cart-preview-count');
    const previewList = document.getElementById('cart-preview-items');
    const previewTot  = document.getElementById('cart-preview-subtotal');

    const totalQty = items.reduce((s, i) => s + (i.qty || 1), 0);
    const subtotal = items.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

    if (countEl)     countEl.textContent     = totalQty;
    if (countMobile) countMobile.textContent = totalQty;
    if (previewN)    previewN.textContent    = totalQty + (totalQty === 1 ? ' item' : ' items');
    if (previewTot)  previewTot.textContent  = '৳' + subtotal.toLocaleString();

    if (!previewList) return;

    if (!items.length) {
      previewList.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      return;
    }

    previewList.innerHTML = items.slice(0, 5).map(it => `
      <div class="cart-item">
        <img src="${it.image || 'images/placeholder.png'}" alt="">
        <div class="cart-item-info">
          <h5>${escapeHtml(it.name || 'Product')}</h5>
          <p>Qty: ${it.qty || 1}</p>
        </div>
        <span class="cart-item-price">৳${(it.price * (it.qty || 1)).toLocaleString()}</span>
      </div>
    `).join('');
  }

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function readCart() {
    try {
      return JSON.parse(localStorage.getItem('rainfow_cart') || '[]');
    } catch {
      return [];
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------------------------------------------------------
     Public API
     --------------------------------------------------------- */
  window.RainFow = window.RainFow || {};
  window.RainFow.renderCartPreview = renderCartPreview;
  window.RainFow.readCart = readCart;

  /* React to cart updates anywhere on the page */
  document.addEventListener('rainfow:cart-updated', renderCartPreview);
  window.addEventListener('storage', (e) => {
    if (e.key === 'rainfow_cart') renderCartPreview();
  });
})();