import prisma from "../prisma.js";

/**
 * Lista empleados activos con el mismo contrato que el frontend esperaba (fi_empleado_id, fc_nombre_completo).
 */
export async function listarEmpleadosActivosBitacora() {
  const rows = await prisma.empleado.findMany({
    where: { activo: true },
    select: {
      empleadoId: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
    orderBy: [{ nombre: "asc" }, { apellidoPaterno: "asc" }],
  });
  return rows.map((e) => ({
    fi_empleado_id: e.empleadoId,
    fc_nombre_completo: [e.nombre, e.apellidoPaterno, e.apellidoMaterno].filter(Boolean).join(" "),
  }));
}

/**
 * Persiste texto / responsable en `observaciones`. Si ambos quedan vacíos devuelve null (desvincular).
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 */
export async function guardarObservacion(tx, { observacionIdExistente, texto, responsable, usuarioId }) {
  const obsTrim =
    texto != null && String(texto).trim() ? String(texto).slice(0, 500) : null;
  const respTrim =
    responsable != null && String(responsable).trim() ? String(responsable).slice(0, 100) : null;

  if (!obsTrim && !respTrim) {
    return null;
  }

  if (observacionIdExistente) {
    await tx.observacion.update({
      where: { observacionId: observacionIdExistente },
      data: {
        observacion: obsTrim,
        responsable: respTrim,
        ...(usuarioId !== undefined ? { usuarioId } : {}),
      },
    });
    return observacionIdExistente;
  }

  const row = await tx.observacion.create({
    data: {
      observacion: obsTrim,
      responsable: respTrim,
      usuarioId: usuarioId ?? null,
    },
  });
  return row.observacionId;
}

export async function actualizarFechaBiometriaPorInstalacion(instalacionId, fecha) {
  const id = Number(instalacionId);
  if (!Number.isFinite(id)) return;

  const inst = await prisma.instalacion.findUnique({
    where: { instalacionId: id },
    select: { tipoInstalacion: true },
  });
  if (!inst) return;

  const fechaDate = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(fechaDate.getTime())) return;

  if (inst.tipoInstalacion === "Alevinaje") {
    await prisma.pileta.updateMany({
      where: { instalacionId: id },
      data: { fechaUltimaBiometria: fechaDate },
    });
  } else if (inst.tipoInstalacion === "Engorda") {
    await prisma.engorda.updateMany({
      where: { instalacionId: id },
      data: { fechaBiometria: fechaDate },
    });
  } else if (inst.tipoInstalacion === "Reproductores") {
    await prisma.reproductor.updateMany({
      where: { instalacionId: id },
      data: { fechaBiometria: fechaDate },
    });
  }
}

export async function obtenerInfoBiometriaPorInstalacion(instalacionIdRaw) {
  const instalacionId = Number(instalacionIdRaw);
  if (!Number.isFinite(instalacionId)) return null;

  const inst = await prisma.instalacion.findUnique({
    where: { instalacionId },
    select: { tipoInstalacion: true },
  });
  if (!inst) return null;

  const tipo = inst.tipoInstalacion;

  if (tipo === "Reproductores") {
    const r = await prisma.reproductor.findFirst({
      where: { instalacionId },
      select: {
        cantidad: true,
        talla: true,
        fechaSiembra: true,
        fechaBiometria: true,
      },
    });
    if (!r) return { tipo, fi_lote_id: null };
    return {
      tipo,
      fi_lote_id: null,
      cantidad: r.cantidad,
      talla: r.talla != null ? Number(r.talla) : null,
      fecha_siembra: r.fechaSiembra,
      fecha_biometria: r.fechaBiometria,
    };
  }

  if (tipo === "Alevinaje") {
    const p = await prisma.pileta.findFirst({
      where: { instalacionId },
      include: { lote: true },
    });
    if (!p) return { tipo, fi_lote_id: null };
    return {
      tipo,
      fi_lote_id: p.loteId,
      no_lote: p.lote?.noLote ?? null,
      cantidad: Number(p.cantidad),
      talla: p.tallaGr != null ? Number(p.tallaGr) : null,
      fecha_siembra: p.fechaSiembra,
      fecha_biometria: p.fechaUltimaBiometria,
    };
  }

  if (tipo === "Engorda") {
    const e = await prisma.engorda.findFirst({
      where: { instalacionId },
      include: { lote: true },
    });
    if (!e) return { tipo, fi_lote_id: null };
    return {
      tipo,
      fi_lote_id: e.loteId,
      no_lote: e.lote?.noLote ?? null,
      cantidad: e.cantidad,
      talla: e.tallaGr != null ? Number(e.tallaGr) : null,
      fecha_siembra: e.fechaSiembra,
      fecha_biometria: e.fechaBiometria,
    };
  }

  return { tipo };
}

export function parseTimeOrNull(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value;
  const s = String(value).trim();
  const iso = s.includes("T") ? s : `1970-01-01T${s}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
