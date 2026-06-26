import express from "express";
import cors from "cors";
import helmet from "helmet";

import fs from "node:fs";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";

// Importar rutas

import rolRoutes from "./src/routes/rolRoutes.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import piletaRoutes from "./src/routes/piletaRoutes.js";
import reproductorRoutes from "./src/routes/reproductorRoutes.js";
import engordaRoutes from "./src/routes/engordaRoutes.js";
import clienteRoutes from "./src/routes/clienteRoutes.js";
import ventaRoutes from "./src/routes/ventaRoutes.js";
import listaEsperaRoutes from "./src/routes/listaEsperaRoutes.js";
import equipoRoutes from "./src/routes/equipoRoutes.js";
import nominaRoutes from "./src/routes/nominaRoutes.js";
import vacacionRoutes from "./src/routes/vacacionRoutes.js";
import cajaAhorroRoutes from "./src/routes/cajaAhorroRoutes.js";
import proveedorRoutes from "./src/routes/proveedorRoutes.js";
import flujoCajaRoutes from "./src/routes/flujoCajaRoutes.js";
import tesoreriaRoutes from "./src/routes/tesoreriaRoutes.js";
import cuentaRoutes from "./src/routes/cuentaRoutes.js";
import unidadNegocioRoutes from "./src/routes/unidadNegocioRoutes.js";
import alevinajeRoutes from "./src/routes/alevinajeRoutes.js";
import eficienciaReproductivaRoutes from "./src/routes/eficienciaReproductivaRoutes.js";
import trazabilidadRoutes from "./src/routes/trazabilidadRoutes.js";
import historialPesoRoutes from "./src/routes/historialPesoRoutes.js";
import siembraRoutes from "./src/routes/siembraRoutes.js";

// Rutas de Bitácoras
import bitacoraBiometriaRoutes from "./src/routes/bitacoras/bitacoraBiometriaRoutes.js";
import bitacoraAlimentacionRoutes from './src/routes/bitacoras/bitacoraAlimentacionRoutes.js';
import controlFaunaNocivaRoutes from './src/routes/bitacoras/controlFaunaNocivaRoutes.js';
import recepcionInsumoRoutes from './src/routes/bitacoras/recepcionInsumoRoutes.js';
import controlVisitaRoutes from './src/routes/bitacoras/controlVisitaRoutes.js';
import controlLimpiezaRoutes from './src/routes/bitacoras/controlLimpiezaRoutes.js';
import parametrosFisicoQuimicosRoutes from './src/routes/bitacoras/parametrosFisicoQuimicosRoutes.js';
import bitacoraMedicamentoRoutes from './src/routes/bitacoras/bitacoraMedicamentoRoutes.js';
import bitacoraRecambioRoutes from './src/routes/bitacoras/bitacoraRecambioRoutes.js';
import bitacoraInventarioRoutes from './src/routes/bitacoras/bitacoraInventarioRoutes.js';

// rrhh
import departamentoRoutes from "./src/routes/departamentoRoutes.js";
import puestoRoutes from "./src/routes/puestoRoutes.js";
import empleadoRoutes from "./src/routes/empleadoRoutes.js";
import tipoDocumentoRoutes from "./src/routes/tipoDocumentoRoutes.js";
import documentoEmpleadoRoutes from "./src/routes/documentoEmpleadoRoutes.js";
import actaAdministrativaRoutes from "./src/routes/actaAdministrativaRoutes.js";

// Ubicaciones
import ubicacionRoutes from "./src/routes/ubicacionRoutes.js";
import tipoPiletaRoutes from "./src/routes/tipoPiletaRoutes.js";
import areaInstalacionRoutes from "./src/routes/areaInstalacionRoutes.js";
import faunaDetectadaRoutes from "./src/routes/faunaDetectadaRoutes.js";
import evidenciaFaunaRoutes from "./src/routes/evidenciaFaunaRoutes.js";
import estadoTrampaRoutes from "./src/routes/estadoTrampaRoutes.js";
import accionCorrectivaRoutes from "./src/routes/accionCorrectivaRoutes.js";
import insumoRoutes from "./src/routes/insumoRoutes.js";

// Rutas de Seguridad - Roles y Módulos
import modulosRoutes from "./src/routes/modulosRoutes.js";
import rolesModulosRoutes from "./src/routes/rolesModulosRoutes.js";

const app = express();

// Headers de seguridad HTTP
app.use(helmet());

// Documentación Swagger (solo en desarrollo)
if (process.env.NODE_ENV !== "production") {
  let swaggerDocument;

  try {
    const swaggerFile = fs.readFileSync("./swagger.yaml", "utf8");
    swaggerDocument = parse(swaggerFile);
  } catch (error) {
    console.error(
      "Error loading or parsing './swagger.yaml'. Please ensure the file exists and contains valid YAML.\nDetails:",
      error.message
    );
    process.exit(1);
  }

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Configurar CORS
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Para leer JSON en las peticiones
app.use(express.json());

// ============================================================================
// Router con prefijo /api
// ============================================================================
const api = express.Router();

// Core / Seguridad
api.use("/roles", rolRoutes);
api.use("/usuarios", usuarioRoutes);
api.use("/modulos", modulosRoutes);
api.use("/roles-modulos", rolesModulosRoutes);

// Operaciones
api.use("/piletas", piletaRoutes);
api.use("/reproductores", reproductorRoutes);
api.use("/engorda", engordaRoutes);
api.use("/alevinaje", alevinajeRoutes);
api.use("/eficiencia-reproductiva", eficienciaReproductivaRoutes);
api.use("/incubacion", eficienciaReproductivaRoutes);
api.use("/historial-peso", historialPesoRoutes);
api.use("/siembras", siembraRoutes);
api.use("/trazabilidad", trazabilidadRoutes);
api.use("/equipos", equipoRoutes);

// Ventas / CRM
api.use("/clientes", clienteRoutes);
api.use("/ventas", ventaRoutes);
api.use("/lista-espera", listaEsperaRoutes);
api.use("/proveedores", proveedorRoutes);

// Finanzas
api.use("/flujo-caja", flujoCajaRoutes);
api.use("/tesoreria", tesoreriaRoutes);
api.use("/cuentas", cuentaRoutes);
api.use("/caja-ahorro", cajaAhorroRoutes);

// RRHH
api.use("/empleados", empleadoRoutes);
api.use("/departamentos", departamentoRoutes);
api.use("/puestos", puestoRoutes);
api.use("/tipos-documento", tipoDocumentoRoutes);
api.use("/documentos-empleado", documentoEmpleadoRoutes);
api.use("/actas-administrativas", actaAdministrativaRoutes);
api.use("/nomina", nominaRoutes);
api.use("/vacaciones", vacacionRoutes);

// Catalogos
api.use("/unidades-negocio", unidadNegocioRoutes);
api.use("/ubicaciones", ubicacionRoutes);
api.use("/tipos-pileta", tipoPiletaRoutes);
api.use("/areas-instalacion", areaInstalacionRoutes);
api.use("/faunas-detectadas", faunaDetectadaRoutes);
api.use("/evidencias-fauna", evidenciaFaunaRoutes);
api.use("/estados-trampa", estadoTrampaRoutes);
api.use("/acciones-correctivas", accionCorrectivaRoutes);
api.use("/insumos", insumoRoutes);

// Bitácoras
api.use("/biometrias", bitacoraBiometriaRoutes);
api.use("/control-fauna-nociva", controlFaunaNocivaRoutes);
api.use("/alimentacion", bitacoraAlimentacionRoutes);
api.use("/recepcion_insumos", recepcionInsumoRoutes);
api.use("/control-visitas", controlVisitaRoutes);
api.use("/control-limpieza", controlLimpiezaRoutes);
api.use("/parametros-fisico-quimicos", parametrosFisicoQuimicosRoutes);
api.use("/medicamentos", bitacoraMedicamentoRoutes);
api.use("/recambios", bitacoraRecambioRoutes);
api.use("/inventario", bitacoraInventarioRoutes);

app.use("/api", api);

// Servir archivos estaticos protegidos (fuera del prefijo /api por ser recurso)
import { authStaticMiddleware } from "./src/middleware/authMiddleware.js";
app.use("/uploads", authStaticMiddleware, express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Backend 2.0, de Quality Technology trabajando satisfactoriamente" });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
