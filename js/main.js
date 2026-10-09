// Pelu Trini 1999 — interacciones
(() => {
  // Número de WhatsApp del salón (prefijo 34, sin espacios). Vacío = modo demo, no se envía nada.
  const WHATSAPP = '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navegación: fondo al hacer scroll + menú móvil ---------- */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  /* ---------- Aparición al hacer scroll (escalonada por grupo) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // Al terminar, se quita la clase para que los hovers usen su propia transición
        el.addEventListener('transitionend', () => {
          el.classList.remove('reveal', 'reveal--zoom');
          el.style.removeProperty('--d');
        }, { once: true });
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Parallax suave en la imagen del hero ---------- */
  const parallax = document.querySelectorAll('.parallax');
  if (parallax.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      parallax.forEach((img) => {
        const speed = parseFloat(img.dataset.speed) || 0.05;
        img.style.transform = `translateY(${-window.scrollY * speed}px)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* ---------- Filtro de servicios ---------- */
  const tabs = document.querySelectorAll('.tabs button');
  const cards = document.querySelectorAll('.card');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    const filter = tab.dataset.filter;
    cards.forEach((card) => {
      card.classList.toggle('is-hidden', filter !== 'todo' && card.dataset.cat !== filter);
    });
  }));

  /* ---------- Vídeos: visor ---------- */
  const lightbox = document.getElementById('lightbox');
  const inner = document.getElementById('lightboxInner');
  const closeBtn = document.getElementById('lightboxClose');
  let lastFocus = null;

  const openVideo = (src, title) => {
    lastFocus = document.activeElement;
    inner.innerHTML = '';
    if (src) {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      inner.appendChild(video);
    } else {
      // Aún no hay vídeo: hueco preparado para la presentación
      inner.innerHTML = `<div class="placeholder-video"><div><strong>${title}</strong>Aquí se reproducirá el vídeo del salón.</div></div>`;
    }
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const closeVideo = () => {
    lightbox.hidden = true;
    inner.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll('[data-video]').forEach((el) => {
    el.addEventListener('click', () => openVideo(el.dataset.video, el.dataset.title || 'Vídeo'));
    if (el.tagName === 'FIGURE') {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    }
  });
  closeBtn.addEventListener('click', closeVideo);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeVideo(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!lightbox.hidden) closeVideo();
    else if (links.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Antes / después ---------- */
  const compare = document.getElementById('compare');
  if (compare) {
    const range = compare.querySelector('input');
    range.addEventListener('input', () => compare.style.setProperty('--pos', `${range.value}%`));
  }

  /* ---------- Horario: día de hoy y abierto/cerrado ---------- */
  // Minutos desde medianoche por día (0 = domingo)
  const SCHEDULE = {
    0: [],
    1: [[570, 810], [960, 1170]],
    2: [[570, 810], [960, 1170]],
    3: [],
    4: [[570, 810], [960, 1170]],
    5: [[570, 810], [960, 1170]],
    6: [[540, 870]],
  };
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const todayRow = document.querySelector(`#hoursList li[data-day="${day}"]`);
  if (todayRow) todayRow.classList.add('is-today');
  const status = document.getElementById('openStatus');
  const open = SCHEDULE[day].some(([a, b]) => mins >= a && mins < b);
  status.textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
  status.classList.toggle('is-open', open);

  /* ---------- Formulario de cita → WhatsApp ---------- */
  const form = document.getElementById('bookingForm');
  const error = document.getElementById('formError');
  const dateInput = form.elements.dia;
  dateInput.min = now.toISOString().slice(0, 10);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { nombre, servicio, dia, franja } = form.elements;
    if (!nombre.value.trim() || !servicio.value) {
      error.textContent = 'Indica tu nombre y el servicio, por favor.';
      (nombre.value.trim() ? servicio : nombre).focus();
      return;
    }
    if (dia.value && new Date(`${dia.value}T12:00`).getDay() === 3) {
      error.textContent = 'Los miércoles estamos cerradas. Elige otro día 💗';
      dia.focus();
      return;
    }
    error.textContent = '';
    const fecha = dia.value
      ? new Date(`${dia.value}T12:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      : 'cuando haya hueco';
    const msg = `¡Hola! Soy ${nombre.value.trim()}. Me gustaría pedir cita para: ${servicio.value}. Día preferido: ${fecha} (${franja.value.toLowerCase()}).`;
    if (!WHATSAPP) {
      error.textContent = 'Versión de demostración: aquí se abriría WhatsApp con tu mensaje para el salón.';
      return;
    }
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
})();
