import CuentaModel from "../models/cuentaModel.js";
import UnidadNegocioModel from "../models/unidadNegocioModel.js";

const TIPOS_PERMITIDOS = ["Cheques", "Efectivo", "Inversion", "Ahorro"];
const BANCO_MAX_LENGTH = 150;

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
        const { fc_udn, fc_nombre, fc_numero_cuenta, fc_banco, fc_tipo } = req.body;

        if (!fc_udn) {
            return res.status(400).json({ error: "La UdN es obligatoria" });
        }

        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (!fc_tipo || !TIPOS_PERMITIDOS.includes(fc_tipo)) {
            return res.status(400).json({ error: "El tipo de cuenta es obligatorio y debe ser Cheques, Efectivo, Inversion o Ahorro" });
        }

        const bancoTrim = typeof fc_banco === "string" ? fc_banco.trim() : "";
        if (bancoTrim.length > BANCO_MAX_LENGTH) {
            return res.status(400).json({ error: `El nombre del banco no puede exceder ${BANCO_MAX_LENGTH} caracteres` });
        }

        try {
            const udnCatalogo = await UnidadNegocioModel.getByNombreActiva(fc_udn);
            if (!udnCatalogo) {
                return res.status(400).json({ error: "La UdN debe existir en el catálogo de unidades de negocio y estar activa" });
            }

            const cuenta = await CuentaModel.create({
                fc_udn,
                fc_nombre,
                fc_numero_cuenta,
                fc_banco: bancoTrim || null,
                fc_tipo,
            });
            res.status(201).json({ mensaje: "Cuenta creada correctamente", cuenta });
        } catch (err) {
            console.error("Error al crear cuenta:", err);
            res.status(500).json({ error: "Error al crear cuenta" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        const { fc_udn, fc_nombre, fc_numero_cuenta, fc_banco, fc_tipo } = req.body;

        if (!fc_udn) {
            return res.status(400).json({ error: "La UdN es obligatoria" });
        }

        if (!fc_nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (!fc_tipo || !TIPOS_PERMITIDOS.includes(fc_tipo)) {
            return res.status(400).json({ error: "El tipo de cuenta es obligatorio y debe ser Cheques, Efectivo, Inversion o Ahorro" });
        }

        const bancoTrim = typeof fc_banco === "string" ? fc_banco.trim() : "";
        if (bancoTrim.length > BANCO_MAX_LENGTH) {
            return res.status(400).json({ error: `El nombre del banco no puede exceder ${BANCO_MAX_LENGTH} caracteres` });
        }

        try {
            const udnCatalogo = await UnidadNegocioModel.getByNombreActiva(fc_udn);
            if (!udnCatalogo) {
                return res.status(400).json({ error: "La UdN debe existir en el catálogo de unidades de negocio y estar activa" });
            }

            const cuenta = await CuentaModel.update(id, {
                fc_udn,
                fc_nombre,
                fc_numero_cuenta,
                fc_banco: bancoTrim || null,
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
