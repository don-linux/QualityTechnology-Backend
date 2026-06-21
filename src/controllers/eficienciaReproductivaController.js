import prisma from "../prisma.js";
import { serializeEficienciaReproductiva } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import {
  aplicarEstadoPiletaPorCantidad,
  registrarMovimientoReproductorAEficienciaReproductiva,
  registrarDesoveEnInventarioReproductor,
} from "../utils/reproductorInventario.js";
import { piletaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";
import { cantidadVigenteEnPileta, ultimoRegistroPorPileta } from "../utils/inventarioVigente.js";
import { normalizarLoteEficienciaReproductiva } from "../utils/eficienciaReproductivaLote.js";
import { calcularDiasEnPileta } from "../utils/eficienciaReproductivaRegistro.js";
import { resolverLoteReproductorActivo } from "../utils/reproductorLote.js";
import {
  generarCodigoDesoveEficienciaReproductiva,
  normalizarTiposCosecha,
  normalizarVolumenPorTipo,
} from "../utils/eficienciaReproductivaCodigo.js";

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

const eficienciaReproductivaInclude = {
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
  pileta_origen: {
    select: { id: true, nombre: true, ubicacion: { select: { nombre: true } } },
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
};

class EficienciaReproductivaController {
  static async getAll(req, res) {
    try {
      const piletaIdQ = toInt(req.query.pileta_id);
      const where = {};
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (ubicClause) where.piletas = ubicClause;
      if (piletaIdQ) where.pileta_id = piletaIdQ;

      const rows = await prisma.eficiencia_reproductiva.findMany({
        where,
        include: eficienciaReproductivaInclude,
        orderBy: { id: "desc" },
      });

      const historial =
        req.query.historial === "1" ||
        String(req.query.historial || "").toLowerCase() === "true";
      const vista = historial ? rows : ultimoRegistroPorPileta(rows);
      res.json(vista.map(serializeEficienciaReproductiva));
    } catch (err) {
      console.error("GET /eficiencia-reproductiva Error:", err);
      res.status(500).json({ error: "Error obteniendo registros de eficiencia reproductiva" });
    }
  }

  static async getById(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      const row = await prisma.eficiencia_reproductiva.findUnique({
        where: { id },
        include: eficienciaReproductivaInclude,
      });
      if (!row) return res.status(404).json({ error: "Registro no encontrado" });
      res.json(serializeEficienciaReproductiva(row));
    } catch (err) {
      console.error("GET /eficiencia-reproductiva/:id Error:", err);
      res.status(500).json({ error: "Error obteniendo registro" });
    }
  }

  /**
   * Registra un desove (cosecha) y su ingreso a la pileta de incubación en un solo paso.
   * Toda la información vive en la tabla `eficiencia_reproductiva`; se conservan los efectos de inventario:
   * contador de desovez del reproductor, descuento de hembras y movimiento `siembra`.
   */
  static async create(req, res) {
    try {
      const piletaId = toInt(
        pick(req.body, "pileta_id", "pileta_destino_id", "fi_pileta_destino_id", "fc_pileta_id"),
      );
      const piletaOrigenId = toInt(
        pick(req.body, "pileta_origen_id", "pileta_origen", "fi_pileta_origen_id", "fi_pileta_id"),
      );
      const reproductorId = toInt(
        pick(req.body, "reproductor_id", "fi_reproductor_id", "lote_reproductor_id"),
      );
      const fechaCosecha = toDateOrNull(
        pick(req.body, "fecha_cosecha", "fd_fecha_cosecha", "fecha"),
      );
      const tiposCosecha = normalizarTiposCosecha(
        pick(req.body, "tipo_cosecha", "fc_tipo_cosecha", "tipos_cosecha", "fc_tipos_cosecha", "tipo"),
      );
      const estadio = pick(req.body, "estadio_desarrollo", "fc_estadio_desarrollo", "estadio");
      const hembrasOvadas = toInt(
        pick(req.body, "hembras_ovadas", "fn_hembras_ovadas", "ovadas"),
        null,
      );
      const volumenPorTipo = normalizarVolumenPorTipo(
        pick(req.body, "volumen_por_tipo", "fc_volumen_por_tipo", "volumenes_por_tipo"),
        tiposCosecha,
      );
      const volumenes = Object.values(volumenPorTipo);
      const huevosMl = volumenes.length
        ? volumenes.reduce((acc, n) => acc + n, 0)
        : toDecimal(
            pick(
              req.body,
              "huevos_ml",
              "fn_huevos_ml",
              "volumen_ml",
              "fn_volumen_ml",
              "volumen_o_contrapeso",
            ),
          );
      const fechaIngreso = toDateOrNull(pick(req.body, "fecha_ingreso", "fd_fecha_ingreso"));
      const fechaEgreso = toDateOrNull(pick(req.body, "fecha_egreso", "fd_fecha_egreso"));
      const diasBody = toInt(pick(req.body, "dias_en_pileta", "fn_dias_en_pileta"));
      const marcarAgotado =
        req.body.marcar_agotado === true ||
        req.body.fb_marcar_agotado === true ||
        String(pick(req.body, "estado_ciclo", "fc_estado_ciclo") ?? "")
          .trim()
          .toLowerCase() === "agotado";
      const estadoCicloBody = pick(req.body, "estado_ciclo", "fc_estado_ciclo");
      const biometriaId = toInt(pick(req.body, "biometria_id"));
      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion", "observaciones");

      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id (pileta de eficiencia reproductiva) es obligatorio" });
      }
      if (!fechaCosecha) {
        return res.status(400).json({ error: "fecha_cosecha es obligatoria" });
      }
      if (!tiposCosecha.length) {
        return res.status(400).json({
          error:
            "tipo_cosecha es obligatorio. Seleccione al menos una opción: huevo, larva_saco o alevin_nadando",
        });
      }
      if (hembrasOvadas == null || hembrasOvadas < 1) {
        return res.status(400).json({
          error: "hembras_ovadas es obligatoria y debe ser al menos 1",
        });
      }

      const pil = await prisma.pileta.findUnique({
        where: { id: piletaId },
        select: { id: true, tipo: true, nombre: true },
      });
      if (!pil) return res.status(400).json({ error: "Pileta no existe" });
      if (pil.tipo !== "incubacion") {
        return res.status(400).json({
          error: `La pileta '${pil.nombre}' debe ser tipo incubación (eficiencia reproductiva)`,
        });
      }

      const creado = await prisma.$transaction(async (tx) => {
        const lote = await resolverLoteReproductorActivo(tx, {
          reproductorId,
          piletaId: piletaOrigenId,
        });

        const hembrasDisponibles = lote.hembras ?? 0;
        if (hembrasOvadas > hembrasDisponibles) {
          const err = new Error(
            `hembras_ovadas (${hembrasOvadas}) supera las hembras del lote (${hembrasDisponibles})`,
          );
          err.code = "VALIDACION";
          throw err;
        }

        if (!lote.lote_genetico || !String(lote.lote_genetico).trim()) {
          const err = new Error(
            "El lote de reproductores no tiene lote genético. Complételo en el módulo 1 antes de cosechar.",
          );
          err.code = "BAD_LOTE_GENETICO";
          throw err;
        }
        const loteGenetico = normalizarLoteEficienciaReproductiva(lote.lote_genetico);
        const codigo = await generarCodigoDesoveEficienciaReproductiva(tx);
        const fechaIngresoFinal = fechaIngreso ?? fechaCosecha;

        const mov = await registrarMovimientoReproductorAEficienciaReproductiva(tx, {
          piletaOrigenId: lote.pileta_id,
          piletaDestinoId: piletaId,
          cantidad: hembrasOvadas,
          usuarioId,
          observacion: obsTexto,
          fechaMovimiento: fechaIngresoFinal,
          eventoCodigo: codigo,
          loteGenetico,
          huevosMl,
        });

        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "eficiencia_reproductiva",
        });

        const diasCalc = calcularDiasEnPileta(fechaIngresoFinal, fechaEgreso);

        const creadoNuevo = await tx.eficiencia_reproductiva.create({
          data: {
            codigo,
            pileta_id: piletaId,
            pileta_origen_id: lote.pileta_id,
            reproductor_id: lote.id,
            lote: loteGenetico,
            tipo_cosecha: tiposCosecha,
            estadio_desarrollo: estadio ? String(estadio).trim().slice(0, 80) : null,
            hembras_ovadas: hembrasOvadas,
            fecha_cosecha: fechaCosecha,
            huevos_ml: huevosMl,
            volumen_por_tipo: volumenPorTipo,
            fecha_ingreso: fechaIngresoFinal,
            dias_en_pileta: diasBody != null ? diasBody : diasCalc,
            fecha_egreso: fechaEgreso,
            observacion_id: obsId,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: mov.siembraId,
          },
          include: eficienciaReproductivaInclude,
        });

        await registrarDesoveEnInventarioReproductor(tx, {
          reproductorId: lote.id,
          estadoCiclo: estadoCicloBody,
          marcarAgotado,
        });

        const ocupada = fechaEgreso ? 0 : 1;
        await aplicarEstadoPiletaPorCantidad(tx, piletaId, ocupada);
        return creadoNuevo;
      });

      res.status(201).json({
        success: true,
        mensaje: "Cosecha e ingreso a eficiencia reproductiva registrados",
        data: serializeEficienciaReproductiva(creado),
      });
    } catch (err) {
      if (
        err.code === "VALIDACION" ||
        err.code === "SIN_LOTE_ACTIVO" ||
        err.code === "LOTE_INACTIVO" ||
        err.code === "LOTE_AGOTADO" ||
        err.code === "NOT_FOUND" ||
        err.code === "BAD_LOTE" ||
        err.code === "BAD_LOTE_GENETICO" ||
        err.code === "SIEMBRA_FAIL"
      ) {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res.status(409).json({
          error: "Ya existe un registro de eficiencia reproductiva con ese código o lote en la pileta",
        });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta o referencias inválidas" });
      }
      console.error("POST /eficiencia-reproductiva Error:", err);
      res.status(500).json({ error: "Error creando registro de eficiencia reproductiva", detalle: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.eficiencia_reproductiva.findUnique({
        where: { id },
        select: {
          pileta_id: true,
          fecha_ingreso: true,
          fecha_egreso: true,
          tipo_cosecha: true,
        },
      });
      if (!prev) return res.status(404).json({ error: "Registro no encontrado" });

      const updateData = {};
      let piletaId = prev.pileta_id;
      let tiposActualizados = null;

      if (req.body.pileta_id !== undefined || req.body.pileta_destino_id !== undefined) {
        const nid = toInt(pick(req.body, "pileta_id", "pileta_destino_id", "fi_pileta_destino_id"));
        if (!nid) return res.status(400).json({ error: "pileta_id inválido" });
        const pd = await prisma.pileta.findUnique({
          where: { id: nid },
          select: { tipo: true, nombre: true },
        });
        if (!pd) return res.status(400).json({ error: "Pileta no existe" });
        if (pd.tipo !== "incubacion") {
          return res.status(400).json({ error: `La pileta '${pd.nombre}' debe ser tipo incubación (eficiencia reproductiva)` });
        }
        updateData.pileta_id = nid;
        piletaId = nid;
      }

      if (
        req.body.tipo_cosecha !== undefined ||
        req.body.fc_tipo_cosecha !== undefined ||
        req.body.tipos_cosecha !== undefined ||
        req.body.fc_tipos_cosecha !== undefined
      ) {
        const tipos = normalizarTiposCosecha(
          pick(req.body, "tipo_cosecha", "fc_tipo_cosecha", "tipos_cosecha", "fc_tipos_cosecha"),
        );
        if (!tipos.length) {
          return res
            .status(400)
            .json({ error: "tipo_cosecha inválido. Seleccione al menos una opción" });
        }
        updateData.tipo_cosecha = tipos;
        tiposActualizados = tipos;
      }
      if (req.body.estadio_desarrollo !== undefined || req.body.fc_estadio_desarrollo !== undefined) {
        const e = pick(req.body, "estadio_desarrollo", "fc_estadio_desarrollo");
        updateData.estadio_desarrollo = e ? String(e).trim().slice(0, 80) : null;
      }
      if (req.body.hembras_ovadas !== undefined || req.body.fn_hembras_ovadas !== undefined) {
        const ho = toInt(pick(req.body, "hembras_ovadas", "fn_hembras_ovadas"), null);
        if (ho == null || ho < 1) {
          return res.status(400).json({ error: "hembras_ovadas debe ser al menos 1" });
        }
        updateData.hembras_ovadas = ho;
      }
      if (req.body.fecha_cosecha !== undefined || req.body.fd_fecha_cosecha !== undefined) {
        const f = toDateOrNull(pick(req.body, "fecha_cosecha", "fd_fecha_cosecha"));
        if (!f) return res.status(400).json({ error: "fecha_cosecha inválida" });
        updateData.fecha_cosecha = f;
      }
      if (req.body.lote !== undefined || req.body.fc_lote !== undefined) {
        updateData.lote = normalizarLoteEficienciaReproductiva(pick(req.body, "lote", "fc_lote", "no_lote"));
      }
      if (
        req.body.volumen_por_tipo !== undefined ||
        req.body.fc_volumen_por_tipo !== undefined ||
        req.body.huevos_ml !== undefined ||
        req.body.fn_huevos_ml !== undefined ||
        req.body.volumen_ml !== undefined ||
        req.body.fn_volumen_ml !== undefined
      ) {
        const tiposBase = tiposActualizados ?? prev.tipo_cosecha ?? [];
        const mapa = normalizarVolumenPorTipo(
          pick(req.body, "volumen_por_tipo", "fc_volumen_por_tipo"),
          tiposBase.length ? tiposBase : null,
        );
        const valores = Object.values(mapa);
        if (valores.length) {
          updateData.volumen_por_tipo = mapa;
          updateData.huevos_ml = valores.reduce((acc, n) => acc + n, 0);
        } else {
          updateData.volumen_por_tipo = {};
          updateData.huevos_ml = toDecimal(
            pick(req.body, "huevos_ml", "fn_huevos_ml", "volumen_ml", "fn_volumen_ml"),
          );
        }
      }
      if (req.body.fecha_ingreso !== undefined || req.body.fd_fecha_ingreso !== undefined) {
        const fi = toDateOrNull(pick(req.body, "fecha_ingreso", "fd_fecha_ingreso", "fecha"));
        if (!fi) return res.status(400).json({ error: "fecha_ingreso inválida" });
        updateData.fecha_ingreso = fi;
      }
      if (req.body.fecha_egreso !== undefined || req.body.fd_fecha_egreso !== undefined) {
        updateData.fecha_egreso = toDateOrNull(pick(req.body, "fecha_egreso", "fd_fecha_egreso"));
      }
      if (req.body.dias_en_pileta !== undefined || req.body.fn_dias_en_pileta !== undefined) {
        updateData.dias_en_pileta = toInt(pick(req.body, "dias_en_pileta", "fn_dias_en_pileta"));
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
            { piletaId, proceso: "eficiencia_reproductiva" },
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

        const row = await tx.eficiencia_reproductiva.update({
          where: { id },
          data: updateData,
          include: eficienciaReproductivaInclude,
        });

        if (updateData.pileta_id !== undefined || updateData.fecha_egreso !== undefined) {
          const vigente = await cantidadVigenteEnPileta(tx, piletaId, "incubacion");
          await aplicarEstadoPiletaPorCantidad(tx, piletaId, vigente);
        }

        return row;
      });

      res.json({
        mensaje: "Registro actualizado",
        data: serializeEficienciaReproductiva(actualizado),
      });
    } catch (err) {
      if (err.code === "BAD_LOTE" || err.code === "BAD_LOTE_GENETICO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un registro con ese código o lote en la pileta" });
      }
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("PUT /eficiencia-reproductiva/:id Error:", err);
      res.status(500).json({ error: "Error actualizando registro", detalle: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      await prisma.$transaction(async (tx) => {
        const prev = await tx.eficiencia_reproductiva.findUnique({
          where: { id },
          select: { pileta_id: true },
        });
        if (!prev) {
          const err = new Error("Registro no encontrado");
          err.code = "P2025";
          throw err;
        }
        await tx.eficiencia_reproductiva.delete({ where: { id } });
        const vigente = await cantidadVigenteEnPileta(tx, prev.pileta_id, "incubacion");
        await aplicarEstadoPiletaPorCantidad(tx, prev.pileta_id, vigente);
      });

      res.json({ mensaje: "Registro eliminado" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      console.error("DELETE /eficiencia-reproductiva/:id Error:", err);
      res.status(500).json({ error: "Error eliminando registro" });
    }
  }
}

export default EficienciaReproductivaController;
