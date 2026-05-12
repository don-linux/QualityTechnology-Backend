import prisma from "../prisma.js";
import { serializeEmpleado } from "../utils/serializers.js";
import { revokeAllByUser } from "../services/refreshTokenService.js";

const empleadoInclude = {
  departamento: true,
  puesto: true,
  unidadNegocio: true,
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
    unidadNegocioId: pick(body, "unidad_negocio_id", "fi_unidad_negocio_id"),
    usuarioId: pick(body, "usuario_id", "fi_usuario_id"),
    nombre: pick(body, "nombre", "fc_nombre"),
    apellidoPaterno: pick(body, "apellido_paterno", "fc_apellido_paterno"),
    apellidoMaterno: pick(body, "apellido_materno", "fc_apellido_materno"),
    genero: pick(body, "genero", "fc_genero"),
    fechaNacimiento: pick(body, "fecha_nacimiento", "fd_fecha_nacimiento"),
    estado: pick(body, "estado", "fc_estado"),
    ciudad: pick(body, "ciudad", "fc_ciudad"),
    calle: pick(body, "calle", "fc_calle"),
    codigoPostal: pick(body, "codigo_postal", "fc_codigo_postal"),
    referencias: pick(body, "referencias", "fc_referencias"),
    comentariosAdicionales: pick(body, "comentarios_adicionales", "ft_comentarios_adicionales"),
    fechaContratacion: pick(body, "fecha_contratacion", "fd_fecha_contratacion"),
    fechaBaja: pick(body, "fecha_baja", "fd_fecha_baja"),
    uniformes: pick(body, "uniformes", "fn_uniformes"),
  };
}

class EmpleadoController {
  static async getAll(req, res) {
    try {
      const empleados = await prisma.empleado.findMany({
        include: empleadoInclude,
        orderBy: { empleadoId: "asc" },
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
        where: { empleadoId: Number(id) },
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

    if (!data.nombre || !data.apellidoPaterno || !data.apellidoMaterno || !data.departamentoId) {
      return res.status(400).json({
        error: "Campos obligatorios: nombre, apellido_paterno, apellido_materno, departamento_id",
      });
    }

    try {
      const empleado = await prisma.empleado.create({
        data: {
          nombre: data.nombre,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          departamentoId: Number(data.departamentoId),
          ...(data.puestoId ? { puestoId: Number(data.puestoId) } : {}),
          ...(data.unidadNegocioId ? { unidadNegocioId: Number(data.unidadNegocioId) } : {}),
          ...(data.usuarioId ? { usuarioId: Number(data.usuarioId) } : {}),
        },
        include: empleadoInclude,
      });
      res.status(201).json({
        mensaje: "Empleado creado exitosamente",
        empleado: serializeEmpleado(empleado),
      });
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Departamento, puesto o unidad de negocio invalido" });
      }
      console.error("Error al crear empleado:", err);
      res.status(500).json({ error: "Error al crear empleado" });
    }
  }

  static async update(req, res) {
    const { id } = req.params;
    const data = parseEmpleadoData(req.body);

    const dateChecks = [
      ["fecha_nacimiento", data.fechaNacimiento],
      ["fecha_contratacion", data.fechaContratacion],
      ["fecha_baja", data.fechaBaja],
    ];
    const invalidDate = dateChecks.find(([, v]) => v && !isValidDate(v));
    if (invalidDate) {
      return res.status(400).json({ error: `${invalidDate[0]} debe tener formato YYYY-MM-DD` });
    }

    try {
      const updateData = {};
      if (data.departamentoId !== undefined) updateData.departamentoId = Number(data.departamentoId);
      if (data.puestoId !== undefined) updateData.puestoId = data.puestoId ? Number(data.puestoId) : null;
      if (data.unidadNegocioId !== undefined) updateData.unidadNegocioId = data.unidadNegocioId ? Number(data.unidadNegocioId) : null;
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.apellidoPaterno !== undefined) updateData.apellidoPaterno = data.apellidoPaterno;
      if (data.apellidoMaterno !== undefined) updateData.apellidoMaterno = data.apellidoMaterno;
      if (data.genero !== undefined) updateData.genero = data.genero || null;
      if (data.fechaNacimiento !== undefined) updateData.fechaNacimiento = toDateOrNull(data.fechaNacimiento);
      if (data.estado !== undefined) updateData.estado = data.estado || null;
      if (data.ciudad !== undefined) updateData.ciudad = data.ciudad || null;
      if (data.calle !== undefined) updateData.calle = data.calle || null;
      if (data.codigoPostal !== undefined) updateData.codigoPostal = data.codigoPostal || null;
      if (data.referencias !== undefined) updateData.referencias = data.referencias || null;
      if (data.comentariosAdicionales !== undefined) updateData.comentariosAdicionales = data.comentariosAdicionales || null;
      if (data.fechaContratacion !== undefined) updateData.fechaContratacion = toDateOrNull(data.fechaContratacion);
      if (data.fechaBaja !== undefined) updateData.fechaBaja = toDateOrNull(data.fechaBaja);
      if (data.uniformes !== undefined) updateData.uniformes = Number(data.uniformes ?? 0);

      const empleado = await prisma.empleado.update({
        where: { empleadoId: Number(id) },
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
        return res.status(400).json({ error: "Departamento, puesto o unidad de negocio invalido" });
      }
      console.error("Error al actualizar empleado:", err);
      res.status(500).json({ error: "Error al actualizar empleado" });
    }
  }

  static async delete(req, res) {
    const { id } = req.params;
    try {
      await prisma.empleado.delete({ where: { empleadoId: Number(id) } });
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
    const fechaBaja = req.body?.fecha_baja || req.body?.fd_fecha_baja || null;

    if (!isValidDate(fechaBaja)) {
      return res.status(400).json({ error: "fecha_baja debe tener formato YYYY-MM-DD" });
    }

    try {
      const empleado = await prisma.empleado.update({
        where: { empleadoId: Number(id) },
        data: {
          activo: false,
          fechaBaja: fechaBaja ? toDateOrNull(fechaBaja) : new Date(),
        },
        include: empleadoInclude,
      });

      if (empleado.usuarioId) {
        await prisma.usuario.update({
          where: { usuarioId: empleado.usuarioId },
          data: { activo: false },
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
        where: { empleadoId: Number(id) },
        data: { activo: true, fechaBaja: null },
        include: empleadoInclude,
      });

      if (empleado.usuarioId) {
        await prisma.usuario.update({
          where: { usuarioId: empleado.usuarioId },
          data: { activo: true },
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
      if (!data.nombre || !data.apellidoPaterno || !data.apellidoMaterno) {
        return res.status(400).json({ error: "Nombre y apellidos son obligatorios" });
      }

      const actualizado = await prisma.empleado.update({
        where: { empleadoId: empleado.empleadoId },
        data: {
          nombre: data.nombre,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          genero: data.genero ?? null,
          fechaNacimiento: toDateOrNull(data.fechaNacimiento),
          estado: data.estado ?? null,
          ciudad: data.ciudad ?? null,
          calle: data.calle ?? null,
          codigoPostal: data.codigoPostal ?? null,
          referencias: data.referencias ?? null,
          comentariosAdicionales: data.comentariosAdicionales ?? null,
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
