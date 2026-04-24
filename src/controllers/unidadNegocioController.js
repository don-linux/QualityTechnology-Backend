import UnidadNegocioModel from "../models/unidadNegocioModel.js";

class UnidadNegocioController {

    static async getAll(req, res) {
        try {
            const unidades = await UnidadNegocioModel.getAll();
            res.json(unidades);
        } catch (err) {
            console.error("Error al obtener unidades de negocio:", err);
            res.status(500).json({ error: "Error al obtener unidades de negocio" });
        }
    }

    static async getActivos(req, res) {
        try {
            const unidades = await UnidadNegocioModel.getActivos();
            res.json(unidades);
        } catch (err) {
            console.error("Error al obtener unidades de negocio activas:", err);
            res.status(500).json({ error: "Error al obtener unidades de negocio" });
        }
    }

    static async create(req, res) {
        const { fc_nombre } = req.body;

        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        try {
            const unidad = await UnidadNegocioModel.create({ fc_nombre });
            res.status(201).json({ mensaje: "Unidad de negocio creada correctamente", unidad });
        } catch (err) {
            console.error("Error al crear unidad de negocio:", err);
            res.status(500).json({ error: "Error al crear unidad de negocio" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { fc_nombre } = req.body;

        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        try {
            const unidad = await UnidadNegocioModel.update(id, { fc_nombre });
            if (!unidad) {
                return res.status(404).json({ error: "Unidad de negocio no encontrada" });
            }
            res.json({ mensaje: "Unidad de negocio actualizada correctamente", unidad });
        } catch (err) {
            console.error("Error al actualizar unidad de negocio:", err);
            res.status(500).json({ error: "Error al actualizar unidad de negocio" });
        }
    }

    static async activate(req, res) {
        const { id } = req.params;

        try {
            const unidad = await UnidadNegocioModel.activate(id);
            if (!unidad) {
                return res.status(404).json({ error: "Unidad de negocio no encontrada" });
            }
            res.json({ mensaje: "Unidad de negocio activada correctamente", unidad });
        } catch (err) {
            console.error("Error al activar unidad de negocio:", err);
            res.status(500).json({ error: "Error al activar unidad de negocio" });
        }
    }

    static async deactivate(req, res) {
        const { id } = req.params;

        try {
            const unidad = await UnidadNegocioModel.deactivate(id);
            if (!unidad) {
                return res.status(404).json({ error: "Unidad de negocio no encontrada" });
            }
            res.json({ mensaje: "Unidad de negocio desactivada correctamente", unidad });
        } catch (err) {
            console.error("Error al desactivar unidad de negocio:", err);
            res.status(500).json({ error: "Error al desactivar unidad de negocio" });
        }
    }
}

export default UnidadNegocioController;
