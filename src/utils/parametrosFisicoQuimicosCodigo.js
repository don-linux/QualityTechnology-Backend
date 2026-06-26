/**
 * Formatea una fecha como YYYYMMDD sin desfase por zona horaria.
 * @param {string|Date} fecha
 * @returns {string}
 */
export function formatFechaCodigoParametrosFisicoQuimicos(fecha) {
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
 * Genera código PFQ-YYYYMMDD-NNN (consecutivo diario global).
 * @param {import("@prisma/client").Prisma.TransactionClient | import("@prisma/client").PrismaClient} client
 * @param {{ fecha: string|Date }} opts
 */
export async function generarCodigoParametrosFisicoQuimicos(client, { fecha }) {
  const ymd = formatFechaCodigoParametrosFisicoQuimicos(fecha);
  const prefix = `PFQ-${ymd}-`;

  const last = await client.parametrosFisicoQuimico.findFirst({
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
