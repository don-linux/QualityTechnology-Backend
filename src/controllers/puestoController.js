import prisma from "../prisma.js";
import { serializePuesto } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre ?? body.fc_nombre;
}

class PuestoController {
  static async getAll(req, res) {
    try {
      const puestos = await prisma.puesto.findMany({
        orderBy: { id: "desc" },
      });
      res.json(puestos.map(serializePuesto));
    } catch (err) {
      console.error("Error al obtener puestos:", err);
      res.status(500).json({ error: "Error al obtener puestos" });
    }
  }

  static async getActivos(req, res) {
    try {
      const puestos = await prisma.puesto.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(puestos.map(serializePuesto));
    } catch (err) {
      console.error("Error al obtener puestos activos:", err);
      res.status(500).json({ error: "Error al obtener puestos" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const puesto = await prisma.puesto.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Puesto creado correctamente",
        puesto: serializePuesto(puesto),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un puesto con ese nombre" });
      }
      console.error("Error al crear puesto:", err);
      res.status(500).json({ error: "Error al crear puesto" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const puesto = await prisma.puesto.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Puesto actualizado correctamente",
        puesto: serializePuesto(puesto),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Puesto no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un puesto con ese nombre" });
      }
      console.error("Error al actualizar puesto:", err);
      res.status(500).json({ error: "Error al actualizar puesto" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const puesto = await prisma.puesto.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Puesto activado correctamente",
        puesto: serializePuesto(puesto),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Puesto no encontrado" });
      }
      console.error("Error al activar puesto:", err);
      res.status(500).json({ error: "Error al activar puesto" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const puesto = await prisma.puesto.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Puesto desactivado correctamente",
        puesto: serializePuesto(puesto),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Puesto no encontrado" });
      }
      console.error("Error al desactivar puesto:", err);
      res.status(500).json({ error: "Error al desactivar puesto" });
    }
  }
}

export default PuestoController;
