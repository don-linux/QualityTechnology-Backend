/**
 * Ciclo de vida y agregaciones de Ciclos de Engorda.
 */

import { cantidadVigenteEnPileta } from "./inventarioVigente.js";
import { indiceCrecimientoSGR } from "./cicloEngordaCalculos.js";

function parseCantidadKg(texto) {
  if (texto == null || texto === "") return null;
  const s = String(texto).replace(/,/g, ".");
  const match = s.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function diasEntre(inicio, fin) {
  const a = new Date(inicio);
  const b = new Date(fin);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diff = Math.round((b - a) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export async function obtenerCicloActivo(tx, piletaId) {
  const pid = Number(piletaId);
  if (!Number.isInteger(pid) || pid <= 0) return null;
  return tx.cicloEngorda.findFirst({
    where: { pileta_id: pid, estado: "activo" },
    orderBy: { id: "desc" },
  });
}

export async function abrirCicloSiCorresponde(
  tx,
  { piletaId, siembraIngresoId, cantidadInicial, lote, fechaInicio },
) {
  const activo = await obtenerCicloActivo(tx, piletaId);
  if (activo) return activo.id;

  let fecha = fechaInicio ? new Date(fechaInicio) : new Date();
  if (siembraIngresoId) {
    const s = await tx.siembra.findUnique({
      where: { id: siembraIngresoId },
      select: { fecha: true },
    });
    if (s?.fecha) fecha = s.fecha;
  }

  const ciclo = await tx.cicloEngorda.create({
    data: {
      pileta_id: Number(piletaId),
      siembra_ingreso_id: siembraIngresoId ?? null,
      fecha_inicio: fecha,
      cantidad_inicial: Math.max(0, Math.trunc(Number(cantidadInicial) || 0)),
      lote: lote ?? null,
      estado: "activo",
    },
  });
  return ciclo.id;
}

export async function cerrarCicloPorCantidadCero(tx, piletaId) {
  const activo = await obtenerCicloActivo(tx, piletaId);
  if (!activo) return null;
  await tx.cicloEngorda.update({
    where: { id: activo.id },
    data: { estado: "cerrado", fecha_cierre: new Date() },
  });
  return activo.id;
}

export async function cerrarCicloPorVenta(tx, { piletaId, ventaId }) {
  const activo = await obtenerCicloActivo(tx, piletaId);
  if (!activo) return null;

  let fechaCierre = new Date();
  if (ventaId) {
    const venta = await tx.venta.findUnique({
      where: { id: Number(ventaId) },
      select: { fecha: true },
    });
    if (venta?.fecha) fechaCierre = venta.fecha;
  }

  await tx.cicloEngorda.update({
    where: { id: activo.id },
    data: { estado: "vendido", fecha_cierre: fechaCierre },
  });
  return activo.id;
}

/**
 * Abre o mantiene ciclo activo y vincula el registro engorda recién creado.
 */
export async function sincronizarCicloTrasMovimientoEngorda(
  tx,
  { piletaId, cantidadNueva, siembraIngresoId, lote, engordaId },
) {
  const pid = Number(piletaId);
  const qty = Math.floor(Number(cantidadNueva) || 0);

  if (qty <= 0) {
    await cerrarCicloPorCantidadCero(tx, pid);
    return null;
  }

  const cicloId = await abrirCicloSiCorresponde(tx, {
    piletaId: pid,
    siembraIngresoId,
    cantidadInicial: qty,
    lote,
  });

  if (engordaId && cicloId) {
    await tx.engorda.update({
      where: { id: engordaId },
      data: { ciclo_id: cicloId },
    });
  }

  return cicloId;
}

export async function sincronizarCicloTrasEgresoEngorda(tx, piletaId, { porVenta = false, ventaId } = {}) {
  const pid = Number(piletaId);
  const stock = await cantidadVigenteEnPileta(tx, pid, "engorda");
  if (stock > 0) return null;

  if (porVenta) {
    return cerrarCicloPorVenta(tx, { piletaId: pid, ventaId });
  }
  return cerrarCicloPorCantidadCero(tx, pid);
}

const cicloIncludeList = {
  pileta: { include: { ubicacion: true } },
  siembra_ingreso: true,
};

export async function listarCiclosEngorda(prisma, { granja, estado, piletaWhere } = {}) {
  const where = {};
  if (estado) where.estado = String(estado);
  if (piletaWhere) {
    where.pileta = piletaWhere;
  } else if (granja) {
    where.pileta = { ubicacion: { nombre: String(granja) } };
  }

  return prisma.cicloEngorda.findMany({
    where,
    include: cicloIncludeList,
    orderBy: [{ fecha_inicio: "desc" }, { id: "desc" }],
  });
}

export async function obtenerDashboardCiclo(prisma, cicloId) {
  const ciclo = await prisma.cicloEngorda.findUnique({
    where: { id: Number(cicloId) },
    include: {
      ...cicloIncludeList,
      engordas: {
        include: { historial_peso: true, observacion: true },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!ciclo) return null;

  const fechaFin = ciclo.fecha_cierre ?? new Date();

  const biometrias = await prisma.biometria.findMany({
    where: {
      pileta_id: ciclo.pileta_id,
      fecha: { gte: ciclo.fecha_inicio, lte: fechaFin },
    },
    orderBy: { fecha: "asc" },
  });

  const insumos = await prisma.insumo.findMany({
    where: {
      pileta_id: ciclo.pileta_id,
      tipo_movimiento: "egreso",
      fecha: { gte: ciclo.fecha_inicio, lte: fechaFin },
    },
    include: { observacion: true },
    orderBy: [{ fecha: "desc" }, { id: "desc" }],
  });

  const consumoReal = insumos.map((row) => ({
    fi_id: row.id,
    fd_fecha: row.fecha,
    fc_descripcion: row.descripcion,
    fc_cantidad_udm: row.cantidadUdm,
    cantidad_kg: parseCantidadKg(row.cantidadUdm),
    fc_num_lote: row.numero_lote,
    fc_observaciones: row.observacion?.comentario ?? null,
  }));

  const consumoTotalKg = consumoReal.reduce(
    (sum, r) => sum + (r.cantidad_kg ?? 0),
    0,
  );

  const engordasSerie = ciclo.engordas.map((e) => ({
    id: e.id,
    cantidad_total: e.cantidad_total,
    peso_gramos: e.historial_peso?.peso != null ? Number(e.historial_peso.peso) : null,
    fecha: e.historial_peso?.fecha ?? null,
  }));

  const pesos = engordasSerie
    .map((e) => e.peso_gramos)
    .filter((p) => p != null && p > 0);
  const pesoInicial = pesos[0] ?? null;
  const pesoFinal = pesos.length ? pesos[pesos.length - 1] : null;
  const duracionDias = diasEntre(ciclo.fecha_inicio, fechaFin);

  const indiceCrecimiento =
    pesoInicial && pesoFinal && duracionDias > 0
      ? indiceCrecimientoSGR(pesoInicial, pesoFinal, duracionDias)
      : null;

  const ultimoEngorda = ciclo.engordas[ciclo.engordas.length - 1];
  const cantidadActual = ultimoEngorda?.cantidad_total ?? 0;

  return {
    ciclo,
    biometrias: biometrias.map((b) => ({
      id: b.id,
      fecha: b.fecha,
      peso_promedio: b.pesoPromedio != null ? Number(b.pesoPromedio) : null,
      peso_total_gramos: b.pesoTotalGramos != null ? Number(b.pesoTotalGramos) : null,
      organismos_muestreados: b.organismosMuestreados,
      encargado: b.encargado,
    })),
    serie_engorda: engordasSerie,
    consumo_real: consumoReal,
    kpis: {
      fecha_inicio: ciclo.fecha_inicio,
      fecha_cierre: ciclo.fecha_cierre,
      duracion_dias: duracionDias,
      cantidad_inicial: ciclo.cantidad_inicial,
      cantidad_actual: cantidadActual,
      consumo_real_kg: Math.round(consumoTotalKg * 1000) / 1000,
      peso_inicial_g: pesoInicial,
      peso_final_g: pesoFinal,
      indice_crecimiento_sgr: indiceCrecimiento,
      biometrias_registradas: biometrias.length,
    },
  };
}
