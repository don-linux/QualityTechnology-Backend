import engordaModel from "../models/engordaModel.js";

const MAX_OBSERVACION = 500;

class EngordaController {
  static async getByGranja(req, res) {
    try {
      const granja = req.params.granja;
      const inventario = await engordaModel.getByGranja(granja);
      res.json(inventario);
    } catch (err) {
      console.error("Error al obtener inventario de Engorda:", err);
      res.status(500).json({ error: "Error al obtener inventario de Engorda" });
    }
  }

  static async create(req, res) {
    try {
      const { observacion } = req.body;
      if (observacion && observacion.length > MAX_OBSERVACION) {
        return res.status(400).json({
          error: `La observación no puede superar los ${MAX_OBSERVACION} caracteres.`,
        });
      }

      const { fi_usuario_id, ...rest } = req.body;
      const body = {
        ...rest,
        fc_granja: req.body.fc_granja,
        fi_usuario_id: req.user.usuario_id,
      };
      const result = await engordaModel.createOrUpdate(body);

      if (result.updated) {
        return res.json({ mensaje: "Engorda actualizada correctamente." });
      }

      res.json({ mensaje: "Engorda registrada con exito" });
    } catch (err) {
      console.error("Error al registrar engorda:", err);
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const count = await engordaModel.delete(req.params.id);
      if (count === 0) {
        return res.status(404).json({ error: "Registro no encontrado." });
      }
      res.json({ mensaje: "Registro eliminado correctamente." });
    } catch (err) {
      console.error("Error al eliminar:", err);
      res.status(500).json({ error: "Error eliminando registro de Engorda" });
    }
  }

  static async getMovimientos(req, res) {
    try {
      const movimientos = await engordaModel.getMovimientos(req.params.usuario);
      res.json(movimientos);
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      res.status(500).json({ error: "Error al obtener movimientos de Engorda" });
    }
  }

  static async deleteMovimiento(req, res) {
    try {
      const count = await engordaModel.deleteMovimiento(req.params.id);
      if (count === 0) {
        return res.status(404).json({ error: "Movimiento no encontrado." });
      }
      res.json({ mensaje: "Movimiento eliminado correctamente." });
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      res.status(500).json({ error: "Error eliminando movimiento de Engorda" });
    }
  }
}

export default EngordaController;
