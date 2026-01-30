import { movimientoAlevinesModel } from "../models/movimientoAlevines.model.js";

/**
 * Controlador de Movimiento de Alevines
 */
export const movimientoAlevinesController = {
  /**
   * Obtener todos los movimientos
   */
  getAll: async (req, res, next) => {
    try {
      const movimientos = await movimientoAlevinesModel.findAll();
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
      const movimiento = await movimientoAlevinesModel.create(req.body);
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
      const movimiento = await movimientoAlevinesModel.update(id, req.body);

      if (!movimiento) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }

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
      const deleted = await movimientoAlevinesModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
