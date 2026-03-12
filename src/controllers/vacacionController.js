import vacacionModel from "../models/vacacionModel.js";

class VacacionController {
  static async getAll(req, res) {
    try {
      const vacaciones = await vacacionModel.getAll();
      res.json(vacaciones);
    } catch (err) {
      console.error("Error al obtener vacaciones:", err);
      res.status(500).json({ error: "Error al obtener vacaciones" });
    }
  }

  static async create(req, res) {
    try {
      const registro = await vacacionModel.create(req.body);
      res.json(registro);
    } catch (err) {
      console.error("Error al crear registro:", err);
      res.status(500).json({ error: "Error al crear registro" });
    }
  }

  static async update(req, res) {
    try {
      const registro = await vacacionModel.update(req.params.id, { ...req.body });
      res.json(registro);
    } catch (err) {
      console.error("Error al actualizar vacaciones:", err);
      res.status(500).json({ error: "Error al actualizar registro" });
    }
  }

  static async delete(req, res) {
    try {
      await vacacionModel.delete(req.params.id);
      res.json({ mensaje: "Registro eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar registro:", err);
      res.status(500).json({ error: "Error al eliminar registro" });
    }
  }

  static async deleteAll(req, res) {
    try {
      await vacacionModel.deleteAll();
      res.json({ mensaje: "Todos los registros de vacaciones fueron eliminados" });
    } catch (err) {
      console.error("Error al eliminar todos los registros:", err);
      res.status(500).json({ error: "Error al eliminar todos los registros" });
    }
  }
}

export default VacacionController;
