import prisma from "../prisma.js";
import { serializeTipoDocumento } from "../utils/serializers.js";

function getNombre(body) {
  return body.nombre ?? body.fc_nombre;
}
function getActivo(body) {
  return body.activo ?? body.fb_activo;
}

class TipoDocumentoController {
  static async getAll(req, res) {
    try {
      const tipos = await prisma.tipoDocumento.findMany({
        orderBy: { id: "asc" },
      });
      res.json(tipos.map(serializeTipoDocumento));
    } catch (err) {
      console.error("Error al obtener tipos de documento:", err);
      res.status(500).json({ error: "Error al obtener tipos de documento" });
    }
  }

  static async getActivos(req, res) {
    try {
      const tipos = await prisma.tipoDocumento.findMany({
        where: { esta_activo: true },
        orderBy: { nombre: "asc" },
      });
      res.json(tipos.map(serializeTipoDocumento));
    } catch (err) {
      console.error("Error al obtener tipos de documento activos:", err);
      res.status(500).json({ error: "Error al obtener tipos de documento" });
    }
  }

  static async create(req, res) {
    const nombre = getNombre(req.body);
    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    try {
      const tipo = await prisma.tipoDocumento.create({
        data: { nombre: String(nombre).trim() },
      });
      res.status(201).json({
        mensaje: "Tipo de documento creado correctamente",
        tipo: serializeTipoDocumento(tipo),
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un tipo de documento con ese nombre" });
      }
      console.error("Error al crear tipo de documento:", err);
      res.status(500).json({ error: "Error al crear tipo de documento" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const nombre = getNombre(req.body);
    const activo = getActivo(req.body);

    if (!nombre || !String(nombre).trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    try {
      const tipo = await prisma.tipoDocumento.update({
        where: { id: Number(id) },
        data: {
          nombre: String(nombre).trim(),
          ...(activo !== undefined ? { esta_activo: Boolean(activo) } : {}),
        },
      });
      res.json({
        mensaje: "Tipo de documento actualizado correctamente",
        tipo: serializeTipoDocumento(tipo),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Tipo de documento no encontrado" });
      }
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Ya existe un tipo de documento con ese nombre" });
      }
      console.error("Error al actualizar tipo de documento:", err);
      res.status(500).json({ error: "Error al actualizar tipo de documento" });
    }
  }
}

export default TipoDocumentoController;
