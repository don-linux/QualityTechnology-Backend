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
        fd_fecha,
        fn_num_estanque,
        fn_oxigeno,
        fn_temperatura,
        fn_ph,
        fn_amonio,
        fn_nitritos,
        fn_nitratos,
        fc_responsable,
        fc_observaciones,
      } = req.body;
      const fi_usuario_id = req.user.usuario_id;

      if (!fd_fecha) {
        return res.status(400).json({ error: "La fecha (fd_fecha) es obligatoria" });
      }
      if (!fn_num_estanque) {
        return res.status(400).json({ error: "El número de estanque es obligatorio" });
      }

      const numEstanque = BitacoraParametroController.parseNum(fn_num_estanque);
      if (numEstanque == null || Number.isNaN(numEstanque)) {
        return res.status(400).json({ error: "fn_num_estanque debe ser numérico" });
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
          texto: fc_observaciones ?? null,
          responsable: null,
          usuarioId: fi_usuario_id,
        });

        await tx.parametro.create({
          data: {
            ubicacionId: u.ubicacionId,
            fecha: new Date(fd_fecha),
            numero_estanque: Math.trunc(numEstanque),
            responsable: fc_responsable || null,
            oxigeno:
              BitacoraParametroController.parseNum(fn_oxigeno) != null
                ? String(BitacoraParametroController.parseNum(fn_oxigeno))
                : null,
            temperatura:
              BitacoraParametroController.parseNum(fn_temperatura) != null
                ? String(BitacoraParametroController.parseNum(fn_temperatura))
                : null,
            ph:
              BitacoraParametroController.parseNum(fn_ph) != null
                ? String(BitacoraParametroController.parseNum(fn_ph))
                : null,
            amonio:
              BitacoraParametroController.parseNum(fn_amonio) != null
                ? String(BitacoraParametroController.parseNum(fn_amonio))
                : null,
            nitritos:
              BitacoraParametroController.parseNum(fn_nitritos) != null
                ? String(BitacoraParametroController.parseNum(fn_nitritos))
                : null,
            nitratos:
              BitacoraParametroController.parseNum(fn_nitratos) != null
                ? String(BitacoraParametroController.parseNum(fn_nitratos))
                : null,
            usuarioId: fi_usuario_id,
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
        fd_fecha,
        fn_num_estanque,
        fn_oxigeno,
        fn_temperatura,
        fn_ph,
        fn_amonio,
        fn_nitritos,
        fn_nitratos,
        fc_responsable,
        fc_observaciones,
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
            fecha: fd_fecha ? new Date(fd_fecha) : existing.fecha,
            numero_estanque:
              fn_num_estanque !== undefined && fn_num_estanque !== ""
                ? Math.trunc(BitacoraParametroController.parseNum(fn_num_estanque))
                : fn_num_estanque === ""
                  ? null
                  : existing.numero_estanque,
            oxigeno: decStr(fn_oxigeno) !== undefined ? decStr(fn_oxigeno) : existing.oxigeno,
            temperatura:
              decStr(fn_temperatura) !== undefined ? decStr(fn_temperatura) : existing.temperatura,
            ph: decStr(fn_ph) !== undefined ? decStr(fn_ph) : existing.ph,
            amonio: decStr(fn_amonio) !== undefined ? decStr(fn_amonio) : existing.amonio,
            nitritos: decStr(fn_nitritos) !== undefined ? decStr(fn_nitritos) : existing.nitritos,
            nitratos: decStr(fn_nitratos) !== undefined ? decStr(fn_nitratos) : existing.nitratos,
            responsable: fc_responsable !== undefined ? fc_responsable || null : existing.responsable,
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
