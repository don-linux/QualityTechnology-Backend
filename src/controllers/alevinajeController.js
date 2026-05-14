import prisma from "../prisma.js";
import { serializeAlevinaje } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import {
  piletaWhereUbicacionFromRequest,
  ubicacionNombreWhereFromGranja,
  primerUbicacionIdValido,
  resolverUbicacionFlexible,
} from "../utils/granjaUbicacion.js";

/**
 * Misma línea que `GET /piletas`: si viene `ubicacion_id` en query gana sobre el texto de granja en path.
 */
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

// CRUD del modelo `alevinaje` sobre piletas tipo `alevinaje`.
// Desde control reproductivo también acepta pileta `reproductores` ocupada:
// al crear registro nuevo, la pileta pasa a `alevinaje` dentro de la transacción.
// La observación se persiste con `pileta_id` y `proceso = 'alevinaje'` para
// que aparezca como "última observación" al consultar la pileta.

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

function calcMortalidadPorcentaje(mortalidad, iniciales) {
  const m = Number(mortalidad) || 0;
  const i = Number(iniciales) || 0;
  if (i <= 0) return 0;
  return Number(((m * 100) / i).toFixed(2));
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
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
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
      const piletaId = toInt(pick(req.body, "pileta_id", "fi_pileta_id", "fc_pileta_id"));
      const lote = pick(req.body, "lote", "no_lote");
      const alevinesIniciales = toInt(
        pick(
          req.body,
          "alevines_iniciales",
          "fn_alevines_iniciales",
          "cantidad",
          "fn_cantidad",
          "alevines_inicial",
        ),
        0,
      ) ?? 0;

      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id es obligatorio" });
      }
      if (!lote) {
        return res.status(400).json({ error: "lote es obligatorio" });
      }
      if (alevinesIniciales <= 0) {
        return res
          .status(400)
          .json({ error: "alevines_iniciales debe ser mayor a 0" });
      }

      const pileta = await prisma.pileta.findUnique({
        where: { id: piletaId },
        select: { id: true, tipo: true, nombre: true, estado: true },
      });
      if (!pileta) {
        return res.status(400).json({ error: "Pileta no existe" });
      }

      let desdeReproductores = false;
      if (pileta.tipo === "reproductores") {
        if (pileta.estado !== "ocupada") {
          return res.status(400).json({
            error: "Para registrar desde reproductores la pileta debe estar ocupada",
          });
        }
        desdeReproductores = true;
      } else if (pileta.tipo !== "alevinaje") {
        return res.status(400).json({
          error: `La pileta '${pileta.nombre}' no admite registro de alevinaje (tipo ${pileta.tipo})`,
        });
      }

      const familiaGuardarRaw = pick(req.body, "familia", "fc_familia");
      const familiaGuardar = familiaGuardarRaw ? String(familiaGuardarRaw).slice(0, 60) : null;

      const mortalidad = toInt(pick(req.body, "mortalidad", "fn_mortalidad"), 0) ?? 0;
      const mortalidadPorc = calcMortalidadPorcentaje(mortalidad, alevinesIniciales);
      const usuarioId = req.user.usuario_id;
      const obsTexto = pick(req.body, "observacion", "fc_observacion", "observaciones");
      const siembraOrigenId = toInt(pick(req.body, "siembra_origen_id"));
      const biometriaId = toInt(pick(req.body, "biometria_id"));

      const creado = await prisma.$transaction(async (tx) => {
        if (desdeReproductores) {
          await tx.pileta.update({
            where: { id: piletaId },
            data: { tipo: "alevinaje" },
          });
        }

        await assertSiembraOrigenValidaParaPileta(tx, siembraOrigenId ?? null, piletaId);

        const obsId = await crearObservacionSiHay(tx, obsTexto, usuarioId, {
          piletaId,
          proceso: "alevinaje",
        });

        return tx.alevinaje.create({
          data: {
            pileta_id: piletaId,
            fecha: toDateOrNull(pick(req.body, "fecha", "fd_fecha")) ?? new Date(),
            lote: String(lote).slice(0, 60),
            familia: familiaGuardar,
            huevos_ml: toDecimal(pick(req.body, "huevos_ml", "fn_huevos_ml")),
            ovadas: toInt(pick(req.body, "ovadas", "fn_ovadas"), 0) ?? 0,
            alevines_iniciales: alevinesIniciales,
            mortalidad,
            mortalidad_porcentaje: mortalidadPorc,
            observacion_id: obsId,
            biometria_id: biometriaId ?? null,
            siembra_origen_id: siembraOrigenId ?? null,
            usuario_id: usuarioId,
          },
          include: alevinajeInclude,
        });
      });

      res.status(201).json({
        mensaje: desdeReproductores
          ? "Registro creado. La pileta pasó a etapa alevinaje."
          : "Registro de alevinaje creado",
        data: serializeAlevinaje(creado),
      });
    } catch (err) {
      if (err.code === "BAD_SIEMBRA") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "SIEMBRA_DESTINO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Ya existe un registro de alevinaje con ese lote en la pileta" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta o referencias inválidas" });
      }
      console.error("POST /alevinaje Error:", err);
      res
        .status(500)
        .json({ error: "Error creando registro de alevinaje", detalle: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const prev = await prisma.alevinaje.findUnique({
        where: { id },
        select: {
          pileta_id: true,
          alevines_iniciales: true,
          mortalidad: true,
          siembra_origen_id: true,
        },
      });
      if (!prev) return res.status(404).json({ error: "Registro no encontrado" });

      const updateData = {};
      const piletaId = toInt(pick(req.body, "pileta_id", "fi_pileta_id", "fc_pileta_id"));
      if (piletaId !== null) updateData.pileta_id = piletaId;

      const piletaFinal = piletaId ?? prev.pileta_id;

      if (req.body.fecha !== undefined || req.body.fd_fecha !== undefined) {
        updateData.fecha = toDateOrNull(pick(req.body, "fecha", "fd_fecha"));
      }
      const loteIn = pick(req.body, "lote", "no_lote");
      if (loteIn !== undefined) updateData.lote = String(loteIn).slice(0, 60);
      if (req.body.familia !== undefined || req.body.fc_familia !== undefined) {
        const f = pick(req.body, "familia", "fc_familia");
        updateData.familia = f ? String(f).slice(0, 60) : null;
      }
      if (req.body.huevos_ml !== undefined || req.body.fn_huevos_ml !== undefined) {
        updateData.huevos_ml = toDecimal(pick(req.body, "huevos_ml", "fn_huevos_ml"));
      }
      if (req.body.ovadas !== undefined || req.body.fn_ovadas !== undefined) {
        updateData.ovadas = toInt(pick(req.body, "ovadas", "fn_ovadas"), 0) ?? 0;
      }

      const inicialesIn = pick(
        req.body,
        "alevines_iniciales",
        "fn_alevines_iniciales",
        "cantidad",
        "fn_cantidad",
        "alevines_inicial",
      );
      if (inicialesIn !== undefined) {
        const v = toInt(inicialesIn, 0) ?? 0;
        if (v <= 0) {
          return res
            .status(400)
            .json({ error: "alevines_iniciales debe ser mayor a 0" });
        }
        updateData.alevines_iniciales = v;
      }

      if (req.body.mortalidad !== undefined || req.body.fn_mortalidad !== undefined) {
        updateData.mortalidad = toInt(pick(req.body, "mortalidad", "fn_mortalidad"), 0) ?? 0;
      }

      const finalIniciales =
        updateData.alevines_iniciales ?? prev.alevines_iniciales;
      const finalMortalidad = updateData.mortalidad ?? prev.mortalidad;
      if (
        updateData.alevines_iniciales !== undefined ||
        updateData.mortalidad !== undefined
      ) {
        updateData.mortalidad_porcentaje = calcMortalidadPorcentaje(
          finalMortalidad,
          finalIniciales,
        );
      }

      let siembraOrigenFuturo = prev.siembra_origen_id;
      if (req.body.siembra_origen_id !== undefined) {
        updateData.siembra_origen_id = toInt(req.body.siembra_origen_id);
        siembraOrigenFuturo = updateData.siembra_origen_id;
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
        await assertSiembraOrigenValidaParaPileta(tx, siembraOrigenFuturo ?? null, piletaFinal);

        if (obsTextoExplicito) {
          const obsId = await crearObservacionSiHay(
            tx,
            pick(req.body, "observacion", "fc_observacion", "observaciones"),
            usuarioId,
            { piletaId: piletaFinal, proceso: "alevinaje" },
          );
          if (obsId) updateData.observacion_id = obsId;
        }

        return tx.alevinaje.update({
          where: { id },
          data: updateData,
          include: alevinajeInclude,
        });
      });

      res.json({
        mensaje: "Registro actualizado",
        data: serializeAlevinaje(actualizado),
      });
    } catch (err) {
      if (err.code === "BAD_SIEMBRA" || err.code === "SIEMBRA_DESTINO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2025") return res.status(404).json({ error: "Registro no encontrado" });
      if (err.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Ya existe otro registro con ese lote en la pileta" });
      }
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

  /**
   * Piletas etapa `reproductores`, estado ocupada — control reproductivo (alta → `POST /alevinaje`).
   * Respuesta incluye aliases `fi_instalacion_id` / `nombre_instalacion` por compatibilidad con cliente legacy.
   */
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

  /**
   * Familia ligada al circuito reproductivo: prioriza `reproductor` por `pileta_id`;
   * si no hay, último `alevinaje` en esa pileta con `familia` no vacía.
   */
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

      const alevFilas = await prisma.alevinaje.findMany({
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
