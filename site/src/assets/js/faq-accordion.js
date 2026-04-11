(function () {
  'use strict';

  // Native <details> does 90% of what we need. The only enhancement:
  // if the URL has a #hash pointing to a faq__item, open it on load and
  // smooth-scroll to it. Makes the FAQ items deep-linkable per spec §3.3.
  function openFromHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;
    var el = document.getElementById(hash);
    if (el && el.classList && el.classList.contains('faq__item')) {
      el.open = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Close other items when one opens, accordion-style (single-expand UX).
  function wireAccordionBehavior() {
    var items = document.querySelectorAll('.faq__item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  wireAccordionBehavior();
  openFromHash();
  window.addEventListener('hashchange', openFromHash);
})();
