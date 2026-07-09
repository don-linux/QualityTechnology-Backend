import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeLimpiezaInstalacion } from "../utils/serializers.js";

const LIMITES = {
  desinfectante_utilizado: 500,
  responsable: 120,
  observaciones: 500,
  ubicacion: 50,
};

const TIPOS_VALIDOS = ["desinfeccion", "recambio"];

const inc = {
  ubicacion: true,
  observacion: true,
  infraestructuraFisica: { select: { id: true, nombre: true } },
};

function validarLongitudes(body) {
  const etiquetas = {
    desinfectante_utilizado: "El desinfectante utilizado",
    responsable: "El responsable",
    observaciones: "Las observaciones",
    ubicacion: "La ubicación",
  };
  for (const [campo, max] of Object.entries(LIMITES)) {
    const valor = body[campo];
    const len = valor == null ? 0 : String(valor).length;
    if (len > max) {
      return `${etiquetas[campo]} no puede superar los ${max} caracteres.`;
    }
  }
  return null;
}

function normalizarTipoLimpieza(value = "") {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "desinfeccion" || normalized === "desinfección") return "desinfeccion";
  if (normalized === "recambio") return "recambio";
  return "";
}

function parseOptDecimal(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseOptInt(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function validarPayload(body) {
  const { ubicacion, fecha, infraestructura_fisica_id, desinfectante_utilizado, responsable } = body;

  if (!ubicacion || !String(ubicacion).trim()) {
    return { error: "ubicacion es requerido" };
  }
  if (!fecha) {
    return { error: "La fecha es obligatoria" };
  }

  const infraId = parseOptInt(infraestructura_fisica_id);
  if (!infraId) {
    return { error: "infraestructura_fisica_id es requerido" };
  }

  const tipoLimpieza = normalizarTipoLimpieza(body.tipo_limpieza);
  if (!TIPOS_VALIDOS.includes(tipoLimpieza)) {
    return { error: "tipo_limpieza debe ser desinfeccion o recambio" };
  }

  if (!desinfectante_utilizado || !String(desinfectante_utilizado).trim()) {
    return { error: "desinfectante_utilizado es requerido" };
  }

  if (!responsable || !String(responsable).trim()) {
    return { error: "responsable es requerido" };
  }

  const errorLongitud = validarLongitudes(body);
  if (errorLongitud) {
    return { error: errorLongitud };
  }

  const porcentaje = parseOptDecimal(body.porcentaje_recambio_agua);

  if (tipoLimpieza === "recambio") {
    if (porcentaje == null || porcentaje < 0 || porcentaje > 100) {
      return { error: "porcentaje_recambio_agua es requerido y debe estar entre 0 y 100" };
    }
  } else if (porcentaje != null) {
    return { error: "porcentaje_recambio_agua no aplica para desinfeccion" };
  }

  return {
    tipoLimpieza,
    infraId,
    porcentaje: tipoLimpieza === "recambio" ? porcentaje : null,
  };
}

class LimpiezaInstalacionesController {
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
      const rows = await prisma.limpiezaInstalacion.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeLimpiezaInstalacion));
    } catch (err) {
      console.error("Error GET /limpieza-instalaciones:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const validacion = validarPayload(req.body);
      if (validacion.error) {
        return res.status(400).json({ error: validacion.error });
      }

      const u = await resolverOCrearUbicacion(req.body.ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const usuarioId = req.user.usuario_id;
      const { observaciones } = req.body;
      const { tipoLimpieza, infraId, porcentaje } = validacion;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: observaciones ?? null,
          responsable: null,
          usuarioId,
        });

        await tx.limpiezaInstalacion.create({
          data: {
            ubicacionId: u.ubicacionId,
            fecha: new Date(req.body.fecha),
            infraestructuraFisicaId: infraId,
            tipoLimpieza,
            porcentajeRecambioAgua: porcentaje,
            desinfectanteUtilizado: String(req.body.desinfectante_utilizado).trim(),
            responsable: String(req.body.responsable).trim(),
            usuarioId,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro agregado correctamente" });
    } catch (err) {
      console.error("Error POST /limpieza-instalaciones:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const validacion = validarPayload(req.body);
      if (validacion.error) {
        return res.status(400).json({ error: validacion.error });
      }

      const u = await resolverOCrearUbicacion(req.body.ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.limpiezaInstalacion.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;
      const { observaciones } = req.body;
      const { tipoLimpieza, infraId, porcentaje } = validacion;

      const texto =
        observaciones !== undefined
          ? observaciones
          : existing.observacion?.comentario ?? null;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto,
          responsable: null,
          usuarioId,
        });

        await tx.limpiezaInstalacion.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            fecha: new Date(req.body.fecha),
            infraestructuraFisicaId: infraId,
            tipoLimpieza,
            porcentajeRecambioAgua: porcentaje,
            desinfectanteUtilizado: String(req.body.desinfectante_utilizado).trim(),
            responsable: String(req.body.responsable).trim(),
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error PUT /limpieza-instalaciones:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default LimpiezaInstalacionesController;
