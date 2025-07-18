document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById('loader');
  const shoeList = document.getElementById('shoe-list');

  try {
    const res = await fetch('/api/model');
    const resJson = await res.json();
    const models = resJson.data;

    loader.style.display = 'none';

    models.forEach(model => {
      const card = document.createElement('a');
      card.classList.add('card');
      card.href = `/modelo/${model.id}`;

      const mainImage = model.files?.find(f => f.thumb !== null)?.thumb;

      card.innerHTML = `
        <img src="${mainImage}" alt="${model.name}">
        <div class="card-body">
          <div class="brand">${model.brand?.name || 'Sin marca'}</div>
          <div class="model">${model.name}</div>
          <div class="color">${model.color}</div>
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