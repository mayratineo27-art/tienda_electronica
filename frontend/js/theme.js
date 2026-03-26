// Gestion de tema global: claro por defecto y oscuro persistente en localStorage.
(function initThemeSystem() {
  const STORAGE_KEY = "alling-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    const safeTheme = theme === "dark" ? "dark" : "light";
    root.setAttribute("data-theme", safeTheme);
    const toggleButton = document.getElementById("themeToggle");

    if (toggleButton) {
      toggleButton.textContent = safeTheme === "dark" ? "☀️" : "🌙";
      toggleButton.setAttribute(
        "aria-label",
        safeTheme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
      );
      toggleButton.setAttribute(
        "title",
        safeTheme === "dark" ? "Tema oscuro activo" : "Tema claro activo"
      );
    }
  }

  const savedTheme = localStorage.getItem(STORAGE_KEY);
  applyTheme(savedTheme || "light");

  document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("themeToggle");
    if (!toggleButton) {
      return;
    }

    toggleButton.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const nextTheme = current === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, nextTheme);
      applyTheme(nextTheme);
    });
  });
})();
