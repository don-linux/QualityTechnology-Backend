import { equiposModel, mantenimientosModel } from "../models/equipos.model.js";

/**
 * Controlador de Equipos
 */
export const equiposController = {
  /**
   * Obtener equipos por usuario
   */
  getByUsuario: async (req, res, next) => {
    try {
      const { usuario_id } = req.params;
      const equipos = await equiposModel.findByUsuarioId(usuario_id);
      res.json(equipos);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo equipo
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const equipo = await equiposModel.create(data);
      res.status(201).json(equipo);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar equipo
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const equipo = await equiposModel.update(id, data);
      res.json(equipo);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar equipo
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await equiposModel.delete(id);
      res.send("✅ Equipo eliminado correctamente");
    } catch (error) {
      next(error);
    }
  },
};

/**
 * Controlador de Mantenimientos
 */
export const mantenimientosController = {
  /**
   * Obtener mantenimientos por equipo
   */
  getByEquipo: async (req, res, next) => {
    try {
      const { equipo_id } = req.params;
      const mantenimientos = await mantenimientosModel.findByEquipoId(equipo_id);
      res.json(mantenimientos);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo mantenimiento
   */
  create: async (req, res, next) => {
    try {
      const { equipo_id } = req.params;
      const data = req.body;
      const mantenimiento = await mantenimientosModel.create(equipo_id, data);
      res.status(201).json(mantenimiento);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar mantenimiento
   */
  update: async (req, res, next) => {
    try {
      const { mantenimiento_id } = req.params;
      const data = req.body;
      const mantenimiento = await mantenimientosModel.update(
        mantenimiento_id,
        data
      );
      res.json(mantenimiento);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar mantenimiento
   */
  delete: async (req, res, next) => {
    try {
      const { mantenimiento_id } = req.params;
      await mantenimientosModel.delete(mantenimiento_id);
      res.send("✅ Mantenimiento eliminado correctamente");
    } catch (error) {
      next(error);
    }
  },
};
