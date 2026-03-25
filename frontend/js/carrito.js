import {
  STORAGE_KEYS,
  formatPrice,
  readFromStorage,
  writeToStorage,
  showAlert,
  clearAlert
} from "./utils.js";

// Bloque de referencias DOM: nodos principales de la vista de carrito.
const cartStatus = document.getElementById("cart-status");
const cartItemsContainer = document.getElementById("cart-items");
const subtotalElement = document.getElementById("summary-subtotal");
const shippingElement = document.getElementById("summary-shipping");
const totalElement = document.getElementById("summary-total");
const checkoutButton = document.getElementById("checkout-btn");

// Bloque de estado local: arreglo de items almacenado en navegador.
let cartItems = [];

// Bloque de lectura inicial: carga carrito persistido en localStorage.
function loadCart() {
  cartItems = readFromStorage(STORAGE_KEYS.cart, []);
}

// Bloque de persistencia: guarda carrito actual luego de cualquier cambio.
function saveCart() {
  writeToStorage(STORAGE_KEYS.cart, cartItems);
}

// Bloque de calculo: obtiene subtotal, envio y total para resumen de compra.
function calculateTotals(items) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 12000 : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

// Bloque de render de filas: construye HTML para cada producto del carrito.
function renderCartItems(items) {
  if (!cartItemsContainer) {
    return;
  }

  if (items.length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito esta vacio por ahora.</p>";
    return;
  }

  cartItemsContainer.innerHTML = items
    .map(
      (item) => `
      <article data-product-id="${item.id}">
        <h3>${item.name}</h3>
        <p>Precio unitario: ${formatPrice(item.price)}</p>
        <label for="qty-${item.id}">Cantidad</label>
        <input id="qty-${item.id}" type="number" min="1" value="${item.quantity}" data-action="update-quantity" />
        <p>Subtotal: ${formatPrice(item.price * item.quantity)}</p>
        <button type="button" data-action="remove-item">Eliminar</button>
      </article>
    `
    )
    .join("");
}

// Bloque de render de totales: imprime montos calculados en el resumen.
function renderSummary(items) {
  const { subtotal, shipping, total } = calculateTotals(items);
  subtotalElement.textContent = formatPrice(subtotal);
  shippingElement.textContent = formatPrice(shipping);
  totalElement.textContent = formatPrice(total);
}

// Bloque de render principal: sincroniza vista completa del carrito.
function renderCart() {
  clearAlert(cartStatus);
  renderCartItems(cartItems);
  renderSummary(cartItems);
  showAlert(cartStatus, `Productos en carrito: ${cartItems.length}`, "success");
}

// Bloque de acciones de dominio: elimina item por identificador.
function removeItemById(productId) {
  cartItems = cartItems.filter((item) => String(item.id) !== String(productId));
  saveCart();
  renderCart();
}

// Bloque de acciones de dominio: actualiza cantidad con validacion minima.
function updateItemQuantity(productId, quantityValue) {
  const normalizedQuantity = Math.max(1, Number(quantityValue) || 1);

  cartItems = cartItems.map((item) => {
    if (String(item.id) !== String(productId)) {
      return item;
    }

    return {
      ...item,
      quantity: normalizedQuantity
    };
  });

  saveCart();
  renderCart();
}

// Bloque de event delegation: escucha eventos en contenedor y decide accion por data-action.
function bindCartEvents() {
  if (!cartItemsContainer) {
    return;
  }

  cartItemsContainer.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    const articleElement = actionElement.closest("article[data-product-id]");
    if (!articleElement) {
      return;
    }

    const productId = articleElement.dataset.productId;

    if (actionElement.dataset.action === "remove-item") {
      removeItemById(productId);
    }
  });

  cartItemsContainer.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.dataset.action !== "update-quantity") {
      return;
    }

    const articleElement = target.closest("article[data-product-id]");
    if (!articleElement) {
      return;
    }

    updateItemQuantity(articleElement.dataset.productId, target.value);
  });

  checkoutButton?.addEventListener("click", () => {
    showAlert(cartStatus, "Checkout en construccion. En la siguiente fase lo conectamos al backend.", "success");
  });
}

// Bloque de API publica del modulo: permite agregar al carrito desde otras paginas.
export function addProductToCart(product, quantity = 1) {
  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  const existingItem = cartItems.find((item) => String(item.id) === String(product.id));

  if (existingItem) {
    existingItem.quantity += normalizedQuantity;
  } else {
    cartItems.push({
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      quantity: normalizedQuantity
    });
  }

  saveCart();
  renderCart();
}

// Bloque de inicializacion: prepara estado, eventos y primer render de la vista.
function initCartPage() {
  if (!cartItemsContainer || !subtotalElement || !shippingElement || !totalElement) {
    return;
  }

  loadCart();
  bindCartEvents();
  renderCart();
}

// Bloque de arranque seguro: espera a que el DOM este listo antes de manipular nodos.
document.addEventListener("DOMContentLoaded", initCartPage);
