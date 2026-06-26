import prisma from "../prisma.js";
import { serializeReproductor } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { aplicarEstadoPiletaPorCantidad, analizarProcedenciaSeleccionInterna, registrarSeleccionInternaDesdeEngorda } from "../utils/reproductorInventario.js";
import { crearSiembraMovimiento } from "../utils/siembraMovimiento.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import { cantidadVigenteEnPileta, ultimoRegistroPorPileta } from "../utils/inventarioVigente.js";
import {
  parseReproductorCampos,
  pickRepro,
  toIntRepro,
} from "../utils/reproductorCampos.js";

function pick(body, ...keys) {
  return pickRepro(body, ...keys);
}

function toInt(value, fallback = null) {
  return toIntRepro(value, fallback);
}

async function assertSiembraOrigenValidaParaPileta(tx, siembraOrigenId, piletaReproductorId) {
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
  if (Number(s.pileta_destino) !== Number(piletaReproductorId)) {
    const err = new Error(
      "La siembra seleccionada debe tener como destino la misma pileta de reproductores",
    );
    err.code = "SIEMBRA_DESTINO";
    throw err;
  }
}

const reproductorInclude = {
  piletas: {
    include: {
      ubicacion: true,
      observaciones: {
        orderBy: { created_at: "desc" },
        take: 1,
        select: { comentario: true, proceso: true, created_at: true },
      },
      biometrias: {
        orderBy: { fecha: "desc" },
        take: 1,
        select: { fecha: true },
      },
    },
  },
  observacion: true,
  biometrias: { include: { observacionBiometria: true } },
  siembra_origen: {
    include: {
      piletas_siembra_pileta_origenTopiletas: true,
    },
  },
  historial_peso: true,
};

class ReproductorController {
  static async getAll(req, res) {
    try {
      const piletaIdQ = toInt(req.query.pileta_id);
      const where = {};
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (ubicClause) where.piletas = ubicClause;
      if (piletaIdQ) where.pileta_id = piletaIdQ;

      const rows = await prisma.reproductor.findMany({
        where,
        include: reproductorInclude,
        orderBy: { id: "desc" },
      });

      const historial =
        req.query.historial === "1" ||
        String(req.query.historial || "").toLowerCase() === "true";
      const vista = historial ? rows : ultimoRegistroPorPileta(rows);
      res.json(vista.map(serializeReproductor));
    } catch (err) {
      console.error("GET /reproductores Error:", err);
      res.status(500).json({ error: "Error obteniendo registros de reproductores" });
    }
  }

  static async getByGranja(req, res) {
    return ReproductorController.getAll(req, res);
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      const row = await prisma.reproductor.findUnique({
        where: { id },
        include: reproductorInclude,
      });
      if (!row) return res.status(404).json({ error: "Registro no encontrado" });
      res.json(serializeReproductor(row));
    } catch (err) {
      console.error("GET /reproductores/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo registro" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(
        pick(req.body, "pileta_id", "pileta_destino_id"),
      );
      const campos = parseReproductorCampos(req.body);
      const cantidadTotal = campos.cantidad_total;
      const cantidadAlimento = Math.max(
        0,
        toInt(pick(req.body, "cantidad_alimento"), 0) ?? 0,
      );

      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id (pileta de reproductores) es obligatorio" });
      }
      if (cantidadTotal <= 0) {
        return res.status(400).json({
          error: "Debe indicar al menos un macho o una hembra (total de reproductores mayor a 0)",
        });
      }
      if (!campos.fecha_siembra) {
        return res.status(400).json({ error: "fecha_siembra (cuándo se armó el grupo) es obligatoria" });
      }
      if (!campos.lote_genetico) {
        return res.status(400).json({ error: "lote_genetico (origen genético de padres) es obligatorio" });
      }

      const pil = await prisma.pileta.findUnique({
        where: { id: piletaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Pileta no existe" });
      if (pil.tipo !== "reproductores") {
        return res.status(400).json({
          error: `La pileta '${pil.nombre}' debe ser tipo reproductores`,
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
        const { tieneTipos, movimientosInternos, cantidadExterna } =
          analizarProcedenciaSeleccionInterna(req.body, campos);

        if (!siembraOrigenId && movimientosInternos.length > 0) {
          const siembraIds = await registrarSeleccionInternaDesdeEngorda(tx, {
            piletaDestinoId: piletaId,
            movimientos: movimientosInternos,
            usuarioId,
            observacion: obsTexto,
          });
          siembraOrigenId = siembraIds[0] ?? null;
        }

        if (!siembraOrigenId && cantidadExterna > 0) {
          const nuevaSiembraId = await crearSiembraMovimiento(tx, {
            piletaOrigenId: null,
            piletaDestinoId: piletaId,
            cantidadEntera: cantidadExterna,
            usuarioId,
          });
          if (nuevaSiembraId != null) siembraOrigenId = nuevaSiembraId;
        } else if (!siembraOrigenId && !tieneTipos && cantidadTotal > 0) {
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
          proceso: "reproductor",
        });

        await tx.reproductor.updateMany({
          where: { pileta_id: piletaId, activo: true },
          data: { activo: false },
        });

        const fechaSiembra =
          campos.fecha_siembra ??
          (siembraOrigenId
            ? (
                await tx.siembra.findUnique({
                  where: { id: siembraOrigenId },
                  select: { fecha: true },
                })
              )?.fecha
            : null);

        const creadoNuevo = await tx.reproductor.create({
          data: {
            pileta_id: piletaId,
            ...campos,
            fecha_siembra: fechaSiembra ?? campos.fecha_siembra,
            activo: true,
            desovez: 0,
            estado_ciclo: "activo",
            cantidad_alimento: cantidadAlimento,
            observacion_id: obsId,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: siembraOrigenId ?? null,
          },
          include: reproductorInclude,
        });

        await aplicarEstadoPiletaPorCantidad(tx, piletaId, cantidadTotal);
        return creadoNuevo;
      });

      res.status(201).json({
        success: true,
        mensaje: "Lote de reproductores activo registrado",
        data: serializeReproductor(creado),
      });
    } catch (err) {
      if (err.code === "BAD_SIEMBRA" || err.code === "SIEMBRA_DESTINO" || err.code === "VALIDACION") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "ENGORDA_CANTIDAD_INSUFICIENTE") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta o referencias inválidas" });
      }
      console.error("POST /reproductores Error:", err);
      res.status(500).json({ error: "Error al registrar reproductor", detalle: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.reproductor.findUnique({
        where: { id },
        select: { pileta_id: true, siembra_origen_id: true },
      });
      if (!prev) return res.status(404).json({ error: "Reproductor no encontrado" });

      const updateData = {};
      let piletaId = prev.pileta_id;
      let piletaCambiada = false;

      if (req.body.pileta_id !== undefined || req.body.pileta_destino_id !== undefined) {
        const nid = toInt(pick(req.body, "pileta_id", "pileta_destino_id"));
        if (!nid) return res.status(400).json({ error: "pileta_id inválido" });
        const pd = await prisma.pileta.findUnique({
          where: { id: nid },
          select: { tipo: true, nombre: true },
        });
        if (!pd) return res.status(400).json({ error: "Pileta no existe" });
        if (pd.tipo !== "reproductores") {
          return res.status(400).json({
            error: `La pileta '${pd.nombre}' debe ser tipo reproductores`,
          });
        }
        updateData.pileta_id = nid;
        piletaId = nid;
        piletaCambiada = true;
      }

      const tocaInventarioRepro =
        req.body.fecha_siembra !== undefined ||
        req.body.fecha_siembra_reproductores !== undefined ||
        req.body.lote_genetico !== undefined ||
        req.body.machos !== undefined ||
        req.body.hembras !== undefined ||
        req.body.genetica_machos !== undefined ||
        req.body.familia_machos !== undefined ||
        req.body.procedencia_machos !== undefined ||
        req.body.genetica_hembras !== undefined ||
        req.body.familia_hembras !== undefined ||
        req.body.procedencia_hembras !== undefined ||
        req.body.talla !== undefined ||
        req.body.estado_ciclo !== undefined;

      if (tocaInventarioRepro) {
        const prevFull = await prisma.reproductor.findUnique({
          where: { id },
          select: {
            machos: true,
            hembras: true,
            fecha_siembra: true,
            lote_genetico: true,
            activo: true,
            genetica_machos: true,
            familia_machos: true,
            procedencia_machos: true,
            genetica_hembras: true,
            familia_hembras: true,
            procedencia_hembras: true,
            talla: true,
            desovez: true,
            estado_ciclo: true,
          },
        });
        const merged = {
          fecha_siembra:
            pick(req.body, "fecha_siembra", "fecha_siembra_reproductores") ??
            prevFull?.fecha_siembra,
          lote_genetico:
            pick(req.body, "lote_genetico") ?? prevFull?.lote_genetico,
          activo: pick(req.body, "activo") ?? prevFull?.activo,
          machos:
            req.body.machos !== undefined
              ? pick(req.body, "machos")
              : prevFull?.machos,
          hembras:
            req.body.hembras !== undefined
              ? pick(req.body, "hembras")
              : prevFull?.hembras,
          genetica_machos:
            pick(req.body, "genetica_machos") ?? prevFull?.genetica_machos,
          familia_machos:
            pick(req.body, "familia_machos") ?? prevFull?.familia_machos,
          procedencia_machos:
            pick(req.body, "procedencia_machos") ??
            prevFull?.procedencia_machos,
          genetica_hembras:
            pick(req.body, "genetica_hembras") ?? prevFull?.genetica_hembras,
          familia_hembras:
            pick(req.body, "familia_hembras") ?? prevFull?.familia_hembras,
          procedencia_hembras:
            pick(req.body, "procedencia_hembras") ??
            prevFull?.procedencia_hembras,
          talla: pick(req.body, "talla") ?? prevFull?.talla,
          estado_ciclo:
            pick(req.body, "estado_ciclo") ?? prevFull?.estado_ciclo,
        };
        const campos = parseReproductorCampos(merged);
        if (campos.cantidad_total <= 0) {
          return res.status(400).json({
            error: "Debe indicar al menos un macho o una hembra (total de reproductores mayor a 0)",
          });
        }
        Object.assign(updateData, campos);
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

        if (obsTextoExplicito) {
          const obsId = await crearObservacionSiHay(
            tx,
            pick(req.body, "observacion", "observaciones"),
            usuarioId,
            { piletaId, proceso: "reproductor" },
          );
          if (obsId) updateData.observacion_id = obsId;
        }

        const row = await tx.reproductor.update({
          where: { id },
          data: updateData,
          include: reproductorInclude,
        });

        if (updateData.cantidad_total !== undefined || piletaCambiada) {
          const vigente = await cantidadVigenteEnPileta(tx, piletaId, "reproductores");
          await aplicarEstadoPiletaPorCantidad(tx, piletaId, vigente);
        }

        if (piletaCambiada && prev.pileta_id !== piletaId) {
          const vigentePrev = await cantidadVigenteEnPileta(tx, prev.pileta_id, "reproductores");
          await aplicarEstadoPiletaPorCantidad(tx, prev.pileta_id, vigentePrev);
        }

        return row;
      });

      res.json({
        success: true,
        mensaje: "Reproductor actualizado correctamente",
        data: serializeReproductor(actualizado),
      });
    } catch (err) {
      if (err.code === "BAD_SIEMBRA" || err.code === "SIEMBRA_DESTINO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2025") return res.status(404).json({ error: "Reproductor no encontrado" });
      console.error("PUT /reproductores/:id Error:", err);
      res.status(500).json({ error: "Error al actualizar reproductor", detalle: err.message });
    }
  }

}

export default ReproductorController;
