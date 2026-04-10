'use strict';

let loaded = false;

function loadSnipcart() {
  if (loaded || document.querySelector('script[data-snipcart-loader]')) return;
  loaded = true;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.css';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://cdn.snipcart.com/themes/v3.7.1/default/snipcart.js';
  script.async = true;
  script.dataset.snipcartLoader = 'true';
  document.body.appendChild(script);
}

for (const eventName of ['focus', 'mouseover', 'scroll', 'touchstart']) {
  window.addEventListener(eventName, loadSnipcart, { once: true, passive: true });
}

window.setTimeout(loadSnipcart, 2750);
