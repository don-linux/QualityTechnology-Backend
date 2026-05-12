import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeBitacoraInsumo } from "../utils/serializers.js";

const LIMITES_INSUMOS = {
  fc_cantidad_udm: 100,
  fc_num_lote: 100,
  fc_descripcion: 300,
  fc_observaciones: 500,
  fc_encargado_entrega: 100,
  fc_encargado_recepcion: 100,
  ubicacion: 50,
};

const validarLongitudesInsumos = (body) => {
  const etiquetas = {
    fc_cantidad_udm: "La cantidad UdM",
    fc_num_lote: "El número de lote",
    fc_descripcion: "La descripción",
    fc_observaciones: "Las observaciones",
    fc_encargado_entrega: "El encargado de entrega",
    fc_encargado_recepcion: "El encargado de recepción",
    ubicacion: "La ubicación",
  };
  for (const [campo, max] of Object.entries(LIMITES_INSUMOS)) {
    const len = body[campo] == null ? 0 : String(body[campo]).length;
    if (len > max) {
      return `${etiquetas[campo]} no puede superar los ${max} caracteres.`;
    }
  }
  return null;
};

const inc = { ubicacion: true, observacion: true };

class BitacoraInsumoController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.insumo.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeBitacoraInsumo));
    } catch (err) {
      console.error("GET ERROR:", err);
      res.status(500).json({ error: "Error obteniendo insumos" });
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
      const errorLongitud = validarLongitudesInsumos(req.body);
      if (errorLongitud) {
        return res.status(400).json({ error: errorLongitud });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const fi_usuario_id = req.user.usuario_id;
      const {
        fd_fecha,
        fc_cantidad_udm,
        fc_num_lote,
        fc_descripcion,
        fc_observaciones,
        fc_encargado_entrega,
        fc_encargado_recepcion,
      } = req.body;

      const id = await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: fc_observaciones,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        const row = await tx.insumo.create({
          data: {
            ubicacionId: u.ubicacionId,
            fecha: fd_fecha ? new Date(fd_fecha) : new Date(),
            cantidadUdm: fc_cantidad_udm || null,
            numero_lote: fc_num_lote || null,
            descripcion: fc_descripcion || null,
            encargadoEntrega: fc_encargado_entrega || null,
            encargadoRecepcion: fc_encargado_recepcion || null,
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
      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }
      const errorLongitud = validarLongitudesInsumos(req.body);
      if (errorLongitud) {
        return res.status(400).json({ error: errorLongitud });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.insumo.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const fi_usuario_id = req.user.usuario_id;
      const {
        fd_fecha,
        fc_cantidad_udm,
        fc_num_lote,
        fc_descripcion,
        fc_observaciones,
        fc_encargado_entrega,
        fc_encargado_recepcion,
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

        await tx.insumo.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            fecha: fd_fecha ? new Date(fd_fecha) : existing.fecha,
            cantidadUdm: fc_cantidad_udm || null,
            numero_lote: fc_num_lote || null,
            descripcion: fc_descripcion || null,
            encargadoEntrega: fc_encargado_entrega || null,
            encargadoRecepcion: fc_encargado_recepcion || null,
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

  static async delete(req, res) {
    try {
      await prisma.insumo.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Registro eliminado" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("DELETE ERROR:", err);
      res.status(500).json({ error: "Error eliminando registro" });
    }
  }

  static async deleteAll(req, res) {
    try {
      await prisma.insumo.deleteMany();
      res.json({ message: "Todos los registros de insumos fueron eliminados." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default BitacoraInsumoController;
