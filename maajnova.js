(function () {
  if (window.lucide) lucide.createIcons();
  const isStatic = location.search.includes('static');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || isStatic;

  // preloader — brief branded intro, then reveal the page
  const pre = document.getElementById('preloader');
  if (pre && !isStatic) {
    const start = Date.now();
    let hidden = false;
    const hide = () => {
      if (hidden) return; hidden = true;
      const wait = Math.max(0, (reduce ? 300 : 1500) - (Date.now() - start));
      setTimeout(() => {
        pre.classList.add('done');
        pre.addEventListener('transitionend', () => pre.remove(), { once: true });
        setTimeout(() => { if (pre.parentNode) pre.remove(); }, 900);
      }, wait);
    };
    window.addEventListener('load', hide);
    setTimeout(hide, 2600); // safety cap so slow images never trap the loader
  } else if (pre) {
    pre.remove();
  }

  // nav scroll state
  const hdr = document.getElementById('hdr');
  if (hdr) {
    const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 30);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }

  // mobile menu
  const burger = document.getElementById('burger'), mm = document.getElementById('mobileMenu');
  if (burger && mm) {
    burger.addEventListener('click', () => mm.classList.toggle('open'));
    mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mm.classList.remove('open')));
  }

  // data-href: make any element navigate like a link
  document.querySelectorAll('[data-href]').forEach(el => {
    el.addEventListener('click', () => { location.href = el.getAttribute('data-href'); });
  });

  // GSAP scroll reveals
  const reveals = document.querySelectorAll('[data-reveal]');
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    reveals.forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  } else {
    reveals.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
  }

  // --- richer motion for interior pages (image parallax; hero entrance is CSS) ---
  if (window.gsap && window.ScrollTrigger && !reduce) {
    // subtle parallax drift on cover images as they scroll through
    gsap.utils.toArray('.detail-media').forEach((el) => {
      gsap.fromTo(el,
        { backgroundPositionY: '42%' },
        { backgroundPositionY: '60%', ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // counters
  const runCount = (el) => {
    const end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    let start = null;
    const step = (t) => {
      if (!start) start = t; const p = Math.min((t - start) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => isStatic ? (el.textContent = el.dataset.count + (el.dataset.suffix || '')) : cio.observe(el));
  }

  // modal
  const modal = document.getElementById('modal');
  if (modal) {
    const open = () => { modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
    document.querySelectorAll('[data-open-modal]').forEach(b => b.addEventListener('click', open));
    const x = document.getElementById('modalClose'); if (x) x.addEventListener('click', close);
    const sc = document.getElementById('successClose'); if (sc) sc.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.name, email = form.email; let ok = true;
        const setErr = (input, show) => input.parentElement.querySelector('.err').style.display = show ? 'block' : 'none';
        if (!name.value.trim()) { setErr(name, true); ok = false; } else setErr(name, false);
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) { setErr(email, true); ok = false; } else setErr(email, false);
        if (!ok) return;
        document.getElementById('formView').style.display = 'none';
        document.getElementById('successView').style.display = 'block';
        if (window.lucide) lucide.createIcons();
      });
    }
  }
})();
