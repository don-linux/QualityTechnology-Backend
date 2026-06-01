/**
 * Lote de incubación = lote genético del módulo reproductores (trazabilidad única).
 * El código EV- del evento de cosecha es solo folio operativo del desove.
 */

export function normalizarLoteIncubacion(value) {
  const lote = String(value ?? "").trim();
  if (!lote) {
    const err = new Error("El lote es obligatorio");
    err.code = "BAD_LOTE";
    throw err;
  }
  return lote.slice(0, 60);
}

/**
 * @param {{ reproductor?: { lote_genetico?: string | null } | null } | null} evento
 * @returns {string}
 */
export function loteGeneticoDesdeEventoCosecha(evento) {
  const raw = evento?.reproductor?.lote_genetico;
  const lote = String(raw ?? "").trim();
  if (!lote) {
    const err = new Error(
      "El evento no tiene lote genético en reproductores. Complételo en el módulo 1 antes de incubar.",
    );
    err.code = "BAD_LOTE_GENETICO";
    throw err;
  }
  return normalizarLoteIncubacion(lote);
}
