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
