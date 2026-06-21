/**
 * Lote de eficiencia reproductiva = lote genético del módulo reproductores (trazabilidad única).
 * El código EV- del desove es solo folio operativo.
 */

export function normalizarLoteEficienciaReproductiva(value) {
  const lote = String(value ?? "").trim();
  if (!lote) {
    const err = new Error("El lote es obligatorio");
    err.code = "BAD_LOTE";
    throw err;
  }
  return lote.slice(0, 60);
}

/** Devuelve null si el valor está vacío (campos opcionales como alevinaje). */
export function normalizarLoteOpcional(value) {
  const lote = String(value ?? "").trim();
  if (!lote) return null;
  return lote.slice(0, 60);
}
