/* ============================================================
   HERO SLIDER — Auto-slide with progress-bar dots
   ============================================================ */
(function () {
  'use strict';

  const slider = document.querySelector('.hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.hero-slide');
  const dots   = slider.querySelectorAll('.hero-dot');
  if (slides.length < 2) return;

  const AUTO_INTERVAL   = 5000;  // must match CSS animation duration
  const SWIPE_THRESHOLD = 40;

  let current     = 0;
  let timer       = null;
  let paused      = false;
  let touchStartX = 0;

  function goTo(index) {
    if (index === current) return;

    /* Reset previous slide + dot */
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');
    /* Reset the progress fill animation */
    const prevFill = dots[current].querySelector('.hero-dot-fill');
    if (prevFill) {
      prevFill.style.animation = 'none';
      void prevFill.offsetWidth; // force reflow
      prevFill.style.animation = '';
    }

    /* Move to new slide */
    current = (index + slides.length) % slides.length;

    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
    /* Restart the progress fill animation */
    const newFill = dots[current].querySelector('.hero-dot-fill');
    if (newFill) {
      newFill.style.animation = 'none';
      void newFill.offsetWidth;
      newFill.style.animation = '';
    }
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    stopAuto();
    if (paused) return;
    timer = setInterval(next, AUTO_INTERVAL);
  }

  function stopAuto() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* ---- Dot clicks ---- */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      startAuto();  // reset the timer so it doesn't jump right after
    });
  });

  /* ---- Pause on hover (desktop) ---- */
  slider.addEventListener('mouseenter', () => { paused = true;  stopAuto(); });
  slider.addEventListener('mouseleave', () => { paused = false; startAuto(); });

  /* ---- Pause on tab hidden ---- */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  /* ---- Swipe ---- */
  slider.addEventListener('touchstart', (e) => {
    paused = true;
    stopAuto();
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      dx < 0 ? next() : prev();
    }
    paused = false;
    startAuto();
  }, { passive: true });

  /* ---- Keyboard ---- */
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
    if (e.key === 'ArrowRight') { next(); startAuto(); }
  });

  /* ---- Boot ---- */
  slides[0].classList.add('is-active');
  dots[0].classList.add('is-active');
  startAuto();
})();