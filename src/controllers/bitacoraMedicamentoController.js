import bitacoraMedicamentoModel from "../models/bitacoraMedicamentoModel.js";

class BitacoraMedicamentoController {
    static parseNum(v) {
        return v === "" || v == null ? null : Number(v);
    }

    static async getAll(req, res) {
        try {
            const result = await bitacoraMedicamentoModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("Error en GET /medellin/medicamentos:", err.message);
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

            await bitacoraMedicamentoModel.create({
                fd_fecha_hora, fn_num_estanque: numEstanque, fc_diagnosis, fc_tratamiento,
                fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis, fc_responsable,
                fi_usuario_id
            });

            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            console.error("Error en POST /medellin/medicamentos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const {
                fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento,
                fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis, fc_responsable
            } = req.body;

            await bitacoraMedicamentoModel.update(req.params.id, {
                fd_fecha_hora, fn_num_estanque: BitacoraMedicamentoController.parseNum(fn_num_estanque),
                fc_diagnosis, fc_tratamiento, fc_dosis, fc_forma_aplicacion,
                fd_fecha_ultima_dosis, fc_responsable
            });

            res.json({ message: "Registro actualizado correctamente" });
        } catch (err) {
            console.error("Error en PUT /medellin/medicamentos:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraMedicamentoModel.delete(req.params.id);
            res.json({ message: "Registro eliminado" });
        } catch (err) {
            console.error("Error en DELETE /medellin/medicamentos:", err.message);
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
