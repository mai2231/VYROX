/** Motion layer: scroll reveals, counters, tilt, ripples, countdown helpers. */

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const animateNumber = (element, target, { duration = 1200, prefix = '', suffix = '', format = true } = {}) => {
  if (!element) return;
  const end = Number(target) || 0;
  if (reduced()) {
    element.textContent = `${prefix}${format ? end.toLocaleString('en-PH') : end}${suffix}`;
    return;
  }
  const started = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(end * eased);
    element.textContent = `${prefix}${format ? current.toLocaleString('en-PH') : current}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

export const initReveals = (scope = document) => {
  const nodes = [...scope.querySelectorAll('[data-reveal]:not(.is-revealed)')];
  if (!nodes.length) return;
  if (reduced() || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  nodes.forEach((node, index) => {
    node.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
    observer.observe(node);
  });
};

export const initCounters = (scope = document) => {
  const nodes = [...scope.querySelectorAll('[data-count]')];
  if (!nodes.length) return;
  const run = (node) => {
    const target = Number(node.dataset.count);
    animateNumber(node, target, {
      prefix: node.dataset.prefix || '',
      suffix: node.dataset.suffix || '',
      format: node.dataset.format !== 'plain'
    });
  };
  if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  nodes.forEach((node) => observer.observe(node));
};

export const initTilt = (scope = document) => {
  if (reduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  scope.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
};

export const initRipples = (scope = document) => {
  if (reduced()) return;
  scope.addEventListener('click', (event) => {
    const target = event.target.closest('[data-ripple], .btn-primary, .btn-dark');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ink = document.createElement('span');
    ink.className = 'ripple-ink';
    ink.style.left = `${event.clientX - rect.left}px`;
    ink.style.top = `${event.clientY - rect.top}px`;
    target.classList.add('ripple-host');
    target.appendChild(ink);
    window.setTimeout(() => ink.remove(), 720);
  });
};

export const initMarquee = () => {
  // The marquee is CSS-driven; pause on reduced motion.
  if (reduced()) {
    document.querySelectorAll('.marquee-track, .anim-marquee').forEach((node) => {
      node.style.animation = 'none';
    });
  }
};

export const initCountdown = (element, deadline) => {
  if (!element) return;
  const update = () => {
    const remaining = Math.max(0, new Date(deadline).getTime() - Date.now());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining / 3600000) % 24);
    const minutes = Math.floor((remaining / 60000) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);
    element.querySelectorAll('[data-unit]').forEach((node) => {
      const value = { days, hours, minutes, seconds }[node.dataset.unit];
      node.textContent = String(value).padStart(2, '0');
    });
  };
  update();
  window.setInterval(update, 1000);
};

export const initAnimations = () => {
  initReveals();
  initCounters();
  initTilt();
  initRipples();
  initMarquee();
  document.querySelectorAll('[data-countdown]').forEach((node) => {
    const deadline = node.dataset.countdown === 'week'
      ? new Date(Date.now() + 6 * 86400000).toISOString()
      : node.dataset.countdown;
    if (deadline) initCountdown(node, deadline);
  });
};
