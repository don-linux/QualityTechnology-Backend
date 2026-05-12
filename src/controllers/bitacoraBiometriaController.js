import prisma from "../prisma.js";
import { resolverOCrearUbicacion, resolverUbicacion } from "../utils/ubicacion.js";
import {
  actualizarFechaBiometriaPorInstalacion,
  obtenerInfoBiometriaPorInstalacion,
  guardarObservacion,
  listarEmpleadosActivosBitacora,
} from "../utils/bitacoraHelpers.js";
import { serializeBiometria } from "../utils/serializers.js";

const MAX_FC_OBSERVACIONES = 500;
const MAX_FC_ENCARGADO = 100;

const bitacoraInclude = {
  ubicacion: true,
  instalacion: true,
  observacion: true,
};

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

async function resolverUbicacionIdBiometria(ubicacion, fiInstalacionId) {
  const instalacionId = fiInstalacionId ? Number(fiInstalacionId) : null;
  if (ubicacion?.trim()) {
    const u = await resolverOCrearUbicacion(ubicacion);
    return u?.ubicacionId ?? null;
  }
  if (instalacionId && Number.isFinite(instalacionId)) {
    const inst = await prisma.instalacion.findUnique({
      where: { instalacionId },
      select: { ubicacionId: true },
    });
    return inst?.ubicacionId ?? null;
  }
  return null;
}

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
      const { granja } = req.params;
      const u = await resolverUbicacion(granja);
      const where = u
        ? { ubicacionId: u.ubicacionId }
        : { ubicacion: { nombre: String(granja).trim() } };

      const rows = await prisma.biometria.findMany({
        where,
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
      const {
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        fc_observaciones,
        fc_encargado,
        fi_instalacion_id,
        tipo,
        ubicacion,
      } = req.body;
      const fi_usuario_id = req.user.usuario_id;

      const errorTexto = validarTextosBiometria(req.body);
      if (errorTexto) {
        return res.status(400).json({ error: errorTexto });
      }

      const ubicacionId = await resolverUbicacionIdBiometria(ubicacion, fi_instalacion_id);
      if (!ubicacionId) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const instalacionId =
        fi_instalacion_id != null && fi_instalacion_id !== ""
          ? Number(fi_instalacion_id)
          : null;

      const pesoProm =
        fn_peso_total_gramos > 0 && fn_organismos_muestreados > 0
          ? Number(fn_peso_total_gramos) / Number(fn_organismos_muestreados)
          : 0;

      const tipoUpper = tipo ? String(tipo).toUpperCase() : null;

      let reproductorId = null;
      if (tipoUpper === "REPRODUCTORES") {
        const whereRepro = {};
        if (instalacionId && Number.isFinite(instalacionId)) {
          whereRepro.instalacionId = instalacionId;
        } else {
          whereRepro.ubicacionId = ubicacionId;
        }
        const r = await prisma.reproductor.findFirst({ where: whereRepro });
        if (!r) {
          return res.status(400).json({
            error:
              "Para tipo REPRODUCTORES se requiere un registro de reproductor en la instalación o ubicación.",
          });
        }
        reproductorId = r.reproductorId;
      }

      const id = await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: null,
          texto: fc_observaciones,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        const row = await tx.biometria.create({
          data: {
            ubicacionId,
            instalacionId: instalacionId && Number.isFinite(instalacionId) ? instalacionId : null,
            reproductorId,
            tipo: tipoUpper,
            fecha: new Date(fd_fecha),
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
            observacionId,
          },
        });
        return row.id;
      });

      if (instalacionId && Number.isFinite(instalacionId)) {
        await actualizarFechaBiometriaPorInstalacion(instalacionId, fd_fecha);
      }

      res.json({ message: "Biometría registrada", id });
    } catch (err) {
      console.error("POST /biometrias Error:", err);
      res.status(500).json({ error: "Error creando biometría" });
    }
  }

  static async update(req, res) {
    try {
      const {
        fd_fecha,
        fn_peso_total_gramos,
        fn_organismos_muestreados,
        fc_observaciones,
        fc_encargado,
        fi_instalacion_id,
        tipo,
        ubicacion,
      } = req.body;
      const fi_usuario_id = req.user.usuario_id;

      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const errorTexto = validarTextosBiometria(req.body);
      if (errorTexto) {
        return res.status(400).json({ error: errorTexto });
      }

      const ubicacionId = await resolverUbicacionIdBiometria(ubicacion, fi_instalacion_id);
      if (!ubicacionId) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const instalacionId =
        fi_instalacion_id != null && fi_instalacion_id !== ""
          ? Number(fi_instalacion_id)
          : null;

      const pesoProm =
        fn_peso_total_gramos > 0 && fn_organismos_muestreados > 0
          ? Number(fn_peso_total_gramos) / Number(fn_organismos_muestreados)
          : 0;

      const tipoUpper = tipo ? String(tipo).toUpperCase() : null;

      let reproductorId = null;
      if (tipoUpper === "REPRODUCTORES") {
        const whereRepro = {};
        if (instalacionId && Number.isFinite(instalacionId)) {
          whereRepro.instalacionId = instalacionId;
        } else {
          whereRepro.ubicacionId = ubicacionId;
        }
        const r = await prisma.reproductor.findFirst({ where: whereRepro });
        if (!r) {
          return res.status(400).json({
            error:
              "Para tipo REPRODUCTORES se requiere un registro de reproductor en la instalación o ubicación.",
          });
        }
        reproductorId = r.reproductorId;
      }

      const id = Number(req.params.id);
      const existing = await prisma.biometria.findUnique({
        where: { id },
        include: { observacion: true },
      });
      if (!existing) {
        return res.status(404).json({ error: "Biometría no encontrada" });
      }

      await prisma.$transaction(async (tx) => {
        const observacionId = await guardarObservacion(tx, {
          observacionIdExistente: existing.observacionId,
          texto:
            fc_observaciones !== undefined
              ? fc_observaciones
              : existing.observacion?.observacion ?? null,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.biometria.update({
          where: { id },
          data: {
            ubicacionId,
            instalacionId: instalacionId && Number.isFinite(instalacionId) ? instalacionId : null,
            reproductorId,
            tipo: tipoUpper,
            fecha: new Date(fd_fecha),
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
            observacionId,
          },
        });
      });

      if (instalacionId && Number.isFinite(instalacionId)) {
        await actualizarFechaBiometriaPorInstalacion(instalacionId, fd_fecha);
      }

      res.json({ message: "Biometría actualizada" });
    } catch (err) {
      console.error("PUT /biometrias Error:", err);
      res.status(500).json({ error: "Error actualizando biometría" });
    }
  }

  static async getInfo(req, res) {
    try {
      const { instalacion } = req.params;
      const info = await obtenerInfoBiometriaPorInstalacion(instalacion);
      if (!info) return res.json({ tipo: null });
      res.json(info);
    } catch (err) {
      console.error("Error en /info biometrías:", err);
      res.status(500).json({ error: "Error obteniendo información automática" });
    }
  }

  static async delete(req, res) {
    try {
      const id = Number(req.params.id);
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
