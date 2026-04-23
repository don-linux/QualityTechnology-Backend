import alevinModel from "../models/alevinModel.js";

class AlevinController {
  static async getAll(req, res) {
    try {
      const alevines = await alevinModel.getAll();
      res.json(alevines);
    } catch (err) {
      console.error("Error al obtener alevines:", err);
      res.status(500).json({ error: "Error al obtener alevines" });
    }
  }

  static async create(req, res) {
    try {
      const { fi_usuario_id, ...payload } = req.body;
      const alevin = await alevinModel.create({ ...payload, fi_usuario_id: req.user.usuario_id });
      res.status(201).json(alevin);
    } catch (err) {
      console.error("Error al insertar alevines:", err);
      res.status(500).json({ error: "Error al insertar alevines" });
    }
  }

  static async update(req, res) {
    try {
      const alevin = await alevinModel.update(req.params.id, req.body);
      if (!alevin) {
        return res.status(404).json({ error: "Alevin no encontrado" });
      }
      res.json(alevin);
    } catch (err) {
      console.error("Error al actualizar alevines:", err);
      res.status(500).json({ error: "Error al actualizar alevines" });
    }
  }

  static async delete(req, res) {
    try {
      const count = await alevinModel.delete(req.params.id);
      if (count === 0) {
        return res.status(404).json({ error: "Alevin no encontrado" });
      }
      res.json({ mensaje: "Alevin eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar alevines:", err);
      res.status(500).json({ error: "Error al eliminar alevines" });
    }
  }
}

export default AlevinController;
