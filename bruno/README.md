# Colección Bruno - QualityTechnology Backend

## Uso rápido

1. Abre Bruno y selecciona esta carpeta de colección: `bruno/`
2. Selecciona el ambiente `local`.
3. Ejecuta `01-Dashboard/Auth/Login` para obtener token.
4. Copia el token de la respuesta y pégalo en la variable `token` del ambiente.
5. Navega al módulo que quieras probar (mismo orden que el sidebar del frontend).

> Todas las rutas viven detrás del prefijo `/api` (montado en `index.mjs`). Los únicos endpoints sin prefijo son la raíz `/` (health) y `/api-docs` (Swagger UI fuera de producción).

## Estructura por módulo

La colección sigue el orden del menú del frontend (`menuConfig.jsx`):

| Carpeta | Módulo frontend |
|---------|-----------------|
| `01-Dashboard/` | Inicio, login, Mi Perfil, Mi Expediente |
| `02-Inventarios/` | Inventario de organismos, trazabilidad, infraestructura, equipos, insumos |
| `03-Bitacoras/` | Control fauna, visitas, limpieza, biometrías, etc. |
| `04-Ventas/` | Lista de espera, ventas, clientes |
| `05-Finanzas/` | Flujo de caja, tesorería, proveedores, cuentas |
| `06-RRHH/` | Nómina, empleados, vacaciones, caja de ahorro |
| `07-Catalogos/` | Usuarios, roles, ubicaciones, catálogos de fauna, catálogo de insumos |
| `08-Seguridad/` | Módulos por rol |
| `Infra/` | Health check y Swagger UI |
| `Rondas/` | Flujos end-to-end (smoke, CRUD, seguridad) |

Dentro de cada módulo, los requests están agrupados **por pantalla/recurso** (ej. `02-Inventarios/Inventario de Organismos/Alevinaje/`).

## Variables de ambiente

- `baseUrl`: URL del backend (sin `/api`)
- `token`: JWT Bearer para rutas protegidas
- `username`, `password`: credenciales para login
- `granja`, `listaId`, `rolId`, `moduloId`: parámetros reutilizables
- `clienteId`, `proveedorId`, `ventaId`, `fiUsuarioId`, `runTag`, `invalidToken`: variables auxiliares para los flujos de Rondas

## Carpeta `Rondas`

Rondas listas para correr de extremo a extremo:

- `Rondas/01 Smoke Seguro` — login, health, mutaciones seguras
- `Rondas/02 Funcional Controlada` — CRUD real en clientes y proveedores con cleanup
- `Rondas/03 Funcional Avanzada` — lista-espera → venta → cleanup
- `Rondas/04 Seguridad` — matriz JWT 401/403/200

> Nota: el `flujo-caja` es bitácora de solo lectura; sus movimientos se generan automáticamente (p. ej. pagos de ventas).

## Notas

- Si agregas o renombras rutas en la API, crea o actualiza el `.bru` correspondiente en la carpeta del módulo.
- Los uploads multipart usan `@file()` como placeholder; sustitúyelo por la ruta real del archivo.
- Para `POST/PUT/PATCH`, ajusta el body según el módulo antes de ejecutar.
- Duplica requests dentro de la carpeta del módulo para cubrir más escenarios de payload.
