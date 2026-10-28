(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');
  const toggle = document.getElementById('motion-toggle');
  const label = document.getElementById('motion-label');
  const canvas = document.getElementById('rain');
  const context = canvas.getContext('2d');
  const glow = document.querySelector('.cursor-light');
  const art = document.querySelector('.world-image');
  let enabled = !reduced.matches;
  let frame = 0;
  let width = 0;
  let height = 0;
  let previous = 0;
  let drops = [];
  let targetX = -600;
  let targetY = -600;
  let currentX = -600;
  let currentY = -600;
  const makeDrop = (randomY = true) => ({ x: Math.random() * (width + 200), y: randomY ? Math.random() * height : -40, length: 12 + Math.random() * 22, speed: 380 + Math.random() * 440, alpha: .05 + Math.random() * .17 });
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    drops = Array.from({ length: Math.min(135, Math.max(40, Math.floor(width / 12))) }, () => makeDrop());
    if (!enabled && context) context.clearRect(0, 0, width, height);
  };
  const tick = (time) => {
    if (!enabled || document.hidden) { frame = 0; previous = 0; return; }
    const step = previous ? Math.min((time - previous) / 1000, .045) : .016;
    previous = time;
    if (context) {
      context.clearRect(0, 0, width, height);
      context.lineWidth = .6;
      for (const drop of drops) {
        drop.y += drop.speed * step;
        drop.x -= drop.speed * step * .16;
        if (drop.y > height + 45 || drop.x < -50) Object.assign(drop, makeDrop(false));
        context.strokeStyle = `rgba(198,181,195,${drop.alpha})`;
        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(drop.x - drop.length * .16, drop.y + drop.length);
        context.stroke();
      }
    }
    if (!coarse.matches) {
      currentX += (targetX - currentX) * .07;
      currentY += (targetY - currentY) * .07;
      glow.style.transform = `translate(${currentX - 275}px,${currentY - 275}px)`;
    }
    frame = window.requestAnimationFrame(tick);
  };
  const start = () => { if (enabled && !document.hidden && !frame) frame = window.requestAnimationFrame(tick); };
  const syncMotion = () => {
    document.body.classList.toggle('motion-off', !enabled);
    if (reduced.matches) enabled = false;
    toggle.disabled = reduced.matches;
    toggle.title = reduced.matches ? '遵循系统的减少动态效果设置' : '';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '暂停背景动态效果' : '开启背景动态效果');
    label.textContent = reduced.matches ? '动态 · 静止' : enabled ? '动态 · 开' : '动态 · 关';
    if (!enabled) {
      window.cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (context) context.clearRect(0, 0, width, height);
      art.style.removeProperty('--art-x'); art.style.removeProperty('--art-y');
    } else start();
  };
  toggle.addEventListener('click', () => { enabled = !enabled; syncMotion(); });
  reduced.addEventListener('change', () => { enabled = !reduced.matches; syncMotion(); });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (event) => {
    if (!enabled || coarse.matches) return;
    targetX = event.clientX; targetY = event.clientY;
    if (window.scrollY < height) {
      art.style.setProperty('--art-x', `${(event.clientX / width - .5) * 10}px`);
      art.style.setProperty('--art-y', `${(event.clientY / height - .5) * 7}px`);
    }
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  const sections = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }, { threshold: .1, rootMargin: '0px 0px -25px 0px' });
    sections.forEach((section) => observer.observe(section));
  } else sections.forEach((section) => section.classList.add('visible'));
  resize();
  syncMotion();
})();
