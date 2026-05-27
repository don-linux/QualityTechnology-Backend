/**
 * Crea observación cuando hay texto. Opciones: pileta/proceso (consulta última por pileta) y biometria_id (1:1 con biometría).
 *
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} tx
 * @param {string|null|undefined} texto
 * @param {number|null|undefined} usuarioId
 * @param {{ piletaId?: number|null, proceso?: string|null, biometriaId?: number|null }} [opts]
 * @returns {Promise<number|null>}
 */
export async function crearObservacionSiHay(tx, texto, usuarioId, opts = {}) {
  if (texto === undefined || texto === null || String(texto).trim() === "") return null;
  const piletaId = opts.piletaId ?? opts.pileta_id ?? undefined;
  const procesoIn = opts.proceso ?? undefined;
  const proceso =
    procesoIn != null && String(procesoIn).trim()
      ? String(procesoIn).trim().slice(0, 80)
      : undefined;
  const biometriaId = opts.biometriaId ?? opts.biometria_id ?? undefined;

  const uid = usuarioId != null ? Number(usuarioId) : null;
  if (!uid || Number.isNaN(uid)) {
    throw new Error("usuario_id es obligatorio para crear observación");
  }

  const obs = await tx.observacion.create({
    data: {
      comentario: String(texto).slice(0, 500),
      usuario_id: uid,
      ...(piletaId != null ? { pileta_id: piletaId } : {}),
      ...(proceso !== undefined ? { proceso } : {}),
      ...(biometriaId != null ? { biometria_id: biometriaId } : {}),
    },
  });
  return obs.id;
}

/**
 * Arma el comentario al egresar inventario por trazabilidad o venta.
 * Venta: solo prefijo con folio (+ texto del movimiento actual si aplica).
 * Trazabilidad: solo el comentario del movimiento.
 */
export function textoObservacionEgresoInventario({ textoNuevo, folioVenta } = {}) {
  const folio =
    folioVenta != null && String(folioVenta).trim() !== "" ? String(folioVenta).trim() : null;
  const nuevo =
    textoNuevo != null && String(textoNuevo).trim() !== "" ? String(textoNuevo).trim() : null;

  if (folio) {
    const prefijo = `En proceso de venta · Folio: ${folio}`;
    if (nuevo) return `${prefijo} · ${nuevo}`.slice(0, 500);
    return prefijo;
  }

  return nuevo ? nuevo.slice(0, 500) : null;
}

/**
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} tx
 */
export async function crearObservacionEgresoInventario(
  tx,
  params,
  usuarioId,
  { piletaId, proceso } = {},
) {
  const texto = textoObservacionEgresoInventario(params);
  return crearObservacionSiHay(tx, texto, usuarioId, { piletaId, proceso });
}

/**
 * Arma el comentario al restaurar inventario por cancelación de venta.
 */
export function textoObservacionCancelacionVenta({ folioVenta } = {}) {
  const folio =
    folioVenta != null && String(folioVenta).trim() !== "" ? String(folioVenta).trim() : null;
  return folio
    ? `Proceso de venta cancelado · Folio: ${folio}`.slice(0, 500)
    : "Proceso de venta cancelado";
}

/**
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} tx
 */
export async function crearObservacionCancelacionVenta(
  tx,
  params,
  usuarioId,
  { piletaId, proceso } = {},
) {
  const texto = textoObservacionCancelacionVenta(params);
  return crearObservacionSiHay(tx, texto, usuarioId, { piletaId, proceso });
}
