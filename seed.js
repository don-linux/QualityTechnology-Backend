import pool from "./src/db.js";

const modulos = [
  { nombre: "Dashboard", ruta: "/", activo: true },
  { nombre: "Roles", ruta: "/roles", activo: true },
  { nombre: "Usuarios", ruta: "/usuarios", activo: true },
  { nombre: "Piletas", ruta: "/piletas", activo: true },
  { nombre: "Instalaciones", ruta: "/instalaciones", activo: true },
  { nombre: "Lotes", ruta: "/lotes", activo: true },
  { nombre: "Alimentos", ruta: "/alimentos", activo: true },
  { nombre: "Clientes", ruta: "/clientes", activo: true },
  { nombre: "Ventas", ruta: "/ventas", activo: true },
  { nombre: "Proveedores", ruta: "/proveedores", activo: true },
  { nombre: "Empleados", ruta: "/empleados", activo: true },
  { nombre: "Departamentos", ruta: "/departamentos", activo: true }
];

async function seed() {
  try {
    console.log("Insertando módulos básicos en seguridad.modulos...");
    for (const m of modulos) {
      await pool.query(
        `INSERT INTO seguridad.modulos (fc_nombre, fc_ruta, fb_activo) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (fc_nombre) DO NOTHING`,
        [m.nombre, m.ruta, m.activo]
      );
    }
    console.log("Módulos básicos insertados correctamente.");
    process.exit(0);
  } catch (err) {
    console.error("Error al insertar módulos:", err);
    process.exit(1);
  }
}

seed();
