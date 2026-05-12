import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, parseTimeOrNull } from "../utils/bitacoraHelpers.js";
import { serializeVisita } from "../utils/serializers.js";

const inc = { ubicacion: true, observacion: true };

class BitacoraVisitaController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.visita.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeVisita));
    } catch (error) {
      console.error("GET ERROR:", error);
      res.status(500).json({ error: "Error obteniendo visitas" });
    }
  }

  static async create(req, res) {
    try {
      const { fc_motivo, fc_observaciones } = req.body;

      if (fc_motivo && fc_motivo.length > 300) {
        return res.status(400).json({ error: "El motivo no puede superar los 300 caracteres." });
      }
      if (fc_observaciones && fc_observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "Las observaciones no pueden superar los 500 caracteres." });
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
          texto: fc_observaciones,
          responsable: null,
          usuarioId,
        });

        await tx.visita.create({
          data: {
            ubicacionId,
            fecha: req.body.fd_fecha ? new Date(req.body.fd_fecha) : new Date(),
            entrada: parseTimeOrNull(req.body.fd_entrada),
            salida: parseTimeOrNull(req.body.fd_salida),
            nombreCompleto: req.body.fc_nombre_completo || null,
            origen: req.body.fc_origen || null,
            motivo: req.body.fc_motivo || null,
            fotoIdentificacion: req.file ? req.file.path : req.body.fc_foto_identificacion || null,
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
      const { fc_motivo, fc_observaciones } = req.body;

      if (fc_motivo && fc_motivo.length > 300) {
        return res.status(400).json({ error: "El motivo no puede superar los 300 caracteres." });
      }
      if (fc_observaciones && fc_observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }

      const id = Number(req.params.id);
      const existing = await prisma.visita.findUnique({
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
            fc_observaciones !== undefined
              ? fc_observaciones
              : existing.observacion?.observacion ?? null,
          responsable: null,
          usuarioId,
        });

        await tx.visita.update({
          where: { id },
          data: {
            ubicacionId,
            fecha: req.body.fd_fecha ? new Date(req.body.fd_fecha) : existing.fecha,
            entrada:
              req.body.fd_entrada !== undefined
                ? parseTimeOrNull(req.body.fd_entrada)
                : existing.entrada,
            salida:
              req.body.fd_salida !== undefined
                ? parseTimeOrNull(req.body.fd_salida)
                : existing.salida,
            nombreCompleto:
              req.body.fc_nombre_completo !== undefined
                ? req.body.fc_nombre_completo || null
                : existing.nombreCompleto,
            origen:
              req.body.fc_origen !== undefined ? req.body.fc_origen || null : existing.origen,
            motivo:
              req.body.fc_motivo !== undefined ? req.body.fc_motivo || null : existing.motivo,
            fotoIdentificacion: req.file
              ? req.file.path
              : req.body.fc_foto_identificacion !== undefined
                ? req.body.fc_foto_identificacion || null
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

  static async delete(req, res) {
    try {
      await prisma.visita.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Registro eliminado" });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("DELETE ERROR:", error);
      res.status(500).json({ error: "Error eliminando registro" });
    }
  }

  static async deleteAll(req, res) {
    try {
      await prisma.visita.deleteMany();
      res.json({ message: "Todos los registros fueron eliminados." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default BitacoraVisitaController;
