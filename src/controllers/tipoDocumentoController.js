import TipoDocumentoModel from "../models/tipoDocumentoModel.js";

class TipoDocumentoController {

    static async getAll(req, res) {
        try {
            const tipos = await TipoDocumentoModel.getAll();
            res.json(tipos);
        } catch (err) {
            console.error("Error al obtener tipos de documento:", err);
            res.status(500).json({ error: "Error al obtener tipos de documento" });
        }
    }

    static async getActivos(req, res) {
        try {
            const tipos = await TipoDocumentoModel.getActivos();
            res.json(tipos);
        } catch (err) {
            console.error("Error al obtener tipos de documento activos:", err);
            res.status(500).json({ error: "Error al obtener tipos de documento" });
        }
    }

    static async create(req, res) {
        const { fc_nombre, fb_obligatorio } = req.body;
        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        try {
            const tipo = await TipoDocumentoModel.create({ fc_nombre, fb_obligatorio });
            res.status(201).json({ mensaje: "Tipo de documento creado correctamente", tipo });
        } catch (err) {
            console.error("Error al crear tipo de documento:", err);
            res.status(500).json({ error: "Error al crear tipo de documento" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { fc_nombre, fb_obligatorio, fb_activo } = req.body;
        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        try {
            const tipo = await TipoDocumentoModel.update(id, { fc_nombre, fb_obligatorio, fb_activo });
            if (!tipo) {
                return res.status(404).json({ error: "Tipo de documento no encontrado" });
            }
            res.json({ mensaje: "Tipo de documento actualizado correctamente", tipo });
        } catch (err) {
            console.error("Error al actualizar tipo de documento:", err);
            res.status(500).json({ error: "Error al actualizar tipo de documento" });
        }
    }
}

export default TipoDocumentoController;
