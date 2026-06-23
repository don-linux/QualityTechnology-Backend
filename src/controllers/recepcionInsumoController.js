import prisma from "../prisma.js";
import { resolverOCrearUbicacion, resolverUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeRecepcionInsumo } from "../utils/serializers.js";

const inc = { ubicacion: true, observacion: true };

async function filtroUbicacionRecepcion(ubicacionQuery) {
  if (!ubicacionQuery || !String(ubicacionQuery).trim()) return {};
  const u = await resolverUbicacion(ubicacionQuery);
  if (u) return { ubicacionId: u.ubicacionId };
  return { ubicacion: { nombre: String(ubicacionQuery).trim() } };
}

class RecepcionInsumoController {
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
      const where = await filtroUbicacionRecepcion(ubicacion);
      const rows = await prisma.recepcionInsumo.findMany({
        where,
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeRecepcionInsumo));
    } catch (err) {
      console.error("Error GET /recepcion_insumos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { fc_cantidad, fc_observaciones } = req.body;

      const cantidad = parseFloat(fc_cantidad);
      if (fc_cantidad === undefined || fc_cantidad === "" || Number.isNaN(cantidad) || cantidad < 0) {
        return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
      }
      if (fc_observaciones && fc_observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }
      const { fc_encargado_entrega, fc_verifico } = req.body;
      if (fc_encargado_entrega != null && String(fc_encargado_entrega).length > 100) {
        return res
          .status(400)
          .json({ error: "El campo encargado de entrega no puede superar los 100 caracteres." });
      }
      if (fc_verifico != null && String(fc_verifico).length > 100) {
        return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
      }

      const fi_usuario_id = req.user.usuario_id;

      let ubicacionId = null;
      if (req.body.ubicacion != null && String(req.body.ubicacion).trim()) {
        const u = await resolverOCrearUbicacion(req.body.ubicacion);
        ubicacionId = u?.ubicacionId ?? null;
      }

      const {
        fd_fecha,
        fc_proveedor,
        fc_producto,
        fc_lote,
        fc_unidad_medida,
        fc_condiciones_entrega,
      } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: fc_observaciones,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.recepcionInsumo.create({
          data: {
            ubicacionId,
            fecha: fd_fecha ? new Date(fd_fecha) : new Date(),
            proveedor_nombre: fc_proveedor || null,
            producto: fc_producto || null,
            unidadMedida: fc_unidad_medida || null,
            cantidad: String(cantidad),
            numero_lote: fc_lote || null,
            condicionesEntrega: fc_condiciones_entrega || null,
            encargadoEntrega: fc_encargado_entrega || null,
            verificador: fc_verifico || null,
            usuarioId: fi_usuario_id,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro agregado correctamente" });
    } catch (err) {
      console.error("Error POST /recepcion_insumos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { fc_cantidad, fc_observaciones } = req.body;

      const cantidad = parseFloat(fc_cantidad);
      if (fc_cantidad === undefined || fc_cantidad === "" || Number.isNaN(cantidad) || cantidad < 0) {
        return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
      }
      if (fc_observaciones && fc_observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }
      const { fc_encargado_entrega, fc_verifico } = req.body;
      if (fc_encargado_entrega != null && String(fc_encargado_entrega).length > 100) {
        return res
          .status(400)
          .json({ error: "El campo encargado de entrega no puede superar los 100 caracteres." });
      }
      if (fc_verifico != null && String(fc_verifico).length > 100) {
        return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
      }

      const id = Number(req.params.id);
      const existing = await prisma.recepcionInsumo.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const fi_usuario_id = req.user?.usuario_id ?? existing.usuarioId;

      let ubicacionId = existing.ubicacionId;
      if (req.body.ubicacion !== undefined) {
        if (req.body.ubicacion == null || !String(req.body.ubicacion).trim()) {
          ubicacionId = null;
        } else {
          const u = await resolverOCrearUbicacion(req.body.ubicacion);
          ubicacionId = u?.ubicacionId ?? null;
        }
      }

      const {
        fd_fecha,
        fc_proveedor,
        fc_producto,
        fc_lote,
        fc_unidad_medida,
        fc_condiciones_entrega,
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

        await tx.recepcionInsumo.update({
          where: { id },
          data: {
            ubicacionId,
            fecha: fd_fecha ? new Date(fd_fecha) : existing.fecha,
            proveedor_nombre:
              fc_proveedor !== undefined ? fc_proveedor || null : existing.proveedor_nombre,
            producto: fc_producto !== undefined ? fc_producto || null : existing.producto,
            unidadMedida:
              fc_unidad_medida !== undefined ? fc_unidad_medida || null : existing.unidadMedida,
            cantidad: String(cantidad),
            numero_lote: fc_lote !== undefined ? fc_lote || null : existing.numero_lote,
            condicionesEntrega:
              fc_condiciones_entrega !== undefined
                ? fc_condiciones_entrega || null
                : existing.condicionesEntrega,
            encargadoEntrega:
              fc_encargado_entrega !== undefined
                ? fc_encargado_entrega || null
                : existing.encargadoEntrega,
            verificador: fc_verifico !== undefined ? fc_verifico || null : existing.verificador,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error PUT /recepcion_insumos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

}

export default RecepcionInsumoController;
