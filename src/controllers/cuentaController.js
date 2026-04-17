import CuentaModel from "../models/cuentaModel.js";

const UDN_PERMITIDAS = ["CQT", "GAM", "GAC"];
const TIPOS_PERMITIDOS = ["Cheques", "Efectivo", "Inversion"];

class CuentaController {

    static async getAll(req, res) {
        try {
            const cuentas = await CuentaModel.getAll();
            res.json(cuentas);
        } catch (err) {
            console.error("Error al obtener cuentas:", err);
            res.status(500).json({ error: "Error al obtener cuentas" });
        }
    }

    static async getActivos(req, res) {
        try {
            const cuentas = await CuentaModel.getActivos();
            res.json(cuentas);
        } catch (err) {
            console.error("Error al obtener cuentas activas:", err);
            res.status(500).json({ error: "Error al obtener cuentas" });
        }
    }

    static async create(req, res) {
        const { fc_udn, fc_nombre, fc_numero_cuenta, fc_tipo, fn_saldo_inicial } = req.body;

        if (!fc_udn || !UDN_PERMITIDAS.includes(fc_udn)) {
            return res.status(400).json({ error: "La UdN es obligatoria y debe ser CQT, GAM o GAC" });
        }

        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (!fc_tipo || !TIPOS_PERMITIDOS.includes(fc_tipo)) {
            return res.status(400).json({ error: "El tipo de cuenta es obligatorio y debe ser Cheques, Efectivo o Inversion" });
        }

        const saldo = Number(fn_saldo_inicial);
        if (fn_saldo_inicial === undefined || Number.isNaN(saldo) || saldo < 0) {
            return res.status(400).json({ error: "El saldo inicial es obligatorio y debe ser un número mayor o igual a 0" });
        }

        try {
            const cuenta = await CuentaModel.create({
                fc_udn,
                fc_nombre,
                fc_numero_cuenta,
                fc_tipo,
                fn_saldo_inicial: saldo,
            });
            res.status(201).json({ mensaje: "Cuenta creada correctamente", cuenta });
        } catch (err) {
            console.error("Error al crear cuenta:", err);
            res.status(500).json({ error: "Error al crear cuenta" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { fc_udn, fc_nombre, fc_numero_cuenta, fc_tipo } = req.body;

        if (!fc_udn || !UDN_PERMITIDAS.includes(fc_udn)) {
            return res.status(400).json({ error: "La UdN es obligatoria y debe ser CQT, GAM o GAC" });
        }

        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (!fc_tipo || !TIPOS_PERMITIDOS.includes(fc_tipo)) {
            return res.status(400).json({ error: "El tipo de cuenta es obligatorio y debe ser Cheques, Efectivo o Inversion" });
        }

        try {
            const cuenta = await CuentaModel.update(id, {
                fc_udn,
                fc_nombre,
                fc_numero_cuenta,
                fc_tipo,
            });
            if (!cuenta) {
                return res.status(404).json({ error: "Cuenta no encontrada" });
            }
            res.json({ mensaje: "Cuenta actualizada correctamente", cuenta });
        } catch (err) {
            console.error("Error al actualizar cuenta:", err);
            res.status(500).json({ error: "Error al actualizar cuenta" });
        }
    }

    static async activate(req, res) {
        const { id } = req.params;

        try {
            const cuenta = await CuentaModel.activate(id);
            if (!cuenta) {
                return res.status(404).json({ error: "Cuenta no encontrada" });
            }
            res.json({ mensaje: "Cuenta activada correctamente", cuenta });
        } catch (err) {
            console.error("Error al activar cuenta:", err);
            res.status(500).json({ error: "Error al activar cuenta" });
        }
    }

    static async deactivate(req, res) {
        const { id } = req.params;

        try {
            const cuenta = await CuentaModel.deactivate(id);
            if (!cuenta) {
                return res.status(404).json({ error: "Cuenta no encontrada" });
            }
            res.json({ mensaje: "Cuenta desactivada correctamente", cuenta });
        } catch (err) {
            console.error("Error al desactivar cuenta:", err);
            res.status(500).json({ error: "Error al desactivar cuenta" });
        }
    }
}

export default CuentaController;
