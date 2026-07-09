import prisma from "../prisma.js";
import { serializeReproductor } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { aplicarEstadoInfraestructuraFisicaPorCantidad, analizarProcedenciaSeleccionInterna, registrarSeleccionInternaDesdeEngorda } from "../utils/reproductorInventario.js";
import { crearSiembraMovimiento } from "../utils/siembraMovimiento.js";
import { infraestructuraFisicaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import { cantidadVigenteEnInfraestructuraFisica, ultimoRegistroPorInfraestructuraFisica } from "../utils/inventarioVigente.js";
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

async function assertSiembraOrigenValidaParaInfraestructuraFisica(tx, siembraOrigenId, infraestructuraFisicaReproductorId) {
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
  if (Number(s.infraestructura_fisica_destino) !== Number(infraestructuraFisicaReproductorId)) {
    const err = new Error(
      "La siembra seleccionada debe tener como destino la misma infraestructura física de reproductores",
    );
    err.code = "SIEMBRA_DESTINO";
    throw err;
  }
}

const reproductorInclude = {
  infraestructuraFisica: {
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
      infraestructuraFisicaOrigen: true,
    },
  },
  historial_peso: true,
};

class ReproductorController {
  static async getAll(req, res) {
    try {
      const infraestructuraFisicaIdQ = toInt(req.query.infraestructura_fisica_id);
      const where = {};
      const ubicClause = infraestructuraFisicaWhereUbicacionFromRequest(req);
      if (ubicClause) where.infraestructuraFisica = ubicClause;
      if (infraestructuraFisicaIdQ) where.infraestructura_fisica_id = infraestructuraFisicaIdQ;

      const rows = await prisma.reproductor.findMany({
        where,
        include: reproductorInclude,
        orderBy: { id: "desc" },
      });

      const historial =
        req.query.historial === "1" ||
        String(req.query.historial || "").toLowerCase() === "true";
      const vista = historial ? rows : ultimoRegistroPorInfraestructuraFisica(rows);
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
      const infraestructuraFisicaId = toInt(
        pick(req.body, "infraestructura_fisica_id", "infraestructura_fisica_destino_id"),
      );
      const campos = parseReproductorCampos(req.body);
      const cantidadTotal = campos.cantidad_total;
      const cantidadAlimento = Math.max(
        0,
        toInt(pick(req.body, "cantidad_alimento"), 0) ?? 0,
      );

      if (!infraestructuraFisicaId) {
        return res.status(400).json({ error: "infraestructura_fisica_id (infraestructura física de reproductores) es obligatorio" });
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

      const pil = await prisma.infraestructuraFisica.findUnique({
        where: { id: infraestructuraFisicaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Infraestructura física no existe" });
      if (pil.tipo !== "reproductores") {
        return res.status(400).json({
          error: `La infraestructura física '${pil.nombre}' debe ser tipo reproductores`,
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
        const { tieneTipos, movimientosInternos, cantidadExterna } =
          analizarProcedenciaSeleccionInterna(req.body, campos);

        if (!siembraOrigenId && movimientosInternos.length > 0) {
          const siembraIds = await registrarSeleccionInternaDesdeEngorda(tx, {
            infraestructuraFisicaDestinoId: infraestructuraFisicaId,
            movimientos: movimientosInternos,
            usuarioId,
            observacion: obsTexto,
          });
          siembraOrigenId = siembraIds[0] ?? null;
        }

        if (!siembraOrigenId && cantidadExterna > 0) {
          const nuevaSiembraId = await crearSiembraMovimiento(tx, {
            infraestructuraFisicaOrigenId: null,
            infraestructuraFisicaDestinoId: infraestructuraFisicaId,
            cantidadEntera: cantidadExterna,
            usuarioId,
          });
          if (nuevaSiembraId != null) siembraOrigenId = nuevaSiembraId;
        } else if (!siembraOrigenId && !tieneTipos && cantidadTotal > 0) {
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
          proceso: "reproductor",
        });

        await tx.reproductor.updateMany({
          where: { infraestructura_fisica_id: infraestructuraFisicaId, activo: true },
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
            infraestructura_fisica_id: infraestructuraFisicaId,
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

        await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, infraestructuraFisicaId, cantidadTotal);
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
        return res.status(400).json({ error: "InfraestructuraFisica o referencias inválidas" });
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
        select: { infraestructura_fisica_id: true, siembra_origen_id: true },
      });
      if (!prev) return res.status(404).json({ error: "Reproductor no encontrado" });

      const updateData = {};
      let infraestructuraFisicaId = prev.infraestructura_fisica_id;
      let infraestructuraFisicaCambiada = false;

      if (req.body.infraestructura_fisica_id !== undefined || req.body.infraestructura_fisica_destino_id !== undefined) {
        const nid = toInt(pick(req.body, "infraestructura_fisica_id", "infraestructura_fisica_destino_id"));
        if (!nid) return res.status(400).json({ error: "infraestructura_fisica_id inválido" });
        const pd = await prisma.infraestructuraFisica.findUnique({
          where: { id: nid },
          select: { tipo: true, nombre: true },
        });
        if (!pd) return res.status(400).json({ error: "Infraestructura física no existe" });
        if (pd.tipo !== "reproductores") {
          return res.status(400).json({
            error: `La infraestructura física '${pd.nombre}' debe ser tipo reproductores`,
          });
        }
        updateData.infraestructura_fisica_id = nid;
        infraestructuraFisicaId = nid;
        infraestructuraFisicaCambiada = true;
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
        await assertSiembraOrigenValidaParaInfraestructuraFisica(tx, siembraOrigenFuturo ?? null, infraestructuraFisicaId);

        if (obsTextoExplicito) {
          const obsId = await crearObservacionSiHay(
            tx,
            pick(req.body, "observacion", "observaciones"),
            usuarioId,
            { infraestructuraFisicaId, proceso: "reproductor" },
          );
          if (obsId) updateData.observacion_id = obsId;
        }

        const row = await tx.reproductor.update({
          where: { id },
          data: updateData,
          include: reproductorInclude,
        });

        if (updateData.cantidad_total !== undefined || infraestructuraFisicaCambiada) {
          const vigente = await cantidadVigenteEnInfraestructuraFisica(tx, infraestructuraFisicaId, "reproductores");
          await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, infraestructuraFisicaId, vigente);
        }

        if (infraestructuraFisicaCambiada && prev.infraestructura_fisica_id !== infraestructuraFisicaId) {
          const vigentePrev = await cantidadVigenteEnInfraestructuraFisica(tx, prev.infraestructura_fisica_id, "reproductores");
          await aplicarEstadoInfraestructuraFisicaPorCantidad(tx, prev.infraestructura_fisica_id, vigentePrev);
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
