# Tienda E-commerce de Equipos de Redes

Proyecto de portafolio full-stack orientado a venta de productos de infraestructura de red (routers, switches, access points, firewalls, NAS y cableado).

## 1. Resumen Profesional
- Frontend: HTML5, CSS3, JavaScript (modular).
- Backend: Node.js, Express, middlewares de seguridad.
- Base de datos: MySQL relacional normalizada.
- Seguridad: JWT access/refresh, bcrypt, rate limiting, validacion/sanitizacion.
- Arquitectura: capas tipo MVC adaptado (routes -> controllers -> DB).

## 2. Tecnologias
- HTML + CSS + JavaScript (ES Modules)
- Node.js + Express
- MySQL + mysql2/promise (pool de conexiones)
- express-validator, bcryptjs, jsonwebtoken
- helmet, cors, cookie-parser, express-rate-limit

## 3. Estructura del Proyecto
- frontend/: vistas y logica del cliente.
- backend/: API REST y seguridad.
- database/: esquema, seeds y consultas CRUD.
- docs/: arquitectura y guia de deploy.

## 4. Instalacion Local
### Requisitos
- Node.js 18+
- MySQL 8+

### Pasos
1. Clonar repositorio.
2. Backend:
	- `cd backend`
	- `npm install`
	- copiar `.env.example` como `.env` y completar secretos
3. Base de datos:
	- ejecutar `database/schema.sql`
	- ejecutar `database/seed_portafolio.sql` (o `database/seed.sql`)
4. Ejecutar backend:
	- `npm run dev`
5. Abrir frontend:
	- abrir `frontend/index.html` con Live Server o navegador.

## 5. Variables de Entorno
Archivo de referencia: `backend/.env.example`

Variables principales:
- PORT
- CLIENT_ORIGIN
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRES_IN
- JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
- COOKIE_SECURE, COOKIE_SAME_SITE
- FORCE_HTTPS, NODE_ENV

Importante:
- Nunca subir `.env` al repositorio.
- Solo versionar `.env.example`.

## 6. Endpoints Principales
### Usuarios
- `POST /api/usuarios/registro`
- `POST /api/usuarios/login`
- `POST /api/usuarios/refresh`
- `POST /api/usuarios/logout`
- `GET /api/usuarios/perfil`

### Productos
- `GET /api/productos`
- `GET /api/productos/:id`
- `POST /api/productos` (admin)
- `PUT /api/productos/:id` (admin)
- `DELETE /api/productos/:id` (admin)

### Ordenes
- `POST /api/ordenes`
- `GET /api/ordenes/mias`
- `PATCH /api/ordenes/:id/estado` (admin)

## 7. Documentacion de API (Swagger/OpenAPI)
Se agregaron comentarios Swagger en:
- `backend/routes/usuarios.js`
- `backend/routes/productos.js`
- `backend/routes/ordenes.js`

Estos bloques permiten generar documentacion OpenAPI con herramientas como:
- swagger-jsdoc
- swagger-ui-express

## 8. Capturas de Pantalla (Portafolio)
Recomendado agregar en carpeta `docs/screenshots/`:
- `home.png`
- `catalogo.png`
- `producto.png`
- `carrito.png`
- `admin-dashboard.png`

Luego referenciarlas en este README con Markdown.

## 9. Deploy (Vercel + Railway)
Guia completa en:
- `docs/deploy.md`

Resumen:
- Frontend estatico en Vercel.
- Backend API en Railway.
- MySQL en Railway o proveedor externo.
- CORS y variables de entorno configuradas por ambiente.

## 10. Rendimiento y Metricas
Metricas recomendadas para reportar en entrevistas:
- Tiempo medio de respuesta por endpoint (ms).
- Throughput (requests por segundo).
- Tasa de error (4xx/5xx).
- Latencia p95 y p99.

Medicion sugerida:
- Herramientas: k6, autocannon o Apache Benchmark.
- Ejemplo base:
  - login p95 < 300ms
  - listado de productos p95 < 250ms

## 11. Seguridad Implementada
- Password hashing con bcrypt (cost 12)
- Access token de 15 minutos + refresh token de 7 dias
- Refresh token en cookie httpOnly
- Rate limiting en login (5 intentos/IP)
- Validacion y sanitizacion de entradas
- CORS y cabeceras de seguridad (helmet)
- Queries parametrizadas para prevenir SQL Injection

## 12. Roadmap (Mejoras Futuras)
- Integrar pasarela de pagos (Stripe/Mercado Pago).
- Agregar pruebas automatizadas (unitarias e integracion).
- Incorporar cache con Redis para catalogo.
- Implementar CI/CD con GitHub Actions.
- Observabilidad con logs estructurados + métricas + trazas.

## 13. Autor
Proyecto desarrollado como portafolio profesional de Ingenieria de Sistemas con enfoque en desarrollo web, arquitectura de software y seguridad aplicada.
