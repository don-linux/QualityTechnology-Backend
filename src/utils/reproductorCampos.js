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

function toDateOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Campos persistidos de un alta/actualización de lote de reproductores. */
export function parseReproductorCampos(body) {
  const machos = Math.max(0, toIntRepro(pick(body, "machos", "fn_machos"), 0) ?? 0);
  const hembras = Math.max(0, toIntRepro(pick(body, "hembras", "fn_hembras"), 0) ?? 0);
  const cantidadExplicita = toIntRepro(
    pick(body, "cantidad_total", "fn_cantidad_total", "cantidad", "fn_cantidad"),
    null,
  );
  const cantidad_total =
    cantidadExplicita != null && cantidadExplicita >= 0 ? cantidadExplicita : machos + hembras;

  const activoRaw = pick(body, "activo", "fb_activo");
  const activo =
    activoRaw === undefined || activoRaw === null || activoRaw === ""
      ? true
      : activoRaw === true || activoRaw === "true" || activoRaw === 1 || activoRaw === "1";

  const desovezRaw = pick(body, "desovez", "fn_desovez");
  const desovez =
    desovezRaw !== undefined
      ? Math.max(0, toIntRepro(desovezRaw, 0) ?? 0)
      : undefined;

  const estadoCicloRaw = pick(body, "estado_ciclo", "fc_estado_ciclo");
  const estado_ciclo =
    estadoCicloRaw !== undefined
      ? String(estadoCicloRaw).trim().toLowerCase() === "agotado"
        ? "agotado"
        : "activo"
      : undefined;

  return {
    machos,
    hembras,
    cantidad_total,
    fecha_siembra: toDateOrNull(
      pick(body, "fecha_siembra", "fd_fecha_siembra", "fecha_siembra_reproductores"),
    ),
    lote_genetico: sliceStr(pick(body, "lote_genetico", "fc_lote_genetico"), 120),
    activo,
    ...(desovez !== undefined ? { desovez } : {}),
    ...(estado_ciclo !== undefined ? { estado_ciclo } : {}),
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
