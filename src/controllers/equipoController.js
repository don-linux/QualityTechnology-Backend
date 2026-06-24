import prisma from "../prisma.js";
import {
  serializeEquipo,
  serializeMantenimiento,
} from "../utils/serializers.js";

// El schema actual simplifica Equipo (nombre, tipo, marca, modelo, serial,
// estado, observaciones) y Mantenimiento (descripcion, fecha, costo,
// responsable). Los campos del API previo (fecha_compra, costo en equipo,
// ubicacion, proximo_mantenimiento, notas, tipo y estado_post en
// mantenimiento) ya no existen y se ignoran si vienen en el body.

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

class EquipoController {
  static async getEmpleados(req, res) {
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
          empleado_id: e.id,
          nombre_completo: [e.nombre, e.apellidoPaterno, e.apellidoMaterno]
            .filter(Boolean)
            .join(" "),
        }))
        .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
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
        orderBy: { id: "desc" },
      });
      res.json(equipos.map(serializeEquipo));
    } catch (err) {
      console.error("Error al obtener equipos:", err);
      res.status(500).json({ error: "Error al obtener equipos" });
    }
  }

  static async create(req, res) {
    try {
      const nombre = pick(req.body, "nombre");
      if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });

      const creado = await prisma.equipo.create({
        data: {
          nombre: String(nombre),
          marca: pick(req.body, "marca") ?? null,
          modelo: pick(req.body, "modelo") ?? null,
          tipo: pick(req.body, "tipo") ?? null,
          serial: pick(req.body, "serial") ?? null,
          estado: pick(req.body, "estado") ?? "Operativo",
          observaciones: pick(req.body, "observaciones", "notas") ?? null,
          usuarioId: req.user.usuario_id,
        },
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
      const nombre = pick(req.body, "nombre");
      if (nombre !== undefined) updateData.nombre = String(nombre);
      if (req.body.marca !== undefined) {
        updateData.marca = pick(req.body, "marca") ?? null;
      }
      if (req.body.modelo !== undefined) {
        updateData.modelo = pick(req.body, "modelo") ?? null;
      }
      if (req.body.tipo !== undefined) {
        updateData.tipo = pick(req.body, "tipo") ?? null;
      }
      if (req.body.serial !== undefined) {
        updateData.serial = pick(req.body, "serial") ?? null;
      }
      if (req.body.estado !== undefined) {
        updateData.estado = pick(req.body, "estado") ?? "Operativo";
      }
      if (
        req.body.observaciones !== undefined ||
        req.body.notas !== undefined
      ) {
        updateData.observaciones =
          pick(req.body, "observaciones", "notas") ?? null;
      }

      const actualizado = await prisma.equipo.update({
        where: { id },
        data: updateData,
      });

      res.json(serializeEquipo(actualizado));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Equipo no encontrado" });
      console.error("Error al actualizar equipo:", err);
      res.status(500).json({ error: "Error al actualizar equipo" });
    }
  }

  // ===== Mantenimientos =====
  static async getMantenimientos(req, res) {
    try {
      const equipoId = toInt(req.params.equipo_id);
      if (!equipoId) return res.json([]);
      const mantenimientos = await prisma.mantenimiento.findMany({
        where: { equipoId },
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

      const fecha = toDateOrNull(pick(req.body, "fecha"));
      if (!fecha) {
        return res.status(400).json({ error: "fecha es obligatoria" });
      }
      const descripcion = pick(req.body, "descripcion");
      if (!descripcion) {
        return res.status(400).json({ error: "descripcion es obligatoria" });
      }

      const creado = await prisma.mantenimiento.create({
        data: {
          equipoId,
          fecha,
          descripcion: String(descripcion),
          costo: toDecimal(pick(req.body, "costo")),
          responsable: pick(req.body, "responsable") ?? null,
        },
      });

      res.status(201).json(serializeMantenimiento(creado));
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Equipo invalido" });
      }
      console.error("Error al registrar mantenimiento:", err);
      res.status(500).json({ error: "Error al registrar mantenimiento" });
    }
  }

  static async updateMantenimiento(req, res) {
    const id = toInt(req.params.mantenimiento_id);
    if (!id) return res.status(400).json({ error: "mantenimiento_id invalido" });

    try {
      const updateData = {};
      const fecha = toDateOrNull(pick(req.body, "fecha"));
      if (fecha) updateData.fecha = fecha;

      if (req.body.descripcion !== undefined) {
        updateData.descripcion = String(pick(req.body, "descripcion") ?? "");
      }
      if (req.body.costo !== undefined) {
        updateData.costo = toDecimal(pick(req.body, "costo"));
      }
      if (req.body.responsable !== undefined) {
        updateData.responsable = pick(req.body, "responsable") ?? null;
      }

      const actualizado = await prisma.mantenimiento.update({
        where: { id },
        data: updateData,
      });
      res.json(serializeMantenimiento(actualizado));
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Mantenimiento no encontrado" });
      console.error("Error al actualizar mantenimiento:", err);
      res.status(500).json({ error: "Error al actualizar mantenimiento" });
    }
  }

}

export default EquipoController;
