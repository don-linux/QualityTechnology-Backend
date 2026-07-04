import prisma from "../prisma.js";
import { listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeBiometria } from "../utils/serializers.js";
import { crearObservacionSiHay } from "../utils/observacion.js";
import { infraestructuraFisicaWhereUbicacionFromRequest } from "../utils/granjaUbicacion.js";

// El schema actual de Biometria se relaciona directamente con InfraestructuraFisica
// (`infraestructura_fisica_id`) y ya no con Instalacion/Ubicacion ni Reproductor por FK
// directa. Tampoco existen los campos `tipo`, `observacionId` ni
// `instalacionId`. Conservamos las rutas y traducimos el body al nuevo
// modelo: se requiere `infraestructura_fisica_id`.

const MAX_OBSERVACIONES = 500;
const MAX_RESPONSABLE = 120;

const bitacoraInclude = {
  infraestructuraFisica: { include: { ubicacion: true } },
  observacionBiometria: true,
};

async function syncObservacionBiometria(tx, biometriaId, infraestructuraFisicaId, usuarioId, textoObs) {
  const t =
    textoObs != null && String(textoObs).trim()
      ? String(textoObs).trim().slice(0, MAX_OBSERVACIONES)
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
          infraestructura_fisica_id: infraestructuraFisicaId,
          proceso: "biometria",
          usuario_id: usuarioId,
        },
      });
      return existing.id;
    }
    return crearObservacionSiHay(tx, t, usuarioId, {
      infraestructuraFisicaId,
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
  const obsLen = body.observaciones == null ? 0 : String(body.observaciones).length;
  if (obsLen > MAX_OBSERVACIONES) {
    return `Las observaciones no pueden superar los ${MAX_OBSERVACIONES} caracteres.`;
  }
  const respLen = body.responsable == null ? 0 : String(body.responsable).length;
  if (respLen > MAX_RESPONSABLE) {
    return `El responsable no puede superar los ${MAX_RESPONSABLE} caracteres.`;
  }
  return null;
};

class BiometriaController {
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
      const ubicClause = infraestructuraFisicaWhereUbicacionFromRequest(req);
      if (!ubicClause) return res.json([]);
      const rows = await prisma.biometria.findMany({
        where: {
          infraestructuraFisica: ubicClause,
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
      const { fecha, peso_total_gramos, organismos_muestreados, responsable } = req.body;
      const usuarioId = req.user.usuario_id;

      const errorTexto = validarTextosBiometria(req.body);
      if (errorTexto) {
        return res.status(400).json({ error: errorTexto });
      }

      const infraestructuraFisicaId = toInt(pick(req.body, "infraestructura_fisica_id"));
      if (!infraestructuraFisicaId) {
        return res.status(400).json({ error: "infraestructura_fisica_id es obligatorio en el schema actual" });
      }

      const pesoProm =
        peso_total_gramos > 0 && organismos_muestreados > 0
          ? Number(peso_total_gramos) / Number(organismos_muestreados)
          : 0;

      const fechaRegistro = fecha ? new Date(fecha) : new Date();

      const row = await prisma.$transaction(async (tx) => {
        const bio = await tx.biometria.create({
          data: {
            infraestructura_fisica_id: infraestructuraFisicaId,
            fecha: fechaRegistro,
            pesoTotalGramos:
              peso_total_gramos === "" || peso_total_gramos == null
                ? null
                : String(peso_total_gramos),
            organismosMuestreados:
              organismos_muestreados === "" || organismos_muestreados == null
                ? null
                : Number(organismos_muestreados),
            pesoPromedio: pesoProm,
            responsable: responsable || null,
            usuarioId,
          },
        });

        await syncObservacionBiometria(
          tx,
          bio.id,
          infraestructuraFisicaId,
          usuarioId,
          pick(req.body, "observaciones"),
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
        return res.status(400).json({ error: "InfraestructuraFisica invalida" });
      }
      console.error("POST /biometrias Error:", err);
      res.status(500).json({ error: "Error creando biometría" });
    }
  }

  static async update(req, res) {
    try {
      const id = toInt(req.params.id);
      if (!id) return res.status(400).json({ error: "id invalido" });

      const { fecha, peso_total_gramos, organismos_muestreados, responsable } = req.body;
      const usuarioId = req.user.usuario_id;

      const errorTexto = validarTextosBiometria(req.body);
      if (errorTexto) {
        return res.status(400).json({ error: errorTexto });
      }

      const prev = await prisma.biometria.findUnique({
        where: { id },
        select: { infraestructura_fisica_id: true },
      });
      if (!prev) return res.status(404).json({ error: "Biometría no encontrada" });

      const updateData = {};
      const infraestructuraFisicaId = toInt(pick(req.body, "infraestructura_fisica_id"));
      if (infraestructuraFisicaId !== null) updateData.infraestructura_fisica_id = infraestructuraFisicaId;

      const infraestructuraFisicaFinal =
        infraestructuraFisicaId !== null && infraestructuraFisicaId !== undefined ? infraestructuraFisicaId : prev.infraestructura_fisica_id;

      if (fecha !== undefined) updateData.fecha = new Date(fecha);
      if (peso_total_gramos !== undefined) {
        updateData.pesoTotalGramos =
          peso_total_gramos === "" || peso_total_gramos == null
            ? null
            : String(peso_total_gramos);
      }
      if (organismos_muestreados !== undefined) {
        updateData.organismosMuestreados =
          organismos_muestreados === "" || organismos_muestreados == null
            ? null
            : Number(organismos_muestreados);
      }
      if (
        peso_total_gramos !== undefined &&
        organismos_muestreados !== undefined &&
        peso_total_gramos > 0 &&
        organismos_muestreados > 0
      ) {
        updateData.pesoPromedio = Number(peso_total_gramos) / Number(organismos_muestreados);
      }
      if (responsable !== undefined) updateData.responsable = responsable || null;
      updateData.usuarioId = usuarioId;

      const textoObsExplicito = req.body.observaciones !== undefined;

      await prisma.$transaction(async (tx) => {
        await tx.biometria.update({
          where: { id },
          data: updateData,
        });
        if (textoObsExplicito) {
          await syncObservacionBiometria(
            tx,
            id,
            infraestructuraFisicaFinal,
            usuarioId,
            pick(req.body, "observaciones"),
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
    // relacion directa es con InfraestructuraFisica. Quien necesite info debe consultar
    // por infraestructura_fisica_id.
    res.json({ tipo: null });
  }

}

export default BiometriaController;
