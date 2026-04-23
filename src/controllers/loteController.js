import loteModel from "../models/loteModel.js";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const REGEX_DECIMAL = /^\d+(\.\d+)?$/;

function validarCamposLote({ huevos_ml, huevos, observacion }) {
    const valorHuevos = huevos_ml ?? huevos;

    if (valorHuevos !== undefined && valorHuevos !== null && valorHuevos !== "") {
        const valor = String(valorHuevos);

        if (valor.length > MAX_NUMERICO) {
            return `Los huevos no pueden superar los ${MAX_NUMERICO} caracteres.`;
        }
        if (!REGEX_DECIMAL.test(valor)) {
            return "Los huevos deben ser un número (puede incluir decimales).";
        }
    }

    if (observacion && observacion.length > MAX_OBSERVACION) {
        return `La observación no puede superar los ${MAX_OBSERVACION} caracteres.`;
    }

    return null;
}

class LoteController {

    /* =====================================================
        OBTENER INSTALACIONES POR GRANJA
    ====================================================== */
    static async getInstalaciones(req, res) {
        try {

            const granja = loteModel.normalizarGranja(req.params.granja);

            const instalaciones = await loteModel.getInstalacionesByGranja(granja);

            res.json(instalaciones);

        } catch (err) {

            console.error("Error al obtener instalaciones:", err);

            res.status(500).json({
                error: "Error obteniendo instalaciones"
            });
        }
    }

    /* =====================================================
        INSTALACIONES DESDE REPRODUCTORES
    ====================================================== */
    static async getInstalacionesReproductores(req, res) {

        try {

            const granja = loteModel.normalizarGranja(req.params.granja);

            const data = await loteModel.getInstalacionesFromReproductores(granja);

            res.json(data);

        } catch (err) {

            console.error("Error obteniendo instalaciones de reproductores:", err);

            res.status(500).json({
                error: "Error obteniendo instalaciones de reproductores"
            });
        }
    }

    /* =====================================================
        LOTES POR GRANJA
    ====================================================== */
    static async getByGranja(req, res) {

        try {

            const granja = loteModel.normalizarGranja(req.params.granja);

            const lotes = await loteModel.getByGranja(granja);

            res.json(lotes);

        } catch (err) {

            console.error("Error al obtener lotes por granja:", err);

            res.status(500).json({
                error: "Error obteniendo lotes por granja"
            });
        }
    }

    /* =====================================================
        CREAR LOTE
    ====================================================== */
    static async create(req, res) {

        try {

            const {
                fecha,
                familia,
                fc_instalacion_id,
                huevos_ml,
                huevos,
                ovadas = 0,
                no_lote,
                fc_granja,
                observacion,
                mortalidad = 0,
                alevines_inicial = 0
            } = req.body;

            // Validación básica
            if (!fc_instalacion_id) {

                return res.status(400).json({
                    error: "Debe seleccionar una instalación"
                });
            }

            const errorValidacion = validarCamposLote(req.body);
            if (errorValidacion) {
                return res.status(400).json({ error: errorValidacion });
            }

            const granjaFinal = loteModel.normalizarGranja(fc_granja);

            const huevosFinal = huevos_ml ?? huevos ?? 0;

            await loteModel.create({
                fecha,
                familia,
                fc_instalacion_id,
                huevos_ml: huevosFinal,
                ovadas,
                alevines_inicial,
                no_lote,
                fc_granja: granjaFinal,
                observacion,
                mortalidad,
                fi_usuario_id: req.user.usuario_id
            });

            res.json({
                success: true,
                message: "Lote registrado correctamente"
            });

        } catch (err) {

            console.error("Error al registrar lote:", err);

            if (err.code === '23505') {
                return res.status(400).json({ error: "Ya existe un lote registrado con ese número ('no_lote')." });
            }

            res.status(500).json({
                error: "Error al registrar lote"
            });
        }
    }

    /* =====================================================
        ACTUALIZAR LOTE
    ====================================================== */
    static async update(req, res) {

        try {

            const { id } = req.params;

            const {
                fecha,
                familia,
                fc_instalacion_id,
                huevos_ml,
                ovadas = 0,
                no_lote,
                fc_granja,
                observacion,
                mortalidad = 0,
                alevines_inicial = 0
            } = req.body;

            const errorValidacion = validarCamposLote(req.body);
            if (errorValidacion) {
                return res.status(400).json({ error: errorValidacion });
            }

            const granjaFinal = loteModel.normalizarGranja(fc_granja);

            await loteModel.update(id, {
                fecha,
                familia,
                fc_instalacion_id,
                huevos_ml,
                ovadas,
                alevines_inicial,
                no_lote,
                fc_granja: granjaFinal,
                observacion,
                mortalidad
            });

            res.json({
                success: true,
                message: "Lote actualizado correctamente"
            });

        } catch (err) {

            console.error("Error al actualizar lote:", err);

            if (err.code === '23505') {
                return res.status(400).json({ error: "Ya existe un lote registrado con ese número ('no_lote')." });
            }

            res.status(500).json({
                error: "Error al actualizar lote"
            });
        }
    }

    /* =====================================================
        ELIMINAR LOTE
    ====================================================== */
    static async delete(req, res) {

        try {

            const { id } = req.params;

            await loteModel.delete(id);

            res.json({
                success: true,
                message: "Lote eliminado correctamente y sus módulos en cascada"
            });

        } catch (err) {

            console.error("Error al eliminar lote en cascada:", err);

            res.status(500).json({
                error: "Error al eliminar lote"
            });
        }
    }

    /* =====================================================
        LOTES POR INSTALACIÓN
    ====================================================== */
    static async getByInstalacion(req, res) {

        try {

            const { id } = req.params;

            const lotes = await loteModel.getByInstalacion(id);

            res.json(lotes);

        } catch (err) {

            console.error("Error al obtener lotes por instalación:", err);

            res.status(500).json({
                error: "Error al obtener lotes por instalación"
            });
        }
    }

    /* =====================================================
        OBTENER FAMILIA POR INSTALACIÓN
    ====================================================== */
    static async getFamiliaPorInstalacion(req, res) {
  try {

    const { instalacionId } = req.params;

    const familia = await loteModel.getFamiliaPorInstalacion(instalacionId);

    res.json(familia);

  } catch (error) {

    console.error("Error cargando familia:", error);

    res.status(500).json({
      error: "Error cargando familia"
    });

  }
}

}

export default LoteController;