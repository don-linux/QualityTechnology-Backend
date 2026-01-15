import { reproductoresModel } from "../models/reproductores.model.js";
import { usuariosModel } from "../models/usuarios.model.js";

/**
 * Controlador de Reproductores
 */
export const reproductoresController = {
  /**
   * Obtener inventario completo
   */
  getInventario: async (req, res, next) => {
    try {
      const inventario = await reproductoresModel.getInventario();
      res.json(inventario);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener reproductores (por usuario o todos si es administrador)
   */
  getByUsuario: async (req, res, next) => {
    try {
      const { usuario_id } = req.params;

      const rol = await usuariosModel.getRolById(usuario_id);

      let reproductores;
      if (rol?.toLowerCase() === "administrador") {
        reproductores = await reproductoresModel.findAll();
      } else {
        reproductores = await reproductoresModel.findByUsuarioId(usuario_id);
      }

      res.json(reproductores);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo reproductor
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const reproductor = await reproductoresModel.create(data);
      res.status(201).json(reproductor);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar reproductor
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const reproductor = await reproductoresModel.update(id, data);

      if (!reproductor) {
        return res.status(404).json({ error: "Reproductor no encontrado" });
      }

      res.json(reproductor);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar reproductor
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await reproductoresModel.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
