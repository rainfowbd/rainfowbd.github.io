/* =========================================================
   RainFow — cart.js
   Public cart API. Stores in localStorage 'rainfow_cart'.
   ========================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'rainfow_cart';

  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  }

  function write(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    document.dispatchEvent(new Event('rainfow:cart-updated'));
  }

  function add(product, qty = 1) {
    if (!product || product.id == null) return;
    const cart = read();
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty = (existing.qty || 1) + qty;
    else cart.push({
      id:    product.id,
      name:  product.name  || 'Product',
      price: Number(product.price) || 0,
      image: product.image || '',
      qty
    });
    write(cart);
  }

  function remove(id) { write(read().filter(i => i.id !== id)); }

  function setQty(id, qty) {
    qty = Math.max(0, Number(qty) || 0);
    const cart = read();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (qty === 0) return remove(id);
    item.qty = qty;
    write(cart);
  }

  function clear() { write([]); }
  function count() { return read().reduce((s, i) => s + (i.qty || 1), 0); }
  function items() { return read(); }

  window.RainFowCart = { add, remove, setQty, clear, count, items, STORAGE_KEY };
})();