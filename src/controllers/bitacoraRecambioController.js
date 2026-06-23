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
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.recambio.create({
          data: {
            ubicacionId: u.ubicacionId,
            mes_periodo: fc_mes || null,
            pileta_id: parseOptInt(fn_num_instalacion),
            fecha_1: parseOptDate(fd_fecha1),
            tipo_1: fc_tipo1 || null,
            fecha_2: parseOptDate(fd_fecha2),
            tipo_2: fc_tipo2 || null,
            fecha_3: parseOptDate(fd_fecha3),
            tipo_3: fc_tipo3 || null,
            fecha_4: parseOptDate(fd_fecha4),
            tipo_4: fc_tipo4 || null,
            fecha_5: parseOptDate(fd_fecha5),
            tipo_5: fc_tipo5 || null,
            fecha_6: parseOptDate(fd_fecha6),
            tipo_6: fc_tipo6 || null,
            responsable: fc_responsable || null,
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
          : existing.observacion?.comentario ?? null;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.recambio.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            mes_periodo: fc_mes !== undefined ? fc_mes || null : existing.mes_periodo,
            pileta_id:
              fn_num_instalacion !== undefined
                ? parseOptInt(fn_num_instalacion)
                : existing.pileta_id,
            fecha_1: fd_fecha1 !== undefined ? parseOptDate(fd_fecha1) : existing.fecha_1,
            tipo_1: fc_tipo1 !== undefined ? fc_tipo1 || null : existing.tipo_1,
            fecha_2: fd_fecha2 !== undefined ? parseOptDate(fd_fecha2) : existing.fecha_2,
            tipo_2: fc_tipo2 !== undefined ? fc_tipo2 || null : existing.tipo_2,
            fecha_3: fd_fecha3 !== undefined ? parseOptDate(fd_fecha3) : existing.fecha_3,
            tipo_3: fc_tipo3 !== undefined ? fc_tipo3 || null : existing.tipo_3,
            fecha_4: fd_fecha4 !== undefined ? parseOptDate(fd_fecha4) : existing.fecha_4,
            tipo_4: fc_tipo4 !== undefined ? fc_tipo4 || null : existing.tipo_4,
            fecha_5: fd_fecha5 !== undefined ? parseOptDate(fd_fecha5) : existing.fecha_5,
            tipo_5: fc_tipo5 !== undefined ? fc_tipo5 || null : existing.tipo_5,
            fecha_6: fd_fecha6 !== undefined ? parseOptDate(fd_fecha6) : existing.fecha_6,
            tipo_6: fc_tipo6 !== undefined ? fc_tipo6 || null : existing.tipo_6,
            responsable: fc_responsable !== undefined ? fc_responsable || null : existing.responsable,
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
