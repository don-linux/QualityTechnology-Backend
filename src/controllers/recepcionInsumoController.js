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
      const { cantidad: cantidadRaw, observaciones } = req.body;

      const cantidad = parseFloat(cantidadRaw);
      if (cantidadRaw === undefined || cantidadRaw === "" || Number.isNaN(cantidad) || cantidad < 0) {
        return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
      }
      if (observaciones && observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }
      const { encargado_entrega, verificador } = req.body;
      if (encargado_entrega != null && String(encargado_entrega).length > 100) {
        return res
          .status(400)
          .json({ error: "El campo encargado de entrega no puede superar los 100 caracteres." });
      }
      if (verificador != null && String(verificador).length > 100) {
        return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
      }

      const usuarioId = req.user.usuario_id;

      let ubicacionId = null;
      if (req.body.ubicacion != null && String(req.body.ubicacion).trim()) {
        const u = await resolverOCrearUbicacion(req.body.ubicacion);
        ubicacionId = u?.ubicacionId ?? null;
      }

      const {
        fecha,
        proveedor_nombre,
        producto,
        numero_lote,
        unidad_medida,
        condiciones_entrega,
      } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: observaciones,
          responsable: null,
          usuarioId,
        });

        await tx.recepcionInsumo.create({
          data: {
            ubicacionId,
            fecha: fecha ? new Date(fecha) : new Date(),
            proveedor_nombre: proveedor_nombre || null,
            producto: producto || null,
            unidadMedida: unidad_medida || null,
            cantidad: String(cantidad),
            numero_lote: numero_lote || null,
            condicionesEntrega: condiciones_entrega || null,
            encargadoEntrega: encargado_entrega || null,
            verificador: verificador || null,
            usuarioId,
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
      const { cantidad: cantidadRaw, observaciones } = req.body;

      const cantidad = parseFloat(cantidadRaw);
      if (cantidadRaw === undefined || cantidadRaw === "" || Number.isNaN(cantidad) || cantidad < 0) {
        return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
      }
      if (observaciones && observaciones.length > 500) {
        return res
          .status(400)
          .json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }
      const { encargado_entrega, verificador } = req.body;
      if (encargado_entrega != null && String(encargado_entrega).length > 100) {
        return res
          .status(400)
          .json({ error: "El campo encargado de entrega no puede superar los 100 caracteres." });
      }
      if (verificador != null && String(verificador).length > 100) {
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

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;

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
        fecha,
        proveedor_nombre,
        producto,
        numero_lote,
        unidad_medida,
        condiciones_entrega,
      } = req.body;

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

        await tx.recepcionInsumo.update({
          where: { id },
          data: {
            ubicacionId,
            fecha: fecha ? new Date(fecha) : existing.fecha,
            proveedor_nombre:
              proveedor_nombre !== undefined ? proveedor_nombre || null : existing.proveedor_nombre,
            producto: producto !== undefined ? producto || null : existing.producto,
            unidadMedida:
              unidad_medida !== undefined ? unidad_medida || null : existing.unidadMedida,
            cantidad: String(cantidad),
            numero_lote: numero_lote !== undefined ? numero_lote || null : existing.numero_lote,
            condicionesEntrega:
              condiciones_entrega !== undefined
                ? condiciones_entrega || null
                : existing.condicionesEntrega,
            encargadoEntrega:
              encargado_entrega !== undefined
                ? encargado_entrega || null
                : existing.encargadoEntrega,
            verificador: verificador !== undefined ? verificador || null : existing.verificador,
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
