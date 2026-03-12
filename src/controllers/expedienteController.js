import expedienteModel from "../models/expedienteModel.js";

class ExpedienteController {
  static async getAll(req, res) {
    try {
      const { nombre } = req.query;
      const expedientes = await expedienteModel.getAll(nombre);
      res.json(expedientes);
    } catch (err) {
      console.error("Error al obtener expedientes:", err);
      res.status(500).json({ error: "Error al obtener expedientes" });
    }
  }

  static async create(req, res) {
    try {
      const expediente = await expedienteModel.create(req.body);
      res.json(expediente);
    } catch (err) {
      console.error("Error al crear expediente:", err);
      res.status(500).json({ error: "Error al crear expediente" });
    }
  }

  static async update(req, res) {
    try {
      const result = await expedienteModel.update(req.params.id, { ...req.body });
      if (!result) {
        return res.status(400).json({ error: "No se enviaron campos para actualizar" });
      }
      res.json(result);
    } catch (err) {
      console.error("Error al actualizar expediente:", err);
      res.status(500).json({ error: "Error al actualizar expediente" });
    }
  }

  static async delete(req, res) {
    try {
      await expedienteModel.delete(req.params.id);
      res.json({ mensaje: "Expediente eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar expediente:", err);
      res.status(500).json({ error: "Error al eliminar expediente" });
    }
  }

  static async deleteAll(req, res) {
    try {
      await expedienteModel.deleteAll();
      res.json({ mensaje: "Todos los expedientes eliminados correctamente" });
    } catch (err) {
      console.error("Error al eliminar todos:", err);
      res.status(500).json({ error: "Error al eliminar todos los expedientes" });
    }
  }
}

export default ExpedienteController;
