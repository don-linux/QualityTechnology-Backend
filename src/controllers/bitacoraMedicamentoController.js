import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeMedicamento } from "../utils/serializers.js";

const LIMITES_MEDICAMENTOS_TEXTO = {
  diagnostico: 500,
  tratamiento: 500,
  dosis: 100,
  forma_aplicacion: 100,
  responsable: 100,
};

const validarLongitudesMedicamentos = (body) => {
  const etiquetas = {
    diagnostico: "El diagnóstico",
    tratamiento: "El tratamiento",
    dosis: "La dosis",
    forma_aplicacion: "La forma de aplicación",
    responsable: "El responsable",
  };
  for (const [campo, max] of Object.entries(LIMITES_MEDICAMENTOS_TEXTO)) {
    const len = body[campo] == null ? 0 : String(body[campo]).length;
    if (len > max) {
      return `${etiquetas[campo]} no puede superar los ${max} caracteres.`;
    }
  }
  return null;
};

const inc = { ubicacion: true, observacion: true };

class BitacoraMedicamentoController {
  static parseNum(v) {
    return v === "" || v == null ? null : Number(v);
  }

  static async getAll(req, res) {
    try {
      const rows = await prisma.medicamento.findMany({
        include: inc,
        orderBy: { fechaHora: "desc" },
      });
      res.json(rows.map(serializeMedicamento));
    } catch (err) {
      console.error("Error en GET /medicamentos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async getEmpleados(req, res) {
    try {
      const empleados = await listarEmpleadosActivosBitacora();
      res.json(empleados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const {
        fecha_hora,
        numero_estanque,
        diagnostico,
        tratamiento,
        dosis,
        forma_aplicacion,
        fecha_ultima_dosis,
        responsable,
        observaciones,
      } = req.body;
      const usuarioId = req.user.usuario_id;

      if (!fecha_hora) {
        return res.status(400).json({ error: "La fecha es obligatoria" });
      }
      if (!numero_estanque) {
        return res.status(400).json({ error: "El número de estanque es obligatorio" });
      }

      const numEstanque = BitacoraMedicamentoController.parseNum(numero_estanque);
      if (numEstanque == null || Number.isNaN(numEstanque)) {
        return res.status(400).json({ error: "numero_estanque debe ser numérico" });
      }

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const errorLongitud = validarLongitudesMedicamentos(req.body);
      if (errorLongitud) {
        return res.status(400).json({ error: errorLongitud });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: observaciones ?? null,
          responsable: null,
          usuarioId,
        });

        await tx.medicamento.create({
          data: {
            ubicacionId: u.ubicacionId,
            fechaHora: new Date(fecha_hora),
            numero_estanque: Math.trunc(numEstanque),
            diagnostico: diagnostico || null,
            tratamiento: tratamiento || null,
            dosis: dosis || null,
            formaAplicacion: forma_aplicacion || null,
            fechaUltimaDosis: fecha_ultima_dosis ? new Date(fecha_ultima_dosis) : null,
            responsable: responsable || null,
            usuarioId,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro agregado correctamente" });
    } catch (err) {
      console.error("Error en POST /medicamentos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const {
        fecha_hora,
        numero_estanque,
        diagnostico,
        tratamiento,
        dosis,
        forma_aplicacion,
        fecha_ultima_dosis,
        responsable,
        observaciones,
      } = req.body;

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const errorLongitud = validarLongitudesMedicamentos(req.body);
      if (errorLongitud) {
        return res.status(400).json({ error: errorLongitud });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.medicamento.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;

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

        await tx.medicamento.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            fechaHora: fecha_hora ? new Date(fecha_hora) : existing.fechaHora,
            numero_estanque:
              BitacoraMedicamentoController.parseNum(numero_estanque) != null
                ? Math.trunc(BitacoraMedicamentoController.parseNum(numero_estanque))
                : existing.numero_estanque,
            diagnostico: diagnostico !== undefined ? diagnostico || null : existing.diagnostico,
            tratamiento:
              tratamiento !== undefined ? tratamiento || null : existing.tratamiento,
            dosis: dosis !== undefined ? dosis || null : existing.dosis,
            formaAplicacion:
              forma_aplicacion !== undefined
                ? forma_aplicacion || null
                : existing.formaAplicacion,
            fechaUltimaDosis: fecha_ultima_dosis
              ? new Date(fecha_ultima_dosis)
              : existing.fechaUltimaDosis,
            responsable: responsable !== undefined ? responsable || null : existing.responsable,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error en PUT /medicamentos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

}

export default BitacoraMedicamentoController;
