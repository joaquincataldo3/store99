document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('images');
  const previewContainer = document.getElementById('preview-container');
  const mainFileInput = document.getElementById('main_file_input');
  const form = document.getElementById('model-form');

  const brandSelect = document.getElementById('brand');
  const brandSpinner = document.getElementById('brand-spinner');

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

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

  if (files.length === 0) {
    alert('Debés subir al menos una imagen.');
    hasErrors = true;
  } else {
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
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

  // Construcción del array con nombres y main_file
  const uploadedFiles = [...files].map((file, index) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return {
      filename: `model/${Date.now()}-${baseName}.${ext}`,
      main_file: index === mainFileIndex
    };
  });

  // Crear FormData
  const formData = new FormData();
  formData.append('brandId', brand_id);
  formData.append('name', name);
  formData.append('color', color);
  formData.append('filesMetadata', JSON.stringify(uploadedFiles));

  // Agregar archivos al FormData
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }
  
  try {
    const res = await fetch('/api/model', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.msg || 'Error al crear el modelo');

    alert('Modelo creado con éxito.');
    window.location.reload();
  } catch (err) {
    console.error(err);
    alert('Ocurrió un error al enviar el formulario.');
  }
    
  });
});