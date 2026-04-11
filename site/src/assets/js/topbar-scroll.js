(function () {
  'use strict';
  var topbar = document.querySelector('[data-topbar]');
  if (!topbar) return;

  function sync() {
    topbar.dataset.scrolled = window.scrollY > 4 ? 'true' : 'false';
  }

  sync();
  window.addEventListener('scroll', sync, { passive: true });
})();
