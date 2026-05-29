function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

export function toIntRepro(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

export function toDecimalRepro(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function calcularRatioReproductor(machos, hembras) {
  if (machos > 0 && hembras > 0) {
    const r = hembras / machos;
    return `1:${Math.round(r * 100) / 100}`;
  }
  return null;
}

function sliceStr(value, max) {
  if (value == null || value === "") return null;
  return String(value).trim().slice(0, max) || null;
}

/** Campos persistidos de un alta/actualización de inventario reproductor. */
export function parseReproductorCampos(body) {
  const machos = Math.max(0, toIntRepro(pick(body, "machos", "fn_machos"), 0) ?? 0);
  const hembras = Math.max(0, toIntRepro(pick(body, "hembras", "fn_hembras"), 0) ?? 0);
  const cantidadExplicita = toIntRepro(
    pick(body, "cantidad_total", "fn_cantidad_total", "cantidad", "fn_cantidad"),
    null,
  );
  const cantidad_total =
    cantidadExplicita != null && cantidadExplicita >= 0 ? cantidadExplicita : machos + hembras;

  return {
    machos,
    hembras,
    cantidad_total,
    genetica_machos: sliceStr(pick(body, "genetica_machos", "fc_genetica_machos"), 60),
    familia_machos: sliceStr(pick(body, "familia_machos", "fc_familia_machos"), 60),
    procedencia_machos: sliceStr(pick(body, "procedencia_machos", "fc_procedencia_machos"), 100),
    genetica_hembras: sliceStr(pick(body, "genetica_hembras", "fc_genetica_hembras"), 60),
    familia_hembras: sliceStr(pick(body, "familia_hembras", "fc_familia_hembras"), 60),
    procedencia_hembras: sliceStr(
      pick(body, "procedencia_hembras", "fc_procedencia_hembras"),
      100,
    ),
    ratio: calcularRatioReproductor(machos, hembras),
    talla: toDecimalRepro(pick(body, "talla", "fn_talla")),
  };
}

export function pickRepro(body, ...keys) {
  return pick(body, ...keys);
}
