// Bloque de modelo: contiene estado y reglas del carrito sin depender del DOM.
export class HomeModel {
  constructor() {
    // Estado interno: arreglo de productos agregados al carrito.
    this.cart = [];
  }

  // Regla de negocio: agrega un producto o incrementa cantidad si ya existe.
  addProduct(product) {
    const existingItem = this.cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      return;
    }

    this.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  // Regla de negocio: retorna cantidad total de unidades en carrito.
  getTotalUnits() {
    return this.cart.reduce((acc, item) => acc + item.quantity, 0);
  }

  // Regla de negocio: calcula monto total acumulado.
  getTotalPrice() {
    return this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  // Regla de negocio: expone snapshot de items para render.
  getItems() {
    return [...this.cart];
  }
}
