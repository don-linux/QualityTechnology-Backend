import prisma from "../prisma.js";
import {
  serializeEquipo,
  serializeMantenimiento,
} from "../utils/serializers.js";

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

function toDecimal(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toDateOrNull(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function appendResponsable(notas, responsable) {
  const r = responsable === undefined || responsable === null ? "" : String(responsable).trim();
  if (!r) return notas ?? null;
  const base = (notas ?? "").trim();
  const prefix = base ? `${base}\n` : "";
  return `${prefix}Responsable: ${r}`;
}

class EquipoController {
  static async getEmpleados(req, res) {
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
      console.error("Error al obtener empleados:", err);
      res.status(500).json({ error: err.message });
    }
  }

  static async getByUsuario(req, res) {
    try {
      const usuarioId = toInt(req.params.usuario_id);
      if (!usuarioId) return res.json([]);
      const equipos = await prisma.equipo.findMany({
        where: { usuarioId },
        include: { observacion: true },
        orderBy: { equipoId: "desc" },
      });
      res.json(equipos.map(serializeEquipo));
    } catch (err) {
      console.error("Error al obtener equipos:", err);
      res.status(500).json({ error: "Error al obtener equipos" });
    }
  }

  static async create(req, res) {
    try {
      const nombre = pick(req.body, "fc_nombre", "nombre");
      if (!nombre) return res.status(400).json({ error: "fc_nombre es obligatorio" });

      const notas = appendResponsable(
        pick(req.body, "fc_notas", "notas"),
        pick(req.body, "fc_responsable", "responsable")
      );

      const creado = await prisma.equipo.create({
        data: {
          nombre: String(nombre),
          marca: pick(req.body, "fc_marca", "marca") ?? null,
          modelo: pick(req.body, "fc_modelo", "modelo") ?? null,
          tipo: pick(req.body, "fc_tipo", "tipo") ?? null,
          fechaCompra: toDateOrNull(pick(req.body, "fd_fecha_compra", "fecha_compra")),
          costo: toDecimal(pick(req.body, "fn_costo", "costo")),
          estado: pick(req.body, "fc_estado", "estado") ?? "Operativo",
          ubicacion: pick(req.body, "fc_ubicacion", "ubicacion") ?? null,
          proximoMantenimiento: toDateOrNull(
            pick(req.body, "fd_proximo_mantenimiento", "proximo_mantenimiento")
          ),
          notas,
          usuarioId: req.user.usuario_id,
        },
        include: { observacion: true },
      });

      res.status(201).json(serializeEquipo(creado));
    } catch (err) {
      console.error("Error al registrar equipo:", err);
      res.status(500).json({ error: "Error al registrar equipo" });
    }
  }

  static async update(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      const updateData = {};
      const nombre = pick(req.body, "fc_nombre", "nombre");
      if (nombre !== undefined) updateData.nombre = String(nombre);
      if (req.body.fc_marca !== undefined || req.body.marca !== undefined) {
        updateData.marca = pick(req.body, "fc_marca", "marca") ?? null;
      }
      if (req.body.fc_modelo !== undefined || req.body.modelo !== undefined) {
        updateData.modelo = pick(req.body, "fc_modelo", "modelo") ?? null;
      }
      if (req.body.fc_tipo !== undefined || req.body.tipo !== undefined) {
        updateData.tipo = pick(req.body, "fc_tipo", "tipo") ?? null;
      }
      if (req.body.fd_fecha_compra !== undefined || req.body.fecha_compra !== undefined) {
        updateData.fechaCompra = toDateOrNull(pick(req.body, "fd_fecha_compra", "fecha_compra"));
      }
      if (req.body.fn_costo !== undefined || req.body.costo !== undefined) {
        updateData.costo = toDecimal(pick(req.body, "fn_costo", "costo"));
      }
      if (req.body.fc_estado !== undefined || req.body.estado !== undefined) {
        updateData.estado = pick(req.body, "fc_estado", "estado") ?? "Operativo";
      }
      if (req.body.fc_ubicacion !== undefined || req.body.ubicacion !== undefined) {
        updateData.ubicacion = pick(req.body, "fc_ubicacion", "ubicacion") ?? null;
      }
      if (
        req.body.fd_proximo_mantenimiento !== undefined ||
        req.body.proximo_mantenimiento !== undefined
      ) {
        updateData.proximoMantenimiento = toDateOrNull(
          pick(req.body, "fd_proximo_mantenimiento", "proximo_mantenimiento")
        );
      }
      if (
        req.body.fc_notas !== undefined ||
        req.body.notas !== undefined ||
        req.body.fc_responsable !== undefined ||
        req.body.responsable !== undefined
      ) {
        updateData.notas = appendResponsable(
          pick(req.body, "fc_notas", "notas"),
          pick(req.body, "fc_responsable", "responsable")
        );
      }

      const actualizado = await prisma.equipo.update({
        where: { equipoId: id },
        data: updateData,
        include: { observacion: true },
      });

      res.json(serializeEquipo(actualizado));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Equipo no encontrado" });
      console.error("Error al actualizar equipo:", err);
      res.status(500).json({ error: "Error al actualizar equipo" });
    }
  }

  static async delete(req, res) {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ error: "id invalido" });

    try {
      await prisma.equipo.delete({ where: { equipoId: id } });
      res.json({ mensaje: "Equipo eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Equipo no encontrado" });
      console.error("Error al eliminar equipo:", err);
      res.status(500).json({ error: "Error al eliminar equipo" });
    }
  }

  /* =========================================================
     MANTENIMIENTOS
  ========================================================= */
  static async getMantenimientos(req, res) {
    try {
      const equipoId = toInt(req.params.equipo_id);
      if (!equipoId) return res.json([]);
      const mantenimientos = await prisma.mantenimiento.findMany({
        where: { equipoId },
        include: { observacion: true },
        orderBy: { fecha: "desc" },
      });
      res.json(mantenimientos.map(serializeMantenimiento));
    } catch (err) {
      console.error("Error al obtener mantenimientos:", err);
      res.status(500).json({ error: "Error al obtener mantenimientos" });
    }
  }

  static async createMantenimiento(req, res) {
    try {
      const equipoId = toInt(req.params.equipo_id);
      if (!equipoId) return res.status(400).json({ error: "equipo_id invalido" });

      const fecha = toDateOrNull(pick(req.body, "fd_fecha", "fecha"));
      if (!fecha) {
        return res.status(400).json({ error: "fd_fecha es obligatorio" });
      }

      const descripcion = (() => {
        const base = pick(req.body, "fc_descripcion", "descripcion") ?? "";
        const responsable = pick(req.body, "fc_responsable", "responsable");
        if (responsable) {
          const prefijo = base ? `${base}\n` : "";
          return `${prefijo}Responsable: ${responsable}`;
        }
        return base || null;
      })();

      const creado = await prisma.mantenimiento.create({
        data: {
          equipoId,
          fecha,
          tipo: pick(req.body, "fc_tipo", "tipo") ?? "Preventivo",
          descripcion,
          costo: toDecimal(pick(req.body, "fn_costo", "costo")) ?? 0,
          estadoPost: pick(req.body, "fc_estado_post", "estado_post") ?? null,
          proximoMantenimiento: toDateOrNull(
            pick(req.body, "fd_proximo_mantenimiento", "proximo_mantenimiento")
          ),
        },
        include: { observacion: true },
      });

      res.status(201).json(serializeMantenimiento(creado));
    } catch (err) {
      console.error("Error al registrar mantenimiento:", err);
      res.status(500).json({ error: "Error al registrar mantenimiento" });
    }
  }

  static async updateMantenimiento(req, res) {
    const id = toInt(req.params.mantenimiento_id);
    if (!id) return res.status(400).json({ error: "mantenimiento_id invalido" });

    try {
      const updateData = {};
      const fecha = toDateOrNull(pick(req.body, "fd_fecha", "fecha"));
      if (fecha) updateData.fecha = fecha;

      if (req.body.fc_tipo !== undefined || req.body.tipo !== undefined) {
        updateData.tipo = pick(req.body, "fc_tipo", "tipo") ?? "Preventivo";
      }
      if (
        req.body.fc_descripcion !== undefined ||
        req.body.descripcion !== undefined ||
        req.body.fc_responsable !== undefined ||
        req.body.responsable !== undefined
      ) {
        const base = pick(req.body, "fc_descripcion", "descripcion") ?? "";
        const responsable = pick(req.body, "fc_responsable", "responsable");
        if (responsable) {
          const prefijo = base ? `${base}\n` : "";
          updateData.descripcion = `${prefijo}Responsable: ${responsable}`;
        } else {
          updateData.descripcion = base || null;
        }
      }
      if (req.body.fn_costo !== undefined || req.body.costo !== undefined) {
        updateData.costo = toDecimal(pick(req.body, "fn_costo", "costo")) ?? 0;
      }
      if (req.body.fc_estado_post !== undefined || req.body.estado_post !== undefined) {
        updateData.estadoPost = pick(req.body, "fc_estado_post", "estado_post") ?? null;
      }
      if (
        req.body.fd_proximo_mantenimiento !== undefined ||
        req.body.proximo_mantenimiento !== undefined
      ) {
        updateData.proximoMantenimiento = toDateOrNull(
          pick(req.body, "fd_proximo_mantenimiento", "proximo_mantenimiento")
        );
      }

      const actualizado = await prisma.mantenimiento.update({
        where: { mantenimientoId: id },
        data: updateData,
        include: { observacion: true },
      });
      res.json(serializeMantenimiento(actualizado));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Mantenimiento no encontrado" });
      console.error("Error al actualizar mantenimiento:", err);
      res.status(500).json({ error: "Error al actualizar mantenimiento" });
    }
  }

  static async deleteMantenimiento(req, res) {
    const id = toInt(req.params.mantenimiento_id);
    if (!id) return res.status(400).json({ error: "mantenimiento_id invalido" });

    try {
      await prisma.mantenimiento.delete({ where: { mantenimientoId: id } });
      res.json({ mensaje: "Mantenimiento eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Mantenimiento no encontrado" });
      console.error("Error al eliminar mantenimiento:", err);
      res.status(500).json({ error: "Error al eliminar mantenimiento" });
    }
  }
}

export default EquipoController;
