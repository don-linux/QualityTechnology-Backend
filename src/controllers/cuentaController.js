import cuentaModel from "../models/cuentaModel.js";

class CuentaController {
  static async getAll(req, res) {
    try {
      const cuentas = await cuentaModel.getAll();
      res.json(cuentas);
    } catch (err) {
      console.error("Error al obtener cuentas:", err);
      res.status(500).json({ error: "Error al obtener cuentas" });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, saldo } = req.body;
      const cuenta = await cuentaModel.create(nombre, saldo);
      res.json(cuenta);
    } catch (err) {
      console.error("Error al crear cuenta:", err);
      res.status(500).json({ error: "Error al crear cuenta" });
    }
  }

  static async update(req, res) {
    try {
      const { nombre, saldo } = req.body;
      const cuenta = await cuentaModel.update(req.params.id, nombre, saldo);
      res.json(cuenta);
    } catch (err) {
      console.error("Error al actualizar cuenta:", err);
      res.status(500).json({ error: "Error al actualizar cuenta" });
    }
  }

  static async delete(req, res) {
    try {
      await cuentaModel.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error al eliminar cuenta:", err);
      res.status(500).json({ error: "Error al eliminar cuenta" });
    }
  }

  static async updateSaldo(req, res) {
    try {
      const { tipo, monto } = req.body;
      const cuenta = await cuentaModel.updateSaldo(req.params.id, tipo, monto);
      res.json(cuenta);
    } catch (err) {
      console.error("Error al actualizar saldo:", err);
      res.status(500).json({ error: "Error al actualizar saldo" });
    }
  }
}

export default CuentaController;
