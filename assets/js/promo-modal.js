/* ============================================================
   PROMO MODAL — Shows once per session
   - Waits 1.5s after load (nicer UX)
   - Remembers dismissal in sessionStorage
   - Respects prefers-reduced-motion
   - Closes on Esc, backdrop, or any [data-promo-close]
   ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'rainfow_promo_seen_v1';
  const DELAY_MS    = 1500;

  const modal = document.getElementById('promoModal');
  if (!modal) return;

  /* Don't show if already seen this session */
  if (sessionStorage.getItem(STORAGE_KEY) === '1') return;

  let previouslyFocused = null;

  function openModal() {
    modal.hidden = false;
    document.body.classList.add('promo-modal-open');
    previouslyFocused = document.activeElement;

    /* Focus the close button for accessibility */
    const closeBtn = modal.querySelector('.promo-modal-close');
    if (closeBtn) closeBtn.focus();

    /* Trap focus inside modal */
    document.addEventListener('keydown', onKeydown);

    /* Track impression */
    if (typeof gtag === 'function') {
      gtag('event', 'promo_modal_view', { promo_id: 'first_order_20' });
    }
  }

  function closeModal(reason) {
    modal.hidden = true;
    document.body.classList.remove('promo-modal-open');
    document.removeEventListener('keydown', onKeydown);
    sessionStorage.setItem(STORAGE_KEY, '1');

    if (previouslyFocused && previouslyFocused.focus) {
      previouslyFocused.focus();
    }

    /* Track dismissal */
    if (typeof gtag === 'function') {
      gtag('event', 'promo_modal_close', { promo_id: 'first_order_20', reason });
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      closeModal('escape');
      return;
    }
    /* Simple focus trap */
    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  /* Bind all close triggers */
  modal.querySelectorAll('[data-promo-close]').forEach(el => {
    el.addEventListener('click', (e) => {
      /* Let links navigate */
      const isLink = el.tagName === 'A' && el.getAttribute('href');
      closeModal(isLink ? 'cta' : 'dismiss');
    });
  });

  /* Show after a short delay (or immediately if reduced motion) */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(openModal, prefersReduced ? 300 : DELAY_MS);
})();