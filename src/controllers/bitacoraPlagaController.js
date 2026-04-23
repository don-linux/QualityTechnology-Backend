import bitacoraPlagaModel from "../models/bitacoraPlagaModel.js";

class BitacoraPlagaController {
    static async getEmpleados(req, res) {
        try {
            const empleados = await bitacoraPlagaModel.getEmpleadosActivos();
            res.json(empleados);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

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
            const usuarioId = req.user?.usuario_id;
            if (!usuarioId) {
                return res.status(401).json({ error: "Token inválido o sin usuario asociado" });
            }

            const { fc_hallazgo, fc_observaciones } = req.body;
            if (fc_hallazgo && fc_hallazgo.length > 500) {
                return res.status(400).json({ error: "El campo hallazgo no puede superar los 500 caracteres." });
            }
            if (fc_observaciones && fc_observaciones.length > 500) {
                return res.status(400).json({ error: "El campo observaciones no puede superar los 500 caracteres." });
            }
            const { fc_verifico } = req.body;
            if (fc_verifico != null && String(fc_verifico).length > 100) {
                return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
            }

            // Evitar suplantación: fi_usuario_id siempre viene del token.
            const { fi_usuario_id, ...payload } = req.body;
            const data = { ...payload, fi_usuario_id: usuarioId };
            await bitacoraPlagaModel.create(data);
            res.json({ mensaje: "Registro agregado correctamente" });
        } catch (err) {
            console.error("Error POST /plagas:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const { fc_hallazgo, fc_observaciones } = req.body;
            if (fc_hallazgo && fc_hallazgo.length > 500) {
                return res.status(400).json({ error: "El campo hallazgo no puede superar los 500 caracteres." });
            }
            if (fc_observaciones && fc_observaciones.length > 500) {
                return res.status(400).json({ error: "El campo observaciones no puede superar los 500 caracteres." });
            }
            const { fc_verifico } = req.body;
            if (fc_verifico != null && String(fc_verifico).length > 100) {
                return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
            }

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
