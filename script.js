/* script.js
   - Theme toggle (light/dark) persisted to localStorage
   - Mobile nav toggle
   - Download/print resume helper
   - Smooth internal anchor scrolling
   - Fade-up animation
   - Visitor counter (fixed)
*/

(function () {

  // ---- Utilities ----
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));

  // ---- Theme (dark / light) ----
  const THEME_KEY = 'site_theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }

  function loadTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      applyTheme(stored);
      return stored;
    }
    const prefersDark = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initial = prefersDark ? 'dark' : 'light';
    applyTheme(initial);
    return initial;
  }

  function toggleTheme() {
    const current = root.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }

  // ---- Mobile Nav ----
  function setupMobileNav() {
    const header = $('.site-header');
    if (!header) return;

    const nav = header.querySelector('.nav');
    if (!nav) return;

    const toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');

    toggle.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor" stroke-width="1.6"
        stroke-linecap="round"/>
      </svg>
    `;

    nav.insertBefore(toggle, nav.children[1] || null);

    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    header.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a');
      if (!a) return;

      if (header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- Download Resume ----
  function setupDownloadButton() {
    const dl = $('#downloadBtn');
    if (!dl) return;

    dl.addEventListener('click', () => {
      const confirmed = confirm(
        'This will open print dialog. Choose "Save as PDF". Continue?'
      );
      if (!confirmed) return;

      window.print();
    });
  }

  // ---- Smooth Scroll ----
  function setupSmoothAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (evt) => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);

        if (el) {
          evt.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---- Fade Animation ----
  function setupFadeUp() {
    const items = $$('.fade-up');
    if (!items.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
          if (ent.isIntersecting) {
            ent.target.style.animationDelay =
              (ent.target.dataset.delay || '0') + 'ms';

            ent.target.classList.add('visible');
            observer.unobserve(ent.target);
          }
        });
      }, { threshold: 0.12 });

      items.forEach(item => observer.observe(item));

    } else {
      items.forEach((it, i) =>
        setTimeout(() => it.classList.add('visible'), 150 * i)
      );
    }
  }

  // ---- MAIN INIT ----
  document.addEventListener('DOMContentLoaded', function () {

    loadTheme();

    const themeToggle = $('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    setupMobileNav();
    setupDownloadButton();
    setupSmoothAnchors();
    setupFadeUp();

    // ---- Visitor Counter (FIXED) ----
    fetch('https://api.countapi.xyz/hit/zainab-taj-portfolio/visits')
      .then(res => res.json())
      .then(res => {
        const el = document.getElementById('visits');
        if (el) el.innerText = res.value;
      })
      .catch(() => {
        const el = document.getElementById('visits');
        if (el) el.innerText = "--";
      });

    // ---- Auto Fade Apply ----
    ['.hero-text', '.hero-photo', '.profile-card', '.resume-grid', '.highlights']
      .forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('fade-up');
      });

  });

})();
