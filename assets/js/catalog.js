/* =========================================================
   RainFow — catalog.js (v3, chunked snapshot loader)
   Loads data/manifest.json + chunked catalogs.
   NO Supabase calls from the browser. Ever.

   Data files:
     data/manifest.json     → { totals, chunks[], featuredIds[], generatedAt }
     data/categories.json   → { tree, visible, topLevel, withProducts, ... }
     data/catalog-1.json    → { chunk, count, products: [...] }
     data/catalog-2.json    → ...

   Public API (v3):
     RainFowCatalog.getManifest()        → Promise<Manifest>
     RainFowCatalog.getCategories()      → Promise<{tree, visible, topLevel, withProducts}>
     RainFowCatalog.getChunk(n)          → Promise<Product[]>
     RainFowCatalog.getAllProducts()     → Promise<Product[]>
     RainFowCatalog.getFeatured()        → Promise<Product[]>
     RainFowCatalog.getProductById(sku)  → Promise<Product|null>
     RainFowCatalog.loadMore()           → Promise<Product[]>
     RainFowCatalog.hasMore()            → boolean
     RainFowCatalog.clearCache()         → void

   Backward-compat shim (v2 API):
     RainFowCatalog.getProducts()        → Promise<Product[]>
     RainFowCatalog.refresh()            → Promise<Product[]>

   Cache:
     - In-memory: per page load
     - localStorage: 6h TTL (matches snapshot cron)
     - ?nocache=1 forces fresh fetches
   ========================================================= */
(function () {
  'use strict';

  const BASE = 'data/';
  const LS_PREFIX = 'rainfow_v4_';   // bumped from v3 — old cache shape incompatible
  const LS_TTL_MS = 6 * 60 * 60 * 1000;

  const NOCACHE = new URLSearchParams(location.search).get('nocache') === '1';

  const mem = {
    manifest: null,
    categories: null,
    chunks: new Map(),
    nextChunk: 1,
    allLoaded: false,
  };

  // ---------- cache helpers ----------

  function lsGet(key) {
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      if (!raw) return null;
      const { t, v } = JSON.parse(raw);
      if (Date.now() - t > LS_TTL_MS) return null;
      return v;
    } catch { return null; }
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(LS_PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
    } catch (e) {
      // quota exceeded — silently ignore
    }
  }

  function lsClear() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
  }

  async function fetchJson(file) {
    const res = await fetch(BASE + file, { cache: NOCACHE ? 'no-store' : 'default' });
    if (!res.ok) throw new Error(`${file} → HTTP ${res.status}`);
    return res.json();
  }

  function normalizeProduct(p) {
    return {
      id:          p.id || '',
      name:        p.name || '',
      category:    p.category || '',
      tag:         p.tag || '',
      featured:    !!p.featured,
      image:       p.image || (Array.isArray(p.images) && p.images[0]) || '',
      images:      Array.isArray(p.images) ? p.images : [],
      description: p.description || '',
      pricingMode: p.pricingMode || 'unpriced',
      marketPrice: p.marketPrice ?? null,
      salePrice:   p.salePrice ?? null,
      contactNote: p.contactNote || '',
      minOrderQty: p.minOrderQty ?? 1,
      stock:       p.stock ?? 0,
      sortOrder:   p.sortOrder ?? 0,
    };
  }

  // ---------- public API ----------

  async function getManifest() {
    if (mem.manifest) return mem.manifest;
    const cached = NOCACHE ? null : lsGet('manifest');
    const data = cached || await fetchJson('manifest.json');
    mem.manifest = data;
    if (!cached) lsSet('manifest', data);
    return data;
  }

  async function getCategories() {
    if (mem.categories) return mem.categories;

    const cached = NOCACHE ? null : lsGet('categories');
    const data = cached || await fetchJson('categories.json');

    // v3 snapshot shape: { tree, visible, topLevel, withProducts }
    // legacy shape:      { categories: [...] }
    let result;
    if (data && Array.isArray(data.topLevel)) {
      result = {
        tree:         Array.isArray(data.tree)         ? data.tree         : [],
        visible:      Array.isArray(data.visible)      ? data.visible      : [],
        topLevel:     Array.isArray(data.topLevel)     ? data.topLevel     : [],
        withProducts: Array.isArray(data.withProducts) ? data.withProducts : [],
        count:        data.count ?? 0,
        visibleCount: data.visibleCount ?? 0,
      };
    } else if (data && Array.isArray(data.categories)) {
      result = {
        tree:         data.categories,
        visible:      data.categories.filter(c => (c.productCountAll || 0) > 0),
        topLevel:     data.categories.filter(c => c.depth === 0 && (c.productCountAll || 0) > 0),
        withProducts: data.categories.filter(c => (c.productCountDirect || 0) > 0),
        count:        data.categories.length,
        visibleCount: 0,
      };
    } else {
      result = { tree: [], visible: [], topLevel: [], withProducts: [], count: 0, visibleCount: 0 };
    }

    mem.categories = result;
    if (!cached) lsSet('categories', data);
    return result;
  }

  async function getChunk(n) {
    if (mem.chunks.has(n)) return mem.chunks.get(n);

    const key = `chunk-${n}`;
    const cached = NOCACHE ? null : lsGet(key);
    const data = cached || await fetchJson(`catalog-${n}.json`);
    const products = (Array.isArray(data.products) ? data.products : []).map(normalizeProduct);

    mem.chunks.set(n, products);
    if (!cached) lsSet(key, data);
    return products;
  }

  async function getAllProducts() {
    if (mem.allLoaded && mem.chunks.size > 0) {
      return Array.from(mem.chunks.values()).flat();
    }
    const manifest = await getManifest();
    const total = manifest.chunks?.length || 0;

    const tasks = [];
    for (let i = 1; i <= total; i++) tasks.push(getChunk(i));
    await Promise.all(tasks);

    mem.allLoaded = true;
    mem.nextChunk = total + 1;
    return Array.from(mem.chunks.values()).flat();
  }

  async function getFeatured() {
    const manifest = await getManifest();
    const ids = new Set(manifest.featuredIds || []);
    if (!ids.size) return [];
    const all = await getAllProducts();
    return all.filter(p => ids.has(p.id));
  }

  async function getProductById(sku) {
    if (!sku) return null;

    for (const products of mem.chunks.values()) {
      const hit = products.find(p => p.id === sku);
      if (hit) return hit;
    }

    const manifest = await getManifest();
    const total = manifest.chunks?.length || 0;
    for (let i = 1; i <= total; i++) {
      const products = await getChunk(i);
      const hit = products.find(p => p.id === sku);
      if (hit) return hit;
    }
    return null;
  }

  async function loadMore() {
    const manifest = await getManifest();
    const total = manifest.chunks?.length || 0;
    if (mem.nextChunk > total) return [];

    const products = await getChunk(mem.nextChunk);
    mem.nextChunk++;
    return products;
  }

  function hasMore() {
    if (!mem.manifest) return true;
    const total = mem.manifest.chunks?.length || 0;
    return mem.nextChunk <= total;
  }

  function clearCache() {
    mem.manifest = null;
    mem.categories = null;
    mem.chunks.clear();
    mem.nextChunk = 1;
    mem.allLoaded = false;
    lsClear();
  }

  // ---------- export ----------

  window.RainFowCatalog = {
    getManifest,
    getCategories,
    getChunk,
    getAllProducts,
    getFeatured,
    getProductById,
    loadMore,
    hasMore,
    clearCache,

    // Backward-compat shim (v2 API)
    getProducts: async () => getAllProducts(),
    refresh:     async () => { clearCache(); return getAllProducts(); },
  };

  console.log('[catalog] v4 loaded (chunked snapshot, no Supabase)');
})();