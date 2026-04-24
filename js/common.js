/* METAGATE DTTC - Common Scripts */

// ----- Mobile Navigation Toggle -----
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => menu.classList.remove('open'))
    );
  }

  // ----- Counter Animation (fires when visible) -----
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      const run = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(target * eased);
        el.textContent = val.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(run);
        else el.textContent = target.toLocaleString() + suffix;
      };
      requestAnimationFrame(run);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    counters.forEach(c => io.observe(c));
  }

  // ----- Cookie Banner (Google Analytics Notice) -----
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    if (!localStorage.getItem('dttc_cookie_ok')) {
      banner.classList.remove('hidden');
    }
    const btn = banner.querySelector('button');
    if (btn) btn.addEventListener('click', () => {
      localStorage.setItem('dttc_cookie_ok', '1');
      banner.classList.add('hidden');
    });
  }

  // ----- Mark active nav link -----
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0];
    if (href === path) a.classList.add('active');
  });

  // ----- Course filter (if present) -----
  const filterButtons = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('[data-tags]');
  if (filterButtons.length && courseCards.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        courseCards.forEach(card => {
          const tags = (card.dataset.tags || '').split(' ');
          card.style.display = (f === 'all' || tags.includes(f)) ? '' : 'none';
        });
      });
    });
  }
});
