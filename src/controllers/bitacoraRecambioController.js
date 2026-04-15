import bitacoraRecambioModel from "../models/bitacoraRecambioModel.js";

class BitacoraRecambioController {
    static async getAll(req, res) {
        try {
            const result = await bitacoraRecambioModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("Error GET /recambios:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async getEmpleados(req, res) {
        try {
            const empleados = await bitacoraRecambioModel.getEmpleadosActivos();
            res.json(empleados);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            await bitacoraRecambioModel.create(data);
            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            console.error("Error POST /recambios:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }
            await bitacoraRecambioModel.update(req.params.id, req.body);
            res.json({ message: "Registro actualizado correctamente" });
        } catch (err) {
            console.error("Error PUT /recambios:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraRecambioModel.delete(req.params.id);
            res.json({ message: "Registro eliminado correctamente" });
        } catch (err) {
            console.error("Error DELETE /recambios:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraRecambioModel.deleteAll();
            res.json({ message: "Todos los registros de recambios fueron eliminados correctamente." });
        } catch (err) {
            console.error("Error al eliminar registros de recambios:", err);
            res.status(500).json({ error: "Error eliminando todos los registros de recambios." });
        }
    }
}

export default BitacoraRecambioController;
