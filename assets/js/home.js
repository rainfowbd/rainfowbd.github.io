/* =========================================================
   RainFow — Home Page Scripts (index.html only)
   Contains: news ticker, banners loader, survey images,
             bilingual survey, and borderless service cards
   ========================================================= */
(function () {
  'use strict';

  /* =======================================================
     NEWS TICKER
     Fetches data/news.json → renders marquee items
     ======================================================= */
  (function initNewsTicker() {
    var track = document.getElementById('home-news-track');
    if (!track) return;

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function render(items) {
      if (!Array.isArray(items) || !items.length) return;
      // Duplicate items so the marquee loops seamlessly
      var html = items.concat(items).map(function (t) {
        return '<span class="home-news-item">' + escapeHtml(t) + '</span>';
      }).join('');
      track.innerHTML = html;
    }

    fetch('data/news.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('no news');
        return r.json();
      })
      .then(function (data) {
        var items = Array.isArray(data) ? data : (data && data.items);
        render(items);
      })
      .catch(function () { /* fail silently — static fallback stays */ });
  })();

  /* =======================================================
     BANNERS (Hero Slider, Side Promos, Promo Modal)
     Fetches data/banners.json → populates banner images & links
     ======================================================= */
  (function initBanners() {
    fetch('data/banners.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('no banners');
        return r.json();
      })
      .then(function (data) {
        if (!data) return;

        // 1. Hero slides
        if (Array.isArray(data.heroSlides)) {
          var slides = document.querySelectorAll('.hero-slider .hero-slide');
          slides.forEach(function (slide, i) {
            var item = data.heroSlides[i];
            if (!item) return;
            var link = slide.querySelector('a.hero-slide-link');
            var img  = slide.querySelector('img');
            if (link) {
              if (item.href)  link.setAttribute('href', item.href);
              if (item.label) link.setAttribute('aria-label', item.label);
            }
            if (img) {
              if (item.image) img.src = item.image;
              if (item.alt)   img.alt = item.alt;
            }
          });
        }

        // 2. Side promo banners
        if (Array.isArray(data.sidePromos)) {
          var promos = document.querySelectorAll('.hero-promo-side a.promo-banner');
          promos.forEach(function (link, i) {
            var item = data.sidePromos[i];
            if (!item) return;
            var img = link.querySelector('img');
            if (item.href)  link.setAttribute('href', item.href);
            if (item.label) link.setAttribute('aria-label', item.label);
            if (img) {
              if (item.image) img.src = item.image;
              if (item.alt)   img.alt = item.alt;
            }
          });
        }

        // 3. Promo popup modal
        if (data.promoModal) {
          var modalLink = document.querySelector('#promoModal a.promo-modal-link');
          if (modalLink) {
            var modalImg = modalLink.querySelector('img');
            if (data.promoModal.href)  modalLink.setAttribute('href', data.promoModal.href);
            if (data.promoModal.label) modalLink.setAttribute('aria-label', data.promoModal.label);
            if (modalImg) {
              if (data.promoModal.image) modalImg.src = data.promoModal.image;
              if (data.promoModal.alt)   modalImg.alt = data.promoModal.alt;
            }
          }
        }
      })
      .catch(function () { /* fail silently — waiting.jpg fallback stays */ });
  })();

  /* =======================================================
     SURVEY IMAGES
     Fetches data/survey.json → populates each slide image
     ======================================================= */
  (function initSurveyImages() {
    function applyImages(slidesMap) {
      if (!slidesMap || typeof slidesMap !== 'object') return;
      Object.keys(slidesMap).forEach(function (key) {
        var cfg = slidesMap[key];
        if (!cfg) return;
        var img = document.querySelector('.home-survey-slide[data-slide="' + key + '"] .survey-card-media img');
        if (!img) return;
        var fallback = cfg.fallback || 'images/waiting.jpg';
        img.onerror = function () {
          this.onerror = null;
          this.src = fallback;
        };
        if (cfg.alt) img.alt = cfg.alt;
        if (cfg.image) img.src = cfg.image;
      });
    }

    fetch('data/survey.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('no survey json');
        return r.json();
      })
      .then(function (data) {
        applyImages(data && data.slides);
      })
      .catch(function () { /* keep HTML fallback images */ });
  })();

  /* =======================================================
     BUSINESS SURVEY (bilingual EN/BN)
     Persists to localStorage, routes to products/services
     ======================================================= */
  (function initSurvey() {
    var SURVEY_KEY = 'rainfow_survey';
    var LANG_KEY   = 'rainfow_lang';

    var state = { lang: 'en', q1: null, q2: null, q3: null, route: null };

    try {
      var savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang === 'en' || savedLang === 'bn') state.lang = savedLang;
    } catch (e) { /* localStorage blocked — keep defaults */ }

    var slides     = document.querySelectorAll('.home-survey-slide');
    var progress   = document.querySelectorAll('.home-survey-progress span');
    var resultText = document.getElementById('home-survey-result-text');
    var goBtn      = document.getElementById('home-survey-go');

    function applyLang(lang) {
      state.lang = lang === 'bn' ? 'bn' : 'en';
      document.documentElement.lang = state.lang;
      document.querySelectorAll('[data-en][data-bn]').forEach(function (el) {
        var v = el.getAttribute('data-' + state.lang);
        if (v !== null) el.textContent = v;
      });
      document.querySelectorAll('[data-survey-lang]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-survey-lang') === state.lang);
      });
      try { localStorage.setItem(LANG_KEY, state.lang); } catch (e) {}
    }

    /* --- Wire language toggle (delegated so async header works even without survey slides) --- */
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-survey-lang]');
      if (!btn) return;
      applyLang(btn.getAttribute('data-survey-lang'));
    });

    document.addEventListener('partials:loaded', function () {
      applyLang(state.lang);
    });

    if (!slides.length) {
      applyLang(state.lang);
      return;
    }

    function showSlide(name) {
      slides.forEach(function (s) {
        s.classList.toggle('is-active', s.getAttribute('data-slide') === name);
      });
      var order = { q1: 0, q1b: 0, q2: 1, q3: 2, result: 3 };
      var idx = order[name] !== undefined ? order[name] : 0;
      progress.forEach(function (p, i) {
        p.classList.remove('active', 'done');
        if (idx >= 3)       p.classList.add('done');
        else if (i < idx)   p.classList.add('done');
        else if (i === idx) p.classList.add('active');
      });
    }

    function saveState() {
      try {
        localStorage.setItem(SURVEY_KEY, JSON.stringify({
          willing: state.q1,
          preference: state.q2,
          market: state.q3,
          route: state.route,
          source: 'home',
          date: new Date().toISOString()
        }));
      } catch (e) {}
    }

    function routeAndGo() {
      var dest = state.q2 === 'service' ? 'services.html' : 'products.html';
      var en = 'Taking you to ' + (state.q2 === 'service' ? 'Our Services' : 'Our Products') + ' now…';
      var bn = 'আপনাকে ' + (state.q2 === 'service' ? 'আমাদের সেবা' : 'আমাদের পণ্য') + '-এ নিয়ে যাচ্ছি…';
      if (resultText) {
        resultText.setAttribute('data-en', en);
        resultText.setAttribute('data-bn', bn);
        resultText.textContent = state.lang === 'bn' ? bn : en;
      }
      showSlide('result');
      saveState();
      setTimeout(function () { window.location.href = dest; }, 1800);
    }

    /* --- Q1: yes / no --- */
    document.querySelectorAll('[data-q1]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.q1 = btn.getAttribute('data-q1');
        showSlide(state.q1 === 'yes' ? 'q2' : 'q1b');
      });
    });

    /* --- Q1b: products / services (early exit) --- */
    document.querySelectorAll('[data-q1b]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = btn.getAttribute('data-q1b');
        state.route = v;
        saveState();
        window.location.href = v === 'services' ? 'services.html' : 'products.html';
      });
    });

    /* --- Q2: product / service --- */
    document.querySelectorAll('[data-q2]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.q2 = btn.getAttribute('data-q2');
        showSlide('q3');
      });
    });

    /* --- Q3: bangladesh / global → result --- */
    document.querySelectorAll('[data-q3]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.q3 = btn.getAttribute('data-q3');
        routeAndGo();
      });
    });

    /* --- Result screen "Continue" button --- */
    if (goBtn) {
      goBtn.addEventListener('click', function () {
        window.location.href = state.q2 === 'service' ? 'services.html' : 'products.html';
      });
    }

    /* --- Boot --- */
    applyLang(state.lang);
    showSlide('q1');
  })();

  /* =======================================================
     OUR SERVICES
     Fetches data/services.json → updates or renders borderless
     cards (80% top image + service name only, no subtext)
     ======================================================= */
  (function initServices() {
    var grid = document.getElementById('home-services-grid') ||
               document.querySelector('.home-services-grid');
    if (!grid) return;

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function syncServiceLang() {
      var lang = 'en';
      try {
        var saved = localStorage.getItem('rainfow_lang');
        if (saved === 'bn' || saved === 'en') lang = saved;
      } catch (e) {}
      grid.querySelectorAll('[data-en][data-bn]').forEach(function (el) {
        var val = el.getAttribute('data-' + lang);
        if (val !== null) el.textContent = val;
      });
    }

    function renderServices(items) {
      if (!Array.isArray(items) || !items.length) return;
      grid.innerHTML = items.map(function (raw) {
        var item     = raw || {};
        var nameVal  = item.name || item.title || '';
        var href     = escapeHtml(item.href || item.url || 'services.html');
        var name     = escapeHtml(nameVal);
        var nameEn   = escapeHtml(item.nameEn || item.titleEn || nameVal);
        var nameBn   = escapeHtml(item.nameBn || item.titleBn || nameVal);
        var imgSrc   = escapeHtml(item.image || item.img || 'images/waiting.jpg');
        var fallback = escapeHtml(item.fallback || 'images/waiting.jpg');
        var langAttr = (item.nameEn || item.nameBn || item.titleEn || item.titleBn)
          ? ' data-en="' + nameEn + '" data-bn="' + nameBn + '"'
          : '';

        return (
          '<a class="home-service-card cat-item" href="' + href + '">' +
            '<div class="home-service-inner cat-item-inner">' +
              '<div class="home-service-media cat-icon">' +
                '<img src="' + imgSrc + '" alt="' + name + '" loading="lazy" ' +
                     'onerror="this.onerror=null;this.src=\'' + fallback + '\';">' +
              '</div>' +
              '<p class="home-service-name"' + langAttr + '>' + name + '</p>' +
            '</div>' +
          '</a>'
        );
      }).join('');

      syncServiceLang();
    }

    grid.querySelectorAll('.home-service-sub').forEach(function (sub) {
      sub.remove();
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-survey-lang]')) {
        setTimeout(syncServiceLang, 0);
      }
    });

    document.addEventListener('partials:loaded', function () {
      setTimeout(syncServiceLang, 0);
    });

    fetch('data/services.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('no services json');
        return r.json();
      })
      .then(function (data) {
        var list = Array.isArray(data) ? data : (data && (data.items || data.services));
        renderServices(list);
      })
      .catch(function () {
        syncServiceLang();
      });
  })();
})();
