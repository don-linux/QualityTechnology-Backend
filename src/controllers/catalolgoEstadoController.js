import EstadoModel from "../models/EstadoModel.js";

class EstadoController {

  // =============================
  // Obtener todos
  // =============================
  static async getAll(req, res) {
    try {
      const estados = await EstadoModel.getAll();
      res.json(estados);
    } catch (err) {
      console.error("❌ Error al obtener estados:", err);
      res.status(500).send("Error al obtener estados");
    }
  }


  // =============================
  // Obtener por ID
  // =============================
  static async getById(req, res) {
    const { id } = req.params;

    try {
      const estado = await EstadoModel.getById(id);

      if (!estado)
        return res.status(404).json({ message: "❌ Estado no encontrado." });

      res.json(estado);
    } catch (err) {
      console.error("❌ Error al obtener estado:", err);
      res.status(500).send("Error al obtener estado");
    }
  }


  // =============================
  // Crear
  // =============================
  static async create(req, res) {
    const { fc_nombre } = req.body;

    if (!fc_nombre)
      return res.status(400).json({ message: "⚠️ El nombre es obligatorio." });

    try {
      const nuevo = await EstadoModel.create(fc_nombre);

      res.json({
        success: true,
        message: "✅ Estado creado correctamente.",
        data: nuevo
      });

    } catch (err) {
      console.error("❌ Error al crear estado:", err);
      res.status(500).send("Error al crear estado");
    }
  }


  // =============================
  // Actualizar
  // =============================
  static async update(req, res) {
    const { id } = req.params;
    const { fc_nombre } = req.body;

    if (!fc_nombre)
      return res.status(400).json({ message: "⚠️ El nombre es obligatorio." });

    try {
      const updated = await EstadoModel.update(id, fc_nombre);

      if (!updated)
        return res.status(404).json({ message: "❌ Estado no encontrado." });

      res.json({
        success: true,
        message: "✅ Estado actualizado correctamente.",
        data: updated
      });

    } catch (err) {
      console.error("❌ Error al actualizar estado:", err);
      res.status(500).send("Error al actualizar estado");
    }
  }


  // =============================
  // Eliminar
  // =============================
  static async delete(req, res) {
    const { id } = req.params;

    try {
      const deleted = await EstadoModel.delete(id);

      if (!deleted)
        return res.status(404).json({ message: "❌ Estado no encontrado." });

      res.json({ message: "🗑️ Estado eliminado correctamente." });

    } catch (err) {
      console.error("❌ Error al eliminar estado:", err);
      res.status(500).send("Error al eliminar estado");
    }
  }

}

export default EstadoController;