// Bloque de configuracion: URL base de la API para solicitudes HTTP.
const API_BASE_URL = "http://localhost:3000/api";

// Bloque de referencias al DOM: elementos donde mostraremos estado y productos.
const statusMessage = document.getElementById("statusMessage");
const productGrid = document.getElementById("productGrid");

// Bloque de utilidades: renderiza una tarjeta HTML por cada producto.
function createProductCard(product) {
  return `
    <article class="product-card">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p class="price">$ ${Number(product.price).toFixed(2)}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <p><strong>Categoria:</strong> ${product.category}</p>
    </article>
  `;
}

// Bloque principal: obtiene productos desde backend y actualiza la vista.
async function loadProducts() {
  try {
    // Se solicita el recurso REST de productos al backend.
    const response = await fetch(`${API_BASE_URL}/products`);

    // Validacion basica de estado HTTP para manejar errores de red o servidor.
    if (!response.ok) {
      throw new Error("No fue posible obtener productos desde la API.");
    }

    // Se parsea la respuesta JSON y se pinta en el grid de catalogo.
    const products = await response.json();
    statusMessage.textContent = `Productos cargados: ${products.length}`;
    productGrid.innerHTML = products.map(createProductCard).join("");
  } catch (error) {
    // Manejo de error de forma amigable para el usuario final.
    statusMessage.textContent = "Ocurrio un error al cargar el catalogo.";
    statusMessage.classList.add("error");
    productGrid.innerHTML = "";
    console.error(error);
  }
}

// Bloque de inicio: dispara la carga apenas abre la pagina.
loadProducts();
