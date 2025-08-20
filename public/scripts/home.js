// === Slider autoplay infinito (sin swipe), con dots indicadores ===
function initInfiniteSlider({ sliderId, dotsId, desktop = false }) {
  const slider = document.getElementById(sliderId);
  const dotsEl = document.getElementById(dotsId);
  if (!slider || !dotsEl) return { start(){}, stop(){} };

  // --- 1) Clonar extremos para bucle infinito ---
  const originals = Array.from(slider.children);
  const N = originals.length;
  if (N <= 1) { dotsEl.style.display = 'none'; return { start(){}, stop(){} }; }

  const cloneFirst = originals[0].cloneNode(true);
  const cloneLast  = originals[N - 1].cloneNode(true);
  slider.insertBefore(cloneLast, originals[0]);      // [CLAST][0][1]...[N-1]
  slider.appendChild(cloneFirst);                    // [CLAST][0]...[N-1][CFIRST]

  // Helpers de medición/índices
  const getW = () => slider.clientWidth || 1;
  const getSnapIndex = () => Math.round(slider.scrollLeft / getW()); // 0..N+1
  const normReal = (i) => (i + N) % N;                                // normaliza 0..N-1
  const getRealIndex = () => normReal(getSnapIndex() - 1);            // corrige por clon inicial

  // Posicionar al primer real (índice 1 por el clon previo)
  const jumpToSnap = (snapIdx) => slider.scrollTo({ left: snapIdx * getW(), behavior: 'auto' });
  const smoothToSnap = (snapIdx) => slider.scrollTo({ left: snapIdx * getW(), behavior: 'smooth' });
  jumpToSnap(1);

  // --- 2) Dots (indicadores) ---
  dotsEl.innerHTML = '';
  for (let i = 0; i < N; i++) {
    const d = document.createElement('span');
    d.dataset.index = String(i);
    if (i === 0) d.classList.add('active');
    dotsEl.appendChild(d); // indicadores NO clickeables
  }
  let current = 0;
  const setDot = (i) => {
    if (i === current) return;
    dotsEl.querySelectorAll('span').forEach(s => s.classList.remove('active'));
    dotsEl.querySelector(`span[data-index="${i}"]`)?.classList.add('active');
    current = i;
  };

  // Actualizar dots en “tiempo real”
  let scrollTO;
  slider.addEventListener('scroll', () => {
    clearTimeout(scrollTO);
    scrollTO = setTimeout(() => setDot(getRealIndex()), 20);
  }, { passive: true });

  // --- 3) Autoplay infinito SIEMPRE ---
  const mqlDesktop = window.matchMedia('(min-width: 1024px)');
  const getDelay = () => (mqlDesktop.matches ? 4000 : 5000);

  let timer = null;
  const step = () => {
    const snap = getSnapIndex();        // 0..N+1 (con clones)
    const real = snap - 1;              // -1..N (real, puede caer en clones)
    // próximo “real” hacia adelante
    if (real === N - 1) {
      // estamos en el último real (snap = N), movemos al clon final (snap N+1) con smooth
      smoothToSnap(N + 1);
      // cuando termine el scroll suave, saltamos (sin animación) al primer real (snap=1)
      setTimeout(() => jumpToSnap(1), 360); // ~duración del smooth
    } else {
      // avanzar un snap hacia adelante con smooth
      smoothToSnap(snap + 1);
    }
  };

  const start = () => {
    stop();
    timer = setInterval(step, getDelay());
  };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  const restart = () => { stop(); start(); };

  // Pausa si no está visible (ahorra batería; autoplay sigue “siempre” cuando visible)
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.target === slider) (e.isIntersecting ? start() : stop()); });
  }, { threshold: 0.2 });
  io.observe(slider);

  // Recalcular posición en resize (mantiene el slide actual)
  let rTO;
  window.addEventListener('resize', () => {
    clearTimeout(rTO);
    rTO = setTimeout(() => jumpToSnap(getRealIndex() + 1), 120);
  });

  // Si es slider de desktop, solo corre en ≥1024px
  if (desktop && !mqlDesktop.matches) { stop(); }
  else { start(); }

  // Si cambia breakpoint, ajustar delay
  mqlDesktop.addEventListener?.('change', restart);

  // Bloquear cualquier intento de interacción del usuario (opcional)
  const block = (e) => e.preventDefault();
  slider.addEventListener('wheel', block, { passive: false });
  slider.addEventListener('keydown', block);
  slider.addEventListener('pointerdown', block);

  return { start, stop };
}

const loadLatestModels = async () => {
   try {
    const res = await fetch('/api/model/latest');
    const resJson = await res.json();
    const models = resJson.data;
    const shoeList = document.getElementById('shoe-list');

    models.forEach(modelData => {
      const card = document.createElement('a');
      card.classList.add('card');
      card.href = `/modelo/${modelData.id}`;

      const mainImage = modelData.files?.find(f => f.thumb !== null)?.thumb;
      console.log(modelData.files)

      card.innerHTML = `
        <img src="${mainImage}" alt="${modelData.name}">
        <div class="card-body">
          <div class="brand">${modelData.brand?.name || 'Sin marca'}</div>
          <div class="model">${modelData.name}</div>
          <div class="color">${modelData.color}</div>
        </div>
      `;

      shoeList.appendChild(card);
    });
  } catch (err) {
    console.log(err);
    shoeList.innerHTML = `<p>Error al cargar los modelos.</p>`;
  }
}

// INIT: mobile + desktop (corre el visible; el otro queda pausado por IO/breakpoint)
window.addEventListener('DOMContentLoaded', async () => {
  initInfiniteSlider({ sliderId: 'heroSlidesMobile',  dotsId: 'heroDotsMobile',  desktop: false });
  initInfiniteSlider({ sliderId: 'heroSlidesDesktop', dotsId: 'heroDotsDesktop', desktop: true  });
  await loadLatestModels();
});