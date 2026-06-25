/* ═══════════════════════════════════════════
   APEX SIM RACING — MAIN JAVASCRIPT
   ═══════════════════════════════════════════ */

'use strict';

// ── DOM Ready ──
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initTelemetryHUD();
  initNewsletterForm();
  initDisciplineHovers();
});

/* ═══════════════════════════════════════════
   NAVBAR — Scroll behaviour & sticky
   ═══════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // Add solid background once scrolled past hero
    if (currentScroll > 80) {
      navbar.style.background = 'rgba(10,10,10,0.98)';
      navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.4)';
    } else {
      navbar.style.background = 'rgba(10,10,10,0.95)';
      navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

/* ═══════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════ */
function initMobileMenu() {
  const burgerBtn  = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!burgerBtn || !mobileMenu) return;

  burgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    burgerBtn.classList.toggle('open', isOpen);
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burgerBtn.classList.remove('open');
      burgerBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ═══════════════════════════════════════════
   SCROLL ANIMATIONS — Intersection Observer
   ═══════════════════════════════════════════ */
function initScrollAnimations() {
  // Mark all target elements
  const targets = document.querySelectorAll(
    '.program-card, .disc-card, .brand-card, .league-item, ' +
    '.noticia-small, .noticia-featured, .emp-item, ' +
    '.comp-standings, .comp-next, .comp-leagues, ' +
    '.str-profile, .str-road, .hardware-intro, .hardware-brands'
  );

  targets.forEach(el => el.classList.add('fade-up'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stagger children slightly
          const siblings = [...entry.target.parentElement.children].filter(
            el => el.classList.contains('fade-up')
          );
          const idx = siblings.indexOf(entry.target);

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, idx * 80);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════
   TELEMETRY HUD — Live counter animation
   ═══════════════════════════════════════════ */
function initTelemetryHUD() {
  // Animate lap time counter
  const lapValue = document.querySelector('.hud-value:first-of-type');
  if (!lapValue) return;

  // Animate the SVG telemetry graph with a subtle breathing effect
  const graph = document.querySelector('.tele-graph');
  if (graph) {
    const polylines = graph.querySelectorAll('polyline');
    animateTelemetry(polylines);
  }

  // Animate delta value with subtle flicker
  const deltaVal = document.querySelector('.hud-delta-value');
  if (deltaVal) {
    animateDelta(deltaVal);
  }
}

function animateTelemetry(polylines) {
  // Original points for each polyline
  const originals = [
    '0,30 15,20 25,25 35,10 50,15 60,8 75,18 85,12 100,20 115,5 120,10',
    '0,35 15,28 25,22 35,28 50,20 60,25 75,15 85,22 100,28 115,18 120,22',
    '0,25 15,35 25,30 35,20 50,30 60,18 75,28 85,8 100,15 115,25 120,30',
  ];

  let t = 0;

  function tick() {
    t += 0.02;
    polylines.forEach((pl, i) => {
      const pts = originals[i].split(' ').map(pair => {
        const [x, y] = pair.split(',').map(Number);
        const offset = Math.sin(t + i * 1.2 + x * 0.05) * 2;
        return `${x},${Math.max(2, Math.min(38, y + offset))}`;
      });
      pl.setAttribute('points', pts.join(' '));
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function animateDelta(el) {
  const base = -0.347;
  let t = 0;

  function tick() {
    t += 0.015;
    const jitter = (Math.sin(t * 3.1) * 0.003 + Math.cos(t * 1.7) * 0.002).toFixed(3);
    const val = (base + parseFloat(jitter)).toFixed(3);
    el.textContent = val;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════
   DISCIPLINE HOVER — Keyboard accessible
   ═══════════════════════════════════════════ */
function initDisciplineHovers() {
  const cards = document.querySelectorAll('.disc-card');
  cards.forEach(card => {
    // Make focusable for keyboard nav
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        card.click();
        e.preventDefault();
      }
    });
  });
}

/* ═══════════════════════════════════════════
   NEWSLETTER FORM — Basic validation
   ═══════════════════════════════════════════ */
function initNewsletterForm() {
  const form  = document.querySelector('.newsletter-form');
  const input = form ? form.querySelector('.nl-input') : null;
  const btn   = form ? form.querySelector('.btn-cta') : null;

  if (!form || !input || !btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!isValidEmail(email)) {
      input.style.outline = '2px solid #FF3D00';
      input.focus();
      return;
    }

    // Success state
    input.style.outline = '2px solid #69F0AE';
    btn.textContent     = '¡LISTO! ✓';
    btn.style.background = '#2e7d32';
    input.value = '';

    setTimeout(() => {
      btn.textContent     = 'QUIERO ESTAR AL DÍA';
      btn.style.background = '';
      input.style.outline = '';
    }, 3000);
  });

  input.addEventListener('input', () => {
    input.style.outline = '';
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ═══════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
   ═══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════
   REDUCED MOTION FALLBACK
   ═══════════════════════════════════════════ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--transition', '0.01ms');
  // Immediately show all fade-up elements
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
}
