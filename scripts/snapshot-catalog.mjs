#!/usr/bin/env node
/* =========================================================
   RainFow — snapshot-catalog.mjs  (v2, chunked + categories)
   Reads from SERVING DB, writes static JSON:
     data/manifest.json       → { generatedAt, chunks, categories, totals }
     data/categories.json     → full category tree
     data/catalog-1.json      → first 24 products
     data/catalog-2.json      → next 24
     ...
   Every 6h via GitHub Action. Public site NEVER hits Supabase.
   ========================================================= */

import { writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');

const SUPABASE_URL = process.env.SD_SUPABASE_URL;
const SUPABASE_KEY = process.env.SD_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SD_SUPABASE_URL or SD_SUPABASE_SERVICE_KEY env vars.');
  process.exit(1);
}

const CHUNK_SIZE = 24;
const REST = `${SUPABASE_URL}/rest/v1`;

const HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  Accept: 'application/json',
};

async function fetchAll(table, query) {
  const url = `${REST}/${table}?${query}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    console.error(`Fetch ${table} failed:`, res.status, await res.text());
    process.exit(1);
  }
  return res.json();
}

async function wipeOldChunks() {
  await mkdir(DATA_DIR, { recursive: true });
  const files = await readdir(DATA_DIR).catch(() => []);
  for (const f of files) {
    if (/^catalog-\d+\.json$/.test(f)) {
      await unlink(join(DATA_DIR, f)).catch(() => {});
    }
  }
}

async function writeJson(file, payload) {
  await writeFile(join(DATA_DIR, file), JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function normalizeProduct(r) {
  const images = Array.isArray(r.images) ? r.images : [];
  const firstImage = images.length
    ? (typeof images[0] === 'string' ? images[0] : images[0].md || images[0].sm || images[0].lg || '')
    : '';

  return {
    id:           r.sku,
    name:         r.title,
    category:     r.category,
    tag:          r.tag || '',
    featured:     !!r.featured,
    image:        firstImage,
    images:       images.map(i => typeof i === 'string' ? i : (i.md || i.sm || i.lg || '')).filter(Boolean),
    description:  r.description || '',
    pricingMode:  r.pricing_mode || 'unpriced',
    marketPrice:  r.market_price,
    salePrice:    r.sale_price,
    contactNote:  r.contact_note || '',
    minOrderQty:  r.min_order_qty ?? 1,
    stock:        r.stock ?? 0,
    sortOrder:    r.sort_order ?? 0,
  };
}

async function main() {
  console.log('RainFow snapshot — start');

  // 1. Categories (active only, ordered by depth so tree builds correctly)
  const rawCats = await fetchAll(
    'categories',
    'select=slug,name,parent_slug,path,depth,sort_order&order=depth.asc,sort_order.asc,slug.asc'
  );
  console.log(`Fetched ${rawCats.length} categories.`);

  const categories = rawCats.map(c => ({
    slug:        c.slug,
    name:        c.name,
    parentSlug:  c.parent_slug || null,
    path:        c.path,
    depth:       c.depth,
    sortOrder:   c.sort_order ?? 0,
  }));

  // 2. Products (serving DB = already filtered to live + non-deleted)
  const rawProds = await fetchAll(
    'products',
    'select=sku,title,description,category,images,pricing_mode,market_price,sale_price,contact_note,min_order_qty,stock,tag,featured,sort_order&order=sort_order.asc,sku.asc'
  );
  console.log(`Fetched ${rawProds.length} products.`);

  const products = rawProds.map(normalizeProduct);

  // 3. Featured products — build a stable list for the homepage hero/first section
  const featured = products.filter(p => p.featured);

  // 4. Chunk products
  await wipeOldChunks();
  const chunks = [];
  for (let i = 0; i < products.length; i += CHUNK_SIZE) {
    const idx = Math.floor(i / CHUNK_SIZE) + 1;
    const slice = products.slice(i, i + CHUNK_SIZE);
    const file = `catalog-${idx}.json`;
    await writeJson(file, {
      chunk: idx,
      count: slice.length,
      products: slice,
    });
    chunks.push({ file, chunk: idx, count: slice.length });
  }
  console.log(`Wrote ${chunks.length} product chunks.`);

  // 5. Categories file
  await writeJson('categories.json', {
    generatedAt: new Date().toISOString(),
    count: categories.length,
    categories,
  });

  // 6. Manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    version: 2,
    chunkSize: CHUNK_SIZE,
    totals: {
      products: products.length,
      categories: categories.length,
      featured: featured.length,
    },
    chunks,
    featuredIds: featured.map(p => p.id),
  };
  await writeJson('manifest.json', manifest);

  console.log(`Done. products=${products.length} categories=${categories.length} chunks=${chunks.length}`);
}

main().catch(err => {
  console.error('Snapshot failed:', err);
  process.exit(1);
});