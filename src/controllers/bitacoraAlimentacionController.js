import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion } from "../utils/bitacoraHelpers.js";
import { serializeAlimentacion } from "../utils/serializers.js";

const MAX_OBSERVACIONES = 500;

const inc = { ubicacion: true, observacion: true };

function parseOptInt(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function parseOptDecimal(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : null;
}

class BitacoraAlimentacionController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.alimentacion.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeAlimentacion));
    } catch (err) {
      console.error("GET ERROR:", err);
      res.status(500).json({ error: "Error obteniendo alimentación" });
    }
  }

  static async create(req, res) {
    try {
      const { ubicacion, observaciones } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }
      const obsLen = observaciones == null ? 0 : String(observaciones).length;
      if (obsLen > MAX_OBSERVACIONES) {
        return res
          .status(400)
          .json({ error: `Las observaciones no pueden superar los ${MAX_OBSERVACIONES} caracteres.` });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const usuarioId = req.user.usuario_id;
      const {
        mes,
        pileta_id,
        peso_promedio_entrada,
        fecha_siembra,
        origen_alevines,
        fecha,
        total_alimento_gramos,
        mortalidad,
        recambio_agua,
        temperatura_agua,
        amonio,
        ph,
      } = req.body;

      const id = await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: observaciones,
          responsable: null,
          usuarioId,
        });

        const row = await tx.alimentacion.create({
          data: {
            ubicacionId: u.ubicacionId,
            mes: mes || null,
            pileta_id: parseOptInt(pileta_id),
            fechaSiembra: fecha_siembra ? new Date(fecha_siembra) : null,
            origenAlevines: origen_alevines || null,
            fecha: fecha ? new Date(fecha) : null,
            pesoPromedioEntrada: parseOptDecimal(peso_promedio_entrada),
            totalAlimentoGramos: parseOptDecimal(total_alimento_gramos),
            mortalidad: parseOptInt(mortalidad),
            recambioAgua: recambio_agua || null,
            temperatura_agua: parseOptDecimal(temperatura_agua),
            amonio: parseOptDecimal(amonio),
            ph: parseOptDecimal(ph),
            usuarioId,
            observacionId,
          },
        });
        return row.id;
      });

      res.json({ message: "Registro creado", id });
    } catch (err) {
      console.error("POST ERROR:", err);
      res.status(500).json({ error: "Error creando registro" });
    }
  }

  static async update(req, res) {
    try {
      const { ubicacion, observaciones } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }
      const obsLen = observaciones == null ? 0 : String(observaciones).length;
      if (obsLen > MAX_OBSERVACIONES) {
        return res
          .status(400)
          .json({ error: `Las observaciones no pueden superar los ${MAX_OBSERVACIONES} caracteres.` });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.alimentacion.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId =
        req.body.usuario_id !== undefined ? req.body.usuario_id : existing.usuarioId;

      const {
        mes,
        pileta_id,
        peso_promedio_entrada,
        fecha_siembra,
        origen_alevines,
        fecha,
        total_alimento_gramos,
        mortalidad,
        recambio_agua,
        temperatura_agua,
        amonio,
        ph,
      } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto:
            observaciones !== undefined
              ? observaciones
              : existing.observacion?.comentario ?? null,
          responsable: null,
          usuarioId,
        });

        await tx.alimentacion.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            mes: mes || null,
            pileta_id: parseOptInt(pileta_id),
            fechaSiembra: fecha_siembra ? new Date(fecha_siembra) : null,
            origenAlevines: origen_alevines || null,
            fecha: fecha ? new Date(fecha) : null,
            pesoPromedioEntrada: parseOptDecimal(peso_promedio_entrada),
            totalAlimentoGramos: parseOptDecimal(total_alimento_gramos),
            mortalidad: parseOptInt(mortalidad),
            recambioAgua: recambio_agua || null,
            temperatura_agua: parseOptDecimal(temperatura_agua),
            amonio: parseOptDecimal(amonio),
            ph: parseOptDecimal(ph),
            usuarioId,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado" });
    } catch (err) {
      console.error("PUT ERROR:", err);
      res.status(500).json({ error: "Error actualizando registro" });
    }
  }

}

export default BitacoraAlimentacionController;
