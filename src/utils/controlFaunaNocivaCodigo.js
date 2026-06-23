import { normalizarGranjaParam } from "./granjaUbicacion.js";

/**
 * Resuelve la sigla de granja para el folio de control de fauna nociva.
 * GAC = La Ceiba, GAM = Medellín (misma convención que resolveUnidadNegocioFromRol).
 * @param {string} nombreUbicacion
 * @returns {"GAC"|"GAM"|"GAX"}
 */
export function siglaGranjaControlFaunaNociva(nombreUbicacion) {
  const n = normalizarGranjaParam(nombreUbicacion);
  if (n.includes("ceiba")) return "GAC";
  if (n.includes("medell")) return "GAM";
  return "GAX";
}

/**
 * Formatea una fecha como YYYYMMDD sin desfase por zona horaria.
 * @param {string|Date} fecha
 * @returns {string}
 */
export function formatFechaCodigoControlFaunaNociva(fecha) {
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
 * Genera código FN-SIGLA-YYYYMMDD-NNN para un registro de control de fauna nociva.
 * El consecutivo reinicia en 001 cada día y por granja (sigla).
 * @param {import("@prisma/client").Prisma.TransactionClient | import("@prisma/client").PrismaClient} client
 * @param {{ ubicacionNombre: string, fecha: string|Date }} opts
 */
export async function generarCodigoControlFaunaNociva(client, { ubicacionNombre, fecha }) {
  const sigla = siglaGranjaControlFaunaNociva(ubicacionNombre);
  const ymd = formatFechaCodigoControlFaunaNociva(fecha);
  const prefix = `FN-${sigla}-${ymd}-`;

  const last = await client.controlFaunaNociva.findFirst({
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
