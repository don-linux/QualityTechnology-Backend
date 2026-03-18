import cajaAhorroModel from "../models/cajaAhorroModel.js";

class CajaAhorroController {
  static async getByGranja(req, res) {
    try {
      const registros = await cajaAhorroModel.getByGranja(req.params.granja);
      res.json(registros);
    } catch (err) {
      console.error("Error al obtener registros:", err);
      res.status(500).json({ error: "Error al obtener registros" });
    }
  }

  static async create(req, res) {
    try {
      const { categoria, granja = "Ceiba" } = req.body;
      const registro = await cajaAhorroModel.create(categoria, granja);
      res.json(registro);
    } catch (err) {
      console.error("Error al crear categoria:", err);
      res.status(500).json({ error: "Error al crear categoria" });
    }
  }

  static async update(req, res) {
    try {
      await cajaAhorroModel.update(req.params.id, req.body);
      res.json({ mensaje: "Actualizado correctamente" });
    } catch (err) {
      console.error("Error al actualizar:", err);
      res.status(500).json({ error: "Error al actualizar" });
    }
  }

  static async delete(req, res) {
    try {
      await cajaAhorroModel.delete(req.params.id);
      res.json({ mensaje: "Eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar registro:", err);
      res.status(500).json({ error: "Error al eliminar registro" });
    }
  }

  static async deleteByGranja(req, res) {
    try {
      const { granja } = req.query;
      await cajaAhorroModel.deleteByGranja(granja);
      res.json({ mensaje: "Eliminados todos los registros" });
    } catch (err) {
      console.error("Error al eliminar todos:", err);
      res.status(500).json({ error: "Error al eliminar todos" });
    }
  }
}

export default CajaAhorroController;
