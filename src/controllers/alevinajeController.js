import prisma from "../prisma.js";
import { serializeAlevinaje } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { aplicarEstadoPiletaPorCantidad } from "../utils/reproductorInventario.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import { resolverHistorialPesoId } from "./historialPesoController.js";
import { crearSiembraMovimiento } from "../utils/siembraMovimiento.js";
import { cantidadVigenteEnPileta, ultimoRegistroPorPileta } from "../utils/inventarioVigente.js";
import { obtenerAlimentacionInternaAlevinaje } from "../utils/alimentacionInternaService.js";
import { parseLoteDesdeBody, resolverLoteAlevinaje } from "../utils/alevinajeLote.js";
import { normalizarLoteOpcional } from "../utils/incubacionLote.js";

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

async function assertSiembraOrigenValidaParaPileta(tx, siembraOrigenId, piletaAlevinajeId) {
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
  if (Number(s.pileta_destino) !== Number(piletaAlevinajeId)) {
    const err = new Error(
      "La siembra seleccionada debe tener como destino la misma pileta de alevinaje",
    );
    err.code = "SIEMBRA_DESTINO";
    throw err;
  }
}

const alevinajeInclude = {
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

class AlevinajeController {
  static async getAlimentacionInterna(req, res) {
    try {
      const piletaId = toInt(req.params.piletaId);
      if (!piletaId) return res.status(400).json({ error: "piletaId invalido" });
      const data = await obtenerAlimentacionInternaAlevinaje(prisma, piletaId);
      if (!data) return res.status(404).json({ error: "Pileta no encontrada" });
      res.json(data);
    } catch (err) {
      console.error("GET /alevinaje/piletas/:piletaId/alimentacion-interna Error:", err);
      res.status(500).json({ error: "Error obteniendo alimentacion interna" });
    }
  }


  static async getAll(req, res) {
    try {
      const piletaIdQ = toInt(req.query.pileta_id);
      const where = {};
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (ubicClause) where.piletas = ubicClause;
      if (piletaIdQ) where.pileta_id = piletaIdQ;

      const rows = await prisma.alevinaje.findMany({
        where,
        include: alevinajeInclude,
        orderBy: { id: "desc" },
      });

      const historial =
        req.query.historial === "1" ||
        String(req.query.historial || "").toLowerCase() === "true";
      const vista = historial ? rows : ultimoRegistroPorPileta(rows);
      res.json(vista.map(serializeAlevinaje));
    } catch (err) {
      console.error("GET /alevinaje Error:", err);
      res.status(500).json({ error: "Error obteniendo registros de alevinaje" });
    }
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      const row = await prisma.alevinaje.findUnique({
        where: { id },
        include: alevinajeInclude,
      });
      if (!row) return res.status(404).json({ error: "Registro no encontrado" });
      res.json(serializeAlevinaje(row));
    } catch (err) {
      console.error("GET /alevinaje/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo registro" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(
        pick(req.body, "pileta_id", "pileta_destino_id", "fi_pileta_destino_id", "fc_pileta_id"),
      );
      const cantidadTotal = Math.max(
        0,
        toInt(pick(req.body, "cantidad_total", "fn_cantidad_total", "alevines_iniciales"), 0) ?? 0,
      );
      const cantidadAlimento = Math.max(
        0,
        toInt(pick(req.body, "cantidad_alimento", "fn_cantidad_alimento"), 0) ?? 0,
      );

      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id (pileta de alevinaje) es obligatorio" });
      }
      if (cantidadTotal <= 0) {
        return res.status(400).json({ error: "cantidad_total debe ser mayor a 0" });
      }

      const pil = await prisma.pileta.findUnique({
        where: { id: piletaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Pileta no existe" });
      if (pil.tipo !== "alevinaje") {
        return res.status(400).json({
          error: `La pileta '${pil.nombre}' debe ser tipo alevinaje`,
        });
      }

      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion", "observaciones");
      const siembraOrigenIdBody = toInt(pick(req.body, "siembra_origen_id"));
      const origenPiletaId = toInt(
        pick(req.body, "origen_pileta_id", "origenPiletaId", "fi_origen_pileta_id"),
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
          proceso: "alevinaje",
        });

        const pesoHistorialId = await resolverHistorialPesoId(tx, req.body);

        const loteBody = parseLoteDesdeBody(req.body, pick);
        const lote = await resolverLoteAlevinaje(tx, {
          loteBody,
          piletaId,
          siembraOrigenId,
          piletaOrigenId: origenPiletaId,
        });

        const creadoNuevo = await tx.alevinaje.create({
          data: {
            pileta_id: piletaId,
            lote,
            cantidad_total: cantidadTotal,
            cantidad_alimento: cantidadAlimento,
            observacion_id: obsId,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: siembraOrigenId ?? null,
            peso: pesoHistorialId,
          },
          include: alevinajeInclude,
        });

        await aplicarEstadoPiletaPorCantidad(tx, piletaId, cantidadTotal);
        return creadoNuevo;
      });

      res.status(201).json({
        mensaje: "Registro periódico de alevinaje guardado",
        data: serializeAlevinaje(creado),
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
      console.error("POST /alevinaje Error:", err);
      res.status(500).json({ error: "Error creando registro de alevinaje", detalle: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.alevinaje.findUnique({
        where: { id },
        select: { pileta_id: true, siembra_origen_id: true },
      });
      if (!prev) return res.status(404).json({ error: "Registro no encontrado" });

      const updateData = {};
      let piletaId = prev.pileta_id;

      if (req.body.pileta_id !== undefined || req.body.pileta_destino_id !== undefined) {
        const nid = toInt(pick(req.body, "pileta_id", "pileta_destino_id", "fi_pileta_destino_id"));
        if (!nid) return res.status(400).json({ error: "pileta_id inválido" });
        const pd = await prisma.pileta.findUnique({
          where: { id: nid },
          select: { tipo: true, nombre: true },
        });
        if (!pd) return res.status(400).json({ error: "Pileta no existe" });
        if (pd.tipo !== "alevinaje") {
          return res.status(400).json({ error: `La pileta '${pd.nombre}' debe ser tipo alevinaje` });
        }
        updateData.pileta_id = nid;
        piletaId = nid;
      }

      if (req.body.cantidad_total !== undefined || req.body.fn_cantidad_total !== undefined) {
        const ct = toInt(pick(req.body, "cantidad_total", "fn_cantidad_total"), 0) ?? 0;
        if (ct <= 0) {
          return res.status(400).json({ error: "cantidad_total debe ser mayor a 0" });
        }
        updateData.cantidad_total = ct;
      }

      if (req.body.cantidad_alimento !== undefined || req.body.fn_cantidad_alimento !== undefined) {
        updateData.cantidad_alimento =
          Math.max(0, toInt(pick(req.body, "cantidad_alimento", "fn_cantidad_alimento"), 0) ?? 0);
      }

      if (req.body.siembra_origen_id !== undefined) {
        updateData.siembra_origen_id = toInt(req.body.siembra_origen_id);
      }
      if (req.body.biometria_id !== undefined) {
        updateData.biometria_id = toInt(req.body.biometria_id);
      }

      if (
        req.body.lote !== undefined ||
        req.body.fc_lote !== undefined ||
        req.body.lote_genetico !== undefined ||
        req.body.fc_lote_genetico !== undefined
      ) {
        updateData.lote = normalizarLoteOpcional(
          pick(req.body, "lote", "fc_lote", "lote_genetico", "fc_lote_genetico"),
        );
      }

      const usuarioId = req.user.usuario_id;
      const obsTextoExplicito =
        req.body.observacion !== undefined ||
        req.body.fc_observacion !== undefined ||
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
            pick(req.body, "observacion", "fc_observacion", "observaciones"),
            usuarioId,
            { piletaId, proceso: "alevinaje" },
          );
          if (obsId) updateData.observacion_id = obsId;
        }

        const row = await tx.alevinaje.update({
          where: { id },
          data: updateData,
          include: alevinajeInclude,
        });

        if (updateData.cantidad_total !== undefined || updateData.pileta_id !== undefined) {
          const vigente = await cantidadVigenteEnPileta(tx, piletaId, "alevinaje");
          await aplicarEstadoPiletaPorCantidad(tx, piletaId, vigente);
        }

        return row;
      });

      res.json({
        mensaje: "Registro actualizado",
        data: serializeAlevinaje(actualizado),
      });
    } catch (err) {
      if (err.code === "BAD_SIEMBRA" || err.code === "SIEMBRA_DESTINO" || err.code === "BAD_HISTORIAL_PESO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("PUT /alevinaje/:id Error:", err);
      res.status(500).json({ error: "Error actualizando registro", detalle: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      await prisma.alevinaje.delete({ where: { id } });
      res.json({ mensaje: "Registro eliminado" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("DELETE /alevinaje/:id Error:", err);
      res.status(500).json({ error: "Error eliminando registro" });
    }
  }
}

export default AlevinajeController;
