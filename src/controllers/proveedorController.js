import prisma from "../prisma.js";
import { serializeProveedor } from "../utils/serializers.js";

// Proveedor en el schema actual conserva: nombre, rfc, telefono, email,
// direccion, esta_activo. Los campos antiguos (razon_social,
// producto_servicio, unidad_negocio_id, contactos, localidad, estado) ya no
// existen y se ignoran. Aceptamos los aliases fc_razon_social -> nombre y
// fc_correo -> email.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function normalizeText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function parseRequiredId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function buildPayload(body) {
  const nombre = normalizeText(pick(body, "nombre", "fc_razon_social"));
  const rfc = normalizeText(pick(body, "rfc", "fc_rfc") ?? "");
  const telefono = normalizeText(pick(body, "telefono", "fc_telefono") ?? "");
  const email = normalizeText(pick(body, "email", "correo", "fc_correo") ?? "");
  const direccion = normalizeText(pick(body, "direccion", "fc_direccion", "fc_localidad") ?? "");

  if (!nombre) return { error: "Campo obligatorio: nombre" };
  if (rfc && rfc.length > 13) return { error: "rfc debe tener maximo 13 caracteres" };
  if (email && !EMAIL_RE.test(email)) {
    return { error: "email debe tener formato de correo electronico valido" };
  }

  return {
    payload: {
      nombre,
      rfc: rfc || null,
      telefono: telefono || null,
      email: email || null,
      direccion: direccion || null,
    },
  };
}

class ProveedorController {
  static async getAll(req, res) {
    try {
      const proveedores = await prisma.proveedor.findMany({
        orderBy: [{ nombre: "asc" }, { id: "asc" }],
      });
      res.json(proveedores.map(serializeProveedor));
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      res.status(500).json({ error: "Error al obtener proveedores" });
    }
  }

  static async create(req, res) {
    try {
      const { error, payload } = buildPayload(req.body);
      if (error) return res.status(400).json({ error });

      const proveedor = await prisma.proveedor.create({ data: payload });
      res.status(201).json(serializeProveedor(proveedor));
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      res.status(500).json({ error: "Error al crear proveedor" });
    }
  }

  static async update(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID de proveedor invalido" });

    try {
      const { error, payload } = buildPayload(req.body);
      if (error) return res.status(400).json({ error });

      const proveedor = await prisma.proveedor.update({
        where: { id },
        data: { ...payload, updatedAt: new Date() },
      });
      res.json(serializeProveedor(proveedor));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Proveedor no encontrado" });
      console.error("Error al actualizar proveedor:", err);
      res.status(500).json({ error: "Error al actualizar proveedor" });
    }
  }

  static async activate(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID de proveedor invalido" });

    try {
      const proveedor = await prisma.proveedor.update({
        where: { id },
        data: { esta_activo: true, updatedAt: new Date() },
      });
      res.json({ mensaje: "Proveedor activado correctamente", proveedor: serializeProveedor(proveedor) });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Proveedor no encontrado" });
      console.error("Error al activar proveedor:", err);
      res.status(500).json({ error: "Error al activar proveedor" });
    }
  }

  static async deactivate(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID de proveedor invalido" });

    try {
      const proveedor = await prisma.proveedor.update({
        where: { id },
        data: { esta_activo: false, updatedAt: new Date() },
      });
      res.json({ mensaje: "Proveedor desactivado correctamente", proveedor: serializeProveedor(proveedor) });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Proveedor no encontrado" });
      console.error("Error al desactivar proveedor:", err);
      res.status(500).json({ error: "Error al desactivar proveedor" });
    }
  }
}

export default ProveedorController;
