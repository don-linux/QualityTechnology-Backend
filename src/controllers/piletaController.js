import prisma from "../prisma.js";
import { serializeObservacionHistorial, serializePileta } from "../utils/serializers.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import {
  piletaWhereUbicacionFromRequest,
  primerUbicacionIdValido,
  resolverUbicacionFlexible,
} from "../utils/granjaUbicacion.js";

const PIL_TIPOS_VALIDOS = ["alevinaje", "reproductores", "engorda"];

/** Normaliza `?tipo=Alevinaje` / `Engorda` hacia enums Prisma (minúsculas). */
function normalizarTipoPiletaQuery(raw) {
  if (typeof raw !== "string") return "";
  const t = raw
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return PIL_TIPOS_VALIDOS.includes(t) ? t : "";
}

// El schema actual rediseno completamente el modelo Pileta: ahora representa
// un contenedor fisico (dimensiones, material, estado, tipo) ligado a una
// ubicacion, NO un inventario con cantidad/talla/lote/fecha_siembra. Los
// conceptos de inventario, traslados y siembras se movieron a los modelos
// `alevinaje`, `siembra`, `engorda`, `reproductores`, `Biometria`, etc.
//
// Por eso este controller queda como CRUD basico de la entidad fisica, y los
// endpoints de inventario/movimientos/siembras antiguos devuelven 501 hasta
// que se rediseñen sobre los nuevos modelos.

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

function calcMetrosCubicos(largo, ancho, alto) {
  const l = Number(largo) || 0;
  const a = Number(ancho) || 0;
  const h = Number(alto) || 0;
  return Number((l * a * h).toFixed(3));
}

const MIGRATE_HINT =
  "La base de datos no coincide con el esquema Prisma del backend (falta tabla o columna). " +
  "En QualityTechnology-Backend ejecute: npx prisma migrate deploy";

function devErrPayload(err) {
  if (process.env.NODE_ENV === "production") return {};
  const out = { detail: String(err?.message ?? err) };
  if (err?.code != null) out.prismaCode = err.code;
  if (err?.name != null) out.errorName = err.name;
  return out;
}

/** Errores de mutación tras agotar códigos P2002/P2003/P2025 tratados aparte */
function respondPiletaMutationErr(res, ctx, err, userMessage, statusFallback = 500) {
  console.error(ctx, err);
  const dev = devErrPayload(err);
  if (err?.code === "P2021" || err?.code === "P2022") {
    return res.status(500).json({ error: MIGRATE_HINT, prismaCode: err.code, ...dev });
  }
  if (err?.name === "PrismaClientInitializationError") {
    return res.status(503).json({
      error:
        "No hay conexion a la base de datos. Compruebe que PostgreSQL esta en ejecucion y que DATABASE_URL usa el host y puerto donde escucha Postgres.",
      ...dev,
    });
  }
  if (err?.name === "PrismaClientValidationError") {
    return res.status(400).json({
      error:
        "Datos invalidos para el modelo Pileta (revisar tipo, estado y valores numericos).",
      ...dev,
    });
  }
  return res.status(statusFallback).json({ error: userMessage, ...dev });
}

const piletaInclude = {
  ubicacion: true,
  estadoConservacion: true,
  tipoInstancia: true,
  reproductores: {
    select: { machos: true, hembras: true },
  },
  engorda: {
    select: {
      id: true,
      pileta_id: true,
      cantidad_total: true,
      cantidad_alimento: true,
    },
  },
  alevinaje: {
    select: {
      id: true,
      pileta_id: true,
      cantidad_total: true,
      cantidad_alimento: true,
    },
  },
  observaciones: {
    orderBy: { created_at: "desc" },
    take: 1,
    select: { comentario: true, proceso: true, created_at: true },
  },
};

class PiletaController {
  static async getAll(req, res) {
    try {
      const tipoFiltrado = normalizarTipoPiletaQuery(req.query?.tipo);
      const where = {};
      let ubicFiltro = piletaWhereUbicacionFromRequest(req);
      const ubicIdQ = primerUbicacionIdValido(req.query?.ubicacion_id, req.query?.ubicacionId);
      const granjaQ =
        typeof req.query.granja === "string" ? req.query.granja.trim() : "";

      /*
       * Con solo `granja` (nombre corto de sede / unidad negocio) el WHERE anidado
       * `{ ubicacion: { nombre: ... } }` suele NO coincidir con el nombre canónico
       * del catálogo `ubicacion`. Preferimos FK cuando `resolverUbicacionFlexible`
       * encuentra fila — mismo criterio que `ubicacion_id` explícito en query.
       */
      if (!ubicIdQ && granjaQ) {
        const flex = await resolverUbicacionFlexible(granjaQ);
        if (flex?.ubicacionId != null) {
          ubicFiltro = { ubicacionId: flex.ubicacionId };
        }
      }

      if (ubicFiltro) Object.assign(where, ubicFiltro);
      if (tipoFiltrado) where.tipo = tipoFiltrado;

      const piletas = await prisma.pileta.findMany({
        where,
        include: piletaInclude,
        orderBy: { id: "asc" },
      });
      res.json(piletas.map(serializePileta));
    } catch (err) {
      console.error("Error al obtener piletas:", err);
      res.status(500).json({ error: "Error al obtener piletas" });
    }
  }

  static async getById(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    try {
      const pileta = await prisma.pileta.findUnique({
        where: { id },
        include: piletaInclude,
      });
      if (!pileta) return res.status(404).json({ error: "Pileta no encontrada" });
      res.json(serializePileta(pileta));
    } catch (err) {
      console.error("Error al obtener pileta:", err);
      res.status(500).json({ error: "Error al obtener pileta" });
    }
  }

  /** Historial completo de `observacion` asociadas a una pileta (directas y vía bitácoras/biometría). */
  static async getObservacionesHistorial(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const wherePileta = { id };
      const ubicClause = piletaWhereUbicacionFromRequest(req);
      if (ubicClause) Object.assign(wherePileta, ubicClause);

      const pileta = await prisma.pileta.findFirst({
        where: wherePileta,
        select: { id: true, tipo: true },
      });
      if (!pileta) return res.status(404).json({ error: "Pileta no encontrada" });

      const rawProcesos = pick(req.query, "proceso", "procesos");
      const procesosFiltro = rawProcesos
        ? String(rawProcesos)
            .split(",")
            .map((p) => p.trim().toLowerCase())
            .filter(Boolean)
        : null;

      const vinculoPileta = {
        OR: [
          { pileta_id: id },
          { alimentacion: { some: { pileta_id: id } } },
          { recambios: { some: { pileta_id: id } } },
          { inventarioAlevines: { some: { pileta_id: id } } },
          { biometria: { is: { pileta_id: id } } },
          { parametros: { some: { numero_estanque: id } } },
          { medicamentos: { some: { numero_estanque: id } } },
        ],
      };

      const whereObs = procesosFiltro?.length
        ? { AND: [vinculoPileta, { proceso: { in: procesosFiltro } }] }
        : vinculoPileta;

      const rows = await prisma.observacion.findMany({
        where: whereObs,
        orderBy: { created_at: "desc" },
        take: 500,
        select: {
          id: true,
          comentario: true,
          proceso: true,
          created_at: true,
          usuarios: {
            select: {
              nombre: true,
              rol: { select: { nombre: true } },
            },
          },
        },
      });

      const historial = rows
        .filter((o) => String(o.comentario ?? "").trim() !== "")
        .map(serializeObservacionHistorial);

      res.json(historial);
    } catch (err) {
      console.error("GET /piletas/:id/observaciones Error:", err);
      res.status(500).json({ error: "Error al obtener historial de observaciones" });
    }
  }

  static async create(req, res) {
    try {
      const nombre = pick(req.body, "nombre");
      let ubicacionId = toInt(pick(req.body, "ubicacion_id", "ubicacionId"));
      const granjaInput = pick(req.body, "granja", "fc_granja", "ubicacion");
      if (!ubicacionId && granjaInput) {
        const ubic = await resolverOCrearUbicacion(granjaInput);
        if (ubic) ubicacionId = ubic.ubicacionId;
      }
      const largo = toDecimal(pick(req.body, "largo"));
      const ancho = toDecimal(pick(req.body, "ancho"));
      const alto = toDecimal(pick(req.body, "alto", "altura"));
      const material = pick(req.body, "material");
      const tipo = pick(req.body, "tipo");
      const estado = pick(req.body, "estado") ?? "vacia";
      const estadoConservacionId = toInt(
        pick(req.body, "estado_conservacion_id", "estadoConservacionId"),
        null
      );
      const tipoInstanciaId = toInt(
        pick(req.body, "tipo_instancia", "tipo_instancia_id", "tipoInstanciaId"),
        null
      );

      if (!nombre || !ubicacionId || largo === null || ancho === null || alto === null) {
        return res.status(400).json({
          error:
            "nombre, granja (o ubicacion_id), largo, ancho y alto son obligatorios",
        });
      }
      if (!material) return res.status(400).json({ error: "material es obligatorio" });
      if (!tipo) return res.status(400).json({ error: "tipo es obligatorio (alevinaje|reproductores|engorda)" });

      const creada = await prisma.pileta.create({
        data: {
          nombre: String(nombre),
          ubicacionId,
          largo,
          ancho,
          alto,
          metros_cubicos: calcMetrosCubicos(largo, ancho, alto),
          material: String(material),
          tipo: String(tipo),
          estado: String(estado),
          ...(estadoConservacionId != null ? { estadoConservacionId } : {}),
          ...(tipoInstanciaId != null ? { tipoInstanciaId } : {}),
        },
        include: piletaInclude,
      });

      res.status(201).json({
        message: "Pileta registrada correctamente.",
        data: serializePileta(creada),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una pileta con ese nombre en esa ubicacion" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({
          error:
            "ubicacion_id, estado_conservacion_id o tipo_instancia no existe en catalogos, o alguna relacion requerida es invalida. Verifique los ids o use `granja` para resolver/crear la sede.",
          ...devErrPayload(err),
        });
      }
      return respondPiletaMutationErr(res, "Error al registrar pileta:", err, "Error al registrar pileta");
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const updateData = {};
      const nombre = pick(req.body, "nombre");
      if (nombre !== undefined) updateData.nombre = String(nombre);

      let ubicacionId = toInt(pick(req.body, "ubicacion_id", "ubicacionId"));
      const granjaInputUpd = pick(req.body, "granja", "fc_granja", "ubicacion");
      if (!ubicacionId && granjaInputUpd) {
        const ubic = await resolverOCrearUbicacion(granjaInputUpd);
        if (ubic) ubicacionId = ubic.ubicacionId;
      }
      if (ubicacionId !== null) updateData.ubicacionId = ubicacionId;

      const largoIn = req.body.largo;
      const anchoIn = req.body.ancho;
      const altoIn = req.body.alto ?? req.body.altura;

      if (largoIn !== undefined) updateData.largo = toDecimal(largoIn);
      if (anchoIn !== undefined) updateData.ancho = toDecimal(anchoIn);
      if (altoIn !== undefined) updateData.alto = toDecimal(altoIn);

      const material = pick(req.body, "material");
      if (material !== undefined) updateData.material = String(material);
      const tipo = pick(req.body, "tipo");
      if (tipo !== undefined) updateData.tipo = String(tipo);
      const estado = pick(req.body, "estado");
      if (estado !== undefined) updateData.estado = String(estado);

      if (
        req.body.estado_conservacion_id !== undefined ||
        req.body.estadoConservacionId !== undefined
      ) {
        updateData.estadoConservacionId = toInt(
          pick(req.body, "estado_conservacion_id", "estadoConservacionId"),
          null
        );
      }

      if (
        req.body.tipo_instancia !== undefined ||
        req.body.tipo_instancia_id !== undefined ||
        req.body.tipoInstanciaId !== undefined
      ) {
        updateData.tipoInstanciaId = toInt(
          pick(req.body, "tipo_instancia", "tipo_instancia_id", "tipoInstanciaId"),
          null
        );
      }

      if (updateData.largo !== undefined || updateData.ancho !== undefined || updateData.alto !== undefined) {
        const actual = await prisma.pileta.findUnique({ where: { id } });
        if (!actual) return res.status(404).json({ error: "Pileta no encontrada" });
        updateData.metros_cubicos = calcMetrosCubicos(
          updateData.largo ?? actual.largo,
          updateData.ancho ?? actual.ancho,
          updateData.alto ?? actual.alto
        );
      }

      const actualizada = await prisma.pileta.update({
        where: { id },
        data: updateData,
        include: piletaInclude,
      });
      res.json({
        success: true,
        message: "Pileta actualizada correctamente.",
        data: serializePileta(actualizada),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Pileta no encontrada" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una pileta con ese nombre en esa ubicacion" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({
          error:
            "ubicacion_id, estado_conservacion_id o tipo_instancia no existe en catalogos, o la relacion es invalida.",
          ...devErrPayload(err),
        });
      }
      return respondPiletaMutationErr(res, "Error al actualizar pileta:", err, "Error al actualizar pileta");
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.pileta.delete({ where: { id } });
      res.json({ success: true, message: "Pileta eliminada correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Pileta no encontrada" });
      }
      if (err.code === "P2003") {
        return res.status(409).json({
          error: "No se puede eliminar: la pileta tiene registros asociados (siembra, alevinaje, biometrias, etc.)",
        });
      }
      return respondPiletaMutationErr(res, "Error al eliminar pileta:", err, "Error al eliminar pileta");
    }
  }

}

export default PiletaController;
