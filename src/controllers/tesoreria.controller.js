import { tesoreriaModel } from "../models/tesoreria.model.js";

/**
 * Controlador de Tesorería
 */
export const tesoreriaController = {
  /**
   * Obtener resumen general de tesorería
   */
  getOverview: async (req, res, next) => {
    try {
      const { anio } = req.query;
      const tesoreria = await tesoreriaModel.getOverview(anio);
      res.json(tesoreria);
    } catch (error) {
      next(error);
    }
  },
};
