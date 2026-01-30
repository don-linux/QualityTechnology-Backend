import { cajaAhorroModel } from "../models/cajaAhorro.model.js";

/**
 * Controlador de Caja de Ahorro
 */
export const cajaAhorroController = {
  /**
   * Obtener registros por granja
   */
  getByGranja: async (req, res, next) => {
    try {
      const { granja } = req.params;
      const registros = await cajaAhorroModel.findByGranja(granja);
      res.json(registros);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nueva categoría
   */
  create: async (req, res, next) => {
    try {
      const { categoria, granja = "Ceiba" } = req.body;
      const registro = await cajaAhorroModel.create(categoria, granja);
      res.status(201).json(registro);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar valores de una categoría
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const registro = await cajaAhorroModel.update(id, data);
      res.json({ message: "Actualizado correctamente", registro });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar categoría por ID
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await cajaAhorroModel.delete(id);
      res.json({ message: "Eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar todas las categorías de una granja
   */
  deleteByGranja: async (req, res, next) => {
    try {
      const { granja } = req.query;
      await cajaAhorroModel.deleteByGranja(granja);
      res.json({ message: "Eliminados todos los registros" });
    } catch (error) {
      next(error);
    }
  },
};
