import proveedorModel from "../models/proveedorModel.js";

const REQUIRED_FIELDS = [
  "fc_razon_social",
  "fc_rfc",
  "fc_producto_servicio",
  "fi_unidad_negocio_id",
  "fc_nombre_contacto",
  "fc_telefono",
  "fc_correo",
  "fc_localidad",
  "fc_estado",
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[0-9]{1,10}$/;

function normalizeText(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function parseRequiredId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function buildProveedorPayload(body) {
  const payload = {
    fc_razon_social: normalizeText(body.fc_razon_social),
    fc_rfc: normalizeText(body.fc_rfc),
    fc_producto_servicio: normalizeText(body.fc_producto_servicio),
    fi_unidad_negocio_id: parseRequiredId(body.fi_unidad_negocio_id),
    fc_nombre_contacto: normalizeText(body.fc_nombre_contacto),
    fc_telefono: normalizeText(body.fc_telefono).replace(/\D/g, ""),
    fc_correo: normalizeText(body.fc_correo),
    fc_localidad: normalizeText(body.fc_localidad),
    fc_estado: normalizeText(body.fc_estado),
  };

  const missingField = REQUIRED_FIELDS.find((field) => !payload[field]);
  if (missingField) {
    return { error: `Campo obligatorio: ${missingField}` };
  }

  if (payload.fc_rfc.length > 20) {
    return { error: "fc_rfc debe tener máximo 20 caracteres" };
  }

  if (!PHONE_RE.test(payload.fc_telefono)) {
    return { error: "fc_telefono debe contener solo números y máximo 10 dígitos" };
  }

  if (!EMAIL_RE.test(payload.fc_correo)) {
    return { error: "fc_correo debe tener formato de correo electrónico válido" };
  }

  const unidadActiva = await proveedorModel.unidadNegocioActivaExists(payload.fi_unidad_negocio_id);
  if (!unidadActiva) {
    return { error: "fi_unidad_negocio_id debe corresponder a una unidad de negocio activa" };
  }

  return { payload };
}

class ProveedorController {
  static async getAll(req, res) {
    try {
      const proveedores = await proveedorModel.getAll();
      res.json(proveedores);
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      res.status(500).json({ error: "Error al obtener proveedores" });
    }
  }

  static async create(req, res) {
    try {
      const { error, payload } = await buildProveedorPayload(req.body);
      if (error) return res.status(400).json({ error });

      const proveedor = await proveedorModel.create(payload);
      res.status(201).json(proveedor);
    } catch (err) {
      console.error("Error al crear proveedor:", err);
      res.status(500).json({ error: "Error al crear proveedor" });
    }
  }

  static async update(req, res) {
    try {
      const id = parseRequiredId(req.params.id);
      if (!id) return res.status(400).json({ error: "ID de proveedor inválido" });

      const { error, payload } = await buildProveedorPayload(req.body);
      if (error) return res.status(400).json({ error });

      const proveedor = await proveedorModel.update(id, payload);
      if (!proveedor) return res.status(404).json({ error: "Proveedor no encontrado" });

      res.json(proveedor);
    } catch (err) {
      console.error("Error al actualizar proveedor:", err);
      res.status(500).json({ error: "Error al actualizar proveedor" });
    }
  }

  static async delete(req, res) {
    try {
      const id = parseRequiredId(req.params.id);
      if (!id) return res.status(400).json({ error: "ID de proveedor inválido" });

      const deleted = await proveedorModel.delete(id);
      if (!deleted) return res.status(404).json({ error: "Proveedor no encontrado" });

      res.sendStatus(204);
    } catch (err) {
      console.error("Error al eliminar proveedor:", err);
      res.status(500).json({ error: "Error al eliminar proveedor" });
    }
  }
}

export default ProveedorController;
