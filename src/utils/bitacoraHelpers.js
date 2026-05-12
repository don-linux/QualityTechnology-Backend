import prisma from "../prisma.js";

// Helpers compartidos por los controllers de bitacora. El schema actual
// retiro `responsable` y `instalacionId` de varios modelos; aqui guardamos
// la observacion solo con `comentario` y `usuario_id`. Las funciones que
// actualizaban fecha de biometria por instalacion quedan como no-op porque
// la relacion Pileta/Engorda/Reproductor -> Instalacion ya no existe.

/**
 * Lista empleados activos con el mismo contrato que el frontend esperaba
 * (fi_empleado_id, fc_nombre_completo).
 */
export async function listarEmpleadosActivosBitacora() {
  const rows = await prisma.empleado.findMany({
    where: { esta_activo: true },
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
    orderBy: [{ nombre: "asc" }, { apellidoPaterno: "asc" }],
  });
  return rows.map((e) => ({
    fi_empleado_id: e.id,
    fc_nombre_completo: [e.nombre, e.apellidoPaterno, e.apellidoMaterno].filter(Boolean).join(" "),
  }));
}

/**
 * Persiste texto/responsable en `observacion`. El modelo nuevo solo tiene
 * `comentario` y `usuario_id`, asi que el responsable se concatena al texto
 * cuando ambos vienen. Si quedan vacios devuelve null (desvincular).
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

  const comentario = [
    respTrim ? `Responsable: ${respTrim}` : null,
    obsTrim,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 500);

  if (observacionIdExistente) {
    await tx.observacion.update({
      where: { id: observacionIdExistente },
      data: {
        comentario,
        ...(usuarioId !== undefined ? { usuario_id: usuarioId } : {}),
      },
    });
    return observacionIdExistente;
  }

  const row = await tx.observacion.create({
    data: {
      comentario,
      usuario_id: usuarioId ?? null,
    },
  });
  return row.id;
}

/**
 * No-op tras el rediseno del schema: Pileta/Engorda/Reproductor ya no se
 * relacionan directamente con Instalacion, por lo que no hay propagacion
 * automatica de fecha de biometria por instalacion. Se conserva la firma
 * para minimizar cambios en los controllers.
 */
export async function actualizarFechaBiometriaPorInstalacion() {
  return;
}

/**
 * Tras el rediseno, no existe `tipoInstalacion` ni una relacion clara
 * Instalacion -> Pileta/Engorda/Reproductor. Devolvemos null para indicar
 * que la informacion no esta disponible.
 */
export async function obtenerInfoBiometriaPorInstalacion() {
  return null;
}

export function parseTimeOrNull(value) {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value;
  const s = String(value).trim();
  const iso = s.includes("T") ? s : `1970-01-01T${s}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
