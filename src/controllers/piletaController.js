import prisma from "../prisma.js";
import { serializePileta } from "../utils/serializers.js";
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

const piletaInclude = {
  ubicacion: true,
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
       * encuentra fila — mismo criterio que instalaciones/`ubicacion_id` explícito.
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
      console.error("Error al registrar pileta:", err);
      res.status(500).json({ error: "Error al registrar pileta" });
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
      console.error("Error al actualizar pileta:", err);
      res.status(500).json({ error: "Error al actualizar pileta" });
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
      console.error("Error al eliminar pileta:", err);
      res.status(500).json({ error: "Error al eliminar pileta" });
    }
  }

  // ---------------------------------------------------------------------------
  // Endpoints heredados que requieren rediseno sobre los nuevos modelos
  // (alevinaje, siembra, engorda, reproductores, Biometria). Se mantienen
  // las rutas existentes devolviendo 501 hasta que se reimplementen.
  // ---------------------------------------------------------------------------
  static async getOrigen(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre el nuevo modelo de inventario.",
    });
  }
  static async getDestino(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre el nuevo modelo de inventario.",
    });
  }
  static async getLotes(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre el nuevo modelo de lotes.",
    });
  }
  static async getInventario(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre los nuevos modelos siembra/alevinaje.",
    });
  }
  static async getLotePorInst(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre el nuevo modelo de lotes.",
    });
  }
  static async siembra(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre el nuevo modelo siembra.",
    });
  }
  static async registrarMovimiento(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre los nuevos modelos siembra/alevinaje.",
    });
  }
  static async getMovimientos(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre los nuevos modelos siembra/alevinaje.",
    });
  }
  static async getMovimientosFiltro(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre los nuevos modelos siembra/alevinaje.",
    });
  }
  static async eliminarMovimientos(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno sobre los nuevos modelos siembra/alevinaje.",
    });
  }
}

export default PiletaController;
