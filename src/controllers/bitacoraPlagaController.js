import prisma from "../prisma.js";
import { resolverOCrearUbicacion, resolverUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializePlaga } from "../utils/serializers.js";

const inc = { ubicacion: true, observacion: true };

async function filtroUbicacionPlaga(ubicacionQuery) {
  if (!ubicacionQuery || !String(ubicacionQuery).trim()) return {};
  const u = await resolverUbicacion(ubicacionQuery);
  if (u) return { ubicacionId: u.ubicacionId };
  return { ubicacion: { nombre: String(ubicacionQuery).trim() } };
}

class BitacoraPlagaController {
  static async getEmpleados(req, res) {
    try {
      const empleados = await listarEmpleadosActivosBitacora();
      res.json(empleados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { ubicacion } = req.query;
      const where = await filtroUbicacionPlaga(ubicacion);
      const rows = await prisma.plaga.findMany({
        where,
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializePlaga));
    } catch (err) {
      console.error("Error GET /plagas:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const usuarioId = req.user?.usuario_id;
      if (!usuarioId) {
        return res.status(401).json({ error: "Token inválido o sin usuario asociado" });
      }

      const { fc_hallazgo, fc_observaciones } = req.body;
      if (fc_hallazgo && fc_hallazgo.length > 500) {
        return res.status(400).json({ error: "El campo hallazgo no puede superar los 500 caracteres." });
      }
      if (fc_observaciones && fc_observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "El campo observaciones no puede superar los 500 caracteres." });
      }
      const { fc_verifico } = req.body;
      if (fc_verifico != null && String(fc_verifico).length > 100) {
        return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
      }

      const { fi_usuario_id: _drop, ubicacion, ...payload } = req.body;

      let ubicacionId = null;
      if (ubicacion != null && String(ubicacion).trim()) {
        const u = await resolverOCrearUbicacion(ubicacion);
        ubicacionId = u?.ubicacionId ?? null;
      }

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: fc_observaciones,
          responsable: null,
          usuarioId: usuarioId,
        });

        await tx.plaga.create({
          data: {
            ubicacionId,
            unidadProduccion: payload.unidad_produccion || null,
            fecha: payload.fd_fecha ? new Date(payload.fd_fecha) : new Date(),
            numTrampa: payload.fc_num_trampa || null,
            tipoTrampa: payload.tipo_trampa || null,
            hallazgo: payload.fc_hallazgo || null,
            malla: payload.fc_malla || null,
            veneno: payload.fc_veneno || null,
            verifico: payload.fc_verifico || null,
            usuarioId: usuarioId,
            observacionId,
          },
        });
      });

      res.json({ mensaje: "Registro agregado correctamente" });
    } catch (err) {
      console.error("Error POST /plagas:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { fc_hallazgo, fc_observaciones } = req.body;
      if (fc_hallazgo && fc_hallazgo.length > 500) {
        return res.status(400).json({ error: "El campo hallazgo no puede superar los 500 caracteres." });
      }
      if (fc_observaciones && fc_observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "El campo observaciones no puede superar los 500 caracteres." });
      }
      const { fc_verifico } = req.body;
      if (fc_verifico != null && String(fc_verifico).length > 100) {
        return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
      }

      const id = Number(req.params.id);
      const existing = await prisma.plaga.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;
      const { ubicacion, ...payload } = req.body;

      let ubicacionId = existing.ubicacionId;
      if (ubicacion !== undefined) {
        if (ubicacion == null || !String(ubicacion).trim()) {
          ubicacionId = null;
        } else {
          const u = await resolverOCrearUbicacion(ubicacion);
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

        await tx.plaga.update({
          where: { id },
          data: {
            ubicacionId,
            unidadProduccion:
              payload.unidad_produccion !== undefined
                ? payload.unidad_produccion || null
                : existing.unidadProduccion,
            fecha: payload.fd_fecha ? new Date(payload.fd_fecha) : existing.fecha,
            numTrampa:
              payload.fc_num_trampa !== undefined
                ? payload.fc_num_trampa || null
                : existing.numTrampa,
            tipoTrampa:
              payload.tipo_trampa !== undefined ? payload.tipo_trampa || null : existing.tipoTrampa,
            hallazgo:
              payload.fc_hallazgo !== undefined ? payload.fc_hallazgo || null : existing.hallazgo,
            malla: payload.fc_malla !== undefined ? payload.fc_malla || null : existing.malla,
            veneno: payload.fc_veneno !== undefined ? payload.fc_veneno || null : existing.veneno,
            verifico:
              payload.fc_verifico !== undefined ? payload.fc_verifico || null : existing.verifico,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error PUT /plagas:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await prisma.plaga.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("Error DELETE /plagas:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteAll(req, res) {
    try {
      const { ubicacion } = req.query;
      if (ubicacion) {
        const where = await filtroUbicacionPlaga(ubicacion);
        await prisma.plaga.deleteMany({ where });
        res.json({ message: `Todos los registros de ${ubicacion} eliminados.` });
      } else {
        await prisma.plaga.deleteMany();
        res.json({ message: "Todos los registros eliminados (todas las ubicaciones)." });
      }
    } catch (err) {
      console.error("Error DELETE /plagas:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default BitacoraPlagaController;
