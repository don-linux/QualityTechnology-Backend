import bitacoraVisitaModel from "../models/bitacoraVisitaModel.js";

class BitacoraVisitaController {
    static async getAll(req, res) {
        try {
            const result = await bitacoraVisitaModel.getAll();
            res.json(result);
        } catch (error) {
            console.error("GET ERROR:", error);
            res.status(500).json({ error: "Error obteniendo visitas" });
        }
    }

    static async create(req, res) {
        try {
            const { fc_motivo, fc_observaciones } = req.body;

            if (fc_motivo && fc_motivo.length > 300) {
                return res.status(400).json({ error: "El motivo no puede superar los 300 caracteres." });
            }
            if (fc_observaciones && fc_observaciones.length > 500) {
                return res.status(400).json({ error: "Las observaciones no pueden superar los 500 caracteres." });
            }

            const data = {
                ...req.body,
                fi_usuario_id: req.user.usuario_id,
                fc_foto_identificacion: req.file ? req.file.path : null
            };

            await bitacoraVisitaModel.create(data);
            res.json({ message: "Registro creado" });
        } catch (error) {
            console.error("POST ERROR:", error);
            res.status(500).json({ error: "Error creando registro" });
        }
    }

    static async update(req, res) {
        try {
            const { fc_motivo, fc_observaciones } = req.body;

            if (fc_motivo && fc_motivo.length > 300) {
                return res.status(400).json({ error: "El motivo no puede superar los 300 caracteres." });
            }
            if (fc_observaciones && fc_observaciones.length > 500) {
                return res.status(400).json({ error: "Las observaciones no pueden superar los 500 caracteres." });
            }

            const data = {
                ...req.body,
                fi_usuario_id: req.user.usuario_id,
                fc_foto_identificacion: req.file ? req.file.path : null
            };

            await bitacoraVisitaModel.update(req.params.id, data);
            res.json({ message: "Registro actualizado" });
        } catch (error) {
            console.error("PUT ERROR:", error);
            res.status(500).json({ error: "Error actualizando registro" });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraVisitaModel.delete(req.params.id);
            res.json({ message: "Registro eliminado" });
        } catch (error) {
            console.error("DELETE ERROR:", error);
            res.status(500).json({ error: "Error eliminando registro" });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraVisitaModel.deleteAll();
            res.json({ message: "Todos los registros fueron eliminados." });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraVisitaController;
