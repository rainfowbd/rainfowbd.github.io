/* ============================================
   RainFow — Main App (e-commerce)
   - Renders dynamic sections from data/content.json
   - Wires mobile menu, navbar scroll, footer year
   - Contact form guard
   - Cart preview + add-to-cart handled by include.js
   (Floating WhatsApp lives in partials/footer.html — do NOT re-inject here)
   ============================================ */
(function () {
    'use strict';

    const cfg = window.RAINFOW_CONFIG || {};

    // ---------- Helpers ----------
    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    function esc(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function formatBDT(n) {
        if (n == null || n === '') return '';
        return '৳' + Number(n).toLocaleString('en-BD');
    }

    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d)) return '';
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    // ---------- Fetch content ----------
    async function loadContent() {
        const url = cfg.CONTENT_URL || 'data/content.json';
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error('Failed to load content: ' + res.status);
        return res.json();
    }

    // =========================================================
    // RENDERERS — all guard-check their target element,
    // so missing sections simply no-op.
    // =========================================================

    function renderAgency(data) {
        const a = data.agency || {};

        $$('[data-agency]').forEach(el => {
            const key = el.dataset.agency;
            if (key in a) el.textContent = a[key];
        });

        $$('[data-stat]').forEach(el => {
            const key = el.dataset.stat;
            if (a[key] != null) el.textContent = a[key] + '+';
        });

        const badge = $('[data-availability]');
        if (badge) badge.classList.toggle('hidden', !a.available);
    }

    function renderSocial(data) {
        const s = data.social || {};
        $$('[data-social]').forEach(el => {
            const key = el.dataset.social;
            const url = s[key];
            if (url) {
                el.href = url;
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    }

    function renderServices(data) {
        const list = $('#services-list');
        if (!list) return;
        const items = data.services || [];

        list.innerHTML = items.map(s => `
            <div class="reveal group bg-white rounded-2xl p-8 border border-gray-100
                        hover:border-brand-200 hover:shadow-xl hover:-translate-y-1
                        transition-all duration-300">
                <div class="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center
                            text-3xl mb-5 group-hover:scale-110 transition">
                    ${esc(s.icon || '⚡')}
                </div>
                <h3 class="text-xl font-bold mb-3">${esc(s.title)}</h3>
                <p class="text-gray-600 leading-relaxed mb-4">${esc(s.description)}</p>
                ${s.price_from ? `
                    <p class="text-sm text-gray-500">
                        Starting from
                        <span class="font-bold text-brand-600">${formatBDT(s.price_from)}</span>
                    </p>
                ` : ''}
            </div>
        `).join('');
    }

    function renderProjects(data) {
        const list = $('#projects-list');
        if (!list) return;
        const items = (data.projects || []).slice(0, 6);

        if (!items.length) {
            list.innerHTML = `
                <div class="col-span-full text-center text-gray-500 py-12">
                    No projects yet.
                </div>`;
            return;
        }

        list.innerHTML = items.map(p => {
            const techList = (p.technologies || '')
                .split(',').map(t => t.trim()).filter(Boolean);

            return `
                <div class="reveal group bg-white rounded-2xl overflow-hidden border border-gray-100
                            hover:shadow-2xl transition-all duration-300">
                    <div class="relative aspect-video bg-gradient-to-br from-brand-500 to-purple-600
                                flex items-center justify-center overflow-hidden">
                        ${p.image
                            ? `<img src="${esc(p.image)}" alt="${esc(p.title)}"
                                    class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    onerror="this.style.display='none'">`
                            : `<div class="text-white text-5xl opacity-60 group-hover:scale-110 transition duration-500">💼</div>`}
                        ${p.featured
                            ? `<span class="absolute top-3 right-3 bg-yellow-400 text-yellow-900
                                             text-xs font-bold px-2.5 py-1 rounded">⭐ Featured</span>`
                            : ''}
                    </div>
                    <div class="p-6">
                        ${p.category ? `
                            <span class="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                                ${esc(p.category)}
                            </span>
                        ` : ''}
                        <h3 class="text-lg font-bold mt-1 mb-2 group-hover:text-brand-600 transition">
                            ${esc(p.title)}
                        </h3>
                        <p class="text-sm text-gray-600 mb-4 line-clamp-2">${esc(p.description)}</p>
                        ${techList.length ? `
                            <div class="flex flex-wrap gap-1.5 mb-4">
                                ${techList.map(t => `
                                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        ${esc(t)}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="flex justify-between items-center text-xs text-gray-500
                                    pt-3 border-t border-gray-100">
                            <span>${esc(p.client || 'Confidential')}</span>
                            ${p.completed_at ? `<span>${formatDate(p.completed_at)}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderWhyUs(data) {
        const list = $('#why-list');
        if (!list) return;
        const items = data.why_us || [];

        list.innerHTML = items.map(w => `
            <div class="reveal text-center p-6">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600
                            flex items-center justify-center text-3xl mb-4 shadow-lg shadow-brand-500/30">
                    ${esc(w.icon)}
                </div>
                <h3 class="font-bold text-lg mb-2">${esc(w.title)}</h3>
                <p class="text-gray-600 text-sm">${esc(w.description)}</p>
            </div>
        `).join('');
    }

    function renderProcess(data) {
        const list = $('#process-list');
        if (!list) return;
        const items = data.process || [];

        list.innerHTML = items.map((s, i) => `
            <div class="reveal relative">
                <div class="text-6xl font-extrabold text-white/10 mb-2">${esc(s.number)}</div>
                <h3 class="text-xl font-bold mb-2 -mt-6">${esc(s.title)}</h3>
                <p class="text-gray-400">${esc(s.description)}</p>
                ${i < items.length - 1
                    ? `<div class="hidden lg:block absolute top-8 right-0 text-brand-500 text-2xl">→</div>`
                    : ''}
            </div>
        `).join('');
    }

    function renderTestimonials(data) {
        const list = $('#testimonials-list');
        if (!list) return;
        const items = data.testimonials || [];

        if (!items.length) { list.innerHTML = ''; return; }

        list.innerHTML = items.slice(0, 3).map(t => `
            <div class="reveal bg-white rounded-2xl p-8 border border-gray-100
                        hover:shadow-xl transition">
                <div class="flex mb-4">
                    ${'★'.repeat(t.rating || 5).split('').map(() =>
                        `<span class="text-yellow-400 text-lg">★</span>`
                    ).join('')}
                </div>
                <p class="text-gray-700 leading-relaxed mb-6 italic">"${esc(t.message)}"</p>
                <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div class="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-purple-600
                                flex items-center justify-center text-white font-bold">
                        ${esc((t.name || '?').charAt(0).toUpperCase())}
                    </div>
                    <div>
                        <p class="font-bold text-sm">${esc(t.name)}</p>
                        <p class="text-xs text-gray-500">${esc(t.company || '')}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderPricing(data) {
        const list = $('#pricing-list');
        if (!list) return;
        const items = data.pricing || [];

        list.innerHTML = items.map(p => `
            <div class="reveal relative rounded-2xl p-8 border-2
                        ${p.highlight
                            ? 'border-brand-600 bg-white shadow-2xl shadow-brand-500/20 md:scale-105'
                            : 'border-gray-200 bg-white'}">

                ${p.highlight
                    ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2
                                     bg-gradient-to-r from-brand-500 to-purple-600 text-white
                                     text-xs font-bold px-4 py-1 rounded-full">
                            Most Popular
                       </span>`
                    : ''}

                <h3 class="text-xl font-bold mb-1">${esc(p.name)}</h3>
                <p class="text-sm text-gray-500 mb-4">${esc(p.description)}</p>

                <div class="mb-6">
                    ${p.price === 'Custom'
                        ? `<span class="text-4xl font-extrabold bg-gradient-to-r from-brand-500
                                          to-purple-600 bg-clip-text text-transparent">Custom</span>`
                        : `<span class="text-4xl font-extrabold">৳${esc(p.price)}</span>
                           <span class="text-gray-500 text-sm"> ${esc(p.period || '')}</span>`}
                </div>

                <ul class="space-y-3 mb-6">
                    ${(p.features || []).map(f => `
                        <li class="flex items-start gap-2 text-sm">
                            <span class="text-brand-600 font-bold mt-0.5">✓</span>
                            <span class="text-gray-700">${esc(f)}</span>
                        </li>
                    `).join('')}
                </ul>

                <a href="#contact"
                   class="block w-full text-center py-3 rounded-lg font-semibold transition
                          ${p.highlight
                              ? 'bg-brand-600 text-white hover:bg-brand-700'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}">
                    Get Started
                </a>
            </div>
        `).join('');
    }

    function renderClients(data) {
        const list = $('#clients-list');
        if (!list) return;
        const items = data.clients || [];

        list.innerHTML = items.map(c => `
            <span class="text-lg font-bold text-gray-700">${esc(c.name)}</span>
        `).join('');
    }

    function renderServiceOptions(data) {
        const select = $('#service-select');
        if (!select) return;
        const items = data.services || [];

        items.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.title;
            opt.textContent = s.title;
            select.appendChild(opt);
        });
    }

    function renderContactInfo(data) {
        const a = data.agency || {};
        const setText = (sel, val) => {
            const el = $(sel);
            if (el) el.textContent = val || '';
        };
        setText('#contact-email',   a.email);
        setText('#contact-phone',   a.phone);
        setText('#contact-address', a.address);

        const emailLink = $('[data-mailto]');
        if (emailLink && a.email) emailLink.href = 'mailto:' + a.email;

        const phoneLink = $('[data-tel]');
        if (phoneLink && a.phone) phoneLink.href = 'tel:' + a.phone;
    }

    // =========================================================
    // INTERACTIONS
    // =========================================================

    function initContactForm() {
        const form = $('#contact-form');
        if (!form) return;

        const formAction = form.getAttribute('action') || '';
        if (formAction.includes('YOUR_FORM_ID')) {
            form.addEventListener('submit', e => {
                e.preventDefault();
                alert('⚠️ Formspree is not configured yet.\n\n' +
                      'Edit assets/js/config.js and paste your Formspree form ID.');
            });
        }
    }

    // ❌ REMOVED: initWhatsApp()
    // The floating WhatsApp button now lives in partials/footer.html
    // and is styled by .wa-float in style.css. Do NOT re-inject it here.

    function initReveal() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        $$('.reveal').forEach(el => {
            el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700');
            observer.observe(el);
        });
    }

    function initMobileMenu() {
        const btn  = $('#mobile-menu-btn');
        const menu = $('#mobile-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', () => menu.classList.toggle('hidden'));

        $$('#mobile-menu a').forEach(a => {
            a.addEventListener('click', () => menu.classList.add('hidden'));
        });
    }

    function initNavbarScroll() {
        const nav = $('#navbar');
        if (!nav) return;
        window.addEventListener('scroll', () => {
            nav.classList.toggle('shadow-lg', window.scrollY > 20);
        });
    }

    function initYear() {
        const y = $('#footer-year');
        if (y) y.textContent = new Date().getFullYear();
    }

    // =========================================================
    // BOOT
    // =========================================================
    async function init() {
        try {
            const data = await loadContent();

            renderAgency(data);
            renderSocial(data);
            renderServices(data);
            renderProjects(data);
            renderWhyUs(data);
            renderProcess(data);
            renderTestimonials(data);
            renderPricing(data);
            renderClients(data);
            renderServiceOptions(data);
            renderContactInfo(data);

            initReveal();
        } catch (err) {
            console.error('[RainFow] Content load failed:', err);
        }

        // These run regardless of content.json success
        initMobileMenu();
        initNavbarScroll();
        initYear();
        initContactForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();