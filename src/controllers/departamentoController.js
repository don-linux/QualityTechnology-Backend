import prisma from "../prisma.js";
import { serializeDepartamento } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre ?? body.fc_nombre;
}

class DepartamentoController {
  static async getAll(req, res) {
    try {
      const departamentos = await prisma.departamento.findMany({
        orderBy: { departamentoId: "asc" },
      });
      res.json(departamentos.map(serializeDepartamento));
    } catch (err) {
      console.error("Error al obtener departamentos:", err);
      res.status(500).json({ error: "Error al obtener departamentos" });
    }
  }

  static async getActivos(req, res) {
    try {
      const departamentos = await prisma.departamento.findMany({
        where: { activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(departamentos.map(serializeDepartamento));
    } catch (err) {
      console.error("Error al obtener departamentos activos:", err);
      res.status(500).json({ error: "Error al obtener departamentos" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const departamento = await prisma.departamento.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Departamento creado correctamente",
        departamento: serializeDepartamento(departamento),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un departamento con ese nombre" });
      }
      console.error("Error al crear departamento:", err);
      res.status(500).json({ error: "Error al crear departamento" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const departamento = await prisma.departamento.update({
        where: { departamentoId: Number(id) },
        data: { nombre: String(nombre).trim() },
      });
      res.json({
        mensaje: "Departamento actualizado correctamente",
        departamento: serializeDepartamento(departamento),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Departamento no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un departamento con ese nombre" });
      }
      console.error("Error al actualizar departamento:", err);
      res.status(500).json({ error: "Error al actualizar departamento" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const departamento = await prisma.departamento.update({
        where: { departamentoId: Number(id) },
        data: { activo: true },
      });
      res.json({
        mensaje: "Departamento activado correctamente",
        departamento: serializeDepartamento(departamento),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Departamento no encontrado" });
      }
      console.error("Error al activar departamento:", err);
      res.status(500).json({ error: "Error al activar departamento" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;
    try {
      const departamento = await prisma.departamento.update({
        where: { departamentoId: Number(id) },
        data: { activo: false },
      });
      res.json({
        mensaje: "Departamento desactivado correctamente",
        departamento: serializeDepartamento(departamento),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Departamento no encontrado" });
      }
      console.error("Error al desactivar departamento:", err);
      res.status(500).json({ error: "Error al desactivar departamento" });
    }
  }
}

export default DepartamentoController;
