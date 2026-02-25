import recepcionInsumoModel from "../models/recepcionInsumoModel.js";

class RecepcionInsumoController {
    static async getAll(req, res) {
        try {
            const { ubicacion } = req.query;
            const result = await recepcionInsumoModel.getAll(ubicacion);
            res.json(result);
        } catch (err) {
            console.error("Error GET /recepcion_insumos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            await recepcionInsumoModel.create(data);
            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            console.error("Error POST /recepcion_insumos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            await recepcionInsumoModel.update(req.params.id, req.body);
            res.json({ message: "Registro actualizado correctamente" });
        } catch (err) {
            console.error("Error PUT /recepcion_insumos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await recepcionInsumoModel.delete(req.params.id);
            res.json({ message: "Registro eliminado correctamente" });
        } catch (err) {
            console.error("Error DELETE /recepcion_insumos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteAll(req, res) {
        try {
            const { ubicacion } = req.query;
            if (ubicacion) {
                await recepcionInsumoModel.deleteByUbicacion(ubicacion);
                res.json({ message: `Registros de ${ubicacion} eliminados.` });
            } else {
                await recepcionInsumoModel.deleteAll();
                res.json({ message: "Todos los registros eliminados." });
            }
        } catch (err) {
            console.error("Error DELETE /recepcion_insumos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }
}

export default RecepcionInsumoController;
