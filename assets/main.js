// Menu mobile
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  }

  toggle.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false);
  });

  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
})();

// Carte Google Maps chargée uniquement après clic (pas de cookie tiers par défaut)
(function () {
  var box = document.querySelector('.map--consent');
  if (!box) return;
  box.querySelector('.map__load').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = box.getAttribute('data-src');
    f.title = "Plan d'accès — Rte des Jeunes 35, 1227 Carouge";
    f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade'; f.allowFullscreen = true;
    box.classList.remove('map--consent'); box.innerHTML = ''; box.appendChild(f);
  });
})();

// Moteur d'animations chargé après "load" : l'image du hero garde toute la bande passante
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var files = ['assets/vendor/gsap.min.js', 'assets/vendor/ScrollTrigger.min.js', 'assets/vendor/lenis.min.js', 'assets/motion.js'];
  function next(i) {
    if (i >= files.length) return;
    var s = document.createElement('script'); s.src = files[i]; s.onload = function () { next(i + 1); }; s.onerror = function () { next(i + 1); };
    document.head.appendChild(s);
  }
  if (document.readyState === 'complete') next(0); else window.addEventListener('load', function () { next(0); });
})();
