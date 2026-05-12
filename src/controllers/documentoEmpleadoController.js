import path from "node:path";
import fs from "node:fs";
import prisma from "../prisma.js";
import { serializeDocumentoEmpleado } from "../utils/serializers.js";

const tipoDocumentoInclude = { tipoDocumento: true };

function getFilePath(doc) {
  return path.resolve("." + doc.rutaArchivo);
}

function sendInlineFile(res, doc) {
  const filePath = getFilePath(doc);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado en disco" });
  }
  const safeName = encodeURIComponent(doc.nombreOriginal);
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${safeName}`);
  return res.sendFile(filePath);
}

function deletePhysicalFile(doc) {
  const filePath = getFilePath(doc);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function getEmpleadoIdByUsuario(usuarioId) {
  const empleado = await prisma.empleado.findFirst({
    where: { usuarioId: Number(usuarioId) },
    select: { empleadoId: true },
  });
  return empleado?.empleadoId ?? null;
}

async function upsertDocumento({ empleadoId, tipoDocumentoId, rutaArchivo, nombreOriginal }) {
  return prisma.documentoEmpleado.upsert({
    where: {
      empleadoId_tipoDocumentoId: {
        empleadoId: Number(empleadoId),
        tipoDocumentoId: Number(tipoDocumentoId),
      },
    },
    create: {
      empleadoId: Number(empleadoId),
      tipoDocumentoId: Number(tipoDocumentoId),
      rutaArchivo,
      nombreOriginal,
    },
    update: {
      rutaArchivo,
      nombreOriginal,
      fechaCarga: new Date(),
    },
    include: tipoDocumentoInclude,
  });
}

class DocumentoEmpleadoController {
  static async getByEmpleado(req, res) {
    const { empleadoId } = req.params;
    try {
      const documentos = await prisma.documentoEmpleado.findMany({
        where: { empleadoId: Number(empleadoId) },
        include: tipoDocumentoInclude,
        orderBy: { tipoDocumento: { nombre: "asc" } },
      });
      res.json(documentos.map(serializeDocumentoEmpleado));
    } catch (err) {
      console.error("Error al obtener documentos:", err);
      res.status(500).json({ error: "Error al obtener documentos" });
    }
  }

  static async upload(req, res) {
    const { empleadoId } = req.params;
    const tipoDocumentoId = req.body.tipo_documento_id ?? req.body.fi_tipo_documento_id;

    if (!req.file) {
      return res.status(400).json({ error: "No se proporciono archivo" });
    }
    if (!tipoDocumentoId) {
      return res.status(400).json({ error: "tipo_documento_id es obligatorio" });
    }

    try {
      const rutaArchivo = `/uploads/expedientes/${empleadoId}/${req.file.filename}`;
      const documento = await upsertDocumento({
        empleadoId,
        tipoDocumentoId,
        rutaArchivo,
        nombreOriginal: req.file.originalname,
      });
      res.status(201).json({
        mensaje: "Documento subido correctamente",
        documento: serializeDocumentoEmpleado(documento),
      });
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Empleado o tipo de documento invalido" });
      }
      console.error("Error al subir documento:", err);
      res.status(500).json({ error: "Error al subir documento" });
    }
  }

  static async download(req, res) {
    const { documentoId } = req.params;
    try {
      const doc = await prisma.documentoEmpleado.findUnique({
        where: { documentoId: Number(documentoId) },
      });
      if (!doc) return res.status(404).json({ error: "Documento no encontrado" });

      const filePath = getFilePath(doc);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo no encontrado en disco" });
      }
      res.download(filePath, doc.nombreOriginal);
    } catch (err) {
      console.error("Error al descargar documento:", err);
      res.status(500).json({ error: "Error al descargar documento" });
    }
  }

  static async view(req, res) {
    const { documentoId } = req.params;
    try {
      const doc = await prisma.documentoEmpleado.findUnique({
        where: { documentoId: Number(documentoId) },
      });
      if (!doc) return res.status(404).json({ error: "Documento no encontrado" });
      return sendInlineFile(res, doc);
    } catch (err) {
      console.error("Error al visualizar documento:", err);
      res.status(500).json({ error: "Error al visualizar documento" });
    }
  }

  static async delete(req, res) {
    const { documentoId } = req.params;
    try {
      const doc = await prisma.documentoEmpleado.delete({
        where: { documentoId: Number(documentoId) },
      });
      deletePhysicalFile(doc);
      res.json({ mensaje: "Documento eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Documento no encontrado" });
      }
      console.error("Error al eliminar documento:", err);
      res.status(500).json({ error: "Error al eliminar documento" });
    }
  }

  static async getMisDocumentos(req, res) {
    try {
      const empleadoId = await getEmpleadoIdByUsuario(req.user.usuario_id);
      if (!empleadoId) {
        return res.status(404).json({ error: "No se encontro perfil de empleado vinculado" });
      }
      const documentos = await prisma.documentoEmpleado.findMany({
        where: { empleadoId },
        include: tipoDocumentoInclude,
        orderBy: { tipoDocumento: { nombre: "asc" } },
      });
      res.json(documentos.map(serializeDocumentoEmpleado));
    } catch (err) {
      console.error("Error al obtener mis documentos:", err);
      res.status(500).json({ error: "Error al obtener documentos" });
    }
  }

  static async uploadMiDocumento(req, res) {
    const tipoDocumentoId = req.body.tipo_documento_id ?? req.body.fi_tipo_documento_id;

    if (!req.file) {
      return res.status(400).json({ error: "No se proporciono archivo" });
    }
    if (!tipoDocumentoId) {
      return res.status(400).json({ error: "tipo_documento_id es obligatorio" });
    }

    try {
      const empleadoId = await getEmpleadoIdByUsuario(req.user.usuario_id);
      if (!empleadoId) {
        return res.status(404).json({ error: "No se encontro perfil de empleado vinculado" });
      }

      const rutaArchivo = `/uploads/expedientes/${empleadoId}/${req.file.filename}`;
      const documento = await upsertDocumento({
        empleadoId,
        tipoDocumentoId,
        rutaArchivo,
        nombreOriginal: req.file.originalname,
      });
      res.status(201).json({
        mensaje: "Documento subido correctamente",
        documento: serializeDocumentoEmpleado(documento),
      });
    } catch (err) {
      console.error("Error al subir mi documento:", err);
      res.status(500).json({ error: "Error al subir documento" });
    }
  }

  static async viewMiDocumento(req, res) {
    const { documentoId } = req.params;
    try {
      const doc = await prisma.documentoEmpleado.findFirst({
        where: {
          documentoId: Number(documentoId),
          empleado: { usuarioId: Number(req.user.usuario_id) },
        },
      });
      if (!doc) return res.status(404).json({ error: "Documento no encontrado" });
      return sendInlineFile(res, doc);
    } catch (err) {
      console.error("Error al visualizar mi documento:", err);
      res.status(500).json({ error: "Error al visualizar documento" });
    }
  }

  static async downloadMiDocumento(req, res) {
    const { documentoId } = req.params;
    try {
      const doc = await prisma.documentoEmpleado.findFirst({
        where: {
          documentoId: Number(documentoId),
          empleado: { usuarioId: Number(req.user.usuario_id) },
        },
      });
      if (!doc) return res.status(404).json({ error: "Documento no encontrado" });

      const filePath = getFilePath(doc);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Archivo no encontrado en disco" });
      }
      res.download(filePath, doc.nombreOriginal);
    } catch (err) {
      console.error("Error al descargar mi documento:", err);
      res.status(500).json({ error: "Error al descargar documento" });
    }
  }

  static async deleteMiDocumento(req, res) {
    const { documentoId } = req.params;
    try {
      const doc = await prisma.documentoEmpleado.findFirst({
        where: {
          documentoId: Number(documentoId),
          empleado: { usuarioId: Number(req.user.usuario_id) },
        },
      });
      if (!doc) return res.status(404).json({ error: "Documento no encontrado" });

      await prisma.documentoEmpleado.delete({ where: { documentoId: doc.documentoId } });
      deletePhysicalFile(doc);
      res.json({ mensaje: "Documento eliminado correctamente" });
    } catch (err) {
      console.error("Error al eliminar mi documento:", err);
      res.status(500).json({ error: "Error al eliminar documento" });
    }
  }
}

export default DocumentoEmpleadoController;
