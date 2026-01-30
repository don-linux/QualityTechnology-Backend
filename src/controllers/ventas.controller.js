import { ventasModel } from "../models/ventas.model.js";
import { ventasUtils } from "../utils/ventas.utils.js";

/**
 * Controlador de Ventas
 */
export const ventasController = {
  /**
   * Obtener todas las ventas
   */
  getAll: async (req, res, next) => {
    try {
      const ventas = await ventasModel.findAll();
      res.json(ventas);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear nueva venta
   */
  create: async (req, res, next) => {
    try {
      let data = { ...req.body };

      // Sanitizar datos numéricos
      data.fn_talla = ventasUtils.sanitizeNumeric(data.fn_talla);
      data.fn_cantidad_vendida = ventasUtils.sanitizeNumeric(data.fn_cantidad_vendida);
      data.fn_precio_venta = ventasUtils.sanitizeNumeric(data.fn_precio_venta);
      data.fi_usuario_id = ventasUtils.sanitizeNumeric(data.fi_usuario_id);

      // Calcular monto total
      data.fn_monto_total = ventasUtils.calcularTotal(
        data.fn_cantidad_vendida,
        data.fn_precio_venta
      );

      // Normalizar granja
      data.fc_granja = ventasUtils.normalizarGranja(data.fc_granja);

      const venta = await ventasModel.create(data);
      res.status(201).json(venta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar venta
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      let data = { ...req.body };

      // Sanitizar datos numéricos
      data.fn_talla = ventasUtils.sanitizeNumeric(data.fn_talla);
      data.fn_cantidad_vendida = ventasUtils.sanitizeNumeric(data.fn_cantidad_vendida);
      data.fn_precio_venta = ventasUtils.sanitizeNumeric(data.fn_precio_venta);
      data.fi_usuario_id = ventasUtils.sanitizeNumeric(data.fi_usuario_id);

      // Calcular monto total
      data.fn_monto_total = ventasUtils.calcularTotal(
        data.fn_cantidad_vendida,
        data.fn_precio_venta
      );

      // Normalizar granja
      data.fc_granja = ventasUtils.normalizarGranja(data.fc_granja);

      const venta = await ventasModel.update(id, data);
      res.json(venta);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener concentrado
   */
  getConcentrado: async (req, res, next) => {
    try {
      const { granja } = req.query;
      const concentrado = await ventasModel.getConcentrado(granja);
      res.json(concentrado);
    } catch (error) {
      next(error);
    }
  },
};
