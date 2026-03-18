import movimientoAModel from "../models/movimientoAModel.js";

class MovimientoAController {
  static async getAll(req, res) {
    try {
      const movimientos = await movimientoAModel.getAll();
      res.json(movimientos);
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      res.status(500).json({ error: "Error al obtener movimientos" });
    }
  }

  static async create(req, res) {
    try {
      const movimiento = await movimientoAModel.create(req.body);
      res.status(201).json(movimiento);
    } catch (err) {
      console.error("Error al insertar movimiento:", err);
      res.status(500).json({ error: "Error al insertar movimiento" });
    }
  }

  static async update(req, res) {
    try {
      const movimiento = await movimientoAModel.update(req.params.id, req.body);
      if (!movimiento) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }
      res.json(movimiento);
    } catch (err) {
      console.error("Error al actualizar movimiento:", err);
      res.status(500).json({ error: "Error al actualizar movimiento" });
    }
  }

  static async delete(req, res) {
    try {
      const count = await movimientoAModel.delete(req.params.id);
      if (count === 0) {
        return res.status(404).json({ error: "Movimiento no encontrado" });
      }
      res.sendStatus(204);
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      res.status(500).json({ error: "Error al eliminar movimiento" });
    }
  }
}

export default MovimientoAController;
