import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importar rutas (nuevas estructura MVC)
import rolesRoutes from "./routes/roles.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import piletasRoutes from "./routes/piletas.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import reproductoresRoutes from "./routes/reproductores.routes.js";
import engordaRoutes from "./routes/engorda.routes.js";
import empleadosRoutes from "./routes/empleados.routes.js";
import alimentosRoutes from "./routes/alimentos.routes.js";
import ventasRoutes from "./routes/ventas.routes.js";
import listaEsperaRoutes from "./routes/lista_espera.routes.js";
import equiposRoutes from "./routes/equipos.routes.js";
import expedientesRoutes from "./routes/expedientes.routes.js";
import nominaRoutes from "./routes/nomina.routes.js";
import vacacionesRoutes from "./routes/vacaciones.routes.js";
import cajaAhorroRoutes from "./routes/cajaAhorro.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";

// Nuevas rutas agregadas
import alevinesRoutes from "./routes/alevines.routes.js";
import instalacionesRoutes from "./routes/instalaciones.routes.js";
import flujoCajaRoutes from "./routes/flujoCaja.routes.js";
import tesoreriaRoutes from "./routes/tesoreria.routes.js";
import movimientoAlevinesRoutes from "./routes/movimientoAlevines.routes.js";

// Rutas de Bitácoras (Nueva estructura MVC)
import biometriaRoutes from "./routes/bitacoras/biometria.routes.js";
import alimentacionRoutes from "./routes/bitacoras/alimentacion.routes.js";
import insumosRoutes from "./routes/bitacoras/insumos.routes.js";
import plagasRoutes from "./routes/bitacoras/plagas.routes.js";
import recepcionRoutes from "./routes/bitacoras/recepcion_insumos.routes.js";
import visitasRoutes from "./routes/bitacoras/visitas.routes.js";

import banosRoutes from "./routes/bitacoras/banos.routes.js";
import parametrosRoutes from "./routes/bitacoras/parametros.routes.js";
import medicamentosRoutes from "./routes/bitacoras/medicamentos.routes.js";
import recambiosRoutes from "./routes/bitacoras/recambios.routes.js";
import inventarioRoutes from "./routes/bitacoras/inventario.routes.js";

// Middleware
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

// Configurar CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware para leer JSON
app.use(express.json());

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "API de QualityTechnology funcionando correctamente",
    version: "1.0.0",
    estructura: "Nueva arquitectura MVC",
    endpoints: [
      "/roles",
      "/usuarios",
      "/piletas",
      "/clientes",
      "/reproductores",
      "/engorda",
      "/empleados",
      "/ventas",
      "/alimentos",
      "/lista-espera",
      "/equipos",
      "/expedientes",
      "/nomina",
      "/vacaciones",
      "/caja-ahorro",
      "/proveedores",
      "/alevines",
      "/instalaciones",
      "/flujo-caja",
      "/tesoreria",
      "/movimiento-alevines",
      "/plagas",
      "/ceiba/biometrias",
      "/ceiba/alimentacion",
      "/ceiba/insumos",
      "/recepcion_insumos",
      "/visitas",
      "/medellin/banos",
      "/medellin/parametros",
      "/medellin/medicamentos",
      "/medellin/recambios",
      "/medellin/inventario",
    ],
  });
});

// Registrar rutas (nuevas estructura MVC)
app.use("/roles", rolesRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/piletas", piletasRoutes);
app.use("/clientes", clientesRoutes);
app.use("/reproductores", reproductoresRoutes);
app.use("/engorda", engordaRoutes);
app.use("/empleados", empleadosRoutes);
app.use("/alimentos", alimentosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/lista-espera", listaEsperaRoutes);
app.use("/equipos", equiposRoutes);
app.use("/expedientes", expedientesRoutes);
app.use("/nomina", nominaRoutes);
app.use("/vacaciones", vacacionesRoutes);
app.use("/caja-ahorro", cajaAhorroRoutes);
app.use("/proveedores", proveedoresRoutes);

// Nuevas rutas agregadas
app.use("/alevines", alevinesRoutes);
app.use("/instalaciones", instalacionesRoutes);
app.use("/flujo-caja", flujoCajaRoutes);
app.use("/tesoreria", tesoreriaRoutes);
app.use("/movimiento-alevines", movimientoAlevinesRoutes);

// Bitácoras (Nueva estructura MVC)
app.use("/plagas", plagasRoutes);
app.use("/ceiba/biometrias", biometriaRoutes);
app.use("/ceiba/alimentacion", alimentacionRoutes);
app.use("/ceiba/insumos", insumosRoutes);
app.use("/recepcion_insumos", recepcionRoutes);
app.use("/visitas", visitasRoutes);
app.use("/medellin/banos", banosRoutes);
app.use("/medellin/parametros", parametrosRoutes);
app.use("/medellin/medicamentos", medicamentosRoutes);
app.use("/medellin/recambios", recambiosRoutes);
app.use("/medellin/inventario", inventarioRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
