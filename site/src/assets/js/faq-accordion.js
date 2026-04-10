'use strict';

for (const item of document.querySelectorAll('.faq-item')) {
  const trigger = item.querySelector('.faq-trigger');
  if (!trigger) continue;
  trigger.addEventListener('click', () => {
    const expanded = item.getAttribute('aria-expanded') === 'true';
    item.setAttribute('aria-expanded', String(!expanded));
    trigger.setAttribute('aria-expanded', String(!expanded));
  });
}
