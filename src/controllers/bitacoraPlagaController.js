import bitacoraPlagaModel from "../models/bitacoraPlagaModel.js";

class BitacoraPlagaController {
    static async getAll(req, res) {
        try {
            const { ubicacion } = req.query;
            const result = await bitacoraPlagaModel.getAll(ubicacion);
            res.json(result);
        } catch (err) {
            console.error("Error GET /plagas:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            await bitacoraPlagaModel.create(data);
            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            console.error("Error POST /plagas:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            await bitacoraPlagaModel.update(req.params.id, req.body);
            res.json({ message: "Registro actualizado correctamente" });
        } catch (err) {
            console.error("Error PUT /plagas:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraPlagaModel.delete(req.params.id);
            res.json({ message: "Registro eliminado correctamente" });
        } catch (err) {
            console.error("Error DELETE /plagas:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteAll(req, res) {
        try {
            const { ubicacion } = req.query;
            if (ubicacion) {
                await bitacoraPlagaModel.deleteByUbicacion(ubicacion);
                res.json({ message: `Todos los registros de ${ubicacion} eliminados.` });
            } else {
                await bitacoraPlagaModel.deleteAll();
                res.json({ message: "Todos los registros eliminados (todas las ubicaciones)." });
            }
        } catch (err) {
            console.error("Error DELETE /plagas:", err.message);
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraPlagaController;
