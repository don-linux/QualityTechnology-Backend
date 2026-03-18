import tesoreriaModel from "../models/tesoreriaModel.js";

class TesoreriaController {
  static async getOverview(req, res) {
    try {
      const filters = req.query;
      const datos = await tesoreriaModel.getOverview(filters);
      res.json(datos);
    } catch (err) {
      console.error("Error al obtener datos de tesoreria:", err);
      res.status(500).json({ error: "Error al obtener datos de tesoreria" });
    }
  }
}

export default TesoreriaController;
