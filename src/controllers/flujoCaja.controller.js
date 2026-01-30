import { flujoCajaModel } from "../models/flujoCaja.model.js";

/**
 * Controlador de Flujo de Caja
 */
export const flujoCajaController = {
  /**
   * Obtener tesorería por granja
   */
  getTesoreria: async (req, res, next) => {
    try {
      const { granja } = req.params;
      const tesoreria = await flujoCajaModel.getTesoreriaByGranja(granja);
      res.json(tesoreria);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener movimientos por granja
   */
  getByGranja: async (req, res, next) => {
    try {
      const { granja } = req.params;
      const movimientos = await flujoCajaModel.findByGranja(granja);
      res.json(movimientos);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo movimiento
   */
  create: async (req, res, next) => {
    try {
      const movimiento = await flujoCajaModel.create(req.body);
      res.status(201).json(movimiento);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar movimiento
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const movimiento = await flujoCajaModel.update(id, req.body);
      res.json(movimiento);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar movimiento
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await flujoCajaModel.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
