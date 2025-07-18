document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('carousel');
  const dotsContainer = document.getElementById('dots');
  const items = document.querySelectorAll('.carousel-item');

  let currentIndex = 0;

  items.forEach((_, idx) => {
    const dot = document.createElement('span');
    dot.dataset.index = idx;
    if (idx === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);

    dot.addEventListener('click', () => {
      carousel.scrollTo({ left: carousel.offsetWidth * idx, behavior: 'smooth' });
    });
  });

  carousel.addEventListener('scroll', () => {
    const newIndex = Math.round(carousel.scrollLeft / carousel.offsetWidth);
    if (newIndex !== currentIndex) {
      dotsContainer.children[currentIndex]?.classList.remove('active');
      dotsContainer.children[newIndex]?.classList.add('active');
      currentIndex = newIndex;
    }
  });
});