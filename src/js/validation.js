/** Accessible client-side form validation for demonstration forms. */
import { $, $$, toast } from './ui.js';

const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
  phone: /^(?:\+63|0)9\d{9}$/,
  postal: /^\d{4}$/
};

const errorFor = (field) => {
  const id = field.id || field.name;
  if (!id) return null;
  let node = document.querySelector(`[data-error-for="${id}"]`);
  if (node) return node;
  node = document.createElement('p');
  node.className = 'field-error';
  node.dataset.errorFor = id;
  node.id = `${id}-error`;
  node.hidden = true;
  field.insertAdjacentElement('afterend', node);
  return node;
};

const showError = (field, message) => {
  const node = errorFor(field);
  field.classList.add('input-invalid');
  field.setAttribute('aria-invalid', 'true');
  if (node) {
    node.textContent = message;
    node.hidden = false;
    node.classList.remove('hidden');
    field.setAttribute('aria-describedby', node.id);
  }
};

const clearError = (field) => {
  const node = document.querySelector(`[data-error-for="${field.id || field.name}"]`);
  field.classList.remove('input-invalid');
  field.removeAttribute('aria-invalid');
  if (node) {
    node.hidden = true;
    node.classList.add('hidden');
    node.textContent = '';
  }
};

const validateField = (field, form) => {
  const rules = (field.dataset.rules || '').split('|').filter(Boolean);
  if (!rules.length) return true;
  const value = field.type === 'checkbox' ? (field.checked ? 'on' : '') : field.value.trim();

  for (const rule of rules) {
    const [name, arg] = rule.split(':');
    if (name === 'required' && !value) {
      showError(field, field.dataset.requiredMessage || 'This field is required.');
      return false;
    }
    if (!value) continue;
    if (name === 'email' && !patterns.email.test(value)) {
      showError(field, 'Enter a valid email address.');
      return false;
    }
    if ((name === 'phone' || name === 'phone-ph') && !patterns.phone.test(value.replaceAll(/[\s.-]/g, ''))) {
      showError(field, 'Use a PH mobile number, e.g. 0917 123 4567.');
      return false;
    }
    if (name === 'postal' && !patterns.postal.test(value)) {
      showError(field, 'Enter a 4-digit postal code.');
      return false;
    }
    if (name === 'min' && value.length < Number(arg)) {
      showError(field, `Use at least ${arg} characters.`);
      return false;
    }
    if (name === 'minvalue' && Number(value) < Number(arg)) {
      showError(field, `Minimum value is ${arg}.`);
      return false;
    }
    if (name === 'match') {
      const other = form.querySelector(arg);
      if (other && other.value !== field.value) {
        showError(field, field.dataset.matchMessage || 'Values do not match.');
        return false;
      }
    }
    if (name === 'checked' && !field.checked) {
      showError(field, 'Confirm this to continue.');
      return false;
    }
  }

  clearError(field);
  return true;
};

export const validateForm = (form) => {
  const fields = $$('[data-rules]', form).filter((field) => !field.disabled && field.type !== 'hidden');
  const errors = {};
  fields.forEach((field) => {
    if (!validateField(field, form)) {
      const key = field.id || field.name;
      errors[field.name || field.id] = document.querySelector(`[data-error-for="${key}"]`)?.textContent || 'Please check this field.';
    }
  });
  const valid = Object.keys(errors).length === 0;
  if (!valid) {
    const first = fields.find((field) => field.classList.contains('input-invalid'));
    first?.focus?.({ preventScroll: false });
    if (typeof first?.scrollIntoView === 'function') first.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  return { valid, errors, fields };
};

const strength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
};

const initStrength = () => {
  $$('[data-strength-for]').forEach((meter) => {
    const target = document.querySelector(meter.dataset.strengthFor);
    if (!target) return;
    const bars = $$('[data-strength-bar]', meter);
    const label = $('[data-strength-label]', meter);
    target.addEventListener('input', () => {
      const score = strength(target.value);
      const labels = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];
      bars.forEach((bar, index) => {
        bar.classList.toggle('bg-red', index < score);
        bar.classList.toggle('bg-line', index >= score);
      });
      if (label) label.textContent = target.value ? labels[score] : 'Use 8+ characters';
    });
  });
};

export const initValidation = () => {
  $$('form[data-validate]').forEach((form) => {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', (event) => {
      const { valid } = validateForm(form);
      if (!valid) {
        event.preventDefault();
        toast('Check the highlighted fields.', { type: 'error', title: 'Almost there' });
        return;
      }
      const pulse = new CustomEvent('vyrox:form-valid', { bubbles: true, cancelable: true, detail: { form } });
      form.dispatchEvent(pulse);
      if (pulse.defaultPrevented) {
        event.preventDefault();
        return;
      }
      if (form.hasAttribute('data-handler')) return;
      event.preventDefault();
      if (form.hasAttribute('data-demo')) {
        toast(form.dataset.demo || 'Saved locally for this demonstration.', { title: 'Demo action' });
        const success = $('[data-form-success]', form.closest('main') ?? document);
        if (success) success.classList.remove('hidden');
        if (form.dataset.reset === 'true') form.reset();
      }
    });

    form.addEventListener('input', (event) => {
      if (event.target.matches('[data-rules]') && event.target.classList.contains('input-invalid')) validateField(event.target, form);
    });
    form.addEventListener('blur', (event) => {
      if (event.target.matches('[data-rules]') && event.target.value.trim()) validateField(event.target, form);
    }, true);
  });

  $$('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.passwordToggle || button.dataset.target);
      if (!target) return;
      const show = target.type === 'password';
      target.type = show ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      const icon = button.querySelector('use');
      if (icon) icon.setAttribute('href', icon.getAttribute('href').replace(show ? '#i-eye' : '#i-lock', show ? '#i-lock' : '#i-eye'));
    });
  });

  initStrength();
};
