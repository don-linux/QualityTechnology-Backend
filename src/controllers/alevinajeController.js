import prisma from "../prisma.js";
import { serializeAlevinaje } from "../utils/serializers.js";
import { aplicarEstadoInfraestructuraFisicaPorCantidad } from "../utils/reproductorInventario.js";
import { infraestructuraFisicaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import { resolverHistorialPesoId } from "./historialPesoController.js";
import { crearSiembraMovimiento } from "../utils/siembraMovimiento.js";
import { cantidadVigenteEnInfraestructuraFisica, ultimoRegistroPorInfraestructuraFisica } from "../utils/inventarioVigente.js";
import { parseLoteDesdeBody, resolverLoteAlevinaje } from "../utils/alevinajeLote.js";
import { normalizarLoteOpcional } from "../utils/eficienciaReproductivaLote.js";

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

async function assertSiembraOrigenValidaParaInfraestructuraFisica(tx, siembraOrigenId, infraestructuraFisicaAlevinajeId) {
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
  if (Number(s.infraestructura_fisica_destino) !== Number(infraestructuraFisicaAlevinajeId)) {
    const err = new Error(
      "La siembra seleccionada debe tener como destino la misma infraestructura física de alevinaje",
    );
    err.code = "SIEMBRA_DESTINO";
    throw err;
  }
}

const alevinajeInclude = {
  infraestructuraFisica: {
    include: {
      ubicacion: true,
    },
  },
  siembra_origen: {
    include: {
      infraestructuraFisicaOrigen: {
        include: { reproductores: true },
      },
    },
  },
  historial_peso: true,
};

class AlevinajeController {
  static async getAll(req, res) {
    try {
      const infraestructuraFisicaIdQ = toInt(req.query.infraestructura_fisica_id);
      const where = {};
      const ubicClause = infraestructuraFisicaWhereUbicacionFromRequest(req);
      if (ubicClause) where.infraestructuraFisica = ubicClause;
      if (infraestructuraFisicaIdQ) where.infraestructura_fisica_id = infraestructuraFisicaIdQ;

      const rows = await prisma.alevinaje.findMany({
        where,
        include: alevinajeInclude,
        orderBy: { id: "desc" },
      });

      const historial =
        req.query.historial === "1" ||
        String(req.query.historial || "").toLowerCase() === "true";
      const vista = historial ? rows : ultimoRegistroPorInfraestructuraFisica(rows);
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
      const infraestructuraFisicaId = toInt(
        pick(req.body, "infraestructura_fisica_id", "infraestructura_fisica_destino_id"),
      );
      const cantidadTotal = Math.max(
        0,
        toInt(pick(req.body, "cantidad_total", "alevines_iniciales"), 0) ?? 0,
      );

      if (!infraestructuraFisicaId) {
        return res.status(400).json({ error: "infraestructura_fisica_id (infraestructura física de alevinaje) es obligatorio" });
      }
      if (cantidadTotal <= 0) {
        return res.status(400).json({ error: "cantidad_total debe ser mayor a 0" });
      }

      const pil = await prisma.infraestructuraFisica.findUnique({
        where: { id: infraestructuraFisicaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Infraestructura física no existe" });
      if (pil.tipo !== "alevinaje") {
        return res.status(400).json({
          error: `La infraestructura física '${pil.nombre}' debe ser tipo alevinaje`,
        });
      }

      const usuarioId = req.user.usuario_id;
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

        const pesoHistorialId = await resolverHistorialPesoId(tx, req.body);

        const loteBody = parseLoteDesdeBody(req.body, pick);
        const lote = await resolverLoteAlevinaje(tx, {
          loteBody,
          infraestructuraFisicaId,
          siembraOrigenId,
          infraestructuraFisicaOrigenId: origenInfraestructuraFisicaId,
        });

        const creadoNuevo = await tx.alevinaje.create({
          data: {
            infraestructura_fisica_id: infraestructuraFisicaId,
            lote,
            cantidad_total: cantidadTotal,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: siembraOrigenId ?? null,
            peso: pesoHistorialId,
          },
          include: alevinajeInclude,
        });

        await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, infraestructuraFisicaId, cantidadTotal);
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
        return res.status(400).json({ error: "InfraestructuraFisica o referencias inválidas" });
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
        if (pd.tipo !== "alevinaje") {
          return res.status(400).json({ error: `La infraestructura física '${pd.nombre}' debe ser tipo alevinaje` });
        }
        updateData.infraestructura_fisica_id = nid;
        infraestructuraFisicaId = nid;
      }

      if (req.body.cantidad_total !== undefined) {
        const ct = toInt(pick(req.body, "cantidad_total"), 0) ?? 0;
        if (ct <= 0) {
          return res.status(400).json({ error: "cantidad_total debe ser mayor a 0" });
        }
        updateData.cantidad_total = ct;
      }

      if (req.body.siembra_origen_id !== undefined) {
        updateData.siembra_origen_id = toInt(req.body.siembra_origen_id);
      }
      if (req.body.biometria_id !== undefined) {
        updateData.biometria_id = toInt(req.body.biometria_id);
      }

      if (
        req.body.lote !== undefined ||
        req.body.lote_genetico !== undefined
      ) {
        updateData.lote = normalizarLoteOpcional(
          pick(req.body, "lote", "lote_genetico"),
        );
      }

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

        const row = await tx.alevinaje.update({
          where: { id },
          data: updateData,
          include: alevinajeInclude,
        });

        if (updateData.cantidad_total !== undefined || updateData.infraestructura_fisica_id !== undefined) {
          const vigente = await cantidadVigenteEnInfraestructuraFisica(tx, infraestructuraFisicaId, "alevinaje");
          await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, infraestructuraFisicaId, vigente);
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

}

export default AlevinajeController;
