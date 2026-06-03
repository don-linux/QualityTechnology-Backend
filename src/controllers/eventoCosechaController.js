import prisma from "../prisma.js";
import { serializeEventoCosecha } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import {
  generarCodigoEventoCosecha,
  normalizarTipoCosecha,
} from "../utils/eventoCosechaCodigo.js";
import { registrarDesoveEnInventarioReproductor } from "../utils/reproductorInventario.js";
import { crearIncubacionDesdeEventoCosecha } from "../utils/incubacionRegistro.js";

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

const eventoInclude = {
  piletas: { include: { ubicacion: true } },
  reproductor: {
    include: {
      piletas: { include: { ubicacion: true } },
    },
  },
  observacion: true,
  incubacion: {
    select: {
      id: true,
      lote: true,
      pileta_id: true,
      huevos_ml: true,
      dias_en_pileta: true,
      fecha_ingreso: true,
      fecha_egreso: true,
      observacion_id: true,
      observacion: true,
      piletas: {
        select: {
          nombre: true,
          ubicacion: true,
          observaciones: {
            orderBy: { created_at: "desc" },
            take: 1,
            select: { comentario: true, proceso: true, created_at: true },
          },
        },
      },
    },
  },
};

async function resolverLoteReproductorActivo(tx, { reproductorId, piletaId }) {
  const select = {
    id: true,
    pileta_id: true,
    activo: true,
    estado_ciclo: true,
    hembras: true,
    desovez: true,
  };

  if (reproductorId) {
    const row = await tx.reproductor.findUnique({
      where: { id: reproductorId },
      select,
    });
    if (!row) {
      const err = new Error("Lote de reproductores no encontrado");
      err.code = "NOT_FOUND";
      throw err;
    }
    if (!row.activo) {
      const err = new Error("El lote de reproductores no está activo");
      err.code = "LOTE_INACTIVO";
      throw err;
    }
    if (row.estado_ciclo === "agotado") {
      const err = new Error("El lote de reproductores está agotado y no admite más cosechas");
      err.code = "LOTE_AGOTADO";
      throw err;
    }
    return row;
  }

  if (!piletaId) {
    const err = new Error("reproductor_id o pileta_id (estanque origen) es obligatorio");
    err.code = "VALIDACION";
    throw err;
  }

  const row = await tx.reproductor.findFirst({
    where: { pileta_id: piletaId, activo: true, estado_ciclo: "activo" },
    orderBy: { id: "desc" },
    select,
  });
  if (!row) {
    const agotado = await tx.reproductor.findFirst({
      where: { pileta_id: piletaId, activo: true, estado_ciclo: "agotado" },
      orderBy: { id: "desc" },
      select: { id: true },
    });
    if (agotado) {
      const err = new Error(
        "El lote de reproductores en la pileta está agotado. Registre un nuevo grupo en el módulo 1.",
      );
      err.code = "LOTE_AGOTADO";
      throw err;
    }
    const err = new Error(
      "No hay un lote de reproductores activo en la pileta indicada. Regístrelo en el módulo 1.",
    );
    err.code = "SIN_LOTE_ACTIVO";
    throw err;
  }
  return row;
}

class EventoCosechaController {
  static async getAll(req, res) {
    try {
      const where = {};
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (ubicClause) where.piletas = ubicClause;

      const piletaIdQ = toInt(req.query.pileta_id);
      if (piletaIdQ) where.pileta_id = piletaIdQ;

      const pendiente =
        req.query.pendiente_incubacion === "1" ||
        String(req.query.pendiente_incubacion || "").toLowerCase() === "true";
      if (pendiente) {
        where.incubacion = { is: null };
      }

      const rows = await prisma.eventoCosecha.findMany({
        where,
        include: eventoInclude,
        orderBy: { id: "desc" },
      });

      res.json(rows.map(serializeEventoCosecha));
    } catch (err) {
      console.error("GET /eventos-cosecha Error:", err);
      res.status(500).json({ error: "Error obteniendo eventos de cosecha" });
    }
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      const row = await prisma.eventoCosecha.findUnique({
        where: { id },
        include: eventoInclude,
      });
      if (!row) return res.status(404).json({ error: "Evento no encontrado" });
      res.json(serializeEventoCosecha(row));
    } catch (err) {
      console.error("GET /eventos-cosecha/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo evento de cosecha" });
    }
  }

  static async create(req, res) {
    try {
      const reproductorId = toInt(
        pick(req.body, "reproductor_id", "fi_reproductor_id", "lote_reproductor_id"),
      );
      const piletaIdBody = toInt(
        pick(req.body, "pileta_id", "pileta_origen_id", "fi_pileta_origen_id", "fi_pileta_id"),
      );
      const fechaCosecha = toDateOrNull(
        pick(req.body, "fecha_cosecha", "fd_fecha_cosecha", "fecha"),
      );
      const tipoCosecha = normalizarTipoCosecha(
        pick(req.body, "tipo_cosecha", "fc_tipo_cosecha", "tipo"),
      );
      const estadio = pick(req.body, "estadio_desarrollo", "fc_estadio_desarrollo", "estadio");
      const volumen = toDecimal(
        pick(req.body, "volumen_ml", "fn_volumen_ml", "volumen_o_contrapeso", "huevos_ml"),
      );
      const hembrasOvadas = toInt(
        pick(req.body, "hembras_ovadas", "fn_hembras_ovadas", "ovadas"),
        null,
      );
      const marcarAgotado =
        req.body.marcar_agotado === true ||
        req.body.fb_marcar_agotado === true ||
        String(pick(req.body, "estado_ciclo", "fc_estado_ciclo") ?? "")
          .trim()
          .toLowerCase() === "agotado";
      const estadoCicloBody = pick(req.body, "estado_ciclo", "fc_estado_ciclo");

      if (!fechaCosecha) {
        return res.status(400).json({ error: "fecha_cosecha es obligatoria" });
      }
      if (!tipoCosecha) {
        return res.status(400).json({
          error: "tipo_cosecha inválido. Use: huevo, larva_saco o alevin_nadando",
        });
      }
      if (hembrasOvadas == null || hembrasOvadas < 1) {
        return res.status(400).json({
          error: "hembras_ovadas es obligatoria y debe ser al menos 1",
        });
      }

      const piletaDestinoIncubacion = toInt(
        pick(
          req.body,
          "pileta_destino_incubacion_id",
          "fi_pileta_destino_id",
          "pileta_destino_id",
        ),
      );
      const fechaIngresoIncubacion = toDateOrNull(
        pick(req.body, "fecha_ingreso", "fd_fecha_ingreso"),
      );
      const fechaEgresoIncubacion = toDateOrNull(
        pick(req.body, "fecha_egreso", "fd_fecha_egreso"),
      );

      if (!piletaDestinoIncubacion) {
        return res.status(400).json({
          error: "pileta_destino_incubacion_id (pileta de incubación) es obligatoria",
        });
      }

      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion", "observaciones");

      const creado = await prisma.$transaction(async (tx) => {
        const lote = await resolverLoteReproductorActivo(tx, {
          reproductorId,
          piletaId: piletaIdBody,
        });

        const hembrasDisponibles = lote.hembras ?? 0;
        if (hembrasOvadas > hembrasDisponibles) {
          const err = new Error(
            `hembras_ovadas (${hembrasOvadas}) supera las hembras del lote (${hembrasDisponibles})`,
          );
          err.code = "VALIDACION";
          throw err;
        }

        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId: piletaDestinoIncubacion,
          proceso: "evento_cosecha",
        });

        const codigo = await generarCodigoEventoCosecha(tx);

        const evento = await tx.eventoCosecha.create({
          data: {
            codigo,
            reproductor_id: lote.id,
            pileta_id: lote.pileta_id,
            fecha_cosecha: fechaCosecha,
            tipo_cosecha: tipoCosecha,
            estadio_desarrollo: estadio ? String(estadio).trim().slice(0, 80) : null,
            volumen_ml: volumen,
            hembras_ovadas: hembrasOvadas,
            observacion_id: obsId,
          },
          include: eventoInclude,
        });

        await registrarDesoveEnInventarioReproductor(tx, {
          reproductorId: lote.id,
          estadoCiclo: estadoCicloBody,
          marcarAgotado,
        });

        await crearIncubacionDesdeEventoCosecha(tx, {
          eventoCosecha: evento,
          piletaDestinoId: piletaDestinoIncubacion,
          usuarioId,
          fechaIngreso: fechaIngresoIncubacion ?? fechaCosecha,
          fechaEgreso: fechaEgresoIncubacion,
          huevosMl: volumen,
          observacion: obsTexto,
          include: eventoInclude,
        });

        const eventoCompleto = await tx.eventoCosecha.findUnique({
          where: { id: evento.id },
          include: eventoInclude,
        });

        return eventoCompleto;
      });

      res.status(201).json({
        success: true,
        mensaje: "Evento de cosecha e ingreso a incubación registrados",
        data: serializeEventoCosecha(creado),
      });
    } catch (err) {
      if (
        err.code === "VALIDACION" ||
        err.code === "SIN_LOTE_ACTIVO" ||
        err.code === "LOTE_INACTIVO" ||
        err.code === "LOTE_AGOTADO" ||
        err.code === "NOT_FOUND" ||
        err.code === "EVENTO_YA_RECIBIDO" ||
        err.code === "BAD_LOTE_GENETICO"
      ) {
        return res.status(400).json({ error: err.message });
      }
      console.error("POST /eventos-cosecha Error:", err);
      res.status(500).json({ error: "Error al registrar evento de cosecha", detalle: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.eventoCosecha.findUnique({
        where: { id },
        select: { id: true, incubacion: { select: { id: true } } },
      });
      if (!prev) return res.status(404).json({ error: "Evento no encontrado" });

      const updateData = {};
      if (req.body.fecha_cosecha !== undefined || req.body.fd_fecha_cosecha !== undefined) {
        const f = toDateOrNull(pick(req.body, "fecha_cosecha", "fd_fecha_cosecha"));
        if (!f) return res.status(400).json({ error: "fecha_cosecha inválida" });
        updateData.fecha_cosecha = f;
      }
      if (req.body.tipo_cosecha !== undefined || req.body.fc_tipo_cosecha !== undefined) {
        const t = normalizarTipoCosecha(pick(req.body, "tipo_cosecha", "fc_tipo_cosecha"));
        if (!t) return res.status(400).json({ error: "tipo_cosecha inválido" });
        updateData.tipo_cosecha = t;
      }
      if (
        req.body.estadio_desarrollo !== undefined ||
        req.body.fc_estadio_desarrollo !== undefined
      ) {
        const e = pick(req.body, "estadio_desarrollo", "fc_estadio_desarrollo");
        updateData.estadio_desarrollo = e ? String(e).trim().slice(0, 80) : null;
      }
      if (req.body.volumen_ml !== undefined || req.body.fn_volumen_ml !== undefined) {
        updateData.volumen_ml = toDecimal(
          pick(req.body, "volumen_ml", "fn_volumen_ml", "volumen_o_contrapeso"),
        );
      }
      if (req.body.hembras_ovadas !== undefined || req.body.fn_hembras_ovadas !== undefined) {
        const ho = toInt(pick(req.body, "hembras_ovadas", "fn_hembras_ovadas", "ovadas"), null);
        if (ho == null || ho < 1) {
          return res.status(400).json({ error: "hembras_ovadas debe ser al menos 1" });
        }
        updateData.hembras_ovadas = ho;
      }

      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion");
      if (obsTexto !== undefined) {
        const piletaId = toInt(pick(req.body, "pileta_id"));
        const ev = await prisma.eventoCosecha.findUnique({
          where: { id },
          select: {
            pileta_id: true,
            observacion_id: true,
            incubacion: { select: { pileta_id: true } },
          },
        });
        const obsId = await crearObservacionSiHay(prisma, obsTexto, usuarioId, {
          piletaId: piletaId ?? ev?.incubacion?.pileta_id ?? ev?.pileta_id,
          proceso: "evento_cosecha",
        });
        if (obsId != null) updateData.observacion_id = obsId;
      }

      const actualizado = await prisma.eventoCosecha.update({
        where: { id },
        data: updateData,
        include: eventoInclude,
      });

      res.json({
        success: true,
        data: serializeEventoCosecha(actualizado),
      });
    } catch (err) {
      console.error("PUT /eventos-cosecha/:id Error:", err);
      res.status(500).json({ error: "Error actualizando evento de cosecha" });
    }
  }

  static async delete(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.eventoCosecha.findUnique({
        where: { id },
        include: { incubacion: { select: { id: true } } },
      });
      if (!prev) return res.status(404).json({ error: "Evento no encontrado" });
      if (prev.incubacion) {
        return res.status(409).json({
          error: "No se puede eliminar: el evento ya fue recibido en incubación",
        });
      }

      await prisma.eventoCosecha.delete({ where: { id } });
      res.json({ success: true, mensaje: "Evento de cosecha eliminado" });
    } catch (err) {
      console.error("DELETE /eventos-cosecha/:id Error:", err);
      res.status(500).json({ error: "Error eliminando evento de cosecha" });
    }
  }
}

export default EventoCosechaController;
