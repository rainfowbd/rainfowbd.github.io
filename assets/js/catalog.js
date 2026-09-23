/* =========================================================
   RainFow — catalog.js
   Fetches products from Supabase, caches in localStorage (24h).

   Usage:
     RainFowCatalog.getProducts().then(products => { ... });

   Query params:
     ?nocache=1   → bypass cache, refetch

   API:
     RainFowCatalog.getProducts()   → Promise<Product[]>
     RainFowCatalog.refresh()       → Promise<Product[]>
     RainFowCatalog.clearCache()    → void
   ========================================================= */
(function () {
  'use strict';

  const CACHE_KEY = 'rainfow_catalog_v1';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

  function rowToProduct(r) {
    return {
      id:          r.sku,
      name:        r.title,
      category:    r.category,
      tag:         r.tag || '',
      featured:    !!r.featured,
      image:       Array.isArray(r.images) && r.images.length ? r.images[0] : '',
      images:      Array.isArray(r.images) ? r.images : [],
      description: r.description || '',
      vendorPrice: r.vendor_price,
      salePrice:   r.sale_price,
      minOrderQty: r.min_order_qty,
      stock:       r.stock,
      sortOrder:   r.sort_order
    };
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.t || !Array.isArray(parsed.p)) return null;
      if (Date.now() - parsed.t > CACHE_TTL_MS) return null;
      if (parsed.p.length === 0) return null;   // ignore empty caches
      return parsed.p;
    } catch (e) {
      console.warn('[catalog] Cache read failed:', e);
      return null;
    }
  }

  function writeCache(products) {
    if (!products || !products.length) return;   // don't poison cache with empty
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        t: Date.now(),
        p: products
      }));
    } catch (e) {
      console.warn('[catalog] Cache write failed (quota?):', e);
    }
  }

  function clearCache() {
    try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
  }

  async function fetchFromSupabase() {
    if (!window.RAINFOW_DB_READY) {
      console.warn('[catalog] supabase-client.js not loaded');
      return [];
    }
    const db = await window.RAINFOW_DB_READY;
    if (!db) {
      console.warn('[catalog] Supabase client unavailable');
      return [];
    }

    console.log('[catalog] Fetching products from Supabase…');

    const { data, error } = await db
      .from('products')
      .select('sku,title,description,category,images,vendor_price,sale_price,min_order_qty,stock,tag,featured,sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[catalog] Supabase fetch error:', error);
      return [];
    }

    console.log('[catalog] Fetched', (data || []).length, 'products.');
    return (data || []).map(rowToProduct);
  }

  let inflight = null;

  function getProducts(force = false) {
    const nocache = new URLSearchParams(location.search).get('nocache') === '1';

    if (!force && !nocache) {
      const cached = readCache();
      if (cached) {
        console.log('[catalog] Serving', cached.length, 'products from cache.');
        return Promise.resolve(cached);
      }
    }

    if (inflight) return inflight;

    inflight = fetchFromSupabase()
      .then(products => {
        writeCache(products);
        return products;
      })
      .finally(() => { inflight = null; });

    return inflight;
  }

  async function refresh() {
    clearCache();
    return getProducts(true);
  }

  window.RainFowCatalog = {
    getProducts,
    refresh,
    clearCache
  };
})();