# Arquitectura Inicial del Proyecto

## Version simple
- Frontend pide productos al backend.
- Backend consulta MySQL y responde JSON.
- Frontend muestra tarjetas del catalogo.

## Version profesional
- Se separa por capas: rutas, controladores, servicios y modelos.
- Se usa REST para estandarizar endpoints y metodos HTTP.
- Se centraliza manejo de errores con middleware.
- Se usa pool de conexiones para escalar mejor en concurrencia.

## Conceptos clave
### MVC (adaptado)
- Que es: patron para separar responsabilidades.
- Por que existe: reduce acoplamiento y facilita mantenimiento.
- Como aplica aqui: controlador recibe HTTP, servicio aplica reglas, modelo consulta BD.

### REST
- Que es: estilo para diseno de APIs basadas en recursos.
- Por que existe: hace predecible la comunicacion cliente-servidor.
- Como aplica aqui: recurso products expuesto en /api/products con metodo GET.

### Middleware
- Que es: funciones intermedias en el ciclo request-response.
- Por que existe: reutilizar logica transversal (errores, auth, logs).
- Como aplica aqui: errorHandler captura excepciones y responde formato comun.

## Conexion con universidad
- Bases de datos: diseño de tabla products, tipos de datos y consultas SELECT.
- Algoritmos: transformacion de datos en capa servicio (map y normalizacion).
- Redes: peticiones HTTP entre cliente y servidor, puertos y latencia.
