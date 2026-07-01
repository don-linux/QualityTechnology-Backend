import { randomUUID } from "crypto";
import prisma from "../prisma.js";
import { resolverOCrearUbicacion, resolverUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeFlujoInsumo } from "../utils/serializers.js";
import { generarCodigoFlujoInsumo } from "../utils/flujoInsumoCodigo.js";

const inc = {
  ubicacion: true,
  ubicacionSalida: true,
  ubicacionEntrada: true,
  insumo: true,
  observacion: true,
};

const TIPOS = ["ingreso", "egreso", "traspaso"];

async function filtroUbicacionFlujoInsumo(ubicacionQuery) {
  if (!ubicacionQuery || !String(ubicacionQuery).trim()) return {};
  const u = await resolverUbicacion(ubicacionQuery);
  if (u) return { ubicacionId: u.ubicacionId };
  return { ubicacion: { nombre: String(ubicacionQuery).trim() } };
}

function parseTipoMovimiento(value) {
  const t = String(value ?? "").trim().toLowerCase();
  return TIPOS.includes(t) ? t : null;
}

function parseInsumoId(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function normalizeStr(value, max) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

class FlujoInsumoController {
  static async getEmpleados(req, res) {
    try {
      const empleados = await listarEmpleadosActivosBitacora();
      res.json(empleados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const { ubicacion } = req.query;
      const where = await filtroUbicacionFlujoInsumo(ubicacion);
      const rows = await prisma.flujoInsumo.findMany({
        where,
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeFlujoInsumo));
    } catch (err) {
      console.error("Error GET /flujo_insumos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const usuarioId = req.user?.usuario_id;
      if (!usuarioId) {
        return res.status(401).json({ error: "Token inválido o sin usuario asociado" });
      }

      const tipo = parseTipoMovimiento(req.body.tipo_movimiento);
      if (!tipo) {
        return res.status(400).json({ error: "Tipo de movimiento inválido (ingreso, egreso o traspaso)." });
      }

      const { fecha, observaciones } = req.body;
      if (observaciones && String(observaciones).length > 500) {
        return res.status(400).json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }

      const insumoId = parseInsumoId(req.body.insumo_id ?? req.body.producto_id);
      const responsable = normalizeStr(req.body.responsable, 100);
      const fechaRegistro = fecha ? new Date(fecha) : new Date();

      if (tipo === "traspaso") {
        return await FlujoInsumoController.crearTraspaso(req, res, {
          usuarioId,
          fecha,
          fechaRegistro,
          insumoId,
          responsable,
          observaciones,
        });
      }

      // Ingreso / Egreso: una sola fila
      const ubicacionRaw = req.body.ubicacion ?? req.body.unidad_negocio;
      let u = null;
      if (ubicacionRaw != null && String(ubicacionRaw).trim()) {
        u = await resolverOCrearUbicacion(ubicacionRaw);
      }
      if (!u?.ubicacionId) {
        return res.status(400).json({ error: "La unidad de negocio es obligatoria." });
      }
      const destino = normalizeStr(req.body.destino, 150);

      let codigoCreado = null;
      for (let intento = 0; intento < 5; intento++) {
        const codigo = await generarCodigoFlujoInsumo(prisma, {
          tipoMovimiento: tipo,
          ubicacionNombre: u.nombre,
          fecha: fecha ?? fechaRegistro,
        });
        try {
          await prisma.$transaction(async (tx) => {
            const observacionId = await guardarObservacion(tx, {
              observacionIdExistente: null,
              texto: observaciones ?? null,
              responsable: null,
              usuarioId,
            });
            await tx.flujoInsumo.create({
              data: {
                codigo,
                tipoMovimiento: tipo,
                ubicacionId: u.ubicacionId,
                fecha: fechaRegistro,
                insumoId,
                destino,
                responsable,
                usuarioId,
                observacionId,
              },
            });
          });
          codigoCreado = codigo;
          break;
        } catch (e) {
          if (e.code === "P2002" && intento < 4) continue;
          throw e;
        }
      }

      res.json({ message: "Registro agregado correctamente", codigo: codigoCreado });
    } catch (err) {
      console.error("Error POST /flujo_insumos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // Traspaso: genera dos filas enlazadas (salida = egreso, entrada = ingreso) con
  // el mismo folio y traspaso_grupo_id. El folio se basa en la UdN de salida.
  static async crearTraspaso(req, res, ctx) {
    const { usuarioId, fecha, fechaRegistro, insumoId, responsable, observaciones } = ctx;

    const salidaRaw = req.body.ubicacion_salida ?? req.body.unidad_negocio_salida;
    const entradaRaw = req.body.ubicacion_entrada ?? req.body.unidad_negocio_entrada;

    let salida = null;
    let entrada = null;
    if (salidaRaw != null && String(salidaRaw).trim()) {
      salida = await resolverOCrearUbicacion(salidaRaw);
    }
    if (entradaRaw != null && String(entradaRaw).trim()) {
      entrada = await resolverOCrearUbicacion(entradaRaw);
    }

    if (!salida?.ubicacionId || !entrada?.ubicacionId) {
      return res.status(400).json({ error: "Un traspaso requiere unidad de negocio de salida y de entrada." });
    }
    if (salida.ubicacionId === entrada.ubicacionId) {
      return res.status(400).json({ error: "La unidad de negocio de salida y de entrada deben ser distintas." });
    }

    const grupoId = randomUUID();
    const codigo = await generarCodigoFlujoInsumo(prisma, {
      tipoMovimiento: "traspaso",
      ubicacionNombre: salida.nombre,
      fecha: fecha ?? fechaRegistro,
    });

    await prisma.$transaction(async (tx) => {
      const observacionId = await guardarObservacion(tx, {
        observacionIdExistente: null,
        texto: observaciones ?? null,
        responsable: null,
        usuarioId,
      });

      const comun = {
        codigo,
        tipoMovimiento: "traspaso",
        fecha: fechaRegistro,
        insumoId,
        destino: entrada.nombre,
        responsable,
        ubicacionSalidaId: salida.ubicacionId,
        ubicacionEntradaId: entrada.ubicacionId,
        traspasoGrupoId: grupoId,
        usuarioId,
        observacionId,
      };

      // Fila en la UdN de salida (egreso)
      await tx.flujoInsumo.create({
        data: { ...comun, ubicacionId: salida.ubicacionId, traspasoSentido: "salida" },
      });
      // Fila en la UdN de entrada (ingreso)
      await tx.flujoInsumo.create({
        data: { ...comun, ubicacionId: entrada.ubicacionId, traspasoSentido: "entrada" },
      });
    });

    return res.json({ message: "Traspaso registrado correctamente", codigo });
  }

  static async update(req, res) {
    try {
      const id = Number(req.params.id);
      const existing = await prisma.flujoInsumo.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;
      const { fecha, observaciones } = req.body;
      if (observaciones && String(observaciones).length > 500) {
        return res.status(400).json({ error: "Las observaciones no pueden superar los 500 caracteres." });
      }

      const insumoId =
        req.body.insumo_id !== undefined || req.body.producto_id !== undefined
          ? parseInsumoId(req.body.insumo_id ?? req.body.producto_id)
          : existing.insumoId;
      const responsable =
        req.body.responsable !== undefined ? normalizeStr(req.body.responsable, 100) : existing.responsable;
      const fechaVal = fecha ? new Date(fecha) : existing.fecha;
      const textoObs =
        observaciones !== undefined ? observaciones : (existing.observacion?.comentario ?? null);

      // Traspaso: propaga campos no estructurales a ambas filas del grupo.
      if (existing.tipoMovimiento === "traspaso" && existing.traspasoGrupoId) {
        await prisma.$transaction(async (tx) => {
          const observacionId = await guardarObservacion(tx, {
            observacionIdExistente: existing.observacionId,
            texto: textoObs,
            responsable: null,
            usuarioId,
          });
          await tx.flujoInsumo.updateMany({
            where: { traspasoGrupoId: existing.traspasoGrupoId },
            data: { insumoId, responsable, fecha: fechaVal, observacionId, usuarioId },
          });
        });
        return res.json({ message: "Registro actualizado correctamente" });
      }

      // Ingreso / Egreso: fila unica.
      let ubicacionId = existing.ubicacionId;
      const ubicacionRaw = req.body.ubicacion ?? req.body.unidad_negocio;
      if (ubicacionRaw !== undefined && ubicacionRaw != null && String(ubicacionRaw).trim()) {
        const u = await resolverOCrearUbicacion(ubicacionRaw);
        ubicacionId = u?.ubicacionId ?? ubicacionId;
      }
      const destino =
        req.body.destino !== undefined ? normalizeStr(req.body.destino, 150) : existing.destino;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto: textoObs,
          responsable: null,
          usuarioId,
        });
        await tx.flujoInsumo.update({
          where: { id },
          data: {
            ubicacionId,
            fecha: fechaVal,
            insumoId,
            destino,
            responsable,
            observacionId,
            usuarioId,
          },
        });
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error PUT /flujo_insumos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default FlujoInsumoController;
