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

      const fi_usuario_id = req.user.usuario_id;
      const {
        fc_mes,
        fn_num_instalacion,
        fd_fecha1,
        fc_tipo1,
        fd_fecha2,
        fc_tipo2,
        fd_fecha3,
        fc_tipo3,
        fd_fecha4,
        fc_tipo4,
        fd_fecha5,
        fc_tipo5,
        fd_fecha6,
        fc_tipo6,
        fc_responsable,
        fc_observaciones,
      } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: fc_observaciones ?? null,
          responsable: fc_responsable ?? null,
          usuarioId: fi_usuario_id,
        });

        await tx.recambio.create({
          data: {
            ubicacionId: u.ubicacionId,
            mes: fc_mes || null,
            numInstalacion: parseOptInt(fn_num_instalacion),
            fecha1: parseOptDate(fd_fecha1),
            tipo1: fc_tipo1 || null,
            fecha2: parseOptDate(fd_fecha2),
            tipo2: fc_tipo2 || null,
            fecha3: parseOptDate(fd_fecha3),
            tipo3: fc_tipo3 || null,
            fecha4: parseOptDate(fd_fecha4),
            tipo4: fc_tipo4 || null,
            fecha5: parseOptDate(fd_fecha5),
            tipo5: fc_tipo5 || null,
            fecha6: parseOptDate(fd_fecha6),
            tipo6: fc_tipo6 || null,
            usuarioId: fi_usuario_id,
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

      const fi_usuario_id = req.user?.usuario_id ?? existing.usuarioId;

      const {
        fc_mes,
        fn_num_instalacion,
        fd_fecha1,
        fc_tipo1,
        fd_fecha2,
        fc_tipo2,
        fd_fecha3,
        fc_tipo3,
        fd_fecha4,
        fc_tipo4,
        fd_fecha5,
        fc_tipo5,
        fd_fecha6,
        fc_tipo6,
        fc_responsable,
        fc_observaciones,
      } = req.body;

      const texto =
        fc_observaciones !== undefined
          ? fc_observaciones
          : existing.observacion?.observacion ?? null;
      const responsable =
        fc_responsable !== undefined
          ? fc_responsable
          : existing.observacion?.responsable ?? null;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto,
          responsable,
          usuarioId: fi_usuario_id,
        });

        await tx.recambio.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            mes: fc_mes !== undefined ? fc_mes || null : existing.mes,
            numInstalacion:
              fn_num_instalacion !== undefined
                ? parseOptInt(fn_num_instalacion)
                : existing.numInstalacion,
            fecha1: fd_fecha1 !== undefined ? parseOptDate(fd_fecha1) : existing.fecha1,
            tipo1: fc_tipo1 !== undefined ? fc_tipo1 || null : existing.tipo1,
            fecha2: fd_fecha2 !== undefined ? parseOptDate(fd_fecha2) : existing.fecha2,
            tipo2: fc_tipo2 !== undefined ? fc_tipo2 || null : existing.tipo2,
            fecha3: fd_fecha3 !== undefined ? parseOptDate(fd_fecha3) : existing.fecha3,
            tipo3: fc_tipo3 !== undefined ? fc_tipo3 || null : existing.tipo3,
            fecha4: fd_fecha4 !== undefined ? parseOptDate(fd_fecha4) : existing.fecha4,
            tipo4: fc_tipo4 !== undefined ? fc_tipo4 || null : existing.tipo4,
            fecha5: fd_fecha5 !== undefined ? parseOptDate(fd_fecha5) : existing.fecha5,
            tipo5: fc_tipo5 !== undefined ? fc_tipo5 || null : existing.tipo5,
            fecha6: fd_fecha6 !== undefined ? parseOptDate(fd_fecha6) : existing.fecha6,
            tipo6: fc_tipo6 !== undefined ? fc_tipo6 || null : existing.tipo6,
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

  static async delete(req, res) {
    try {
      await prisma.recambio.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("Error DELETE /recambios:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteAll(req, res) {
    try {
      await prisma.recambio.deleteMany();
      res.json({ message: "Todos los registros de recambios fueron eliminados correctamente." });
    } catch (err) {
      console.error("Error al eliminar registros de recambios:", err);
      res.status(500).json({ error: "Error eliminando todos los registros de recambios." });
    }
  }
}

export default BitacoraRecambioController;
