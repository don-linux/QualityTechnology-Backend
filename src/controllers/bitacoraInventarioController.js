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
        pileta_id,
        cantidad,
        talla,
        lote_nombre,
        observacion,
        fecha_siembra,
        fecha_salida_hormonado,
      } = req.body;
      const usuarioId = req.user.usuario_id;

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: observacion,
          responsable: null,
          usuarioId,
        });

        await tx.inventarioAlevin.create({
          data: {
            ubicacionId: u.ubicacionId,
            pileta_id:
              BitacoraInventarioController.parseNum(pileta_id) != null
                ? Math.trunc(BitacoraInventarioController.parseNum(pileta_id))
                : null,
            cantidad:
              BitacoraInventarioController.parseNum(cantidad) != null
                ? Math.trunc(BitacoraInventarioController.parseNum(cantidad))
                : null,
            talla:
              BitacoraInventarioController.parseNum(talla) != null
                ? String(BitacoraInventarioController.parseNum(talla))
                : null,
            lote_nombre: lote_nombre || null,
            fechaSiembra: fecha_siembra ? new Date(fecha_siembra) : null,
            fechaSalidaHormonado: fecha_salida_hormonado
              ? new Date(fecha_salida_hormonado)
              : null,
            usuarioId,
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
        pileta_id,
        cantidad,
        talla,
        lote_nombre,
        observacion,
        fecha_siembra,
        fecha_salida_hormonado,
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

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto:
            observacion !== undefined
              ? observacion
              : existing.observacion?.comentario ?? null,
          responsable: null,
          usuarioId,
        });

        await tx.inventarioAlevin.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            pileta_id:
              BitacoraInventarioController.parseNum(pileta_id) != null
                ? Math.trunc(BitacoraInventarioController.parseNum(pileta_id))
                : null,
            cantidad:
              BitacoraInventarioController.parseNum(cantidad) != null
                ? Math.trunc(BitacoraInventarioController.parseNum(cantidad))
                : null,
            talla:
              BitacoraInventarioController.parseNum(talla) != null
                ? String(BitacoraInventarioController.parseNum(talla))
                : null,
            lote_nombre: lote_nombre || null,
            fechaSiembra: fecha_siembra ? new Date(fecha_siembra) : null,
            fechaSalidaHormonado: fecha_salida_hormonado
              ? new Date(fecha_salida_hormonado)
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

}

export default BitacoraInventarioController;
