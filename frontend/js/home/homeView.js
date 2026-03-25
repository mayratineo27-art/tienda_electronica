// Bloque de vista: se encarga de manipular DOM y pintar estado visual.
export class HomeView {
  constructor() {
    // Referencias DOM: se capturan una sola vez para rendimiento y orden.
    this.cartCount = document.getElementById("cartCount");
    this.cartButton = document.getElementById("cartButton");
    this.cartDrawer = document.getElementById("cartDrawer");
    this.drawerClose = document.getElementById("drawerClose");
    this.drawerList = document.getElementById("drawerList");
    this.drawerTotal = document.getElementById("drawerTotal");
    this.overlay = document.getElementById("overlay");
    this.searchWrap = document.getElementById("searchWrap");
    this.searchToggle = document.getElementById("searchToggle");
    this.searchInput = document.getElementById("searchInput");
    this.productButtons = document.querySelectorAll(".add-btn");
    this.categoryCards = document.querySelectorAll("#categorias .cat-card");
  }

  // Utilidad visual: formatea numericos como moneda COP para interfaz.
  formatCOP(value) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value);
  }

  // Render visual: actualiza badge de carrito en navbar.
  renderCartCount(totalUnits) {
    this.cartCount.textContent = totalUnits;
  }

  // Render visual: muestra items del drawer y total acumulado.
  renderCartDrawer(items, totalPrice) {
    if (items.length === 0) {
      this.drawerList.innerHTML = "<p style='color:#9ca3af;'>Aun no has agregado productos.</p>";
      this.drawerTotal.textContent = "$0";
      return;
    }

    this.drawerList.innerHTML = items
      .map(
        (item) => `
          <article class="drawer-item">
            <h4 style="margin-bottom: 0.3rem;">${item.name}</h4>
            <p style="color:#9ca3af; margin-bottom:0.2rem;">Cantidad: ${item.quantity}</p>
            <strong>${this.formatCOP(item.price * item.quantity)}</strong>
          </article>
        `
      )
      .join("");

    this.drawerTotal.textContent = this.formatCOP(totalPrice);
  }

  // Estado de UI: abre panel lateral de carrito.
  openDrawer() {
    this.cartDrawer.classList.add("open");
    this.overlay.classList.add("show");
  }

  // Estado de UI: cierra panel lateral de carrito.
  closeDrawer() {
    this.cartDrawer.classList.remove("open");
    this.overlay.classList.remove("show");
  }

  // Estado de UI: alterna barra de busqueda expandible.
  toggleSearch() {
    this.searchWrap.classList.toggle("active");

    if (this.searchWrap.classList.contains("active")) {
      this.searchInput.focus();
    }
  }

  // Render visual: aplica filtro sobre tarjetas de producto por nombre.
  filterProductsByName(query) {
    const normalized = query.toLowerCase().trim();
    const cards = document.querySelectorAll(".product-card");

    cards.forEach((card) => {
      const productName = card.dataset.name.toLowerCase();
      card.style.display = productName.includes(normalized) ? "block" : "none";
    });
  }

  // Efecto visual: anima boton de agregar para feedback de accion.
  animateAddButton(button) {
    button.classList.add("clicked");

    setTimeout(() => {
      button.classList.remove("clicked");
    }, 250);
  }
}
