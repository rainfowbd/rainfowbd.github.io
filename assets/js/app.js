/* =========================================================
   RainFow — app.js
   Light global wiring. No WhatsApp injection.
   ========================================================= */
(function () {
  'use strict';

  function initYear() {
    const y = document.getElementById('footer-year');
    if (y) y.textContent = new Date().getFullYear();
  }

  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const action = form.getAttribute('action') || '';
    if (action.includes('YOUR_FORM_ID')) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        alert('⚠️ Formspree is not configured yet.');
      });
    }
  }

  function init() {
    initYear();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();