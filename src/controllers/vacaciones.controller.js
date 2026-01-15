import { vacacionesModel } from "../models/vacaciones.model.js";

/**
 * Controlador de Vacaciones
 */
export const vacacionesController = {
  /**
   * Obtener todos los registros
   */
  getAll: async (req, res, next) => {
    try {
      const vacaciones = await vacacionesModel.findAll();
      res.json(vacaciones);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo registro
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const vacacion = await vacacionesModel.create(data);
      res.status(201).json(vacacion);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar registro
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const vacacion = await vacacionesModel.update(id, data);
      res.json(vacacion);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar registro individual
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await vacacionesModel.delete(id);
      res.send("✅ Registro eliminado correctamente");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar todos los registros
   */
  deleteAll: async (req, res, next) => {
    try {
      await vacacionesModel.deleteAll();
      res.send("⚠️ Todos los registros de vacaciones fueron eliminados.");
    } catch (error) {
      next(error);
    }
  },
};
