import bitacoraBiometriaModel from "../models/bitacoraBiometriaModel.js";

const MAX_FC_OBSERVACIONES = 500;
const MAX_FC_ENCARGADO = 100;

const validarTextosBiometria = (body) => {
    const obsLen = body.fc_observaciones == null ? 0 : String(body.fc_observaciones).length;
    if (obsLen > MAX_FC_OBSERVACIONES) {
        return `Las observaciones no pueden superar los ${MAX_FC_OBSERVACIONES} caracteres.`;
    }
    const encLen = body.fc_encargado == null ? 0 : String(body.fc_encargado).length;
    if (encLen > MAX_FC_ENCARGADO) {
        return `El encargado no puede superar los ${MAX_FC_ENCARGADO} caracteres.`;
    }
    return null;
};

class BitacoraBiometriaController {
    static async getAll(req, res) {
        try {
            const result = await bitacoraBiometriaModel.getAll();
            res.json(result);
        } catch (err) {
            console.error("GET /biometrias Error:", err);
            res.status(500).json({ error: "Error obteniendo biometrías" });
        }
    }

    static async getByGranja(req, res) {
        try {
            const granja = bitacoraBiometriaModel.normalizarGranja(req.params.granja);
            if (!granja) return res.status(400).json({ error: "Granja inválida" });

            const result = await bitacoraBiometriaModel.getByGranja(granja);
            res.json(result);
        } catch (err) {
            console.error("GET /biometrias Error:", err);
            res.status(500).json({ error: "Error obteniendo biometrías" });
        }
    }

    static async getEmpleados(req, res) {
        try {
            const empleados = await bitacoraBiometriaModel.getEmpleadosActivos();
            res.json(empleados);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req, res) {
        try {
            const {
                fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados,
                fc_observaciones, fc_encargado, fi_instalacion_id, fi_lote_id,
                tipo, ubicacion
            } = req.body;
            const fi_usuario_id = req.user.usuario_id;

            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }

            const errorTexto = validarTextosBiometria(req.body);
            if (errorTexto) {
                return res.status(400).json({ error: errorTexto });
            }

            const granjaFinal = bitacoraBiometriaModel.normalizarGranja(ubicacion);
            if (!granjaFinal) return res.status(400).json({ error: "Granja inválida" });

            const pesoProm = fn_peso_total_gramos > 0 && fn_organismos_muestreados > 0
                ? Number(fn_peso_total_gramos) / Number(fn_organismos_muestreados)
                : 0;

            const tipoUpper = tipo ? tipo.toUpperCase() : null;

            const id = await bitacoraBiometriaModel.create({
                fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados,
                fn_peso_promedio: pesoProm, fc_observaciones, fc_encargado,
                fi_instalacion_id, fi_lote_id, tipo: tipoUpper, fi_usuario_id,
                fc_granja: granjaFinal, ubicacion
            });

            if (fi_instalacion_id) {
                await bitacoraBiometriaModel.actualizarFechaBiometria(fi_instalacion_id, fd_fecha);
            }

            res.json({ message: "Biometría registrada", id });
        } catch (err) {
            console.error("POST /biometrias Error:", err);
            res.status(500).json({ error: "Error creando biometría" });
        }
    }

    static async update(req, res) {
        try {
            const {
                fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados,
                fc_observaciones, fc_encargado, fi_instalacion_id, fi_lote_id, tipo,
                ubicacion
            } = req.body;
            const fi_usuario_id = req.user.usuario_id;

            if (!ubicacion || !ubicacion.trim()) {
                return res.status(400).json({ error: "ubicacion es requerido" });
            }

            const errorTexto = validarTextosBiometria(req.body);
            if (errorTexto) {
                return res.status(400).json({ error: errorTexto });
            }

            const pesoProm = fn_peso_total_gramos > 0 && fn_organismos_muestreados > 0
                ? Number(fn_peso_total_gramos) / Number(fn_organismos_muestreados)
                : 0;

            const tipoUpper = tipo ? tipo.toUpperCase() : null;

            await bitacoraBiometriaModel.update(req.params.id, {
                fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados,
                fn_peso_promedio: pesoProm, fc_observaciones, fc_encargado,
                fi_instalacion_id, fi_lote_id, tipo: tipoUpper, fi_usuario_id, ubicacion
            });

            if (fi_instalacion_id) {
                await bitacoraBiometriaModel.actualizarFechaBiometria(fi_instalacion_id, fd_fecha);
            }

            res.json({ message: "Biometría actualizada" });
        } catch (err) {
            console.error("PUT /biometrias Error:", err);
            res.status(500).json({ error: "Error actualizando biometría" });
        }
    }

    static async getInfo(req, res) {
        try {
            const { instalacion } = req.params;
            const info = await bitacoraBiometriaModel.getInfoByInstalacion(instalacion);
            if (!info) return res.json({ tipo: null });
            res.json(info);
        } catch (err) {
            console.error("Error en /info biometrías:", err);
            res.status(500).json({ error: "Error obteniendo información automática" });
        }
    }

    static async delete(req, res) {
        try {
            const count = await bitacoraBiometriaModel.delete(req.params.id);
            if (count === 0) {
                return res.status(404).json({ error: "Biometría no encontrada" });
            }
            res.json({ message: "Biometría eliminada correctamente" });
        } catch (err) {
            console.error("DELETE /biometrias Error:", err);
            res.status(500).json({ error: "Error eliminando biometría" });
        }
    }
}

export default BitacoraBiometriaController;
