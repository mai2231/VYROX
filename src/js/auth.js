/** Demonstration-only account entry screens. No credentials are stored. */
import { $, toast } from './ui.js';

export const initAuth = () => {
  const forms = document.querySelectorAll('[data-auth-form]');
  if (!forms.length) return;

  document.addEventListener('vyrox:form-valid', (event) => {
    const form = event.target;
    if (!form.matches('[data-auth-form]')) return;
    event.preventDefault();
    const button = form.querySelector('[type="submit"]');
    const redirect = form.dataset.redirect || 'profile.html?demo=1';
    button?.classList.add('btn-loading');
    window.setTimeout(() => {
      button?.classList.remove('btn-loading');
      if (form.dataset.mode === 'forgot') {
        form.classList.add('hidden');
        $('[data-reset-sent]')?.classList.remove('hidden');
        toast('If this were Phase 3, a reset link would be emailed.', { type: 'info', title: 'Demo only' });
        return;
      }
      toast('Demo session simulated. No account or password was stored.', { type: 'info', title: 'Demo account' });
      window.location.href = redirect;
    }, 550);
  });
};
