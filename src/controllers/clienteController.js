import prisma from "../prisma.js";
import { serializeCliente } from "../utils/serializers.js";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const clienteInclude = {
  ejecutivo: {
    select: {
      id: true,
      nombre: true,
      apellidoPaterno: true,
      apellidoMaterno: true,
    },
  },
};

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
  const ejecutivoEmpleadoId = parseRequiredId(
    pick(body, "ejecutivo_empleado_id", "fi_ejecutivo_empleado_id", "ejecutivo_id"),
  );

  if (!nombre) {
    return { error: "Campo obligatorio: nombre" };
  }
  if (!ejecutivoEmpleadoId) {
    return { error: "Campo obligatorio: ejecutivo (empleado)" };
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
      ejecutivoEmpleadoId,
    },
  };
}

async function assertEmpleadoEjecutivoValido(empleadoId) {
  const emp = await prisma.empleado.findUnique({
    where: { id: empleadoId },
    select: { id: true, esta_activo: true },
  });
  if (!emp) {
    const err = new Error("Ejecutivo (empleado) no encontrado");
    err.code = "EJECUTIVO_NOT_FOUND";
    throw err;
  }
  if (!emp.esta_activo) {
    const err = new Error("El ejecutivo seleccionado no está activo");
    err.code = "EJECUTIVO_INACTIVO";
    throw err;
  }
}

class ClienteController {
  static async getAll(req, res) {
    try {
      const clientes = await prisma.cliente.findMany({
        include: clienteInclude,
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
          fc_nombre: e.nombre,
          fc_apellido_paterno: e.apellidoPaterno,
          fc_apellido_materno: e.apellidoMaterno ?? null,
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

      await assertEmpleadoEjecutivoValido(payload.ejecutivoEmpleadoId);

      const cliente = await prisma.cliente.create({
        data: payload,
        include: clienteInclude,
      });
      res.status(201).json(serializeCliente(cliente));
    } catch (err) {
      if (err.code === "EJECUTIVO_NOT_FOUND" || err.code === "EJECUTIVO_INACTIVO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Ejecutivo (empleado) inválido" });
      }
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

      await assertEmpleadoEjecutivoValido(payload.ejecutivoEmpleadoId);

      const cliente = await prisma.cliente.update({
        where: { id },
        data: payload,
        include: clienteInclude,
      });
      res.json(serializeCliente(cliente));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Cliente no encontrado" });
      if (err.code === "EJECUTIVO_NOT_FOUND" || err.code === "EJECUTIVO_INACTIVO") {
        return res.status(400).json({ error: err.message });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Ejecutivo (empleado) inválido" });
      }
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
