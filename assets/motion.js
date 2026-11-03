/* ==========================================================================
   Réseau Alliance Genève — moteur d'animations
   GSAP + ScrollTrigger + Lenis. Tout est désactivé si l'utilisateur préfère
   réduire les animations ; seules transform/opacity sont animées.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var isDesktop = window.matchMedia('(min-width: 900px)').matches;
  var hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  document.documentElement.classList.add(reduce ? 'motion-off' : 'motion-on');
  document.documentElement.classList.remove('motion-pending');

  /* ---------- Header compact au scroll (toujours actif, très léger) ---------- */
  var header = document.querySelector('.site-header');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (reduce || !hasGSAP) {
    // Mode statique : tout est visible, pas de pin, pas de scrub.
    document.querySelectorAll('[data-reveal], .split-word, .hero__word').forEach(function (el) {
      el.style.opacity = '';
      el.style.transform = '';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Défilement fluide (Lenis) ---------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined' && finePointer) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // Ancres internes
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: -80 }); }
      });
    });
  }

  /* ---------- Curseur personnalisé (desktop uniquement) ---------- */
  if (finePointer) {
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.innerHTML = '<span class="cursor__dot"></span><span class="cursor__ring"></span>';
    document.body.appendChild(cursor);
    var dot = cursor.querySelector('.cursor__dot');
    var ring = cursor.querySelector('.cursor__ring');
    var qx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
    var qy = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
    var dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    window.addEventListener('mousemove', function (e) {
      qx(e.clientX); qy(e.clientY); dx(e.clientX); dy(e.clientY);
      cursor.classList.add('is-visible');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('is-visible'); });
    document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  /* ---------- Hero : entrée orchestrée + parallaxe ---------- */
  var hero = document.querySelector('.hero');
  if (hero) {
    var words = hero.querySelectorAll('.hero__word');
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(hero.querySelector('.hero__media'), { scale: 1.12, duration: 2.2, ease: 'power2.out' }, 0)
      .from(hero.querySelector('.hero__kicker'), { y: 20, opacity: 0, duration: 0.8 }, 0.15)
      .from(words, { yPercent: 110, opacity: 0, rotateX: -20, duration: 1.1, stagger: 0.06 }, 0.25)
      .from(hero.querySelectorAll('.hero__lead, .hero__actions'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.9)
      .from(hero.querySelector('.hero__card'), { y: 40, opacity: 0, duration: 1 }, 1.05)
      .from(hero.querySelector('.hero__scroll'), { opacity: 0, duration: 0.8 }, 1.4);

    // Parallaxe au scroll : l'image recule, le texte monte et s'efface
    gsap.to(hero.querySelector('.hero__media'), {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to(hero.querySelector('.hero__inner'), {
      yPercent: -12, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: hero, start: '30% top', end: 'bottom top', scrub: true }
    });

    // Parallaxe souris (desktop)
    if (finePointer && isDesktop) {
      var media = hero.querySelector('.hero__media img, .hero__media video');
      var mx = gsap.quickTo(media, 'x', { duration: 1.2, ease: 'power3' });
      var my = gsap.quickTo(media, 'y', { duration: 1.2, ease: 'power3' });
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        mx(((e.clientX - r.left) / r.width - 0.5) * -24);
        my(((e.clientY - r.top) / r.height - 0.5) * -16);
      }, { passive: true });
    }
  }

  /* ---------- Révélations génériques ---------- */
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    var kind = el.getAttribute('data-reveal') || 'up';
    var from = { opacity: 0, duration: 1.1, ease: 'power3.out' };
    if (kind === 'up') from.y = 48;
    if (kind === 'left') from.x = -60;
    if (kind === 'right') from.x = 60;
    if (kind === 'scale') { from.scale = 0.9; from.y = 30; }
    if (kind === 'clip-left') { from.clipPath = 'inset(0 100% 0 0)'; delete from.opacity; from.duration = 1.3; from.ease = 'power4.inOut'; }
    if (kind === 'clip-right') { from.clipPath = 'inset(0 0 0 100%)'; delete from.opacity; from.duration = 1.3; from.ease = 'power4.inOut'; }
    gsap.from(el, Object.assign(from, {
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    }));
  });

  // Groupes avec décalage entre enfants
  gsap.utils.toArray('[data-reveal-group]').forEach(function (group) {
    var children = group.children;
    gsap.from(children, {
      y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09,
      scrollTrigger: { trigger: group, start: 'top 82%', once: true }
    });
  });

  /* ---------- Titres découpés mot à mot ---------- */
  gsap.utils.toArray('.split').forEach(function (el) {
    var ws = el.querySelectorAll('.split-word');
    gsap.from(ws, {
      yPercent: 100, opacity: 0, duration: 0.9, ease: 'power4.out', stagger: 0.04,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* ---------- Texte révélé mot à mot au scroll (scrub) ---------- */
  gsap.utils.toArray('.scrub-text').forEach(function (el) {
    var ws = el.querySelectorAll('.scrub-word');
    gsap.fromTo(ws, { opacity: 0.14 }, {
      opacity: 1, ease: 'none', stagger: 0.6,
      scrollTrigger: { trigger: el, start: 'top 75%', end: 'bottom 45%', scrub: 0.4 }
    });
  });

  /* ---------- Filigranes : défilement parallaxe ---------- */
  gsap.utils.toArray('.watermark').forEach(function (el) {
    gsap.fromTo(el, { xPercent: 12 }, {
      xPercent: -12, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- Secteurs : défilement horizontal épinglé (desktop) ---------- */
  var hs = document.querySelector('.hscroll');
  if (hs) {
    ScrollTrigger.matchMedia({
      '(min-width: 900px)': function () {
        var track = hs.querySelector('.hscroll__track');
        var getDist = function () { return track.scrollWidth - hs.clientWidth; };
        gsap.to(track, {
          x: function () { return -getDist(); }, ease: 'none',
          scrollTrigger: {
            trigger: hs, start: 'top top', end: function () { return '+=' + getDist(); },
            pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1
          }
        });
        gsap.from(hs.querySelectorAll('.sector'), {
          y: 60, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: hs, start: 'top 70%', once: true }
        });
      }
    });
  }

  /* ---------- Cartes empilées (valeurs) : léger recul des cartes passées ---------- */
  var stack = document.querySelector('.stack');
  if (stack) {
    var cards = gsap.utils.toArray('.stack__card');
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      gsap.to(card.querySelector('.stack__inner'), {
        scale: 0.92, opacity: 0.55, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top 20%', scrub: true }
      });
    });
  }

  /* ---------- Compteurs ---------- */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: 'power3.out',
      onUpdate: function () { el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* ---------- Couleur de fond qui glisse entre sections ---------- */
  gsap.utils.toArray('[data-bg]').forEach(function (sec) {
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: function (self) {
        if (self.isActive) gsap.to(document.body, { backgroundColor: sec.getAttribute('data-bg'), duration: 0.7, ease: 'power2.out', overwrite: 'auto' });
      }
    });
  });

  /* ---------- Cartes équipe : inclinaison 3D (desktop) ---------- */
  if (finePointer) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 12);
        rx(((e.clientY - r.top) / r.height - 0.5) * -12);
      }, { passive: true });
      card.addEventListener('mouseleave', function () { rx(0); ry(0); });
    });
  }

  /* ---------- Anneau du bandeau CTA : rotation au scroll ---------- */
  gsap.utils.toArray('.cta__ring').forEach(function (ring) {
    gsap.to(ring, { rotate: 40, ease: 'none', scrollTrigger: { trigger: ring.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
