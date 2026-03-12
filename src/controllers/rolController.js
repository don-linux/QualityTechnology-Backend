import rolModel from "../models/rolModel.js";

class RolController {
  static async getAll(req, res) {
    try {
      const roles = await rolModel.getAll();
      res.json(roles);
    } catch (err) {
      console.error("Error al obtener roles:", err);
      res.status(500).json({ error: "Error al obtener roles" });
    }
  }

  static async create(req, res) {
    try {
      const { nombre } = req.body;
      const rol = await rolModel.create(nombre);
      res.json(rol);
    } catch (err) {
      console.error("Error al insertar roles:", err);
      res.status(500).json({ error: "Error al insertar rol" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      const rol = await rolModel.update(id, nombre);
      res.json(rol);
    } catch (err) {
      console.error("Error al actualizar roles:", err);
      res.status(500).json({ error: "Error al actualizar rol" });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await rolModel.delete(id);
      res.sendStatus(204);
    } catch (err) {
      console.error("Error al eliminar rol:", err);
      res.status(500).json({ error: "Error al eliminar rol" });
    }
  }
}

export default RolController;
