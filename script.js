'use strict';

/* ─────────────────────────────────────────
   MOBILE VIEWPORT HEIGHT FIX
───────────────────────────────────────── */
function setVH() {
  document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
}
setVH();
window.addEventListener('resize', setVH, { passive: true });

/* ─────────────────────────────────────────
   PAGE LOADER
───────────────────────────────────────── */
var loader    = document.getElementById('pageLoader');
var loaderBar = document.getElementById('loaderBar');
var loaderPct = document.getElementById('loaderPercent');
var progress  = 0;
var loaderDone = false;

var loaderInterval = setInterval(function() {
  if (loaderDone) return;
  var inc = progress < 70 ? (Math.random() * 4 + 1) : (Math.random() * 8 + 3);
  progress = Math.min(progress + inc, 98);
  if (loaderBar) loaderBar.style.width = progress + '%';
  if (loaderPct) loaderPct.textContent = Math.floor(progress) + '%';
}, 60);

function finishLoader() {
  if (loaderDone) return;
  loaderDone = true;
  clearInterval(loaderInterval);
  if (loaderBar) loaderBar.style.width = '100%';
  if (loaderPct) loaderPct.textContent = '100%';
  setTimeout(function() {
    if (loader) {
      loader.classList.add('hide');
      setTimeout(function() {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 700);
    }
    initCounters();
  }, 380);
}

window.addEventListener('load', finishLoader);
// Failsafe — always remove loader after 3s no matter what
setTimeout(finishLoader, 3000);

/* ─────────────────────────────────────────
   HERO CANVAS PARTICLES
───────────────────────────────────────── */
function initCanvas() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeParticle(init) {
    return {
      x:       Math.random() * W,
      y:       init ? Math.random() * H : H + 10,
      r:       Math.random() * 1.5 + 0.3,
      speed:   Math.random() * 0.3 + 0.08,
      drift:   (Math.random() - 0.5) * 0.15,
      alpha:   Math.random() * 0.5 + 0.1,
      life:    0,
      maxLife: Math.random() * 300 + 200,
      curAlpha: 0
    };
  }

  function updateParticle(p) {
    p.y -= p.speed;
    p.x += p.drift;
    p.life++;
    var prog = p.life / p.maxLife;
    p.curAlpha = p.alpha * Math.sin(Math.PI * prog);
    if (p.y < -10) { var n = makeParticle(false); Object.assign(p, n); }
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,168,107,' + p.curAlpha + ')';
    ctx.fill();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function(p) { updateParticle(p); drawParticle(p); });
    requestAnimationFrame(animate);
  }

  try {
    resize();
    particles = [];
    for (var i = 0; i < 80; i++) particles.push(makeParticle(true));
    animate();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function() {
        resize();
        particles = [];
        for (var i = 0; i < 80; i++) particles.push(makeParticle(true));
      }).observe(canvas);
    }
  } catch(e) { console.warn('Canvas error:', e); }
}
initCanvas();

/* ─────────────────────────────────────────
   SCROLL PROGRESS BAR
───────────────────────────────────────── */
var scrollBar = document.getElementById('scrollProgress');
if (scrollBar) {
  window.addEventListener('scroll', function() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  }, { passive: true });
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
var navbar      = document.getElementById('navbar');
var allNavLinks = document.querySelectorAll('.nav-link');
var allSections = document.querySelectorAll('section[id]');

function handleNavbar() {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  var current = '';
  allSections.forEach(function(sec) {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  allNavLinks.forEach(function(l) {
    l.classList.toggle('active', l.getAttribute('href') === ('#' + current));
  });
}
window.addEventListener('scroll', handleNavbar, { passive: true });
handleNavbar();

/* ─────────────────────────────────────────
   HAMBURGER / MOBILE NAV
───────────────────────────────────────── */
var hamburger  = document.getElementById('hamburger');
var navOverlay = document.getElementById('navOverlay');

function closeMenu() {
  if (hamburger)  hamburger.classList.remove('open');
  if (navOverlay) navOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger && navOverlay) {
  hamburger.addEventListener('click', function() {
    var isOpen = hamburger.classList.toggle('open');
    navOverlay.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navOverlay.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', closeMenu);
  });
}

/* ─────────────────────────────────────────
   SMOOTH SCROLL
───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    closeMenu();
  });
});

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
if (typeof IntersectionObserver !== 'undefined') {
  var revealObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.07 });
  document.querySelectorAll('.reveal').forEach(function(el) { revealObs.observe(el); });
} else {
  // Fallback: show all immediately
  document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });
}

/* ─────────────────────────────────────────
   COUNTERS
───────────────────────────────────────── */
function initCounters() {
  document.querySelectorAll('.stat-num[data-count]').forEach(function(el) {
    var target   = +el.dataset.count;
    var start    = performance.now();
    var duration = 1600;
    function tick(now) {
      var pct  = Math.min((now - start) / duration, 1);
      var ease = 1 - Math.pow(1 - pct, 3);
      el.textContent = Math.floor(ease * target);
      if (pct < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  });
}

/* ─────────────────────────────────────────
   CONTEXT-AWARE RING CURSOR
───────────────────────────────────────── */
var cursorRing = document.getElementById('cursorRing');
var isPointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

var darkBgSelectors = ['.hero', '.section-dark', '.cta-band', '.marquee-strip', '.footer'];

if (isPointer && cursorRing) {
  var cx = -200, cy = -200;
  var rx = -200, ry = -200;

  document.addEventListener('mouseenter', function() { cursorRing.classList.add('active'); });
  document.addEventListener('mouseleave', function() { cursorRing.classList.remove('active'); });

  document.addEventListener('mousemove', function(e) {
    cx = e.clientX; cy = e.clientY;
    checkDark(e.clientX, e.clientY);
  });

  function checkDark(x, y) {
    try {
      var el = document.elementFromPoint(x, y);
      if (!el) return;
      var node = el;
      var onDark = false;
      while (node && node !== document.documentElement) {
        for (var i = 0; i < darkBgSelectors.length; i++) {
          if (node.matches && node.matches(darkBgSelectors[i])) { onDark = true; break; }
        }
        if (onDark) break;
        node = node.parentElement;
      }
      cursorRing.classList.toggle('on-dark', onDark);
    } catch(e) {}
  }

  function animateRing() {
    rx += (cx - rx) * 0.13;
    ry += (cy - ry) * 0.13;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  var hoverSel = 'a, button, .project-card, .service-card, .skill-pill, .testimonial-card, .contact-item';
  document.querySelectorAll(hoverSel).forEach(function(el) {
    el.addEventListener('mouseenter', function() { cursorRing.classList.add('hovered'); });
    el.addEventListener('mouseleave', function() { cursorRing.classList.remove('hovered'); });
  });

  document.addEventListener('mousedown', function() { cursorRing.classList.add('clicking'); });
  document.addEventListener('mouseup',   function() { cursorRing.classList.remove('clicking'); });

  window.addEventListener('scroll', function() { checkDark(cx, cy); }, { passive: true });
}

/* ─────────────────────────────────────────
   HERO BG TEXT PARALLAX
───────────────────────────────────────── */
var heroBgTxt = document.querySelector('.hero-bg-text');
if (heroBgTxt && isPointer) {
  window.addEventListener('scroll', function() {
    if (window.scrollY < window.innerHeight) {
      heroBgTxt.style.transform = 'translateY(calc(-50% + ' + (window.scrollY * 0.28) + 'px))';
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────
   PROJECT MODAL
───────────────────────────────────────── */
var modalOverlay  = document.getElementById('modalOverlay');
var modalClose    = document.getElementById('modalClose');
var modalImg      = document.getElementById('modalImg');
var modalTag      = document.getElementById('modalTag');
var modalTitleEl  = document.getElementById('modalTitle');
var modalDesc     = document.getElementById('modalDesc');
var modalTech     = document.getElementById('modalTech');
var modalResult   = document.getElementById('modalResult');
var modalCta      = document.getElementById('modalCta');
var modalWhatsapp = document.getElementById('modalWhatsapp');

var cardGradients = {
  luxewear:     'linear-gradient(145deg,#120a22,#2a1545,#111a28)',
  sparkleclean: 'linear-gradient(145deg,#061510,#0e2a1c,#061a10)',
  accesspro:    'linear-gradient(145deg,#160e04,#332208,#1e1506)'
};
var waMessages = {
  luxewear:     'Hi%20Wesley%2C%20I%20saw%20LuxeWear%20NG%20and%20want%20something%20similar!',
  sparkleclean: 'Hi%20Wesley%2C%20I%20saw%20SparkleClean%20Lagos%20and%20want%20something%20similar!',
  accesspro:    'Hi%20Wesley%2C%20I%20saw%20AccessPro%20Events%20and%20want%20something%20similar!'
};

function openModal(card) {
  if (!modalOverlay || !card) return;
  var d = card.dataset;
  if (modalImg)      modalImg.style.background = cardGradients[d.project] || '#161616';
  if (modalTag)      modalTag.textContent      = d.tag     || '';
  if (modalTitleEl)  modalTitleEl.textContent  = d.title   || '';
  if (modalDesc)     modalDesc.textContent     = d.desc    || '';
  if (modalTech)     modalTech.textContent     = d.tech    || '';
  if (modalResult)   modalResult.textContent   = d.result  || '';
  if (modalWhatsapp) modalWhatsapp.href = 'https://wa.me/2349018214632?text=' + (waMessages[d.project] || '');
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(function() {
    var sa = modalOverlay.querySelector('.modal-scroll-area');
    if (sa) sa.scrollTop = 0;
  }, 10);
  if (modalClose) modalClose.focus();
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.project-card').forEach(function(card) {
  card.addEventListener('click', function(e) {
    if (e.target.closest('.proj-live-btn') || e.target.closest('.proj-live-link')) return;
    openModal(card);
  });
});

document.querySelectorAll('.open-modal').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    var card = btn.closest('.project-card');
    if (card) openModal(card);
  });
});

if (modalClose)   modalClose.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', function(e) { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

if (modalCta) {
  modalCta.addEventListener('click', function(e) {
    e.preventDefault();
    closeModal();
    setTimeout(function() {
      var c = document.getElementById('contact');
      if (c) window.scrollTo({ top: c.offsetTop - 68, behavior: 'smooth' });
    }, 400);
  });
}

/* ─────────────────────────────────────────
   MOBILE: tap card image to show overlay
───────────────────────────────────────── */
if (!isPointer) {
  document.querySelectorAll('.project-card').forEach(function(card) {
    var overlay = card.querySelector('.proj-overlay');
    var shown   = false;

    card.addEventListener('touchend', function(e) {
      if (e.target.closest('.proj-live-btn') || e.target.closest('.proj-live-link')) return;
      if (e.target.closest('.open-modal')    || e.target.closest('.proj-link'))       return;
      if (!shown) {
        e.preventDefault();
        shown = true;
        if (overlay) overlay.classList.add('show');
      }
    }, { passive: false });

    document.addEventListener('touchstart', function(e) {
      if (!card.contains(e.target) && shown) {
        shown = false;
        if (overlay) overlay.classList.remove('show');
      }
    }, { passive: true });
  });
}

/* ─────────────────────────────────────────
   SERVICE CARD TILT (desktop only)
───────────────────────────────────────── */
if (isPointer) {
  document.querySelectorAll('.service-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x    = (e.clientX - rect.left) / rect.width  - 0.5;
      var y    = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = 'perspective(600px) rotateY(' + (x * 4) + 'deg) rotateX(' + (-y * 4) + 'deg)';
    });
    card.addEventListener('mouseleave', function() { card.style.transform = ''; });
  });
}

/* ─────────────────────────────────────────
   FLOATING WHATSAPP
───────────────────────────────────────── */
var waFloat = document.getElementById('waFloat');
if (waFloat) {
  function toggleWa() { waFloat.classList.toggle('visible', window.scrollY > 400); }
  window.addEventListener('scroll', toggleWa, { passive: true });
  toggleWa();
}

/* ─────────────────────────────────────────
   BACK TO TOP
───────────────────────────────────────── */
var backTop = document.getElementById('backTop');
if (backTop) {
  window.addEventListener('scroll', function() {
    backTop.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });
  backTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────── */
var contactForm = document.getElementById('contactForm');
var submitBtn   = document.getElementById('submitBtn');
var formSuccess = document.getElementById('formSuccess');

if (contactForm && submitBtn) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var label = submitBtn.querySelector('.btn-label');
    var dots  = submitBtn.querySelector('.btn-dots');

    // Show loading dots
    if (label) label.style.display = 'none';
    if (dots)  dots.style.display  = 'flex';
    submitBtn.disabled = true;

    // Submit to Formspree
    var data = new FormData(contactForm);
    fetch('https://formspree.io/f/xjgeznpg', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
    .then(function(response) {
      if (label) label.style.display = '';
      if (dots)  dots.style.display  = 'none';
      submitBtn.disabled = false;

      if (response.ok) {
        // Success
        contactForm.reset();
        if (formSuccess) {
          formSuccess.style.display    = 'flex';
          formSuccess.style.opacity    = '0';
          formSuccess.style.transform  = 'translateY(6px)';
          formSuccess.style.transition = 'opacity .45s, transform .45s';
          requestAnimationFrame(function() {
            formSuccess.style.opacity  = '1';
            formSuccess.style.transform = 'none';
          });
          setTimeout(function() {
            formSuccess.style.opacity = '0';
            setTimeout(function() { formSuccess.style.display = 'none'; }, 400);
          }, 5000);
        }
      } else {
        // Server error
        alert('Oops! Something went wrong. Please email me directly at 1wesleydm@gmail.com');
      }
    })
    .catch(function() {
      // Network error
      if (label) label.style.display = '';
      if (dots)  dots.style.display  = 'none';
      submitBtn.disabled = false;
      alert('No internet connection. Please email me directly at 1wesleydm@gmail.com');
    });
  });
}

/* ─────────────────────────────────────────
   FOOTER YEAR
───────────────────────────────────────── */
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─────────────────────────────────────────
   EMAIL LINK — built at runtime so Cloudflare
   email obfuscation cannot touch it
───────────────────────────────────────── */
(function() {
  var u = '1wesleydm';
  var d = 'gmail.com';
  var email = u + '@' + d;
  var link  = document.getElementById('emailLink');
  var disp  = document.getElementById('emailDisplay');
  if (link) link.href = 'mailto:' + email;
  if (disp) disp.textContent = email;
})();