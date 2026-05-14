import prisma from "../prisma.js";
import { serializeInventarioAlevin } from "../utils/serializers.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { crearObservacionSiHay } from "../utils/observacion.js";

// InventarioAlevin en el schema actual reemplaza `numInstalacion` por
// `pileta_id` y `lote` por `lote_nombre`. El usuarioId pasa por @map a
// usuario_id como antes. Los aliases viejos (fn_num_instalacion, fc_lote)
// se siguen aceptando en el body para compatibilidad con el frontend.

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

class AlevinController {
  static async getAll(req, res) {
    try {
      const alevines = await prisma.inventarioAlevin.findMany({
        include: { ubicacion: true, observacion: true, piletas: true },
        orderBy: { id: "desc" },
      });
      res.json(alevines.map(serializeInventarioAlevin));
    } catch (err) {
      console.error("Error al obtener alevines:", err);
      res.status(500).json({ error: "Error al obtener alevines" });
    }
  }

  static async create(req, res) {
    try {
      const usuarioId = req.user.usuario_id;
      const ubicacionInput = pick(req.body, "ubicacion", "ubicacion_id", "ubicacionId", "fc_granja", "granja");
      const ubicacion = await resolverOCrearUbicacion(ubicacionInput);
      if (!ubicacion) {
        return res.status(400).json({ error: "ubicacion/granja es obligatoria" });
      }

      const creado = await prisma.$transaction(async (tx) => {
        const piletaIdObs = toInt(pick(req.body, "pileta_id", "fn_num_instalacion"));
        const obsId = await crearObservacionSiHay(
          tx,
          pick(req.body, "fc_observacion", "observacion"),
          usuarioId,
          {
            piletaId: piletaIdObs != null ? piletaIdObs : undefined,
            proceso: "inventario_alevin",
          },
        );
        return tx.inventarioAlevin.create({
          data: {
            ubicacionId: ubicacion.ubicacionId,
            pileta_id: toInt(pick(req.body, "pileta_id", "fn_num_instalacion")),
            lote_nombre: pick(req.body, "lote_nombre", "fc_lote", "lote") ?? null,
            cantidad: toInt(req.body.fn_cantidad ?? req.body.cantidad),
            talla: toDecimal(req.body.fn_talla ?? req.body.talla),
            fechaSiembra: toDateOrNull(pick(req.body, "fd_fecha_siembra", "fecha_siembra")),
            fechaSalidaHormonado: toDateOrNull(
              pick(req.body, "fd_fecha_salida_hormonado", "fecha_salida_hormonado")
            ),
            usuarioId,
            observacionId: obsId,
          },
          include: { ubicacion: true, observacion: true, piletas: true },
        });
      });

      res.status(201).json(serializeInventarioAlevin(creado));
    } catch (err) {
      console.error("Error al insertar alevines:", err);
      res.status(500).json({ error: "Error al insertar alevines" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const updateData = {};
      const ubicacionInput = pick(req.body, "ubicacion", "ubicacion_id", "ubicacionId", "fc_granja", "granja");
      if (ubicacionInput !== undefined) {
        const ubicacion = await resolverOCrearUbicacion(ubicacionInput);
        if (!ubicacion) return res.status(400).json({ error: "ubicacion/granja invalida" });
        updateData.ubicacionId = ubicacion.ubicacionId;
      }
      const piletaIn = pick(req.body, "pileta_id", "fn_num_instalacion");
      if (piletaIn !== undefined) updateData.pileta_id = toInt(piletaIn);

      const loteIn = pick(req.body, "lote_nombre", "fc_lote", "lote");
      if (loteIn !== undefined) updateData.lote_nombre = loteIn ?? null;

      if (req.body.fn_cantidad !== undefined || req.body.cantidad !== undefined) {
        updateData.cantidad = toInt(req.body.fn_cantidad ?? req.body.cantidad);
      }
      if (req.body.fn_talla !== undefined || req.body.talla !== undefined) {
        updateData.talla = toDecimal(req.body.fn_talla ?? req.body.talla);
      }
      const fs = pick(req.body, "fd_fecha_siembra", "fecha_siembra");
      if (fs !== undefined) updateData.fechaSiembra = toDateOrNull(fs);

      const fsh = pick(req.body, "fd_fecha_salida_hormonado", "fecha_salida_hormonado");
      if (fsh !== undefined) updateData.fechaSalidaHormonado = toDateOrNull(fsh);

      const actualizado = await prisma.$transaction(async (tx) => {
        const obsTexto = pick(req.body, "fc_observacion", "observacion");
        if (obsTexto !== undefined) {
          const obsId = await crearObservacionSiHay(tx, obsTexto, req.user.usuario_id);
          if (obsId) updateData.observacionId = obsId;
        }
        return tx.inventarioAlevin.update({
          where: { id },
          data: updateData,
          include: { ubicacion: true, observacion: true, piletas: true },
        });
      });

      res.json(serializeInventarioAlevin(actualizado));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Alevin no encontrado" });
      console.error("Error al actualizar alevines:", err);
      res.status(500).json({ error: "Error al actualizar alevines" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.inventarioAlevin.delete({ where: { id } });
      res.json({ mensaje: "Alevin eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Alevin no encontrado" });
      console.error("Error al eliminar alevines:", err);
      res.status(500).json({ error: "Error al eliminar alevines" });
    }
  }
}

export default AlevinController;
