/* =========================================================
   RainFow — product-reviews.js
   Review system backed by /data/reviews.json (public, static).
   User-submitted reviews are stored in localStorage and merged.

   File format expected at data/reviews.json:
   {
     "RFFA00001": [
       { "name": "Anas", "rating": 5, "comment": "Great!", "date": "2026-09-30T..." }
     ],
     ...
   }

   Public API:
     RainFowReviews.init(sku)
   ========================================================= */
(function () {
  'use strict';

  const LS_KEY_PREFIX = 'rainfow_reviews_';
  const JSON_URL = 'data/reviews.json';

  let currentSku = null;
  let jsonCache = null;

  function esc(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function readLocal(sku) {
    try {
      const raw = localStorage.getItem(LS_KEY_PREFIX + sku);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function writeLocal(sku, reviews) {
    try {
      localStorage.setItem(LS_KEY_PREFIX + sku, JSON.stringify(reviews));
    } catch {}
  }

  async function loadJson() {
    if (jsonCache) return jsonCache;
    try {
      const res = await fetch(JSON_URL, { cache: 'default' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      jsonCache = (data && typeof data === 'object') ? data : {};
    } catch (err) {
      jsonCache = {};
    }
    return jsonCache;
  }

  async function allReviews(sku) {
    const json = await loadJson();
    const fromJson = Array.isArray(json[sku]) ? json[sku] : [];
    const fromLocal = readLocal(sku);
    return [...fromJson, ...fromLocal];
  }

  function starString(rating) {
    const n = Math.max(0, Math.min(5, Math.round(rating)));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function timeAgo(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString();
  }

  function renderList(reviews) {
    const list = document.getElementById('pd-review-list');
    if (!list) return;

    if (!reviews.length) {
      list.innerHTML = '<p class="pd-review-empty">Be the first to review this product.</p>';
      return;
    }

    const sorted = reviews.slice().sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    list.innerHTML = sorted.map(r => `
      <article class="pd-review">
        <header class="pd-review-head">
          <span class="pd-review-name">${esc(r.name || 'Anonymous')}</span>
          <span class="pd-review-stars" title="${r.rating} out of 5">${starString(r.rating)}</span>
          <span class="pd-review-date">${esc(timeAgo(r.date))}</span>
        </header>
        <p class="pd-review-body">${esc(r.comment)}</p>
      </article>
    `).join('');
  }

  function renderSummary(reviews) {
    const stars = document.getElementById('pd-avg-stars');
    const count = document.getElementById('pd-review-count');
    if (!reviews.length) {
      if (stars) stars.textContent = '☆☆☆☆☆';
      if (count) count.textContent = 'No reviews yet';
      return;
    }
    const avg = reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length;
    if (stars) stars.textContent = starString(avg);
    if (count) count.textContent = `${avg.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? '' : 's'}`;
  }

  async function refresh() {
    if (!currentSku) return;
    const reviews = await allReviews(currentSku);
    renderSummary(reviews);
    renderList(reviews);
  }

  function bindStarInput() {
    const wrap = document.getElementById('pd-star-input');
    const hidden = document.getElementById('pd-review-rating');
    if (!wrap || !hidden) return;

    const stars = wrap.querySelectorAll('.pd-star');
    stars.forEach(s => {
      s.addEventListener('click', () => {
        const val = Number(s.dataset.value);
        hidden.value = String(val);
        stars.forEach(x => x.classList.toggle('is-active', Number(x.dataset.value) <= val));
      });
    });
  }

  function bindForm() {
    const form = document.getElementById('pd-review-form');
    const note = document.getElementById('pd-review-note');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentSku) return;

      const name = (document.getElementById('pd-review-name').value || '').trim();
      const rating = Number(document.getElementById('pd-review-rating').value || 0);
      const comment = (document.getElementById('pd-review-comment').value || '').trim();

      if (!name || !comment || rating < 1) {
        showNote('Please add your name, rating, and a comment.', true);
        return;
      }

      const review = {
        name,
        rating,
        comment,
        date: new Date().toISOString(),
      };

      const existing = readLocal(currentSku);
      existing.push(review);
      writeLocal(currentSku, existing);

      form.reset();
      const hidden = document.getElementById('pd-review-rating');
      if (hidden) hidden.value = '0';
      document.querySelectorAll('#pd-star-input .pd-star').forEach(s => s.classList.remove('is-active'));

      showNote('Thanks! Your review has been saved locally.', false);
      refresh();
    });
  }

  function showNote(msg, isError) {
    const note = document.getElementById('pd-review-note');
    if (!note) return;
    note.hidden = false;
    note.textContent = msg;
    note.classList.toggle('is-error', !!isError);
    setTimeout(() => { note.hidden = true; }, 5000);
  }

  async function init(sku) {
    currentSku = sku;
    bindStarInput();
    bindForm();
    await refresh();
  }

  window.RainFowReviews = { init };
})();