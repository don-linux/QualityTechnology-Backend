import { clientesModel } from "../models/clientes.model.js";

/**
 * Controlador de Clientes
 * Maneja las peticiones HTTP relacionadas con clientes
 */
export const clientesController = {
  /**
   * Obtener todos los clientes
   */
  getAll: async (req, res, next) => {
    try {
      const clientes = await clientesModel.findAll();
      res.json(clientes);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener cliente por ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const cliente = await clientesModel.findById(id);

      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      res.json(cliente);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo cliente
   */
  create: async (req, res, next) => {
    try {
      const clienteData = req.body;
      const cliente = await clientesModel.create(clienteData);
      res.status(201).json(cliente);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar cliente
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const clienteData = req.body;
      const cliente = await clientesModel.update(id, clienteData);

      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      res.json(cliente);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar cliente
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await clientesModel.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
