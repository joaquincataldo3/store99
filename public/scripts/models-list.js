document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');

    if (categoryId !== '1' && categoryId !== '2') {
      window.location.href = '/not-found';
    }

  const loader = document.getElementById('loader');
  const shoeList = document.getElementById('shoe-list');

  try {
    const res = await fetch(`/api/model/category?categoryId=${categoryId}`);
    const resJson = await res.json();
    const models = resJson.data;

    loader.style.display = 'none';

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
    loader.style.display = 'none';
    shoeList.innerHTML = `<p>Error al cargar los modelos.</p>`;
  }
});