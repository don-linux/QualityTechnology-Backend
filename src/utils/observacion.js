/**
 * Crea observación cuando hay texto. Opciones: infraestructuraFisica/proceso (consulta última por infraestructura física) y biometria_id (1:1 con biometría).
 *
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} tx
 * @param {string|null|undefined} texto
 * @param {number|null|undefined} usuarioId
 * @param {{ infraestructuraFisicaId?: number|null, proceso?: string|null, biometriaId?: number|null }} [opts]
 * @returns {Promise<number|null>}
 */
export async function crearObservacionSiHay(tx, texto, usuarioId, opts = {}) {
  if (texto === undefined || texto === null || String(texto).trim() === "") return null;
  const infraestructuraFisicaId = opts.infraestructuraFisicaId ?? opts.infraestructura_fisica_id ?? undefined;
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
      ...(infraestructuraFisicaId != null ? { infraestructura_fisica_id: infraestructuraFisicaId } : {}),
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
function textoUsuarioRedundanteConFolio(texto, folio) {
  if (!texto || !folio) return false;
  const t = String(texto).trim();
  const f = String(folio).trim();
  if (!t || !f) return false;
  const esc = f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const soloFolio = new RegExp(`^Folio:\\s*${esc}$`, "i");
  if (soloFolio.test(t)) return true;
  if (/^En proceso de venta/i.test(t) && new RegExp(`Folio:\\s*${esc}`, "i").test(t)) return true;
  return false;
}

/** Quita menciones duplicadas del folio en el texto libre del usuario. */
function limpiarTextoNuevoVenta(textoNuevo, folio) {
  if (textoNuevo == null || String(textoNuevo).trim() === "") return null;
  let nuevo = String(textoNuevo).trim();
  if (!folio) return nuevo;

  if (textoUsuarioRedundanteConFolio(nuevo, folio)) return null;

  const esc = String(folio).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  nuevo = nuevo
    .replace(new RegExp(`Folio:\\s*${esc}`, "gi"), "")
    .replace(/\s*·\s*·\s*/g, " · ")
    .replace(/^\s*·\s*|\s*·\s*$/g, "")
    .trim();

  return nuevo || null;
}

export function textoObservacionEgresoInventario({ textoNuevo, folioVenta } = {}) {
  const folio =
    folioVenta != null && String(folioVenta).trim() !== "" ? String(folioVenta).trim() : null;
  const nuevo = limpiarTextoNuevoVenta(textoNuevo, folio);

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
  { infraestructuraFisicaId, proceso } = {},
) {
  const texto = textoObservacionEgresoInventario(params);
  return crearObservacionSiHay(tx, texto, usuarioId, { infraestructuraFisicaId, proceso });
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
  { infraestructuraFisicaId, proceso } = {},
) {
  const texto = textoObservacionCancelacionVenta(params);
  return crearObservacionSiHay(tx, texto, usuarioId, { infraestructuraFisicaId, proceso });
}
