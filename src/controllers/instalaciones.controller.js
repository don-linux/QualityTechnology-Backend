import { instalacionesModel } from "../models/instalaciones.model.js";

/**
 * Controlador de Instalaciones
 */
export const instalacionesController = {
  /**
   * Listar instalaciones por usuario
   */
  getByUsuario: async (req, res, next) => {
    try {
      const { usuario_id } = req.params;
      const instalaciones = await instalacionesModel.findByUsuario(usuario_id);
      res.json(instalaciones);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Listar instalaciones por granja
   */
  getByGranja: async (req, res, next) => {
    try {
      const { nombre } = req.params;
      const instalaciones = await instalacionesModel.findByGranja(nombre);
      res.json(instalaciones);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nueva instalación
   */
  create: async (req, res, next) => {
    try {
      const instalacion = await instalacionesModel.create(req.body);
      res.status(201).json(instalacion);
    } catch (error) {
      if (error.message === "Granja inválida") {
        return res.status(400).json({
          error: "Granja inválida. Seleccione una granja válida.",
        });
      }
      next(error);
    }
  },

  /**
   * Actualizar instalación
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const instalacion = await instalacionesModel.update(id, req.body);

      if (!instalacion) {
        return res.status(404).json({ error: "Instalación no encontrada" });
      }

      res.json(instalacion);
    } catch (error) {
      if (error.message === "Granja inválida") {
        return res.status(400).json({
          error: "Granja inválida. Seleccione una granja válida.",
        });
      }
      next(error);
    }
  },

  /**
   * Eliminar instalación
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await instalacionesModel.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
