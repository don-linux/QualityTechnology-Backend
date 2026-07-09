import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { serializeMedicamento } from "../utils/serializers.js";

const CAMPOS_PERMITIDOS = new Set([
  "ubicacion",
  "infraestructura_fisica_id",
  "diagnostico",
  "farmaco",
  "fecha_inicio",
  "fecha_final",
]);

const MAX_DIAGNOSTICO = 500;
const MAX_FARMACO = 500;

const inc = { ubicacion: true, infraestructuraFisica: true };

function calcularPeriodoDias(fechaInicio, fechaFinal) {
  const inicio = new Date(fechaInicio);
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(fechaFinal);
  fin.setHours(0, 0, 0, 0);
  return Math.floor((fin - inicio) / 86400000) + 1;
}

function parseFecha(value, label) {
  if (!value || !String(value).trim()) {
    return { error: `${label} es obligatoria` };
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return { error: `${label} inválida` };
  }
  d.setHours(0, 0, 0, 0);
  return { date: d };
}

function validarCamposPermitidos(body) {
  const extra = Object.keys(body).filter((k) => !CAMPOS_PERMITIDOS.has(k));
  if (extra.length) {
    return `Campos no permitidos: ${extra.join(", ")}`;
  }
  return null;
}

function validarTexto(body) {
  const diag = String(body.diagnostico ?? "").trim();
  const farm = String(body.farmaco ?? "").trim();
  if (!diag) return "El diagnóstico es obligatorio";
  if (!farm) return "El fármaco es obligatorio";
  if (diag.length > MAX_DIAGNOSTICO) {
    return `El diagnóstico no puede superar los ${MAX_DIAGNOSTICO} caracteres`;
  }
  if (farm.length > MAX_FARMACO) {
    return `El fármaco no puede superar los ${MAX_FARMACO} caracteres`;
  }
  return null;
}

class MedicamentoController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.medicamento.findMany({
        include: inc,
        orderBy: { fechaInicio: "desc" },
      });
      res.json(rows.map(serializeMedicamento));
    } catch (err) {
      console.error("Error en GET /medicamentos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const errorCampos = validarCamposPermitidos(req.body);
      if (errorCampos) return res.status(400).json({ error: errorCampos });

      const {
        ubicacion,
        infraestructura_fisica_id,
        diagnostico,
        farmaco,
        fecha_inicio,
        fecha_final,
      } = req.body;

      if (!ubicacion || !String(ubicacion).trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const infraId = Number(infraestructura_fisica_id);
      if (!Number.isInteger(infraId) || infraId <= 0) {
        return res.status(400).json({ error: "infraestructura_fisica_id inválido" });
      }

      const errorTexto = validarTexto(req.body);
      if (errorTexto) return res.status(400).json({ error: errorTexto });

      const parsedInicio = parseFecha(fecha_inicio, "fecha_inicio");
      if (parsedInicio.error) return res.status(400).json({ error: parsedInicio.error });

      const parsedFinal = parseFecha(fecha_final, "fecha_final");
      if (parsedFinal.error) return res.status(400).json({ error: parsedFinal.error });

      if (parsedFinal.date < parsedInicio.date) {
        return res.status(400).json({ error: "fecha_final no puede ser anterior a fecha_inicio" });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const infra = await prisma.infraestructuraFisica.findFirst({
        where: { id: infraId, ubicacionId: u.ubicacionId },
      });
      if (!infra) {
        return res.status(400).json({
          error: "La instalación no existe o no pertenece a la ubicación indicada",
        });
      }

      const periodo = calcularPeriodoDias(parsedInicio.date, parsedFinal.date);
      const usuarioId = req.user.usuario_id;

      await prisma.medicamento.create({
        data: {
          ubicacionId: u.ubicacionId,
          infraestructuraFisicaId: infraId,
          diagnostico: String(diagnostico).trim(),
          farmaco: String(farmaco).trim(),
          fechaInicio: parsedInicio.date,
          fechaFinal: parsedFinal.date,
          periodo,
          usuarioId,
        },
      });

      res.json({ message: "Registro agregado correctamente" });
    } catch (err) {
      console.error("Error en POST /medicamentos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const errorCampos = validarCamposPermitidos(req.body);
      if (errorCampos) return res.status(400).json({ error: errorCampos });

      const id = Number(req.params.id);
      const existing = await prisma.medicamento.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const {
        ubicacion,
        infraestructura_fisica_id,
        diagnostico,
        farmaco,
        fecha_inicio,
        fecha_final,
      } = req.body;

      if (!ubicacion || !String(ubicacion).trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const infraId = Number(infraestructura_fisica_id);
      if (!Number.isInteger(infraId) || infraId <= 0) {
        return res.status(400).json({ error: "infraestructura_fisica_id inválido" });
      }

      const errorTexto = validarTexto(req.body);
      if (errorTexto) return res.status(400).json({ error: errorTexto });

      const parsedInicio = parseFecha(fecha_inicio, "fecha_inicio");
      if (parsedInicio.error) return res.status(400).json({ error: parsedInicio.error });

      const parsedFinal = parseFecha(fecha_final, "fecha_final");
      if (parsedFinal.error) return res.status(400).json({ error: parsedFinal.error });

      if (parsedFinal.date < parsedInicio.date) {
        return res.status(400).json({ error: "fecha_final no puede ser anterior a fecha_inicio" });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const infra = await prisma.infraestructuraFisica.findFirst({
        where: { id: infraId, ubicacionId: u.ubicacionId },
      });
      if (!infra) {
        return res.status(400).json({
          error: "La instalación no existe o no pertenece a la ubicación indicada",
        });
      }

      const periodo = calcularPeriodoDias(parsedInicio.date, parsedFinal.date);

      await prisma.medicamento.update({
        where: { id },
        data: {
          ubicacionId: u.ubicacionId,
          infraestructuraFisicaId: infraId,
          diagnostico: String(diagnostico).trim(),
          farmaco: String(farmaco).trim(),
          fechaInicio: parsedInicio.date,
          fechaFinal: parsedFinal.date,
          periodo,
        },
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error en PUT /medicamentos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default MedicamentoController;
