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
        where: { rolId: Number(id) },
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

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await prisma.rol.delete({ where: { rolId: Number(id) } });
      res.sendStatus(204);
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Rol no encontrado" });
      }
      if (err.code === "P2003") {
        return res.status(409).json({ error: "No se puede eliminar el rol porque tiene usuarios asociados" });
      }
      console.error("Error al eliminar rol:", err);
      res.status(500).json({ error: "Error al eliminar rol" });
    }
  }
}

export default RolController;
