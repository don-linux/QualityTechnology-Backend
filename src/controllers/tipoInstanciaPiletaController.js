import prisma from "../prisma.js";
import { serializeTipoInstanciaPileta } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre ?? body.fc_nombre;
}

class TipoInstanciaPiletaController {
  static async getAll(req, res) {
    try {
      const items = await prisma.tipoInstanciaPileta.findMany({
        orderBy: { id: "asc" },
      });
      res.json(items.map(serializeTipoInstanciaPileta));
    } catch (err) {
      console.error("Error al obtener tipos de instancia:", err);
      res.status(500).json({ error: "Error al obtener tipos de instancia" });
    }
  }

  static async getActivos(req, res) {
    try {
      const items = await prisma.tipoInstanciaPileta.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(items.map(serializeTipoInstanciaPileta));
    } catch (err) {
      console.error("Error al obtener tipos de instancia activos:", err);
      res.status(500).json({ error: "Error al obtener tipos de instancia activos" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.tipoInstanciaPileta.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Tipo de instancia creado correctamente",
        tipo_instancia_pileta: serializeTipoInstanciaPileta(item),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un tipo de instancia con ese nombre" });
      }
      console.error("Error al crear tipo de instancia:", err);
      res.status(500).json({ error: "Error al crear tipo de instancia" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const item = await prisma.tipoInstanciaPileta.update({
        where: { id: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Tipo de instancia actualizado correctamente",
        tipo_instancia_pileta: serializeTipoInstanciaPileta(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Tipo de instancia no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un tipo de instancia con ese nombre" });
      }
      console.error("Error al actualizar tipo de instancia:", err);
      res.status(500).json({ error: "Error al actualizar tipo de instancia" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.tipoInstanciaPileta.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({
        mensaje: "Tipo de instancia activado correctamente",
        tipo_instancia_pileta: serializeTipoInstanciaPileta(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Tipo de instancia no encontrado" });
      }
      console.error("Error al activar tipo de instancia:", err);
      res.status(500).json({ error: "Error al activar tipo de instancia" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const item = await prisma.tipoInstanciaPileta.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
      });
      res.json({
        mensaje: "Tipo de instancia desactivado correctamente",
        tipo_instancia_pileta: serializeTipoInstanciaPileta(item),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Tipo de instancia no encontrado" });
      }
      console.error("Error al desactivar tipo de instancia:", err);
      res.status(500).json({ error: "Error al desactivar tipo de instancia" });
    }
  }
}

export default TipoInstanciaPiletaController;
