# Tienda Electronica de Redes

## Objetivo
Este proyecto implementa una tienda e-commerce para productos de redes usando:
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Base de datos: MySQL

## Estructura
- frontend/: interfaz de usuario y consumo de API
- backend/: API REST y logica de negocio
- database/: scripts SQL para crear y poblar datos
- docs/: decisiones de arquitectura y explicaciones

## Flujo de datos
1. El navegador abre frontend/index.html.
2. frontend/js/app.js solicita productos a la API en /api/products.
3. backend recibe la peticion y la pasa por rutas, controlador, servicio y modelo.
4. El modelo consulta MySQL y retorna los productos.
5. El frontend renderiza tarjetas de catalogo.

## Comandos base
### Backend
1. Entrar a backend
2. Instalar dependencias: npm install
3. Crear archivo .env desde .env.example
4. Levantar servidor: npm run dev

### Base de datos
1. Ejecutar database/schema.sql
2. Ejecutar database/seed.sql

## Nota academica
Este proyecto te ayuda a conectar SQL (consultas y normalizacion), algoritmos (filtros y busquedas) y redes (modelo cliente-servidor HTTP).
