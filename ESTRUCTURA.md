# Estructura del Proyecto QualityTechnology-Backend

## Nueva Arquitectura MVC

El proyecto ha sido reestructurado siguiendo el patrón MVC (Model-View-Controller) para mejorar la organización, mantenibilidad y escalabilidad del código.

## Estructura de Directorios

```
QualityTechnology-Backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de la base de datos (Pool de PostgreSQL)
│   │
│   ├── controllers/             # Controladores - Lógica de peticiones HTTP
│   │   ├── usuarios.controller.js
│   │   ├── roles.controller.js
│   │   ├── clientes.controller.js
│   │   ├── piletas.controller.js
│   │   └── ...
│   │
│   ├── models/                  # Modelos - Consultas a la base de datos
│   │   ├── usuarios.model.js
│   │   ├── roles.model.js
│   │   ├── clientes.model.js
│   │   ├── piletas.model.js
│   │   └── ...
│   │
│   ├── routes/                  # Rutas - Definición de endpoints
│   │   ├── usuarios.routes.js
│   │   ├── roles.routes.js
│   │   ├── clientes.routes.js
│   │   ├── piletas.routes.js
│   │   └── ...
│   │
│   ├── middleware/              # Middlewares - Autenticación, validación, errores
│   │   ├── auth.js              # Autenticación JWT y autorización por roles
│   │   └── errorHandler.js      # Manejo centralizado de errores
│   │
│   ├── services/                # Servicios - Lógica de negocio compleja
│   │   └── auth.service.js      # Servicio de autenticación
│   │
│   ├── utils/                   # Utilidades - Funciones helper
│   │   └── ...
│   │
│   └── index.js                 # Punto de entrada de la aplicación
│
├── routes/                      # Rutas antiguas (temporal - en proceso de migración)
│   ├── alimentos.routes.js
│   ├── empleados.routes.js
│   └── ...
│
├── db.js                        # Archivo de compatibilidad (re-exporta database.js)
├── index.mjs                    # Archivo antiguo (mantener temporalmente)
├── package.json
└── .env
```

## Separación de Responsabilidades

### Models (Modelos)
- **Responsabilidad**: Acceso a datos (consultas SQL)
- **Ubicación**: `src/models/`
- **Ejemplo**: `usuarios.model.js`
  - Contiene métodos como `findAll()`, `findById()`, `create()`, `update()`, `delete()`
  - Solo interactúa con la base de datos
  - No conoce la lógica HTTP ni de negocio

### Controllers (Controladores)
- **Responsabilidad**: Manejar peticiones HTTP (req, res)
- **Ubicación**: `src/controllers/`
- **Ejemplo**: `usuarios.controller.js`
  - Contiene métodos que manejan las peticiones
  - Llama a los modelos y servicios
  - Formatea las respuestas HTTP
  - Maneja validaciones básicas

### Routes (Rutas)
- **Responsabilidad**: Definir endpoints y aplicar middlewares
- **Ubicación**: `src/routes/`
- **Ejemplo**: `usuarios.routes.js`
  - Define las rutas (GET, POST, PUT, DELETE)
  - Aplica middlewares (autenticación, autorización)
  - Conecta rutas con controladores

### Services (Servicios)
- **Responsabilidad**: Lógica de negocio compleja
- **Ubicación**: `src/services/`
- **Ejemplo**: `auth.service.js`
  - Lógica de autenticación (login, verificación de contraseñas)
  - Generación de tokens JWT
  - Operaciones que requieren múltiples modelos

### Middleware
- **Responsabilidad**: Procesamiento de peticiones
- **Ubicación**: `src/middleware/`
- **Tipos**:
  - **auth.js**: Autenticación JWT y autorización por roles
  - **errorHandler.js**: Manejo centralizado de errores

## Ejemplo de Flujo

### Petición: `GET /usuarios`

1. **Route** (`src/routes/usuarios.routes.js`)
   - Define: `router.get("/", authenticateToken, usuariosController.getAll)`
   - Aplica middleware de autenticación

2. **Middleware** (`src/middleware/auth.js`)
   - `authenticateToken`: Verifica el token JWT
   - Añade `req.user` con información del usuario

3. **Controller** (`src/controllers/usuarios.controller.js`)
   - `getAll`: Maneja la petición
   - Llama al modelo

4. **Model** (`src/models/usuarios.model.js`)
   - `findAll()`: Ejecuta la consulta SQL
   - Retorna los datos

5. **Controller** (cont.)
   - Recibe los datos del modelo
   - Formatea la respuesta JSON
   - Envía respuesta al cliente

## Middlewares Disponibles

### `authenticateToken`
Verifica el token JWT y añade información del usuario al request.

```javascript
import { authenticateToken } from "../middleware/auth.js";

router.get("/ruta-protegida", authenticateToken, controller.metodo);
```

### `authorizeRoles(...roles)`
Verifica que el usuario tenga uno de los roles especificados.

```javascript
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

router.post(
  "/ruta-admin",
  authenticateToken,
  authorizeRoles("administrador"),
  controller.metodo
);
```

### `errorHandler`
Maneja errores de forma centralizada (debe ir al final de las rutas).

## Migración de Rutas Antiguas

Para migrar una ruta antigua a la nueva estructura:

1. **Crear Model** (`src/models/[entidad].model.js`)
   - Extraer todas las consultas SQL
   - Crear métodos reutilizables

2. **Crear Controller** (`src/controllers/[entidad].controller.js`)
   - Mover la lógica de manejo de peticiones
   - Llamar a los métodos del modelo
   - Manejar errores con `next(error)`

3. **Crear/Actualizar Route** (`src/routes/[entidad].routes.js`)
   - Definir endpoints
   - Aplicar middlewares necesarios
   - Conectar con el controlador

4. **Actualizar `src/index.js`**
   - Importar la nueva ruta
   - Reemplazar la importación antigua

## Estado de Migración

### ✅ Migrado a Nueva Estructura
- Usuarios
- Roles
- Clientes
- Piletas

### ⏳ Pendiente de Migración
- Alimentos
- Reproductores
- Engorda
- Empleados
- Ventas
- Lista de Espera
- Equipos
- Expedientes
- Nómina
- Vacaciones
- Caja de Ahorro
- Proveedores
- Bitácoras (Ceiba y Medellín)

## Configuración

### Variables de Entorno
Asegúrate de tener un archivo `.env` con:
```env
PGUSER=tu_usuario
PGPASSWORD=tu_contraseña
PGHOST=localhost
PGPORT=5432
PGDATABASE=tu_base_de_datos
JWT_SECRET=tu_secreto_jwt
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

## Ejecución

```bash
npm start
```

El servidor iniciará en el puerto especificado en `PORT` (por defecto 5000).
