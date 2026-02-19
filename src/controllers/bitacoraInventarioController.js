import bitacoraInventarioModel from "../models/bitacoraInventarioModel.js";

class BitacoraInventarioController {
    static parseNum(v) {
        return v === "" || v == null ? null : Number(v);
    }

    static async getAll(req, res) {
        try {
            const result = await bitacoraInventarioModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("Error en GET /medellin/inventario:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const {
                fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion,
                fd_fecha_siembra, fd_fecha_salida_hormonado
            } = req.body;
            const fi_usuario_id = req.user.usuario_id;

            await bitacoraInventarioModel.create({
                fn_num_instalacion: BitacoraInventarioController.parseNum(fn_num_instalacion),
                fn_cantidad: BitacoraInventarioController.parseNum(fn_cantidad),
                fn_talla: BitacoraInventarioController.parseNum(fn_talla),
                fc_lote, fc_observacion, fd_fecha_siembra, fd_fecha_salida_hormonado,
                fi_usuario_id
            });

            res.json({ message: "✅ Registro agregado correctamente" });
        } catch (err) {
            console.error("Error en POST /medellin/inventario:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const {
                fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion,
                fd_fecha_siembra, fd_fecha_salida_hormonado
            } = req.body;

            await bitacoraInventarioModel.update(req.params.id, {
                fn_num_instalacion: BitacoraInventarioController.parseNum(fn_num_instalacion),
                fn_cantidad: BitacoraInventarioController.parseNum(fn_cantidad),
                fn_talla: BitacoraInventarioController.parseNum(fn_talla),
                fc_lote, fc_observacion, fd_fecha_siembra, fd_fecha_salida_hormonado
            });

            res.json({ message: "✅ Registro actualizado correctamente" });
        } catch (err) {
            console.error("Error en PUT /medellin/inventario:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraInventarioModel.delete(req.params.id);
            res.json({ message: "🗑️ Registro eliminado correctamente" });
        } catch (err) {
            console.error("Error en DELETE /medellin/inventario:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteAll(req, res) {
        try {
            await bitacoraInventarioModel.deleteAll();
            res.json({ message: "Todos los registros de inventario fueron eliminados correctamente." });
        } catch (err) {
            console.error("Error al eliminar registros de inventario:", err);
            res.status(500).json({ error: "Error eliminando todos los registros de inventario." });
        }
    }
}

export default BitacoraInventarioController;
