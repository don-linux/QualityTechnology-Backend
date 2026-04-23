import recepcionInsumoModel from "../models/recepcionInsumoModel.js";

class RecepcionInsumoController {
    static async getEmpleados(req, res) {
        try {
            const empleados = await recepcionInsumoModel.getEmpleadosActivos();
            res.json(empleados);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

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
            const { fc_cantidad, fc_observaciones } = req.body;

            const cantidad = parseFloat(fc_cantidad);
            if (fc_cantidad === undefined || fc_cantidad === "" || isNaN(cantidad) || cantidad < 0) {
                return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
            }
            if (fc_observaciones && fc_observaciones.length > 500) {
                return res.status(400).json({ error: "Las observaciones no pueden superar los 500 caracteres." });
            }
            const { fc_verifico } = req.body;
            if (fc_verifico != null && String(fc_verifico).length > 100) {
                return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
            }

            const data = { ...req.body, fc_cantidad: cantidad, fi_usuario_id: req.user.usuario_id };
            await recepcionInsumoModel.create(data);
            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            console.error("Error POST /recepcion_insumos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const { fc_cantidad, fc_observaciones } = req.body;

            const cantidad = parseFloat(fc_cantidad);
            if (fc_cantidad === undefined || fc_cantidad === "" || isNaN(cantidad) || cantidad < 0) {
                return res.status(400).json({ error: "La cantidad debe ser un número positivo." });
            }
            if (fc_observaciones && fc_observaciones.length > 500) {
                return res.status(400).json({ error: "Las observaciones no pueden superar los 500 caracteres." });
            }
            const { fc_verifico } = req.body;
            if (fc_verifico != null && String(fc_verifico).length > 100) {
                return res.status(400).json({ error: "El campo verificó no puede superar los 100 caracteres." });
            }

            await recepcionInsumoModel.update(req.params.id, { ...req.body, fc_cantidad: cantidad });
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
