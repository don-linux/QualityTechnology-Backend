import proveedorModel from "../models/proveedorModel.js";

class ProveedorController {
  static async getAll(req, res) {
    try {
      const proveedores = await proveedorModel.getAll();
      res.json(proveedores);
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const proveedor = await proveedorModel.create(req.body);
      res.json(proveedor);
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const proveedor = await proveedorModel.update(req.params.id, req.body);
      res.json(proveedor);
    } catch (err) {
      console.error("Error al actualizar proveedor:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await proveedorModel.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default ProveedorController;
