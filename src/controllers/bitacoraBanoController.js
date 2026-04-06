import bitacoraBanoModel from "../models/bitacoraBanoModel.js";

const TIPOS_BANIO_VALIDOS = ["Hombre", "Mujer"];

const normalizarTipoBanio = (value = "") => {
    const normalized = String(value).trim().toLowerCase();
    if (normalized === "hombre" || normalized === "hombres") return "Hombre";
    if (normalized === "mujer" || normalized === "mujeres") return "Mujer";
    return "";
};

class BitacoraBanoController {
    static async getEmpleados(req, res) {
        try {
            const empleados = await bitacoraBanoModel.getEmpleadosActivos();
            res.json(empleados);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getAll(req, res) {
        try {
            const result = await bitacoraBanoModel.getAll();
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const fc_tipo_banio = normalizarTipoBanio(req.body.fc_tipo_banio);
            if (!TIPOS_BANIO_VALIDOS.includes(fc_tipo_banio)) {
                return res.status(400).json({ error: "fc_tipo_banio debe ser Hombre o Mujer" });
            }

            const data = { ...req.body, fc_tipo_banio, fi_usuario_id: req.user.usuario_id };
            await bitacoraBanoModel.create(data);
            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const fc_tipo_banio = normalizarTipoBanio(req.body.fc_tipo_banio);
            if (!TIPOS_BANIO_VALIDOS.includes(fc_tipo_banio)) {
                return res.status(400).json({ error: "fc_tipo_banio debe ser Hombre o Mujer" });
            }

            await bitacoraBanoModel.update(req.params.id, { ...req.body, fc_tipo_banio });
            res.json({ message: "Registro actualizado" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraBanoModel.delete(req.params.id);
            res.json({ message: "Registro eliminado" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraBanoModel.deleteAll();
            res.json({ message: "Todos los registros eliminados" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraBanoController;
