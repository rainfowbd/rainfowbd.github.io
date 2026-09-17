/* =========================================================
   RainFow — Option A include loader
   Usage: <div data-include="partials/header.html"></div>
   ========================================================= */
(function () {
  const placeholders = document.querySelectorAll('[data-include]');
  if (!placeholders.length) return;

  const loadOne = (el) => {
    const url = el.getAttribute('data-include');
    return fetch(url, { cache: 'no-cache' })
      .then(r => {
        if (!r.ok) throw new Error(`${url} → ${r.status}`);
        return r.text();
      })
      .then(html => {
        el.outerHTML = html; // replace placeholder with real markup
      })
      .catch(err => {
        console.error('[include] failed:', err);
        el.innerHTML = `<!-- include failed: ${url} -->`;
      });
  };

  Promise.all([...placeholders].map(loadOne)).then(() => {
    // Fire an event so app.js knows the header/footer are ready
    document.dispatchEvent(new CustomEvent('includes:loaded'));

    // Wire up mobile menu + year after header is in DOM
    const btn   = document.getElementById('mobile-menu-btn');
    const menu  = document.getElementById('mobile-menu');
    if (btn && menu) {
      btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }

    const year = document.getElementById('footer-year');
    if (year) year.textContent = new Date().getFullYear();
  });
})();