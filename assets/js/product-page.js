/* =========================================================
   RainFow — product-page.js (v2)
   Single product view. Reads ?id=SKU.
   ========================================================= */
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function showError(msg) {
    console.warn('[product-page]', msg);
    hide($('#product-loading'));
    show($('#product-error'));
    hide($('#product-detail'));
  }

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  // ---------- Breadcrumb ----------
  function setBreadcrumb(product, categoryTree) {
    const crumb = $('#product-breadcrumb');
    const current = $('#crumb-product') || crumb.querySelector('.crumb-current');
    if (!crumb || !current) return;

    const slug = product.category || '';
    const ancestors = [];
    let cursor = slug;
    const map = new Map((categoryTree || []).map(c => [c.slug, c]));

    let safety = 0;
    while (cursor && map.has(cursor) && safety++ < 20) {
      const node = map.get(cursor);
      ancestors.unshift(node);
      cursor = node.parentSlug;
    }

    // Rebuild breadcrumb: Home / [ancestors] / Product
    const parts = [
      `<a href="index.html">Home</a>`,
      `<a href="products.html">All Products</a>`,
    ];

    ancestors.forEach((node, i) => {
      const isLast = i === ancestors.length - 1;
      if (isLast) {
        parts.push(`<a href="products.html?cat=${encodeURIComponent(node.slug)}">${esc(node.name)}</a>`);
      } else {
        parts.push(`<a href="products.html?cat=${encodeURIComponent(node.slug)}">${esc(node.name)}</a>`);
      }
    });

    parts.push(`<span class="crumb-current">${esc(product.name)}</span>`);
    crumb.innerHTML = parts.join(' <span class="crumb-sep">/</span> ');
  }

  // ---------- Gallery ----------
  function renderGallery(images, name, productId) {
    const main = $('#pd-main-image');
    const thumbs = $('#pd-thumbs');
    const mainWrap = $('#pd-main-wrap');
    if (!main || !thumbs) return;

    const urls = Array.isArray(images) && images.length ? images : [];
    if (!urls.length) {
      main.src = '';
      main.alt = name;
      main.style.background = '#f0f0f0';
      return;
    }

    main.src = urls[0];
    main.alt = name;

    if (urls.length <= 1) {
      thumbs.innerHTML = '';
      thumbs.style.display = 'none';
      return;
    }

    thumbs.style.display = '';
    thumbs.innerHTML = urls.map((url, i) => `
      <button type="button" class="pd-thumb ${i === 0 ? 'is-active' : ''}"
              data-src="${esc(url)}" aria-label="View image ${i + 1}">
        <img src="${esc(url)}" alt="${esc(name)} view ${i + 1}" loading="lazy">
      </button>
    `).join('');

    thumbs.querySelectorAll('.pd-thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        main.src = btn.dataset.src;
        thumbs.querySelectorAll('.pd-thumb').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // Click main image to open zoom modal
    const openZoom = () => {
      if (!main.src) return;
      if (window.RainFowZoom) window.RainFowZoom.open(main.src, name);
    };
    mainWrap && mainWrap.addEventListener('click', openZoom);
    const zoomBtn = $('#pd-zoom-btn');
    zoomBtn && zoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openZoom();
    });
  }

  // ---------- Price block ----------
  function priceBlock(p) {
    if (p.pricingMode === 'priced' && p.salePrice != null) {
      const now = '৳' + Number(p.salePrice).toLocaleString();
      const market = (p.marketPrice != null && p.marketPrice > p.salePrice)
        ? `<span class="pd-price-market">৳${Number(p.marketPrice).toLocaleString()}</span>`
        : '';
      return `<span class="pd-price-now">${now}</span>${market}`;
    }
    if (p.pricingMode === 'contact') {
      return `<span class="pd-price-contact">Contact for Price</span>`;
    }
    return `<span class="pd-price-contact">Price on request</span>`;
  }

  // ---------- Specs ----------
  function renderSpecs(specs) {
    const section = $('#pd-specs-section');
    const wrap = $('#pd-specs');
    if (!section || !wrap) return;

    if (!specs || typeof specs !== 'object') {
      section.hidden = true;
      return;
    }

    const entries = Object.entries(specs).filter(([k, v]) =>
      k && v != null && String(v).trim() !== ''
    );

    if (!entries.length) {
      section.hidden = true;
      return;
    }

    wrap.innerHTML = entries.map(([k, v]) => `
      <div class="pd-spec-key">${esc(k)}</div>
      <div class="pd-spec-val">${esc(v)}</div>
    `).join('');
    section.hidden = false;
  }

  // ---------- Meta + Brand ----------
  function extractBrand(specs) {
    if (!specs || typeof specs !== 'object') return '';
    const keys = Object.keys(specs);
    const brandKey = keys.find(k => /^brand$/i.test(k.trim()));
    if (brandKey) return String(specs[brandKey] || '').trim();
    return '';
  }

  // ---------- Share ----------
  function wireShare(product) {
    const buttons = document.querySelectorAll('.pd-share-btn');
    const url = window.location.href;
    const text = `${product.name} — RainFow Bangladesh`;

    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const kind = btn.dataset.share;
        if (kind === 'facebook') {
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '_blank', 'noopener,width=600,height=500'
          );
        } else if (kind === 'whatsapp') {
          window.open(
            `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
            '_blank', 'noopener'
          );
        } else if (kind === 'copy') {
          try {
            await navigator.clipboard.writeText(url);
            btn.setAttribute('title', 'Copied!');
            setTimeout(() => btn.removeAttribute('title'), 1800);
          } catch {}
        }
      });
    });
  }

  // ---------- Meta tags for SEO + sharing ----------
  function setMeta(product) {
    const title = `${product.name} — RainFow BD`;
    document.title = title;

    const setAttr = (sel, val) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', val);
    };

    setAttr('#meta-description', (product.description || '').slice(0, 160));
    setAttr('#og-title', title);
    setAttr('#og-description', (product.description || '').slice(0, 160));
    setAttr('#og-image', product.image || 'https://rainfowbd.com/images/logo-sq.png');
    setAttr('#og-url', window.location.href);
    setAttr('#canonical-link', window.location.href);
  }

  // ---------- Render ----------
  function renderProduct(p, categoryTree) {
    setMeta(p);
    setBreadcrumb(p, categoryTree);

    $('#pd-title').textContent = p.name;
    $('#pd-sku').textContent = p.id;

    const tagEl = $('#pd-tag');
    if (p.tag) {
      tagEl.textContent = p.tag;
      tagEl.classList.remove('hidden');
    } else {
      tagEl.classList.add('hidden');
    }

    // Summary: description truncated to first 3 lines
    const desc = String(p.description || '');
    const summary = desc.length > 240 ? desc.slice(0, 240).trim() + '…' : desc;
    $('#pd-summary').textContent = summary;

    $('#pd-price-block').innerHTML = priceBlock(p);

    const noteEl = $('#pd-contact-note');
    if (p.contactNote) {
      noteEl.textContent = p.contactNote;
      noteEl.classList.remove('hidden');
    } else {
      noteEl.classList.add('hidden');
    }

    $('#pd-category').textContent = p.category || '—';
    $('#pd-stock').textContent = p.stock > 0 ? `In stock (${p.stock})` : 'Out of stock';
    $('#pd-moq').textContent = p.minOrderQty ? `${p.minOrderQty} pcs` : '—';

    const brand = extractBrand(p.specifications);
    const brandWrap = $('#pd-brand-wrap');
    if (brand) {
      $('#pd-brand').textContent = brand;
      brandWrap.hidden = false;
    } else {
      brandWrap.hidden = true;
    }

    // WhatsApp deep link
    const waNumber = (window.RAINFOW_CONFIG && window.RAINFOW_CONFIG.WHATSAPP_NUMBER) || '8801876757033';
    const waText = `Hi RainFow! I'm interested in ${p.id} - ${p.name}`;
    const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    const waEl = $('#pd-whatsapp');
    if (waEl) waEl.href = waHref;

    // Add to cart wiring
    const cartBtn = $('#pd-add-to-cart');
    if (cartBtn) {
      cartBtn.dataset.id = p.id;
      cartBtn.dataset.name = p.name;
      cartBtn.dataset.price = p.salePrice ?? 0;
      cartBtn.dataset.image = p.image || '';
    }

    renderGallery(p.images && p.images.length ? p.images : [p.image].filter(Boolean), p.name, p.id);
    renderSpecs(p.specifications);
    wireShare(p);

    if (window.RainFowReviews) window.RainFowReviews.init(p.id);
    if (window.RainFowSimilar) window.RainFowSimilar.render(p);
  }

  // ---------- Init ----------
  async function init() {
    const id = getParam('id');
    if (!id) return showError('No ?id= param');

    if (!window.RainFowCatalog) {
      return showError('RainFowCatalog not loaded — check script order');
    }

    try {
      const [product, cats] = await Promise.all([
        window.RainFowCatalog.getProductById(id),
        window.RainFowCatalog.getCategories(),
      ]);

      if (!product) return showError('Product not found: ' + id);

      renderProduct(product, cats.tree || []);

      hide($('#product-loading'));
      hide($('#product-error'));
      show($('#product-detail'));
    } catch (err) {
      console.error('[product-page] fetch failed:', err);
      showError('Catalog fetch failed');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();