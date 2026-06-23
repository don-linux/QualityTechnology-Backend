import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeMedicamento } from "../utils/serializers.js";

const LIMITES_MEDICAMENTOS_TEXTO = {
  fc_diagnosis: 500,
  fc_tratamiento: 500,
  fc_dosis: 100,
  fc_forma_aplicacion: 100,
  fc_responsable: 100,
};

const validarLongitudesMedicamentos = (body) => {
  const etiquetas = {
    fc_diagnosis: "El diagnóstico",
    fc_tratamiento: "El tratamiento",
    fc_dosis: "La dosis",
    fc_forma_aplicacion: "La forma de aplicación",
    fc_responsable: "El responsable",
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
        fd_fecha_hora,
        fn_num_estanque,
        fc_diagnosis,
        fc_tratamiento,
        fc_dosis,
        fc_forma_aplicacion,
        fd_fecha_ultima_dosis,
        fc_responsable,
        fc_observaciones,
      } = req.body;
      const fi_usuario_id = req.user.usuario_id;

      if (!fd_fecha_hora) {
        return res.status(400).json({ error: "La fecha es obligatoria (fd_fecha_hora)" });
      }
      if (!fn_num_estanque) {
        return res.status(400).json({ error: "El número de estanque es obligatorio" });
      }

      const numEstanque = BitacoraMedicamentoController.parseNum(fn_num_estanque);
      if (numEstanque == null || Number.isNaN(numEstanque)) {
        return res.status(400).json({ error: "fn_num_estanque debe ser numérico" });
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
          texto: fc_observaciones ?? null,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.medicamento.create({
          data: {
            ubicacionId: u.ubicacionId,
            fechaHora: new Date(fd_fecha_hora),
            numero_estanque: Math.trunc(numEstanque),
            diagnostico: fc_diagnosis || null,
            tratamiento: fc_tratamiento || null,
            dosis: fc_dosis || null,
            formaAplicacion: fc_forma_aplicacion || null,
            fechaUltimaDosis: fd_fecha_ultima_dosis ? new Date(fd_fecha_ultima_dosis) : null,
            responsable: fc_responsable || null,
            usuarioId: fi_usuario_id,
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
        fd_fecha_hora,
        fn_num_estanque,
        fc_diagnosis,
        fc_tratamiento,
        fc_dosis,
        fc_forma_aplicacion,
        fd_fecha_ultima_dosis,
        fc_responsable,
        fc_observaciones,
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

      const fi_usuario_id = req.user?.usuario_id ?? existing.usuarioId;

      const texto =
        fc_observaciones !== undefined
          ? fc_observaciones
          : existing.observacion?.comentario ?? null;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.medicamento.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            fechaHora: fd_fecha_hora ? new Date(fd_fecha_hora) : existing.fechaHora,
            numero_estanque:
              BitacoraMedicamentoController.parseNum(fn_num_estanque) != null
                ? Math.trunc(BitacoraMedicamentoController.parseNum(fn_num_estanque))
                : existing.numero_estanque,
            diagnostico: fc_diagnosis !== undefined ? fc_diagnosis || null : existing.diagnostico,
            tratamiento:
              fc_tratamiento !== undefined ? fc_tratamiento || null : existing.tratamiento,
            dosis: fc_dosis !== undefined ? fc_dosis || null : existing.dosis,
            formaAplicacion:
              fc_forma_aplicacion !== undefined
                ? fc_forma_aplicacion || null
                : existing.formaAplicacion,
            fechaUltimaDosis: fd_fecha_ultima_dosis
              ? new Date(fd_fecha_ultima_dosis)
              : existing.fechaUltimaDosis,
            responsable: fc_responsable !== undefined ? fc_responsable || null : existing.responsable,
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
