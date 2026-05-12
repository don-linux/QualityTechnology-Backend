import prisma from "../prisma.js";
import { serializeLote } from "../utils/serializers.js";
import { resolverUbicacion, resolverOCrearUbicacion } from "../utils/ubicacion.js";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const REGEX_DECIMAL = /^\d+(\.\d+)?$/;

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

function validarCamposLote({ huevos_ml, huevos, observacion }) {
  const valorHuevos = huevos_ml ?? huevos;
  if (valorHuevos !== undefined && valorHuevos !== null && valorHuevos !== "") {
    const valor = String(valorHuevos);
    if (valor.length > MAX_NUMERICO) {
      return `Los huevos no pueden superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_DECIMAL.test(valor)) {
      return "Los huevos deben ser un numero (puede incluir decimales).";
    }
  }
  if (observacion && observacion.length > MAX_OBSERVACION) {
    return `La observacion no puede superar los ${MAX_OBSERVACION} caracteres.`;
  }
  return null;
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

class LoteController {
  static async getInstalaciones(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const instalaciones = await prisma.instalacion.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        orderBy: { nombreInstalacion: "asc" },
        select: { instalacionId: true, nombreInstalacion: true },
      });
      res.json(
        instalaciones.map((i) => ({
          fi_instalacion_id: i.instalacionId,
          nombre_instalacion: i.nombreInstalacion,
        }))
      );
    } catch (err) {
      console.error("Error al obtener instalaciones:", err);
      res.status(500).json({ error: "Error obteniendo instalaciones" });
    }
  }

  static async getInstalacionesReproductores(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const instalaciones = await prisma.instalacion.findMany({
        where: {
          ubicacionId: ubicacion.ubicacionId,
          reproductores: { some: {} },
        },
        orderBy: { nombreInstalacion: "asc" },
        select: { instalacionId: true, nombreInstalacion: true },
      });
      res.json(
        instalaciones.map((i) => ({
          fi_instalacion_id: i.instalacionId,
          nombre_instalacion: i.nombreInstalacion,
        }))
      );
    } catch (err) {
      console.error("Error obteniendo instalaciones de reproductores:", err);
      res.status(500).json({ error: "Error obteniendo instalaciones de reproductores" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const lotes = await prisma.lote.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { instalacion: true, ubicacion: true, observacion: true },
        orderBy: { fecha: "desc" },
      });
      res.json(lotes.map(serializeLote));
    } catch (err) {
      console.error("Error al obtener lotes por granja:", err);
      res.status(500).json({ error: "Error obteniendo lotes por granja" });
    }
  }

  static async create(req, res) {
    try {
      const error = validarCamposLote(req.body);
      if (error) return res.status(400).json({ error });

      const instalacionId = toInt(pick(req.body, "fc_instalacion_id", "fi_instalacion_id", "instalacion_id"));
      if (!instalacionId) {
        return res.status(400).json({ error: "Debe seleccionar una instalacion" });
      }
      const noLote = pick(req.body, "no_lote", "noLote");
      if (!noLote) {
        return res.status(400).json({ error: "no_lote es obligatorio" });
      }

      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");
      const ubicacion = await resolverOCrearUbicacion(granjaInput);
      if (!ubicacion) {
        return res.status(400).json({ error: "granja/ubicacion invalida" });
      }

      const huevos = toDecimal(pick(req.body, "huevos_ml", "huevos"));
      const fecha = toDateOrNull(pick(req.body, "fecha", "fd_fecha")) || new Date();
      const ovadas = toInt(req.body.ovadas, 0) ?? 0;
      const alevinesInicial = toInt(req.body.alevines_inicial, 0) ?? 0;
      const mortalidad = toInt(req.body.mortalidad, 0) ?? 0;
      const familia = pick(req.body, "familia") ?? "";

      const creado = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, req.body.observacion, req.user.usuario_id);
        return tx.lote.create({
          data: {
            instalacionId,
            fecha,
            familia: String(familia),
            noLote: String(noLote),
            huevosMl: huevos,
            ovadas,
            alevinesInicial,
            mortalidad,
            ubicacionId: ubicacion.ubicacionId,
            usuarioId: req.user.usuario_id,
            observacionId: obsId,
          },
          include: { instalacion: true, ubicacion: true, observacion: true },
        });
      });

      res.status(201).json({
        success: true,
        message: "Lote registrado correctamente",
        data: serializeLote(creado),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un lote registrado con ese numero ('no_lote')." });
      }
      console.error("Error al registrar lote:", err);
      res.status(500).json({ error: "Error al registrar lote" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const error = validarCamposLote(req.body);
      if (error) return res.status(400).json({ error });

      const updateData = {};

      const instalacionId = toInt(pick(req.body, "fc_instalacion_id", "fi_instalacion_id", "instalacion_id"));
      if (instalacionId !== null) updateData.instalacionId = instalacionId;

      const noLote = pick(req.body, "no_lote", "noLote");
      if (noLote !== undefined) updateData.noLote = String(noLote);

      const familia = pick(req.body, "familia");
      if (familia !== undefined) updateData.familia = String(familia);

      const fecha = toDateOrNull(pick(req.body, "fecha", "fd_fecha"));
      if (fecha) updateData.fecha = fecha;

      if (req.body.huevos_ml !== undefined || req.body.huevos !== undefined) {
        updateData.huevosMl = toDecimal(pick(req.body, "huevos_ml", "huevos"));
      }
      if (req.body.ovadas !== undefined) updateData.ovadas = toInt(req.body.ovadas, 0) ?? 0;
      if (req.body.mortalidad !== undefined) updateData.mortalidad = toInt(req.body.mortalidad, 0) ?? 0;
      if (req.body.alevines_inicial !== undefined) updateData.alevinesInicial = toInt(req.body.alevines_inicial, 0) ?? 0;

      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");
      if (granjaInput !== undefined) {
        const ubicacion = await resolverOCrearUbicacion(granjaInput);
        if (!ubicacion) return res.status(400).json({ error: "granja/ubicacion invalida" });
        updateData.ubicacionId = ubicacion.ubicacionId;
      }

      const lote = await prisma.$transaction(async (tx) => {
        if (req.body.observacion !== undefined) {
          const obsId = await crearObservacionSiHay(tx, req.body.observacion, req.user.usuario_id);
          if (obsId) updateData.observacionId = obsId;
        }
        return tx.lote.update({
          where: { loteId: id },
          data: updateData,
          include: { instalacion: true, ubicacion: true, observacion: true },
        });
      });

      res.json({
        success: true,
        message: "Lote actualizado correctamente",
        data: serializeLote(lote),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Lote no encontrado" });
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un lote registrado con ese numero ('no_lote')." });
      }
      console.error("Error al actualizar lote:", err);
      res.status(500).json({ error: "Error al actualizar lote" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.$transaction(async (tx) => {
        await tx.pileta.updateMany({
          where: { loteId: id },
          data: { loteId: null },
        });
        await tx.loteMovimiento.deleteMany({ where: { loteId: id } });
        await tx.trazaAlevinaje.deleteMany({ where: { loteId: id } });

        const engordas = await tx.engorda.findMany({
          where: { loteId: id },
          select: { engordaId: true },
        });
        const engordaIds = engordas.map((e) => e.engordaId);
        if (engordaIds.length > 0) {
          await tx.trazaEngorda.deleteMany({
            where: {
              OR: [
                { engordaOrigen: { in: engordaIds } },
                { engordaDestino: { in: engordaIds } },
              ],
            },
          });
          await tx.alimento.deleteMany({ where: { engordaId: { in: engordaIds } } });
        }
        await tx.engorda.deleteMany({ where: { loteId: id } });
        await tx.lote.delete({ where: { loteId: id } });
      });

      res.json({
        success: true,
        message: "Lote eliminado correctamente y sus modulos en cascada",
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Lote no encontrado" });
      console.error("Error al eliminar lote en cascada:", err);
      res.status(500).json({ error: "Error al eliminar lote" });
    }
  }

  static async getByInstalacion(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.json([]);
      const lotes = await prisma.lote.findMany({
        where: { instalacionId: id },
        orderBy: { loteId: "desc" },
        select: { loteId: true, noLote: true },
      });
      res.json(lotes.map((l) => ({ fi_lote_id: l.loteId, no_lote: l.noLote })));
    } catch (err) {
      console.error("Error al obtener lotes por instalacion:", err);
      res.status(500).json({ error: "Error al obtener lotes por instalacion" });
    }
  }

  static async getFamiliaPorInstalacion(req, res) {
    try {
      const instalacionId = toInt(req.params.instalacionId);
      if (!instalacionId) return res.json(null);
      const reproductor = await prisma.reproductor.findFirst({
        where: { instalacionId },
        select: { familia: true },
      });
      if (!reproductor) return res.json(null);
      res.json({ familia: reproductor.familia });
    } catch (error) {
      console.error("Error cargando familia:", error);
      res.status(500).json({ error: "Error cargando familia" });
    }
  }
}

export default LoteController;
