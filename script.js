/* =============================================================
   YellowBean Cafe — script.js
   Vanilla JavaScript only.
   Features:
     - Mobile hamburger menu
     - Navbar background change on scroll
     - Smooth-scroll for in-page anchor links
     - IntersectionObserver-driven fade-in reveals
     - Stats count-up when stats grid scrolls into view
     - Back-to-top button visibility + click
     - Dynamic footer year
   ============================================================= */

(function () {
    'use strict';

    // ---------- Helpers ----------
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    // ---------- DOM ready ----------
    document.addEventListener('DOMContentLoaded', () => {
        initYear();
        initNavbarScroll();
        initHamburger();
        initSmoothScroll();
        initReveals();
        initStatsCounter();
        initBackToTop();
    });

    // ---------- Dynamic year ----------
    function initYear() {
        const yearEl = $('#year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    // ---------- Navbar background change on scroll ----------
    function initNavbarScroll() {
        const navbar = $('#navbar');
        if (!navbar) return;

        const toggle = () => {
            if (window.scrollY > 30) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };

        toggle();
        window.addEventListener('scroll', toggle, { passive: true });
    }

    // ---------- Hamburger / mobile menu ----------
    function initHamburger() {
        const btn = $('#hamburger');
        const links = $('#navLinks');
        if (!btn || !links) return;

        const closeMenu = () => {
            btn.classList.remove('open');
            links.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        };

        const openMenu = () => {
            btn.classList.add('open');
            links.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        };

        btn.addEventListener('click', () => {
            if (btn.classList.contains('open')) closeMenu();
            else openMenu();
        });

        // Close on link tap
        $$('.nav-link, .nav-cta', links).forEach((a) => {
            a.addEventListener('click', () => closeMenu());
        });

        // Close on resize up to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 720) closeMenu();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }

    // ---------- Smooth scroll for anchors (accounts for sticky nav) ----------
    function initSmoothScroll() {
        const navH = () => {
            const cssVar = getComputedStyle(document.documentElement).getPropertyValue('--nav-h');
            const parsed = parseInt(cssVar, 10);
            return Number.isFinite(parsed) ? parsed : 78;
        };

        $$('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#' || href.length < 2) return;
                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - (navH() + 10);
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }

    // ---------- Fade-in on scroll ----------
    function initReveals() {
        const items = $$('.reveal');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, idx) => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        // Slight stagger when siblings reveal together
                        const delay = el.dataset.delay
                            ? parseInt(el.dataset.delay, 10)
                            : Math.min(idx * 80, 240);
                        setTimeout(() => el.classList.add('is-visible'), delay);
                        io.unobserve(el);
                    }
                });
            },
            { root: null, threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        items.forEach((el) => io.observe(el));
    }

    // ---------- Stats count-up ----------
    function initStatsCounter() {
        const grid = $('#statsGrid');
        if (!grid) return;
        const numbers = $$('.stat-number', grid);
        if (!numbers.length) return;

        const animateNumber = (el) => {
            const target = parseFloat(el.dataset.target || '0');
            const suffix = el.dataset.suffix || '';
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const duration = 1800; // ms
            const start = performance.now();

            const easeOut = (t) => 1 - Math.pow(1 - t, 3);

            const tick = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeOut(progress);
                const value = target * eased;

                let formatted;
                if (decimals > 0) {
                    formatted = value.toFixed(decimals);
                } else {
                    formatted = Math.floor(value).toLocaleString('en-US');
                }

                el.textContent = formatted + suffix;

                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    // Final exact value
                    const finalVal = decimals > 0
                        ? target.toFixed(decimals)
                        : Math.floor(target).toLocaleString('en-US');
                    el.textContent = finalVal + suffix;
                }
            };

            requestAnimationFrame(tick);
        };

        if (!('IntersectionObserver' in window)) {
            numbers.forEach(animateNumber);
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        numbers.forEach(animateNumber);
                        io.disconnect();
                    }
                });
            },
            { root: null, threshold: 0.35 }
        );

        io.observe(grid);
    }

    // ---------- Back to top ----------
    function initBackToTop() {
        const btn = $('#toTop');
        if (!btn) return;

        const toggle = () => {
            if (window.scrollY > 600) btn.classList.add('visible');
            else btn.classList.remove('visible');
        };

        toggle();
        window.addEventListener('scroll', toggle, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
