/**
 * Genera código IN-NNN para un insumo del catálogo.
 * El consecutivo es global (no reinicia por día).
 * @param {import("@prisma/client").Prisma.TransactionClient | import("@prisma/client").PrismaClient} client
 */
export async function generarCodigoCatalogoInsumo(client) {
  const prefix = "IN-";
  const last = await client.catalogoInsumo.findFirst({
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
