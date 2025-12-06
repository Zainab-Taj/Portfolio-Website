/* script.js
   - Theme toggle (light/dark) persisted to localStorage
   - Mobile nav toggle
   - Download/print resume helper
   - Smooth internal anchor scrolling
   - Small reveal animation for elements with .fade-up
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
    // default: use media query
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = prefersDark ? 'dark' : 'light';
    applyTheme(initial);
    return initial;
  }

  function toggleTheme() {
    const current = root.classList.contains('dark') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* noop */ }
  }

  // ---- Mobile Nav ----
  function setupMobileNav() {
    const header = $('.site-header');
    const toggle = document.createElement('button');
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    // insert toggle before nav links
    const nav = header.querySelector('.nav');
    if (nav) nav.insertBefore(toggle, nav.children[1] || null);

    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });

    // Close mobile nav when clicking a link
    header.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a');
      if (!a) return;
      if (header.classList.contains('nav-open')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- Print / Download Resume ----
  function setupDownloadButton() {
    const dl = $('#downloadBtn');
    if (!dl) return;
    dl.addEventListener('click', (e) => {
      // Accessible user-flow: inform and open print dialog
      const confirmed = confirm('The site will open the print dialog. Choose "Save as PDF" (or printer) to download your resume. Proceed?');
      if (!confirmed) return;
      // Use a minimal print-friendly view:
      window.print();
    });
  }

  // ---- Smooth anchors ----
  function setupSmoothAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (evt) => {
        const id = a.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) {
          evt.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.focus({ preventScroll: true });
        }
      });
    });
  }

  // ---- Fade-up reveal for elements with class .fade-up ----
  function setupFadeUp() {
    const items = $$('.fade-up');
    if (!items.length) return;
    // Use IntersectionObserver where available
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
          if (ent.isIntersecting) {
            ent.target.style.animationDelay = (ent.target.dataset.delay || '0') + 'ms';
            ent.target.classList.add('visible');
            observer.unobserve(ent.target);
          }
        });
      }, { threshold: 0.12 });
      items.forEach(item => {
        observer.observe(item);
      });
    } else {
      // fallback: add visible after small timeout
      items.forEach((it, i) => setTimeout(() => it.classList.add('visible'), 150 * i));
    }
  }

  // ---- Init on DOMContentLoaded ----
  document.addEventListener('DOMContentLoaded', function () {
    // apply theme from storage or preference
    loadTheme();

    // hook up any theme toggle buttons
    const themeToggle = $('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
      themeToggle.setAttribute('aria-pressed', root.classList.contains('dark') ? 'true' : 'false');
    }

    // mobile nav
    setupMobileNav();

    // download button
    setupDownloadButton();

    // smooth anchors
    setupSmoothAnchors();

    // fade-up reveal: add the class (CSS handles animation)
    // we use .fade-up in HTML on sections you want to animate (optional)
    setupFadeUp();

    // apply fade-up by default to key sections for subtle entrance
    ['.hero-text', '.hero-photo', '.profile-card', '.resume-grid', '.highlights'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.classList.add('fade-up');
    });
  });

})();
