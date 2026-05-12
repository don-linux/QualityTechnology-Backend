import prisma from "../prisma.js";
import { serializeModulo } from "../utils/serializers.js";

class ModulosController {
  static async getAll(req, res) {
    try {
      const modulos = await prisma.modulo.findMany({ orderBy: { nombre: "asc" } });
      res.json(modulos.map(serializeModulo));
    } catch (err) {
      console.error("Error al obtener modulos:", err);
      res.status(500).json({ success: false, message: "Error al obtener modulos" });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const modulo = await prisma.modulo.findUnique({ where: { moduloId: Number(id) } });
      if (!modulo) {
        return res.status(404).json({ message: "Modulo no encontrado" });
      }
      res.json(serializeModulo(modulo));
    } catch (err) {
      console.error("Error al obtener modulo:", err);
      res.status(500).json({ message: "Error al obtener modulo" });
    }
  }
}

export default ModulosController;
