/* =========================================================
   RainFow — Services Page Scripts (assets/js/services.js)
   Loads data/services.json and data/strategy.json while
   preserving prior entries, auto-updates inquiry service,
   enforces required name/contact/service/details with
   optional email, pings the Google Apps Script endpoint,
   and posts JSON to write into the linked Google Sheet.
   ========================================================= */
(function () {
  'use strict';

  var LANG_KEY = 'rainfow_lang';

  var TITLES = {
    en: 'Our Services — RainFow BD',
    bn: 'আমাদের সেবাসমূহ — RainFow BD'
  };

  var MESSAGES = {

    en: {

      missingName: 'Please enter your name.',

      missingContact: 'Please enter your contact number (Phone or WhatsApp).',

      missingService: 'Please select a service.',

      missingDetails: 'Please provide details about your inquiry.',

      missingEndpoint: '101 | Service is unavailable right now. Please try again later.',

      checkingServer: 'Processing your request...',

      serverOffline: '102 | Service is unavailable right now. Please try again or click Contact Us.',

      writingSheet: 'Submitting your inquiry...',

      savedSheet: 'Inquiry submitted successfully!',

      saveFailed: '103 | Service is unavailable right now. Please try again later.'

    },

    bn: {

      missingName: 'অনুগ্রহ করে আপনার নাম লিখুন।',

      missingContact: 'অনুগ্রহ করে আপনার যোগাযোগ নম্বর (ফোন বা WhatsApp) লিখুন।',

      missingService: 'অনুগ্রহ করে একটি সেবা নির্বাচন করুন।',

      missingDetails: 'অনুগ্রহ করে আপনার চাহিদার বিস্তারিত লিখুন।',

      missingEndpoint: '101 | সেবাটি এই মুহূর্তে উপলব্ধ নয়। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',

      checkingServer: 'আপনার অনুরোধ প্রক্রিয়া করা হচ্ছে...',

      serverOffline: '102 | সেবাটি এই মুহূর্তে উপলব্ধ নয়। আবার চেষ্টা করুন অথবা Contact Us-এ ক্লিক করুন।',

      writingSheet: 'আপনার অনুসন্ধান জমা দেওয়া হচ্ছে...',

      savedSheet: 'আপনার অনুসন্ধান সফলভাবে জমা হয়েছে!',

      saveFailed: '103 | সেবাটি এই মুহূর্তে উপলব্ধ নয়। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'

    }

  };



  var SERVICE_SELECT_MAP = {
    'svc-sourcing': 'Product Sourcing',
    'product sourcing': 'Product Sourcing',
    'svc-shipping': 'International Shipping Support',
    'international shipping': 'International Shipping Support',
    'international shipping support': 'International Shipping Support',
    'svc-web': 'Website Development',
    'web development': 'Website Development',
    'website development': 'Website Development',
    'svc-media': 'Content Creation & Media Production',
    'content & media': 'Content Creation & Media Production',
    'content creation & media production': 'Content Creation & Media Production',
    'svc-seo': 'SEO',
    'seo': 'SEO',
    'svc-branding': 'Branding & Digital Marketing',
    'branding & marketing': 'Branding & Digital Marketing',
    'branding & digital marketing': 'Branding & Digital Marketing',
    'svc-crm': 'CRM & Operational Support',
    'crm & operations': 'CRM & Operational Support',
    'crm & operational support': 'CRM & Operational Support'
  };

  var PRIOR_SERVICES = [
    {
      id: 'svc-sourcing',
      code: '01',
      name: 'Product Sourcing',
      nameEn: 'Product Sourcing',
      nameBn: 'পণ্য সোর্সিং',
      titleEn: 'Find Your Desired Products from Bangladesh.',
      titleBn: 'বাংলাদেশ থেকে আপনার কাঙ্ক্ষিত পণ্য খুঁজে নিন।',
      shortDescEn: 'Factory and supplier sourcing, sampling, wholesale collection, and custom product requirements with end-to-end verification.',
      shortDescBn: 'ফ্যাক্টরি ও সরবরাহকারী অনুসন্ধান, স্যাম্পলিং, পাইকারি সংগ্রহ এবং কাস্টম পণ্যের চাহিদা যাচাইসহ সম্পূর্ণ সহায়তা।',
      detailsEn: [
        'Factory & Supplier Sourcing',
        'Product Selection',
        'Wholesale Product Collection',
        'Custom Product Requirements'
      ],
      detailsBn: [
        'ফ্যাক্টরি ও সরবরাহকারী অনুসন্ধান',
        'পণ্য নির্বাচন',
        'পাইকারি পণ্য সংগ্রহ',
        'কাস্টম পণ্যের চাহিদা'
      ],
      href: 'services.html#svc-sourcing',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'svc-shipping',
      code: '02',
      name: 'International Shipping',
      nameEn: 'International Shipping',
      nameBn: 'আন্তর্জাতিক শিপিং',
      titleEn: 'Move Your Products Across Borders.',
      titleBn: 'সীমান্ত পেরিয়ে আপনার পণ্য পাঠান।',
      shortDescEn: 'Air and sea freight, shipping coordination, export documentation, and protective packaging from factory to doorstep.',
      shortDescBn: 'এয়ার ও সি ফ্রেইট, শিপিং সমন্বয়, এক্সপোর্ট ডকুমেন্টেশন এবং ফ্যাক্টরি থেকে গন্তব্য পর্যন্ত নিরাপদ প্যাকেজিং।',
      detailsEn: [
        'Air Freight',
        'Sea Freight',
        'Shipping Coordination',
        'Documentation Support',
        'Export Packaging Support'
      ],
      detailsBn: [
        'এয়ার ফ্রেইট',
        'সি ফ্রেইট',
        'শিপিং সমন্বয়',
        'ডকুমেন্টেশন সহায়তা',
        'এক্সপোর্ট প্যাকেজিং সহায়তা'
      ],
      href: 'services.html#svc-shipping',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'svc-web',
      code: '03',
      name: 'Web Development',
      nameEn: 'Web Development',
      nameBn: 'ওয়েব ডেভেলপমেন্ট',
      titleEn: 'Build Your Digital Business Presence.',
      titleBn: 'আপনার ডিজিটাল ব্যবসায়িক উপস্থিতি গড়ে তুলুন।',
      shortDescEn: 'Business websites, full e-commerce storefronts, domain and hosting setup, and ongoing site management.',
      shortDescBn: 'বিজনেস ওয়েবসাইট, পূর্ণাঙ্গ ই-কমার্স স্টোর, ডোমেইন-হোস্টিং সেটআপ এবং নিয়মিত সাইট ম্যানেজমেন্ট।',
      detailsEn: [
        'Business Website',
        'E-commerce Website',
        'Domain & Hosting',
        'Website Management'
      ],
      detailsBn: [
        'বিজনেস ওয়েবসাইট',
        'ই-কমার্স ওয়েবসাইট',
        'ডোমেইন ও হোস্টিং',
        'ওয়েবসাইট ম্যানেজমেন্ট'
      ],
      href: 'services.html#svc-web',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'svc-media',
      code: '04',
      name: 'Content & Media',
      nameEn: 'Content & Media',
      nameBn: 'কনটেন্ট ও মিডিয়া',
      titleEn: 'Create Content That Builds Your Brand.',
      titleBn: 'ব্র্যান্ড গড়তে কনটেন্ট তৈরি করুন।',
      shortDescEn: 'Product photography, promotional and cinematic videos, documentary storytelling, social posts, and ad creatives.',
      shortDescBn: 'প্রোডাক্ট ফটোগ্রাফি, প্রমোশনাল ও সিনেমাটিক ভিডিও, ডকুমেন্টারি কনটেন্ট, সোশ্যাল পোস্ট ও বিজ্ঞাপন ক্রিয়েটিভ।',
      detailsEn: [
        'Professional Product Photography',
        'Promotional Video',
        'Cinematic Video Production',
        'Documentary-style Content',
        'Social Media Content',
        'Advertising Creative'
      ],
      detailsBn: [
        'পেশাদার প্রোডাক্ট ফটোগ্রাফি',
        'প্রমোশনাল ভিডিও',
        'সিনেমাটিক ভিডিও প্রোডাকশন',
        'ডকুমেন্টারি-স্টাইল কনটেন্ট',
        'সোশ্যাল মিডিয়া কনটেন্ট',
        'বিজ্ঞাপন ক্রিয়েটিভ'
      ],
      href: 'services.html#svc-media',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'svc-seo',
      code: '05',
      name: 'SEO',
      nameEn: 'SEO',
      nameBn: 'এসইও',
      titleEn: 'Get Found by High-Intent Buyers Online.',
      titleBn: 'অনলাইনে সঠিক ক্রেতাদের সামনে দৃশ্যমান হন।',
      shortDescEn: 'On-page optimization, technical search health, keyword strategy, and organic visibility growth across search engines.',
      shortDescBn: 'অন-পেজ অপটিমাইজেশন, টেকনিক্যাল সার্চ হেলথ, কিওয়ার্ড কৌশল এবং সার্চ ইঞ্জিনে অর্গানিক ভিজিবিলিটি বৃদ্ধি।',
      detailsEn: [
        'Technical & On-Page SEO',
        'Keyword & Content Strategy',
        'Local & Global Search Visibility',
        'Search Performance Tracking'
      ],
      detailsBn: [
        'টেকনিক্যাল ও অন-পেজ SEO',
        'কিওয়ার্ড ও কনটেন্ট কৌশল',
        'লোকাল ও গ্লোবাল সার্চ ভিজিবিলিটি',
        'সার্চ পারফরম্যান্স ট্র্যাকিং'
      ],
      href: 'services.html#svc-seo',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'svc-branding',
      code: '06',
      name: 'Branding & Marketing',
      nameEn: 'Branding & Marketing',
      nameBn: 'ব্র্যান্ডিং ও মার্কেটিং',
      titleEn: 'Build Your Brand. Reach Your Audience.',
      titleBn: 'ব্র্যান্ড গড়ুন। আপনার অডিয়েন্সের কাছে পৌঁছান।',
      shortDescEn: 'Brand identity, logo and visual systems, social media management, digital ads, and audience growth campaigns.',
      shortDescBn: 'ব্র্যান্ড আইডেন্টিটি, লোগো ও ভিজ্যুয়াল সিস্টেম, সোশ্যাল মিডিয়া ম্যানেজমেন্ট, ডিজিটাল বিজ্ঞাপন ও প্রবৃদ্ধি ক্যাম্পেইন।',
      detailsEn: [
        'Brand Identity',
        'Logo & Visual Design',
        'Social Media Management',
        'Digital Advertising',
        'SEO Support'
      ],
      detailsBn: [
        'ব্র্যান্ড আইডেন্টিটি',
        'লোগো ও ভিজ্যুয়াল ডিজাইন',
        'সোশ্যাল মিডিয়া ম্যানেজমেন্ট',
        'ডিজিটাল বিজ্ঞাপন',
        'SEO সহায়তা'
      ],
      href: 'services.html#svc-branding',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'svc-crm',
      code: '07',
      name: 'CRM & Operations',
      nameEn: 'CRM & Operations',
      nameBn: 'CRM ও অপারেশনস',
      titleEn: 'Manage Your Business More Efficiently.',
      titleBn: 'আপনার ব্যবসা আরও দক্ষভাবে পরিচালনা করুন।',
      shortDescEn: 'Customer and lead tracking, structured business databases, order workflows, and day-to-day operational coordination.',
      shortDescBn: 'কাস্টমার ও লিড ট্র্যাকিং, সুসংগঠিত বিজনেস ডেটাবেস, অর্ডার ওয়ার্কফ্লো এবং প্রতিদিনের অপারেশনাল সমন্বয়।',
      detailsEn: [
        'Customer Management',
        'Lead Management',
        'Business Database',
        'Operational Coordination'
      ],
      detailsBn: [
        'কাস্টমার ম্যানেজমেন্ট',
        'লিড ম্যানেজমেন্ট',
        'বিজনেস ডেটাবেস',
        'অপারেশনাল সমন্বয়'
      ],
      href: 'services.html#svc-crm',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    }
  ];

  var PRIOR_STRATEGY = [
    {
      id: 'stg-dream',
      step: '01',
      parentId: null,
      titleEn: 'We Dream',
      titleBn: 'আমরা স্বপ্ন দেখি',
      descEn: 'We start with bold goals and a clear vision for what is possible.',
      descBn: 'আমরা স্পষ্ট ভিশন এবং সম্ভাবনার বড় লক্ষ্য নিয়ে শুরু করি।',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'stg-problems',
      step: '02',
      parentId: 'stg-dream',
      titleEn: 'We Search Problems',
      titleBn: 'আমরা সমস্যা খুঁজি',
      descEn: 'We dig into bottlenecks, gaps, and real operational challenges.',
      descBn: 'আমরা প্রতিবন্ধকতা, ঘাটতি এবং বাস্তব ব্যবসায়িক চ্যালেঞ্জগুলো খুঁজে বের করি।',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'stg-solution',
      step: '03',
      parentId: 'stg-problems',
      titleEn: 'We Discover Solution',
      titleBn: 'আমরা সমাধান আবিষ্কার করি',
      descEn: 'We shape practical, tailored strategies that solve root causes.',
      descBn: 'আমরা মূল সমস্যার কার্যকর ও বাস্তবসম্মত সমাধান তৈরি করি।',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'stg-reality',
      step: '04',
      parentId: 'stg-solution',
      titleEn: 'We Connect them to Reality',
      titleBn: 'আমরা বাস্তবের সাথে সংযুক্ত করি',
      descEn: 'We align plans with real suppliers, tools, channels, and execution.',
      descBn: 'আমরা পরিকল্পনাগুলো বাস্তব সাপ্লায়ার, টুলস, চ্যানেল ও কাজের সাথে যুক্ত করি।',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'stg-build',
      step: '05',
      parentId: 'stg-reality',
      titleEn: 'We Build',
      titleBn: 'আমরা নির্মাণ করি',
      descEn: 'We turn the blueprint into working systems, products, and presence.',
      descBn: 'আমরা পরিকল্পনা থেকে কার্যকর সিস্টেম, পণ্য ও উপস্থিতি গড়ে তুলি।',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    },
    {
      id: 'stg-grow',
      step: '06',
      parentId: 'stg-build',
      titleEn: 'We grow together',
      titleBn: 'আমরা একসাথে বেড়ে উঠি',
      descEn: 'We scale steadily side by side with our partners and clients.',
      descBn: 'আমরা পার্টনার ও ক্লায়েন্টদের সাথে কাঁধে কাঁধ মিলিয়ে এগিয়ে যাই।',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      fallback: 'images/waiting.jpg'
    }
  ];

  var currentLang = 'en';
  try {
    var savedLang = localStorage.getItem(LANG_KEY);
    if (savedLang === 'en' || savedLang === 'bn') currentLang = savedLang;
  } catch (e) {}

  function msg(key) {
    var dict = MESSAGES[currentLang] || MESSAGES.en;
    return dict[key] || MESSAGES.en[key] || '';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function slugifyService(text, index) {
    var base = String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return base ? (base.indexOf('svc-') === 0 ? base : 'svc-' + base) : ('svc-item-' + (index + 1));
  }

  /* ---------- Language System ---------- */
  function applyLanguage(lang) {
    currentLang = lang === 'bn' ? 'bn' : 'en';
    document.documentElement.lang = currentLang;
    document.title = TITLES[currentLang] || document.title;

    document.querySelectorAll('[data-en][data-bn]').forEach(function (el) {
      var text = el.getAttribute('data-' + currentLang);
      if (text !== null) el.textContent = text;
    });

    document.querySelectorAll('[data-en-placeholder][data-bn-placeholder]').forEach(function (el) {
      var ph = el.getAttribute('data-' + currentLang + '-placeholder');
      if (ph !== null) el.placeholder = ph;
    });

    document.querySelectorAll('[data-lang-btn], [data-survey-lang]').forEach(function (btn) {
      var btnLang = btn.getAttribute('data-lang-btn') || btn.getAttribute('data-survey-lang');
      btn.classList.toggle('active', btnLang === currentLang);
    });

    try {
      localStorage.setItem(LANG_KEY, currentLang);
    } catch (e) {}
  }

  /* ---------- Toast & Status ---------- */
  var toastEl = document.getElementById('svc-toast');
  var statusEl = document.getElementById('svc-server-status');

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 3000);
  }

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  document.querySelectorAll('[data-scroll-to]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var selector = link.getAttribute('data-scroll-to');
      var target = selector ? document.querySelector(selector) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Inquiry Form Auto-Update & Validation ---------- */
  var form = document.getElementById('svc-form');
  var submitBtn = document.getElementById('svc-submit-btn');
  var nameInput = form ? form.elements.name : null;
  var contactInput = form ? form.elements.contact : null;
  var emailInput = form ? form.elements.email : null;
  var serviceSelect = form ? form.elements.service : null;
  var detailsTextarea = form ? form.elements.details : null;
  var inquirySection = document.getElementById('svc-inquiry');

  function clearFieldErrors() {
    [nameInput, contactInput, emailInput, serviceSelect, detailsTextarea].forEach(function (el) {
      if (el) el.classList.remove('is-invalid');
    });
  }

  function validateInquiryForm() {
    clearFieldErrors();
    if (!form) return false;

    var nameVal = nameInput ? nameInput.value.trim() : '';
    var contactVal = contactInput ? contactInput.value.trim() : '';
    var serviceVal = serviceSelect ? serviceSelect.value.trim() : '';
    var detailsVal = detailsTextarea ? detailsTextarea.value.trim() : '';

    if (!nameVal) {
      if (nameInput) {
        nameInput.classList.add('is-invalid');
        nameInput.focus();
      }
      showToast(msg('missingName'));
      return false;
    }

    if (!contactVal) {
      if (contactInput) {
        contactInput.classList.add('is-invalid');
        contactInput.focus();
      }
      showToast(msg('missingContact'));
      return false;
    }

    if (!serviceVal) {
      if (serviceSelect) {
        serviceSelect.classList.add('is-invalid');
        serviceSelect.focus();
      }
      showToast(msg('missingService'));
      return false;
    }

    if (!detailsVal) {
      if (detailsTextarea) {
        detailsTextarea.classList.add('is-invalid');
        detailsTextarea.focus();
      }
      showToast(msg('missingDetails'));
      return false;
    }

    return true;
  }

  function resolveInquiryOptionValue(serviceName, serviceId) {
    var candidates = [serviceId, serviceName]
      .filter(Boolean)
      .map(function (v) { return String(v).trim().toLowerCase(); });

    for (var i = 0; i < candidates.length; i++) {
      if (SERVICE_SELECT_MAP[candidates[i]]) {
        return SERVICE_SELECT_MAP[candidates[i]];
      }
    }
    return serviceName || '';
  }

  function autoUpdateInquiryService(serviceName, serviceId) {
    if (!serviceSelect) return;
    var mappedValue = resolveInquiryOptionValue(serviceName, serviceId);
    if (!mappedValue) return;

    var matched = false;
    for (var i = 0; i < serviceSelect.options.length; i++) {
      var opt = serviceSelect.options[i];
      if (
        opt.value === mappedValue ||
        opt.value.toLowerCase() === mappedValue.toLowerCase() ||
        opt.textContent.trim().toLowerCase() === mappedValue.toLowerCase()
      ) {
        serviceSelect.selectedIndex = i;
        matched = true;
        break;
      }
    }

    if (!matched) {
      var customOpt = document.createElement('option');
      customOpt.value = mappedValue;
      customOpt.textContent = mappedValue;
      serviceSelect.appendChild(customOpt);
      serviceSelect.value = mappedValue;
    }

    serviceSelect.classList.remove('is-invalid');
    serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));

    if (detailsTextarea && !detailsTextarea.value.trim()) {
      detailsTextarea.setAttribute(
        'placeholder',
        currentLang === 'bn'
          ? ('আবশ্যক: "' + mappedValue + '" সম্পর্কে আপনার প্রয়োজন, লক্ষ্যবাজার ও টাইমলাইন লিখুন…')
          : ('Required: tell us your requirements for ' + mappedValue + ' — target market, quantity, and timeline…')
      );
    }
  }

  /* ---------- Google Apps Script Webhook: Ping & Write to Sheet ---------- */
  function getInquiryEndpoint() {
    if (window.RAINFOW_INQUIRY_ENDPOINT) {
      return String(window.RAINFOW_INQUIRY_ENDPOINT).trim();
    }
    var attr = form ? form.getAttribute('data-inquiry-endpoint') : '';
    return attr ? attr.trim() : '';
  }

  function checkServerAlive(endpoint) {
    if (!endpoint) return Promise.resolve(false);
    var sep = endpoint.indexOf('?') === -1 ? '?' : '&';
    var pingUrl = endpoint + sep + 'action=ping&_=' + Date.now();
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 7000) : null;

    return fetch(pingUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        if (!res.ok) throw new Error('Server status ' + res.status);
        return res.json().catch(function () { return { ok: true }; });
      })
      .then(function (data) {
        if (data && data.ok === false) {
          throw new Error(data.message || 'Server unavailable');
        }
        return true;
      })
      .catch(function () {
        if (timer) clearTimeout(timer);
        return false;
      });
  }

  function writeInquiryToSheet(endpoint, payload) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 10000) : null;

    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (res) {
        if (timer) clearTimeout(timer);
        return res.json().then(function (body) {
          if (!res.ok || (body && body.ok === false)) {
            throw new Error((body && body.message) || ('HTTP ' + res.status));
          }
          return body || { ok: true };
        });
      })
      .catch(function (err) {
        if (timer) clearTimeout(timer);
        throw err;
      });
  }

  /* ---------- Non-Destructive Merge With Prior Data ---------- */
  function mergeServicesData(incoming) {
    var byKey = {};
    var result = [];

    PRIOR_SERVICES.forEach(function (item) {
      var clone = Object.assign({}, item, {
        detailsEn: Array.isArray(item.detailsEn) ? item.detailsEn.slice() : [],
        detailsBn: Array.isArray(item.detailsBn) ? item.detailsBn.slice() : []
      });
      result.push(clone);
      byKey[clone.id.toLowerCase()] = clone;
      byKey[clone.name.toLowerCase()] = clone;
      byKey[clone.nameEn.toLowerCase()] = clone;
    });

    if (Array.isArray(incoming)) {
      incoming.forEach(function (raw, idx) {
        if (!raw || typeof raw !== 'object') return;
        var label = raw.nameEn || raw.name || raw.title || ('Service ' + (idx + 1));
        var id = raw.id || slugifyService(label, idx);
        var match = byKey[String(id).toLowerCase()] || byKey[String(label).toLowerCase()];

        var detailsEn = Array.isArray(raw.detailsEn) && raw.detailsEn.length
          ? raw.detailsEn.slice()
          : (match ? match.detailsEn.slice() : []);
        var detailsBn = Array.isArray(raw.detailsBn) && raw.detailsBn.length
          ? raw.detailsBn.slice()
          : (match ? match.detailsBn.slice() : detailsEn.slice());

        var entry = Object.assign({
          id: id,
          code: String(idx + 1).padStart(2, '0'),
          name: label,
          nameEn: label,
          nameBn: label,
          titleEn: label,
          titleBn: label,
          shortDescEn: '',
          shortDescBn: '',
          detailsEn: detailsEn,
          detailsBn: detailsBn,
          href: 'services.html#' + id,
          image: 'images/waiting.jpg',
          fallback: 'images/waiting.jpg'
        }, match || {}, raw, {
          detailsEn: detailsEn,
          detailsBn: detailsBn
        });

        entry.name = raw.name || raw.nameEn || (match && match.name) || label;
        entry.nameEn = raw.nameEn || raw.name || (match && match.nameEn) || entry.name;
        entry.nameBn = raw.nameBn || (match && match.nameBn) || entry.name;
        entry.titleEn = raw.titleEn || raw.nameEn || raw.name || (match && match.titleEn) || entry.nameEn;
        entry.titleBn = raw.titleBn || raw.nameBn || (match && match.titleBn) || entry.nameBn;
        entry.shortDescEn = raw.shortDescEn || raw.descriptionEn || raw.desc || (match && match.shortDescEn) || '';
        entry.shortDescBn = raw.shortDescBn || raw.descriptionBn || (match && match.shortDescBn) || entry.shortDescEn;
        entry.image = raw.image || raw.img || (match && match.image) || 'images/waiting.jpg';
        entry.fallback = raw.fallback || (match && match.fallback) || 'images/waiting.jpg';

        if (match) {
          Object.assign(match, entry);
        } else {
          result.push(entry);
          byKey[entry.id.toLowerCase()] = entry;
          byKey[entry.name.toLowerCase()] = entry;
          byKey[entry.nameEn.toLowerCase()] = entry;
        }
      });
    }

    return result;
  }

  function renderServices(services) {
    var grid = document.getElementById('svc-ostad-grid');
    if (!grid) return;

    grid.innerHTML = services.map(function (svc, index) {
      var cardId = escapeHtml(svc.id || ('svc-card-' + (index + 1)));
      var titleEn = escapeHtml(svc.titleEn || svc.nameEn || svc.name);
      var titleBn = escapeHtml(svc.titleBn || svc.nameBn || svc.name);
      var descEn = escapeHtml(svc.shortDescEn || svc.nameEn || svc.name);
      var descBn = escapeHtml(svc.shortDescBn || svc.nameBn || svc.name);
      var imgSrc = escapeHtml(svc.image || 'images/waiting.jpg');
      var fallback = escapeHtml(svc.fallback || 'images/waiting.jpg');
      var inquireValue = escapeHtml(svc.nameEn || svc.name);

      var listEn = Array.isArray(svc.detailsEn) ? svc.detailsEn : [];
      var listBn = Array.isArray(svc.detailsBn) ? svc.detailsBn : listEn;
      var count = Math.max(listEn.length, listBn.length);
      var bulletsHtml = '';

      for (var i = 0; i < count; i++) {
        var bEn = escapeHtml(listEn[i] || listBn[i] || '');
        var bBn = escapeHtml(listBn[i] || listEn[i] || '');
        if (bEn || bBn) {
          bulletsHtml += '<li data-en="' + bEn + '" data-bn="' + bBn + '">' +
            (currentLang === 'bn' ? bBn : bEn) + '</li>';
        }
      }

      return (
        '<article class="svc-ostad-card" id="' + cardId + '" data-svc-card>' +
          '<div class="svc-ostad-media">' +
            '<img src="' + imgSrc + '" alt="' + titleEn + '" loading="lazy" ' +
                 'onerror="this.onerror=null;this.src=\'' + fallback + '\';">' +
          '</div>' +
          '<div class="svc-ostad-body">' +
            '<h3 class="svc-ostad-title" data-en="' + titleEn + '" data-bn="' + titleBn + '">' +
              (currentLang === 'bn' ? titleBn : titleEn) +
            '</h3>' +
            '<p class="svc-ostad-desc" data-en="' + descEn + '" data-bn="' + descBn + '">' +
              (currentLang === 'bn' ? descBn : descEn) +
            '</p>' +
            '<div class="svc-ostad-details">' +
              (bulletsHtml ? '<ul class="svc-bullets">' + bulletsHtml + '</ul>' : '') +
            '</div>' +
            '<div class="svc-ostad-footer">' +
              '<button type="button" class="svc-inquire-btn" ' +
                      'data-inquire="' + inquireValue + '" data-service-id="' + cardId + '" ' +
                      'data-en="Inquire about this service" data-bn="এই সেবা সম্পর্কে জানুন">' +
                (currentLang === 'bn' ? 'এই সেবা সম্পর্কে জানুন' : 'Inquire about this service') +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    applyLanguage(currentLang);
  }

  /* ---------- Our Strategy (Hierarchical Tree From data/strategy.json) ---------- */
  function orderStrategyHierarchy(rawList) {
    var list = Array.isArray(rawList) && rawList.length ? rawList : PRIOR_STRATEGY;
    var byId = {};
    var childrenMap = {};
    var roots = [];

    list.forEach(function (item, idx) {
      if (!item) return;
      var id = item.id || ('stg-' + (idx + 1));
      var node = Object.assign({
        id: id,
        step: String(idx + 1).padStart(2, '0'),
        parentId: idx === 0 ? null : (list[idx - 1].id || ('stg-' + idx)),
        titleEn: '',
        titleBn: '',
        descEn: '',
        descBn: '',
        image: 'images/waiting.jpg',
        fallback: 'images/waiting.jpg'
      }, item, { id: id });
      byId[id] = node;
      childrenMap[id] = [];
    });

    Object.keys(byId).forEach(function (id) {
      var node = byId[id];
      if (node.parentId && byId[node.parentId]) {
        childrenMap[node.parentId].push(node);
      } else {
        roots.push(node);
      }
    });

    var ordered = [];
    var visited = {};

    function walk(node, depth) {
      if (!node || visited[node.id]) return;
      visited[node.id] = true;
      ordered.push({ node: node, depth: depth });
      (childrenMap[node.id] || []).forEach(function (child) {
        walk(child, depth + 1);
      });
    }

    roots.forEach(function (root) {
      walk(root, 0);
    });

    Object.keys(byId).forEach(function (id) {
      if (!visited[id]) {
        walk(byId[id], ordered.length);
      }
    });

    return ordered;
  }

  function renderStrategyTree(rawList) {
    var treeEl = document.getElementById('stg-tree');
    if (!treeEl) return;

    var chain = orderStrategyHierarchy(rawList);
    var branchCycle = ['stg-node--left', 'stg-node--right'];

    treeEl.innerHTML = chain.map(function (entry, index) {
      var item = entry.node;
      var depth = entry.depth;
      var isRoot = depth === 0;
      var isLeaf = index === chain.length - 1 && chain.length > 1;
      var posClass = isRoot
        ? 'stg-node--root'
        : (isLeaf ? 'stg-node--leaf' : branchCycle[(index - 1) % branchCycle.length]);

      var stepCode = escapeHtml(item.step || String(index + 1).padStart(2, '0'));
      var titleEn = escapeHtml(item.titleEn || item.title || '');
      var titleBn = escapeHtml(item.titleBn || item.title || titleEn);
      var descEn = escapeHtml(item.descEn || item.desc || '');
      var descBn = escapeHtml(item.descBn || item.desc || descEn);
      var imgSrc = escapeHtml(item.image || 'images/waiting.jpg');
      var fallback = escapeHtml(item.fallback || 'images/waiting.jpg');

      return (
        '<div class="stg-node ' + posClass + '" data-strategy-id="' + escapeHtml(item.id) + '">' +
          '<article class="svc-ostad-card stg-tree-card">' +
            '<div class="svc-ostad-media">' +
              '<img src="' + imgSrc + '" alt="' + titleEn + '" loading="lazy" ' +
                   'onerror="this.onerror=null;this.src=\'' + fallback + '\';">' +
            '</div>' +
            '<div class="svc-ostad-body">' +
              '<span class="stg-node-tag">' + stepCode + '</span>' +
              '<h3 class="svc-ostad-title" data-en="' + titleEn + '" data-bn="' + titleBn + '">' +
                (currentLang === 'bn' ? titleBn : titleEn) +
              '</h3>' +
              '<p class="svc-ostad-desc" data-en="' + descEn + '" data-bn="' + descBn + '">' +
                (currentLang === 'bn' ? descBn : descEn) +
              '</p>' +
            '</div>' +
          '</article>' +
        '</div>'
      );
    }).join('');

    applyLanguage(currentLang);
  }

  /* ---------- Delegated Events ---------- */
  document.addEventListener('click', function (e) {
    var langBtn = e.target.closest('[data-lang-btn], [data-survey-lang]');
    if (langBtn) {
      var nextLang = langBtn.getAttribute('data-lang-btn') || langBtn.getAttribute('data-survey-lang');
      applyLanguage(nextLang);
      return;
    }

    var inquireBtn = e.target.closest('[data-inquire]');
    if (inquireBtn) {
      var svcName = inquireBtn.getAttribute('data-inquire');
      var svcId = inquireBtn.getAttribute('data-service-id');
      autoUpdateInquiryService(svcName, svcId);

      if (inquirySection) {
        inquirySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(function () {
        if (nameInput) nameInput.focus({ preventScroll: true });
      }, 450);
    }
  });

  document.addEventListener('partials:loaded', function () {
    applyLanguage(currentLang);
  });

  [nameInput, contactInput, emailInput, serviceSelect, detailsTextarea].forEach(function (field) {
    if (!field) return;
    field.addEventListener('input', function () { field.classList.remove('is-invalid'); });
    field.addEventListener('change', function () { field.classList.remove('is-invalid'); });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateInquiryForm()) return;

      var endpoint = getInquiryEndpoint();
      if (!endpoint) {
        setStatus(msg('missingEndpoint'));
        showToast(msg('missingEndpoint'));
        return;
      }

      var payload = {
        timestamp: new Date().toISOString(),
        language: currentLang,
        name: nameInput.value.trim(),
        contact: contactInput.value.trim(),
        email: emailInput ? emailInput.value.trim() : '',
        service: serviceSelect.value.trim(),
        details: detailsTextarea.value.trim()
      };

      if (submitBtn) submitBtn.disabled = true;
      setStatus(msg('checkingServer'));
      showToast(msg('checkingServer'));

      checkServerAlive(endpoint)
        .then(function (isAlive) {
          if (!isAlive) {
            setStatus(msg('serverOffline'));
            showToast(msg('serverOffline'));
            return null;
          }
          setStatus(msg('writingSheet'));
          return writeInquiryToSheet(endpoint, payload);
        })
        .then(function (result) {
          if (!result) return;
          setStatus(msg('savedSheet'));
          showToast(msg('savedSheet'));
          form.reset();
        })
        .catch(function (err) {
          var detail = (err && err.message) ? (msg('saveFailed') + ' (' + err.message + ')') : msg('saveFailed');
          setStatus(detail);
          showToast(detail);
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Boot ---------- */
  renderServices(mergeServicesData([]));
  renderStrategyTree(PRIOR_STRATEGY);

  fetch('data/services.json', { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load data/services.json');
      return res.json();
    })
    .then(function (json) {
      var list = Array.isArray(json) ? json : (json && (json.items || json.services));
      renderServices(mergeServicesData(list));
    })
    .catch(function () {
      renderServices(mergeServicesData([]));
    });

  fetch('data/strategy.json', { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('Failed to load data/strategy.json');
      return res.json();
    })
    .then(function (json) {
      var list = Array.isArray(json) ? json : (json && (json.items || json.strategy));
      renderStrategyTree(list);
    })
    .catch(function () {
      renderStrategyTree(PRIOR_STRATEGY);
    });
})();