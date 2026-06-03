/**
 * Lote de incubación = lote genético del módulo reproductores (trazabilidad única).
 * El código EV- del desove es solo folio operativo.
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
