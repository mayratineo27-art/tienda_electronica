# Conexion del Proyecto con Supabase (PostgreSQL)

## 1) Crear proyecto en Supabase
1. Crea un proyecto nuevo en https://supabase.com.
2. Espera a que finalice provisioning de la base PostgreSQL.
3. Ve a Settings > Database y copia:
   - Host
   - Port
   - Database name
   - User
   - Password

## 2) Crear tablas en Supabase
1. Abre SQL Editor en Supabase.
2. Ejecuta el contenido de `database/supabase_schema.sql`.
3. Luego ejecuta `database/supabase_seed.sql`.

## 3) Configurar backend/.env
Usa esta plantilla:

DB_CLIENT=supabase
SUPABASE_DB_HOST=db.tu-proyecto.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=tu_password
SUPABASE_DB_NAME=postgres
SUPABASE_DB_SSL=true

PORT=3000
CLIENT_ORIGIN=http://127.0.0.1:8080
JWT_ACCESS_SECRET=tu_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
FORCE_HTTPS=false
NODE_ENV=development

## 4) Arrancar backend
1. `cd backend`
2. `npm install`
3. `npm run dev`

## 5) Probar conexion
- Health:
  - `GET http://localhost:3000/api/health`
- Productos:
  - `GET http://localhost:3000/api/productos`

Si `api/productos` responde lista JSON, la conexion con Supabase quedo operativa.

## 6) Nota profesional
Supabase usa PostgreSQL. Por eso se agrego un adaptador en `backend/src/config/db.js` para que tu codigo existente funcione con MySQL o Supabase solo cambiando `DB_CLIENT`.
