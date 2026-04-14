import bitacoraAlimentacionModel from "../models/bitacoraAlimentacionModel.js";

class BitacoraAlimentacionController {
    static async getAll(req, res) {
        try {
            const result = await bitacoraAlimentacionModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("GET ERROR:", err);
            res.status(500).json({ error: "Error obteniendo alimentación" });
        }
    }

    static async create(req, res) {
        try {
            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            const id = await bitacoraAlimentacionModel.create(data);
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
            await bitacoraAlimentacionModel.update(req.params.id, req.body);
            res.json({ message: "Registro actualizado" });
        } catch (err) {
            console.error("PUT ERROR:", err);
            res.status(500).json({ error: "Error actualizando registro" });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraAlimentacionModel.delete(req.params.id);
            res.json({ message: "Registro eliminado" });
        } catch (err) {
            console.error("DELETE ERROR:", err);
            res.status(500).json({ error: "Error eliminando registro" });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraAlimentacionModel.deleteAll();
            res.json({ message: "Todos los registros fueron eliminados." });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraAlimentacionController;
