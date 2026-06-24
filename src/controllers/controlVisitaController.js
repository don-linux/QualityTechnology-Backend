import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, parseTimeOrNull } from "../utils/bitacoraHelpers.js";
import { serializeControlVisita } from "../utils/serializers.js";

const inc = { ubicacion: true, observacion: true };

class ControlVisitaController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.controlVisita.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeControlVisita));
    } catch (error) {
      console.error("GET ERROR:", error);
      res.status(500).json({ error: "Error obteniendo control de visitas" });
    }
  }

  static async create(req, res) {
    try {
      const { motivo, observaciones } = req.body;

      if (motivo && motivo.length > 300) {
        return res.status(400).json({ error: "El motivo no puede superar los 300 caracteres." });
      }
      if (observaciones && observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }

      const fotoEnviada =
        req.file ||
        (req.body.foto_identificacion && String(req.body.foto_identificacion).trim());
      if (!fotoEnviada) {
        return res
          .status(400)
          .json({ error: "La fotografía de identificación es obligatoria." });
      }

      const usuarioId = req.user.usuario_id;
      let ubicacionId = null;
      if (req.body.ubicacion != null && String(req.body.ubicacion).trim()) {
        const u = await resolverOCrearUbicacion(req.body.ubicacion);
        ubicacionId = u?.ubicacionId ?? null;
      }

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: observaciones,
          responsable: null,
          usuarioId,
        });

        await tx.controlVisita.create({
          data: {
            ubicacionId,
            fecha: req.body.fecha ? new Date(req.body.fecha) : new Date(),
            hora_entrada: parseTimeOrNull(req.body.hora_entrada),
            hora_salida: parseTimeOrNull(req.body.hora_salida),
            nombreCompleto: req.body.nombre_completo || null,
            procedencia: req.body.procedencia || null,
            motivo: req.body.motivo || "",
            fotoIdentificacion: req.file ? req.file.path : req.body.foto_identificacion || null,
            usuarioId,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro creado" });
    } catch (error) {
      console.error("POST ERROR:", error);
      res.status(500).json({ error: "Error creando registro" });
    }
  }

  static async update(req, res) {
    try {
      const { motivo, observaciones } = req.body;

      if (motivo && motivo.length > 300) {
        return res.status(400).json({ error: "El motivo no puede superar los 300 caracteres." });
      }
      if (observaciones && observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }

      const id = Number(req.params.id);
      const existing = await prisma.controlVisita.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user.usuario_id;

      let ubicacionId = existing.ubicacionId;
      if (req.body.ubicacion !== undefined) {
        if (req.body.ubicacion == null || !String(req.body.ubicacion).trim()) {
          ubicacionId = null;
        } else {
          const u = await resolverOCrearUbicacion(req.body.ubicacion);
          ubicacionId = u?.ubicacionId ?? null;
        }
      }

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

        await tx.controlVisita.update({
          where: { id },
          data: {
            ubicacionId,
            fecha: req.body.fecha ? new Date(req.body.fecha) : existing.fecha,
            hora_entrada:
              req.body.hora_entrada !== undefined
                ? parseTimeOrNull(req.body.hora_entrada)
                : existing.hora_entrada,
            hora_salida:
              req.body.hora_salida !== undefined
                ? parseTimeOrNull(req.body.hora_salida)
                : existing.hora_salida,
            nombreCompleto:
              req.body.nombre_completo !== undefined
                ? req.body.nombre_completo || null
                : existing.nombreCompleto,
            procedencia:
              req.body.procedencia !== undefined ? req.body.procedencia || null : existing.procedencia,
            motivo:
              req.body.motivo !== undefined ? req.body.motivo || existing.motivo : existing.motivo,
            fotoIdentificacion: req.file
              ? req.file.path
              : req.body.foto_identificacion !== undefined
                ? req.body.foto_identificacion || null
                : existing.fotoIdentificacion,
            usuarioId,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado" });
    } catch (error) {
      console.error("PUT ERROR:", error);
      res.status(500).json({ error: "Error actualizando registro" });
    }
  }

}

export default ControlVisitaController;
