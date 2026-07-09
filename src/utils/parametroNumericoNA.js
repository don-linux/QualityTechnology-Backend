/**
 * Parsea valor numérico de parámetro con soporte N/A (0 en DB).
 * @param {*} value
 * @param {boolean} noAplica
 * @returns {number|null}
 */
export function parseParametroNumericoConNA(value, noAplica) {
  if (noAplica) return 0;
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function esParametroNoAplica(value) {
  if (value == null) return false;
  return Number(value) === 0;
}

/**
 * @param {*} value
 * @param {boolean} [noAplica]
 * @returns {string|null}
 */
export function parametroNumericoToDbString(value, noAplica) {
  if (noAplica) return "0";
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? String(n) : null;
}
