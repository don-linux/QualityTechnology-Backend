import prisma from "../prisma.js";
import { serializeAlevinaje } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { aplicarEstadoPiletaPorCantidad } from "../utils/reproductorInventario.js";
import { resolverHistorialPesoId } from "./historialPesoController.js";
import {
  piletaWhereUbicacionFromRequest,
  ubicacionNombreWhereFromGranja,
  primerUbicacionIdValido,
  resolverUbicacionFlexible,
} from "../utils/granjaUbicacion.js";

async function filtroUbicacionPiletaDesdeReq(req, granjaParam) {
  const ubicIdQ = primerUbicacionIdValido(req.query?.ubicacion_id, req.query?.ubicacionId);
  if (ubicIdQ != null) return { ubicacionId: ubicIdQ };

  const g = String(granjaParam ?? "").trim();
  if (!g) return null;

  const flex = await resolverUbicacionFlexible(g);
  if (flex?.ubicacionId != null) return { ubicacionId: flex.ubicacionId };

  const cond = ubicacionNombreWhereFromGranja(g);
  return cond ? { ubicacion: cond } : null;
}

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
      res.json(rows.map(serializeAlevinaje));
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
      const siembraOrigenId = toInt(pick(req.body, "siembra_origen_id"));
      const biometriaId = toInt(pick(req.body, "biometria_id"));

      const creado = await prisma.$transaction(async (tx) => {
        await assertSiembraOrigenValidaParaPileta(tx, siembraOrigenId ?? null, piletaId);

        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "alevinaje",
        });

        const pesoHistorialId = await resolverHistorialPesoId(tx, req.body);

        const creadoNuevo = await tx.alevinaje.create({
          data: {
            pileta_id: piletaId,
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
        mensaje: "Registro de alevinaje creado",
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
          req.body.peso_kg !== undefined ||
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

        if (updateData.cantidad_total !== undefined) {
          await aplicarEstadoPiletaPorCantidad(tx, piletaId, updateData.cantidad_total);
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

  static async getReproductoresOcupadas(req, res) {
    try {
      const granjaParam = String(req.params.granja ?? "").trim();
      const filtroUb = await filtroUbicacionPiletaDesdeReq(req, granjaParam);
      if (!filtroUb) return res.json([]);

      const piletas = await prisma.pileta.findMany({
        where: {
          tipo: "reproductores",
          estado: "ocupada",
          ...filtroUb,
        },
        include: { ubicacion: true },
        orderBy: { nombre: "asc" },
      });

      res.json(
        piletas.map((p) => ({
          fi_pileta_id: p.id,
          pileta_id: p.id,
          fi_instalacion_id: p.id,
          instalacion_id: p.id,
          nombre_pileta: p.nombre,
          nombre_instalacion: p.nombre,
          fc_granja: p.ubicacion?.nombre ?? null,
        })),
      );
    } catch (err) {
      console.error("GET /alevinaje/reproductores/:granja Error:", err);
      res.status(500).json({ error: "Error al obtener piletas reproductoras" });
    }
  }

  /** Familia desde `reproductores` o último registro legado en `alevinaje_old`. */
  static async getFamiliaPorPileta(req, res) {
    try {
      const piletaId = toInt(req.params.piletaId);
      if (!piletaId) return res.json(null);

      const rep = await prisma.reproductor.findUnique({
        where: { pileta_id: piletaId },
        select: { familia: true },
      });
      if (rep?.familia != null && rep.familia !== "") {
        return res.json({ familia: rep.familia });
      }

      const alevFilas = await prisma.alevinaje_old.findMany({
        where: { pileta_id: piletaId },
        orderBy: { id: "desc" },
        take: 20,
        select: { familia: true },
      });
      const conFamilia = alevFilas.find((row) => row.familia != null && row.familia !== "");
      if (conFamilia?.familia) return res.json({ familia: conFamilia.familia });

      res.json(null);
    } catch (error) {
      console.error("GET /alevinaje/familia-por-pileta/:piletaId Error:", error);
      res.status(500).json({ error: "Error cargando familia" });
    }
  }
}

export default AlevinajeController;
