import prisma from "../prisma.js";
import { resolverOCrearUbicacion, resolverUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora, parseTimeOrNull } from "../utils/bitacoraHelpers.js";
import { serializeParametrosFisicoQuimico } from "../utils/serializers.js";
import { generarCodigoParametrosFisicoQuimicos } from "../utils/parametrosFisicoQuimicosCodigo.js";
import { inferirTurnoMuestreo, esTurnoMuestreoValido } from "../utils/turnoMuestreo.js";
import { parametroNumericoToDbString } from "../utils/parametroNumericoNA.js";

const COLORACIONES_AGUA = ["Agua transparente", "Agua roja", "Agua verde"];

const CAMPOS_NA = ["ph", "amonio", "nitrito", "nitrato", "transparencia_sechhi"];

const inc = {
  ubicacion: true,
  pileta: { include: { tipoPileta: true } },
  observacion: true,
};

async function filtroUbicacionParametrosFisicoQuimicos(ubicacionQuery) {
  if (!ubicacionQuery || !String(ubicacionQuery).trim()) return {};
  const u = await resolverUbicacion(ubicacionQuery);
  if (u) return { ubicacionId: u.ubicacionId };
  return { ubicacion: { nombre: String(ubicacionQuery).trim() } };
}

function parseNum(value) {
  if (value === "" || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseResponsable(value) {
  if (value == null || String(value).trim() === "") return null;
  const s = String(value).trim();
  if (s.length > 100) return { error: "El campo responsable no puede superar los 100 caracteres." };
  return { value: s };
}

function parseColoracionAgua(value) {
  if (value == null || String(value).trim() === "") return null;
  const s = String(value).trim();
  if (!COLORACIONES_AGUA.includes(s)) return { error: "Coloración del agua inválida." };
  return { value: s };
}

function parseHoraToHHMM(value) {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
    if (match) return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
  }
  const d = parseTimeOrNull(value);
  if (!d) return null;
  return d.toISOString().slice(11, 16);
}

function parseCampoNA(body, field) {
  const noAplica = body[`${field}_no_aplica`];
  return parametroNumericoToDbString(body[field], noAplica === true || noAplica === "true" || noAplica === 1);
}

function parseCampoNumericoObligatorio(body, field, label) {
  const n = parseNum(body[field]);
  if (n == null) return { error: `${label} es obligatorio.` };
  return { value: String(n) };
}

class ParametrosFisicoQuimicosController {
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
      const where = await filtroUbicacionParametrosFisicoQuimicos(ubicacion);
      const rows = await prisma.parametrosFisicoQuimico.findMany({
        where,
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeParametrosFisicoQuimico));
    } catch (err) {
      console.error("Error GET /parametros-fisico-quimicos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const usuarioId = req.user?.usuario_id;
      if (!usuarioId) {
        return res.status(401).json({ error: "Token inválido o sin usuario asociado" });
      }

      const body = req.body;
      const { ubicacion, fecha, hora, observaciones } = body;

      if (!fecha) {
        return res.status(400).json({ error: "La fecha es obligatoria." });
      }

      const horaHHMM = parseHoraToHHMM(hora);
      if (!horaHHMM) {
        return res.status(400).json({ error: "La hora es obligatoria." });
      }

      const piletaId = parseNum(body.pileta_id);
      if (piletaId == null) {
        return res.status(400).json({ error: "La instalación (pileta) es obligatoria." });
      }

      const responsableParsed = parseResponsable(body.responsable);
      if (responsableParsed?.error) {
        return res.status(400).json({ error: responsableParsed.error });
      }
      if (!responsableParsed?.value) {
        return res.status(400).json({ error: "El responsable es obligatorio." });
      }

      const coloracionParsed = parseColoracionAgua(body.coloracion_agua);
      if (coloracionParsed?.error) {
        return res.status(400).json({ error: coloracionParsed.error });
      }
      if (!coloracionParsed?.value) {
        return res.status(400).json({ error: "La coloración del agua es obligatoria." });
      }

      const oxigenoParsed = parseCampoNumericoObligatorio(body, "oxigeno", "Oxígeno");
      if (oxigenoParsed.error) return res.status(400).json({ error: oxigenoParsed.error });

      const tempAguaParsed = parseCampoNumericoObligatorio(body, "temperatura_agua", "Temperatura del agua");
      if (tempAguaParsed.error) return res.status(400).json({ error: tempAguaParsed.error });

      const tempAmbParsed = parseCampoNumericoObligatorio(body, "temperatura_ambiente", "Temperatura ambiente");
      if (tempAmbParsed.error) return res.status(400).json({ error: tempAmbParsed.error });

      for (const field of CAMPOS_NA) {
        const val = parseCampoNA(body, field);
        if (val === null && !body[`${field}_no_aplica`]) {
          const labels = {
            ph: "pH",
            amonio: "Amonio",
            nitrito: "Nitrito",
            nitrato: "Nitrato",
            transparencia_sechhi: "Transparencia Secchi",
          };
          return res.status(400).json({ error: `${labels[field]} es obligatorio o debe marcarse N/A.` });
        }
      }

      if (!ubicacion || !String(ubicacion).trim()) {
        return res.status(400).json({ error: "La ubicación es obligatoria." });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u?.ubicacionId) {
        return res.status(400).json({ error: "Ubicación inválida." });
      }

      const pileta = await prisma.pileta.findFirst({
        where: { id: Math.trunc(piletaId), ubicacionId: u.ubicacionId },
      });
      if (!pileta) {
        return res.status(400).json({ error: "La pileta no existe en la ubicación seleccionada." });
      }

      let turnoMuestreo = body.turno_muestreo?.trim() || inferirTurnoMuestreo(horaHHMM);
      if (!esTurnoMuestreoValido(turnoMuestreo)) {
        turnoMuestreo = inferirTurnoMuestreo(horaHHMM);
      }

      const fechaRegistro = new Date(fecha);
      const horaParsed = parseTimeOrNull(horaHHMM);

      let codigoCreado = null;
      for (let intento = 0; intento < 5; intento++) {
        const codigo = await generarCodigoParametrosFisicoQuimicos(prisma, { fecha });
        try {
          await prisma.$transaction(async (tx) => {
            const observacionId = await guardarObservacion(tx, {
              observacionIdExistente: null,
              texto: observaciones ?? null,
              responsable: null,
              usuarioId,
            });

            await tx.parametrosFisicoQuimico.create({
              data: {
                codigo,
                ubicacionId: u.ubicacionId,
                fecha: fechaRegistro,
                hora: horaParsed,
                turnoMuestreo,
                piletaId: Math.trunc(piletaId),
                oxigeno: oxigenoParsed.value,
                temperaturaAgua: tempAguaParsed.value,
                temperaturaAmbiente: tempAmbParsed.value,
                ph: parseCampoNA(body, "ph"),
                amonio: parseCampoNA(body, "amonio"),
                nitrito: parseCampoNA(body, "nitrito"),
                nitrato: parseCampoNA(body, "nitrato"),
                transparenciaSechhi: parseCampoNA(body, "transparencia_sechhi"),
                coloracionAgua: coloracionParsed.value,
                responsable: responsableParsed.value,
                usuarioId,
                observacionId,
              },
            });
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
      console.error("Error POST /parametros-fisico-quimicos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const id = Number(req.params.id);
      const existing = await prisma.parametrosFisicoQuimico.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const usuarioId = req.user?.usuario_id ?? existing.usuarioId;
      const body = req.body;

      let ubicacionId = existing.ubicacionId;
      if (body.ubicacion !== undefined) {
        if (!body.ubicacion || !String(body.ubicacion).trim()) {
          return res.status(400).json({ error: "La ubicación es obligatoria." });
        }
        const u = await resolverOCrearUbicacion(body.ubicacion);
        if (!u?.ubicacionId) {
          return res.status(400).json({ error: "Ubicación inválida." });
        }
        ubicacionId = u.ubicacionId;
      }

      let piletaId = existing.piletaId;
      if (body.pileta_id !== undefined) {
        const parsed = parseNum(body.pileta_id);
        if (parsed == null) {
          return res.status(400).json({ error: "La instalación (pileta) es obligatoria." });
        }
        const pileta = await prisma.pileta.findFirst({
          where: { id: Math.trunc(parsed), ubicacionId },
        });
        if (!pileta) {
          return res.status(400).json({ error: "La pileta no existe en la ubicación seleccionada." });
        }
        piletaId = Math.trunc(parsed);
      }

      let horaParsed = existing.hora;
      let horaHHMM = parseHoraToHHMM(existing.hora);
      if (body.hora !== undefined) {
        horaHHMM = parseHoraToHHMM(body.hora);
        if (!horaHHMM) {
          return res.status(400).json({ error: "La hora es obligatoria." });
        }
        horaParsed = parseTimeOrNull(horaHHMM);
      }

      let turnoMuestreo = existing.turnoMuestreo;
      if (body.turno_muestreo !== undefined) {
        const t = String(body.turno_muestreo ?? "").trim();
        if (!esTurnoMuestreoValido(t)) {
          return res.status(400).json({ error: "Turno de muestreo inválido." });
        }
        turnoMuestreo = t;
      } else if (body.hora !== undefined) {
        turnoMuestreo = inferirTurnoMuestreo(horaHHMM);
      }

      let responsable = existing.responsable;
      if (body.responsable !== undefined) {
        const parsed = parseResponsable(body.responsable);
        if (parsed?.error) return res.status(400).json({ error: parsed.error });
        if (!parsed?.value) return res.status(400).json({ error: "El responsable es obligatorio." });
        responsable = parsed.value;
      }

      let coloracionAgua = existing.coloracionAgua;
      if (body.coloracion_agua !== undefined) {
        const parsed = parseColoracionAgua(body.coloracion_agua);
        if (parsed?.error) return res.status(400).json({ error: parsed.error });
        if (!parsed?.value) return res.status(400).json({ error: "La coloración del agua es obligatoria." });
        coloracionAgua = parsed.value;
      }

      const decStr = (field) => {
        if (body[field] === undefined && body[`${field}_no_aplica`] === undefined) return undefined;
        return parseCampoNA(body, field);
      };

      const oxigeno =
        body.oxigeno !== undefined ? parseCampoNumericoObligatorio(body, "oxigeno", "Oxígeno") : undefined;
      if (oxigeno?.error) return res.status(400).json({ error: oxigeno.error });

      const temperaturaAgua =
        body.temperatura_agua !== undefined
          ? parseCampoNumericoObligatorio(body, "temperatura_agua", "Temperatura del agua")
          : undefined;
      if (temperaturaAgua?.error) return res.status(400).json({ error: temperaturaAgua.error });

      const temperaturaAmbiente =
        body.temperatura_ambiente !== undefined
          ? parseCampoNumericoObligatorio(body, "temperatura_ambiente", "Temperatura ambiente")
          : undefined;
      if (temperaturaAmbiente?.error) return res.status(400).json({ error: temperaturaAmbiente.error });

      const texto =
        body.observaciones !== undefined
          ? body.observaciones
          : existing.observacion?.comentario ?? null;

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto,
          responsable: null,
          usuarioId,
        });

        await tx.parametrosFisicoQuimico.update({
          where: { id },
          data: {
            ubicacionId,
            fecha: body.fecha ? new Date(body.fecha) : existing.fecha,
            hora: horaParsed,
            turnoMuestreo,
            piletaId,
            oxigeno: oxigeno !== undefined ? oxigeno.value : existing.oxigeno,
            temperaturaAgua:
              temperaturaAgua !== undefined ? temperaturaAgua.value : existing.temperaturaAgua,
            temperaturaAmbiente:
              temperaturaAmbiente !== undefined ? temperaturaAmbiente.value : existing.temperaturaAmbiente,
            ph: decStr("ph") !== undefined ? decStr("ph") : existing.ph,
            amonio: decStr("amonio") !== undefined ? decStr("amonio") : existing.amonio,
            nitrito: decStr("nitrito") !== undefined ? decStr("nitrito") : existing.nitrito,
            nitrato: decStr("nitrato") !== undefined ? decStr("nitrato") : existing.nitrato,
            transparenciaSechhi:
              decStr("transparencia_sechhi") !== undefined
                ? decStr("transparencia_sechhi")
                : existing.transparenciaSechhi,
            coloracionAgua,
            responsable,
            observacionId,
          },
        });
      });

      res.json({ mensaje: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error PUT /parametros-fisico-quimicos:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default ParametrosFisicoQuimicosController;
