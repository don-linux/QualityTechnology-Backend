import prisma from "../prisma.js";
import { serializeControlReproductivo } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
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

function toDecimal(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function calcMortalidadPct(alevinesIniciales, mortalidad) {
  const ai = Math.max(0, alevinesIniciales || 0);
  const m = Math.max(0, mortalidad || 0);
  if (ai <= 0) return 0;
  return Math.round((m / ai) * 10000) / 100;
}

function normalizarLote(value) {
  const lote = String(value ?? "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z0-9-]+$/.test(lote)) {
    const err = new Error("El lote solo admite letras, números y guion");
    err.code = "BAD_LOTE";
    throw err;
  }
  return lote;
}

const controlReproductivoInclude = {
  piletas: { include: { ubicacion: true } },
  pileta_origen_reproductora: { include: { ubicacion: true } },
  observacion: true,
  biometrias: { include: { observacionBiometria: true } },
  siembra_origen: {
    include: {
      piletas_siembra_pileta_origenTopiletas: {
        include: { reproductores: true },
      },
    },
  },
};

class ControlReproductivoController {
  static async getAll(req, res) {
    try {
      const piletaIdQ = toInt(req.query.pileta_id);
      const where = {};
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (ubicClause) where.piletas = ubicClause;
      if (piletaIdQ) where.pileta_id = piletaIdQ;

      const rows = await prisma.controlReproductivo.findMany({
        where,
        include: controlReproductivoInclude,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeControlReproductivo));
    } catch (err) {
      console.error("GET /control-reproductivo Error:", err);
      res.status(500).json({ error: "Error obteniendo registros de control reproductivo" });
    }
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      const row = await prisma.controlReproductivo.findUnique({
        where: { id },
        include: controlReproductivoInclude,
      });
      if (!row) return res.status(404).json({ error: "Registro no encontrado" });
      res.json(serializeControlReproductivo(row));
    } catch (err) {
      console.error("GET /control-reproductivo/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo registro" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(
        pick(req.body, "pileta_id", "pileta_destino_id", "fi_pileta_destino_id", "fc_pileta_id"),
      );
      const piletaOrigenId = toInt(
        pick(req.body, "pileta_origen_reproductora_id", "fi_instalacion_id", "instalacion_id"),
      );
      const loteRaw = pick(req.body, "lote", "fc_lote", "no_lote");
      const alevinesIniciales = Math.max(
        0,
        toInt(pick(req.body, "alevines_iniciales", "fn_alevines_iniciales"), 0) ?? 0,
      );
      const mortalidad = Math.max(
        0,
        toInt(pick(req.body, "mortalidad", "fn_mortalidad"), 0) ?? 0,
      );
      const machos = Math.max(0, toInt(pick(req.body, "machos", "fn_machos"), 0) ?? 0);
      const hembras = Math.max(0, toInt(pick(req.body, "hembras", "fn_hembras"), 0) ?? 0);
      const cantidadTotal = Math.max(
        0,
        toInt(pick(req.body, "cantidad_total", "fn_cantidad_total"), machos + hembras) ??
          machos + hembras,
      );
      const ovadas = Math.max(0, toInt(pick(req.body, "ovadas", "fn_ovadas"), 0) ?? 0);

      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id (pileta de alevinaje destino) es obligatorio" });
      }
      if (!loteRaw) {
        return res.status(400).json({ error: "lote es obligatorio" });
      }
      if (alevinesIniciales <= 0) {
        return res.status(400).json({ error: "alevines_iniciales debe ser mayor a 0" });
      }
      if (mortalidad > alevinesIniciales) {
        return res.status(400).json({ error: "mortalidad no puede superar alevines_iniciales" });
      }

      const lote = normalizarLote(loteRaw);

      const pil = await prisma.pileta.findUnique({
        where: { id: piletaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Pileta destino no existe" });
      if (pil.tipo !== "alevinaje") {
        return res.status(400).json({
          error: `La pileta destino '${pil.nombre}' debe ser tipo alevinaje`,
        });
      }

      if (piletaOrigenId) {
        const po = await prisma.pileta.findUnique({
          where: { id: piletaOrigenId },
          select: { tipo: true, nombre: true },
        });
        if (!po) return res.status(400).json({ error: "Pileta reproductora origen no existe" });
        if (po.tipo !== "reproductores") {
          return res.status(400).json({
            error: `La pileta origen '${po.nombre}' debe ser tipo reproductores`,
          });
        }
      }

      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion", "observaciones");
      const siembraOrigenId = toInt(pick(req.body, "siembra_origen_id"));
      const biometriaId = toInt(pick(req.body, "biometria_id"));
      const fechaRaw = pick(req.body, "fecha", "fd_fecha");
      const familia = pick(req.body, "familia", "fc_familia");
      const huevosMl = toDecimal(pick(req.body, "huevos_ml", "fn_huevos_ml"));

      const creado = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "control_reproductivo",
        });

        const creadoNuevo = await tx.controlReproductivo.create({
          data: {
            pileta_id: piletaId,
            pileta_origen_reproductora_id: piletaOrigenId ?? null,
            fecha: fechaRaw ? new Date(fechaRaw) : new Date(),
            lote,
            familia: familia != null ? String(familia).slice(0, 60) : null,
            huevos_ml: huevosMl,
            ovadas,
            machos,
            hembras,
            cantidad_total: cantidadTotal,
            alevines_iniciales: alevinesIniciales,
            mortalidad,
            mortalidad_porcentaje: calcMortalidadPct(alevinesIniciales, mortalidad),
            observacion_id: obsId,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: siembraOrigenId ?? null,
            usuario_id: usuarioId,
          },
          include: controlReproductivoInclude,
        });

        return creadoNuevo;
      });

      res.status(201).json({
        mensaje: "Registro de control reproductivo creado",
        data: serializeControlReproductivo(creado),
      });
    } catch (err) {
      if (err.code === "BAD_LOTE") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un lote con ese código en la pileta destino" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta o referencias inválidas" });
      }
      console.error("POST /control-reproductivo Error:", err);
      res.status(500).json({ error: "Error creando registro", detalle: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.controlReproductivo.findUnique({
        where: { id },
        select: {
          pileta_id: true,
          alevines_iniciales: true,
          mortalidad: true,
        },
      });
      if (!prev) return res.status(404).json({ error: "Registro no encontrado" });

      const updateData = {};
      let piletaId = prev.pileta_id;
      let alevinesIniciales = prev.alevines_iniciales;
      let mortalidad = prev.mortalidad;

      if (req.body.pileta_id !== undefined || req.body.pileta_destino_id !== undefined) {
        const nid = toInt(pick(req.body, "pileta_id", "pileta_destino_id", "fi_pileta_destino_id"));
        if (!nid) return res.status(400).json({ error: "pileta_id inválido" });
        const pd = await prisma.pileta.findUnique({
          where: { id: nid },
          select: { tipo: true, nombre: true },
        });
        if (!pd) return res.status(400).json({ error: "Pileta destino no existe" });
        if (pd.tipo !== "alevinaje") {
          return res.status(400).json({ error: `La pileta '${pd.nombre}' debe ser tipo alevinaje` });
        }
        updateData.pileta_id = nid;
        piletaId = nid;
      }

      if (
        req.body.pileta_origen_reproductora_id !== undefined ||
        req.body.fi_instalacion_id !== undefined
      ) {
        const oid = toInt(
          pick(req.body, "pileta_origen_reproductora_id", "fi_instalacion_id", "instalacion_id"),
        );
        if (oid) {
          const po = await prisma.pileta.findUnique({
            where: { id: oid },
            select: { tipo: true, nombre: true },
          });
          if (!po) return res.status(400).json({ error: "Pileta reproductora origen no existe" });
          if (po.tipo !== "reproductores") {
            return res.status(400).json({
              error: `La pileta origen '${po.nombre}' debe ser tipo reproductores`,
            });
          }
        }
        updateData.pileta_origen_reproductora_id = oid;
      }

      if (req.body.lote !== undefined || req.body.fc_lote !== undefined) {
        updateData.lote = normalizarLote(pick(req.body, "lote", "fc_lote", "no_lote"));
      }

      if (req.body.fecha !== undefined || req.body.fd_fecha !== undefined) {
        const f = pick(req.body, "fecha", "fd_fecha");
        if (f) updateData.fecha = new Date(f);
      }

      if (req.body.familia !== undefined || req.body.fc_familia !== undefined) {
        const fam = pick(req.body, "familia", "fc_familia");
        updateData.familia = fam != null ? String(fam).slice(0, 60) : null;
      }

      if (req.body.huevos_ml !== undefined || req.body.fn_huevos_ml !== undefined) {
        updateData.huevos_ml = toDecimal(pick(req.body, "huevos_ml", "fn_huevos_ml"));
      }

      if (req.body.ovadas !== undefined || req.body.fn_ovadas !== undefined) {
        updateData.ovadas = Math.max(0, toInt(pick(req.body, "ovadas", "fn_ovadas"), 0) ?? 0);
      }

      if (req.body.machos !== undefined || req.body.fn_machos !== undefined) {
        updateData.machos = Math.max(0, toInt(pick(req.body, "machos", "fn_machos"), 0) ?? 0);
      }

      if (req.body.hembras !== undefined || req.body.fn_hembras !== undefined) {
        updateData.hembras = Math.max(0, toInt(pick(req.body, "hembras", "fn_hembras"), 0) ?? 0);
      }

      if (req.body.cantidad_total !== undefined || req.body.fn_cantidad_total !== undefined) {
        updateData.cantidad_total = Math.max(
          0,
          toInt(pick(req.body, "cantidad_total", "fn_cantidad_total"), 0) ?? 0,
        );
      }

      if (req.body.alevines_iniciales !== undefined || req.body.fn_alevines_iniciales !== undefined) {
        const ai = toInt(pick(req.body, "alevines_iniciales", "fn_alevines_iniciales"), 0) ?? 0;
        if (ai <= 0) {
          return res.status(400).json({ error: "alevines_iniciales debe ser mayor a 0" });
        }
        updateData.alevines_iniciales = ai;
        alevinesIniciales = ai;
      }

      if (req.body.mortalidad !== undefined || req.body.fn_mortalidad !== undefined) {
        updateData.mortalidad = Math.max(
          0,
          toInt(pick(req.body, "mortalidad", "fn_mortalidad"), 0) ?? 0,
        );
        mortalidad = updateData.mortalidad;
      }

      if (mortalidad > alevinesIniciales) {
        return res.status(400).json({ error: "mortalidad no puede superar alevines_iniciales" });
      }

      if (
        updateData.mortalidad !== undefined ||
        updateData.alevines_iniciales !== undefined
      ) {
        updateData.mortalidad_porcentaje = calcMortalidadPct(alevinesIniciales, mortalidad);
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

      const actualizado = await prisma.$transaction(async (tx) => {
        if (obsTextoExplicito) {
          const obsId = await crearObservacionSiHay(
            tx,
            pick(req.body, "observacion", "fc_observacion", "observaciones"),
            usuarioId,
            { piletaId, proceso: "control_reproductivo" },
          );
          if (obsId) updateData.observacion_id = obsId;
        }

        return tx.controlReproductivo.update({
          where: { id },
          data: updateData,
          include: controlReproductivoInclude,
        });
      });

      res.json({
        mensaje: "Registro actualizado",
        data: serializeControlReproductivo(actualizado),
      });
    } catch (err) {
      if (err.code === "BAD_LOTE") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un lote con ese código en la pileta destino" });
      }
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("PUT /control-reproductivo/:id Error:", err);
      res.status(500).json({ error: "Error actualizando registro", detalle: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      await prisma.controlReproductivo.delete({ where: { id } });
      res.json({ mensaje: "Registro eliminado" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("DELETE /control-reproductivo/:id Error:", err);
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
      console.error("GET /control-reproductivo/reproductores/:granja Error:", err);
      res.status(500).json({ error: "Error al obtener piletas reproductoras" });
    }
  }

  static async getFamiliaPorPileta(req, res) {
    try {
      const piletaId = toInt(req.params.piletaId);
      if (!piletaId) return res.json(null);

      const filas = await prisma.controlReproductivo.findMany({
        where: { pileta_origen_reproductora_id: piletaId },
        orderBy: { id: "desc" },
        take: 20,
        select: { familia: true },
      });
      const conFamilia = filas.find((row) => row.familia != null && row.familia !== "");
      if (conFamilia?.familia) return res.json({ familia: conFamilia.familia });

      res.json(null);
    } catch (error) {
      console.error("GET /control-reproductivo/familia-por-pileta/:piletaId Error:", error);
      res.status(500).json({ error: "Error cargando familia" });
    }
  }
}

export default ControlReproductivoController;
