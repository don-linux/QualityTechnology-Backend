import prisma from "../prisma.js";
import { serializeBitacoraMantenimientoEquipo } from "../utils/serializers.js";

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateForFolio(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

async function generateFolio(fechaMantenimiento) {
  const count = await prisma.bitacoraMantenimientoEquipo.count({
    where: { fechaMantenimiento },
  });
  const nnn = String(count + 1).padStart(3, "0");
  return `MAN-${formatDateForFolio(fechaMantenimiento)}-${nnn}`;
}

class MantenimientoEquipoHerramientasController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.bitacoraMantenimientoEquipo.findMany({
        orderBy: { fechaMantenimiento: "desc" },
      });
      res.json(rows.map(serializeBitacoraMantenimientoEquipo));
    } catch (err) {
      console.error("Error en GET /mantenimiento-equipo-herramientas:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const fechaMantenimiento = toDateOrNull(req.body.fecha_mantenimiento);
      if (!fechaMantenimiento) {
        return res.status(400).json({ error: "fecha_mantenimiento es requerida" });
      }

      const folio = await generateFolio(fechaMantenimiento);
      const creado = await prisma.bitacoraMantenimientoEquipo.create({
        data: {
          folio,
          fechaMantenimiento,
          usuarioId: req.user.usuario_id,
        },
      });

      res.status(201).json(serializeBitacoraMantenimientoEquipo(creado));
    } catch (err) {
      console.error("Error en POST /mantenimiento-equipo-herramientas:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ error: "id invalido" });
      }

      const existing = await prisma.bitacoraMantenimientoEquipo.findUnique({
        where: { id },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const fechaMantenimiento = toDateOrNull(req.body.fecha_mantenimiento);
      if (!fechaMantenimiento) {
        return res.status(400).json({ error: "fecha_mantenimiento es requerida" });
      }

      const updateData = { fechaMantenimiento };
      if (
        existing.fechaMantenimiento.toISOString().slice(0, 10) !==
        fechaMantenimiento.toISOString().slice(0, 10)
      ) {
        updateData.folio = await generateFolio(fechaMantenimiento);
      }

      const actualizado = await prisma.bitacoraMantenimientoEquipo.update({
        where: { id },
        data: updateData,
      });

      res.json(serializeBitacoraMantenimientoEquipo(actualizado));
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("Error en PUT /mantenimiento-equipo-herramientas:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default MantenimientoEquipoHerramientasController;
