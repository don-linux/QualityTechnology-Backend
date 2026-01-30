import { listaEsperaModel } from "../models/lista_espera.model.js";
import { listaEsperaService } from "../services/lista_espera.service.js";

/**
 * Controlador de Lista de Espera
 */
export const listaEsperaController = {
  /**
   * Obtener todos los registros
   */
  getAll: async (req, res, next) => {
    try {
      const registros = await listaEsperaModel.findAll();
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
      const registro = await listaEsperaModel.create(data);
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
      await listaEsperaModel.update(id, data);
      res.sendStatus(200);
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
      await listaEsperaModel.delete(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Convertir a venta
   */
  convertirAVenta: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario_id = req.headers["usuario_id"] || req.user?.usuario_id || 1;

      const venta = await listaEsperaService.convertirAVenta(id, usuario_id);

      res.json({
        mensaje: "Convertido en venta real correctamente",
        venta_id: venta.fi_venta_id,
      });
    } catch (error) {
      if (error.message === "Registro no encontrado") {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  },
};
