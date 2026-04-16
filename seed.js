// seed.js — Inicializa modulos y asignacion a roles root
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

const MODULOS = [
  // Categorias del menu (requeridas por el frontend para mostrar secciones)
  { fc_nombre: "Dashboard",    fc_ruta: "/",           fb_activo: true },
  { fc_nombre: "Operaciones",  fc_ruta: "/operaciones", fb_activo: true },
  { fc_nombre: "Inventarios",  fc_ruta: "/inventarios", fb_activo: true },
  { fc_nombre: "Ventas",       fc_ruta: "/ventas",      fb_activo: true },
  { fc_nombre: "Finanzas",     fc_ruta: "/finanzas",    fb_activo: true },
  { fc_nombre: "RRHH",         fc_ruta: "/rrhh",        fb_activo: true },
  { fc_nombre: "Catálogos",    fc_ruta: "/catalogos",   fb_activo: true },

  // Modulos individuales
  { fc_nombre: "Seguridad",             fc_ruta: "/seguridad",             fb_activo: true },
  { fc_nombre: "Roles",                 fc_ruta: "/roles",                 fb_activo: true },
  { fc_nombre: "Usuarios",              fc_ruta: "/usuarios",              fb_activo: true },
  { fc_nombre: "Piletas",               fc_ruta: "/piletas",               fb_activo: true },
  { fc_nombre: "Instalaciones",         fc_ruta: "/instalaciones",         fb_activo: true },
  { fc_nombre: "Lotes",                 fc_ruta: "/lotes",                 fb_activo: true },
  { fc_nombre: "Reproductores",         fc_ruta: "/reproductores",         fb_activo: true },
  { fc_nombre: "Engorda",               fc_ruta: "/engorda",               fb_activo: true },
  { fc_nombre: "Clientes",              fc_ruta: "/clientes",              fb_activo: true },
  { fc_nombre: "Alimentos",             fc_ruta: "/alimentos",             fb_activo: true },
  { fc_nombre: "Lista de Espera",       fc_ruta: "/lista-espera",          fb_activo: true },
  { fc_nombre: "Equipos",               fc_ruta: "/equipos",               fb_activo: true },
  { fc_nombre: "Expedientes",           fc_ruta: "/expedientes",           fb_activo: false },
  { fc_nombre: "Nomina",                fc_ruta: "/nomina",                fb_activo: true },
  { fc_nombre: "Vacaciones",            fc_ruta: "/vacaciones",            fb_activo: true },
  { fc_nombre: "Caja de Ahorro",        fc_ruta: "/caja-ahorro",           fb_activo: true },
  { fc_nombre: "Proveedores",           fc_ruta: "/proveedores",           fb_activo: true },
  { fc_nombre: "Flujo de Caja",         fc_ruta: "/flujo-caja",            fb_activo: true },
  { fc_nombre: "Tesoreria",             fc_ruta: "/tesoreria",             fb_activo: true },
  { fc_nombre: "Cuentas",               fc_ruta: "/cuentas",               fb_activo: true },
  { fc_nombre: "Biometrias",            fc_ruta: "/biometrias",            fb_activo: true },
  { fc_nombre: "Plagas",                fc_ruta: "/plagas",                fb_activo: true },
  { fc_nombre: "Alimentacion",          fc_ruta: "/alimentacion",          fb_activo: true },
  { fc_nombre: "Insumos",               fc_ruta: "/insumos",               fb_activo: true },
  { fc_nombre: "Recepcion Insumos",     fc_ruta: "/recepcion_insumos",     fb_activo: true },
  { fc_nombre: "Visitas",               fc_ruta: "/visitas",               fb_activo: true },
  { fc_nombre: "Banos",                  fc_ruta: "/banos",                 fb_activo: true },
  { fc_nombre: "Parametros",            fc_ruta: "/parametros",            fb_activo: true },
  { fc_nombre: "Medicamentos",          fc_ruta: "/medicamentos",          fb_activo: true },
  { fc_nombre: "Recambios",             fc_ruta: "/recambios",             fb_activo: true },
  { fc_nombre: "Inventario",            fc_ruta: "/inventario",            fb_activo: true },
  { fc_nombre: "Catalogo Estados",      fc_ruta: "/estados",               fb_activo: false },
  { fc_nombre: "Puestos",               fc_ruta: "/puestos",               fb_activo: true },
  { fc_nombre: "Empleados",             fc_ruta: "/empleados",             fb_activo: true },
  { fc_nombre: "Departamentos",         fc_ruta: "/departamentos",         fb_activo: true },
  { fc_nombre: "Modulos",               fc_ruta: "/modulos",               fb_activo: true },
  { fc_nombre: "Roles Modulos",         fc_ruta: "/roles-modulos",         fb_activo: true },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Limpiar tablas en orden correcto (FK: roles_modulos depende de modulos)
    await client.query("TRUNCATE TABLE seguridad.roles_modulos");
    await client.query("TRUNCATE TABLE seguridad.modulos RESTART IDENTITY CASCADE");

    console.log("Tablas limpiadas.");

    // Insertar modulos
    for (const modulo of MODULOS) {
      await client.query(
        `INSERT INTO seguridad.modulos (fc_nombre, fc_ruta, fb_activo)
         VALUES ($1, $2, $3)
         ON CONFLICT (fc_ruta) DO UPDATE
         SET fc_nombre = EXCLUDED.fc_nombre,
             fb_activo = EXCLUDED.fb_activo`,
        [modulo.fc_nombre, modulo.fc_ruta, modulo.fb_activo]
      );
    }

    console.log(`${MODULOS.length} modulos insertados.`);

    // Asignar todos los modulos a roles root
    const { rowCount } = await client.query(
      `INSERT INTO seguridad.roles_modulos (fi_rol_id, fi_modulo_id)
       SELECT r.fi_rol_id, m.fi_modulo_id
       FROM public.roles r
       CROSS JOIN seguridad.modulos m
       WHERE r.fb_es_root = true
       ON CONFLICT (fi_rol_id, fi_modulo_id) DO NOTHING`
    );

    console.log(`${rowCount} asignaciones de modulos a roles root completadas.`);

    await client.query("COMMIT");
    console.log("Seed completado exitosamente.");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error durante el seed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
