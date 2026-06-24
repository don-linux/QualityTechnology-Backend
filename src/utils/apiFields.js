/**
 * Helpers compartidos para leer y normalizar campos del cuerpo de las
 * peticiones HTTP. El contrato de la API usa nombres semánticos en snake_case
 * (sin prefijos húngaros); estas utilidades centralizan la lectura y conversión
 * de esos campos para evitar copias locales en cada controlador.
 */

/** Devuelve el primer valor definido y no vacío entre las claves indicadas. */
export function pick(body, ...keys) {
  if (!body) return undefined;
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

/** Convierte a entero; devuelve `fallback` si el valor es inválido o vacío. */
export function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

/** Convierte a número decimal; devuelve `null` si el valor es inválido o vacío. */
export function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
