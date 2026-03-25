import { HomeModel } from "./homeModel.js";
import { HomeView } from "./homeView.js";
import { HomeController } from "./homeController.js";

// Bloque de bootstrap: inicializa arquitectura MVC al cargar el DOM.
function bootstrapHome() {
  const model = new HomeModel();
  const view = new HomeView();
  const controller = new HomeController(model, view);

  controller.init();
}

// Arranque seguro: espera a que exista el DOM antes de enlazar eventos.
document.addEventListener("DOMContentLoaded", bootstrapHome);
