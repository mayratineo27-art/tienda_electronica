// Bloque de configuracion: carga variables de entorno desde .env.
require("dotenv").config();

// Bloque de importacion de app Express.
const app = require("./app");

// Bloque de parametros de servidor: usa variable o valor por defecto.
const PORT = process.env.PORT || 3000;

// Bloque de arranque: inicia escucha HTTP para clientes frontend.
app.listen(PORT, () => {
  console.log(`Servidor backend activo en puerto ${PORT}`);
});
