document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId');

    if (categoryId !== '1' && categoryId !== '2') {
        window.location.href = '/not-found';
    }

    const categoryLabel = categoryId === '1' ? 'Adulto' : 'Niño';
    const titleEl = document.querySelector('.title');
    if (titleEl) titleEl.textContent = `Zapatillas por encargue · ${categoryLabel}`;

    const loader = document.getElementById('loader');
    const shoeList = document.getElementById('shoe-list');
    const brandFilters = document.getElementById('brand-filters');

    let allModels = [];
    let activeFilter = 'all';

    function renderCards(models) {
        shoeList.innerHTML = '';

        const filtered = activeFilter === 'all'
            ? models
            : models.filter(m => String(m.brand?.id) === String(activeFilter));

        if (filtered.length === 0) {
            shoeList.innerHTML = '<p class="no-results">No hay modelos para esta marca.</p>';
            return;
        }

        filtered.forEach(modelData => {
            const card = document.createElement('a');
            card.classList.add('card');
            card.href = `/modelo/${modelData.id}`;

            const mainImage = modelData.files?.find(f => f.thumb !== null)?.thumb;

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
    }

    function renderFilters(models) {
        brandFilters.innerHTML = '';

        // Extraer marcas únicas de los modelos cargados
        const brandMap = new Map();
        models.forEach(m => {
            if (m.brand) brandMap.set(m.brand.id, m.brand.name);
        });

        // No mostrar filtros si hay solo 1 marca o ninguna
        if (brandMap.size <= 1) return;

        // ── Filter bar (toggle button + desktop dropdown) ──
        const filterBar = document.createElement('div');
        filterBar.classList.add('filter-bar');
        filterBar.innerHTML = `
            <button class="filter-toggle" id="filterToggle" aria-expanded="false">
                <i class='bx bx-filter-alt'></i>
                <span class="filter-toggle-label">Todas las marcas</span>
                <i class='bx bx-chevron-down toggle-arrow'></i>
            </button>
            <div class="filter-dropdown" id="filterDropdown"></div>
        `;
        brandFilters.appendChild(filterBar);

        const toggleBtn = document.getElementById('filterToggle');
        const dropdown = document.getElementById('filterDropdown');
        const overlay = document.getElementById('filterOverlay');
        const popupPills = document.getElementById('filterPopupPills');
        const popupClose = document.getElementById('filterPopupClose');

        function updateToggleLabel(name) {
            toggleBtn.querySelector('.filter-toggle-label').textContent = name;
        }

        function syncActive(brandId) {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.brandId === String(brandId));
            });
        }

        function closeAll() {
            dropdown.classList.remove('open');
            overlay.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }

        function buildButtons(container) {
            // Botón "Todas"
            const allBtn = document.createElement('button');
            allBtn.classList.add('filter-btn', 'active');
            allBtn.dataset.brandId = 'all';
            allBtn.textContent = 'Todas';
            allBtn.addEventListener('click', () => {
                activeFilter = 'all';
                syncActive('all');
                updateToggleLabel('Todas las marcas');
                renderCards(allModels);
                closeAll();
            });
            container.appendChild(allBtn);

            // Botón por cada marca
            brandMap.forEach((name, id) => {
                const btn = document.createElement('button');
                btn.classList.add('filter-btn');
                btn.dataset.brandId = String(id);
                btn.textContent = name;
                btn.addEventListener('click', () => {
                    activeFilter = id;
                    syncActive(String(id));
                    updateToggleLabel(name);
                    renderCards(allModels);
                    closeAll();
                });
                container.appendChild(btn);
            });
        }

        // Poblar ambos contenedores
        buildButtons(dropdown);
        buildButtons(popupPills);

        // ── Toggle: popup en mobile/tablet, dropdown en desktop ──
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMobileOrTablet = window.matchMedia('(max-width: 1023px)').matches;
            if (isMobileOrTablet) {
                const willOpen = !overlay.classList.contains('open');
                overlay.classList.toggle('open');
                toggleBtn.setAttribute('aria-expanded', String(willOpen));
            } else {
                const willOpen = !dropdown.classList.contains('open');
                dropdown.classList.toggle('open');
                toggleBtn.setAttribute('aria-expanded', String(willOpen));
            }
        });

        // Cerrar dropdown al hacer click afuera
        document.addEventListener('click', (e) => {
            if (!filterBar.contains(e.target)) {
                dropdown.classList.remove('open');
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Cerrar popup
        popupClose.addEventListener('click', closeAll);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeAll();
        });
    }

    try {
        const res = await fetch(`/api/model/category?categoryId=${categoryId}`);
        const resJson = await res.json();
        allModels = resJson.data;

        loader.style.display = 'none';

        renderFilters(allModels);
        renderCards(allModels);
    } catch (err) {
        console.log(err);
        loader.style.display = 'none';
        shoeList.innerHTML = `<p>Error al cargar los modelos.</p>`;
    }
});
