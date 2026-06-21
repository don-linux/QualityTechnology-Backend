import { crearObservacionSiHay, crearObservacionCancelacionVenta } from "./observacion.js";
import { aplicarEstadoPiletaPorCantidad } from "./reproductorInventario.js";
import { crearSiembraMovimiento, crearSiembraVenta, ETAPAS_TRAZABILIDAD } from "./siembraMovimiento.js";
import { descontarAlevinajePorEgresoHaciaEngorda } from "./alevinajeInventario.js";
import { descontarEngordaPorEgresoHaciaEngorda } from "./engordaInventario.js";
import { cantidadVigenteEnPileta } from "./inventarioVigente.js";
import { calcularDiasEnPileta } from "./eficienciaReproductivaRegistro.js";
import { resolverLoteAlevinaje } from "./alevinajeLote.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function errValidacion(message) {
  const err = new Error(message);
  err.code = "VALIDACION";
  return err;
}

/** Parsea `AAAA-MM-DD` para el campo `fecha` de siembra. */
export function parseFechaMovimiento(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") return null;

  const s = String(raw).trim();
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) throw errValidacion("fecha_movimiento inválida (use AAAA-MM-DD)");

  const d = new Date(`${match[1]}-${match[2]}-${match[3]}T12:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw errValidacion("fecha_movimiento inválida");

  const finHoy = new Date();
  finHoy.setHours(23, 59, 59, 999);
  if (d > finHoy) throw errValidacion("La fecha del movimiento no puede ser futura");

  return d;
}

async function consultarStockPiletaEtapa(tx, piletaId) {
  const pil = await obtenerPiletaEtapa(tx, piletaId);
  const stock = await cantidadVigenteEnPileta(tx, pil.id, pil.tipo);
  return { pil, stock };
}

function assertStockSuficiente(disponible, requerido, nombrePileta) {
  if (requerido > disponible) {
    throw errValidacion(
      `Stock insuficiente en '${nombrePileta}': disponible ${disponible}, solicitado ${requerido}`,
    );
  }
}

async function obtenerPiletaEtapa(tx, piletaId) {
  const id = toInt(piletaId);
  if (!id) throw errValidacion("pileta_id inválido");

  const pil = await tx.pileta.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) {
    const err = new Error("Pileta no existe");
    err.code = "PILETA_NOT_FOUND";
    throw err;
  }
  if (!ETAPAS_TRAZABILIDAD.includes(pil.tipo)) {
    const err = new Error(`La pileta '${pil.nombre}' debe ser tipo alevinaje o engorda`);
    err.code = "PILETA_TIPO_INVALIDO";
    throw err;
  }
  return pil;
}

async function descontarInventarioOrigen(
  tx,
  piletaOrigenId,
  piletaDestinoId,
  cantidad,
  tipoOrigen,
  meta = {},
) {
  const opciones = {
    piletaDestinoId,
    cantidad_total: cantidad,
    siembraOrigenId: meta.siembraOrigenId ?? null,
    observacion: meta.observacion ?? null,
    usuarioId: meta.usuarioId ?? null,
    procesoObservacion: meta.procesoObservacion ?? "trazabilidad",
    folioVenta: meta.folioVenta ?? null,
  };
  if (tipoOrigen === "alevinaje") {
    await descontarAlevinajePorEgresoHaciaEngorda(tx, piletaOrigenId, opciones);
    return;
  }
  await descontarEngordaPorEgresoHaciaEngorda(tx, piletaOrigenId, opciones);
}

async function sumarInventarioDestino(
  tx,
  {
    piletaDestinoId,
    tipoDestino,
    cantidad,
    siembraOrigenId,
    usuarioId,
    observacion,
    pesoHistorialId = null,
    lote = null,
    piletaOrigenId = null,
  },
) {
  const proceso = tipoDestino === "alevinaje" ? "alevinaje" : "engorda";
  const obsId = await crearObservacionSiHay(tx, observacion, usuarioId, {
    piletaId: piletaDestinoId,
    proceso,
  });

  if (tipoDestino === "alevinaje") {
    const loteResuelto = await resolverLoteAlevinaje(tx, {
      loteBody: lote,
      piletaId: piletaDestinoId,
      siembraOrigenId,
      piletaOrigenId,
    });
    await tx.alevinaje.create({
      data: {
        pileta_id: piletaDestinoId,
        lote: loteResuelto,
        cantidad_total: cantidad,
        siembra_origen_id: siembraOrigenId,
        peso: pesoHistorialId,
      },
    });
    await aplicarEstadoPiletaPorCantidad(tx, piletaDestinoId, cantidad);
    return;
  }

  await tx.engorda.create({
    data: {
      pileta_id: piletaDestinoId,
      cantidad_total: cantidad,
      cantidad_alimento: 0,
      observacion_id: obsId,
      siembra_origen_id: siembraOrigenId,
    },
  });
  await aplicarEstadoPiletaPorCantidad(tx, piletaDestinoId, cantidad);
}

const vigenteSelectRestauracionAlevinaje = {
  peso: true,
  biometria_id: true,
  lote: true,
};

const vigenteSelectRestauracionEngorda = {
  cantidad_alimento: true,
  peso: true,
  biometria_id: true,
  observacion_id: true,
  lote: true,
};

/**
 * Devolución por cancelación de venta: suma al stock vigente (no reemplaza).
 * Crea registro periódico nuevo, hereda peso del vigente anterior.
 */
async function restaurarInventarioPorDevolucionVenta(
  tx,
  { piletaId, tipoPileta, cantidadDevuelta, siembraOrigenId, usuarioId, folioVenta },
) {
  const pid = toInt(piletaId);
  const qty = Math.floor(Number(cantidadDevuelta) || 0);
  if (!pid || qty <= 0) return;

  const stockActual = await cantidadVigenteEnPileta(tx, pid, tipoPileta);
  const nuevaCantidad = stockActual + qty;

  const vigente =
    tipoPileta === "alevinaje"
      ? await tx.alevinaje.findFirst({
          where: { pileta_id: pid },
          orderBy: { id: "desc" },
          select: vigenteSelectRestauracionAlevinaje,
        })
      : await tx.engorda.findFirst({
          where: { pileta_id: pid },
          orderBy: { id: "desc" },
          select: vigenteSelectRestauracionEngorda,
        });

  const obsId = usuarioId
    ? await crearObservacionCancelacionVenta(
        tx,
        { folioVenta },
        usuarioId,
        { piletaId: pid, proceso: "trazabilidad" },
      )
    : null;

  const siembraId = toInt(siembraOrigenId ?? null);

  if (tipoPileta === "alevinaje") {
    await tx.alevinaje.create({
      data: {
        pileta_id: pid,
        cantidad_total: nuevaCantidad,
        peso: vigente?.peso ?? null,
        biometria_id: vigente?.biometria_id ?? null,
        siembra_origen_id: siembraId,
        lote: vigente?.lote ?? null,
      },
    });
  } else {
    await tx.engorda.create({
      data: {
        pileta_id: pid,
        cantidad_total: nuevaCantidad,
        cantidad_alimento: vigente?.cantidad_alimento ?? 0,
        peso: vigente?.peso ?? null,
        biometria_id: vigente?.biometria_id ?? null,
        observacion_id: obsId,
        siembra_origen_id: siembraId,
      },
    });
  }

  await aplicarEstadoPiletaPorCantidad(tx, pid, nuevaCantidad);
}

/** Crea siembra de devolución (externo → pileta) y restaura inventario acumulado. */
async function registrarDevolucionVentaEnPileta(
  tx,
  { piletaOrigenId, cantidad, usuarioId, folioVenta, fechaMovimiento },
) {
  const origen = toInt(piletaOrigenId);
  const cant = Math.floor(Number(cantidad) || 0);
  if (!origen || cant <= 0) return null;

  const pil = await obtenerPiletaEtapa(tx, origen);

  const siembraId = await crearSiembraMovimiento(tx, {
    piletaOrigenId: null,
    piletaDestinoId: origen,
    cantidadEntera: cant,
    usuarioId,
    fechaMovimiento,
  });
  if (!siembraId) return null;

  await restaurarInventarioPorDevolucionVenta(tx, {
    piletaId: origen,
    tipoPileta: pil.tipo,
    cantidadDevuelta: cant,
    siembraOrigenId: siembraId,
    usuarioId,
    folioVenta,
  });

  return siembraId;
}

/**
 * Traslado o ingreso externo: crea siembra y ajusta inventarios en origen/destino.
 * @returns {Promise<number>} id de siembra
 */
export async function registrarMovimientoTrazabilidad(
  tx,
  { piletaOrigenId, piletaDestinoId, cantidad, mortalidad = 0, usuarioId, observacion, fechaMovimiento },
) {
  const dest = toInt(piletaDestinoId);
  const cant = Math.floor(Number(cantidad) || 0);
  const mort = Math.max(0, Math.floor(Number(mortalidad) || 0));

  if (!dest || cant <= 0) {
    throw errValidacion("pileta_destino_id y cantidad (>0) son obligatorios");
  }
  if (mort >= cant) {
    throw errValidacion("La mortalidad debe ser menor a la cantidad movida");
  }

  const netas = cant - mort;
  const origen =
    piletaOrigenId !== undefined && piletaOrigenId !== null && piletaOrigenId !== ""
      ? toInt(piletaOrigenId)
      : null;

  if (origen !== null && origen === dest) {
    throw errValidacion("Origen y destino no pueden ser la misma pileta");
  }

  const pilDest = await obtenerPiletaEtapa(tx, dest);
  const pilOr = origen !== null ? await obtenerPiletaEtapa(tx, origen) : null;

  if (origen !== null && pilOr) {
    const { stock } = await consultarStockPiletaEtapa(tx, origen);
    assertStockSuficiente(stock, cant, pilOr.nombre);
  }

  const siembraId = await crearSiembraMovimiento(tx, {
    piletaOrigenId: origen,
    piletaDestinoId: dest,
    cantidadEntera: cant,
    usuarioId,
    fechaMovimiento,
  });

  if (!siembraId) {
    const err = new Error("No se pudo crear el movimiento de siembra");
    err.code = "SIEMBRA_FAIL";
    throw err;
  }

  if (mort > 0) {
    await tx.siembra.update({
      where: { id: siembraId },
      data: { mortalidad: mort },
    });
  }

  if (origen !== null && pilOr) {
    await descontarInventarioOrigen(tx, origen, dest, cant, pilOr.tipo, {
      siembraOrigenId: siembraId,
      observacion,
      usuarioId,
    });
  }

  if (netas > 0) {
    await sumarInventarioDestino(tx, {
      piletaDestinoId: dest,
      tipoDestino: pilDest.tipo,
      cantidad: netas,
      siembraOrigenId: siembraId,
      usuarioId,
      observacion,
      piletaOrigenId: origen,
    });
  }

  return siembraId;
}

async function obtenerPiletaPorTipo(tx, piletaId, tipoEsperado, rol) {
  const id = toInt(piletaId);
  if (!id) throw errValidacion(`pileta_${rol}_id es obligatorio`);

  const pil = await tx.pileta.findUnique({
    where: { id },
    select: { id: true, nombre: true, tipo: true },
  });
  if (!pil) {
    const err = new Error(`Pileta de ${rol} no encontrada`);
    err.code = "PILETA_NOT_FOUND";
    throw err;
  }
  if (pil.tipo !== tipoEsperado) {
    const err = new Error(
      `La pileta de ${rol} '${pil.nombre}' debe ser de etapa ${tipoEsperado}, no '${pil.tipo}'`,
    );
    err.code = "PILETA_TIPO_INVALIDO";
    throw err;
  }
  return pil;
}

/**
 * Traslado incubación → alevinaje: gradúa el lote de incubación a inventario contable.
 * La incubación no maneja cantidad numérica (solo ocupada/egresada), por lo que la cantidad
 * de alevines la declara el usuario. Libera la pileta de incubación (marca `fecha_egreso`)
 * y crea el inventario inicial en la pileta de alevinaje destino con su peso biométrico.
 * @returns {Promise<number>} id de siembra
 */
export async function registrarMovimientoEficienciaReproductivaAAlevinaje(
  tx,
  { piletaOrigenId, piletaDestinoId, cantidad, usuarioId, observacion, fechaMovimiento, pesoHistorialId = null },
) {
  const origen = toInt(piletaOrigenId);
  const dest = toInt(piletaDestinoId);
  const cant = Math.floor(Number(cantidad) || 0);

  if (!origen || !dest) {
    throw errValidacion(
      "pileta_origen_id (incubación) y pileta_destino_id (alevinaje) son obligatorios",
    );
  }
  if (origen === dest) {
    throw errValidacion("Origen y destino no pueden ser la misma pileta");
  }
  if (cant <= 0) {
    throw errValidacion("La cantidad de alevines debe ser mayor a cero");
  }

  const pilOr = await obtenerPiletaPorTipo(tx, origen, "incubacion", "origen");
  await obtenerPiletaPorTipo(tx, dest, "alevinaje", "destino");

  const inc = await tx.eficiencia_reproductiva.findFirst({
    where: { pileta_id: origen, fecha_egreso: null },
    orderBy: { id: "desc" },
    select: { id: true, fecha_ingreso: true, lote: true, codigo: true },
  });
  if (!inc) {
    throw errValidacion(
      `La pileta de incubación '${pilOr.nombre}' no tiene un lote activo para trasladar`,
    );
  }

  const siembraId = await crearSiembraMovimiento(tx, {
    piletaOrigenId: origen,
    piletaDestinoId: dest,
    cantidadEntera: cant,
    usuarioId,
    fechaMovimiento,
  });
  if (!siembraId) {
    const err = new Error("No se pudo crear el movimiento de siembra");
    err.code = "SIEMBRA_FAIL";
    throw err;
  }

  const fechaEgreso = fechaMovimiento ?? new Date();
  await tx.eficiencia_reproductiva.update({
    where: { id: inc.id },
    data: {
      fecha_egreso: fechaEgreso,
      dias_en_pileta: calcularDiasEnPileta(inc.fecha_ingreso, fechaEgreso),
    },
  });
  await aplicarEstadoPiletaPorCantidad(tx, origen, 0);

  const partes = [];
  if (inc.codigo) partes.push(`Evento: ${inc.codigo}`);
  if (inc.lote) partes.push(`Lote: ${inc.lote}`);
  const obsBase = observacion?.trim?.() ? String(observacion).trim() : "";
  const obsCompleta = [obsBase, ...partes].filter(Boolean).join(" · ") || null;

  await sumarInventarioDestino(tx, {
    piletaDestinoId: dest,
    tipoDestino: "alevinaje",
    cantidad: cant,
    siembraOrigenId: siembraId,
    usuarioId,
    observacion: obsCompleta,
    pesoHistorialId,
    lote: inc.lote ?? null,
    piletaOrigenId: origen,
  });

  return siembraId;
}

/**
 * Baja por mortalidad en una pileta (sin traslado a destino).
 * @returns {Promise<number>} id de siembra
 */
export async function registrarMortalidadTrazabilidad(
  tx,
  { piletaId, cantidad, usuarioId, observacion, fechaMovimiento },
) {
  const id = toInt(piletaId);
  const cant = Math.floor(Number(cantidad) || 0);
  if (!id || cant <= 0) {
    throw errValidacion("pileta_id y cantidad (>0) son obligatorios para mortalidad");
  }

  const { pil, stock } = await consultarStockPiletaEtapa(tx, id);
  assertStockSuficiente(stock, cant, pil.nombre);

  const data = {
    pileta_origen: id,
    pileta_destino: id,
    cantidad: BigInt(cant),
    mortalidad: cant,
    usuario_id: usuarioId,
  };
  if (fechaMovimiento) data.fecha = fechaMovimiento;

  const siembra = await tx.siembra.create({ data });

  await descontarInventarioOrigen(tx, id, null, cant, pil.tipo, {
    siembraOrigenId: siembra.id,
    observacion,
    usuarioId,
  });

  return siembra.id;
}

/** Tipos de venta que egresan inventario de piletas. */
export const TIPOS_VENTA_TRAZABLES = {
  ALEVINES: "alevinaje",
  ALEVIN: "alevinaje",
  MOJARRA_KG: "engorda",
  KG: "engorda",
};

export function etapaRequeridaParaTipoVenta(tipoVenta) {
  const t = String(tipoVenta ?? "")
    .trim()
    .toUpperCase();
  return TIPOS_VENTA_TRAZABLES[t] ?? null;
}

export function ventaRequiereTrazabilidad(tipoVenta) {
  return etapaRequeridaParaTipoVenta(tipoVenta) !== null;
}

/**
 * Egreso por venta: crea siembra (origen pileta → venta) y descuenta inventario.
 * @returns {Promise<number>} id de siembra
 */
export async function registrarVentaTrazabilidad(
  tx,
  { piletaOrigenId, cantidad, ventaId, usuarioId, observacion, fechaMovimiento, tipoVenta },
) {
  const origen = toInt(piletaOrigenId);
  const cant = Math.floor(Number(cantidad) || 0);
  const venta = toInt(ventaId);
  if (!origen || cant <= 0 || !venta) {
    throw errValidacion("pileta_origen_id, cantidad (>0) y venta_id son obligatorios para venta");
  }

  const etapaEsperada = etapaRequeridaParaTipoVenta(tipoVenta);
  const pilOr = await obtenerPiletaEtapa(tx, origen);
  if (etapaEsperada && pilOr.tipo !== etapaEsperada) {
    throw errValidacion(
      `Para venta tipo '${tipoVenta}' la pileta debe ser de etapa ${etapaEsperada}, no '${pilOr.tipo}'`,
    );
  }

  const { stock } = await consultarStockPiletaEtapa(tx, origen);
  assertStockSuficiente(stock, cant, pilOr.nombre);

  const siembraId = await crearSiembraVenta(tx, {
    piletaOrigenId: origen,
    cantidadEntera: cant,
    ventaId: venta,
    usuarioId,
    fechaMovimiento,
  });

  if (!siembraId) {
    const err = new Error("No se pudo crear el movimiento de venta en trazabilidad");
    err.code = "SIEMBRA_FAIL";
    throw err;
  }

  const ventaRow = await tx.venta.findUnique({
    where: { id: venta },
    select: { folio: true },
  });

  await descontarInventarioOrigen(tx, origen, null, cant, pilOr.tipo, {
    siembraOrigenId: siembraId,
    observacion,
    usuarioId,
    procesoObservacion: "venta",
    folioVenta: ventaRow?.folio ?? String(venta),
  });

  return siembraId;
}

/**
 * Crea venta + egreso en trazabilidad a partir de un pedido en lista de espera.
 * @returns {Promise<{ siembraId: number, ventaId: number }>}
 */
export async function registrarVentaDesdeListaEspera(
  tx,
  { listaEsperaId, piletaOrigenId, usuarioId, observacion, fechaMovimiento },
) {
  const listaId = toInt(listaEsperaId);
  if (!listaId) throw errValidacion("lista_espera_id es obligatorio para venta");

  const lista = await tx.listaEspera.findUnique({
    where: { id: listaId },
    include: { pileta_origen: { select: { id: true, nombre: true, tipo: true } } },
  });
  if (!lista) throw errValidacion("Pedido de lista de espera no encontrado");
  if (lista.venta_id) throw errValidacion("Este pedido ya tiene una venta registrada");
  if (!ventaRequiereTrazabilidad(lista.tipo_venta)) {
    throw errValidacion("Este tipo de venta no requiere trazabilidad");
  }

  const origen = toInt(piletaOrigenId) ?? lista.pileta_origen_id;
  if (!origen) {
    throw errValidacion("pileta_origen_id es obligatorio para ventas de alevines o mojarra");
  }

  const cantidad = Math.trunc(Number(lista.cantidad_peces) || 0);
  if (cantidad <= 0) throw errValidacion("El pedido no tiene cantidad válida");

  const precio = Number(lista.precio_unitario) || 0;
  const total = cantidad * precio;

  const venta = await tx.venta.create({
    data: {
      folio: `PE-${lista.id}`,
      fecha: lista.fecha_entrega ?? new Date(),
      cliente_nombre: lista.cliente_nombre,
      tipoVenta: lista.tipo_venta,
      cantidad,
      precio_unitario: precio,
      montoTotal: total,
      monto_abonado: 0,
      estadoPago: "ADEUDO",
      empresa: lista.granja ?? "QUALITY",
      vendedor_nombre: lista.encargado_venta ?? null,
      usuario_id: usuarioId,
    },
  });

  const siembraId = await registrarVentaTrazabilidad(tx, {
    piletaOrigenId: origen,
    cantidad,
    ventaId: venta.id,
    usuarioId,
    tipoVenta: lista.tipo_venta,
    observacion: observacion ?? lista.notas,
    fechaMovimiento: fechaMovimiento ?? lista.fecha_entrega ?? new Date(),
  });

  await tx.listaEspera.update({
    where: { id: lista.id },
    data: { venta_id: venta.id },
  });

  return { siembraId, ventaId: venta.id };
}

/**
 * Cancela una venta trazable: registra un ingreso de devolución en trazabilidad
 * y restaura inventario, sin eliminar el movimiento de venta original.
 * @returns {Promise<number|null>} id del nuevo movimiento de siembra
 */
export async function cancelarVentaTrazabilidad(tx, ventaId, usuarioId, fallback = {}) {
  const venta = toInt(ventaId);
  const uid = toInt(usuarioId);
  if (!venta || !uid) return null;

  const ventaRow = await tx.venta.findUnique({
    where: { id: venta },
    select: { id: true, folio: true, cantidad: true },
  });
  if (!ventaRow) return null;

  const folioVenta = ventaRow.folio ?? String(ventaRow.id);

  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);

  const siembras = await tx.siembra.findMany({
    where: { venta_id: venta },
    select: { id: true, pileta_origen: true, cantidad: true },
    orderBy: { id: "asc" },
  });

  let nuevoMovimientoId = null;

  if (siembras.length > 0) {
    for (const s of siembras) {
      const origen = s.pileta_origen;
      const cant =
        typeof s.cantidad === "bigint" ? Number(s.cantidad) : Number(s.cantidad ?? 0);
      if (!origen || cant <= 0) continue;

      nuevoMovimientoId = await registrarDevolucionVentaEnPileta(tx, {
        piletaOrigenId: origen,
        cantidad: cant,
        usuarioId: uid,
        folioVenta,
        fechaMovimiento: hoy,
      });
    }
    return nuevoMovimientoId;
  }

  const origenFallback = toInt(fallback.piletaOrigenId);
  const cantFallback = Math.floor(
    Number(fallback.cantidad ?? ventaRow.cantidad ?? 0) || 0,
  );
  if (
    !origenFallback ||
    cantFallback <= 0 ||
    !ventaRequiereTrazabilidad(fallback.tipoVenta)
  ) {
    return null;
  }

  return registrarDevolucionVentaEnPileta(tx, {
    piletaOrigenId: origenFallback,
    cantidad: cantFallback,
    usuarioId: uid,
    folioVenta,
    fechaMovimiento: hoy,
  });
}
