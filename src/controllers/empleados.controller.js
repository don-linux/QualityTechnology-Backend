import { empleadosModel } from "../models/empleados.model.js";

/**
 * Controlador de Empleados
 */
export const empleadosController = {
  /**
   * Obtener todos los empleados
   */
  getAll: async (req, res, next) => {
    try {
      const empleados = await empleadosModel.findAll();
      res.json(empleados);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo empleado
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const empleado = await empleadosModel.create(data);
      res.status(201).json(empleado);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar empleado
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const empleado = await empleadosModel.update(id, data);

      if (!empleado) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      res.json(empleado);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar empleado
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await empleadosModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }

      res.json({ message: "Empleado eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  },
};
