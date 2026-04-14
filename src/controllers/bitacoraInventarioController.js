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
            console.error("Error en GET /inventario:", err.message);
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

            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }

            await bitacoraInventarioModel.create({
                fn_num_instalacion: BitacoraInventarioController.parseNum(fn_num_instalacion),
                fn_cantidad: BitacoraInventarioController.parseNum(fn_cantidad),
                fn_talla: BitacoraInventarioController.parseNum(fn_talla),
                fc_lote, fc_observacion, fd_fecha_siembra, fd_fecha_salida_hormonado,
                ubicacion, fi_usuario_id
            });

            res.json({ message: "Registro agregado correctamente" });
        } catch (err) {
            console.error("Error en POST /inventario:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req, res) {
        try {
            const {
                fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion,
                fd_fecha_siembra, fd_fecha_salida_hormonado
            } = req.body;

            const { ubicacion } = req.body;
            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }

            await bitacoraInventarioModel.update(req.params.id, {
                fn_num_instalacion: BitacoraInventarioController.parseNum(fn_num_instalacion),
                fn_cantidad: BitacoraInventarioController.parseNum(fn_cantidad),
                fn_talla: BitacoraInventarioController.parseNum(fn_talla),
                fc_lote, fc_observacion, fd_fecha_siembra, fd_fecha_salida_hormonado,
                ubicacion
            });

            res.json({ message: "Registro actualizado correctamente" });
        } catch (err) {
            console.error("Error en PUT /inventario:", err.message);
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req, res) {
        try {
            await bitacoraInventarioModel.delete(req.params.id);
            res.json({ message: "Registro eliminado correctamente" });
        } catch (err) {
            console.error("Error en DELETE /inventario:", err.message);
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
