import prisma from "../prisma.js";
import { serializeRol } from "../utils/serializers.js";

class RolController {
  static async getAll(req, res) {
    try {
      const roles = await prisma.rol.findMany({ orderBy: { nombre: "asc" } });
      res.json(roles.map(serializeRol));
    } catch (err) {
      console.error("Error al obtener roles:", err);
      res.status(500).json({ error: "Error al obtener roles" });
    }
  }

  static async create(req, res) {
    try {
      const { nombre, es_root } = req.body;
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({ error: "El nombre es obligatorio" });
      }
      const rol = await prisma.rol.create({
        data: { nombre: nombre.trim(), esRoot: Boolean(es_root) },
      });
      res.status(201).json(serializeRol(rol));
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un rol con ese nombre" });
      }
      console.error("Error al insertar rol:", err);
      res.status(500).json({ error: "Error al insertar rol" });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre, es_root } = req.body;
      const rol = await prisma.rol.update({
        where: { id: Number(id) },
        data: {
          ...(nombre !== undefined ? { nombre: String(nombre).trim() } : {}),
          ...(es_root !== undefined ? { esRoot: Boolean(es_root) } : {}),
        },
      });
      res.json(serializeRol(rol));
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un rol con ese nombre" });
      }
      console.error("Error al actualizar rol:", err);
      res.status(500).json({ error: "Error al actualizar rol" });
    }
  }

  static async activate(req, res) {
    try {
      const { id } = req.params;
      const rol = await prisma.rol.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
      });
      res.json({ mensaje: "Rol activado correctamente", rol: serializeRol(rol) });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      console.error("Error al activar rol:", err);
      res.status(500).json({ error: "Error al activar rol" });
    }
  }

  static async deactivate(req, res) {
    try {
      const rolId = Number(req.params.id);
      const rol = await prisma.rol.findUnique({ where: { id: rolId } });
      if (!rol) {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      if (rol.esRoot) {
        return res.status(400).json({ error: "No se puede desactivar un rol root" });
      }
      const actualizado = await prisma.rol.update({
        where: { id: rolId },
        data: { esta_activo: false },
      });
      res.json({ mensaje: "Rol desactivado correctamente", rol: serializeRol(actualizado) });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      console.error("Error al desactivar rol:", err);
      res.status(500).json({ error: "Error al desactivar rol" });
    }
  }
}

export default RolController;
