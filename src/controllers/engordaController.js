import prisma from "../prisma.js";
import { serializeEngorda } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { aplicarEstadoPiletaPorCantidad } from "../utils/reproductorInventario.js";
import { resolverHistorialPesoId } from "./historialPesoController.js";
import { crearSiembraMovimiento } from "../utils/siembraMovimiento.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import { cantidadVigenteEnPileta, ultimoRegistroPorPileta } from "../utils/inventarioVigente.js";

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

async function assertSiembraOrigenValidaParaPileta(tx, siembraOrigenId, piletaEngordaId) {
  if (!siembraOrigenId) return;
  const s = await tx.siembra.findUnique({
    where: { id: siembraOrigenId },
    select: { id: true, pileta_destino: true },
  });
  if (!s) {
    const err = new Error("siembra_origen_id inválido");
    err.code = "BAD_SIEMBRA";
    throw err;
  }
  if (Number(s.pileta_destino) !== Number(piletaEngordaId)) {
    const err = new Error(
      "La siembra seleccionada debe tener como destino la misma pileta de engorda",
    );
    err.code = "SIEMBRA_DESTINO";
    throw err;
  }
}

const engordaInclude = {
  piletas: {
    include: {
      ubicacion: true,
      observaciones: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { comentario: true, proceso: true, created_at: true },
      },
    },
  },
  observacion: true,
  biometrias: { include: { observacionBiometria: true } },
  siembra_origen: {
    include: {
      piletas_siembra_pileta_origenTopiletas: {
        include: { reproductores: true },
      },
    },
  },
  historial_peso: true,
};

class EngordaController {
  static async getAll(req, res) {
    try {
      const piletaIdQ = toInt(req.query.pileta_id);
      const where = {};
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (ubicClause) where.piletas = ubicClause;
      if (piletaIdQ) where.pileta_id = piletaIdQ;

      const rows = await prisma.engorda.findMany({
        where,
        include: engordaInclude,
        orderBy: { id: "desc" },
      });

      const historial =
        req.query.historial === "1" ||
        String(req.query.historial || "").toLowerCase() === "true";
      const vista = historial ? rows : ultimoRegistroPorPileta(rows);
      res.json(vista.map(serializeEngorda));
    } catch (err) {
      console.error("GET /engorda Error:", err);
      res.status(500).json({ error: "Error obteniendo registros de engorda" });
    }
  }

  static async getByGranja(req, res) {
    return EngordaController.getAll(req, res);
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      const row = await prisma.engorda.findUnique({
        where: { id },
        include: engordaInclude,
      });
      if (!row) return res.status(404).json({ error: "Registro no encontrado" });
      res.json(serializeEngorda(row));
    } catch (err) {
      console.error("GET /engorda/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo registro" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(
        pick(req.body, "pileta_id", "pileta_destino_id"),
      );
      const cantidadTotal = Math.max(
        0,
        toInt(pick(req.body, "cantidad_total", "cantidad"), 0) ?? 0,
      );
      const cantidadAlimento = Math.max(
        0,
        toInt(pick(req.body, "cantidad_alimento"), 0) ?? 0,
      );

      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id (pileta de engorda) es obligatorio" });
      }
      if (cantidadTotal <= 0) {
        return res.status(400).json({ error: "cantidad_total debe ser mayor a 0" });
      }

      const pil = await prisma.pileta.findUnique({
        where: { id: piletaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Pileta no existe" });
      if (pil.tipo !== "engorda") {
        return res.status(400).json({
          error: `La pileta '${pil.nombre}' debe ser tipo engorda`,
        });
      }

      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "observaciones");
      const siembraOrigenIdBody = toInt(pick(req.body, "siembra_origen_id"));
      const origenPiletaId = toInt(
        pick(req.body, "origen_pileta_id", "origenPiletaId"),
      );
      const biometriaId = toInt(pick(req.body, "biometria_id"));

      const creado = await prisma.$transaction(async (tx) => {
        let siembraOrigenId = siembraOrigenIdBody ?? null;
        if (!siembraOrigenId && cantidadTotal > 0) {
          const nuevaSiembraId = await crearSiembraMovimiento(tx, {
            piletaOrigenId: origenPiletaId,
            piletaDestinoId: piletaId,
            cantidadEntera: cantidadTotal,
            usuarioId,
          });
          if (nuevaSiembraId != null) siembraOrigenId = nuevaSiembraId;
        } else if (siembraOrigenId) {
          await assertSiembraOrigenValidaParaPileta(tx, siembraOrigenId, piletaId);
        }

        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "engorda",
        });

        const pesoHistorialId = await resolverHistorialPesoId(tx, req.body);

        const creadoNuevo = await tx.engorda.create({
          data: {
            pileta_id: piletaId,
            cantidad_total: cantidadTotal,
            cantidad_alimento: cantidadAlimento,
            observacion_id: obsId,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: siembraOrigenId ?? null,
            peso: pesoHistorialId,
          },
          include: engordaInclude,
        });

        await aplicarEstadoPiletaPorCantidad(tx, piletaId, cantidadTotal);
        return creadoNuevo;
      });

      res.status(201).json({
        mensaje: "Registro periódico de engorda guardado",
        data: serializeEngorda(creado),
      });
    } catch (err) {
      if (err.code === "BAD_SIEMBRA" || err.code === "BAD_HISTORIAL_PESO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "SIEMBRA_DESTINO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta o referencias inválidas" });
      }
      console.error("POST /engorda Error:", err);
      res.status(500).json({ error: "Error creando registro de engorda", detalle: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.engorda.findUnique({
        where: { id },
        select: { pileta_id: true, siembra_origen_id: true },
      });
      if (!prev) return res.status(404).json({ error: "Registro no encontrado" });

      const updateData = {};
      let piletaId = prev.pileta_id;

      if (req.body.pileta_id !== undefined || req.body.pileta_destino_id !== undefined) {
        const nid = toInt(pick(req.body, "pileta_id", "pileta_destino_id"));
        if (!nid) return res.status(400).json({ error: "pileta_id inválido" });
        const pd = await prisma.pileta.findUnique({
          where: { id: nid },
          select: { tipo: true, nombre: true },
        });
        if (!pd) return res.status(400).json({ error: "Pileta no existe" });
        if (pd.tipo !== "engorda") {
          return res.status(400).json({ error: `La pileta '${pd.nombre}' debe ser tipo engorda` });
        }
        updateData.pileta_id = nid;
        piletaId = nid;
      }

      if (req.body.cantidad_total !== undefined) {
        const ct = toInt(pick(req.body, "cantidad_total", "cantidad"), 0) ?? 0;
        if (ct <= 0) {
          return res.status(400).json({ error: "cantidad_total debe ser mayor a 0" });
        }
        updateData.cantidad_total = ct;
      }

      if (req.body.cantidad_alimento !== undefined) {
        updateData.cantidad_alimento =
          Math.max(0, toInt(pick(req.body, "cantidad_alimento"), 0) ?? 0);
      }

      if (req.body.siembra_origen_id !== undefined) {
        updateData.siembra_origen_id = toInt(req.body.siembra_origen_id);
      }
      if (req.body.biometria_id !== undefined) {
        updateData.biometria_id = toInt(req.body.biometria_id);
      }

      const usuarioId = req.user.usuario_id;
      const obsTextoExplicito =
        req.body.observacion !== undefined ||
        req.body.observaciones !== undefined;

      const siembraOrigenFuturo =
        updateData.siembra_origen_id !== undefined
          ? updateData.siembra_origen_id
          : prev.siembra_origen_id;

      const actualizado = await prisma.$transaction(async (tx) => {
        await assertSiembraOrigenValidaParaPileta(tx, siembraOrigenFuturo ?? null, piletaId);

        if (
          req.body.peso_gramos !== undefined ||
          req.body.peso_valor !== undefined ||
          req.body.historial_peso_id !== undefined ||
          req.body.peso_id !== undefined
        ) {
          updateData.peso = await resolverHistorialPesoId(tx, req.body);
        }

        if (obsTextoExplicito) {
          const obsId = await crearObservacionSiHay(
            tx,
            pick(req.body, "observacion", "observaciones"),
            usuarioId,
            { piletaId, proceso: "engorda" },
          );
          if (obsId) updateData.observacion_id = obsId;
        }

        const row = await tx.engorda.update({
          where: { id },
          data: updateData,
          include: engordaInclude,
        });

        if (updateData.cantidad_total !== undefined || updateData.pileta_id !== undefined) {
          const vigente = await cantidadVigenteEnPileta(tx, piletaId, "engorda");
          await aplicarEstadoPiletaPorCantidad(tx, piletaId, vigente);
        }

        if (updateData.pileta_id !== undefined && prev.pileta_id !== piletaId) {
          const vigentePrev = await cantidadVigenteEnPileta(tx, prev.pileta_id, "engorda");
          await aplicarEstadoPiletaPorCantidad(tx, prev.pileta_id, vigentePrev);
        }

        return row;
      });

      res.json({
        mensaje: "Registro actualizado",
        data: serializeEngorda(actualizado),
      });
    } catch (err) {
      if (err.code === "BAD_SIEMBRA" || err.code === "SIEMBRA_DESTINO" || err.code === "BAD_HISTORIAL_PESO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("PUT /engorda/:id Error:", err);
      res.status(500).json({ error: "Error actualizando registro", detalle: err.message });
    }
  }

}

export default EngordaController;
