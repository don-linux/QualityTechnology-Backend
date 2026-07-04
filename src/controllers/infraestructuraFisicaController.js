import prisma from "../prisma.js";
import { serializeObservacionHistorial, serializeInfraestructuraFisica } from "../utils/serializers.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import {
  infraestructuraFisicaWhereUbicacionFromRequest,
  primerUbicacionIdValido,
  resolverUbicacionFlexible,
} from "../utils/granjaUbicacion.js";
import { validateEstadoConservacion } from "../constants/estadosConservacionInfraestructuraFisica.js";

const IF_TIPOS_VALIDOS = ["alevinaje", "reproductores", "engorda", "incubacion"];

/** Normaliza `?tipo=Alevinaje` / `Engorda` hacia enums Prisma (minúsculas). */
function normalizarTipoInfraestructuraFisicaQuery(raw) {
  if (typeof raw !== "string") return "";
  const t = raw
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return IF_TIPOS_VALIDOS.includes(t) ? t : "";
}

// El schema actual rediseno completamente el modelo InfraestructuraFisica: ahora representa
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
function respondInfraestructuraFisicaMutationErr(res, ctx, err, userMessage, statusFallback = 500) {
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
        "Datos invalidos para el modelo InfraestructuraFisica (revisar tipo, estado y valores numericos).",
      ...dev,
    });
  }
  return res.status(statusFallback).json({ error: userMessage, ...dev });
}

const infraestructuraFisicaInclude = {
  ubicacion: true,
  tipoInfraestructuraFisica: true,
  reproductores: {
    select: {
      id: true,
      infraestructura_fisica_id: true,
      machos: true,
      hembras: true,
      cantidad_total: true,
      cantidad_alimento: true,
    },
  },
  engorda: {
    select: {
      id: true,
      infraestructura_fisica_id: true,
      cantidad_total: true,
      cantidad_alimento: true,
    },
  },
  alevinaje: {
    select: {
      id: true,
      infraestructura_fisica_id: true,
      cantidad_total: true,
    },
  },
  eficiencia_reproductiva: {
    select: {
      id: true,
      infraestructura_fisica_id: true,
      lote: true,
      huevos_ml: true,
      fecha_ingreso: true,
      dias_en_infraestructura_fisica: true,
      fecha_egreso: true,
    },
  },
  observaciones: {
    orderBy: { created_at: "desc" },
    take: 1,
    select: { comentario: true, proceso: true, created_at: true },
  },
};

class InfraestructuraFisicaController {
  static async getAll(req, res) {
    try {
      const tipoFiltrado = normalizarTipoInfraestructuraFisicaQuery(req.query?.tipo);
      const where = {};
      let ubicFiltro = infraestructuraFisicaWhereUbicacionFromRequest(req);
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

      const infraestructuraFisica = await prisma.infraestructuraFisica.findMany({
        where,
        include: infraestructuraFisicaInclude,
        orderBy: { id: "asc" },
      });
      res.json(infraestructuraFisica.map(serializeInfraestructuraFisica));
    } catch (err) {
      console.error("Error al obtener infraestructura física:", err);
      res.status(500).json({ error: "Error al obtener infraestructura física" });
    }
  }

  static async getById(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });
    try {
      const infraestructuraFisica = await prisma.infraestructuraFisica.findUnique({
        where: { id },
        include: infraestructuraFisicaInclude,
      });
      if (!infraestructuraFisica) return res.status(404).json({ error: "Infraestructura física no encontrada" });
      res.json(serializeInfraestructuraFisica(infraestructuraFisica));
    } catch (err) {
      console.error("Error al obtener infraestructura física:", err);
      res.status(500).json({ error: "Error al obtener infraestructura física" });
    }
  }

  /** Historial completo de `observacion` asociadas a una infraestructuraFisica (directas y vía bitácoras/biometría). */
  static async getObservacionesHistorial(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const whereInfraestructuraFisica = { id };
      const ubicClause = infraestructuraFisicaWhereUbicacionFromRequest(req);
      if (ubicClause) Object.assign(whereInfraestructuraFisica, ubicClause);

      const infraestructuraFisica = await prisma.infraestructuraFisica.findFirst({
        where: whereInfraestructuraFisica,
        select: { id: true, tipo: true },
      });
      if (!infraestructuraFisica) return res.status(404).json({ error: "Infraestructura física no encontrada" });

      const rawProcesos = pick(req.query, "proceso", "procesos");
      const procesosFiltro = rawProcesos
        ? String(rawProcesos)
            .split(",")
            .map((p) => p.trim().toLowerCase())
            .filter(Boolean)
        : null;

      const vinculoInfraestructuraFisica = {
        OR: [
          { infraestructura_fisica_id: id },
          { limpiezaInstalaciones: { some: { infraestructuraFisicaId: id } } },
          { inventarioAlevines: { some: { infraestructura_fisica_id: id } } },
          { biometria: { is: { infraestructura_fisica_id: id } } },
          { parametrosFisicoQuimicos: { some: { infraestructuraFisicaId: id } } },
          { medicamentos: { some: { infraestructuraFisicaId: id } } },
        ],
      };

      const whereObs = procesosFiltro?.length
        ? { AND: [vinculoInfraestructuraFisica, { proceso: { in: procesosFiltro } }] }
        : vinculoInfraestructuraFisica;

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
      console.error("GET /infraestructura-fisica/:id/observaciones Error:", err);
      res.status(500).json({ error: "Error al obtener historial de observaciones" });
    }
  }

  static async create(req, res) {
    try {
      const nombre = pick(req.body, "nombre");
      let ubicacionId = toInt(pick(req.body, "ubicacion_id", "ubicacionId"));
      const granjaInput = pick(req.body, "granja", "ubicacion");
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
      const estadoConservacionRaw = pick(
        req.body,
        "estado_conservacion",
        "estadoConservacion"
      );
      const tipoInfraestructuraFisicaId = toInt(
        pick(req.body, "tipo_infraestructura_fisica_id", "tipoInfraestructuraFisicaId"),
        null
      );

      if (!nombre || !ubicacionId || largo === null || ancho === null || alto === null) {
        return res.status(400).json({
          error:
            "nombre, granja (o ubicacion_id), largo, ancho y alto son obligatorios",
        });
      }
      if (!material) return res.status(400).json({ error: "material es obligatorio" });
      if (!tipo) return res.status(400).json({ error: "tipo es obligatorio (alevinaje|reproductores|engorda|incubacion)" });

      const estadoConservacionCheck = validateEstadoConservacion(estadoConservacionRaw, {
        required: true,
      });
      if (!estadoConservacionCheck.ok) {
        return res.status(400).json({ error: estadoConservacionCheck.error });
      }

      const creada = await prisma.infraestructuraFisica.create({
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
          estadoConservacion: estadoConservacionCheck.value,
          ...(tipoInfraestructuraFisicaId != null ? { tipoInfraestructuraFisicaId } : {}),
        },
        include: infraestructuraFisicaInclude,
      });

      res.status(201).json({
        message: "Infraestructura física registrada correctamente.",
        data: serializeInfraestructuraFisica(creada),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una infraestructura física con ese nombre en esa ubicacion" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({
          error:
            "ubicacion_id o tipo_infraestructura_fisica_id no existe en catalogos, o alguna relacion requerida es invalida. Verifique los ids o use `granja` para resolver/crear la sede.",
          ...devErrPayload(err),
        });
      }
      return respondInfraestructuraFisicaMutationErr(res, "Error al registrar infraestructura física:", err, "Error al registrar infraestructura física");
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
      const granjaInputUpd = pick(req.body, "granja", "ubicacion");
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
        req.body.estado_conservacion !== undefined ||
        req.body.estadoConservacion !== undefined
      ) {
        const estadoConservacionCheck = validateEstadoConservacion(
          pick(req.body, "estado_conservacion", "estadoConservacion"),
          { required: true }
        );
        if (!estadoConservacionCheck.ok) {
          return res.status(400).json({ error: estadoConservacionCheck.error });
        }
        updateData.estadoConservacion = estadoConservacionCheck.value;
      }

      if (
        req.body.tipo_infraestructura_fisica_id !== undefined ||
        req.body.tipoInfraestructuraFisicaId !== undefined
      ) {
        updateData.tipoInfraestructuraFisicaId = toInt(
          pick(req.body, "tipo_infraestructura_fisica_id", "tipoInfraestructuraFisicaId"),
          null
        );
      }

      if (updateData.largo !== undefined || updateData.ancho !== undefined || updateData.alto !== undefined) {
        const actual = await prisma.infraestructuraFisica.findUnique({ where: { id } });
        if (!actual) return res.status(404).json({ error: "Infraestructura física no encontrada" });
        updateData.metros_cubicos = calcMetrosCubicos(
          updateData.largo ?? actual.largo,
          updateData.ancho ?? actual.ancho,
          updateData.alto ?? actual.alto
        );
      }

      const actualizada = await prisma.infraestructuraFisica.update({
        where: { id },
        data: updateData,
        include: infraestructuraFisicaInclude,
      });
      res.json({
        success: true,
        message: "Infraestructura física actualizada correctamente.",
        data: serializeInfraestructuraFisica(actualizada),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Infraestructura física no encontrada" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una infraestructura física con ese nombre en esa ubicacion" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({
          error:
            "ubicacion_id o tipo_infraestructura_fisica_id no existe en catalogos, o la relacion es invalida.",
          ...devErrPayload(err),
        });
      }
      return respondInfraestructuraFisicaMutationErr(res, "Error al actualizar infraestructura física:", err, "Error al actualizar infraestructura física");
    }
  }

}

export default InfraestructuraFisicaController;
