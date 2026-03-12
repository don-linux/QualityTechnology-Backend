import flujoCajaModel from "../models/flujoCajaModel.js";

class FlujoCajaController {
  static async getClientes(req, res) {
    try {
      const clientes = await flujoCajaModel.getClientes();
      res.json(clientes);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  }

  static async getProveedores(req, res) {
    try {
      const proveedores = await flujoCajaModel.getProveedores();
      res.json(proveedores);
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      res.status(500).json({ error: "Error al obtener proveedores" });
    }
  }

  static async getTesoreriaByGranja(req, res) {
    try {
      const datos = await flujoCajaModel.getTesoreriaByGranja(req.params.granja);
      res.json(datos);
    } catch (err) {
      console.error("Error al obtener tesoreria:", err);
      res.status(500).json({ error: "Error al obtener datos de tesoreria" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const movimientos = await flujoCajaModel.getByGranja(req.params.granja);
      res.json(movimientos);
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      res.status(500).json({ error: "Error al obtener movimientos" });
    }
  }

  static async create(req, res) {
    try {
      const {
        fc_granja, fd_fecha, fn_ingreso, fn_egreso,
        fc_descripcion, fc_cuenta, fc_categoria, fc_subcategoria,
        fc_beneficiario, fc_noproyecto, fc_estatus,
      } = req.body;

      const fc_mes = fd_fecha?.slice(0, 7);
      const ingreso = Number(fn_ingreso) || 0;
      const egreso = Number(fn_egreso) || 0;
      const ingresoFinal = ingreso > 0 ? ingreso : 0;
      const egresoFinal = egreso > 0 ? egreso : 0;

      // Verificar existencia de la cuenta
      const cuenta = await flujoCajaModel.getCuentaByNombre(fc_cuenta);
      if (!cuenta) {
        return res.status(400).json({ error: "La cuenta seleccionada no existe." });
      }

      let saldoActual = parseFloat(cuenta.saldo);

      // Validar saldo suficiente si es egreso
      if (egresoFinal > 0) {
        if (egresoFinal > saldoActual) {
          return res.status(400).json({
            error: `Saldo insuficiente en "${fc_cuenta}". Disponible: $${saldoActual.toFixed(2)}.`,
          });
        }
        saldoActual -= egresoFinal;
      }

      if (ingresoFinal > 0) {
        saldoActual += ingresoFinal;
      }

      const fc_factura = req.file ? `/uploads/facturas/${req.file.filename}` : null;

      const movimiento = await flujoCajaModel.create({
        fc_granja, fd_fecha, fn_ingreso: ingresoFinal,
        fn_egreso: egresoFinal, fc_descripcion, fc_cuenta,
        fc_categoria, fc_subcategoria, fc_beneficiario,
        fc_noproyecto, fc_factura, fc_estatus, fc_mes,
      });

      await flujoCajaModel.updateCuentaSaldo(cuenta.id, saldoActual);

      res.json({
        mensaje: "Movimiento registrado correctamente",
        movimiento,
        nuevoSaldo: saldoActual,
      });
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      res.status(500).json({ error: "Error al registrar movimiento" });
    }
  }

  static async update(req, res) {
    try {
      const {
        fc_granja, fd_fecha, fn_ingreso, fn_egreso,
        fc_descripcion, fc_cuenta, fc_categoria, fc_subcategoria,
        fc_beneficiario, fc_noproyecto, fc_factura, fc_estatus,
      } = req.body;

      const fc_mes = fd_fecha?.slice(0, 7);
      const ingreso = Number(fn_ingreso) || 0;
      const egreso = Number(fn_egreso) || 0;
      const ingresoFinal = ingreso > 0 ? ingreso : 0;
      const egresoFinal = egreso > 0 ? egreso : 0;

      const movimiento = await flujoCajaModel.update(req.params.id, {
        fc_granja, fd_fecha, fn_ingreso: ingresoFinal,
        fn_egreso: egresoFinal, fc_descripcion, fc_cuenta,
        fc_categoria, fc_subcategoria, fc_beneficiario,
        fc_noproyecto, fc_factura, fc_estatus, fc_mes,
      });

      res.json(movimiento);
    } catch (err) {
      console.error("Error al actualizar movimiento:", err);
      res.status(500).json({ error: "Error al actualizar movimiento" });
    }
  }

  static async delete(req, res) {
    try {
      await flujoCajaModel.delete(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      res.status(500).json({ error: "Error al eliminar movimiento" });
    }
  }
}

export default FlujoCajaController;
