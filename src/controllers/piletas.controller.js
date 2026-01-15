import { piletasModel } from "../models/piletas.model.js";
import { usuariosModel } from "../models/usuarios.model.js";

/**
 * Controlador de Piletas
 * Maneja las peticiones HTTP relacionadas con piletas
 */
export const piletasController = {
  /**
   * Obtener piletas (por usuario o todas si es administrador)
   */
  getByUsuario: async (req, res, next) => {
    try {
      const { usuario_id } = req.params;

      // Obtener rol del usuario
      const rol = await usuariosModel.getRolById(usuario_id);

      let piletas;
      if (rol?.toLowerCase() === "administrador") {
        // Administrador ve todas las piletas
        piletas = await piletasModel.findAll();
      } else {
        // Otros usuarios solo ven sus piletas
        piletas = await piletasModel.findByUsuarioId(usuario_id);
      }

      res.json(piletas);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener pileta por ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const pileta = await piletasModel.findById(id);

      if (!pileta) {
        return res.status(404).json({ error: "Pileta no encontrada" });
      }

      res.json(pileta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nueva pileta
   */
  create: async (req, res, next) => {
    try {
      const piletaData = req.body;
      const pileta = await piletasModel.create(piletaData);
      res.status(201).json(pileta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar pileta
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const piletaData = req.body;
      const pileta = await piletasModel.update(id, piletaData);

      if (!pileta) {
        return res.status(404).json({ error: "Pileta no encontrada" });
      }

      res.json(pileta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar pileta
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await piletasModel.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
