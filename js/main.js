/* ═══════════════════════════════════════════
   Owl Nesting Notes · 互動腳本
═══════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. 語言切換 ── */
  var LS_KEY = 'owl-notes-lang';
  var html = document.documentElement;

  function applyLang(lang) {
    var dict = window.I18N[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    html.setAttribute('data-lang', lang);
    html.setAttribute('lang', lang === 'en' ? 'en' : 'zh-TW');
    if (dict['doc.title']) document.title = dict['doc.title'];

    document.querySelectorAll('[data-setlang]').forEach(function (b) {
      b.classList.toggle('is-active', b.getAttribute('data-setlang') === lang);
    });

    try { localStorage.setItem(LS_KEY, lang); } catch (e) {}
  }

  document.querySelectorAll('[data-setlang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-setlang'));
    });
  });

  var saved = null;
  try { saved = localStorage.getItem(LS_KEY); } catch (e) {}
  if (!saved) {
    saved = (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'zh';
  }
  applyLang(saved);

  /* ── 2. Header 狀態 + 捲動進度 ── */
  var header = document.getElementById('siteHeader');
  var bar = document.getElementById('progressBar');
  var heroPhoto = document.querySelector('.hero-photo');
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    if (header) header.classList.toggle('is-stuck', y > 60);
    if (heroPhoto && y < window.innerHeight * 1.2) {
      heroPhoto.style.transform = 'scale(1.06) translateY(' + (y * 0.16) + 'px)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ── 3. 捲動顯現（含錯落延遲） ── */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');

  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) {
          return c.classList && c.classList.contains('reveal');
        }) : [];
        var idx = siblings.indexOf(el);
        el.style.transitionDelay = (idx > 0 ? Math.min(idx, 5) * 110 : 0) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── 4. 數字滾動 ── */
  var counters = document.querySelectorAll('.count');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { el.textContent = '0'; cio.observe(el); });
  }

  /* ── 5. 導覽高亮 (scrollspy) ── */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a, i) {
          a.classList.toggle('is-active', sections[i] === e.target);
        });
      });
    }, { threshold: 0.02, rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) sio.observe(s); });
  }

  /* ── 6. 行動版選單 ── */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.classList.toggle('is-open');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-open');
      }
    });
  }
})();
