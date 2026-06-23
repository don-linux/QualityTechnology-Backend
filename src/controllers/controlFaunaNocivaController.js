import prisma from "../prisma.js";
import { resolverOCrearUbicacion, resolverUbicacion } from "../utils/ubicacion.js";
import { listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeControlFaunaNociva } from "../utils/serializers.js";
import { generarCodigoControlFaunaNociva } from "../utils/controlFaunaNocivaCodigo.js";

const inc = {
  ubicacion: true,
  areaInstalacion: true,
  faunaDetectada: true,
  evidenciaFauna: true,
  estadoTrampa: true,
  accionCorrectiva: true,
};

async function filtroUbicacionControlFaunaNociva(ubicacionQuery) {
  if (!ubicacionQuery || !String(ubicacionQuery).trim()) return {};
  const u = await resolverUbicacion(ubicacionQuery);
  if (u) return { ubicacionId: u.ubicacionId };
  return { ubicacion: { nombre: String(ubicacionQuery).trim() } };
}

function parseOptionalId(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseCondicionMalla(value) {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  const allowed = ["Bueno", "Regular", "Malo"];
  if (!allowed.includes(s)) return null;
  return s;
}

function parseResponsable(value) {
  if (value == null || String(value).trim() === "") return null;
  const s = String(value).trim();
  if (s.length > 100) return { error: "El campo responsable no puede superar los 100 caracteres." };
  return { value: s };
}

class ControlFaunaNocivaController {
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
      const { ubicacion } = req.query;
      const where = await filtroUbicacionControlFaunaNociva(ubicacion);
      const rows = await prisma.controlFaunaNociva.findMany({
        where,
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeControlFaunaNociva));
    } catch (err) {
      console.error("Error GET /control-fauna-nociva:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const usuarioId = req.user?.usuario_id;
      if (!usuarioId) {
        return res.status(401).json({ error: "Token inválido o sin usuario asociado" });
      }

      const responsableParsed = parseResponsable(req.body.responsable ?? req.body.fc_responsable);
      if (responsableParsed?.error) {
        return res.status(400).json({ error: responsableParsed.error });
      }

      const { ubicacion, fd_fecha, ...payload } = req.body;

      let ubicacionId = null;
      let ubicacionNombre = null;
      if (ubicacion != null && String(ubicacion).trim()) {
        const u = await resolverOCrearUbicacion(ubicacion);
        ubicacionId = u?.ubicacionId ?? null;
        ubicacionNombre = u?.nombre ?? null;
      }
      if (!ubicacionId) {
        return res.status(400).json({ error: "La ubicación es obligatoria." });
      }

      const fechaRegistro = fd_fecha ? new Date(fd_fecha) : new Date();
      const dataBase = {
        ubicacionId,
        fecha: fechaRegistro,
        areaInstalacionId: parseOptionalId(
          payload.area_instalacion_id ?? payload.fi_area_instalacion_id,
        ),
        faunaDetectadaId: parseOptionalId(payload.fauna_detectada_id ?? payload.fi_fauna_detectada_id),
        evidenciaFaunaId: parseOptionalId(payload.evidencia_fauna_id ?? payload.fi_evidencia_fauna_id),
        estadoTrampaId: parseOptionalId(payload.estado_trampa_id ?? payload.fi_estado_trampa_id),
        condicionMalla: parseCondicionMalla(payload.condicion_malla ?? payload.fc_condicion_malla),
        accionCorrectivaId: parseOptionalId(
          payload.accion_correctiva_id ?? payload.fi_accion_correctiva_id,
        ),
        responsable: responsableParsed?.value ?? null,
        usuarioId,
      };

      let codigoCreado = null;
      for (let intento = 0; intento < 5; intento++) {
        const codigo = await generarCodigoControlFaunaNociva(prisma, {
          ubicacionNombre,
          fecha: fd_fecha ?? fechaRegistro,
        });
        try {
          await prisma.controlFaunaNociva.create({
            data: { codigo, ...dataBase },
          });
          codigoCreado = codigo;
          break;
        } catch (e) {
          if (e.code === "P2002" && intento < 4) continue;
          throw e;
        }
      }

      res.json({ mensaje: "Registro agregado correctamente", codigo: codigoCreado });
    } catch (err) {
      console.error("Error POST /control-fauna-nociva:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = Number(req.params.id);
      const existing = await prisma.controlFaunaNociva.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;
      const { ubicacion, fd_fecha, ...payload } = req.body;

      let responsable = existing.responsable;
      if (req.body.responsable !== undefined || req.body.fc_responsable !== undefined) {
        const parsed = parseResponsable(req.body.responsable ?? req.body.fc_responsable);
        if (parsed?.error) {
          return res.status(400).json({ error: parsed.error });
        }
        responsable = parsed?.value ?? null;
      }

      let ubicacionId = existing.ubicacionId;
      if (ubicacion !== undefined) {
        if (ubicacion == null || !String(ubicacion).trim()) {
          ubicacionId = null;
        } else {
          const u = await resolverOCrearUbicacion(ubicacion);
          ubicacionId = u?.ubicacionId ?? null;
        }
      }

      await prisma.controlFaunaNociva.update({
        where: { id },
        data: {
          ubicacionId,
          fecha: fd_fecha ? new Date(fd_fecha) : existing.fecha,
          areaInstalacionId:
            payload.area_instalacion_id !== undefined || payload.fi_area_instalacion_id !== undefined
              ? parseOptionalId(payload.area_instalacion_id ?? payload.fi_area_instalacion_id)
              : existing.areaInstalacionId,
          faunaDetectadaId:
            payload.fauna_detectada_id !== undefined || payload.fi_fauna_detectada_id !== undefined
              ? parseOptionalId(payload.fauna_detectada_id ?? payload.fi_fauna_detectada_id)
              : existing.faunaDetectadaId,
          evidenciaFaunaId:
            payload.evidencia_fauna_id !== undefined || payload.fi_evidencia_fauna_id !== undefined
              ? parseOptionalId(payload.evidencia_fauna_id ?? payload.fi_evidencia_fauna_id)
              : existing.evidenciaFaunaId,
          estadoTrampaId:
            payload.estado_trampa_id !== undefined || payload.fi_estado_trampa_id !== undefined
              ? parseOptionalId(payload.estado_trampa_id ?? payload.fi_estado_trampa_id)
              : existing.estadoTrampaId,
          condicionMalla:
            payload.condicion_malla !== undefined || payload.fc_condicion_malla !== undefined
              ? parseCondicionMalla(payload.condicion_malla ?? payload.fc_condicion_malla)
              : existing.condicionMalla,
          accionCorrectivaId:
            payload.accion_correctiva_id !== undefined || payload.fi_accion_correctiva_id !== undefined
              ? parseOptionalId(payload.accion_correctiva_id ?? payload.fi_accion_correctiva_id)
              : existing.accionCorrectivaId,
          responsable,
          usuarioId,
        },
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error PUT /control-fauna-nociva:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await prisma.controlFaunaNociva.delete({ where: { id: Number(req.params.id) } });
      res.json({ message: "Registro eliminado correctamente" });
    } catch (err) {
      if (err.code === "P2025") {
        return res.status(404).json({ error: "Registro no encontrado" });
      }
      console.error("Error DELETE /control-fauna-nociva:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteAll(req, res) {
    try {
      const { ubicacion } = req.query;
      if (ubicacion) {
        const where = await filtroUbicacionControlFaunaNociva(ubicacion);
        await prisma.controlFaunaNociva.deleteMany({ where });
        res.json({ message: `Todos los registros de ${ubicacion} eliminados.` });
      } else {
        await prisma.controlFaunaNociva.deleteMany();
        res.json({ message: "Todos los registros eliminados (todas las ubicaciones)." });
      }
    } catch (err) {
      console.error("Error DELETE /control-fauna-nociva:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default ControlFaunaNocivaController;
