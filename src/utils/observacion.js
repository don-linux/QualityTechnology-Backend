/**
 * Helper compartido para crear un registro en `observacion` (nuevo schema:
 * campos `comentario` y `usuario_id`) y devolver su id. Si no hay texto,
 * regresa null.
 *
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} tx
 * @param {string|null|undefined} texto
 * @param {number|null} usuarioId
 * @returns {Promise<number|null>}
 */
export async function crearObservacionSiHay(tx, texto, usuarioId) {
  if (texto === undefined || texto === null || String(texto).trim() === "") return null;
  const obs = await tx.observacion.create({
    data: {
      comentario: String(texto).slice(0, 500),
      usuario_id: usuarioId ?? null,
    },
  });
  return obs.id;
}
