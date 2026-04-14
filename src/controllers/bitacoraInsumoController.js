import bitacoraInsumoModel from "../models/bitacoraInsumoModel.js";

class BitacoraInsumoController {
    static async getAll(req, res) {
        try {
            const result = await bitacoraInsumoModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("GET ERROR:", err);
            res.status(500).json({ error: "Error obteniendo insumos" });
        }
    }

    static async create(req, res) {
        try {
            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            const id = await bitacoraInsumoModel.create(data);
            res.json({ message: "Registro creado", id });
        } catch (err) {
            console.error("POST ERROR:", err);
            res.status(500).json({ error: "Error creando registro" });
        }
    }

    static async update(req, res) {
        try {
            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            await bitacoraInsumoModel.update(req.params.id, data);
            res.json({ message: "Registro actualizado" });
        } catch (err) {
            console.error("PUT ERROR:", err);
            res.status(500).json({ error: "Error actualizando registro" });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraInsumoModel.delete(req.params.id);
            res.json({ message: "Registro eliminado" });
        } catch (err) {
            console.error("DELETE ERROR:", err);
            res.status(500).json({ error: "Error eliminando registro" });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraInsumoModel.deleteAll();
            res.json({ message: "Todos los registros de insumos fueron eliminados." });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraInsumoController;
