import UbicacionModel from "../models/ubicacionModel.js";

class UbicacionController {

    static async getAll(req, res) {
        try {
            const ubicaciones = await UbicacionModel.getAll();
            res.json(ubicaciones);
        } catch (err) {
            console.error("Error al obtener ubicaciones:", err);
            res.status(500).json({ error: "Error al obtener ubicaciones" });
        }
    }

    static async getActivos(req, res) {
        try {
            const ubicaciones = await UbicacionModel.getActivos();
            res.json(ubicaciones);
        } catch (err) {
            console.error("Error al obtener ubicaciones activas:", err);
            res.status(500).json({ error: "Error al obtener ubicaciones activas" });
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const ubicacion = await UbicacionModel.getById(id);
            if (!ubicacion) {
                return res.status(404).json({ error: "Ubicación no encontrada" });
            }
            res.json(ubicacion);
        } catch (err) {
            console.error("Error al obtener ubicación:", err);
            res.status(500).json({ error: "Error al obtener ubicación" });
        }
    }

    static async create(req, res) {
        const { nombre, direccion, descripcion } = req.body;
        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        try {
            const ubicacion = await UbicacionModel.create({ nombre, direccion, descripcion });
            res.status(201).json({ mensaje: "Ubicación creada correctamente", ubicacion });
        } catch (err) {
            console.error("Error al crear ubicación:", err);
            if (err.code === "23505") {
                return res.status(409).json({ error: "Ya existe una ubicación con ese nombre" });
            }
            res.status(500).json({ error: "Error al crear ubicación" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { nombre, direccion, descripcion } = req.body;
        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        try {
            const ubicacion = await UbicacionModel.update(id, { nombre, direccion, descripcion });
            if (!ubicacion) {
                return res.status(404).json({ error: "Ubicación no encontrada" });
            }
            res.json({ mensaje: "Ubicación actualizada correctamente", ubicacion });
        } catch (err) {
            console.error("Error al actualizar ubicación:", err);
            if (err.code === "23505") {
                return res.status(409).json({ error: "Ya existe una ubicación con ese nombre" });
            }
            res.status(500).json({ error: "Error al actualizar ubicación" });
        }
    }

    static async activate(req, res) {
        const { id } = req.params;
        try {
            const ubicacion = await UbicacionModel.activate(id);
            if (!ubicacion) {
                return res.status(404).json({ error: "Ubicación no encontrada" });
            }
            res.json({ mensaje: "Ubicación activada correctamente", ubicacion });
        } catch (err) {
            console.error("Error al activar ubicación:", err);
            res.status(500).json({ error: "Error al activar ubicación" });
        }
    }

    static async deactivate(req, res) {
        const { id } = req.params;
        try {
            const ubicacion = await UbicacionModel.deactivate(id);
            if (!ubicacion) {
                return res.status(404).json({ error: "Ubicación no encontrada" });
            }
            res.json({ mensaje: "Ubicación desactivada correctamente", ubicacion });
        } catch (err) {
            console.error("Error al desactivar ubicación:", err);
            res.status(500).json({ error: "Error al desactivar ubicación" });
        }
    }
}

export default UbicacionController;
