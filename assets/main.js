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
