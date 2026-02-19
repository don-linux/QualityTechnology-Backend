import bitacoraParametroModel from "../models/bitacoraParametroModel.js";

class BitacoraParametroController {
    static parseNum(v) {
        return v === "" || v == null ? null : Number(v);
    }

    static async getAll(req, res) {
        try {
            const result = await bitacoraParametroModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("Error en GET /medellin/parametros:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const {
                fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
                fn_amonio, fn_nitritos, fn_nitratos, fc_responsable
            } = req.body;
            const fi_usuario_id = req.user.usuario_id;

            if (!fd_fecha) throw new Error("La fecha (fd_fecha) es obligatoria");
            if (!fn_num_estanque) throw new Error("El número de estanque es obligatorio");

            const numEstanque = BitacoraParametroController.parseNum(fn_num_estanque);
            if (isNaN(numEstanque)) throw new Error("fn_num_estanque debe ser numérico");

            await bitacoraParametroModel.create({
                fd_fecha, fn_num_estanque: numEstanque,
                fn_oxigeno: BitacoraParametroController.parseNum(fn_oxigeno),
                fn_temperatura: BitacoraParametroController.parseNum(fn_temperatura),
                fn_ph: BitacoraParametroController.parseNum(fn_ph),
                fn_amonio: BitacoraParametroController.parseNum(fn_amonio),
                fn_nitritos: BitacoraParametroController.parseNum(fn_nitritos),
                fn_nitratos: BitacoraParametroController.parseNum(fn_nitratos),
                fc_responsable, fi_usuario_id
            });

            res.json({ message: "✅ Registro agregado correctamente" });
        } catch (err) {
            console.error("Error en POST /medellin/parametros:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const {
                fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph,
                fn_amonio, fn_nitritos, fn_nitratos, fc_responsable
            } = req.body;

            await bitacoraParametroModel.update(req.params.id, {
                fd_fecha, fn_num_estanque: BitacoraParametroController.parseNum(fn_num_estanque),
                fn_oxigeno: BitacoraParametroController.parseNum(fn_oxigeno),
                fn_temperatura: BitacoraParametroController.parseNum(fn_temperatura),
                fn_ph: BitacoraParametroController.parseNum(fn_ph),
                fn_amonio: BitacoraParametroController.parseNum(fn_amonio),
                fn_nitritos: BitacoraParametroController.parseNum(fn_nitritos),
                fn_nitratos: BitacoraParametroController.parseNum(fn_nitratos),
                fc_responsable
            });

            res.json({ message: "✅ Registro actualizado correctamente" });
        } catch (err) {
            console.error("Error en PUT /medellin/parametros:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraParametroModel.delete(req.params.id);
            res.json({ message: "🗑️ Registro eliminado" });
        } catch (err) {
            console.error("Error en DELETE /medellin/parametros:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraParametroModel.deleteAll();
            res.json({ message: "Todos los registros eliminados" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default BitacoraParametroController;
