import prisma from "../prisma.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function serializeHistorialPeso(row) {
  if (!row) return null;
  return {
    id: row.id,
    peso: row.peso != null ? Number(row.peso) : null,
    peso_gramos: row.peso != null ? Number(row.peso) : null,
    fecha: row.fecha,
  };
}

/** Crea fila en `historial_peso` si el body trae valor en gramos (y fecha opcional). */
export async function resolverHistorialPesoId(tx, body) {
  const pesoGramosBody = toDecimal(body?.peso_gramos ?? body?.peso_valor);
  if (pesoGramosBody != null) {
    const creado = await tx.historialPeso.create({
      data: {
        peso: pesoGramosBody,
        fecha:
          toDateOrNull(body?.fecha_peso ?? body?.fecha) ?? new Date(),
      },
    });
    return creado.id;
  }

  const idDirecto = toInt(body?.historial_peso_id ?? body?.peso_id);
  if (idDirecto) {
    const existe = await tx.historialPeso.findUnique({ where: { id: idDirecto } });
    if (!existe) {
      const err = new Error("historial_peso_id inválido");
      err.code = "BAD_HISTORIAL_PESO";
      throw err;
    }
    return idDirecto;
  }

  const pesoComoId = toInt(body?.peso);
  if (pesoComoId) {
    const existe = await tx.historialPeso.findUnique({ where: { id: pesoComoId } });
    if (existe) return pesoComoId;
  }

  return null;
}

class HistorialPesoController {
  static async getAll(req, res) {
    try {
      const piletaId = toInt(req.query.pileta_id);
      const where = piletaId
        ? {
            OR: [
              { alevinaje: { some: { pileta_id: piletaId } } },
              { engorda: { some: { pileta_id: piletaId } } },
            ],
          }
        : undefined;

      const rows = await prisma.historialPeso.findMany({
        where,
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
      });
      res.json(rows.map(serializeHistorialPeso));
    } catch (err) {
      console.error("GET /historial-peso Error:", err);
      res.status(500).json({ error: "Error obteniendo historial de peso" });
    }
  }

  static async create(req, res) {
    try {
      const pesoGramos = toDecimal(req.body?.peso ?? req.body?.peso_gramos);
      if (pesoGramos == null || pesoGramos < 0) {
        return res.status(400).json({ error: "peso (g) es obligatorio y debe ser >= 0" });
      }
      const row = await prisma.historialPeso.create({
        data: {
          peso: pesoGramos,
          fecha: toDateOrNull(req.body?.fecha) ?? new Date(),
        },
      });
      res.status(201).json({ data: serializeHistorialPeso(row) });
    } catch (err) {
      console.error("POST /historial-peso Error:", err);
      res.status(500).json({ error: "Error creando historial de peso" });
    }
  }
}

export default HistorialPesoController;
