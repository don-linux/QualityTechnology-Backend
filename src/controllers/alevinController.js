import prisma from "../prisma.js";
import { serializeInventarioAlevin } from "../utils/serializers.js";
import { resolverUbicacion, resolverOCrearUbicacion } from "../utils/ubicacion.js";

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

async function crearObservacionSiHay(tx, texto, usuarioId) {
  if (texto === undefined || texto === null || String(texto).trim() === "") return null;
  const obs = await tx.observacion.create({
    data: {
      observacion: String(texto).slice(0, 500),
      usuarioId: usuarioId ?? null,
    },
  });
  return obs.observacionId;
}

class AlevinController {
  static async getAll(req, res) {
    try {
      const alevines = await prisma.inventarioAlevin.findMany({
        include: { ubicacion: true, observacion: true },
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
        const obsId = await crearObservacionSiHay(tx, pick(req.body, "fc_observacion", "observacion"), usuarioId);
        return tx.inventarioAlevin.create({
          data: {
            ubicacionId: ubicacion.ubicacionId,
            numInstalacion: toInt(req.body.fn_num_instalacion),
            lote: pick(req.body, "fc_lote", "lote") ?? null,
            cantidad: toInt(req.body.fn_cantidad),
            talla: toDecimal(req.body.fn_talla),
            fechaSiembra: toDateOrNull(pick(req.body, "fd_fecha_siembra", "fecha_siembra")),
            fechaSalidaHormonado: toDateOrNull(
              pick(req.body, "fd_fecha_salida_hormonado", "fecha_salida_hormonado")
            ),
            usuarioId,
            observacionId: obsId,
          },
          include: { ubicacion: true, observacion: true },
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
      if (req.body.fn_num_instalacion !== undefined) updateData.numInstalacion = toInt(req.body.fn_num_instalacion);
      if (req.body.fc_lote !== undefined) updateData.lote = req.body.fc_lote ?? null;
      if (req.body.fn_cantidad !== undefined) updateData.cantidad = toInt(req.body.fn_cantidad);
      if (req.body.fn_talla !== undefined) updateData.talla = toDecimal(req.body.fn_talla);
      const fs = toDateOrNull(pick(req.body, "fd_fecha_siembra", "fecha_siembra"));
      if (fs !== null && pick(req.body, "fd_fecha_siembra", "fecha_siembra") !== undefined) {
        updateData.fechaSiembra = fs;
      }
      const fsh = toDateOrNull(pick(req.body, "fd_fecha_salida_hormonado", "fecha_salida_hormonado"));
      if (fsh !== null && pick(req.body, "fd_fecha_salida_hormonado", "fecha_salida_hormonado") !== undefined) {
        updateData.fechaSalidaHormonado = fsh;
      }

      const actualizado = await prisma.$transaction(async (tx) => {
        const obsTexto = pick(req.body, "fc_observacion", "observacion");
        if (obsTexto !== undefined) {
          const obsId = await crearObservacionSiHay(tx, obsTexto, req.user.usuario_id);
          if (obsId) updateData.observacionId = obsId;
        }
        return tx.inventarioAlevin.update({
          where: { id },
          data: updateData,
          include: { ubicacion: true, observacion: true },
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
