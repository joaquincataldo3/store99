document.addEventListener('DOMContentLoaded', () => {
 const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('closeBtn');

  burger.addEventListener('click', () => {
    mobileMenu.classList.add('active');
  });

  closeBtn.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
  });

  
  const submenuToggle = document.querySelector('.has-submenu-mobile');

  if (submenuToggle) {
    submenuToggle.addEventListener('click', () => {
      submenuToggle.classList.toggle('active');
    });
  }

  const submenu = document.querySelector('.has-submenu');
    const arrow = submenu.querySelector('.bx-caret-right');

    arrow.addEventListener('click', (e) => {
      e.preventDefault(); // evita redirección si es un <a>
      submenu.classList.toggle('open');
    });

  });