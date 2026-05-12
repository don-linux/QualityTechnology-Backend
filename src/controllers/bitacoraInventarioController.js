import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion } from "../utils/bitacoraHelpers.js";
import { serializeInventarioAlevin } from "../utils/serializers.js";

class BitacoraInventarioController {
  static parseNum(v) {
    return v === "" || v == null ? null : Number(v);
  }

  static async getAll(req, res) {
    try {
      const rows = await prisma.inventarioAlevin.findMany({
        include: { ubicacion: true, observacion: true },
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeInventarioAlevin));
    } catch (err) {
      console.error("Error en GET /inventario:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const {
        fn_num_instalacion,
        fn_cantidad,
        fn_talla,
        fc_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_salida_hormonado,
      } = req.body;
      const fi_usuario_id = req.user.usuario_id;

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: fc_observacion,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.inventarioAlevin.create({
          data: {
            ubicacionId: u.ubicacionId,
            pileta_id:
              BitacoraInventarioController.parseNum(fn_num_instalacion) != null
                ? Math.trunc(BitacoraInventarioController.parseNum(fn_num_instalacion))
                : null,
            cantidad:
              BitacoraInventarioController.parseNum(fn_cantidad) != null
                ? Math.trunc(BitacoraInventarioController.parseNum(fn_cantidad))
                : null,
            talla:
              BitacoraInventarioController.parseNum(fn_talla) != null
                ? String(BitacoraInventarioController.parseNum(fn_talla))
                : null,
            lote_nombre: fc_lote || null,
            fechaSiembra: fd_fecha_siembra ? new Date(fd_fecha_siembra) : null,
            fechaSalidaHormonado: fd_fecha_salida_hormonado
              ? new Date(fd_fecha_salida_hormonado)
              : null,
            usuarioId: fi_usuario_id,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro agregado correctamente" });
    } catch (err) {
      console.error("Error en POST /inventario:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const {
        fn_num_instalacion,
        fn_cantidad,
        fn_talla,
        fc_lote,
        fc_observacion,
        fd_fecha_siembra,
        fd_fecha_salida_hormonado,
      } = req.body;

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.inventarioAlevin.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const fi_usuario_id = req.user?.usuario_id ?? existing.usuarioId;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto:
            fc_observacion !== undefined
              ? fc_observacion
              : existing.observacion?.comentario ?? null,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.inventarioAlevin.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            pileta_id:
              BitacoraInventarioController.parseNum(fn_num_instalacion) != null
                ? Math.trunc(BitacoraInventarioController.parseNum(fn_num_instalacion))
                : null,
            cantidad:
              BitacoraInventarioController.parseNum(fn_cantidad) != null
                ? Math.trunc(BitacoraInventarioController.parseNum(fn_cantidad))
                : null,
            talla:
              BitacoraInventarioController.parseNum(fn_talla) != null
                ? String(BitacoraInventarioController.parseNum(fn_talla))
                : null,
            lote_nombre: fc_lote || null,
            fechaSiembra: fd_fecha_siembra ? new Date(fd_fecha_siembra) : null,
            fechaSalidaHormonado: fd_fecha_salida_hormonado
              ? new Date(fd_fecha_salida_hormonado)
              : null,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error en PUT /inventario:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await prisma.inventarioAlevin.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("Error en DELETE /inventario:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteAll(req, res) {
    try {
      await prisma.inventarioAlevin.deleteMany();
      res.json({ message: "Todos los registros de inventario fueron eliminados correctamente." });
    } catch (err) {
      console.error("Error al eliminar registros de inventario:", err);
      res.status(500).json({ error: "Error eliminando todos los registros de inventario." });
    }
  }
}

export default BitacoraInventarioController;
