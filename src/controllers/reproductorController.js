import reproductorModel from "../models/reproductorModel.js";

class ReproductorController {
  static async getMovimientos(req, res) {
    try {
      const movimientos = await reproductorModel.getMovimientos(req.params.granja);
      res.json(movimientos);
    } catch (err) {
      console.error("Error trazabilidad:", err);
      res.status(500).json({ error: "Error al obtener trazabilidad" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const reproductores = await reproductorModel.getByGranja(req.params.granja);
      res.json(reproductores);
    } catch (err) {
      console.error("Error reproductores:", err);
      res.status(500).json({ error: "Error al obtener reproductores" });
    }
  }

  static async getInstalaciones(req, res) {
    try {
      const instalaciones = await reproductorModel.getInstalaciones(req.params.granja);
      res.json(instalaciones);
    } catch (err) {
      console.error("Error instalaciones:", err);
      res.status(500).json({ error: "Error obteniendo instalaciones" });
    }
  }

  static async create(req, res) {
    try {
      const { origen_texto } = req.body;
      if (!origen_texto || origen_texto.trim() === "") {
        return res.status(400).json({
          error: "Debe especificar el origen del reproductor",
        });
      }

      await reproductorModel.create(req.body);
      res.json({
        success: true,
        mensaje: "Reproductor y trazabilidad registrados correctamente",
      });
    } catch (err) {
      console.error("Error registrar reproductor:", err);
      res.status(500).json({ error: "Error al registrar reproductor" });
    }
  }

  static async update(req, res) {
    try {
      await reproductorModel.update(req.params.id, req.body);
      res.json({
        success: true,
        mensaje: "Reproductor actualizado y trazabilidad registrada",
      });
    } catch (err) {
      console.error("Error actualizar reproductor:", err);
      res.status(500).json({ error: "Error al actualizar reproductor" });
    }
  }

  static async delete(req, res) {
    try {
      await reproductorModel.delete(req.params.id);
      res.json({ success: true, mensaje: "Reproductor eliminado" });
    } catch (err) {
      console.error("Error eliminar:", err);
      res.status(500).json({ error: "Error al eliminar reproductor" });
    }
  }
}

export default ReproductorController;
