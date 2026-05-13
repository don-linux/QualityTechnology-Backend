import prisma from "../prisma.js";
import { listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeBiometria } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";

// El schema actual de Biometria se relaciona directamente con Pileta
// (`pileta_id`) y ya no con Instalacion/Ubicacion ni Reproductor por FK
// directa. Tampoco existen los campos `tipo`, `observacionId` ni
// `instalacionId`. Conservamos las rutas y traducimos el body antiguo al
// nuevo modelo: `fi_instalacion_id` se ignora; se requiere `pileta_id`.

const MAX_FC_OBSERVACIONES = 500;
const MAX_FC_ENCARGADO = 100;

const bitacoraInclude = {
  piletas: { include: { ubicacion: true } },
  observacionBiometria: true,
};

async function syncObservacionBiometria(tx, biometriaId, piletaId, usuarioId, textoObs) {
  const t =
    textoObs != null && String(textoObs).trim()
      ? String(textoObs).trim().slice(0, MAX_FC_OBSERVACIONES)
      : null;

  const existing = await tx.observacion.findFirst({
    where: { biometria_id: biometriaId },
  });

  if (t) {
    if (existing) {
      await tx.observacion.update({
        where: { id: existing.id },
        data: {
          comentario: t,
          pileta_id: piletaId,
          proceso: "biometria",
          usuario_id: usuarioId,
        },
      });
      return existing.id;
    }
    return crearObservacionSiHay(tx, t, usuarioId, {
      piletaId,
      proceso: "biometria",
      biometriaId,
    });
  }

  if (existing) {
    await tx.observacion.delete({ where: { id: existing.id } });
  }
  return null;
}

function pick(body, ...keys) {
  for (const k of keys) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== "") return body[k];
  }
  return undefined;
}

function toInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

const validarTextosBiometria = (body) => {
  const obsLen = body.fc_observaciones == null ? 0 : String(body.fc_observaciones).length;
  if (obsLen > MAX_FC_OBSERVACIONES) {
    return `Las observaciones no pueden superar los ${MAX_FC_OBSERVACIONES} caracteres.`;
  }
  const encLen = body.fc_encargado == null ? 0 : String(body.fc_encargado).length;
  if (encLen > MAX_FC_ENCARGADO) {
    return `El encargado no puede superar los ${MAX_FC_ENCARGADO} caracteres.`;
  }
  return null;
};

class BitacoraBiometriaController {
  static async getAll(req, res) {
    try {
      const rows = await prisma.biometria.findMany({
        include: bitacoraInclude,
        orderBy: { fecha: "desc" },
      });
      res.json(rows.map(serializeBiometria));
    } catch (err) {
      console.error("GET /biometrias Error:", err);
      res.status(500).json({ error: "Error obteniendo biometrías" });
    }
  }

  static async getByGranja(req, res) {
    try {
      const granja = String(req.params.granja ?? "").trim();
      if (!granja) return res.json([]);
      const rows = await prisma.biometria.findMany({
        where: {
          piletas: {
            ubicacion: { nombre: { equals: granja, mode: "insensitive" } },
          },
        },
        include: bitacoraInclude,
        orderBy: { fecha: "desc" },
      });
      res.json(rows.map(serializeBiometria));
    } catch (err) {
      console.error("GET /biometrias Error:", err);
      res.status(500).json({ error: "Error obteniendo biometrías" });
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
      const { fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fc_encargado } = req.body;
      const fi_usuario_id = req.user.usuario_id;

      const errorTexto = validarTextosBiometria(req.body);
      if (errorTexto) {
        return res.status(400).json({ error: errorTexto });
      }

      const piletaId = toInt(pick(req.body, "pileta_id", "fi_pileta_id"));
      if (!piletaId) {
        return res.status(400).json({ error: "pileta_id es obligatorio en el schema actual" });
      }

      const pesoProm =
        fn_peso_total_gramos > 0 && fn_organismos_muestreados > 0
          ? Number(fn_peso_total_gramos) / Number(fn_organismos_muestreados)
          : 0;

      const fecha = fd_fecha ? new Date(fd_fecha) : new Date();

      const row = await prisma.$transaction(async (tx) => {
        const bio = await tx.biometria.create({
          data: {
            pileta_id: piletaId,
            fecha,
            pesoTotalGramos:
              fn_peso_total_gramos === "" || fn_peso_total_gramos == null
                ? null
                : String(fn_peso_total_gramos),
            organismosMuestreados:
              fn_organismos_muestreados === "" || fn_organismos_muestreados == null
                ? null
                : Number(fn_organismos_muestreados),
            pesoPromedio: pesoProm,
            encargado: fc_encargado || null,
            usuarioId: fi_usuario_id,
          },
        });

        await syncObservacionBiometria(
          tx,
          bio.id,
          piletaId,
          fi_usuario_id,
          pick(req.body, "fc_observaciones", "observaciones"),
        );

        return tx.biometria.findUnique({
          where: { id: bio.id },
          include: bitacoraInclude,
        });
      });

      res.json({
        message: "Biometría registrada",
        id: row.id,
        data: serializeBiometria(row),
      });
    } catch (err) {
      if (err.code === "P2003") {
        return res.status(400).json({ error: "Pileta invalida" });
      }
      console.error("POST /biometrias Error:", err);
      res.status(500).json({ error: "Error creando biometría" });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const { fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fc_encargado } = req.body;
      const fi_usuario_id = req.user.usuario_id;

      const errorTexto = validarTextosBiometria(req.body);
      if (errorTexto) {
        return res.status(400).json({ error: errorTexto });
      }

      const prev = await prisma.biometria.findUnique({
        where: { id },
        select: { pileta_id: true },
      });
      if (!prev) return res.status(404).json({ error: "Biometría no encontrada" });

      const updateData = {};
      const piletaId = toInt(pick(req.body, "pileta_id", "fi_pileta_id"));
      if (piletaId !== null) updateData.pileta_id = piletaId;

      const piletaFinal =
        piletaId !== null && piletaId !== undefined ? piletaId : prev.pileta_id;

      if (fd_fecha !== undefined) updateData.fecha = new Date(fd_fecha);
      if (fn_peso_total_gramos !== undefined) {
        updateData.pesoTotalGramos =
          fn_peso_total_gramos === "" || fn_peso_total_gramos == null
            ? null
            : String(fn_peso_total_gramos);
      }
      if (fn_organismos_muestreados !== undefined) {
        updateData.organismosMuestreados =
          fn_organismos_muestreados === "" || fn_organismos_muestreados == null
            ? null
            : Number(fn_organismos_muestreados);
      }
      if (
        fn_peso_total_gramos !== undefined &&
        fn_organismos_muestreados !== undefined &&
        fn_peso_total_gramos > 0 &&
        fn_organismos_muestreados > 0
      ) {
        updateData.pesoPromedio = Number(fn_peso_total_gramos) / Number(fn_organismos_muestreados);
      }
      if (fc_encargado !== undefined) updateData.encargado = fc_encargado || null;
      updateData.usuarioId = fi_usuario_id;

      const textoObsExplicito =
        req.body.fc_observaciones !== undefined || req.body.observaciones !== undefined;

      await prisma.$transaction(async (tx) => {
        await tx.biometria.update({
          where: { id },
          data: updateData,
        });
        if (textoObsExplicito) {
          await syncObservacionBiometria(
            tx,
            id,
            piletaFinal,
            fi_usuario_id,
            pick(req.body, "fc_observaciones", "observaciones"),
          );
        }
      });

      const out = await prisma.biometria.findUnique({
        where: { id },
        include: bitacoraInclude,
      });

      res.json({ message: "Biometría actualizada", data: serializeBiometria(out) });
    } catch (err) {
      if (err.code === "P2025") return res.status(404).json({ error: "Biometría no encontrada" });
      console.error("PUT /biometrias Error:", err);
      res.status(500).json({ error: "Error actualizando biometría" });
    }
  }

  static async getInfo(req, res) {
    // El schema actual no permite resolver biometria por instalacion: la
    // relacion directa es con Pileta. Quien necesite info debe consultar
    // por pileta_id.
    res.json({ tipo: null });
  }

  static async delete(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });
      try {
        await prisma.biometria.delete({ where: { id } });
      } catch (e) {
        if (e.code === "P2025") {
          return res.status(404).json({ error: "Biometría no encontrada" });
        }
        throw e;
      }
      res.json({ message: "Biometría eliminada correctamente" });
    } catch (err) {
      console.error("DELETE /biometrias Error:", err);
      res.status(500).json({ error: "Error eliminando biometría" });
    }
  }
}

export default BitacoraBiometriaController;
