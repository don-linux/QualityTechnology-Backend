import prisma from "../prisma.js";
import { serializeTipoInfraestructuraFisica } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre;
}

class TipoInfraestructuraFisicaController {
  static async getAll(req, res) {
    try {
      const items = await prisma.tipoInfraestructuraFisica.findMany({
        orderBy: { id: "desc" },
      });
      res.json(items.map(serializeTipoInfraestructuraFisica));
    } catch (err) {
      console.error("Error al obtener tipos de infraestructura física:", err);
      res.status(500).json({ error: "Error al obtener tipos de infraestructura física" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.tipoInfraestructuraFisica.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeTipoInfraestructuraFisica));
    } catch (err) {
      console.error("Error al obtener tipos de infraestructura física activos:", err);
      res.status(500).json({ error: "Error al obtener tipos de infraestructura física activos" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.tipoInfraestructuraFisica.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Tipo de infraestructura física creado correctamente",
        tipo_infraestructura_fisica: serializeTipoInfraestructuraFisica(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un tipo de infraestructura física con ese nombre" });
      }
      console.error("Error al crear tipo de infraestructura física:", err);
      res.status(500).json({ error: "Error al crear tipo de infraestructura física" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.tipoInfraestructuraFisica.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "tipo de infraestructura física actualizado correctamente",
        tipo_infraestructura_fisica: serializeTipoInfraestructuraFisica(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "tipo de infraestructura física no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un tipo de infraestructura física con ese nombre" });
      }
      console.error("Error al actualizar tipo de infraestructura física:", err);
      res.status(500).json({ error: "Error al actualizar tipo de infraestructura física" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.tipoInfraestructuraFisica.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "tipo de infraestructura física activado correctamente",
        tipo_infraestructura_fisica: serializeTipoInfraestructuraFisica(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "tipo de infraestructura física no encontrado" });
      }
      console.error("Error al activar tipo de infraestructura física:", err);
      res.status(500).json({ error: "Error al activar tipo de infraestructura física" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.tipoInfraestructuraFisica.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "tipo de infraestructura física desactivado correctamente",
        tipo_infraestructura_fisica: serializeTipoInfraestructuraFisica(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "tipo de infraestructura física no encontrado" });
      }
      console.error("Error al desactivar tipo de infraestructura física:", err);
      res.status(500).json({ error: "Error al desactivar tipo de infraestructura física" });
    }
  }
}

export default TipoInfraestructuraFisicaController;
