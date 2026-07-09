import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeControlLimpieza } from "../utils/serializers.js";

const LIMITES_CONTROL_LIMPIEZA = {
  tipo_instalacion: 20,
  responsable: 100,
  observaciones: 500,
  ubicacion: 50,
};

const validarLongitudesControlLimpieza = (body) => {
  const etiquetas = {
    tipo_instalacion: "El tipo de instalación",
    responsable: "El responsable",
    observaciones: "Las observaciones",
    ubicacion: "La ubicación",
  };
  for (const [campo, max] of Object.entries(LIMITES_CONTROL_LIMPIEZA)) {
    const valor = body[campo];
    const len = valor == null ? 0 : String(valor).length;
    if (len > max) {
      return `${etiquetas[campo]} no puede superar los ${max} caracteres.`;
    }
  }
  return null;
};

const TIPOS_INSTALACION_VALIDOS = ["Baño de Hombres", "Baño de Mujeres", "Regadera"];

const normalizarTipoInstalacion = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "baño de hombres" || normalized === "bano de hombres" || normalized === "hombre" || normalized === "hombres") {
    return "Baño de Hombres";
  }
  if (normalized === "baño de mujeres" || normalized === "bano de mujeres" || normalized === "mujer" || normalized === "mujeres") {
    return "Baño de Mujeres";
  }
  if (normalized === "regadera") {
    return "Regadera";
  }
  return "";
};

const inc = { ubicacion: true, observacion: true };

class ControlLimpiezaController {
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
      const rows = await prisma.controlLimpieza.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeControlLimpieza));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const { fecha } = req.body;
      if (!fecha) {
        return res.status(400).json({ error: "La fecha es obligatoria" });
      }

      const tipoInstalacion = normalizarTipoInstalacion(req.body.tipo_instalacion);
      if (!TIPOS_INSTALACION_VALIDOS.includes(tipoInstalacion)) {
        return res.status(400).json({
          error: "tipo_instalacion debe ser Baño de Hombres, Baño de Mujeres o Regadera",
        });
      }

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const errorLongitud = validarLongitudesControlLimpieza(req.body);
      if (errorLongitud) {
        return res.status(400).json({ error: errorLongitud });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const usuarioId = req.user.usuario_id;
      const { responsable, observaciones } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: observaciones,
          responsable: null,
          usuarioId,
        });

        await tx.controlLimpieza.create({
          data: {
            ubicacionId: u.ubicacionId,
            fecha: new Date(fecha),
            tipoInstalacion,
            responsable: responsable || null,
            usuarioId,
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
      const { fecha } = req.body;
      if (!fecha) {
        return res.status(400).json({ error: "La fecha es obligatoria" });
      }

      const tipoInstalacion = normalizarTipoInstalacion(req.body.tipo_instalacion);
      if (!TIPOS_INSTALACION_VALIDOS.includes(tipoInstalacion)) {
        return res.status(400).json({
          error: "tipo_instalacion debe ser Baño de Hombres, Baño de Mujeres o Regadera",
        });
      }

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const errorLongitud = validarLongitudesControlLimpieza(req.body);
      if (errorLongitud) {
        return res.status(400).json({ error: errorLongitud });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.controlLimpieza.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;
      const { responsable, observaciones } = req.body;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto:
            observaciones !== undefined
              ? observaciones
              : existing.observacion?.comentario ?? null,
          responsable: null,
          usuarioId,
        });

        await tx.controlLimpieza.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            fecha: new Date(fecha),
            tipoInstalacion,
            responsable: responsable || null,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

}

export default ControlLimpiezaController;
