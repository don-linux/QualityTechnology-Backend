import bitacoraBanoModel from "../models/bitacoraBanoModel.js";

class BitacoraBanoController {
    static async getAll(req, res) {
        try {
            const result = await bitacoraBanoModel.getAll();
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            await bitacoraBanoModel.create(data);
            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            await bitacoraBanoModel.update(req.params.id, req.body);
            res.json({ message: "Registro actualizado" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraBanoModel.delete(req.params.id);
            res.json({ message: "Registro eliminado" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraBanoModel.deleteAll();
            res.json({ message: "Todos los registros eliminados" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraBanoController;
