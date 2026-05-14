import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeBano } from "../utils/serializers.js";

const LIMITES_BANOS = {
  fc_tipo_banio: 20,
  fc_regadera: 100,
  fc_realizo: 100,
  fc_observaciones: 500,
  ubicacion: 50,
};

const validarLongitudesBanos = (body) => {
  const etiquetas = {
    fc_tipo_banio: "El tipo de baño",
    fc_regadera: "La regadera",
    fc_realizo: "Realizó",
    fc_observaciones: "Las observaciones",
    ubicacion: "La ubicación",
  };
  for (const [campo, max] of Object.entries(LIMITES_BANOS)) {
    const valor = body[campo];
    const len = valor == null ? 0 : String(valor).length;
    if (len > max) {
      return `${etiquetas[campo]} no puede superar los ${max} caracteres.`;
    }
  }
  return null;
};

const TIPOS_BANIO_VALIDOS = ["Hombre", "Mujer"];

const normalizarTipoBanio = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "hombre" || normalized === "hombres") return "Hombre";
  if (normalized === "mujer" || normalized === "mujeres") return "Mujer";
  return "";
};

const inc = { ubicacion: true, observacion: true };

class BitacoraBanoController {
  static async getEmpleados(req, res) {
    try {
      const empleados = await listarEmpleadosActivosBitacora();
      res.json(empleados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAll(req, res) {
    try {
      const rows = await prisma.bano.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeBano));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { fd_fecha } = req.body;
      if (!fd_fecha) {
        return res.status(400).json({ error: "La fecha (fd_fecha) es obligatoria" });
      }

      const fc_tipo_banio = normalizarTipoBanio(req.body.fc_tipo_banio);
      if (!TIPOS_BANIO_VALIDOS.includes(fc_tipo_banio)) {
        return res.status(400).json({ error: "fc_tipo_banio debe ser Hombre o Mujer" });
      }

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const errorLongitud = validarLongitudesBanos(req.body);
      if (errorLongitud) {
        return res.status(400).json({ error: errorLongitud });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const fi_usuario_id = req.user.usuario_id;
      const { fc_regadera, fc_realizo, fc_observaciones } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: fc_observaciones,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.bano.create({
          data: {
            ubicacionId: u.ubicacionId,
            fecha: new Date(fd_fecha),
            tipoBanio: fc_tipo_banio,
            regadera: fc_regadera || null,
            realizado_por: fc_realizo || null,
            usuarioId: fi_usuario_id,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro agregado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const { fd_fecha } = req.body;
      if (!fd_fecha) {
        return res.status(400).json({ error: "La fecha (fd_fecha) es obligatoria" });
      }

      const fc_tipo_banio = normalizarTipoBanio(req.body.fc_tipo_banio);
      if (!TIPOS_BANIO_VALIDOS.includes(fc_tipo_banio)) {
        return res.status(400).json({ error: "fc_tipo_banio debe ser Hombre o Mujer" });
      }

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const errorLongitud = validarLongitudesBanos(req.body);
      if (errorLongitud) {
        return res.status(400).json({ error: errorLongitud });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.bano.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const fi_usuario_id = req.user?.usuario_id ?? existing.usuarioId;
      const { fc_regadera, fc_realizo, fc_observaciones } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto:
            fc_observaciones !== undefined
              ? fc_observaciones
              : existing.observacion?.comentario ?? null,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.bano.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            fecha: new Date(fd_fecha),
            tipoBanio: fc_tipo_banio,
            regadera: fc_regadera || null,
            realizado_por: fc_realizo || null,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await prisma.bano.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Registro eliminado" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteAll(req, res) {
    try {
      await prisma.bano.deleteMany();
      res.json({ message: "Todos los registros eliminados" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default BitacoraBanoController;
