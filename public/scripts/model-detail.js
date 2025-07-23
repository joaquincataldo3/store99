document.addEventListener('DOMContentLoaded', () => {
  const thumbnails = document.querySelectorAll('.carousel-item img');
  const mainImage = document.getElementById('mainImage');
  const dotsContainer = document.getElementById('dots');

  let currentIndex = 0;

  thumbnails.forEach((thumb, idx) => {
    thumb.addEventListener('click', () => {
      // Cambiar imagen principal
      mainImage.src = thumb.src;

      // Actualizar clases activas
      thumbnails.forEach(t => t.parentElement.classList.remove('active'));
      thumb.parentElement.classList.add('active');

      // Actualizar dots si estás en mobile
      dotsContainer.querySelectorAll('span').forEach(dot => dot.classList.remove('active'));
      dotsContainer.querySelector(`span[data-index="${idx}"]`)?.classList.add('active');
    });

    // Crear dot solo en mobile
    const dot = document.createElement('span');
    dot.dataset.index = idx;
    if (idx === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);

    dot.addEventListener('click', () => {
      thumbnails[idx].click();
    });
  });
});