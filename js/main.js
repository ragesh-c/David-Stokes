// ============================================================
// DAVID STOKES — main.js
// ============================================================

// 1. PAGE LOAD FADE-IN
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

// 2. NAV SCROLL STATE
const navEl = document.querySelector('.site-nav');
if (navEl) {
  const handleNavScroll = () => {
    navEl.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();
}

// 3. GHOST TEXT PARALLAX
const ghostText = document.querySelector('.ghost-text');
if (ghostText) {
  window.addEventListener('scroll', () => {
    const rect = ghostText.parentElement.getBoundingClientRect();
    const progress = 1 - (rect.top / window.innerHeight);
    ghostText.style.opacity = Math.min(Math.max(progress * 0.12, 0.03), 0.12);
  }, { passive: true });
}

// 4. CHAPTER STRIP — pause on hover
const strip = document.querySelector('.chapter-strip-inner');
if (strip) {
  strip.addEventListener('mouseenter', () => strip.style.animationPlayState = 'paused');
  strip.addEventListener('mouseleave', () => strip.style.animationPlayState = 'running');
}

// 5. REVIEW CAROUSEL — clone cards for seamless loop
function initReviewCarousels() {
  document.querySelectorAll('.reviews-track').forEach(function(track) {
    if (track.classList.contains('static-track')) return;
    var cards = track.querySelectorAll('.review-card');
    if (!cards.length) return;
    cards.forEach(function(card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });
}
document.addEventListener('DOMContentLoaded', initReviewCarousels);

// 6. COUNTDOWN TIMERS
var LAUNCH_DATE = (function() {
  var utcMidnight = new Date('2026-10-26T00:00:00Z');
  var londonTime = utcMidnight.toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false });
  var londonHour = parseInt(londonTime.split(':')[0], 10);
  return londonHour === 0 ? utcMidnight : new Date(utcMidnight.getTime() - londonHour * 3600000);
})();

function updateSiteCountdowns() {
  var now = new Date();
  var diff = LAUNCH_DATE - now;
  if (diff <= 0) return;

  var days  = Math.floor(diff / 86400000);
  var hours = Math.floor((diff % 86400000) / 3600000);
  var mins  = Math.floor((diff % 3600000) / 60000);
  var secs  = Math.floor((diff % 60000) / 1000);

  var cdDays  = document.getElementById('cdDays');
  var cdHours = document.getElementById('cdHours');
  var cdMins  = document.getElementById('cdMins');
  var cdSecs  = document.getElementById('cdSecs');

  if (cdDays)  cdDays.textContent  = String(days).padStart(2,'0');
  if (cdHours) cdHours.textContent = String(hours).padStart(2,'0');
  if (cdMins)  cdMins.textContent  = String(mins).padStart(2,'0');
  if (cdSecs)  cdSecs.textContent  = String(secs).padStart(2,'0');
}

updateSiteCountdowns();
setInterval(updateSiteCountdowns, 1000);

// 7. WAITLIST FORM HANDLER
window.handleWaitlistSubmit = function(e) {
  e.preventDefault();
  var form = e.target;
  var action = form.getAttribute('action') || form.getAttribute('data-action');

  var showDone = function() {
    var fields  = form.querySelector('.waitlist-fields');
    var success = form.querySelector('.waitlist-success');
    var small   = form.querySelector('.waitlist-small');
    if (fields)  fields.style.display  = 'none';
    if (small)   small.style.display   = 'none';
    if (success) {
      success.style.display = 'block';
      if (window.anime) {
        window.anime.animate(success, { opacity: [0, 1], y: [10, 0], duration: 600, ease: 'outExpo' });
      }
    }
  };

  if (action && !action.includes('YOURACCOUNT')) {
    var formData = new FormData(form);
    fetch(action, {
      method: 'POST',
      body: formData
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      showDone();
    })
    .catch(function(err) {
      showDone();
    });
  } else {
    showDone();
  }
};

// ── ANIME.JS ANIMATIONS ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (!window.anime) return;
  const { animate, createTimeline, stagger, utils } = window.anime;

  const heroSection = document.querySelector('.hero-section');
  const pageHero    = document.querySelector('.page-hero');

  // ─ Hero entrance (index.html) — Suzy Welch clip-reveal ──────
  // Each .line-inner sits inside an overflow:hidden container (.hero-eyebrow,
  // .hero-title-line, .hero-descriptor). Starting translateY(110%) puts the
  // text below the hard clip edge; animating to 0 reveals it sliding upward.
  if (heroSection) {
    utils.set('.hero-section .line-inner',         { translateY: '110%' });
    utils.set('.hero-section .hero-name-inscription', { opacity: 0 });

    createTimeline({ defaults: { ease: 'outExpo', duration: 1000 } })
      .add('.hero-section .hero-eyebrow .line-inner',
           { y: ['110%', '0%'] }, 300)
      .add('.hero-section .hero-title-line .line-inner',
           { y: ['110%', '0%'], duration: 1200, delay: stagger(200) }, '-=700')
      .add('.hero-section .hero-descriptor .line-inner',
           { y: ['110%', '0%'], duration: 1000 }, '-=500')
      .add('.hero-name-inscription',
           { opacity: [0, 1], duration: 1600, ease: 'out(1)' }, '-=900')
      .init();
  }

  // ─ Page hero stagger (About, Books, Journal, etc.) ──────────
  if (pageHero) {
    const heroEls = pageHero.querySelectorAll('.period-label, h1, p');
    heroEls.forEach(el => el.classList.remove('animate'));
    if (heroEls.length) {
      createTimeline({ defaults: { ease: 'outExpo', duration: 700 } })
        .add(heroEls, { opacity: [0, 1], y: [20, 0], delay: stagger(100) }, 200)
        .init();
    }
  }

  // ─ Scroll reveals ────────────────────────────────────────────
  document.querySelectorAll('.reveal').forEach(el => {
    const inHero = (heroSection && heroSection.contains(el)) ||
                   (pageHero    && pageHero.contains(el));
    if (!inHero) el.classList.add('animate');
  });

  // Track elements handled by grid/batch observers (skip individual observer)
  const handledByBatch = new Set();

  // Batch grids — stagger child cards / columns
  document.querySelectorAll('.books-grid-3.reveal, .other-works-grid.reveal, .underpinnings-editorial-grid.reveal').forEach(grid => {
    grid.classList.remove('animate');
    utils.set(grid, { opacity: 1, translateY: 0 });

    const cards = Array.from(grid.querySelectorAll('.book-card, .other-work-card, .underpinnings-col'));
    cards.forEach(c => {
      handledByBatch.add(c);
      utils.set(c, { opacity: 0, translateY: 40 });
    });

    const gridObs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      animate(cards, {
        opacity: [0, 1],
        y: [40, 0],
        duration: 900,
        delay: stagger(130),
        ease: 'outExpo',
      });
      gridObs.disconnect();
    }, { threshold: 0.05 });

    gridObs.observe(grid);
  });

  // Individual reveals — everything not handled by a batch observer
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (handledByBatch.has(el)) { revealObs.unobserve(el); return; }
      animate(el, {
        opacity: [0, 1],
        y: [28, 0],
        duration: 800,
        delay: parseInt(el.dataset.delay || '0'),
        ease: 'outExpo',
      });
      revealObs.unobserve(el);
    });
  }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal.animate').forEach(el => {
    if (!handledByBatch.has(el)) revealObs.observe(el);
  });

  // ─ Pull-quote reveals ─────────────────────────────────────────
  // CSS sets opacity:0 / translateY(16px) as initial state.
  // This observer animates them in when they enter the viewport.
  const pullQuoteObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animate(entry.target, {
        opacity: [0, 1],
        y: [16, 0],
        duration: 1000,
        ease: 'outExpo',
      });
      pullQuoteObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.pull-quote').forEach(el => {
    const inHero = (heroSection && heroSection.contains(el)) ||
                   (pageHero    && pageHero.contains(el));
    if (!inHero) pullQuoteObs.observe(el);
  });

  // ─ Failsafe — force-show anything still hidden after 1.4 s ───
  setTimeout(() => {
    document.querySelectorAll('.reveal.animate').forEach(el => {
      utils.set(el, { opacity: 1, translateY: 0 });
    });
    document.querySelectorAll('.books-grid-3 .book-card, .journal-card').forEach(el => {
      utils.set(el, { opacity: 1, translateY: 0 });
    });
    document.querySelectorAll('.pull-quote').forEach(el => {
      utils.set(el, { opacity: 1, translateY: 0 });
    });
    // Hero clip-reveal failsafe
    document.querySelectorAll('.hero-section .line-inner').forEach(el => {
      utils.set(el, { translateY: 0 });
    });
    document.querySelectorAll('.hero-section .hero-name-inscription').forEach(el => {
      utils.set(el, { opacity: 1 });
    });
  }, 1400);
});

// ─ Mobile navigation ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn      = document.querySelector('.nav-hamburger');
  const mobileNavOverlay  = document.getElementById('mobile-nav');
  const mobileNavCloseBtn = document.querySelector('.mobile-nav-close');

  if (!hamburgerBtn || !mobileNavOverlay || !mobileNavCloseBtn) return;

  hamburgerBtn.addEventListener('click', () => {
    mobileNavOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (window.anime) {
      window.anime.animate(
        mobileNavOverlay.querySelectorAll('.nav-links li, .btn'),
        {
          opacity: [0, 1],
          x: [-18, 0],
          duration: 500,
          delay: window.anime.stagger(60, { start: 150 }),
          ease: 'outExpo',
        }
      );
    }
  });

  mobileNavCloseBtn.addEventListener('click', () => {
    mobileNavOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });

  mobileNavOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNavOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
});
