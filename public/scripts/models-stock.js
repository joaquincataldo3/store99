document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('loader');
  const shoeList = document.getElementById('shoe-list');
  const toggleFilter = document.querySelector('.filter-toggle');
  const modal = document.getElementById('filterModal');
  const closeModal = document.querySelector('.close-modal');
  const sizeFiltersContainer = document.getElementById('size-filters');
  let selectedSizes = new Set();       
  let tempSelectedSizes = new Set();    
  let stockItems;

  // Abrir modal
  toggleFilter.addEventListener('click', () => {
    modal.style.display = 'block';

    toggleFilter.addEventListener('click', () => {
    tempSelectedSizes = new Set(selectedSizes);

    // Actualizar visualmente los botones
    document.querySelectorAll('.size-filters button').forEach(btn => {
      const size = btn.dataset.size;
      if (tempSelectedSizes.has(size)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    modal.style.display = 'block';
  });

  });

  // Cerrar modal
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Cerrar si se hace clic fuera del modal
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  try {
    const res = await fetch('/api/stock');
    const resJson = await res.json();
    stockItems = resJson.data;

    loader.style.display = 'none';

    renderShoes();

    const allSizes = new Set(
      stockItems.map(i =>
        i.size.arg_size.endsWith('.0') ? parseInt(i.size.us_size) : i.size.us_size
      )
    );

    allSizes.forEach(size => {
      const btn = document.createElement('button');
      btn.textContent = `${size} US`;
      btn.dataset.size = size;

      btn.addEventListener('click', () => {
        if (tempSelectedSizes.has(size)) {
          tempSelectedSizes.delete(size);
          btn.classList.remove('active');
        } else {
          tempSelectedSizes.add(size);
          btn.classList.add('active');
        }
      });

      sizeFiltersContainer.appendChild(btn);
    });

  } catch (err) {
    console.error(err);
    loader.style.display = 'none';
    shoeList.innerHTML = `<p>Error al cargar los modelos.</p>`;
  }

  // Reutilizable: renderiza zapatillas (filtradas o no)
  function renderShoes() {
    shoeList.innerHTML = '';

    const filteredItems = selectedSizes.size > 0
      ? stockItems.filter(item => {
          const sizeFormatted = item.size.arg_size.endsWith('.0')
            ? parseInt(item.size.us_size)
            : item.size.us_size;
          return selectedSizes.has(sizeFormatted);
        })
      : stockItems;


    const groupedModels = {};

    filteredItems.forEach(item => {
      const modelId = item.model.id;

      if (!groupedModels[modelId]) {
        groupedModels[modelId] = {
          model: item.model,
          sizes: []
        };
      }

      groupedModels[modelId].sizes.push(item.size);
    });

    Object.values(groupedModels).forEach(({ model, sizes }) => {
      const card = document.createElement('a');
      card.classList.add('card');
      card.href = `/modelo/${model.id}`;

      const mainImage = model.files?.find(f => f.thumb !== null)?.thumb;

      const sizesHtml = sizes.map(s => {
        const sizeFormatted = s.arg_size.endsWith('.0')
          ? parseInt(s.us_size)
          : s.us_size;
        return `<span class="size-tag">${sizeFormatted} US</span>`;
      }).join('');

      card.innerHTML = `
        <img src="${mainImage}" alt="${model.name}">
        <div class="card-body">
          <div class="brand">${model.brand?.name || 'Sin marca'}</div>
          <div class="model">${model.name}</div>
          <div class="color">${model.color}</div>
        </div>
        <div class="size-tags">
          ${sizesHtml}
        </div>
      `;

      shoeList.appendChild(card);
    });
  }


  document.getElementById('applyFilter').addEventListener('click', () => {
  selectedSizes = new Set(tempSelectedSizes);
  modal.style.display = 'none';
  renderShoes();
});

document.getElementById('cancelFilter').addEventListener('click', () => {
  modal.style.display = 'none';
});
});