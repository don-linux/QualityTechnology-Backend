import prisma from "../prisma.js";
import { serializeEngorda } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { aplicarEstadoInfraestructuraFisicaPorCantidad } from "../utils/reproductorInventario.js";
import { resolverHistorialPesoId } from "./historialPesoController.js";
import { crearSiembraMovimiento } from "../utils/siembraMovimiento.js";
import { infraestructuraFisicaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import { cantidadVigenteEnInfraestructuraFisica, ultimoRegistroPorInfraestructuraFisica } from "../utils/inventarioVigente.js";

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

async function assertSiembraOrigenValidaParaInfraestructuraFisica(tx, siembraOrigenId, infraestructuraFisicaEngordaId) {
  if (!siembraOrigenId) return;
  const s = await tx.siembra.findUnique({
    where: { id: siembraOrigenId },
    select: { id: true, infraestructura_fisica_destino: true },
  });
  if (!s) {
    const err = new Error("siembra_origen_id inválido");
    err.code = "BAD_SIEMBRA";
    throw err;
  }
  if (Number(s.infraestructura_fisica_destino) !== Number(infraestructuraFisicaEngordaId)) {
    const err = new Error(
      "La siembra seleccionada debe tener como destino la misma infraestructura física de engorda",
    );
    err.code = "SIEMBRA_DESTINO";
    throw err;
  }
}

const engordaInclude = {
  infraestructuraFisica: {
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
      infraestructuraFisicaOrigen: {
        include: { reproductores: true },
      },
    },
  },
  historial_peso: true,
};

class EngordaController {
  static async getAll(req, res) {
    try {
      const infraestructuraFisicaIdQ = toInt(req.query.infraestructura_fisica_id);
      const where = {};
      const ubicClause = infraestructuraFisicaWhereUbicacionFromRequest(req);
      if (ubicClause) where.infraestructuraFisica = ubicClause;
      if (infraestructuraFisicaIdQ) where.infraestructura_fisica_id = infraestructuraFisicaIdQ;

      const rows = await prisma.engorda.findMany({
        where,
        include: engordaInclude,
        orderBy: { id: "desc" },
      });

      const historial =
        req.query.historial === "1" ||
        String(req.query.historial || "").toLowerCase() === "true";
      const vista = historial ? rows : ultimoRegistroPorInfraestructuraFisica(rows);
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
      const infraestructuraFisicaId = toInt(
        pick(req.body, "infraestructura_fisica_id", "infraestructura_fisica_destino_id"),
      );
      const cantidadTotal = Math.max(
        0,
        toInt(pick(req.body, "cantidad_total", "cantidad"), 0) ?? 0,
      );
      const cantidadAlimento = Math.max(
        0,
        toInt(pick(req.body, "cantidad_alimento"), 0) ?? 0,
      );

      if (!infraestructuraFisicaId) {
        return res.status(400).json({ error: "infraestructura_fisica_id (infraestructura física de engorda) es obligatorio" });
      }
      if (cantidadTotal <= 0) {
        return res.status(400).json({ error: "cantidad_total debe ser mayor a 0" });
      }

      const pil = await prisma.infraestructuraFisica.findUnique({
        where: { id: infraestructuraFisicaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Infraestructura física no existe" });
      if (pil.tipo !== "engorda") {
        return res.status(400).json({
          error: `La infraestructura física '${pil.nombre}' debe ser tipo engorda`,
        });
      }

      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "observaciones");
      const siembraOrigenIdBody = toInt(pick(req.body, "siembra_origen_id"));
      const origenInfraestructuraFisicaId = toInt(
        pick(req.body, "origen_infraestructura_fisica_id", "origenInfraestructuraFisicaId"),
      );
      const biometriaId = toInt(pick(req.body, "biometria_id"));

      const creado = await prisma.$transaction(async (tx) => {
        let siembraOrigenId = siembraOrigenIdBody ?? null;
        if (!siembraOrigenId && cantidadTotal > 0) {
          const nuevaSiembraId = await crearSiembraMovimiento(tx, {
            infraestructuraFisicaOrigenId: origenInfraestructuraFisicaId,
            infraestructuraFisicaDestinoId: infraestructuraFisicaId,
            cantidadEntera: cantidadTotal,
            usuarioId,
          });
          if (nuevaSiembraId != null) siembraOrigenId = nuevaSiembraId;
        } else if (siembraOrigenId) {
          await assertSiembraOrigenValidaParaInfraestructuraFisica(tx, siembraOrigenId, infraestructuraFisicaId);
        }

        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          infraestructuraFisicaId,
          proceso: "engorda",
        });

        const pesoHistorialId = await resolverHistorialPesoId(tx, req.body);

        const creadoNuevo = await tx.engorda.create({
          data: {
            infraestructura_fisica_id: infraestructuraFisicaId,
            cantidad_total: cantidadTotal,
            cantidad_alimento: cantidadAlimento,
            observacion_id: obsId,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: siembraOrigenId ?? null,
            peso: pesoHistorialId,
          },
          include: engordaInclude,
        });

        await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, infraestructuraFisicaId, cantidadTotal);
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
        return res.status(400).json({ error: "InfraestructuraFisica o referencias inválidas" });
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
        select: { infraestructura_fisica_id: true, siembra_origen_id: true },
      });
      if (!prev) return res.status(404).json({ error: "Registro no encontrado" });

      const updateData = {};
      let infraestructuraFisicaId = prev.infraestructura_fisica_id;

      if (req.body.infraestructura_fisica_id !== undefined || req.body.infraestructura_fisica_destino_id !== undefined) {
        const nid = toInt(pick(req.body, "infraestructura_fisica_id", "infraestructura_fisica_destino_id"));
        if (!nid) return res.status(400).json({ error: "infraestructura_fisica_id inválido" });
        const pd = await prisma.infraestructuraFisica.findUnique({
          where: { id: nid },
          select: { tipo: true, nombre: true },
        });
        if (!pd) return res.status(400).json({ error: "Infraestructura física no existe" });
        if (pd.tipo !== "engorda") {
          return res.status(400).json({ error: `La infraestructura física '${pd.nombre}' debe ser tipo engorda` });
        }
        updateData.infraestructura_fisica_id = nid;
        infraestructuraFisicaId = nid;
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
        await assertSiembraOrigenValidaParaInfraestructuraFisica(tx, siembraOrigenFuturo ?? null, infraestructuraFisicaId);

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
            { infraestructuraFisicaId, proceso: "engorda" },
          );
          if (obsId) updateData.observacion_id = obsId;
        }

        const row = await tx.engorda.update({
          where: { id },
          data: updateData,
          include: engordaInclude,
        });

        if (updateData.cantidad_total !== undefined || updateData.infraestructura_fisica_id !== undefined) {
          const vigente = await cantidadVigenteEnInfraestructuraFisica(tx, infraestructuraFisicaId, "engorda");
          await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, infraestructuraFisicaId, vigente);
        }

        if (updateData.infraestructura_fisica_id !== undefined && prev.infraestructura_fisica_id !== infraestructuraFisicaId) {
          const vigentePrev = await cantidadVigenteEnInfraestructuraFisica(tx, prev.infraestructura_fisica_id, "engorda");
          await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, prev.infraestructura_fisica_id, vigentePrev);
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
