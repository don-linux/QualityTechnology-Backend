import prisma from "../prisma.js";
import { serializeEmpleado } from "../utils/serializers.js";
import { revokeAllByUser } from "../services/refreshTokenService.js";

// El modelo Empleado del schema actual solo conserva los campos basicos:
// nombre, apellido_paterno, apellido_materno, usuario_id, puesto_id,
// departamento_id, sueldo_base, fecha_ingreso y esta_activo. Los campos
// extendidos (genero, ciudad, fechas extra, uniformes, comentarios, etc.)
// que existian en la version anterior se aceptan pero se ignoran.
const empleadoInclude = {
  departamento: true,
  puesto: true,
  usuario: true,
};

function isValidDate(value) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toDateOrNull(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00Z`);
}

function pick(body, ...keys) {
  for (const key of keys) {
    if (body[key] !== undefined) return body[key];
  }
  return undefined;
}

function parseEmpleadoData(body) {
  return {
    departamentoId: pick(body, "departamento_id", "fi_departamento_id"),
    puestoId: pick(body, "puesto_id", "fi_puesto_id"),
    usuarioId: pick(body, "usuario_id", "fi_usuario_id"),
    nombre: pick(body, "nombre", "fc_nombre"),
    apellidoPaterno: pick(body, "apellido_paterno", "fc_apellido_paterno"),
    apellidoMaterno: pick(body, "apellido_materno", "fc_apellido_materno"),
    sueldoBase: pick(body, "sueldo_base", "fn_sueldo_base"),
    fechaIngreso: pick(body, "fecha_ingreso", "fd_fecha_ingreso", "fecha_contratacion", "fd_fecha_contratacion"),
  };
}

class EmpleadoController {
  static async getAll(req, res) {
    try {
      const empleados = await prisma.empleado.findMany({
        include: empleadoInclude,
        orderBy: { id: "desc" },
      });
      res.json(empleados.map(serializeEmpleado));
    } catch (err) {
      console.error("Error al obtener empleados:", err);
      res.status(500).json({ error: "Error al obtener empleados" });
    }
  }

  static async getById(req, res) {
    const { id } = req.params;
    try {
      const empleado = await prisma.empleado.findUnique({
        where: { id: Number(id) },
        include: empleadoInclude,
      });
      if (!empleado) {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      res.json(serializeEmpleado(empleado));
    } catch (err) {
      console.error("Error al obtener empleado:", err);
      res.status(500).json({ error: "Error al obtener empleado" });
    }
  }

  static async create(req, res) {
    const data = parseEmpleadoData(req.body);

    if (!data.nombre || !data.apellidoPaterno || !data.departamentoId) {
      return res.status(400).json({
        error: "Campos obligatorios: nombre, apellido_paterno, departamento_id",
      });
    }
    if (data.fechaIngreso && !isValidDate(data.fechaIngreso)) {
      return res.status(400).json({ error: "fecha_ingreso debe tener formato YYYY-MM-DD" });
    }

    try {
      const empleado = await prisma.empleado.create({
        data: {
          nombre: data.nombre,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno ?? null,
          departamentoId: Number(data.departamentoId),
          ...(data.puestoId ? { puestoId: Number(data.puestoId) } : {}),
          ...(data.usuarioId ? { usuarioId: Number(data.usuarioId) } : {}),
          ...(data.sueldoBase !== undefined ? { sueldo_base: data.sueldoBase } : {}),
          ...(data.fechaIngreso ? { fecha_ingreso: toDateOrNull(data.fechaIngreso) } : {}),
        },
        include: empleadoInclude,
      });
      res.status(201).json({
        mensaje: "Empleado creado exitosamente",
        empleado: serializeEmpleado(empleado),
      });
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Departamento o puesto invalido" });
      }
      console.error("Error al crear empleado:", err);
      res.status(500).json({ error: "Error al crear empleado" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const data = parseEmpleadoData(req.body);

    if (data.fechaIngreso && !isValidDate(data.fechaIngreso)) {
      return res.status(400).json({ error: "fecha_ingreso debe tener formato YYYY-MM-DD" });
    }

    try {
      const updateData = {};
      if (data.departamentoId !== undefined) updateData.departamentoId = Number(data.departamentoId);
      if (data.puestoId !== undefined) updateData.puestoId = data.puestoId ? Number(data.puestoId) : null;
      if (data.usuarioId !== undefined) updateData.usuarioId = data.usuarioId ? Number(data.usuarioId) : null;
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.apellidoPaterno !== undefined) updateData.apellidoPaterno = data.apellidoPaterno;
      if (data.apellidoMaterno !== undefined) updateData.apellidoMaterno = data.apellidoMaterno || null;
      if (data.sueldoBase !== undefined) updateData.sueldo_base = data.sueldoBase;
      if (data.fechaIngreso !== undefined) updateData.fecha_ingreso = toDateOrNull(data.fechaIngreso);

      const empleado = await prisma.empleado.update({
        where: { id: Number(id) },
        data: updateData,
        include: empleadoInclude,
      });
      res.json({
        mensaje: "Empleado actualizado correctamente",
        empleado: serializeEmpleado(empleado),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Departamento o puesto invalido" });
      }
      console.error("Error al actualizar empleado:", err);
      res.status(500).json({ error: "Error al actualizar empleado" });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.empleado.delete({ where: { id: Number(id) } });
      res.json({ mensaje: "Empleado eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      if (err.code === "P2003") {
        return res.status(409).json({
          error: "No se puede eliminar el empleado porque tiene registros asociados (nomina, vacaciones, documentos, etc.)",
        });
      }
      console.error("Error al eliminar empleado:", err);
      res.status(500).json({ error: "Error al eliminar empleado" });
    }
  }

  static async deactivate(req, res) {
    const { id } = req.params;

    try {
      const empleado = await prisma.empleado.update({
        where: { id: Number(id) },
        data: { esta_activo: false },
        include: empleadoInclude,
      });

      if (empleado.usuarioId) {
        await prisma.usuario.update({
          where: { id: empleado.usuarioId },
          data: { esta_activo: false },
        });
        await revokeAllByUser(empleado.usuarioId);
      }

      res.json({
        mensaje: "Empleado desactivado correctamente",
        empleado: serializeEmpleado(empleado),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      console.error("Error al desactivar empleado:", err);
      res.status(500).json({ error: "Error al desactivar empleado" });
    }
  }

  static async activate(req, res) {
    const { id } = req.params;
    try {
      const empleado = await prisma.empleado.update({
        where: { id: Number(id) },
        data: { esta_activo: true },
        include: empleadoInclude,
      });

      if (empleado.usuarioId) {
        await prisma.usuario.update({
          where: { id: empleado.usuarioId },
          data: { esta_activo: true },
        });
      }

      res.json({
        mensaje: "Empleado activado correctamente",
        empleado: serializeEmpleado(empleado),
      });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Empleado no encontrado" });
      }
      console.error("Error al activar empleado:", err);
      res.status(500).json({ error: "Error al activar empleado" });
    }
  }

  static async getMiPerfil(req, res) {
    try {
      const empleado = await prisma.empleado.findFirst({
        where: { usuarioId: Number(req.user.usuario_id) },
        include: empleadoInclude,
      });
      if (!empleado) {
        return res.status(404).json({ error: "No se encontro perfil de empleado vinculado" });
      }
      res.json(serializeEmpleado(empleado));
    } catch (err) {
      console.error("Error al obtener mi perfil:", err);
      res.status(500).json({ error: "Error al obtener perfil" });
    }
  }

  static async updateMiPerfil(req, res) {
    try {
      const empleado = await prisma.empleado.findFirst({
        where: { usuarioId: Number(req.user.usuario_id) },
      });
      if (!empleado) {
        return res.status(404).json({ error: "No se encontro perfil de empleado vinculado" });
      }

      const data = parseEmpleadoData(req.body);
      if (!data.nombre || !data.apellidoPaterno) {
        return res.status(400).json({ error: "Nombre y apellido paterno son obligatorios" });
      }

      const actualizado = await prisma.empleado.update({
        where: { id: empleado.id },
        data: {
          nombre: data.nombre,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno ?? null,
        },
        include: empleadoInclude,
      });

      res.json({
        mensaje: "Perfil actualizado correctamente",
        empleado: serializeEmpleado(actualizado),
      });
    } catch (err) {
      console.error("Error al actualizar mi perfil:", err);
      res.status(500).json({ error: "Error al actualizar perfil" });
    }
  }
}

export default EmpleadoController;
