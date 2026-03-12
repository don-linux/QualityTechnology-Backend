import ventaModel from "../models/ventaModel.js";

/* ---------------------------------------------------------
   UTILIDADES
--------------------------------------------------------- */
function sanitize(value) {
  if (!value) return 0;
  return Number(String(value).replace(/,/g, "")) || 0;
}

function calcularEstado(total, abonado) {
  if (abonado <= 0) return "ADEUDO";
  if (abonado > 0 && abonado < total) return "PARCIAL";
  return "LIQUIDADO";
}

class VentaController {
  static async getClientes(req, res) {
    try {
      const clientes = await ventaModel.getClientes();
      res.json(clientes);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getEncargados(req, res) {
    const { empresa } = req.params;

    let puesto = null;
    if (empresa === "MEDELLIN") puesto = "GAM";
    if (empresa === "CEIBA") puesto = "GAC";

    if (!puesto) return res.json([]);

    try {
      const encargados = await ventaModel.getEncargados(puesto);
      res.json(encargados);
    } catch (err) {
      console.error("Error al obtener encargados:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const ventas = await ventaModel.getAll();
      res.json(ventas);
    } catch (err) {
      console.error("Error al obtener ventas:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      let {
        fc_folio, fd_fecha_venta, fc_cliente, fc_tipo_venta,
        fn_cantidad_vendida, fn_precio_venta, fn_abonado,
        fc_encargado_venta, fc_observaciones, fc_empresa,
      } = req.body;

      fn_cantidad_vendida = sanitize(fn_cantidad_vendida);
      fn_precio_venta = sanitize(fn_precio_venta);
      fn_abonado = sanitize(fn_abonado);

      if (!fc_cliente) {
        return res.status(400).json({ error: "Cliente obligatorio" });
      }
      if (!fc_encargado_venta) {
        return res.status(400).json({ error: "Encargado obligatorio" });
      }
      if (fn_cantidad_vendida <= 0 || fn_precio_venta <= 0) {
        return res.status(400).json({ error: "Cantidad o precio invalidos" });
      }

      const fn_monto_total = fn_cantidad_vendida * fn_precio_venta;
      const fn_adeudo = fn_monto_total - fn_abonado;
      const fc_estado_pago = calcularEstado(fn_monto_total, fn_abonado);

      await ventaModel.create({
        fc_folio, fd_fecha_venta, fc_cliente, fc_tipo_venta,
        fn_cantidad_vendida, fn_precio_venta, fn_monto_total,
        fn_abonado, fn_adeudo, fc_estado_pago,
        fc_encargado_venta, fc_observaciones, fc_empresa,
      });

      res.json({ mensaje: "Venta registrada correctamente" });
    } catch (err) {
      console.error("Error al registrar venta:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      let {
        fc_folio, fd_fecha_venta, fc_cliente, fc_tipo_venta,
        fn_cantidad_vendida, fn_precio_venta, fn_abonado,
        fc_encargado_venta, fc_observaciones, fc_empresa,
      } = req.body;

      fn_cantidad_vendida = sanitize(fn_cantidad_vendida);
      fn_precio_venta = sanitize(fn_precio_venta);
      fn_abonado = sanitize(fn_abonado);

      const fn_monto_total = fn_cantidad_vendida * fn_precio_venta;
      const fn_adeudo = fn_monto_total - fn_abonado;
      const fc_estado_pago = calcularEstado(fn_monto_total, fn_abonado);

      await ventaModel.update(id, {
        fc_folio, fd_fecha_venta, fc_cliente, fc_tipo_venta,
        fn_cantidad_vendida, fn_precio_venta, fn_monto_total,
        fn_abonado, fn_adeudo, fc_estado_pago,
        fc_encargado_venta, fc_observaciones, fc_empresa,
      });

      res.json({ mensaje: "Venta actualizada correctamente" });
    } catch (err) {
      console.error("Error al actualizar venta:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await ventaModel.delete(req.params.id);
      res.json({ mensaje: "Venta eliminada" });
    } catch (err) {
      console.error("Error al eliminar venta:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default VentaController;
