/**
 * Genera código EV-AAAA-NNN para el desove almacenado en `incubacion` (tabla fusionada).
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 */
export async function generarCodigoDesoveIncubacion(tx) {
  const year = new Date().getFullYear();
  const prefix = `EV-${year}-`;
  const last = await tx.incubacion.findFirst({
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
