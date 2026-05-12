import prisma from "../prisma.js";
import { serializeInstalacion } from "../utils/serializers.js";
import { resolverUbicacion, resolverOCrearUbicacion } from "../utils/ubicacion.js";

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function calcMetrosCubicos(largo, ancho, altura) {
  const l = Number(largo) || 0;
  const a = Number(ancho) || 0;
  const h = Number(altura) || 0;
  return Number((l * a * h).toFixed(2));
}

class InstalacionController {
  static async getAll(req, res) {
    try {
      const instalaciones = await prisma.instalacion.findMany({
        include: { ubicacion: true },
        orderBy: { nombreInstalacion: "asc" },
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones:", err);
      res.status(500).json({ error: "Error al obtener instalaciones" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);
      const instalaciones = await prisma.instalacion.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { ubicacion: true },
        orderBy: { nombreInstalacion: "asc" },
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones por granja:", err);
      res.status(500).json({ error: "Error al obtener instalaciones" });
    }
  }

  static async getByTipo(req, res) {
    try {
      const { tipo, granja } = req.params;
      const ubicacion = await resolverUbicacion(granja);
      if (!ubicacion) return res.json([]);
      const instalaciones = await prisma.instalacion.findMany({
        where: {
          ubicacionId: ubicacion.ubicacionId,
          tipoInstalacion: { contains: tipo, mode: "insensitive" },
        },
        include: { ubicacion: true },
        orderBy: { nombreInstalacion: "asc" },
      });
      res.json(instalaciones.map(serializeInstalacion));
    } catch (err) {
      console.error("Error al obtener instalaciones por tipo:", err);
      res.status(500).json({ error: "Error al obtener instalaciones por tipo" });
    }
  }

  static async create(req, res) {
    try {
      const nombreInstalacion = pick(req.body, "nombre_instalacion", "nombreInstalacion");
      const tipoInstalacion = pick(req.body, "tipo_instalacion", "tipoInstalacion");
      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");
      const estado = pick(req.body, "estado") || "vacia";
      const largo = toDecimal(pick(req.body, "largo")) ?? 0;
      const ancho = toDecimal(pick(req.body, "ancho")) ?? 0;
      const altura = toDecimal(pick(req.body, "altura")) ?? 0;
      const material = pick(req.body, "material") ?? "";

      if (!nombreInstalacion || !tipoInstalacion || !granjaInput) {
        return res.status(400).json({
          error: "nombre_instalacion, tipo_instalacion y fc_granja son obligatorios",
        });
      }

      const ubicacion = await resolverOCrearUbicacion(granjaInput);
      if (!ubicacion) {
        return res.status(400).json({ error: "granja/ubicacion invalida" });
      }

      const creada = await prisma.instalacion.create({
        data: {
          nombreInstalacion: String(nombreInstalacion),
          tipoInstalacion: String(tipoInstalacion),
          estado,
          largo,
          ancho,
          altura,
          material: String(material),
          metrosCubicos: calcMetrosCubicos(largo, ancho, altura),
          ubicacionId: ubicacion.ubicacionId,
          usuarioId: req.user.usuario_id,
        },
        include: { ubicacion: true },
      });

      res.status(201).json({
        message: "Instalación registrada correctamente.",
        data: serializeInstalacion(creada),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una instalacion con ese nombre en esa ubicacion" });
      }
      console.error("Error al registrar instalación:", err);
      res.status(500).json({ error: "Error al registrar instalación" });
    }
  }

  static async update(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id invalido" });
    }

    try {
      const updateData = {};

      const nombreInstalacion = pick(req.body, "nombre_instalacion", "nombreInstalacion");
      if (nombreInstalacion !== undefined) updateData.nombreInstalacion = String(nombreInstalacion);

      const tipoInstalacion = pick(req.body, "tipo_instalacion", "tipoInstalacion");
      if (tipoInstalacion !== undefined) updateData.tipoInstalacion = String(tipoInstalacion);

      const estado = pick(req.body, "estado");
      if (estado !== undefined) updateData.estado = estado || "vacia";

      const material = pick(req.body, "material");
      if (material !== undefined) updateData.material = String(material);

      const largoIn = req.body.largo;
      const anchoIn = req.body.ancho;
      const alturaIn = req.body.altura;

      if (largoIn !== undefined) updateData.largo = toDecimal(largoIn) ?? 0;
      if (anchoIn !== undefined) updateData.ancho = toDecimal(anchoIn) ?? 0;
      if (alturaIn !== undefined) updateData.altura = toDecimal(alturaIn) ?? 0;

      const granjaInput = pick(req.body, "fc_granja", "granja", "ubicacion_id", "ubicacionId");
      if (granjaInput !== undefined) {
        const ubicacion = await resolverOCrearUbicacion(granjaInput);
        if (!ubicacion) return res.status(400).json({ error: "granja/ubicacion invalida" });
        updateData.ubicacionId = ubicacion.ubicacionId;
      }

      if (
        updateData.largo !== undefined ||
        updateData.ancho !== undefined ||
        updateData.altura !== undefined
      ) {
        const actual = await prisma.instalacion.findUnique({ where: { instalacionId: id } });
        if (!actual) return res.status(404).json({ message: "Instalación no encontrada." });
        const largo = updateData.largo ?? actual.largo;
        const ancho = updateData.ancho ?? actual.ancho;
        const altura = updateData.altura ?? actual.altura;
        updateData.metrosCubicos = calcMetrosCubicos(largo, ancho, altura);
      }

      const actualizada = await prisma.instalacion.update({
        where: { instalacionId: id },
        data: updateData,
        include: { ubicacion: true },
      });

      res.json({
        success: true,
        message: "Instalación actualizada correctamente.",
        data: serializeInstalacion(actualizada),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Instalación no encontrada." });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe una instalacion con ese nombre en esa ubicacion" });
      }
      console.error("Error al actualizar instalación:", err);
      res.status(500).json({ error: "Error al actualizar instalación" });
    }
  }

  static async delete(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id invalido" });
    }

    try {
      const piletasAsociadas = await prisma.pileta.count({ where: { instalacionId: id } });
      if (piletasAsociadas > 0) {
        return res.status(409).json({
          message: "No se puede eliminar: la instalación tiene piletas activas asociadas.",
        });
      }

      await prisma.instalacion.delete({ where: { instalacionId: id } });
      res.json({ message: "Instalación eliminada correctamente." });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ message: "Instalación no encontrada." });
      }
      if (err.code === "P2003") {
        return res.status(409).json({
          message: "No se puede eliminar: la instalación tiene registros relacionados.",
        });
      }
      console.error("Error al eliminar instalación:", err);
      res.status(500).json({ error: "Error al eliminar instalación" });
    }
  }
}

export default InstalacionController;
