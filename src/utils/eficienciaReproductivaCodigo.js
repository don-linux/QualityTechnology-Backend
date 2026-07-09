/**
 * Genera código EV-AAAA-NNN para el desove almacenado en `eficiencia_reproductiva` (tabla fusionada).
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 */
export async function generarCodigoDesoveEficienciaReproductiva(tx) {
  const year = new Date().getFullYear();
  const prefix = `EV-${year}-`;
  const last = await tx.eficiencia_reproductiva.findFirst({
    where: { codigo: { startsWith: prefix } },
    orderBy: { codigo: "desc" },
    select: { codigo: true },
  });
  let n = 1;
  if (last?.codigo) {
    const part = last.codigo.slice(prefix.length);
    n = (parseInt(part, 10) || 0) + 1;
  }
  return `${prefix}${String(n).padStart(3, "0")}`;
}

export const TIPOS_COSECHA_VALIDOS = ["huevo", "larva_saco", "alevin_nadando"];

export function normalizarTipoCosecha(value) {
  const t = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (t === "larva_con_saco" || t === "larva_saco") return "larva_saco";
  if (t === "alevin_nadando" || t === "alevin") return "alevin_nadando";
  if (t === "huevo" || t === "huevos") return "huevo";
  return TIPOS_COSECHA_VALIDOS.includes(t) ? t : null;
}

/**
 * Normaliza una selección de tipos de cosecha (multi-selección) a un arreglo de
 * valores válidos, sin duplicados. Acepta un arreglo, un valor único o una
 * cadena separada por comas.
 * @returns {string[]} tipos válidos (puede ser un arreglo vacío)
 */
export function normalizarTiposCosecha(value) {
  const crudos = Array.isArray(value)
    ? value
    : value === undefined || value === null || value === ""
      ? []
      : String(value).split(",");
  const tipos = [];
  for (const crudo of crudos) {
    const t = normalizarTipoCosecha(crudo);
    if (t && !tipos.includes(t)) tipos.push(t);
  }
  return tipos;
}

/**
 * Normaliza el mapa de volumen/contrapeso por tipo de cosecha.
 * Acepta un objeto (o JSON en cadena) con claves de tipo y valores numéricos.
 * Conserva sólo claves válidas (y, si se indica, presentes en `tiposPermitidos`)
 * con valores numéricos finitos >= 0.
 * @param {unknown} value
 * @param {string[]|null} [tiposPermitidos]
 * @returns {Record<string, number>}
 */
export function normalizarVolumenPorTipo(value, tiposPermitidos = null) {
  let obj = value;
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch {
      obj = null;
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
  const permitido = tiposPermitidos ? new Set(tiposPermitidos) : null;
  const salida = {};
  for (const [clave, valor] of Object.entries(obj)) {
    const tipo = normalizarTipoCosecha(clave);
    if (!tipo) continue;
    if (permitido && !permitido.has(tipo)) continue;
    if (valor === "" || valor === null || valor === undefined) continue;
    const num = Number(valor);
    if (Number.isFinite(num) && num >= 0) salida[tipo] = num;
  }
  return salida;
}
