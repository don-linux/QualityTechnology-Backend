import EmpleadoModel from "../models/empleadoModel.js";
import UsuarioModel from "../models/usuarioModel.js";
import RefreshTokenModel from "../models/refreshTokenModel.js";

const dateFields = ["fd_fecha_nacimiento", "fd_fecha_contratacion", "fd_fecha_baja"];

function isValidDate(value) {
    return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

class EmpleadoController {

    static async getAll(req, res) {
        try {
            const empleados = await EmpleadoModel.getAll();
            res.json(empleados);
        } catch (err) {
            console.error("Error al obtener empleados:", err);
            res.status(500).json({ error: "Error al obtener empleados" });
        }
    }

    static async getById(req, res) {
        const { id } = req.params;
        try {
            const empleado = await EmpleadoModel.getById(id);
            if (!empleado) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }
            res.json(empleado);
        } catch (err) {
            console.error("Error al obtener empleado:", err);
            res.status(500).json({ error: "Error al obtener empleado" });
        }
    }

    static async create(req, res) {
        const { fc_nombre, fc_apellido_paterno, fc_apellido_materno, fi_departamento_id } = req.body;

        if (!fc_nombre || !fc_apellido_paterno || !fc_apellido_materno || !fi_departamento_id) {
            return res.status(400).json({
                error: "Campos obligatorios: fc_nombre, fc_apellido_paterno, fc_apellido_materno, fi_departamento_id"
            });
        }

        try {
            const nuevoEmpleado = await EmpleadoModel.create(req.body);
            res.status(201).json({ mensaje: "Empleado creado exitosamente", empleado: nuevoEmpleado });
        } catch (err) {
            console.error("Error al crear empleado:", err);
            res.status(500).json({ error: "Error al crear empleado" });
        }
    }

    static async update(req, res) {
        const { id } = req.params;
        try {
            const existente = await EmpleadoModel.getById(id);
            if (!existente) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }

            const invalidDateField = dateFields.find((field) => !isValidDate(req.body[field]));
            if (invalidDateField) {
                return res.status(400).json({ error: `${invalidDateField} debe tener formato YYYY-MM-DD` });
            }

            const empleado = await EmpleadoModel.update(id, req.body);
            res.json({ mensaje: "Empleado actualizado correctamente", empleado });
        } catch (err) {
            console.error("Error al actualizar empleado:", err);
            res.status(500).json({ error: "Error al actualizar empleado" });
        }
    }

    static async delete(req, res) {
        const { id } = req.params;
        try {
            const existente = await EmpleadoModel.getById(id);
            if (!existente) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }
            await EmpleadoModel.delete(id);
            res.json({ mensaje: "Empleado eliminado correctamente" });
        } catch (err) {
            console.error("Error al eliminar empleado:", err);
            res.status(500).json({ error: "Error al eliminar empleado" });
        }
    }

    static async deactivate(req, res) {
        const { id } = req.params;
        const fechaBaja = req.body?.fd_fecha_baja || req.body?.fecha_baja || null;

        if (!isValidDate(fechaBaja)) {
            return res.status(400).json({ error: "fd_fecha_baja debe tener formato YYYY-MM-DD" });
        }

        try {
            const empleado = await EmpleadoModel.deactivate(id, fechaBaja);
            if (!empleado) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }

            if (empleado.fi_usuario_id) {
                await UsuarioModel.deactivate(empleado.fi_usuario_id);
                await RefreshTokenModel.revokeAllByUser(empleado.fi_usuario_id);
            }

            res.json({ mensaje: "Empleado desactivado correctamente", empleado });
        } catch (err) {
            console.error("Error al desactivar empleado:", err);
            res.status(500).json({ error: "Error al desactivar empleado" });
        }
    }

    static async activate(req, res) {
        const { id } = req.params;
        try {
            const empleado = await EmpleadoModel.activate(id);
            if (!empleado) {
                return res.status(404).json({ error: "Empleado no encontrado" });
            }

            if (empleado.fi_usuario_id) {
                await UsuarioModel.activate(empleado.fi_usuario_id);
            }

            res.json({ mensaje: "Empleado activado correctamente", empleado });
        } catch (err) {
            console.error("Error al activar empleado:", err);
            res.status(500).json({ error: "Error al activar empleado" });
        }
    }

    static async getMiPerfil(req, res) {
        try {
            const empleado = await EmpleadoModel.getByUsuarioId(req.user.usuario_id);
            if (!empleado) {
                return res.status(404).json({ error: "No se encontró perfil de empleado vinculado" });
            }
            res.json(empleado);
        } catch (err) {
            console.error("Error al obtener mi perfil:", err);
            res.status(500).json({ error: "Error al obtener perfil" });
        }
    }

    static async updateMiPerfil(req, res) {
        try {
            const empleado = await EmpleadoModel.getByUsuarioId(req.user.usuario_id);
            if (!empleado) {
                return res.status(404).json({ error: "No se encontró perfil de empleado vinculado" });
            }

            const { fc_nombre, fc_apellido_paterno, fc_apellido_materno } = req.body;
            if (!fc_nombre || !fc_apellido_paterno || !fc_apellido_materno) {
                return res.status(400).json({ error: "Nombre y apellidos son obligatorios" });
            }

            const actualizado = await EmpleadoModel.updatePersonalData(empleado.fi_empleado_id, req.body);
            res.json({ mensaje: "Perfil actualizado correctamente", empleado: actualizado });
        } catch (err) {
            console.error("Error al actualizar mi perfil:", err);
            res.status(500).json({ error: "Error al actualizar perfil" });
        }
    }
}

export default EmpleadoController;
