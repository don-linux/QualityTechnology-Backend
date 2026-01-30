import { nominaModel } from "../models/nomina.model.js";

/**
 * Controlador de Nómina
 */
export const nominaController = {
  /**
   * Obtener todas las nóminas (con filtros opcionales)
   */
  getAll: async (req, res, next) => {
    try {
      const { nombre, fecha } = req.query;
      const nominas = await nominaModel.findAll(nombre, fecha);
      res.json(nominas);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo registro de nómina
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const nomina = await nominaModel.create(data);
      res.status(201).json(nomina);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar nómina
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const nomina = await nominaModel.update(id, data);
      res.json(nomina);
    } catch (error) {
      if (error.message === "Nada que actualizar") {
        return res.status(400).send(error.message);
      }
      next(error);
    }
  },

  /**
   * Eliminar nómina
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await nominaModel.delete(id);
      res.send("✅ Registro eliminado correctamente");
    } catch (error) {
      next(error);
    }
  },
};
