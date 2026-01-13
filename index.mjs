import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importar rutas
import rolesRoutes from "./routes/roles.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import piletaRoutes from "./routes/pileta.routes.js";
import alimentosRoutes from "./routes/alimentos.routes.js"; 
import reproductoresRouter from "./routes/reproductores.routes.js";
import engordaRoutes from "./routes/engorda.routes.js";
import empleadosRoutes from "./routes/empleados.routes.js";
import clientesRoutes from "./routes/clientes.routes.js";
import ventasRoutes from "./routes/venta.routes.js";
import listaEsperaRoutes from "./routes/lista_espera.routes.js";
import equiposRoutes from "./routes/equipos.routes.js";
import expedientesRoutes from "./routes/expedientes.routes.js";
import nominaRoutes from "./routes/nomina.routes.js";
import vacacionesRoutes from "./routes/vacaciones.routes.js";
import cajaAhorroRoutes from "./routes/cajaAhorro.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";

// Rutas de Bitácoras
import biometriaCeiba from "./routes/bitacoras/biometria.routes.js";
import alimentacionCeiba from "./routes/bitacoras/alimentacion.routes.js";
import insumosCeiba from "./routes/bitacoras/insumos.routes.js";
import plagasRoutes from "./routes/bitacoras/plagas.routes.js";
import recepcionRoutes from "./routes/bitacoras/recepcion_insumos.routes.js";
import visitasRoutes from "./routes/bitacoras/visitas.routes.js";
import banosMedellin from "./routes/bitacoras/banos.routes.js";
import parametrosMedellin from "./routes/bitacoras/parametros.routes.js";
import medicamentosMedellin from "./routes/bitacoras/medicamentos.routes.js";
import recambiosMedellin from "./routes/bitacoras/recambios.routes.js";
import inventarioMedellin from "./routes/bitacoras/inventario.routes.js";
dotenv.config();

const app = express();

// 🛡️ Configurar CORS correctamente
app.use(
  cors({
    origin: "http://localhost:3000", // tu frontend React
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 🧩 Para leer JSON en las peticiones
app.use(express.json());

// 🔗 Registrar rutas
app.use("/roles", rolesRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/piletas", piletaRoutes);
app.use("/reproductores", reproductoresRouter);
app.use("/engorda", engordaRoutes);
app.use("/empleados", empleadosRoutes);
app.use("/clientes", clientesRoutes);
app.use("/ventas", ventasRoutes);
app.use("/alimentos", alimentosRoutes);
app.use("/lista-espera", listaEsperaRoutes);
app.use("/equipos", equiposRoutes);
app.use("/expedientes", expedientesRoutes);
app.use("/nomina", nominaRoutes);
app.use("/vacaciones", vacacionesRoutes);
app.use("/caja-ahorro", cajaAhorroRoutes);
app.use("/proveedores", proveedoresRoutes);
//bitacoras
app.use("/plagas", plagasRoutes);
app.use("/ceiba/biometrias", biometriaCeiba);
app.use("/ceiba/alimentacion", alimentacionCeiba);
app.use("/ceiba/insumos", insumosCeiba);
app.use("/recepcion_insumos", recepcionRoutes);
app.use("/visitas", visitasRoutes);
app.use("/medellin/banos", banosMedellin);
app.use("/medellin/parametros", parametrosMedellin);
app.use("/medellin/medicamentos", medicamentosMedellin);
app.use("/medellin/recambios", recambiosMedellin);
app.use("/medellin/inventario", inventarioMedellin);

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
