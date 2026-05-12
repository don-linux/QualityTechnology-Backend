import prisma from "../prisma.js";
import { serializeCliente } from "../utils/serializers.js";

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

const CLIENTE_INCLUDE = {
  unidadNegocio: true,
  ejecutivo: true,
};

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
    return { error: "fc_rfc debe tener maximo 20 caracteres" };
  }
  if (!PHONE_RE.test(payload.fc_telefono)) {
    return { error: "fc_telefono debe contener solo numeros y maximo 10 digitos" };
  }
  if (!EMAIL_RE.test(payload.fc_correo)) {
    return { error: "fc_correo debe tener formato de correo electronico valido" };
  }

  const unidad = await prisma.unidadNegocio.findUnique({
    where: { unidadNegocioId: payload.fi_unidad_negocio_id },
  });
  if (!unidad || !unidad.activo) {
    return { error: "fi_unidad_negocio_id debe corresponder a una unidad de negocio activa" };
  }

  const empleado = await prisma.empleado.findUnique({
    where: { empleadoId: payload.fi_ejecutivo_empleado_id },
  });
  if (!empleado || !empleado.activo) {
    return { error: "fi_ejecutivo_empleado_id debe corresponder a un empleado activo" };
  }

  return { payload };
}

class ClienteController {
  static async getAll(req, res) {
    try {
      const clientes = await prisma.cliente.findMany({
        include: CLIENTE_INCLUDE,
        orderBy: [{ razonSocial: "asc" }, { clienteId: "asc" }],
      });
      res.json(clientes.map(serializeCliente));
    } catch (err) {
      console.error("Error al obtener clientes:", err);
      res.status(500).json({ error: "Error al obtener clientes" });
    }
  }

  static async getEmpleadosActivos(req, res) {
    try {
      const empleados = await prisma.empleado.findMany({
        where: { activo: true },
        select: {
          empleadoId: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
        },
      });
      const result = empleados
        .map((e) => ({
          fi_empleado_id: e.empleadoId,
          fc_nombre_completo: [e.nombre, e.apellidoPaterno, e.apellidoMaterno]
            .filter(Boolean)
            .join(" "),
        }))
        .sort((a, b) => a.fc_nombre_completo.localeCompare(b.fc_nombre_completo));
      res.json(result);
    } catch (err) {
      console.error("Error al obtener empleados activos:", err);
      res.status(500).json({ error: "Error al obtener empleados activos" });
    }
  }

  static async create(req, res) {
    try {
      const { error, payload } = await buildClientePayload(req.body, req.user.usuario_id);
      if (error) return res.status(400).json({ error });

      const cliente = await prisma.cliente.create({
        data: {
          razonSocial: payload.fc_razon_social,
          rfc: payload.fc_rfc,
          unidadNegocioId: payload.fi_unidad_negocio_id,
          nombreContacto: payload.fc_nombre_contacto,
          telefono: payload.fc_telefono,
          correo: payload.fc_correo,
          localidad: payload.fc_localidad,
          estado: payload.fc_estado,
          ejecutivoEmpleadoId: payload.fi_ejecutivo_empleado_id,
          usuarioId: payload.fi_usuario_id,
        },
        include: CLIENTE_INCLUDE,
      });
      res.status(201).json(serializeCliente(cliente));
    } catch (err) {
      console.error("Error al registrar cliente:", err);
      res.status(500).json({ error: "Error al registrar cliente" });
    }
  }

  static async update(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const { error, payload } = await buildClientePayload(req.body, req.user.usuario_id);
      if (error) return res.status(400).json({ error });

      const cliente = await prisma.cliente.update({
        where: { clienteId: id },
        data: {
          razonSocial: payload.fc_razon_social,
          rfc: payload.fc_rfc,
          unidadNegocioId: payload.fi_unidad_negocio_id,
          nombreContacto: payload.fc_nombre_contacto,
          telefono: payload.fc_telefono,
          correo: payload.fc_correo,
          localidad: payload.fc_localidad,
          estado: payload.fc_estado,
          ejecutivoEmpleadoId: payload.fi_ejecutivo_empleado_id,
          usuarioId: payload.fi_usuario_id,
        },
        include: CLIENTE_INCLUDE,
      });
      res.json(serializeCliente(cliente));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Cliente no encontrado" });
      console.error("Error al actualizar cliente:", err);
      res.status(500).json({ error: "Error al actualizar cliente" });
    }
  }

  static async delete(req, res) {
    const id = parseRequiredId(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.cliente.delete({ where: { clienteId: id } });
      res.sendStatus(204);
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Cliente no encontrado" });
      if (err.code === "P2003") {
        return res.status(409).json({
          error: "No se puede eliminar: el cliente tiene registros relacionados",
        });
      }
      console.error("Error al eliminar cliente:", err);
      res.status(500).json({ error: "Error al eliminar cliente" });
    }
  }
}

export default ClienteController;
