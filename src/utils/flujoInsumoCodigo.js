import { normalizarGranjaParam } from "./granjaUbicacion.js";

/**
 * Sigla de la unidad de negocio (granja) para el folio de flujo de insumos.
 * GAC = La Ceiba, GAM = Medellin (misma convencion que control de fauna nociva).
 * @param {string} nombreUbicacion
 * @returns {"GAC"|"GAM"|"GAX"}
 */
export function siglaGranjaFlujoInsumo(nombreUbicacion) {
  const n = normalizarGranjaParam(nombreUbicacion);
  if (n.includes("ceiba")) return "GAC";
  if (n.includes("medell")) return "GAM";
  return "GAX";
}

/**
 * Prefijo del folio segun el tipo de movimiento:
 * - ingreso / egreso -> "ALI"
 * - traspaso         -> "IN"
 * @param {string} tipoMovimiento
 * @returns {"ALI"|"IN"}
 */
export function prefijoFlujoInsumo(tipoMovimiento) {
  return String(tipoMovimiento) === "traspaso" ? "IN" : "ALI";
}

/**
 * Formatea una fecha como YYYYMMDD sin desfase por zona horaria.
 * @param {string|Date} fecha
 * @returns {string}
 */
export function formatFechaCodigoFlujoInsumo(fecha) {
  if (typeof fecha === "string") {
    const match = fecha.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}${match[2]}${match[3]}`;
  }
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) {
    const hoy = new Date();
    return [
      hoy.getUTCFullYear(),
      String(hoy.getUTCMonth() + 1).padStart(2, "0"),
      String(hoy.getUTCDate()).padStart(2, "0"),
    ].join("");
  }
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("");
}

/**
 * Genera folio {PREFIJO}-{SIGLA}-{YYYYMMDD}-{NNN} para un registro de flujo de insumos.
 * - ingreso/egreso: ALI-<sigla UdN>-<fecha>-NNN
 * - traspaso:       IN-<sigla UdN de salida>-<fecha>-NNN (compartido por el par de filas)
 * El consecutivo reinicia en 001 cada dia por (prefijo, sigla).
 * @param {import("@prisma/client").Prisma.TransactionClient | import("@prisma/client").PrismaClient} client
 * @param {{ tipoMovimiento: string, ubicacionNombre: string, fecha: string|Date }} opts
 */
export async function generarCodigoFlujoInsumo(client, { tipoMovimiento, ubicacionNombre, fecha }) {
  const prefijo = prefijoFlujoInsumo(tipoMovimiento);
  const sigla = siglaGranjaFlujoInsumo(ubicacionNombre);
  const ymd = formatFechaCodigoFlujoInsumo(fecha);
  const prefix = `${prefijo}-${sigla}-${ymd}-`;

  const last = await client.flujoInsumo.findFirst({
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
