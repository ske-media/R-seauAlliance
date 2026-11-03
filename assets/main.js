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
