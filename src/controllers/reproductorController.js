import prisma from "../prisma.js";
import { serializeReproductor } from "../utils/serializers.js";

// El schema actual reemplaza la relacion Reproductor->Instalacion (con
// ubicacion) por una relacion 1-1 Reproductor<->Pileta (la pileta tiene
// ubicacionId). Tampoco existe `trazaReproductor` ni fechas de siembra y
// biometria en el modelo: se reemplazaron por FKs siembra_id y biometria_id.
// Los endpoints de trazabilidad/instalaciones quedan como 501 hasta que se
// reimplementen contra `siembra` y `Biometria`.

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

function calcularRatio(machos, hembras) {
  if (machos > 0 && hembras > 0) {
    const r = hembras / machos;
    return `1:${Math.round(r * 100) / 100}`;
  }
  return null;
}

const reproductorInclude = {
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
};

class ReproductorController {
  static async getAll(req, res) {
    try {
      const reproductores = await prisma.reproductor.findMany({
        include: reproductorInclude,
        orderBy: { id: "desc" },
      });
      res.json(reproductores.map(serializeReproductor));
    } catch (err) {
      console.error("Error reproductores:", err);
      res.status(500).json({ error: "Error al obtener reproductores" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const granja = String(req.params.granja ?? "").trim();
      if (!granja) return res.json([]);
      const reproductores = await prisma.reproductor.findMany({
        where: {
          piletas: {
            ubicacion: { nombre: { equals: granja, mode: "insensitive" } },
          },
        },
        include: reproductorInclude,
        orderBy: { id: "desc" },
      });
      res.json(reproductores.map(serializeReproductor));
    } catch (err) {
      console.error("Error reproductores por granja:", err);
      res.status(500).json({ error: "Error al obtener reproductores" });
    }
  }

  static async create(req, res) {
    try {
      const piletaId = toInt(pick(req.body, "pileta_id", "piletaId", "fi_pileta_id"));
      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id es obligatorio" });
      }

      const machos = toInt(pick(req.body, "machos", "fn_machos"), 0) ?? 0;
      const hembras = toInt(pick(req.body, "hembras", "fn_hembras"), 0) ?? 0;
      const cantidadTotal = machos + hembras;
      const ratio = calcularRatio(machos, hembras);

      const creado = await prisma.reproductor.create({
        data: {
          pileta_id: piletaId,
          machos,
          hembras,
          cantidad_total: cantidadTotal,
          talla: toDecimal(pick(req.body, "talla", "fn_talla")),
          ratio,
          linea: pick(req.body, "linea", "fc_linea") ?? null,
          familia: pick(req.body, "familia", "fc_familia") ?? null,
          usuarioId: req.user.usuario_id,
        },
        include: reproductorInclude,
      });

      res.status(201).json({
        success: true,
        mensaje: "Reproductor registrado correctamente",
        data: serializeReproductor(creado),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Esa pileta ya tiene un reproductor asociado" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta invalida" });
      }
      console.error("Error registrar reproductor:", err);
      res.status(500).json({ error: "Error al registrar reproductor", detalle: err.message });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const updateData = {};

      const piletaId = toInt(pick(req.body, "pileta_id", "piletaId", "fi_pileta_id"));
      if (piletaId !== null) updateData.pileta_id = piletaId;

      const machosIn = pick(req.body, "machos", "fn_machos");
      const hembrasIn = pick(req.body, "hembras", "fn_hembras");
      const machos = machosIn !== undefined ? toInt(machosIn, 0) ?? 0 : null;
      const hembras = hembrasIn !== undefined ? toInt(hembrasIn, 0) ?? 0 : null;
      if (machos !== null) updateData.machos = machos;
      if (hembras !== null) updateData.hembras = hembras;

      if (machos !== null || hembras !== null) {
        const actual = await prisma.reproductor.findUnique({ where: { id } });
        if (!actual) return res.status(404).json({ error: "Reproductor no encontrado" });
        const finalMachos = machos ?? actual.machos;
        const finalHembras = hembras ?? actual.hembras;
        updateData.cantidad_total = finalMachos + finalHembras;
        updateData.ratio = calcularRatio(finalMachos, finalHembras);
      }

      if (req.body.talla !== undefined || req.body.fn_talla !== undefined) {
        updateData.talla = toDecimal(pick(req.body, "talla", "fn_talla"));
      }
      if (req.body.linea !== undefined || req.body.fc_linea !== undefined) {
        updateData.linea = pick(req.body, "linea", "fc_linea") ?? null;
      }
      if (req.body.familia !== undefined || req.body.fc_familia !== undefined) {
        updateData.familia = pick(req.body, "familia", "fc_familia") ?? null;
      }

      const actualizado = await prisma.reproductor.update({
        where: { id },
        data: updateData,
        include: reproductorInclude,
      });

      res.json({
        success: true,
        mensaje: "Reproductor actualizado correctamente",
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
      await prisma.reproductor.delete({ where: { id } });
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

  // ---------------------------------------------------------------------------
  // Endpoints heredados que requieren rediseno (sin modelo trazaReproductor ni
  // relacion directa con Instalacion).
  // ---------------------------------------------------------------------------
  static async getMovimientos(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno: ya no existe trazaReproductor en el schema.",
    });
  }

  static async getInstalaciones(req, res) {
    res.status(501).json({
      error: "Endpoint pendiente de rediseno: Reproductor ya no tiene FK directa a Instalacion.",
    });
  }
}

export default ReproductorController;
