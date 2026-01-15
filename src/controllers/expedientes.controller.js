import { expedientesModel } from "../models/expedientes.model.js";

/**
 * Controlador de Expedientes
 */
export const expedientesController = {
  /**
   * Obtener todos los expedientes (con búsqueda opcional)
   */
  getAll: async (req, res, next) => {
    try {
      const { nombre } = req.query;
      const expedientes = await expedientesModel.findAll(nombre);
      res.json(expedientes);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo expediente
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const expediente = await expedientesModel.create(data);
      res.status(201).json(expediente);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar expediente
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const expediente = await expedientesModel.update(id, data);
      res.json(expediente);
    } catch (error) {
      if (error.message === "No se enviaron campos para actualizar") {
        return res.status(400).send(error.message);
      }
      next(error);
    }
  },

  /**
   * Eliminar expediente
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await expedientesModel.delete(id);
      res.send("✅ Expediente eliminado correctamente");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar todos los expedientes
   */
  deleteAll: async (req, res, next) => {
    try {
      await expedientesModel.deleteAll();
      res.send("🗑️ Todos los expedientes eliminados correctamente");
    } catch (error) {
      next(error);
    }
  },
};
