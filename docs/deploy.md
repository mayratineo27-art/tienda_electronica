# Guia de Deploy - Portafolio E-commerce de Redes

## 1. Nube vs Hosting Compartido
- Servidor en la nube: tienes mas control de recursos, configuracion, escalado y seguridad. Ideal para APIs Node.js y proyectos de portafolio profesional.
- Hosting compartido: recursos compartidos entre muchos sitios, menor control de stack. Util para sitios simples, menos recomendable para backend API moderno.

## 2. Variables de entorno y seguridad en Git
- Un archivo .env guarda secretos: claves JWT, credenciales DB, tokens de terceros.
- Nunca se sube a Git porque cualquier persona con acceso al repo podria leer secretos y comprometer tu sistema.
- Se sube solo .env.example con nombres de variables, nunca valores reales.

## 3. Deploy del Frontend en Vercel (gratis)
1. Crear cuenta en Vercel y conectar repositorio de GitHub.
2. Seleccionar la carpeta raiz del proyecto.
3. Configurar como proyecto estatico (HTML/CSS/JS).
4. Definir comando de build vacio o segun necesidad.
5. Publicar y obtener URL final.

## 4. Deploy del Backend en Railway (gratis)
1. Crear proyecto en Railway conectado a GitHub.
2. Seleccionar carpeta backend como servicio principal.
3. Configurar variables de entorno del backend.
4. Definir Start Command: npm start.
5. Crear servicio MySQL en Railway o apuntar a MySQL externo.
6. Ejecutar schema.sql y seed_portafolio.sql en la base de datos de produccion.

## 5. Variables de entorno minimas en Railway
- PORT
- CLIENT_ORIGIN
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_ACCESS_SECRET
- JWT_ACCESS_EXPIRES_IN
- JWT_REFRESH_SECRET
- JWT_REFRESH_EXPIRES_IN
- COOKIE_SECURE=true
- COOKIE_SAME_SITE=none
- FORCE_HTTPS=true
- NODE_ENV=production

## 6. Conexion Frontend -> Backend
- Ajustar API_BASE_URL en frontend/js/utils.js para apuntar a URL de Railway.
- Verificar CORS (CLIENT_ORIGIN) para dominio de Vercel.
- Probar login, refresh token, catalogo y ordenes.

## 7. Dominio personalizado
1. Comprar dominio (Namecheap, Cloudflare, Google Domains, etc.).
2. En Vercel: agregar dominio y configurar registros DNS A/CNAME.
3. En Railway: agregar subdominio API (api.tudominio.com).
4. Configurar certificados TLS automaticos en ambos servicios.

## 8. Checklist previo a produccion
- .env fuera de Git.
- HTTPS activo.
- Logs sin datos sensibles.
- Rate limiting en login.
- Sanitizacion y validacion en backend/frontend.
- Backup basico de base de datos.
