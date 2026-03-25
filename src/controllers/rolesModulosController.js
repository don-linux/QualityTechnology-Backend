import RolesModulosModel from "../models/RolesModulosModel.js";
import { invalidarCacheRbac } from "../middleware/rbacMiddleware.js";

class RolesModulosController {

  // =============================
  // Obtener módulos por rol
  // =============================
  static async getModulosByRol(req, res) {
    const { rolId } = req.params;

    try {
      const modulos = await RolesModulosModel.getModulosByRol(rolId);
      res.json(modulos);
    } catch (err) {
      console.error("Error al obtener módulos del rol:", err);
      res.status(500).json({ error: "Error al obtener módulos del rol" });
    }
  }

  // =============================
  // Asignar módulo a rol
  // =============================
  static async assignModulo(req, res) {
    const { rolId } = req.params;
    const { moduloId } = req.body;

    if (!moduloId)
      return res.status(400).json({ error: "El módulo es obligatorio." });

    try {
      const result = await RolesModulosModel.assignModuloToRol(rolId, moduloId);
      invalidarCacheRbac(rolId);

      res.json({
        success: true,
        mensaje: "Módulo asignado correctamente.",
        data: result,
      });
    } catch (err) {
      console.error("Error al asignar módulo:", err);
      res.status(500).json({ error: "Error al asignar módulo" });
    }
  }

  // =============================
  // Quitar módulo de rol
  // =============================
  static async removeModulo(req, res) {
    const { rolId, moduloId } = req.params;

    try {
      const deleted = await RolesModulosModel.removeModuloFromRol(rolId, moduloId);

      if (!deleted)
        return res.status(404).json({ error: "Relación no encontrada." });

      invalidarCacheRbac(rolId);

      res.json({
        success: true,
        mensaje: "Módulo removido correctamente.",
      });
    } catch (err) {
      console.error("Error al remover módulo:", err);
      res.status(500).json({ error: "Error al remover módulo" });
    }
  }

  // =============================
  // Reemplazar todos los módulos del rol
  // =============================
  static async replaceModulos(req, res) {
    const { rolId } = req.params;
    const { modulosIds } = req.body;

    if (!Array.isArray(modulosIds))
      return res.status(400).json({ error: "Debe enviar un arreglo de módulos." });

    try {
      await RolesModulosModel.replaceModulosByRol(rolId, modulosIds);
      invalidarCacheRbac(rolId);

      res.json({
        success: true,
        mensaje: "Módulos actualizados correctamente.",
      });
    } catch (err) {
      console.error("Error al actualizar módulos del rol:", err);
      res.status(500).json({ error: "Error al actualizar módulos del rol" });
    }
  }

}

export default RolesModulosController;