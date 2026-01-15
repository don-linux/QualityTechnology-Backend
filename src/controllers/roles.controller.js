import { rolesModel } from "../models/roles.model.js";

/**
 * Controlador de Roles
 * Maneja las peticiones HTTP relacionadas con roles
 */
export const rolesController = {
  /**
   * Obtener todos los roles
   */
  getAll: async (req, res, next) => {
    try {
      const roles = await rolesModel.findAll();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener rol por ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const rol = await rolesModel.findById(id);

      if (!rol) {
        return res.status(404).json({ error: "Rol no encontrado" });
      }

      res.json(rol);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo rol
   */
  create: async (req, res, next) => {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: "El nombre es obligatorio" });
      }

      const rol = await rolesModel.create(nombre);
      res.status(201).json(rol);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar rol
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: "El nombre es obligatorio" });
      }

      const rol = await rolesModel.update(id, nombre);

      if (!rol) {
        return res.status(404).json({ error: "Rol no encontrado" });
      }

      res.json(rol);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar rol
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await rolesModel.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
