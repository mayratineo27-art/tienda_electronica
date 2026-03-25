// Bloque de controlador: coordina eventos del DOM con modelo y vista.
export class HomeController {
  constructor(model, view) {
    // Dependencias MVC: controlador recibe modelo y vista por inyeccion.
    this.model = model;
    this.view = view;
  }

  // Utilidad de extraccion: obtiene datos del producto desde data-* del card HTML.
  getProductFromButton(button) {
    const card = button.closest(".product-card");

    return {
      id: Number(card.dataset.id),
      name: card.dataset.name,
      price: Number(card.dataset.price)
    };
  }

  // Sincronizacion MVC: repinta badge y drawer a partir del estado de modelo.
  syncCartUI() {
    this.view.renderCartCount(this.model.getTotalUnits());
    this.view.renderCartDrawer(this.model.getItems(), this.model.getTotalPrice());
  }

  // Registro de eventos: conecta acciones de usuario con flujo de negocio.
  bindEvents() {
    // Evento de compra: agregar producto desde cards de ofertas.
    this.view.productButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const product = this.getProductFromButton(button);
        this.model.addProduct(product);
        this.syncCartUI();
        this.view.animateAddButton(button);
      });
    });

    // Evento de apertura/cierre de drawer de carrito.
    this.view.cartButton.addEventListener("click", () => this.view.openDrawer());
    this.view.drawerClose.addEventListener("click", () => this.view.closeDrawer());
    this.view.overlay.addEventListener("click", () => this.view.closeDrawer());

    // Evento de busqueda expandible.
    this.view.searchToggle.addEventListener("click", () => this.view.toggleSearch());

    // Evento de filtro en tiempo real sobre productos.
    this.view.searchInput.addEventListener("input", (event) => {
      this.view.filterProductsByName(event.target.value);
    });

    // Evento en categorias: redirige a catalogo externo por categoria seleccionada.
    this.view.categoryCards.forEach((card) => {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const category = card.querySelector("h3")?.textContent?.trim() || "";
        window.location.href = `./catalogo.html?categoria=${encodeURIComponent(category)}`;
      });
    });
  }

  // Ciclo de arranque: establece estado inicial y activa listeners.
  init() {
    this.syncCartUI();
    this.bindEvents();
  }
}
