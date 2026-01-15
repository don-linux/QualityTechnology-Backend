import { engordaModel } from "../models/engorda.model.js";
import { usuariosModel } from "../models/usuarios.model.js";

/**
 * Controlador de Engorda
 */
export const engordaController = {
  /**
   * Obtener registros (por usuario o todos si es administrador)
   */
  getByUsuario: async (req, res, next) => {
    try {
      const { usuario_id } = req.params;

      const rol = await usuariosModel.getRolById(usuario_id);

      let registros;
      if (rol?.toLowerCase() === "administrador") {
        registros = await engordaModel.findAll();
      } else {
        registros = await engordaModel.findByUsuarioId(usuario_id);
      }

      res.json(registros);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nuevo registro
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const registro = await engordaModel.create(data);
      res.status(201).json(registro);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar registro
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const registro = await engordaModel.update(id, data);

      if (!registro) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      res.json(registro);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar registro
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await engordaModel.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
};
