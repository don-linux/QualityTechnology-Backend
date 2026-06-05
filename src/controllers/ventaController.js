import prisma from "../prisma.js";
import { serializeVenta } from "../utils/serializers.js";

class VentaController {
  static async getAll(req, res) {
    try {
      const ventas = await prisma.venta.findMany({
        include: { observacion: true },
        orderBy: [{ fecha: "desc" }, { id: "desc" }],
      });
      res.json(ventas.map(serializeVenta));
    } catch (err) {
      console.error("Error al obtener ventas:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default VentaController;
