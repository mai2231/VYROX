/** FAQ search + category filter, and other small content-page interactions. */
import { $, $$, toast } from './ui.js';

const initFaq = () => {
  const list = $('[data-faq-list]');
  if (!list) return;
  const items = $$('[data-faq-item]', list);
  const search = $('[data-faq-search]');
  const empty = $('[data-faq-empty]');
  let category = 'all';

  const apply = () => {
    const term = (search?.value ?? '').trim().toLowerCase();
    let shown = 0;
    items.forEach((item) => {
      const matchesCategory = category === 'all' || item.dataset.faqCategory === category;
      const matchesTerm = !term || item.textContent.toLowerCase().includes(term);
      const visible = matchesCategory && matchesTerm;
      item.classList.toggle('hidden', !visible);
      if (visible) shown += 1;
    });
    empty?.classList.toggle('hidden', shown > 0);
    list.classList.toggle('hidden', shown === 0);
    $$('[data-faq-count]').forEach((node) => { node.textContent = String(shown); });
  };

  apply();
  search?.addEventListener('input', apply);
  $$('[data-faq-filter]').forEach((button) => button.addEventListener('click', () => {
    category = button.dataset.faqFilter;
    $$('[data-faq-filter]').forEach((node) => node.classList.toggle('chip-active', node === button));
    apply();
  }));
  $('[data-faq-reset]')?.addEventListener('click', () => {
    category = 'all';
    if (search) search.value = '';
    $$('[data-faq-filter]').forEach((node) => node.classList.toggle('chip-active', node.dataset.faqFilter === 'all'));
    apply();
  });
};

const addSampleHandler = () => {
  const button = $('[data-track-sample]');
  if (!button) return;
  button.addEventListener('click', () => {
    const input = document.querySelector('input[name="order"]');
    if (input) input.value = 'VYX-2611-8841';
    toast('Sample reference filled in. Press Track to open it.', { type: 'info', title: 'Demo reference' });
  });
};

export const initContent = () => {
  initFaq();
  addSampleHandler();
};
