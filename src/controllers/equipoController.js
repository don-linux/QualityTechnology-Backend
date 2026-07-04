import prisma from "../prisma.js";
import { serializeEquipo } from "../utils/serializers.js";

// El schema actual simplifica Equipo (nombre, tipo, marca, modelo, serial,
// estado, observaciones). Los campos del API previo (fecha_compra, costo,
// ubicacion, proximo_mantenimiento, notas) ya no existen y se ignoran si vienen en el body.

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
}

export default EquipoController;
