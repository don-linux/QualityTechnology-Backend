# Colección Bruno - QualityTechnology Backend

## Uso rápido

1. Abre Bruno y selecciona esta carpeta de colección:
   - `bruno/QualityTechnology-Backend`
2. Selecciona el ambiente `local`.
3. Ejecuta `Auth/Login` para obtener token.
4. Copia el token de la respuesta y pégalo en la variable `token` del ambiente.
5. Ejecuta endpoints protegidos.

> Todas las rutas viven detrás del prefijo `/api` (montado en `index.mjs`). Los únicos endpoints sin prefijo son la raíz `/` (health) y `/api-docs` (Swagger UI fuera de producción).

## Variables de ambiente

- `baseUrl`: URL del backend (sin `/api`)
- `token`: JWT Bearer para rutas protegidas
- `username`, `password`: credenciales para login
- `granja`, `listaId`, `rolId`, `moduloId`: parámetros reutilizables
- `clienteId`, `proveedorId`, `ventaId`, `fiUsuarioId`, `runTag`, `invalidToken`: variables auxiliares para los flujos de Rondas

## Nota

La colección está organizada para pruebas funcionales rápidas y smoke. Puedes duplicar requests para cubrir más escenarios de payload por módulo.

## Carpeta `Auto` (generada)

Carpeta `Auto/` con un request por cada endpoint montado en `index.mjs` (incluye bitácoras, RRHH, ubicaciones, unidades de negocio, documentos de empleado y actas administrativas).

- Total: **229 requests**
- Organización por método: `Auto/GET` (88), `Auto/POST` (45), `Auto/PUT` (35), `Auto/PATCH` (14), `Auto/DELETE` (47)
- Los endpoints protegidos ya incluyen `Authorization: Bearer {{token}}`. Las rutas públicas (`POST /api/usuarios/login` y `POST /api/usuarios/refresh`) no envían el header.
- Los uploads multipart se generan con `body:multipart-form` y un campo `@file()` placeholder:
   - `POST /api/control-visitas` y `PUT /api/control-visitas/:id` (`foto_identificacion`)
   - `POST /api/documentos-empleado/mis-documentos/upload` y `POST /api/documentos-empleado/:empleadoId/upload` (`archivo`)
   - `POST /api/actas-administrativas/:empleadoId/upload` (`archivo`)
- Los parámetros de ruta usan placeholders del environment, p. ej. `{{granja}}`, `{{id}}`, `{{empleadoId}}`.

### Recomendación de uso

1. Ejecuta `Auth/Login`.
2. Copia el token al environment (`token`).
3. Prueba primero los `GET` de `Auto/GET`.
4. Para `POST/PUT/PATCH`, ajusta el `body` según el módulo antes de ejecutar.
5. Para uploads multipart, sustituye `@file()` por la ruta real del archivo en tu equipo.

## Carpeta `Rondas`

Se agregó una ronda lista para correr de extremo a extremo:

- [Rondas/01 Smoke Seguro](Rondas/01%20Smoke%20Seguro)
- [Rondas/02 Funcional Controlada](Rondas/02%20Funcional%20Controlada)
- [Rondas/03 Funcional Avanzada](Rondas/03%20Funcional%20Avanzada)
- [Rondas/04 Seguridad](Rondas/04%20Seguridad)

### Objetivo de esta ronda

- Verificar autenticación y endpoints críticos
- Probar mutables en modo seguro (JSON inválido o IDs inexistentes)
- Evitar mutaciones reales de datos

### Orden sugerido

Ejecuta en secuencia del `01` al `10`.

> Nota: después de `01 Login`, copia manualmente el token al environment (`token`) para que el resto de requests autenticados funcionen.

### Ronda 02 (funcional controlada)

- Ejecuta CRUD real con cleanup en `clientes` y `proveedores`.
- Usa variables de environment:
   - `clienteId`
   - `proveedorId`
   - `fiUsuarioId`
   - `runTag`
- Durante la ejecución, toma los IDs creados y colócalos en las variables para `PUT` y `DELETE`.

### Ronda 03 (funcional avanzada)

- Flujo `lista-espera -> convertir -> venta -> cleanup`.
- Nota: el `flujo-caja` es ahora una bitácora de solo lectura; sus movimientos se generan automáticamente (p. ej. pagos de ventas), por lo que ya no se prueban `create/update/delete`.
- Variables usadas:
   - `listaId`
   - `ventaId`
   - `granja`

### Ronda 04 (seguridad)

- Valida control de acceso JWT en rutas protegidas.
- Casos incluidos:
   - `401` sin token
   - `403` con token inválido
   - `200` con token válido
   - `401` en login inválido
- Variable auxiliar:
   - `invalidToken`
