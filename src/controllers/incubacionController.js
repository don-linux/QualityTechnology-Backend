import prisma from "../prisma.js";
import { serializeIncubacion } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import {
  aplicarEstadoPiletaPorCantidad,
  registrarMovimientoReproductorAIncubacion,
} from "../utils/reproductorInventario.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import { cantidadVigenteEnPileta, ultimoRegistroPorPileta } from "../utils/inventarioVigente.js";
import {
  loteGeneticoDesdeEventoCosecha,
  normalizarLoteIncubacion,
} from "../utils/incubacionLote.js";
import { calcularDiasEnPileta } from "../utils/incubacionRegistro.js";

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

function toDateOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function assertSiembraOrigenValidaParaPileta(tx, siembraOrigenId, piletaIncubacionId) {
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
  if (Number(s.pileta_destino) !== Number(piletaIncubacionId)) {
    const err = new Error(
      "La siembra seleccionada debe tener como destino la misma pileta de incubación",
    );
    err.code = "SIEMBRA_DESTINO";
    throw err;
  }
}

const incubacionInclude = {
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
  evento_cosecha: {
    include: {
      piletas: true,
      reproductor: { include: { piletas: true } },
    },
  },
};

class IncubacionController {
  static async getAll(req, res) {
    try {
      const piletaIdQ = toInt(req.query.pileta_id);
      const where = {};
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (ubicClause) where.piletas = ubicClause;
      if (piletaIdQ) where.pileta_id = piletaIdQ;

      const rows = await prisma.incubacion.findMany({
        where,
        include: incubacionInclude,
        orderBy: { id: "desc" },
      });

      const historial =
        req.query.historial === "1" ||
        String(req.query.historial || "").toLowerCase() === "true";
      const vista = historial ? rows : ultimoRegistroPorPileta(rows);
      res.json(vista.map(serializeIncubacion));
    } catch (err) {
      console.error("GET /incubacion Error:", err);
      res.status(500).json({ error: "Error obteniendo registros de incubación" });
    }
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      const row = await prisma.incubacion.findUnique({
        where: { id },
        include: incubacionInclude,
      });
      if (!row) return res.status(404).json({ error: "Registro no encontrado" });
      res.json(serializeIncubacion(row));
    } catch (err) {
      console.error("GET /incubacion/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo registro" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(
        pick(req.body, "pileta_id", "pileta_destino_id", "fi_pileta_destino_id", "fc_pileta_id"),
      );
      const loteRaw = pick(req.body, "lote", "fc_lote", "no_lote");
      const eventoCosechaIdBody = toInt(
        pick(req.body, "evento_cosecha_id", "fi_evento_cosecha_id"),
      );
      const fechaIngreso = toDateOrNull(
        pick(req.body, "fecha_ingreso", "fd_fecha_ingreso", "fecha"),
      );
      const fechaEgreso = toDateOrNull(pick(req.body, "fecha_egreso", "fd_fecha_egreso"));

      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id (pileta de incubación) es obligatorio" });
      }
      if (!loteRaw && !eventoCosechaIdBody) {
        return res.status(400).json({
          error: "lote es obligatorio, o seleccione un evento de cosecha pendiente",
        });
      }
      if (!fechaIngreso && !eventoCosechaIdBody) {
        return res.status(400).json({ error: "fecha_ingreso es obligatoria" });
      }

      const pil = await prisma.pileta.findUnique({
        where: { id: piletaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Pileta no existe" });
      if (pil.tipo !== "incubacion") {
        return res.status(400).json({
          error: `La pileta '${pil.nombre}' debe ser tipo incubación`,
        });
      }

      const lote = loteRaw ? normalizarLoteIncubacion(loteRaw) : null;
      const huevosMl = toDecimal(pick(req.body, "huevos_ml", "fn_huevos_ml"));
      const diasBody = toInt(pick(req.body, "dias_en_pileta", "fn_dias_en_pileta"));
      const diasEnPileta =
        diasBody != null ? diasBody : calcularDiasEnPileta(fechaIngreso, fechaEgreso);

      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion", "observaciones");
      const siembraOrigenId = toInt(pick(req.body, "siembra_origen_id"));
      const biometriaId = toInt(pick(req.body, "biometria_id"));
      const eventoCosechaId = toInt(
        pick(req.body, "evento_cosecha_id", "fi_evento_cosecha_id"),
      );

      const creado = await prisma.$transaction(async (tx) => {
        let siembraOrigenIdFinal = siembraOrigenId;
        let huevosFinal = huevosMl;
        let fechaIngresoFinal = fechaIngreso;
        let loteFinal = lote;
        let eventoCosecha = null;

        if (eventoCosechaId) {
          eventoCosecha = await tx.eventoCosecha.findUnique({
            where: { id: eventoCosechaId },
            include: {
              incubacion: { select: { id: true } },
              reproductor: { select: { lote_genetico: true } },
            },
          });
          if (!eventoCosecha) {
            const err = new Error("evento_cosecha_id inválido");
            err.code = "BAD_EVENTO";
            throw err;
          }
          if (eventoCosecha.incubacion) {
            const err = new Error("El evento de cosecha ya fue recibido en incubación");
            err.code = "EVENTO_YA_RECIBIDO";
            throw err;
          }
          if (huevosFinal == null && eventoCosecha.volumen_ml != null) {
            huevosFinal = Number(eventoCosecha.volumen_ml);
          }
          if (!fechaIngresoFinal && eventoCosecha.fecha_cosecha) {
            fechaIngresoFinal = eventoCosecha.fecha_cosecha;
          }
          loteFinal = loteGeneticoDesdeEventoCosecha(eventoCosecha);
        }

        if (siembraOrigenIdFinal) {
          await assertSiembraOrigenValidaParaPileta(tx, siembraOrigenIdFinal, piletaId);
        } else if (eventoCosecha) {
          const mov = await registrarMovimientoReproductorAIncubacion(tx, {
            piletaOrigenId: eventoCosecha.pileta_id,
            piletaDestinoId: piletaId,
            cantidad: eventoCosecha.hembras_ovadas,
            usuarioId,
            observacion: obsTexto,
            fechaMovimiento: fechaIngresoFinal,
            eventoCodigo: eventoCosecha.codigo,
            loteGenetico: loteFinal,
            huevosMl: huevosFinal,
          });
          siembraOrigenIdFinal = mov.siembraId;
        }

        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "incubacion",
        });

        const diasCalc = calcularDiasEnPileta(fechaIngresoFinal, fechaEgreso);

        const creadoNuevo = await tx.incubacion.create({
          data: {
            pileta_id: piletaId,
            lote: loteFinal,
            huevos_ml: huevosFinal,
            fecha_ingreso: fechaIngresoFinal,
            dias_en_pileta: diasBody != null ? diasBody : diasCalc,
            fecha_egreso: fechaEgreso,
            observacion_id: obsId,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: siembraOrigenIdFinal ?? null,
            evento_cosecha_id: eventoCosechaId ?? null,
          },
          include: incubacionInclude,
        });

        const ocupada = fechaEgreso ? 0 : 1;
        await aplicarEstadoPiletaPorCantidad(tx, piletaId, ocupada);
        return creadoNuevo;
      });

      res.status(201).json({
        mensaje: "Registro periódico de incubación guardado",
        data: serializeIncubacion(creado),
      });
    } catch (err) {
      if (
        err.code === "BAD_LOTE" ||
        err.code === "BAD_LOTE_GENETICO" ||
        err.code === "BAD_SIEMBRA" ||
        err.code === "BAD_EVENTO" ||
        err.code === "EVENTO_YA_RECIBIDO"
      ) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "SIEMBRA_DESTINO" || err.code === "SIEMBRA_FAIL") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "VALIDACION") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res.status(409).json({
          error: "Ya existe un lote con ese código en la pileta o el evento ya está vinculado",
        });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta o referencias inválidas" });
      }
      console.error("POST /incubacion Error:", err);
      res.status(500).json({ error: "Error creando registro de incubación", detalle: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.incubacion.findUnique({
        where: { id },
        select: {
          pileta_id: true,
          siembra_origen_id: true,
          fecha_ingreso: true,
          fecha_egreso: true,
          evento_cosecha_id: true,
        },
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
        if (pd.tipo !== "incubacion") {
          return res.status(400).json({ error: `La pileta '${pd.nombre}' debe ser tipo incubación` });
        }
        updateData.pileta_id = nid;
        piletaId = nid;
      }

      if (
        (req.body.lote !== undefined || req.body.fc_lote !== undefined) &&
        !prev.evento_cosecha_id
      ) {
        updateData.lote = normalizarLoteIncubacion(
          pick(req.body, "lote", "fc_lote", "no_lote"),
        );
      }

      if (req.body.huevos_ml !== undefined || req.body.fn_huevos_ml !== undefined) {
        updateData.huevos_ml = toDecimal(pick(req.body, "huevos_ml", "fn_huevos_ml"));
      }

      if (req.body.fecha_ingreso !== undefined || req.body.fd_fecha_ingreso !== undefined) {
        const fi = toDateOrNull(pick(req.body, "fecha_ingreso", "fd_fecha_ingreso", "fecha"));
        if (!fi) return res.status(400).json({ error: "fecha_ingreso inválida" });
        updateData.fecha_ingreso = fi;
      }

      if (req.body.fecha_egreso !== undefined || req.body.fd_fecha_egreso !== undefined) {
        updateData.fecha_egreso = toDateOrNull(
          pick(req.body, "fecha_egreso", "fd_fecha_egreso"),
        );
      }

      if (req.body.dias_en_pileta !== undefined || req.body.fn_dias_en_pileta !== undefined) {
        updateData.dias_en_pileta = toInt(
          pick(req.body, "dias_en_pileta", "fn_dias_en_pileta"),
        );
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

        if (obsTextoExplicito) {
          const obsId = await crearObservacionSiHay(
            tx,
            pick(req.body, "observacion", "fc_observacion", "observaciones"),
            usuarioId,
            { piletaId, proceso: "incubacion" },
          );
          if (obsId) updateData.observacion_id = obsId;
        }

        const fechaIngresoFutura =
          updateData.fecha_ingreso !== undefined ? updateData.fecha_ingreso : prev.fecha_ingreso;
        const fechaEgresoFutura =
          updateData.fecha_egreso !== undefined ? updateData.fecha_egreso : prev.fecha_egreso;

        if (
          updateData.dias_en_pileta === undefined &&
          (updateData.fecha_ingreso !== undefined || updateData.fecha_egreso !== undefined)
        ) {
          updateData.dias_en_pileta = calcularDiasEnPileta(fechaIngresoFutura, fechaEgresoFutura);
        }

        const row = await tx.incubacion.update({
          where: { id },
          data: updateData,
          include: incubacionInclude,
        });

        if (
          updateData.pileta_id !== undefined ||
          updateData.fecha_egreso !== undefined
        ) {
          const vigente = await cantidadVigenteEnPileta(tx, piletaId, "incubacion");
          await aplicarEstadoPiletaPorCantidad(tx, piletaId, vigente);
        }

        return row;
      });

      res.json({
        mensaje: "Registro actualizado",
        data: serializeIncubacion(actualizado),
      });
    } catch (err) {
      if (
        err.code === "BAD_LOTE" ||
        err.code === "BAD_LOTE_GENETICO" ||
        err.code === "BAD_SIEMBRA" ||
        err.code === "SIEMBRA_DESTINO"
      ) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un lote con ese código en la pileta" });
      }
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("PUT /incubacion/:id Error:", err);
      res.status(500).json({ error: "Error actualizando registro", detalle: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      await prisma.incubacion.delete({ where: { id } });
      res.json({ mensaje: "Registro eliminado" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("DELETE /incubacion/:id Error:", err);
      res.status(500).json({ error: "Error eliminando registro" });
    }
  }
}

export default IncubacionController;
