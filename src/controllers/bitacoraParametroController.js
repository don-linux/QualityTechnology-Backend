import prisma from "../prisma.js";
import { resolverOCrearUbicacion } from "../utils/ubicacion.js";
import { guardarObservacion, listarEmpleadosActivosBitacora } from "../utils/bitacoraHelpers.js";
import { serializeParametro } from "../utils/serializers.js";

const inc = { ubicacion: true, observacion: true };

class BitacoraParametroController {
  static parseNum(v) {
    return v === "" || v == null ? null : Number(v);
  }

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
      const rows = await prisma.parametro.findMany({
        include: inc,
        orderBy: { id: "desc" },
      });
      res.json(rows.map(serializeParametro));
    } catch (err) {
      console.error("Error en GET /parametros:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const {
        fecha,
        numero_estanque,
        oxigeno,
        temperatura,
        ph,
        amonio,
        nitritos,
        nitratos,
        responsable,
        observaciones,
      } = req.body;
      const usuarioId = req.user.usuario_id;

      if (!fecha) {
        return res.status(400).json({ error: "La fecha es obligatoria" });
      }
      if (!numero_estanque) {
        return res.status(400).json({ error: "El número de estanque es obligatorio" });
      }

      const numEstanque = BitacoraParametroController.parseNum(numero_estanque);
      if (numEstanque == null || Number.isNaN(numEstanque)) {
        return res.status(400).json({ error: "numero_estanque debe ser numérico" });
      }

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
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

        await tx.parametro.create({
          data: {
            ubicacionId: u.ubicacionId,
            fecha: new Date(fecha),
            numero_estanque: Math.trunc(numEstanque),
            responsable: responsable || null,
            oxigeno:
              BitacoraParametroController.parseNum(oxigeno) != null
                ? String(BitacoraParametroController.parseNum(oxigeno))
                : null,
            temperatura:
              BitacoraParametroController.parseNum(temperatura) != null
                ? String(BitacoraParametroController.parseNum(temperatura))
                : null,
            ph:
              BitacoraParametroController.parseNum(ph) != null
                ? String(BitacoraParametroController.parseNum(ph))
                : null,
            amonio:
              BitacoraParametroController.parseNum(amonio) != null
                ? String(BitacoraParametroController.parseNum(amonio))
                : null,
            nitritos:
              BitacoraParametroController.parseNum(nitritos) != null
                ? String(BitacoraParametroController.parseNum(nitritos))
                : null,
            nitratos:
              BitacoraParametroController.parseNum(nitratos) != null
                ? String(BitacoraParametroController.parseNum(nitratos))
                : null,
            usuarioId,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro agregado correctamente" });
    } catch (err) {
      console.error("Error en POST /parametros:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    try {
      const {
        fecha,
        numero_estanque,
        oxigeno,
        temperatura,
        ph,
        amonio,
        nitritos,
        nitratos,
        responsable,
        observaciones,
      } = req.body;

      const { ubicacion } = req.body;
      if (!ubicacion || !ubicacion.trim()) {
        return res.status(400).json({ error: "ubicacion es requerido" });
      }

      const u = await resolverOCrearUbicacion(ubicacion);
      if (!u) return res.status(400).json({ error: "ubicacion inválida" });

      const id = Number(req.params.id);
      const existing = await prisma.parametro.findUnique({
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

        const decStr = (field) => {
          if (field === undefined) return undefined;
          if (field === "" || field == null) return null;
          const n = BitacoraParametroController.parseNum(field);
          return n != null && !Number.isNaN(n) ? String(n) : null;
        };

        await tx.parametro.update({
          where: { id },
          data: {
            ubicacionId: u.ubicacionId,
            fecha: fecha ? new Date(fecha) : existing.fecha,
            numero_estanque:
              numero_estanque !== undefined && numero_estanque !== ""
                ? Math.trunc(BitacoraParametroController.parseNum(numero_estanque))
                : numero_estanque === ""
                  ? null
                  : existing.numero_estanque,
            oxigeno: decStr(oxigeno) !== undefined ? decStr(oxigeno) : existing.oxigeno,
            temperatura:
              decStr(temperatura) !== undefined ? decStr(temperatura) : existing.temperatura,
            ph: decStr(ph) !== undefined ? decStr(ph) : existing.ph,
            amonio: decStr(amonio) !== undefined ? decStr(amonio) : existing.amonio,
            nitritos: decStr(nitritos) !== undefined ? decStr(nitritos) : existing.nitritos,
            nitratos: decStr(nitratos) !== undefined ? decStr(nitratos) : existing.nitratos,
            responsable: responsable !== undefined ? responsable || null : existing.responsable,
            observacionId,
          },
        });
      });

      res.json({ message: "Registro actualizado correctamente" });
    } catch (err) {
      console.error("Error en PUT /parametros:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

}

export default BitacoraParametroController;
