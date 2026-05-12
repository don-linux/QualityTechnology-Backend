import prisma from "../prisma.js";
import {
  serializeReproductor,
  serializeTrazaReproductor,
} from "../utils/serializers.js";
import { resolverUbicacion, resolverOCrearUbicacion } from "../utils/ubicacion.js";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const REGEX_ENTERO = /^\d+$/;
const REGEX_DECIMAL = /^\d+(\.\d+)?$/;

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

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function validarCamposReproductor({ fn_machos, fn_hembras, fn_talla, fc_observacion }) {
  if (fn_machos !== undefined && fn_machos !== null && fn_machos !== "") {
    const valor = String(fn_machos);
    if (valor.length > MAX_NUMERICO) {
      return `La cantidad de machos no puede superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_ENTERO.test(valor)) {
      return "La cantidad de machos debe ser un numero entero.";
    }
  }
  if (fn_hembras !== undefined && fn_hembras !== null && fn_hembras !== "") {
    const valor = String(fn_hembras);
    if (valor.length > MAX_NUMERICO) {
      return `La cantidad de hembras no puede superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_ENTERO.test(valor)) {
      return "La cantidad de hembras debe ser un numero entero.";
    }
  }
  if (fn_talla !== undefined && fn_talla !== null && fn_talla !== "") {
    const valor = String(fn_talla);
    if (valor.length > MAX_NUMERICO) {
      return `La talla no puede superar los ${MAX_NUMERICO} caracteres.`;
    }
    if (!REGEX_DECIMAL.test(valor)) {
      return "La talla debe ser un numero (puede incluir decimales).";
    }
  }
  if (fc_observacion && fc_observacion.length > MAX_OBSERVACION) {
    return `La observacion no puede superar los ${MAX_OBSERVACION} caracteres.`;
  }
  return null;
}

async function crearObservacionSiHay(tx, texto, usuarioId) {
  if (texto === undefined || texto === null || String(texto).trim() === "") return null;
  const obs = await tx.observacion.create({
    data: {
      observacion: String(texto).slice(0, 500),
      usuarioId: usuarioId ?? null,
    },
  });
  return obs.observacionId;
}

function calcularRatio(machos, hembras) {
  if (machos > 0 && hembras > 0) {
    const r = hembras / machos;
    return `1:${Math.round(r * 100) / 100}`;
  }
  return null;
}

class ReproductorController {
  static async getMovimientos(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);

      const movimientos = await prisma.trazaReproductor.findMany({
        where: {
          destino: { ubicacionId: ubicacion.ubicacionId },
        },
        include: {
          destino: { include: { instalacion: true } },
          origen: { include: { instalacion: true } },
          observacion: true,
        },
        orderBy: { movimientoId: "desc" },
      });
      res.json(movimientos.map(serializeTrazaReproductor));
    } catch (err) {
      console.error("Error trazabilidad:", err);
      res.status(500).json({ error: "Error al obtener trazabilidad" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);

      const reproductores = await prisma.reproductor.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { instalacion: true, ubicacion: true, observacion: true },
        orderBy: { reproductorId: "desc" },
      });

      const ahora = Date.now();
      const dia = 1000 * 60 * 60 * 24;
      const result = reproductores.map((r) => {
        const data = serializeReproductor(r);
        const fSiembra = r.fechaSiembra ? new Date(r.fechaSiembra) : null;
        data.dias_en_pila = fSiembra ? Math.floor((ahora - fSiembra.getTime()) / dia) : null;
        return data;
      });
      res.json(result);
    } catch (err) {
      console.error("Error reproductores:", err);
      res.status(500).json({ error: "Error al obtener reproductores" });
    }
  }

  static async getInstalaciones(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const instalaciones = await prisma.instalacion.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { ubicacion: true },
        orderBy: { nombreInstalacion: "asc" },
        select: {
          instalacionId: true,
          nombreInstalacion: true,
          ubicacion: { select: { nombre: true } },
        },
      });
      res.json(
        instalaciones.map((i) => ({
          fi_instalacion_id: i.instalacionId,
          nombre_instalacion: i.nombreInstalacion,
          fc_granja: i.ubicacion?.nombre ?? null,
        }))
      );
    } catch (err) {
      console.error("Error instalaciones:", err);
      res.status(500).json({ error: "Error obteniendo instalaciones" });
    }
  }

  static async create(req, res) {
    try {
      const origenTexto = pick(req.body, "origen_texto");
      if (!origenTexto || String(origenTexto).trim() === "") {
        return res.status(400).json({ error: "Debe especificar el origen del reproductor" });
      }

      const error = validarCamposReproductor(req.body);
      if (error) return res.status(400).json({ error });

      const instalacionId = toInt(pick(req.body, "fi_instalacion_id", "instalacion_id"));
      if (!instalacionId) {
        return res.status(400).json({ error: "fi_instalacion_id es obligatorio" });
      }

      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");
      const ubicacion = await resolverOCrearUbicacion(granjaInput);
      if (!ubicacion) {
        return res.status(400).json({ error: "granja/ubicacion invalida" });
      }

      const machos = toInt(req.body.fn_machos, 0) ?? 0;
      const hembras = toInt(req.body.fn_hembras, 0) ?? 0;
      const cantidad = machos + hembras;
      const ratio = calcularRatio(machos, hembras);
      const usuarioId = req.user.usuario_id;
      const observacionTexto = pick(req.body, "fc_observacion", "observacion");

      const creado = await prisma.$transaction(async (tx) => {
        const obsId = await crearObservacionSiHay(tx, observacionTexto, usuarioId);
        const reproductor = await tx.reproductor.create({
          data: {
            instalacionId,
            machos,
            hembras,
            cantidad,
            talla: toDecimal(req.body.fn_talla),
            ratio,
            linea: pick(req.body, "fc_linea") ?? null,
            familia: pick(req.body, "fc_familia") ?? null,
            fechaSiembra: toDateOrNull(pick(req.body, "fd_fecha_siembra", "fecha_siembra")),
            fechaBiometria: toDateOrNull(pick(req.body, "fd_fecha_biometria", "fecha_biometria")),
            ubicacionId: ubicacion.ubicacionId,
            usuarioId,
            observacionId: obsId,
          },
          include: { instalacion: true, ubicacion: true, observacion: true },
        });

        await tx.trazaReproductor.create({
          data: {
            reproOrigen: null,
            origenTexto: String(origenTexto),
            reproDestino: reproductor.reproductorId,
            cantidadTrasladada: cantidad,
            fechaMovimiento: new Date(),
            usuarioId,
            observacionId: obsId,
          },
        });

        return reproductor;
      });

      res.status(201).json({
        success: true,
        mensaje: "Reproductor y trazabilidad registrados correctamente",
        data: serializeReproductor(creado),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un reproductor con esos datos unicos" });
      }
      console.error("Error registrar reproductor:", err);
      res.status(500).json({ error: "Error al registrar reproductor", detalle: err.message });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const error = validarCamposReproductor(req.body);
      if (error) return res.status(400).json({ error });

      const updateData = {};
      const machos = toInt(req.body.fn_machos, null);
      const hembras = toInt(req.body.fn_hembras, null);
      if (machos !== null) updateData.machos = machos;
      if (hembras !== null) updateData.hembras = hembras;

      const totalParaTraza =
        (machos ?? 0) + (hembras ?? 0);
      if (machos !== null || hembras !== null) {
        const actual = await prisma.reproductor.findUnique({ where: { reproductorId: id } });
        if (!actual) return res.status(404).json({ error: "Reproductor no encontrado" });
        const finalMachos = machos ?? actual.machos;
        const finalHembras = hembras ?? actual.hembras;
        updateData.cantidad = finalMachos + finalHembras;
        updateData.ratio = calcularRatio(finalMachos, finalHembras);
      }

      const instalacionId = toInt(pick(req.body, "fi_instalacion_id", "instalacion_id"));
      if (instalacionId !== null) updateData.instalacionId = instalacionId;

      if (req.body.fn_talla !== undefined) updateData.talla = toDecimal(req.body.fn_talla);
      if (req.body.fc_linea !== undefined) updateData.linea = req.body.fc_linea ?? null;
      if (req.body.fc_familia !== undefined) updateData.familia = req.body.fc_familia ?? null;

      const fSiembra = toDateOrNull(pick(req.body, "fd_fecha_siembra", "fecha_siembra"));
      if (fSiembra) updateData.fechaSiembra = fSiembra;
      const fBio = toDateOrNull(pick(req.body, "fd_fecha_biometria", "fecha_biometria"));
      if (fBio) updateData.fechaBiometria = fBio;

      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");
      if (granjaInput !== undefined) {
        const ubicacion = await resolverOCrearUbicacion(granjaInput);
        if (!ubicacion) return res.status(400).json({ error: "granja/ubicacion invalida" });
        updateData.ubicacionId = ubicacion.ubicacionId;
      }

      const observacionTexto = pick(req.body, "fc_observacion", "observacion");
      const usuarioId = req.user.usuario_id;

      const actualizado = await prisma.$transaction(async (tx) => {
        if (observacionTexto !== undefined) {
          const obsId = await crearObservacionSiHay(tx, observacionTexto, usuarioId);
          if (obsId) updateData.observacionId = obsId;
        }
        const repro = await tx.reproductor.update({
          where: { reproductorId: id },
          data: updateData,
          include: { instalacion: true, ubicacion: true, observacion: true },
        });

        await tx.trazaReproductor.create({
          data: {
            reproOrigen: null,
            origenTexto: pick(req.body, "origen_texto") ?? null,
            reproDestino: id,
            cantidadTrasladada: totalParaTraza || repro.cantidad || 0,
            fechaMovimiento: new Date(),
            usuarioId,
            observacionId: updateData.observacionId ?? null,
          },
        });

        return repro;
      });

      res.json({
        success: true,
        mensaje: "Reproductor actualizado y trazabilidad registrada",
        data: serializeReproductor(actualizado),
      });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Reproductor no encontrado" });
      console.error("Error actualizar reproductor:", err);
      res.status(500).json({ error: "Error al actualizar reproductor", detalle: err.message });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.$transaction(async (tx) => {
        await tx.trazaReproductor.deleteMany({
          where: {
            OR: [{ reproOrigen: id }, { reproDestino: id }],
          },
        });
        await tx.reproductor.delete({ where: { reproductorId: id } });
      });
      res.json({ success: true, mensaje: "Reproductor eliminado" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Reproductor no encontrado" });
      if (err.code === "P2003") {
        return res.status(409).json({
          error: "No se puede eliminar: el reproductor tiene registros relacionados.",
        });
      }
      console.error("Error eliminar:", err);
      res.status(500).json({ error: "Error al eliminar reproductor" });
    }
  }
}

export default ReproductorController;
