import bitacoraBanoModel from "../models/bitacoraBanoModel.js";

const LIMITES_BANOS = {
    fc_mes: 20,
    fc_dia: 20,
    fc_tipo_banio: 20,
    fc_regadera: 100,
    fc_realizo: 100,
    fc_observaciones: 500,
    ubicacion: 50,
};

const validarLongitudesBanos = (body) => {
    const etiquetas = {
        fc_mes: "El mes",
        fc_dia: "El día",
        fc_tipo_banio: "El tipo de baño",
        fc_regadera: "La regadera",
        fc_realizo: "Realizó",
        fc_observaciones: "Las observaciones",
        ubicacion: "La ubicación",
    };
    for (const [campo, max] of Object.entries(LIMITES_BANOS)) {
        const valor = body[campo];
        const len = valor == null ? 0 : String(valor).length;
        if (len > max) {
            return `${etiquetas[campo]} no puede superar los ${max} caracteres.`;
        }
    }
    return null;
};

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

            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }

            const errorLongitud = validarLongitudesBanos(req.body);
            if (errorLongitud) {
                return res.status(400).json({ error: errorLongitud });
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

            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }

            const errorLongitud = validarLongitudesBanos(req.body);
            if (errorLongitud) {
                return res.status(400).json({ error: errorLongitud });
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
