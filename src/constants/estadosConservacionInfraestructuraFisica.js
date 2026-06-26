export const ESTADOS_CONSERVACION_INFRAESTRUCTURA_FISICA = ["Buen estado", "Mal estado"];

const ALLOWED = new Set(ESTADOS_CONSERVACION_INFRAESTRUCTURA_FISICA);

export function normalizeEstadoConservacion(raw) {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  return s === "" ? null : s;
}

export function validateEstadoConservacion(value, { required = false } = {}) {
  const normalized = normalizeEstadoConservacion(value);
  if (normalized == null) {
    if (required) return { ok: false, error: "estado_conservacion es obligatorio" };
    return { ok: true, value: null };
  }
  if (normalized.length > 100) {
    return { ok: false, error: "estado_conservacion no puede exceder 100 caracteres" };
  }
  if (!ALLOWED.has(normalized)) {
    return {
      ok: false,
      error: `estado_conservacion debe ser uno de: ${ESTADOS_CONSERVACION_INFRAESTRUCTURA_FISICA.join(", ")}`,
    };
  }
  return { ok: true, value: normalized };
}
