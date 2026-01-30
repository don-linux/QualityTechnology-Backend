import { piletasModel } from "../models/piletas.model.js";
import { usuariosModel } from "../models/usuarios.model.js";

/**
 * Controlador de Piletas
 * Maneja las peticiones HTTP relacionadas con piletas
 */
export const piletasController = {
  /**
   * Obtener piletas por granja
   */
  getByGranja: async (req, res, next) => {
    try {
      const { nombre } = req.params;
      const piletas = await piletasModel.findByGranja(nombre);
      res.json(piletas);
    } catch (error) {
      next(error);
    }
  },

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
   * Crear nueva pileta o movimiento (con transacción)
   */
  create: async (req, res, next) => {
    try {
      const result = await piletasModel.createWithTransaction(req.body);
      res.status(201).json(result);
    } catch (error) {
      if (error.message.includes("No se puede trasladar") ||
          error.message.includes("El origen no existe")) {
        return res.status(400).json({ error: error.message });
      }
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

  /**
   * Obtener rastreabilidad por usuario y granja
   */
  getRastreabilidad: async (req, res, next) => {
    try {
      const { usuario_id, granja } = req.params;
      const movimientos = await piletasModel.getRastreabilidad(usuario_id, granja);
      res.json(movimientos);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Filtrar rastreabilidad
   */
  filtrarRastreabilidad: async (req, res, next) => {
    try {
      const { usuario_id, granja } = req.params;
      const { buscar, fecha_inicio, fecha_fin } = req.query;

      const movimientos = await piletasModel.filtrarRastreabilidad(
        usuario_id,
        granja,
        { buscar, fecha_inicio, fecha_fin }
      );
      res.json(movimientos);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar rastreabilidad
   */
  deleteRastreabilidad: async (req, res, next) => {
    try {
      const { movimiento_id, eliminar_todos, granja } = req.body;
      const result = await piletasModel.deleteRastreabilidad(
        movimiento_id,
        eliminar_todos,
        granja
      );
      res.json(result);
    } catch (error) {
      if (error.message.includes("Debe especificar")) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  },

  /**
   * Obtener inventario por granja
   */
  getInventario: async (req, res, next) => {
    try {
      const { granja } = req.params;
      const inventario = await piletasModel.getInventario(granja);

      if (inventario.length === 0) {
        return res.status(404).json({
          message: `No se encontró inventario para ${granja}`,
        });
      }

      res.json(inventario);
    } catch (error) {
      next(error);
    }
  },
};
