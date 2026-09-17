/* =========================================================
   RainFow — cart.js
   Public cart API. Stores in localStorage under 'rainfow_cart'.
   Item shape: { id, name, price, qty, image }
   ========================================================= */
(function () {
  'use strict';

  const STORAGE_KEY = 'rainfow_cart';

  /* ---------- Read / Write ---------- */
  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function write(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    emitUpdate();
  }

  function emitUpdate() {
    document.dispatchEvent(new Event('rainfow:cart-updated'));
  }

  /* ---------- Public API ---------- */
  function add(product, qty = 1) {
    if (!product || product.id == null) {
      console.warn('[cart] add() requires a product with an id');
      return;
    }
    const cart = read();
    const existing = cart.find(i => i.id === product.id);

    if (existing) {
      existing.qty = (existing.qty || 1) + qty;
    } else {
      cart.push({
        id:    product.id,
        name:  product.name  || 'Product',
        price: Number(product.price) || 0,
        image: product.image || '',
        qty:   qty
      });
    }
    write(cart);
  }

  function remove(id) {
    const cart = read().filter(i => i.id !== id);
    write(cart);
  }

  function setQty(id, qty) {
    qty = Math.max(0, Number(qty) || 0);
    const cart = read();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (qty === 0) {
      remove(id);
      return;
    }
    item.qty = qty;
    write(cart);
  }

  function clear() {
    write([]);
  }

  function count() {
    return read().reduce((s, i) => s + (i.qty || 1), 0);
  }

  function subtotal() {
    return read().reduce((s, i) => s + (i.price * (i.qty || 1)), 0);
  }

  function items() {
    return read();
  }

  /* ---------- Expose ---------- */
  window.RainFowCart = {
    add,
    remove,
    setQty,
    clear,
    count,
    subtotal,
    items,
    STORAGE_KEY
  };
})();