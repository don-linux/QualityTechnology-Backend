import { proveedoresModel } from "../models/proveedores.model.js";

/**
 * Controlador de Proveedores
 */
export const proveedoresController = {
  /**
   * Obtener todos los proveedores
   */
  getAll: async (req, res, next) => {
    try {
      const proveedores = await proveedoresModel.findAll();
      res.json(proveedores);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo proveedor
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const proveedor = await proveedoresModel.create(data);
      res.status(201).json(proveedor);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar proveedor
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const proveedor = await proveedoresModel.update(id, data);
      res.json(proveedor);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar proveedor
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await proveedoresModel.delete(id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
};
