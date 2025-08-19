document.addEventListener('DOMContentLoaded', () => {
  const isDesktop = () => window.innerWidth >= 900;

  // ====== SELECTORES COMUNES ======
  const dotsContainer = document.getElementById('dots');

  // ====== DESKTOP ELEMENTOS (tu layout actual) ======
  const mainImage = document.getElementById('mainImage');
  const thumbImgs = Array.from(document.querySelectorAll('.carousel-item img'));

  // ====== MOBILE ELEMENTOS (nuevo carrusel) ======
  const mobileSlider = document.getElementById('mobileSlider');
  const mobileSlides = mobileSlider ? Array.from(mobileSlider.querySelectorAll('.mobile-slide')) : [];

  // Si no hay imágenes, salir
  const totalImages = thumbImgs.length || mobileSlides.length;
  if (!totalImages) return;

  // ============================================================
  // DUAL STATE
  // ============================================================
  let currentIndex = 0;
  let isAnimating = false;

  // ---------- utils comunes ----------
  const buildDots = (count) => {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.dataset.index = String(i);
      if (i === 0) dot.classList.add('active');
      dotsContainer.appendChild(dot);
    }
  };
  const setActiveDot = (idx) => {
    dotsContainer.querySelectorAll('span').forEach(d => d.classList.remove('active'));
    dotsContainer.querySelector(`span[data-index="${idx}"]`)?.classList.add('active');
  };

  // ============================================================
  // MOBILE: drag to slide + scroll-snap
  // ============================================================
  const setupMobile = () => {
    if (!mobileSlider || !mobileSlides.length) return;

    buildDots(mobileSlides.length);

    // Dot click -> scroll al slide
    dotsContainer.querySelectorAll('span').forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = Number(dot.dataset.index);
        mobileSlides[idx].scrollIntoView({ behavior: 'smooth', inline: 'center' });
      });
    });

    // Drag (pointer events) para “feel” CodePen
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    mobileSlider.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.clientX;
      startScroll = mobileSlider.scrollLeft;
      mobileSlider.setPointerCapture(e.pointerId);
    });
    mobileSlider.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      mobileSlider.scrollLeft = startScroll - dx;
    });
    const endDrag = (e) => {
      if (!isDown) return;
      isDown = false;
      try { mobileSlider.releasePointerCapture(e.pointerId); } catch (_) {}
      // Snap al slide más cercano
      const slideWidth = mobileSlider.clientWidth;
      const idx = Math.round(mobileSlider.scrollLeft / slideWidth);
      currentIndex = Math.max(0, Math.min(idx, mobileSlides.length - 1));
      mobileSlides[currentIndex].scrollIntoView({ behavior: 'smooth', inline: 'center' });
      setActiveDot(currentIndex);
    };
    mobileSlider.addEventListener('pointerup', endDrag);
    mobileSlider.addEventListener('pointercancel', endDrag);
    mobileSlider.addEventListener('pointerleave', endDrag);

    // Al hacer scroll manual (inercial) actualizamos dot al “más cercano”
    let scrollTO;
    mobileSlider.addEventListener('scroll', () => {
      clearTimeout(scrollTO);
      scrollTO = setTimeout(() => {
        const slideWidth = mobileSlider.clientWidth;
        const idx = Math.round(mobileSlider.scrollLeft / slideWidth);
        currentIndex = Math.max(0, Math.min(idx, mobileSlides.length - 1));
        setActiveDot(currentIndex);
      }, 20);
    }, { passive: true });
  };

  // ============================================================
  // DESKTOP: conservamos tu implementación (thumbs + transiciones)
  // ============================================================
  const setupDesktop = () => {
    if (!mainImage || !thumbImgs.length) return;

    const images = thumbImgs.map(i => i.src);

    const setActiveThumb = (idx) => {
      document.querySelectorAll('.carousel-item').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.carousel-item')[idx]?.classList.add('active');
    };

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const transitionTo = (nextIdx, dir /* 'left' | 'right' */) => {
      if (isAnimating || nextIdx === currentIndex) return;
      isAnimating = true;

      if (prefersReduced) {
        currentIndex = (nextIdx + images.length) % images.length;
        mainImage.src = images[currentIndex];
        setActiveThumb(currentIndex);
        setActiveDot(currentIndex);
        isAnimating = false;
        return;
      }

      mainImage.classList.remove('prepare-in-left','prepare-in-right','animate-out-left','animate-out-right');
      void mainImage.offsetWidth;
      mainImage.classList.add(dir === 'left' ? 'animate-out-left' : 'animate-out-right');

      let watchdog = setTimeout(() => {
        mainImage.classList.remove('animate-out-left','animate-out-right','prepare-in-left','prepare-in-right');
        currentIndex = (nextIdx + images.length) % images.length;
        mainImage.src = images[currentIndex];
        setActiveThumb(currentIndex);
        setActiveDot(currentIndex);
        isAnimating = false;
      }, 240);

      const onOutEnd = () => {
        clearTimeout(watchdog);
        mainImage.removeEventListener('transitionend', onOutEnd);

        currentIndex = (nextIdx + images.length) % images.length;
        mainImage.src = images[currentIndex];
        setActiveThumb(currentIndex);
        setActiveDot(currentIndex);

        const prepareClass = dir === 'left' ? 'prepare-in-right' : 'prepare-in-left';
        mainImage.classList.remove('animate-out-left','animate-out-right');
        mainImage.classList.add(prepareClass);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const onInEnd = () => {
              mainImage.removeEventListener('transitionend', onInEnd);
              mainImage.classList.remove('prepare-in-left','prepare-in-right');
              isAnimating = false;
            };
            let wd2 = setTimeout(() => {
              mainImage.classList.remove('prepare-in-left','prepare-in-right');
              isAnimating = false;
            }, 240);

            mainImage.addEventListener('transitionend', () => {
              clearTimeout(wd2);
              onInEnd();
            }, { once: true });

            mainImage.classList.remove('prepare-in-left','prepare-in-right');
          });
        });
      };

      mainImage.addEventListener('transitionend', onOutEnd, { once: true });
    };

    const goTo = (idx) => {
      if (idx === currentIndex) return;
      const dir = (idx > currentIndex || (currentIndex === images.length - 1 && idx === 0)) ? 'left' : 'right';
      transitionTo(idx, dir);
    };
    const next = () => transitionTo(currentIndex + 1, 'left');

    // Inicializar
    buildDots(images.length);
    setActiveDot(0);
    setActiveThumb(0);
    mainImage.src = images[0];

    // Click en thumbnails
    thumbImgs.forEach((thumb, idx) => thumb.addEventListener('click', () => goTo(idx)));

    // Dots -> ir a índice
    dotsContainer.querySelectorAll('span').forEach(dot => {
      dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
    });

    // Click en imagen (desktop): next
    mainImage.addEventListener('click', () => next());
  };

  // ============================================================
  // BOOTSTRAP SEGÚN BREAKPOINT
  // ============================================================
  if (isDesktop()) {
    setupDesktop();
  } else {
    setupMobile();
  }

  // Si el usuario rota/dispara resize, reconfigurar (simple: recargar)
  window.addEventListener('resize', (() => {
    let t; 
    return () => {
      clearTimeout(t);
      t = setTimeout(() => location.reload(), 200);
    };
  })());

  // ====== Tu modal de eliminar (conservo lo tuyo) ======
  const deleteBtn = document.querySelector('.delete-btn');
  const modal = document.getElementById('deleteModal');
  const confirmBtn = document.getElementById('confirmDelete');
  const cancelBtn = document.getElementById('cancelDelete');

  deleteBtn?.addEventListener('click', () => { modal.style.display = 'flex'; });
  cancelBtn?.addEventListener('click', () => { modal.style.display = 'none'; });

  confirmBtn?.addEventListener('click', async () => {
    try {
      const response = await fetch('/ruta-para-eliminar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: '<%= model.id %>' })
      });
      if (response.ok) {
        alert('Eliminado correctamente');
        window.location.href = '/lista-de-modelos';
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      modal.style.display = 'none';
    }
  });
});