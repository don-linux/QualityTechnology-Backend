/**
 * Resuelve el lote de reproductores vigente (activo) que originará un desove/cosecha,
 * ya sea por id de reproductor o por la infraestructura física de reproductores de origen.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {{ reproductorId?: number|null, infraestructuraFisicaId?: number|null }} opts
 */
export async function resolverLoteReproductorActivo(tx, { reproductorId, infraestructuraFisicaId }) {
  const select = {
    id: true,
    infraestructura_fisica_id: true,
    activo: true,
    estado_ciclo: true,
    hembras: true,
    desovez: true,
    lote_genetico: true,
  };

  if (reproductorId) {
    const row = await tx.reproductor.findUnique({
      where: { id: reproductorId },
      select,
    });
    if (!row) {
      const err = new Error("Lote de reproductores no encontrado");
      err.code = "NOT_FOUND";
      throw err;
    }
    if (!row.activo) {
      const err = new Error("El lote de reproductores no está activo");
      err.code = "LOTE_INACTIVO";
      throw err;
    }
    if (row.estado_ciclo === "agotado") {
      const err = new Error("El lote de reproductores está agotado y no admite más cosechas");
      err.code = "LOTE_AGOTADO";
      throw err;
    }
    return row;
  }

  if (!infraestructuraFisicaId) {
    const err = new Error("reproductor_id o infraestructura_fisica_origen_id (estanque de reproductores) es obligatorio");
    err.code = "VALIDACION";
    throw err;
  }

  const row = await tx.reproductor.findFirst({
    where: { infraestructura_fisica_id: infraestructuraFisicaId, activo: true, estado_ciclo: "activo" },
    orderBy: { id: "desc" },
    select,
  });
  if (!row) {
    const agotado = await tx.reproductor.findFirst({
      where: { infraestructura_fisica_id: infraestructuraFisicaId, activo: true, estado_ciclo: "agotado" },
      orderBy: { id: "desc" },
      select: { id: true },
    });
    if (agotado) {
      const err = new Error(
        "El lote de reproductores en la infraestructura física está agotado. Registre un nuevo grupo en el módulo 1.",
      );
      err.code = "LOTE_AGOTADO";
      throw err;
    }
    const err = new Error(
      "No hay un lote de reproductores activo en la infraestructura física indicada. Regístrelo en el módulo 1.",
    );
    err.code = "SIN_LOTE_ACTIVO";
    throw err;
  }
  return row;
}
