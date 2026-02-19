import loteModel from "../models/loteModel.js";

class LoteController {
    static async getInstalaciones(req, res) {
        try {
            const granja = loteModel.normalizarGranja(req.params.granja);
            const instalaciones = await loteModel.getInstalacionesByGranja(granja);
            res.json(instalaciones);
        } catch (err) {
            console.error("❌ Error al obtener instalaciones:", err);
            res.status(500).send("Error obteniendo instalaciones");
        }
    }

    static async getFamilia(req, res) {
        try {
            const familia = await loteModel.getFamiliaByInstalacion(req.params.instalacion);
            res.json(familia);
        } catch (err) {
            console.error("❌ Error al obtener familia:", err);
            res.status(500).send("Error al obtener familia");
        }
    }

    static async getByGranja(req, res) {
        try {
            const granja = loteModel.normalizarGranja(req.params.granja);
            const lotes = await loteModel.getByGranja(granja);
            res.json(lotes);
        } catch (err) {
            console.error("❌ Error al obtener lotes por granja:", err);
            res.status(500).send("Error al obtener lotes por granja");
        }
    }

    static async create(req, res) {
        const { fecha, familia, fi_instalacion_id, huevos_ml, no_lote, fc_granja, observacion, mortalidad } = req.body;
        try {
            const granjaFinal = loteModel.normalizarGranja(fc_granja);
            const alevines_inicial = 0;
            const mortalidad_porcentaje = alevines_inicial > 0 ? (mortalidad / alevines_inicial) * 100 : 0;

            await loteModel.create({
                fecha, familia, fi_instalacion_id, huevos_ml,
                alevines_inicial, no_lote, fc_granja: granjaFinal,
                observacion, mortalidad, mortalidad_porcentaje
            });
            res.json({ message: "✓ Lote registrado correctamente." });
        } catch (err) {
            console.error("❌ Error al registrar lote:", err);
            res.status(500).send("Error al registrar lote");
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { fecha, familia, fi_instalacion_id, huevos_ml, no_lote, fc_granja, observacion, mortalidad } = req.body;
        try {
            const granjaFinal = loteModel.normalizarGranja(fc_granja);
            const alevines_inicial = await loteModel.getAlevinesInicial(id);
            const mortalidad_porcentaje = alevines_inicial > 0 ? (mortalidad / alevines_inicial) * 100 : 0;

            await loteModel.update(id, {
                fecha, familia, fi_instalacion_id, huevos_ml,
                no_lote, fc_granja: granjaFinal,
                observacion, mortalidad, mortalidad_porcentaje
            });
            res.json({ message: "📝 Lote actualizado correctamente" });
        } catch (err) {
            console.error("❌ Error al actualizar lote:", err);
            res.status(500).send("Error al actualizar lote");
        }
    }

    static async delete(req, res) {
        try {
            await loteModel.delete(req.params.id);
            res.json({ message: "🗑️ Lote eliminado correctamente" });
        } catch (err) {
            console.error("❌ Error al eliminar lote:", err);
            res.status(500).send("Error al eliminar lote");
        }
    }

    static async getByInstalacion(req, res) {
        try {
            const lotes = await loteModel.getByInstalacion(req.params.id);
            res.json(lotes);
        } catch (err) {
            console.error("❌ Error al obtener lotes por instalación:", err);
            res.status(500).send("Error al obtener lotes por instalación");
        }
    }
}

export default LoteController;
