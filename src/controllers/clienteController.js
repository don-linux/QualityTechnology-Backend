import clienteModel from "../models/clienteModel.js";

const REQUIRED_FIELDS = [
  "fc_razon_social",
  "fc_rfc",
  "fi_unidad_negocio_id",
  "fc_nombre_contacto",
  "fc_telefono",
  "fc_correo",
  "fc_localidad",
  "fc_estado",
  "fi_ejecutivo_empleado_id",
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

async function buildClientePayload(body, usuarioId) {
  const payload = {
    fc_razon_social: normalizeText(body.fc_razon_social),
    fc_rfc: normalizeText(body.fc_rfc),
    fi_unidad_negocio_id: parseRequiredId(body.fi_unidad_negocio_id),
    fc_nombre_contacto: normalizeText(body.fc_nombre_contacto),
    fc_telefono: normalizeText(body.fc_telefono).replace(/\D/g, ""),
    fc_correo: normalizeText(body.fc_correo),
    fc_localidad: normalizeText(body.fc_localidad),
    fc_estado: normalizeText(body.fc_estado),
    fi_ejecutivo_empleado_id: parseRequiredId(body.fi_ejecutivo_empleado_id),
    fi_usuario_id: usuarioId,
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

  const unidadActiva = await clienteModel.unidadNegocioActivaExists(payload.fi_unidad_negocio_id);
  if (!unidadActiva) {
    return { error: "fi_unidad_negocio_id debe corresponder a una unidad de negocio activa" };
  }

  const empleadoActivo = await clienteModel.empleadoActivoExists(payload.fi_ejecutivo_empleado_id);
  if (!empleadoActivo) {
    return { error: "fi_ejecutivo_empleado_id debe corresponder a un empleado activo" };
  }

  return { payload };
}

class ClienteController {
  static async getAll(req, res) {
    try {
      const clientes = await clienteModel.getAll();
      res.json(clientes);
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  }

  static async getEmpleadosActivos(req, res) {
    try {
      const empleados = await clienteModel.getEmpleadosActivos();
      res.json(empleados);
    } catch (err) {
      console.error("Error al obtener empleados activos:", err);
      res.status(500).json({ error: "Error al obtener empleados activos" });
    }
  }

  static async create(req, res) {
    try {
      const { error, payload } = await buildClientePayload(req.body, req.user.usuario_id);
      if (error) return res.status(400).json({ error });

      const cliente = await clienteModel.create(payload);
      res.status(201).json(cliente);
    } catch (err) {
      console.error("Error al registrar cliente:", err);
      res.status(500).json({ error: "Error al registrar cliente" });
    }
  }

  static async update(req, res) {
    try {
      const { error, payload } = await buildClientePayload(req.body, req.user.usuario_id);
      if (error) return res.status(400).json({ error });

      const cliente = await clienteModel.update(req.params.id, payload);
      if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });

      res.json(cliente);
    } catch (err) {
      console.error("Error al actualizar cliente:", err);
      res.status(500).json({ error: "Error al actualizar cliente" });
    }
  }

  static async delete(req, res) {
    try {
      await clienteModel.delete(req.params.id);
      res.sendStatus(204);
    } catch (err) {
      console.error("Error al eliminar cliente:", err);
      res.status(500).json({ error: "Error al eliminar cliente" });
    }
  }
}

export default ClienteController;
