# Resumen de Migración - QualityTechnology Backend

Este documento detalla el estado actual de la migración del backend a la nueva arquitectura MVC.

## ✅ Estado: Migración Completa (100%)

Todos los módulos identificados en las rutas antiguas han sido migrados a la nueva estructura en `src/`.

### Estructura del Proyecto Migrado
El proyecto ahora sigue un patrón MVC estricto:
*   **src/models/**: Lógica de acceso a datos (Queries SQL).
*   **src/controllers/**: Lógica de negocio y manejo de peticiones HTTP.
*   **src/routes/**: Definición de endpoints.
*   **src/index.js**: Punto de entrada único, registrando todas las rutas nuevas.

---

### Módulos Migrados

#### 1. Sistema Base y Usuarios
| Módulo | Descripción |
| :--- | :--- |
| **Usuarios** | Gestión de usuarios, autenticación y roles. |
| **Roles** | Gestión de permisos y roles de sistema. |
| **Empleados** | Información y gestión de empleados. |

#### 2. Gestión Operativa
| Módulo | Descripción |
| :--- | :--- |
| **Clientes** | Base de datos de clientes. |
| **Proveedores** | Base de datos de proveedores. |
| **Piletas** | Gestión de piletas/estanques. |
| **Equipos** | Inventario y mantenimiento de equipos. |
| **Expedientes** | Gestión documental y expedientes. |

#### 3. Producción y Procesos
| Módulo | Descripción |
| :--- | :--- |
| **Reproductores** | Gestión de reproductores. |
| **Engorda** | Procesos de engorda. |
| **Alimentos** | Inventario y gestión de alimentos. |
| **Lista de Espera** | Gestión de pedidos/procesos en espera. |
| **Ventas** | Registro y control de ventas. |

#### 4. Recursos Humanos y Finanzas
| Módulo | Descripción |
| :--- | :--- |
| **Nómina** | Gestión de pagos y nómina. |
| **Vacaciones** | Control de vacaciones. |
| **Caja de Ahorro** | Gestión de caja de ahorro de empleados. |

#### 5. Bitácoras (Ceiba)
| Módulo | Descripción |
| :--- | :--- |
| **Biometría** | Registros biométricos. |
| **Alimentación** | Bitácora de alimentación. |
| **Insumos** | Control de insumos. |

#### 6. Bitácoras (Medellín)
| Módulo | Descripción |
| :--- | :--- |
| **Baños** | Bitácora de baños. |
| **Parámetros** | Registro de parámetros de calidad de agua/ambiente. |
| **Medicamentos** | Control de aplicación de medicamentos. |
| **Recambios** | Bitácora de recambios de agua/filtros. |
| **Inventario** | Inventario específico de Medellín. |

#### 7. Bitácoras (General/Global)
| Módulo | Descripción |
| :--- | :--- |
| **Plagas** | Control de plagas (soporta ubicación). |
| **Recepción Insumos** | Bitácora de recepción (soporta ubicación). |
| **Visitas** | Registro de visitas con soporte para fotos (uploads). |

---

### Próximos Pasos (Mantenimiento)

La infraestructura antigua (`routes/` en la raíz) ya no es necesaria y ha sido marcada para eliminación. Cualquier nuevo desarrollo debe seguir estrictamente la estructura en `src/`.

**Para agregar un nuevo módulo:**
1. Crear `src/models/[nombre].model.js`
2. Crear `src/controllers/[nombre].controller.js`
3. Crear `src/routes/[nombre].routes.js`
4. Registrar en `src/index.js`
