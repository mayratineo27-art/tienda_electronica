import {
  getJSON,
  debounce,
  formatPrice,
  escapeHtml,
  sanitizeInput,
  STORAGE_KEYS,
  readFromStorage,
  writeToStorage,
  showAlert,
  clearAlert
} from "./utils.js";

// Bloque de referencias DOM: nodos del formulario y resultados.
const filtersForm = document.getElementById("filtersForm");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const statusElement = document.getElementById("catalog-status");
const resultsList = document.getElementById("results-list");
const paginationContainer = document.getElementById("pagination");

// Bloque de estado del catalogo: datos originales y vista paginada.
const state = {
  products: [],
  filteredProducts: [],
  currentPage: 1,
  pageSize: 6
};

// Bloque de fallback: dataset local para desarrollo si API falla.
const fallbackProducts = [
  { id: 1, name: "Router AX3000", description: "WiFi 6 de alto rendimiento", price: 520000, stock: 18, category: "Routers" },
  { id: 2, name: "Switch 24 Puertos", description: "Switch administrable capa 2", price: 840000, stock: 9, category: "Switches" },
  { id: 3, name: "Access Point Pro", description: "Roaming empresarial", price: 710000, stock: 13, category: "Access Points" },
  { id: 4, name: "Firewall UTM", description: "Seguridad perimetral para pyme", price: 1650000, stock: 5, category: "Firewalls" },
  { id: 5, name: "NAS 4 Bahias", description: "Almacenamiento en red", price: 2100000, stock: 7, category: "Servidores NAS" },
  { id: 6, name: "Cable Cat6 x 305m", description: "Cableado estructurado", price: 390000, stock: 30, category: "Cableado" },
  { id: 7, name: "Router WiFi 7", description: "Nueva generacion para baja latencia", price: 1250000, stock: 4, category: "Routers" }
];

// Bloque de utilidad: extrae categorias seleccionadas del formulario de filtros.
function getSelectedCategories(formData) {
  return formData.getAll("categoria").map((value) => value.toLowerCase());
}

// Bloque de filtrado: aplica categorias, rango de precios y texto de busqueda.
function applyFilters() {
  const formData = new FormData(filtersForm);
  const selectedCategories = getSelectedCategories(formData);
  const priceMin = Number(formData.get("precioMin") || 0);
  const priceMax = Number(formData.get("precioMax") || Number.MAX_SAFE_INTEGER);
  const searchText = String(formData.get("search") || "").trim().toLowerCase();
  const safeSearchText = sanitizeInput(searchText);

  state.filteredProducts = state.products.filter((product) => {
    const categoryValue = String(product.category || "").toLowerCase();
    const inCategory = selectedCategories.length === 0 || selectedCategories.some((category) => categoryValue.includes(category));
    const inPriceRange = Number(product.price) >= priceMin && Number(product.price) <= priceMax;
    const inSearch = safeSearchText.length === 0 || String(product.name).toLowerCase().includes(safeSearchText);
    return inCategory && inPriceRange && inSearch;
  });
}

// Bloque de ordenamiento: organiza resultados segun criterio elegido por usuario.
function applySorting() {
  const sortValue = sortSelect?.value || "newest";
  const productList = [...state.filteredProducts];

  switch (sortValue) {
    case "price-asc":
      productList.sort((a, b) => Number(a.price) - Number(b.price));
      break;
    case "price-desc":
      productList.sort((a, b) => Number(b.price) - Number(a.price));
      break;
    case "name-asc":
      productList.sort((a, b) => String(a.name).localeCompare(String(b.name), "es"));
      break;
    default:
      productList.sort((a, b) => Number(b.id) - Number(a.id));
      break;
  }

  state.filteredProducts = productList;
}

// Bloque de paginacion: separa elementos por pagina para mejor rendimiento y UX.
function getCurrentPageItems() {
  const startIndex = (state.currentPage - 1) * state.pageSize;
  const endIndex = startIndex + state.pageSize;
  return state.filteredProducts.slice(startIndex, endIndex);
}

// Bloque de render de tarjetas: pinta productos filtrados en el grid.
function renderProducts() {
  if (!resultsList) {
    return;
  }

  const pageItems = getCurrentPageItems();

  if (pageItems.length === 0) {
    resultsList.innerHTML = "<p>No hay productos con esos filtros.</p>";
    return;
  }

  resultsList.innerHTML = pageItems
    .map(
      (product) => `
      <article data-product-id="${product.id}">
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <p>Precio: ${formatPrice(product.price)}</p>
        <p>Stock: <span class="badge ${product.stock > 0 ? "badge-success" : "badge-danger"}">${product.stock > 0 ? "Disponible" : "Agotado"}</span></p>
        <div>
          <a href="./producto.html?id=${product.id}" aria-label="Ver detalle de ${escapeHtml(product.name)}">Ver detalle</a>
          <button type="button" data-action="add-to-cart">Agregar</button>
        </div>
      </article>
    `
    )
    .join("");
}

// Bloque de render de paginacion: crea botones para navegar entre paginas.
function renderPagination() {
  if (!paginationContainer) {
    return;
  }

  const totalPages = Math.max(1, Math.ceil(state.filteredProducts.length / state.pageSize));

  paginationContainer.innerHTML = Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    const isCurrent = pageNumber === state.currentPage;
    return `<button type="button" data-action="go-page" data-page="${pageNumber}" ${isCurrent ? "aria-current=\"page\"" : ""}>${pageNumber}</button>`;
  }).join("");
}

// Bloque de render global: sincroniza estado de productos, paginacion y mensajes.
function renderCatalog() {
  clearAlert(statusElement);
  renderProducts();
  renderPagination();
  showAlert(statusElement, `Resultados encontrados: ${state.filteredProducts.length}`, "success");
}

// Bloque de persistencia de carrito: agrega item desde catalogo en localStorage.
function addToCartFromCatalog(productId) {
  const product = state.products.find((item) => String(item.id) === String(productId));
  if (!product) {
    showAlert(statusElement, "No se pudo encontrar el producto seleccionado.", "error");
    return;
  }

  const cartItems = readFromStorage(STORAGE_KEYS.cart, []);
  const existingItem = cartItems.find((item) => String(item.id) === String(product.id));

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({ id: product.id, name: product.name, price: Number(product.price), quantity: 1 });
  }

  writeToStorage(STORAGE_KEYS.cart, cartItems);
  showAlert(statusElement, `${product.name} agregado al carrito.`, "success");
}

// Bloque de refresco de consulta: re-aplica filtros + orden + render para UI reactiva.
function recalculateAndRender() {
  state.currentPage = 1;
  applyFilters();
  applySorting();
  renderCatalog();
}

// Bloque de eventos del formulario: submit manual y busqueda en tiempo real con debounce.
function bindFilterEvents() {
  if (!filtersForm) {
    return;
  }

  filtersForm.addEventListener("submit", (event) => {
    event.preventDefault();
    recalculateAndRender();
  });

  const debouncedSearch = debounce(() => {
    recalculateAndRender();
  }, 250);

  searchInput?.addEventListener("input", debouncedSearch);

  sortSelect?.addEventListener("change", () => {
    applySorting();
    renderCatalog();
  });

  filtersForm.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.name === "categoria" || target.name === "precioMin" || target.name === "precioMax") {
      recalculateAndRender();
    }
  });
}

// Bloque de event delegation en resultados: maneja botones de carrito y paginacion.
function bindDelegatedEvents() {
  resultsList?.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    const cardElement = actionElement.closest("article[data-product-id]");
    if (!cardElement) {
      return;
    }

    if (actionElement.dataset.action === "add-to-cart") {
      addToCartFromCatalog(cardElement.dataset.productId);
    }
  });

  paginationContainer?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='go-page']");
    if (!button) {
      return;
    }

    const nextPage = Number(button.dataset.page);
    if (Number.isNaN(nextPage)) {
      return;
    }

    state.currentPage = nextPage;
    renderProducts();
    renderPagination();
  });
}

// Bloque de carga de datos: obtiene productos del backend y activa fallback si falla.
async function loadProducts() {
  try {
    const products = await getJSON("/productos");
    state.products = products;
  } catch (error) {
    console.error("Fallo API, se usa fallback local:", error);
    state.products = fallbackProducts;
    showAlert(statusElement, "API no disponible: se cargaron datos locales de prueba.", "error");
  }
}

// Bloque de inicializacion: flujo principal de catalogo.
async function initCatalogPage() {
  if (!filtersForm || !resultsList) {
    return;
  }

  await loadProducts();
  applyFilters();
  applySorting();
  bindFilterEvents();
  bindDelegatedEvents();
  renderCatalog();
}

// Bloque de arranque seguro del modulo de catalogo.
document.addEventListener("DOMContentLoaded", initCatalogPage);
