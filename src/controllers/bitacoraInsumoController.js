import bitacoraInsumoModel from "../models/bitacoraInsumoModel.js";

const LIMITES_INSUMOS = {
    fc_cantidad_udm: 100,
    fc_num_lote: 100,
    fc_descripcion: 300,
    fc_observaciones: 500,
    fc_encargado_entrega: 100,
    fc_encargado_recepcion: 100,
    ubicacion: 50,
};

const validarLongitudesInsumos = (body) => {
    const etiquetas = {
        fc_cantidad_udm: "La cantidad UdM",
        fc_num_lote: "El número de lote",
        fc_descripcion: "La descripción",
        fc_observaciones: "Las observaciones",
        fc_encargado_entrega: "El encargado de entrega",
        fc_encargado_recepcion: "El encargado de recepción",
        ubicacion: "La ubicación",
    };
    for (const [campo, max] of Object.entries(LIMITES_INSUMOS)) {
        const len = body[campo] == null ? 0 : String(body[campo]).length;
        if (len > max) {
            return `${etiquetas[campo]} no puede superar los ${max} caracteres.`;
        }
    }
    return null;
};

class BitacoraInsumoController {
    static async getAll(req, res) {
        try {
            const result = await bitacoraInsumoModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("GET ERROR:", err);
            res.status(500).json({ error: "Error obteniendo insumos" });
        }
    }

    static async getEmpleados(req, res) {
        try {
            const empleados = await bitacoraInsumoModel.getEmpleadosActivos();
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
            const errorLongitud = validarLongitudesInsumos(req.body);
            if (errorLongitud) {
                return res.status(400).json({ error: errorLongitud });
            }
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            const id = await bitacoraInsumoModel.create(data);
            res.json({ message: "Registro creado", id });
        } catch (err) {
            console.error("POST ERROR:", err);
            res.status(500).json({ error: "Error creando registro" });
        }
    }

    static async update(req, res) {
        try {
            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }
            const errorLongitud = validarLongitudesInsumos(req.body);
            if (errorLongitud) {
                return res.status(400).json({ error: errorLongitud });
            }
            const data = { ...req.body, fi_usuario_id: req.user.usuario_id };
            await bitacoraInsumoModel.update(req.params.id, data);
            res.json({ message: "Registro actualizado" });
        } catch (err) {
            console.error("PUT ERROR:", err);
            res.status(500).json({ error: "Error actualizando registro" });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraInsumoModel.delete(req.params.id);
            res.json({ message: "Registro eliminado" });
        } catch (err) {
            console.error("DELETE ERROR:", err);
            res.status(500).json({ error: "Error eliminando registro" });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraInsumoModel.deleteAll();
            res.json({ message: "Todos los registros de insumos fueron eliminados." });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraInsumoController;
