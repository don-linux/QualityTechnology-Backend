import PuestoModel from "../models/puestoModel.js";

class PuestoController {

    static async getAll(req, res) {
        try {
            const puestos = await PuestoModel.getAll();
            res.json(puestos);
        } catch (err) {
            console.error("Error al obtener puestos:", err);
            res.status(500).json({ error: "Error al obtener puestos" });
        }
    }

    static async getActivos(req, res) {
        try {
            const puestos = await PuestoModel.getActivos();
            res.json(puestos);
        } catch (err) {
            console.error("Error al obtener puestos activos:", err);
            res.status(500).json({ error: "Error al obtener puestos" });
        }
    }

    static async create(req, res) {
        const { fc_nombre } = req.body;
        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        try {
            const puesto = await PuestoModel.create({ fc_nombre });
            res.status(201).json({ mensaje: "Puesto creado correctamente", puesto });
        } catch (err) {
            console.error("Error al crear puesto:", err);
            res.status(500).json({ error: "Error al crear puesto" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { fc_nombre } = req.body;
        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        try {
            const puesto = await PuestoModel.update(id, { fc_nombre });
            if (!puesto) {
                return res.status(404).json({ error: "Puesto no encontrado" });
            }
            res.json({ mensaje: "Puesto actualizado correctamente", puesto });
        } catch (err) {
            console.error("Error al actualizar puesto:", err);
            res.status(500).json({ error: "Error al actualizar puesto" });
        }
    }

    static async activate(req, res) {
        const { id } = req.params;
        try {
            const puesto = await PuestoModel.activate(id);
            if (!puesto) {
                return res.status(404).json({ error: "Puesto no encontrado" });
            }
            res.json({ mensaje: "Puesto activado correctamente", puesto });
        } catch (err) {
            console.error("Error al activar puesto:", err);
            res.status(500).json({ error: "Error al activar puesto" });
        }
    }

    static async deactivate(req, res) {
        const { id } = req.params;
        try {
            const puesto = await PuestoModel.deactivate(id);
            if (!puesto) {
                return res.status(404).json({ error: "Puesto no encontrado" });
            }
            res.json({ mensaje: "Puesto desactivado correctamente", puesto });
        } catch (err) {
            console.error("Error al desactivar puesto:", err);
            res.status(500).json({ error: "Error al desactivar puesto" });
        }
    }
}

export default PuestoController;
