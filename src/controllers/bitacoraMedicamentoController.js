import bitacoraMedicamentoModel from "../models/bitacoraMedicamentoModel.js";

const LIMITES_MEDICAMENTOS_TEXTO = {
    fc_diagnosis: 500,
    fc_tratamiento: 500,
    fc_dosis: 100,
};

const validarLongitudesMedicamentos = (body) => {
    const etiquetas = {
        fc_diagnosis: "El diagnóstico",
        fc_tratamiento: "El tratamiento",
        fc_dosis: "La dosis",
    };
    for (const [campo, max] of Object.entries(LIMITES_MEDICAMENTOS_TEXTO)) {
        const len = body[campo] == null ? 0 : String(body[campo]).length;
        if (len > max) {
            return `${etiquetas[campo]} no puede superar los ${max} caracteres.`;
        }
    }
    return null;
};

class BitacoraMedicamentoController {
    static parseNum(v) {
        return v === "" || v == null ? null : Number(v);
    }

    static async getAll(req, res) {
        try {
            const result = await bitacoraMedicamentoModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("Error en GET /medicamentos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async getEmpleados(req, res) {
        try {
            const empleados = await bitacoraMedicamentoModel.getEmpleadosActivos();
            res.json(empleados);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const {
                fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento,
                fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis, fc_responsable
            } = req.body;
            const fi_usuario_id = req.user.usuario_id;

            if (!fd_fecha_hora) throw new Error("La fecha es obligatoria (fd_fecha_hora)");
            if (!fn_num_estanque) throw new Error("El número de estanque es obligatorio");

            const numEstanque = BitacoraMedicamentoController.parseNum(fn_num_estanque);
            if (isNaN(numEstanque)) throw new Error("fn_num_estanque debe ser numérico");

            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }

            const errorLongitud = validarLongitudesMedicamentos(req.body);
            if (errorLongitud) {
                return res.status(400).json({ error: errorLongitud });
            }

            await bitacoraMedicamentoModel.create({
                fd_fecha_hora, fn_num_estanque: numEstanque, fc_diagnosis, fc_tratamiento,
                fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis, fc_responsable,
                ubicacion, fi_usuario_id
            });

            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            console.error("Error en POST /medicamentos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const {
                fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento,
                fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis, fc_responsable
            } = req.body;

            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }

            const errorLongitud = validarLongitudesMedicamentos(req.body);
            if (errorLongitud) {
                return res.status(400).json({ error: errorLongitud });
            }

            await bitacoraMedicamentoModel.update(req.params.id, {
                fd_fecha_hora, fn_num_estanque: BitacoraMedicamentoController.parseNum(fn_num_estanque),
                fc_diagnosis, fc_tratamiento, fc_dosis, fc_forma_aplicacion,
                fd_fecha_ultima_dosis, fc_responsable, ubicacion
            });

            res.json({ message: "Registro actualizado correctamente" });
        } catch (err) {
            console.error("Error en PUT /medicamentos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraMedicamentoModel.delete(req.params.id);
            res.json({ message: "Registro eliminado" });
        } catch (err) {
            console.error("Error en DELETE /medicamentos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraMedicamentoModel.deleteAll();
            res.json({ message: "Todos los registros eliminados" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraMedicamentoController;
