import prisma from "../prisma.js";
import { serializeFlujoCaja } from "../utils/serializers.js";
import { resolverUbicacion } from "../utils/ubicacion.js";

// El flujo de caja es una bitacora de solo lectura: lista los movimientos
// registrados automaticamente por otros modulos (p. ej. pagos de ventas).
// El flujo de caja ya no se separa por ubicacion: `getAll` lista todos los
// movimientos y `getByGranja` filtra por ubicacion cuando se solicita.

class FlujoCajaController {
  static async getAll(req, res) {
    try {
      const movimientos = await prisma.flujoCaja.findMany({
        include: { ubicacion: true },
        orderBy: { fecha: "desc" },
      });
      res.json(movimientos.map(serializeFlujoCaja));
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      res.status(500).json({ error: "Error al obtener movimientos" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const ubicacion = await resolverUbicacion(req.params.granja);
      if (!ubicacion) return res.json([]);

      const movimientos = await prisma.flujoCaja.findMany({
        where: { ubicacionId: ubicacion.ubicacionId },
        include: { ubicacion: true },
        orderBy: { fecha: "desc" },
      });
      res.json(movimientos.map(serializeFlujoCaja));
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      res.status(500).json({ error: "Error al obtener movimientos" });
    }
  }
}

export default FlujoCajaController;
