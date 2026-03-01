import ModulosModel from "../models/moduloModel.js";

class ModulosController {

  // =============================
  // Obtener todos los módulos
  // =============================
  static async getAll(req, res) {

    try {

      const modulos = await ModulosModel.getAll();

      res.json(modulos);

    } catch (err) {

      console.error("Error al obtener módulos:", err);
      res.status(500).json({
        success: false,
        message: "Error al obtener módulos"
      });

    }

  }

  // =============================
  // Obtener por ID
  // =============================
  static async getById(req, res) {

    const { id } = req.params;

    try {

      const modulo = await ModulosModel.getById(id);

      if (!modulo) {
        return res.status(404).json({
          message: "Módulo no encontrado"
        });
      }

      res.json(modulo);

    } catch (err) {

      console.error("Error al obtener módulo:", err);
      res.status(500).json({ message: "Error al obtener módulo" });

    }

  }
  
}

export default ModulosController;