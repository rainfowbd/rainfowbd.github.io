/* =========================================================
   RainFow — product-zoom.js
   Fullscreen zoom modal for the main product image.
   Public API:
     RainFowZoom.open(src, alt)
     RainFowZoom.close()
   ========================================================= */
(function () {
  'use strict';

  let modal, scroll, imgEl, closeBtn, lastFocus;

  function ensureRefs() {
    if (modal) return;
    modal    = document.getElementById('pd-zoom-modal');
    scroll   = document.getElementById('pd-zoom-scroll');
    imgEl    = document.getElementById('pd-zoom-image');
    closeBtn = document.getElementById('pd-zoom-close');

    closeBtn.addEventListener('click', close);
    scroll.addEventListener('click', (e) => {
      // Click on the backdrop (not the image) closes
      if (e.target === scroll) close();
    });
    scroll.addEventListener('click', (e) => {
      if (e.target === imgEl) {
        scroll.classList.toggle('is-zoomed');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.hidden) close();
    });
  }

  function open(src, alt) {
    ensureRefs();
    if (!modal) return;
    lastFocus = document.activeElement;
    imgEl.src = src;
    imgEl.alt = alt || '';
    scroll.classList.remove('is-zoomed');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    ensureRefs();
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.RainFowZoom = { open, close };
})();