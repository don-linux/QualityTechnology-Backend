import prisma from "../prisma.js";
import { serializeProveedor } from "../utils/serializers.js";
import { normalizeTextoCampo } from "../utils/formatosTexto.js";

// Proveedor en el schema actual conserva: nombre, rfc, telefono, email,
// direccion, esta_activo. Los campos antiguos (razon_social,
// producto_servicio, unidad_negocio_id, contactos, localidad, estado) ya no
// existen y se ignoran. Aceptamos los aliases fc_razon_social -> nombre y
// fc_correo -> email.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function normalizeText(value, fieldName) {
  return normalizeTextoCampo(value, fieldName);
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
  const nombre = normalizeText(pick(body, "nombre", "fc_razon_social"), "fc_razon_social");
  const rfc = normalizeText(pick(body, "rfc", "fc_rfc") ?? "", "fc_rfc");
  const telefono = normalizeText(pick(body, "telefono", "fc_telefono") ?? "", "fc_telefono");
  const email = normalizeText(pick(body, "email", "correo", "fc_correo") ?? "", "fc_correo");
  const direccion = normalizeText(pick(body, "direccion", "fc_direccion", "fc_localidad") ?? "", "fc_direccion");

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

  static async delete(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "ID de proveedor invalido" });

    try {
      await prisma.proveedor.delete({ where: { id } });
      res.sendStatus(204);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Proveedor no encontrado" });
      console.error("Error al eliminar proveedor:", err);
      res.status(500).json({ error: "Error al eliminar proveedor" });
    }
  }
}

export default ProveedorController;
