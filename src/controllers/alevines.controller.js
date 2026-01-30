import { alevinesModel } from "../models/alevines.model.js";

/**
 * Controlador de Alevines
 */
export const alevinesController = {
  /**
   * Obtener todos los alevines
   */
  getAll: async (req, res, next) => {
    try {
      const alevines = await alevinesModel.findAll();
      res.json(alevines);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo alevín
   */
  create: async (req, res, next) => {
    try {
      const alevin = await alevinesModel.create(req.body);
      res.status(201).json(alevin);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar alevín
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const alevin = await alevinesModel.update(id, req.body);

      if (!alevin) {
        return res.status(404).json({ error: "Alevín no encontrado" });
      }

      res.json(alevin);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar alevín
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await alevinesModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Alevín no encontrado" });
      }

      res.json({ message: "Alevín eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  },
};
