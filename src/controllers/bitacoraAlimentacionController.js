import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion } from "../utils/bitacoraHelpers.js";
import { serializeAlimentacion } from "../utils/serializers.js";

const MAX_FC_OBSERVACIONES = 500;

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
      const { ubicacion, fc_observaciones } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }
      const obsLen = fc_observaciones == null ? 0 : String(fc_observaciones).length;
      if (obsLen > MAX_FC_OBSERVACIONES) {
        return res
          .status(400)
          .json({ error: `Las observaciones no pueden superar los ${MAX_FC_OBSERVACIONES} caracteres.` });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const fi_usuario_id = req.user.usuario_id;
      const {
        fc_mes,
        fn_num_instalacion,
        fn_peso_promedio_entrada,
        fd_fecha_siembra,
        fc_origen_alevines,
        fd_fecha,
        fn_total_alimento_gramos,
        fn_mortalidad,
        fc_recambio_agua,
        fn_temp_agua,
        fn_amonio,
        fn_ph,
      } = req.body;

      const id = await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: fc_observaciones,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        const row = await tx.alimentacion.create({
          data: {
            ubicacionId: u.ubicacionId,
            mes: fc_mes || null,
            pileta_id: parseOptInt(fn_num_instalacion),
            fechaSiembra: fd_fecha_siembra ? new Date(fd_fecha_siembra) : null,
            origenAlevines: fc_origen_alevines || null,
            fecha: fd_fecha ? new Date(fd_fecha) : null,
            pesoPromedioEntrada: parseOptDecimal(fn_peso_promedio_entrada),
            totalAlimentoGramos: parseOptDecimal(fn_total_alimento_gramos),
            mortalidad: parseOptInt(fn_mortalidad),
            recambioAgua: fc_recambio_agua || null,
            temperatura_agua: parseOptDecimal(fn_temp_agua),
            amonio: parseOptDecimal(fn_amonio),
            ph: parseOptDecimal(fn_ph),
            usuarioId: fi_usuario_id,
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
      const { ubicacion, fc_observaciones } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }
      const obsLen = fc_observaciones == null ? 0 : String(fc_observaciones).length;
      if (obsLen > MAX_FC_OBSERVACIONES) {
        return res
          .status(400)
          .json({ error: `Las observaciones no pueden superar los ${MAX_FC_OBSERVACIONES} caracteres.` });
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

      const fi_usuario_id = req.user?.usuario_id ?? existing.usuarioId;

      const {
        fc_mes,
        fn_num_instalacion,
        fn_peso_promedio_entrada,
        fd_fecha_siembra,
        fc_origen_alevines,
        fd_fecha,
        fn_total_alimento_gramos,
        fn_mortalidad,
        fc_recambio_agua,
        fn_temp_agua,
        fn_amonio,
        fn_ph,
      } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto:
            fc_observaciones !== undefined
              ? fc_observaciones
              : existing.observacion?.comentario ?? null,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.alimentacion.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            mes: fc_mes || null,
            pileta_id: parseOptInt(fn_num_instalacion),
            fechaSiembra: fd_fecha_siembra ? new Date(fd_fecha_siembra) : null,
            origenAlevines: fc_origen_alevines || null,
            fecha: fd_fecha ? new Date(fd_fecha) : null,
            pesoPromedioEntrada: parseOptDecimal(fn_peso_promedio_entrada),
            totalAlimentoGramos: parseOptDecimal(fn_total_alimento_gramos),
            mortalidad: parseOptInt(fn_mortalidad),
            recambioAgua: fc_recambio_agua || null,
            temperatura_agua: parseOptDecimal(fn_temp_agua),
            amonio: parseOptDecimal(fn_amonio),
            ph: parseOptDecimal(fn_ph),
            usuarioId: fi_usuario_id,
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
