'use strict';

const topbar = document.querySelector('[data-topbar]');

if (topbar) {
  const sync = () => {
    topbar.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  sync();
  window.addEventListener('scroll', sync, { passive: true });
}
