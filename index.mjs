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
import instalacionRoutes from "./src/routes/instalacionRoutes.js";
import alimentoRoutes from "./src/routes/alimentoRoutes.js";
import loteRoutes from "./src/routes/loteRoutes.js";
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

// Rutas de Bitácoras
import bitacoraBiometriaRoutes from "./src/routes/bitacoras/bitacoraBiometriaRoutes.js";
import bitacoraAlimentacionRoutes from './src/routes/bitacoras/bitacoraAlimentacionRoutes.js';
import bitacoraInsumoRoutes from './src/routes/bitacoras/bitacoraInsumoRoutes.js';
import bitacoraPlagaRoutes from './src/routes/bitacoras/bitacoraPlagaRoutes.js';
import recepcionInsumoRoutes from './src/routes/bitacoras/recepcionInsumoRoutes.js';
import bitacoraVisitaRoutes from './src/routes/bitacoras/bitacoraVisitaRoutes.js';
import bitacoraBanoRoutes from './src/routes/bitacoras/bitacoraBanoRoutes.js';
import bitacoraParametroRoutes from './src/routes/bitacoras/bitacoraParametroRoutes.js';
import bitacoraMedicamentoRoutes from './src/routes/bitacoras/bitacoraMedicamentoRoutes.js';
import bitacoraRecambioRoutes from './src/routes/bitacoras/bitacoraRecambioRoutes.js';
import bitacoraInventarioRoutes from './src/routes/bitacoras/bitacoraInventarioRoutes.js';

// rrhh
import departamentoRoutes from "./src/routes/departamentoRoutes.js";
import puestoRoutes from "./src/routes/puestoRoutes.js";
import empleadoRoutes from "./src/routes/empleadoRoutes.js";
import tipoDocumentoRoutes from "./src/routes/tipoDocumentoRoutes.js";
import documentoEmpleadoRoutes from "./src/routes/documentoEmpleadoRoutes.js";

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

// Registrar rutas
app.use("/roles", rolRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/piletas", piletaRoutes);
app.use("/instalaciones", instalacionRoutes);
app.use("/lotes", loteRoutes);
app.use("/reproductores", reproductorRoutes);
app.use("/engorda", engordaRoutes);
app.use("/clientes", clienteRoutes);
app.use("/ventas", ventaRoutes);
app.use("/alimentos", alimentoRoutes);
app.use("/lista-espera", listaEsperaRoutes);
app.use("/equipos", equipoRoutes);
app.use("/nomina", nominaRoutes);
app.use("/vacaciones", vacacionRoutes);
app.use("/caja-ahorro", cajaAhorroRoutes);
app.use("/proveedores", proveedorRoutes);
app.use("/flujo-caja", flujoCajaRoutes);
app.use("/tesoreria", tesoreriaRoutes);
app.use("/cuentas", cuentaRoutes);
import { authStaticMiddleware } from "./src/middleware/authMiddleware.js";
app.use("/uploads", authStaticMiddleware, express.static("uploads"));

// Bitácoras
app.use("/biometrias", bitacoraBiometriaRoutes);
app.use("/plagas", bitacoraPlagaRoutes);
app.use("/ceiba/alimentacion", bitacoraAlimentacionRoutes);
app.use("/ceiba/insumos", bitacoraInsumoRoutes);
app.use("/recepcion_insumos", recepcionInsumoRoutes);
app.use("/visitas", bitacoraVisitaRoutes);
app.use("/medellin/banos", bitacoraBanoRoutes);
app.use("/medellin/parametros", bitacoraParametroRoutes);
app.use("/medellin/medicamentos", bitacoraMedicamentoRoutes);
app.use("/medellin/recambios", bitacoraRecambioRoutes);
app.use("/medellin/inventario", bitacoraInventarioRoutes);

// rrhh
app.use("/empleados", empleadoRoutes);
app.use("/departamentos", departamentoRoutes);
app.use("/puestos", puestoRoutes);
app.use("/tipos-documento", tipoDocumentoRoutes);
app.use("/documentos-empleado", documentoEmpleadoRoutes);

//Seguridad - Roles y Módulos
app.use("/modulos", modulosRoutes);
app.use("/roles-modulos", rolesModulosRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend de Quality Technology jalando" });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
