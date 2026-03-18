import nominaModel from "../models/nominaModel.js";

class NominaController {
  static async getAll(req, res) {
    try {
      const nominas = await nominaModel.getAll(req.query);
      res.json(nominas);
    } catch (err) {
      console.error("Error al obtener nominas:", err);
      res.status(500).json({ error: "Error al obtener nominas" });
    }
  }

  static async create(req, res) {
    try {
      const nomina = await nominaModel.create(req.body);
      res.json(nomina);
    } catch (err) {
      console.error("Error al registrar nomina:", err);
      res.status(500).json({ error: "Error al registrar nomina" });
    }
  }

  static async update(req, res) {
    try {
      const result = await nominaModel.update(req.params.id, { ...req.body });
      if (!result) {
        return res.status(400).json({ error: "Nada que actualizar" });
      }
      res.json(result);
    } catch (err) {
      console.error("Error al actualizar nomina:", err);
      res.status(500).json({ error: "Error al actualizar nomina" });
    }
  }

  static async delete(req, res) {
    try {
      await nominaModel.delete(req.params.id);
      res.json({ mensaje: "Registro eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar nomina:", err);
      res.status(500).json({ error: "Error al eliminar nomina" });
    }
  }
}

export default NominaController;
