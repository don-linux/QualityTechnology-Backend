import prisma from "../prisma.js";
import { serializeCliente } from "../utils/serializers.js";

// El schema actual reduce Cliente a (nombre, empresa, telefono, email,
// esta_activo). Los campos antiguos (razon_social, rfc, unidad_negocio_id,
// nombre_contacto, ejecutivo, localidad, estado, usuario_id) ya no existen.
// El alias `fc_razon_social` se mapea a `nombre`, `fc_nombre_contacto` a
// `empresa`. El resto se ignora si llega.

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

function buildClientePayload(body) {
  const nombre = normalizeText(pick(body, "nombre", "fc_razon_social"));
  const empresa = normalizeText(pick(body, "empresa", "fc_nombre_contacto") ?? "");
  const telefono = normalizeText(pick(body, "telefono", "fc_telefono") ?? "");
  const email = normalizeText(pick(body, "email", "correo", "fc_correo") ?? "");

  if (!nombre) {
    return { error: "Campo obligatorio: nombre" };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { error: "email debe tener formato de correo electronico valido" };
  }

  return {
    payload: {
      nombre,
      empresa: empresa || null,
      telefono: telefono || null,
      email: email || null,
    },
  };
}

class ClienteController {
  static async getAll(req, res) {
    try {
      const clientes = await prisma.cliente.findMany({
        orderBy: [{ nombre: "asc" }, { id: "asc" }],
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
        where: { esta_activo: true },
        select: {
          id: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
        },
      });
      const result = empleados
        .map((e) => ({
          fi_empleado_id: e.id,
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
      const { error, payload } = buildClientePayload(req.body);
      if (error) return res.status(400).json({ error });

      const cliente = await prisma.cliente.create({ data: payload });
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
      const { error, payload } = buildClientePayload(req.body);
      if (error) return res.status(400).json({ error });

      const cliente = await prisma.cliente.update({
        where: { id },
        data: payload,
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
      await prisma.cliente.delete({ where: { id } });
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
