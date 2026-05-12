import prisma from "../prisma.js";
import { invalidarCacheRbac } from "../middleware/rbacMiddleware.js";
import { serializeModulo, serializeRolModulo } from "../utils/serializers.js";

async function asegurarNoRoot(rolId) {
  const rol = await prisma.rol.findUnique({ where: { rolId: Number(rolId) } });
  if (!rol) {
    const err = new Error("Rol no encontrado");
    err.status = 404;
    throw err;
  }
  if (rol.esRoot) {
    const err = new Error("No se pueden modificar modulos del rol ROOT.");
    err.status = 409;
    throw err;
  }
  return rol;
}

class RolesModulosController {
  static async getModulosByRol(req, res) {
    const { rolId } = req.params;
    try {
      const rol = await prisma.rol.findUnique({ where: { rolId: Number(rolId) } });
      if (!rol) {
        return res.status(404).json({ error: "Rol no encontrado" });
      }

      let modulos;
      if (rol.esRoot) {
        modulos = await prisma.modulo.findMany({
          where: { activo: true },
          orderBy: { nombre: "asc" },
        });
      } else {
        const relaciones = await prisma.rolModulo.findMany({
          where: { rolId: Number(rolId) },
          include: { modulo: true },
          orderBy: { modulo: { nombre: "asc" } },
        });
        modulos = relaciones.map((r) => r.modulo);
      }

      res.json(modulos.map(serializeModulo));
    } catch (err) {
      console.error("Error al obtener modulos del rol:", err);
      res.status(500).json({ error: "Error al obtener modulos del rol" });
    }
  }

  static async assignModulo(req, res) {
    const { rolId } = req.params;
    const { moduloId } = req.body;

    if (!moduloId) {
      return res.status(400).json({ error: "El modulo es obligatorio." });
    }

    try {
      await asegurarNoRoot(rolId);
      const result = await prisma.rolModulo.upsert({
        where: { rolId_moduloId: { rolId: Number(rolId), moduloId: Number(moduloId) } },
        update: {},
        create: { rolId: Number(rolId), moduloId: Number(moduloId) },
      });
      invalidarCacheRbac(rolId);
      res.json({
        success: true,
        mensaje: "Modulo asignado correctamente.",
        data: serializeRolModulo(result),
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "El modulo no existe." });
      }
      console.error("Error al asignar modulo:", err);
      res.status(500).json({ error: "Error al asignar modulo" });
    }
  }

  static async removeModulo(req, res) {
    const { rolId, moduloId } = req.params;
    try {
      await asegurarNoRoot(rolId);
      await prisma.rolModulo.delete({
        where: { rolId_moduloId: { rolId: Number(rolId), moduloId: Number(moduloId) } },
      });
      invalidarCacheRbac(rolId);
      res.json({ success: true, mensaje: "Modulo removido correctamente." });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Relacion no encontrada." });
      }
      console.error("Error al remover modulo:", err);
      res.status(500).json({ error: "Error al remover modulo" });
    }
  }

  static async replaceModulos(req, res) {
    const { rolId } = req.params;
    const { modulosIds } = req.body;

    if (!Array.isArray(modulosIds)) {
      return res.status(400).json({ error: "Debe enviar un arreglo de modulos." });
    }

    try {
      await asegurarNoRoot(rolId);
      const rolIdNum = Number(rolId);
      const ids = [...new Set(modulosIds.map((id) => Number(id)))].filter(Number.isFinite);

      await prisma.$transaction([
        prisma.rolModulo.deleteMany({ where: { rolId: rolIdNum } }),
        ...(ids.length
          ? [
              prisma.rolModulo.createMany({
                data: ids.map((moduloId) => ({ rolId: rolIdNum, moduloId })),
                skipDuplicates: true,
              }),
            ]
          : []),
      ]);

      invalidarCacheRbac(rolId);
      res.json({ success: true, mensaje: "Modulos actualizados correctamente." });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Uno o mas modulos no existen." });
      }
      console.error("Error al actualizar modulos del rol:", err);
      res.status(500).json({ error: "Error al actualizar modulos del rol" });
    }
  }
}

export default RolesModulosController;
