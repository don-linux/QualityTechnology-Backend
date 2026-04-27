import instalacionModel from "../models/instalacionModel.js";

class InstalacionController {
    static async getAll(req, res) {
        try {
            const instalaciones = await instalacionModel.getAll();
            res.json(instalaciones);
        } catch (err) {
            console.error("Error al obtener instalaciones:", err);
            res.status(500).send("Error al obtener instalaciones");
        }
    }

    static async getByGranja(req, res) {
        const { granja } = req.params;
        try {
            const instalaciones = await instalacionModel.getByGranja(granja);
            res.json(instalaciones);
        } catch (err) {
            console.error("Error al obtener instalaciones por granja:", err);
            res.status(500).send("Error al obtener instalaciones");
        }
    }

    static async create(req, res) {
        const { nombre_instalacion, tipo_instalacion, fc_granja, estado, largo, ancho, altura, material } = req.body;
        try {
            const estadoFinal = estado || "vacia";
            await instalacionModel.create({
                nombre_instalacion, tipo_instalacion, fc_granja,
                estado: estadoFinal, largo, ancho, altura, material,
                fi_usuario_id: req.user.usuario_id
            });
            res.json({ message: "Instalación registrada correctamente." });
        } catch (err) {
            console.error("Error al registrar instalación:", err);
            res.status(500).send("Error al registrar instalación");
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { nombre_instalacion, tipo_instalacion, fc_granja, estado, largo, ancho, altura, material } = req.body;
        try {
            const estadoFinal = estado || "vacia";
            const updated = await instalacionModel.update(id, {
                nombre_instalacion, tipo_instalacion, fc_granja,
                estado: estadoFinal, largo, ancho, altura, material
            });
            if (!updated) return res.status(404).json({ message: "Instalación no encontrada." });
            res.json({ success: true, message: "Instalación actualizada correctamente.", data: updated });
        } catch (err) {
            console.error("Error al actualizar instalación:", err);
            res.status(500).send("Error al actualizar instalación");
        }
    }

    static async delete(req, res) {
        try {
            const deleted = await instalacionModel.delete(req.params.id);
            if (!deleted) return res.status(404).json({ message: "Instalación no encontrada." });
            res.json({ message: "Instalación eliminada correctamente." });
        } catch (err) {
            console.error("Error al eliminar instalación:", err);
            res.status(500).send("Error al eliminar instalación");
        }
    }

    static async getByTipo(req, res) {
        const { tipo, granja } = req.params;
        try {
            const instalaciones = await instalacionModel.getByTipoAndGranja(tipo, granja);
            res.json(instalaciones);
        } catch (err) {
            console.error("Error al obtener instalaciones por tipo:", err);
            res.status(500).json({ error: "Error al obtener instalaciones por tipo" });
        }
    }
}

export default InstalacionController;
