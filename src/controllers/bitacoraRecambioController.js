import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeRecambio } from "../utils/serializers.js";

const inc = { ubicacion: true, observacion: true };

function parseOptInt(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseOptDate(v) {
  if (!v || v === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

class BitacoraRecambioController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.recambio.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeRecambio));
    } catch (err) {
      console.error("Error GET /recambios:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async getEmpleados(req, res) {
    try {
      const empleados = await listarEmpleadosActivosBitacora();
      res.json(empleados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const usuarioId = req.user.usuario_id;
      const {
        mes_periodo,
        infraestructura_fisica_id,
        fecha_1,
        tipo_1,
        fecha_2,
        tipo_2,
        fecha_3,
        tipo_3,
        fecha_4,
        tipo_4,
        fecha_5,
        tipo_5,
        fecha_6,
        tipo_6,
        responsable,
        observaciones,
      } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: observaciones ?? null,
          responsable: null,
          usuarioId,
        });

        await tx.recambio.create({
          data: {
            ubicacionId: u.ubicacionId,
            mes_periodo: mes_periodo || null,
            infraestructura_fisica_id: parseOptInt(infraestructura_fisica_id),
            fecha_1: parseOptDate(fecha_1),
            tipo_1: tipo_1 || null,
            fecha_2: parseOptDate(fecha_2),
            tipo_2: tipo_2 || null,
            fecha_3: parseOptDate(fecha_3),
            tipo_3: tipo_3 || null,
            fecha_4: parseOptDate(fecha_4),
            tipo_4: tipo_4 || null,
            fecha_5: parseOptDate(fecha_5),
            tipo_5: tipo_5 || null,
            fecha_6: parseOptDate(fecha_6),
            tipo_6: tipo_6 || null,
            responsable: responsable || null,
            usuarioId,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro agregado correctamente" });
    } catch (err) {
      console.error("Error POST /recambios:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.recambio.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;

      const {
        mes_periodo,
        infraestructura_fisica_id,
        fecha_1,
        tipo_1,
        fecha_2,
        tipo_2,
        fecha_3,
        tipo_3,
        fecha_4,
        tipo_4,
        fecha_5,
        tipo_5,
        fecha_6,
        tipo_6,
        responsable,
        observaciones,
      } = req.body;

      const texto =
        observaciones !== undefined
          ? observaciones
          : existing.observacion?.comentario ?? null;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto,
          responsable: null,
          usuarioId,
        });

        await tx.recambio.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            mes_periodo: mes_periodo !== undefined ? mes_periodo || null : existing.mes_periodo,
            infraestructura_fisica_id:
              infraestructura_fisica_id !== undefined
                ? parseOptInt(infraestructura_fisica_id)
                : existing.infraestructura_fisica_id,
            fecha_1: fecha_1 !== undefined ? parseOptDate(fecha_1) : existing.fecha_1,
            tipo_1: tipo_1 !== undefined ? tipo_1 || null : existing.tipo_1,
            fecha_2: fecha_2 !== undefined ? parseOptDate(fecha_2) : existing.fecha_2,
            tipo_2: tipo_2 !== undefined ? tipo_2 || null : existing.tipo_2,
            fecha_3: fecha_3 !== undefined ? parseOptDate(fecha_3) : existing.fecha_3,
            tipo_3: tipo_3 !== undefined ? tipo_3 || null : existing.tipo_3,
            fecha_4: fecha_4 !== undefined ? parseOptDate(fecha_4) : existing.fecha_4,
            tipo_4: tipo_4 !== undefined ? tipo_4 || null : existing.tipo_4,
            fecha_5: fecha_5 !== undefined ? parseOptDate(fecha_5) : existing.fecha_5,
            tipo_5: tipo_5 !== undefined ? tipo_5 || null : existing.tipo_5,
            fecha_6: fecha_6 !== undefined ? parseOptDate(fecha_6) : existing.fecha_6,
            tipo_6: tipo_6 !== undefined ? tipo_6 || null : existing.tipo_6,
            responsable: responsable !== undefined ? responsable || null : existing.responsable,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error PUT /recambios:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

}

export default BitacoraRecambioController;
