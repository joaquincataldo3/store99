document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('loader');
  const shoeList = document.getElementById('shoe-list');

  try {
    const res = await fetch('/api/stock');
    const resJson = await res.json();
    const stockItems = resJson.data;

    loader.style.display = 'none';


    const groupedModels = {};

    stockItems.forEach(item => {
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

  } catch (err) {
    console.error(err);
    loader.style.display = 'none';
    shoeList.innerHTML = `<p>Error al cargar los modelos.</p>`;
  }
});