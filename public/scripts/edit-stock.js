const params = new URLSearchParams(window.location.search);
const modelId = params.get("modelId");

const modelNameEl = document.getElementById("model-name");
const modelImageContainer = document.getElementById("model-image-container");
const sizesGrid = document.getElementById("sizes-grid");
const form = document.getElementById("stock-form");

let allSizes = [];
let currentModel = null;

const fetchData = async () => {
  try {
    const [stocksRes, modelRes] = await Promise.all([
      fetch("/api/size"),
      fetch(`/api/model/${modelId}`)
    ]);
    
    const [stocksData, modelData] = await Promise.all([
      stocksRes.json(),
      modelRes.json()
    ]);
 

    if (!stocksData.ok || !modelData.ok) throw new Error("Fetch error");

    allSizes = stocksData.data;
    currentModel = modelData.data;
    console.log(allSizes)

    renderModelInfo();
    renderSizes();
  } catch (err) {
    console.error("Error loading stock:", err);
  }
};

const renderModelInfo = () => {
  modelNameEl.textContent = currentModel.name;

  const mainImg = currentModel.files.find(file => file.thumb) || currentModel.files[0];
  if (mainImg?.thumb || mainImg?.key) {
    const img = document.createElement("img");
    img.src = mainImg.thumb || mainImg.key;
    img.alt = currentModel.name;
    modelImageContainer.appendChild(img);
  }
};

const renderSizes = () => {
  const currentSizeIds = currentModel.stocks.map(s => s.id);

  allSizes.forEach((size) => {
    if (!size) return;

    const isChecked = currentSizeIds.includes(size.id);

    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "sizes";
    input.value = size.id;
    input.checked = isChecked;

    const span = document.createElement("span");
    span.textContent = size.arg_size; // O puedes mostrar `${size.arg_size} (US ${size.us_size})`

    label.appendChild(input);
    label.appendChild(span);
    sizesGrid.appendChild(label);
  });
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const selectedSizes = [...form.querySelectorAll("input[name='sizes']:checked")].map(input => input.value);
  
  try {
    const res = await fetch(`/api/stock/${modelId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sizeIds: selectedSizes }),
    });

    const data = await res.json();
    if (data.ok) {
      alert("Stock actualizado correctamente.");
    } else {
      alert("Error al actualizar el stock.");
    }
  } catch (error) {
    console.error("Update error:", error);
    alert("Error al actualizar el stock.");
  }
});

fetchData();