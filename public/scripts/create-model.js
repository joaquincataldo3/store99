document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('images');
  const previewContainer = document.getElementById('preview-container');
  const mainFileInput = document.getElementById('main_file_input');
  const form = document.getElementById('model-form');

  const brandSelect = document.getElementById('brand');
  const brandSpinner = document.getElementById('brand-spinner');

  const checkEncargue = document.getElementById('check_encargue');
  const checkStock = document.getElementById('check_stock');
  const sizesGroup = document.getElementById('sizes-group');
  const sizesContainer = document.getElementById('sizes-container');
  let sizesLoaded = false;

  const submitButton = document.getElementById('submit-button');
  const submitSpinner = document.getElementById('submit-spinner');
  let isSubmitting = false;

  const errorMessagesByStatus = {
    400: 'Revisá los datos del formulario: hay un campo inválido.',
    409: 'Ya existe un modelo con ese nombre y color.',
  };

  async function loadSizes() {
    if (sizesLoaded) return;
    sizesLoaded = true;
    try {
      const res = await fetch('/api/size');
      const { data } = await res.json();
      sizesContainer.innerHTML = '';
      data.forEach(size => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'sizeIds';
        checkbox.value = size.id;
        const span = document.createElement('span');
        span.textContent = size.arg_size;
        label.appendChild(checkbox);
        label.appendChild(span);
        sizesContainer.appendChild(label);
      });
    } catch (err) {
      sizesContainer.innerHTML = '<p class="loading-msg">Error al cargar talles.</p>';
    }
  }

  checkStock.addEventListener('change', () => {
    if (checkStock.checked) {
      sizesGroup.style.display = 'block';
      loadSizes();
    } else {
      sizesGroup.style.display = 'none';
    }
  });

  // Cargar brands
  async function loadBrands() {
    brandSpinner.style.display = 'block';
    try {
      const res = await fetch('/api/brand');
      const resJson = await res.json();
      const {data } = resJson;
      brandSelect.innerHTML = '<option value="">Seleccioná una marca</option>';
      data.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = brand.name;
        brandSelect.appendChild(option);
      });
      brandSelect.disabled = false;
    } catch (err) {
      brandSelect.innerHTML = '<option>Error al cargar marcas</option>';
      console.error('Error cargando marcas:', err);
    } finally {
      brandSpinner.style.display = 'none';
    }
  }

  loadBrands();

  // Mostrar previews
  input.addEventListener('change', () => {
    previewContainer.innerHTML = '';
    mainFileInput.value = '';
    [...input.files].forEach((file, index) => {
      const ext = file.name.split('.').pop().toLowerCase();
      const reader = new FileReader();
      reader.onload = (e) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('preview-image-wrapper');

        const img = document.createElement('img');
        img.src = e.target.result;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'main_file_choice';
        radio.value = index;

        radio.addEventListener('change', () => {
          mainFileInput.value = index;
          document.querySelectorAll('.preview-image-wrapper').forEach(w => w.classList.remove('selected'));
          wrapper.classList.add('selected');
        });

        wrapper.appendChild(radio);
        wrapper.appendChild(img);
        previewContainer.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });
  });

  // Validación y envío
  form.addEventListener('submit', async (e) => {
   e.preventDefault();

  if (isSubmitting) return;

  // Limpiar errores visuales
  document.querySelectorAll('input, select').forEach(el => el.classList.remove('error'));

  const brand_id = brandSelect.value.trim();
  const name = document.getElementById('name').value.trim();
  const color = document.getElementById('color').value.trim();
  const files = input.files;
  const mainFileIndex = parseInt(mainFileInput.value);

  let hasErrors = false;

  // Validaciones
  if (!brand_id) {
    brandSelect.classList.add('error');
    hasErrors = true;
  }
  if (!name) {
    document.getElementById('name').classList.add('error');
    hasErrors = true;
  }
  if (!color) {
    document.getElementById('color').classList.add('error');
    hasErrors = true;
  }

  const selectedCategories = [...document.querySelectorAll('input[name="categories"]:checked')];

  if (checkEncargue.checked && selectedCategories.length === 0) {
    alert('Debés seleccionar al menos una categoría para modelos por encargue.');
    hasErrors = true;
  }

  if (!checkEncargue.checked && !checkStock.checked) {
    alert('Debés seleccionar al menos una disponibilidad (por encargue o en stock).');
    hasErrors = true;
  }

  if (checkStock.checked) {
    const selectedSizes = [...sizesContainer.querySelectorAll('input[name="sizeIds"]:checked')];
    if (selectedSizes.length === 0) {
      alert('Debés seleccionar al menos un talle para el stock.');
      hasErrors = true;
    }
  }

  if (files.length === 0) {
    alert('Debés subir al menos una imagen.');
    hasErrors = true;
  } else {
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext)) {
        alert(`Extensión no válida para ${file.name}`);
        hasErrors = true;
        break;
      }
    }
  }

  if (isNaN(mainFileIndex)) {
    alert('Debés seleccionar una imagen principal.');
    hasErrors = true;
  }

  if (hasErrors) return;

  // El backend arma el nombre del archivo a partir de name/color/índice,
  // acá solo hace falta indicar cuál es la imagen principal.
  const uploadedFiles = [...files].map((file, index) => ({
    main_file: index === mainFileIndex
  }));

  // Crear FormData
  const formData = new FormData();
  formData.append('brandId', brand_id);
  formData.append('name', name);
  formData.append('color', color);
  formData.append('filesMetadata', JSON.stringify(uploadedFiles));
  formData.append('available_for_order', checkEncargue.checked ? '1' : '0');
  selectedCategories.forEach(cb => {
    formData.append('categories[]', cb.value);
  });
  if (checkStock.checked) {
    const selectedSizes = [...sizesContainer.querySelectorAll('input[name="sizeIds"]:checked')];
    selectedSizes.forEach(cb => formData.append('sizeIds[]', cb.value));
  }

  // Agregar archivos al FormData
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }
  
  isSubmitting = true;
  submitButton.disabled = true;
  submitSpinner.style.display = 'block';

  try {
    const res = await fetch('/api/model', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();

    if (!res.ok) {
      const friendlyMsg = errorMessagesByStatus[res.status] || result.msg || 'Ocurrió un error al crear el modelo. Probá de nuevo.';
      alert(friendlyMsg);
      return;
    }

    alert('Modelo creado con éxito.');
    window.location.reload();
    return;
  } catch (err) {
    console.error(err);
    alert('No se pudo conectar con el servidor. Revisá tu conexión y probá de nuevo.');
  } finally {
    isSubmitting = false;
    submitButton.disabled = false;
    submitSpinner.style.display = 'none';
  }

  });

  const categoriesContainer = document.getElementById('categories-container');

    // Cargar categorías desde la API
    async function loadCategories() {
      try {
        const res = await fetch('/api/category');
        const { data } = await res.json();
        categoriesContainer.innerHTML = '';

        data.forEach(category => {
          const label = document.createElement('label');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = 'categories';
          checkbox.value = category.id;
          label.appendChild(checkbox);
          label.appendChild(document.createTextNode(category.name));
          categoriesContainer.appendChild(label);
        });

      } catch (err) {
        categoriesContainer.innerHTML = '<p class="error-msg">Error al cargar categorías.</p>';
        console.error('Error cargando categorías:', err);
      }
    }

  loadCategories();
});