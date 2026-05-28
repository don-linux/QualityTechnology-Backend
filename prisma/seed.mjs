import prisma from "../src/prisma.js";

const MODULOS = [
  ["Dashboard", "/", true],
  ["Operaciones", "/operaciones", true],
  ["Inventarios", "/inventarios", true],
  ["Finanzas", "/finanzas", true],
  ["RRHH", "/rrhh", true],
  ["Catálogos", "/catalogos", true],
  ["Seguridad", "/seguridad", true],
  ["Roles", "/roles", true],
  ["Usuarios", "/usuarios", true],
  ["Piletas", "/piletas", true],
  ["Reproductores", "/reproductores", true],
  ["Engorda", "/engorda", true],
  ["Clientes", "/clientes", true],
  ["Ventas", "/ventas", true],
  ["Alimentos", "/alimentos", true],
  ["Lista de Espera", "/lista-espera", true],
  ["Equipos", "/equipos", true],
  ["Nomina", "/nomina", true],
  ["Vacaciones", "/vacaciones", true],
  ["Caja de Ahorro", "/caja-ahorro", true],
  ["Proveedores", "/proveedores", true],
  ["Flujo de Caja", "/flujo-caja", true],
  ["Tesoreria", "/tesoreria", true],
  ["Cuentas", "/cuentas", true],
  ["Biometrias", "/biometrias", true],
  ["Plagas", "/plagas", true],
  ["Alimentacion", "/alimentacion", true],
  ["Insumos", "/insumos", true],
  ["Recepcion Insumos", "/recepcion_insumos", true],
  ["Visitas", "/visitas", true],
  ["Banos", "/banos", true],
  ["Parametros", "/parametros", true],
  ["Medicamentos", "/medicamentos", true],
  ["Recambios", "/recambios", true],
  ["Inventario", "/inventario", true],
  ["Expedientes", "/expedientes", false],
  ["Puestos", "/puestos", true],
  ["Empleados", "/empleados", true],
  ["Departamentos", "/departamentos", true],
  ["Modulos", "/modulos", true],
  ["Roles Modulos", "/roles-modulos", true],
  ["Unidades de Negocio", "/unidades-negocio", true],
  ["Ubicaciones", "/ubicaciones", true],
  ["Estados de Conservacion", "/estados-conservacion", true],
  ["Tipos Instancia Pileta", "/tipos-instancia-pileta", true],
];

const ADMIN_PASSWORD_HASH =
  "$2b$10$MAj2BLZF7j2s2Ors05KVfeASNl1m7IXUhnfzjzxe8MOJpj/KgYXP.";

function syncSequence(table, column) {
  return prisma.$executeRawUnsafe(
    `SELECT setval(
      pg_get_serial_sequence('"public"."${table}"', '${column}'),
      GREATEST(COALESCE((SELECT MAX("${column}") FROM "public"."${table}"), 0), 1)
    )`
  );
}

async function main() {
  await prisma.ubicacion.createMany({
    data: [
      {
        nombre: "Medellin",
        direccion: "Granja acuicola ubicada en Medellin",
      },
      {
        nombre: "La Ceiba",
        direccion: "Granja acuicola ubicada en La Ceiba",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.$executeRaw`
    INSERT INTO public.roles (id, nombre, es_root, created_at, updated_at)
    VALUES (1, 'Administrador', true, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      es_root = EXCLUDED.es_root,
      updated_at = NOW();
  `;

  await prisma.$executeRaw`
    INSERT INTO public.usuarios (nombre, password, rol_id, esta_activo, created_at, updated_at)
    VALUES (${"admin"}, ${ADMIN_PASSWORD_HASH}, 1, true, NOW(), NOW())
    ON CONFLICT (nombre) DO NOTHING;
  `;

  for (const [nombre, ruta, esta_activo] of MODULOS) {
    await prisma.modulo.upsert({
      where: { ruta },
      create: { nombre, ruta, esta_activo },
      update: { nombre, esta_activo },
    });
  }

  await prisma.$executeRaw`
    INSERT INTO public.roles_modulos (rol_id, modulo_id)
    SELECT r.id, m.id
    FROM public.roles r
    CROSS JOIN public.modulos m
    WHERE r.es_root = true
    ON CONFLICT (rol_id, modulo_id) DO NOTHING;
  `;

  await prisma.puesto.createMany({
    data: [
      { nombre: "Director General" },
      { nombre: "Director de Administracion, Finanzas y RRHH" },
      { nombre: "Encargado de Marketing" },
      { nombre: "Encargado de Contabilidad" },
      { nombre: "Encargado Legal" },
      { nombre: "Encargado de Laboratorio" },
      { nombre: "Encargado de Bienestar Animal y Control de Patologias" },
      { nombre: "Auxiliar de Laboratorio" },
      { nombre: "Encargado de Taller" },
      { nombre: "Auxiliar de Taller" },
      { nombre: "Becario" },
    ],
    skipDuplicates: true,
  });

  await prisma.departamento.createMany({
    data: [
      { nombre: "Direccion General" },
      { nombre: "Administracion, Finanzas y RRHH" },
      { nombre: "Marketing" },
      { nombre: "Contabilidad" },
      { nombre: "Legal" },
      { nombre: "Laboratorio" },
      { nombre: "Bienestar Animal y Control de Patologias" },
      { nombre: "Taller" },
    ],
    skipDuplicates: true,
  });

  await prisma.unidadNegocio.createMany({
    data: [
      { nombre: "Granja Acuicola Medellin" },
      { nombre: "Granja Acuicola La Ceiba" },
      { nombre: "Quality Technology" },
    ],
    skipDuplicates: true,
  });

  // Unifica nomenclatura antigua "Granja Acuicola Ceiba" con ubicación/catalogo La Ceiba
  try {
    const dup = await prisma.unidadNegocio.findUnique({
      where: { nombre: "Granja Acuicola Ceiba" },
    });
    const canon = await prisma.unidadNegocio.findUnique({
      where: { nombre: "Granja Acuicola La Ceiba" },
    });
    if (dup && !canon) {
      await prisma.unidadNegocio.update({
        where: { id: dup.id },
        data: { nombre: "Granja Acuicola La Ceiba" },
      });
    }
  } catch (e) {
    console.warn("[seed] Unificación Ceiba/La Ceiba:", e.message || e);
  }

  await prisma.tipoDocumento.createMany({
    data: [
      { nombre: "Credencial" },
      { nombre: "Fotografia" },
      { nombre: "Acta de Nacimiento" },
      { nombre: "INE" },
      { nombre: "Licencia de Conducir" },
      { nombre: "Comprobante de Domicilio" },
      { nombre: "RFC" },
      { nombre: "CURP" },
      { nombre: "Comprobante de Estudios" },
      { nombre: "CV" },
      { nombre: "Carta de Recomendacion" },
      { nombre: "Acuerdo de Confidencialidad" },
      { nombre: "Codigo de Etica" },
      { nombre: "Codigo de Conducta" },
      { nombre: "Solicitud de Empleo" },
    ],
    skipDuplicates: true,
  });

  await syncSequence("roles", "id");
  await syncSequence("usuarios", "id");
  await syncSequence("modulos", "id");
  await syncSequence("puestos", "id");
  await syncSequence("departamentos", "id");
  await syncSequence("tipos_documento", "id");
  await syncSequence("unidades_negocio", "id");
  await syncSequence("actas_administrativas", "id");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
