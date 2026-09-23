/* =========================================================
   RainFow — catalog.js (v2, static-snapshot-first)
   1. Tries data/catalog.json (Cloudflare-cached, static)
   2. Falls back to Supabase if snapshot missing
   3. Caches to localStorage for 24h anyway

   Query params:
     ?nocache=1   → skip localStorage, refetch

   API:
     RainFowCatalog.getProducts()   → Promise<Product[]>
     RainFowCatalog.refresh()       → Promise<Product[]>
     RainFowCatalog.clearCache()    → void
   ========================================================= */
(function () {
  'use strict';

  const SNAPSHOT_URL = 'data/catalog.json';
  const CACHE_KEY = 'rainfow_catalog_v2';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.t || !Array.isArray(parsed.p)) return null;
      if (Date.now() - parsed.t > CACHE_TTL_MS) return null;
      if (parsed.p.length === 0) return null;
      return parsed.p;
    } catch (e) {
      console.warn('[catalog] Cache read failed:', e);
      return null;
    }
  }

  function writeCache(products) {
    if (!products || !products.length) return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        t: Date.now(),
        p: products
      }));
    } catch (e) {
      console.warn('[catalog] Cache write failed:', e);
    }
  }

  function clearCache() {
    try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
  }

  async function fetchFromSnapshot() {
    console.log('[catalog] Fetching', SNAPSHOT_URL);
    const res = await fetch(SNAPSHOT_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error('snapshot HTTP ' + res.status);
    const json = await res.json();
    const products = Array.isArray(json) ? json : (json.products || []);
    console.log('[catalog] Snapshot contains', products.length, 'products.');
    return products;
  }

  async function fetchFromSupabase() {
    if (!window.RAINFOW_DB_READY) return [];
    const db = await window.RAINFOW_DB_READY;
    if (!db) return [];

    console.log('[catalog] Fallback: fetching from Supabase…');
    const { data, error } = await db
      .from('products')
      .select('sku,title,description,category,images,vendor_price,sale_price,min_order_qty,stock,tag,featured,sort_order')
      .eq('active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[catalog] Supabase error:', error);
      return [];
    }
    return (data || []).map(r => ({
      id: r.sku, name: r.title, category: r.category,
      tag: r.tag || '', featured: !!r.featured,
      image: r.images?.[0] || '', images: r.images || [],
      description: r.description || '',
      vendorPrice: r.vendor_price, salePrice: r.sale_price,
      minOrderQty: r.min_order_qty, stock: r.stock,
      sortOrder: r.sort_order
    }));
  }

  let inflight = null;

  function getProducts(force = false) {
    const nocache = new URLSearchParams(location.search).get('nocache') === '1';

    if (!force && !nocache) {
      const cached = readCache();
      if (cached) {
        console.log('[catalog] Serving', cached.length, 'from cache.');
        return Promise.resolve(cached);
      }
    }

    if (inflight) return inflight;

    inflight = fetchFromSnapshot()
      .then(products => {
        writeCache(products);
        return products;
      })
      .catch(err => {
        console.warn('[catalog] Snapshot failed, falling back to Supabase:', err.message);
        return fetchFromSupabase().then(products => {
          writeCache(products);
          return products;
        });
      })
      .finally(() => { inflight = null; });

    return inflight;
  }

  async function refresh() {
    clearCache();
    return getProducts(true);
  }

  window.RainFowCatalog = { getProducts, refresh, clearCache };
})();