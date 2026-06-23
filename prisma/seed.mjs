import prisma from "../src/prisma.js";

const MODULOS = [
  ["Dashboard", "/", true],
  ["Bitacoras", "/bitacoras", true],
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
  ["Control de Fauna Nociva", "/control-fauna-nociva", true],
  ["Alimentacion", "/alimentacion", true],
  ["Recepcion Insumos", "/recepcion_insumos", true],
  ["Control de Visitas", "/control-visitas", true],
  ["Control de Limpieza", "/control-limpieza", true],
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
  ["Tipos de pileta", "/tipos-pileta", true],
  ["Areas de instalacion", "/areas-instalacion", true],
  ["Faunas detectadas", "/faunas-detectadas", true],
  ["Evidencias fauna", "/evidencias-fauna", true],
  ["Estados de trampa", "/estados-trampa", true],
  ["Acciones correctivas", "/acciones-correctivas", true],
];

const ADMIN_PASSWORD_HASH =
  "$2b$10$MAj2BLZF7j2s2Ors05KVfeASNl1m7IXUhnfzjzxe8MOJpj/KgYXP.";

function syncSequence(table, column, schema = "public") {
  return prisma.$executeRawUnsafe(
    `SELECT setval(
      pg_get_serial_sequence('"${schema}"."${table}"', '${column}'),
      GREATEST(COALESCE((SELECT MAX("${column}") FROM "${schema}"."${table}"), 0), 1)
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

  await prisma.areaInstalacion.createMany({
    data: [
      { nombre: "Almacen de alimentos" },
      { nombre: "Almacen de herramientas" },
      { nombre: "Area de embolsado" },
    ],
    skipDuplicates: true,
  });

  await prisma.faunaDetectada.createMany({
    data: [
      { nombre: "Roedor" },
      { nombre: "Ave" },
      { nombre: "No aplica" },
    ],
    skipDuplicates: true,
  });

  await prisma.evidenciaFauna.createMany({
    data: [
      { nombre: "Animal vivo" },
      { nombre: "Animal muerto" },
      { nombre: "Excretas" },
      { nombre: "Alimento roido" },
      { nombre: "Daño en malla" },
    ],
    skipDuplicates: true,
  });

  await prisma.estadoTrampa.createMany({
    data: [
      { nombre: "Activa" },
      { nombre: "Inactiva" },
      { nombre: "Con captura" },
      { nombre: "Sin cebo" },
      { nombre: "Fuera de lugar" },
      { nombre: "Dañada" },
      { nombre: "Requiere mantenimiento" },
    ],
    skipDuplicates: true,
  });

  await prisma.accionCorrectiva.createMany({
    data: [
      { nombre: "Retiro de fauna" },
      { nombre: "Mantenimiento de trampa" },
      { nombre: "Limpieza del Area" },
      { nombre: "Cambio de cebo" },
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
  await syncSequence("areas_instalacion", "id", "catalogos");
  await syncSequence("faunas_detectadas", "id", "catalogos");
  await syncSequence("evidencias_fauna", "id", "catalogos");
  await syncSequence("estados_trampa", "id", "catalogos");
  await syncSequence("acciones_correctivas", "id", "catalogos");
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
