#!/usr/bin/env node
/* =========================================================
   RainFow — snapshot-catalog.mjs
   Fetches products from Supabase (service_role) and writes
   data/catalog.json. Run by GitHub Action every 6h.
   ========================================================= */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_FILE = join(ROOT, 'data', 'catalog.json');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars.');
  process.exit(1);
}

const ENDPOINT = `${SUPABASE_URL}/rest/v1/products?select=sku,title,description,category,images,vendor_price,sale_price,min_order_qty,stock,tag,featured,sort_order&active=eq.true&order=sort_order.asc`;

async function main() {
  console.log('Fetching products from Supabase…');

  const res = await fetch(ENDPOINT, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    console.error('Supabase fetch failed:', res.status, res.statusText);
    console.error(await res.text());
    process.exit(1);
  }

  const rows = await res.json();
  console.log(`Fetched ${rows.length} products.`);

  const products = rows.map(r => ({
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
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    count: products.length,
    products
  };

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(`Wrote ${OUT_FILE}`);
}

main().catch(err => {
  console.error('Snapshot failed:', err);
  process.exit(1);
});