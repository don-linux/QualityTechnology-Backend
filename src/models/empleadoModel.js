import pool from "../db.js";

class EmpleadoModel {

    static async getAll() {
        const result = await pool.query(`
            SELECT
                e.fi_empleado_id, e.fi_usuario_id,
                e.fc_nombre, e.fc_apellido_paterno, e.fc_apellido_materno,
                e.fc_genero, e.fd_fecha_nacimiento,
                e.fc_estado, e.fc_ciudad, e.fc_calle, e.fc_codigo_postal,
                e.fc_referencias, e.ft_comentarios_adicionales,
                e.fd_fecha_contratacion, e.fn_uniformes, e.fb_activo, e.fd_fecha_alta,
                e.fd_fecha_baja,
                e.fi_departamento_id, e.fi_puesto_id, e.fi_unidad_negocio_id,
                d.fc_nombre AS departamento_nombre,
                p.fc_nombre AS puesto_nombre,
                un.fc_nombre AS unidad_negocio_nombre,
                u.fc_nombre AS usuario_nombre
            FROM rrhh.empleados e
            LEFT JOIN rrhh.departamentos d ON e.fi_departamento_id = d.fi_departamento_id
            LEFT JOIN rrhh.puestos p ON e.fi_puesto_id = p.fi_puesto_id
            LEFT JOIN public.unidades_negocio un ON e.fi_unidad_negocio_id = un.fi_unidad_negocio_id
            LEFT JOIN public.usuarios u ON e.fi_usuario_id = u.fi_usuario_id
            ORDER BY e.fi_empleado_id;
        `);
        return result.rows;
    }

    static async getActivos() {
        const result = await pool.query(`
            SELECT
                e.fi_empleado_id, e.fi_usuario_id,
                e.fc_nombre, e.fc_apellido_paterno, e.fc_apellido_materno,
                e.fc_genero, e.fd_fecha_nacimiento,
                e.fc_estado, e.fc_ciudad, e.fc_calle, e.fc_codigo_postal,
                e.fc_referencias, e.ft_comentarios_adicionales,
                e.fd_fecha_contratacion, e.fn_uniformes, e.fb_activo, e.fd_fecha_alta,
                e.fd_fecha_baja,
                e.fi_departamento_id, e.fi_puesto_id, e.fi_unidad_negocio_id,
                d.fc_nombre AS departamento_nombre,
                p.fc_nombre AS puesto_nombre,
                un.fc_nombre AS unidad_negocio_nombre,
                u.fc_nombre AS usuario_nombre
            FROM rrhh.empleados e
            LEFT JOIN rrhh.departamentos d ON e.fi_departamento_id = d.fi_departamento_id
            LEFT JOIN rrhh.puestos p ON e.fi_puesto_id = p.fi_puesto_id
            LEFT JOIN public.unidades_negocio un ON e.fi_unidad_negocio_id = un.fi_unidad_negocio_id
            LEFT JOIN public.usuarios u ON e.fi_usuario_id = u.fi_usuario_id
            WHERE e.fb_activo = true
            ORDER BY e.fi_empleado_id;
        `);
        return result.rows;
    }

    static async getById(id) {
        const result = await pool.query(`
            SELECT
                e.*,
                d.fc_nombre AS departamento_nombre,
                p.fc_nombre AS puesto_nombre,
                un.fc_nombre AS unidad_negocio_nombre,
                u.fc_nombre AS usuario_nombre
            FROM rrhh.empleados e
            LEFT JOIN rrhh.departamentos d ON e.fi_departamento_id = d.fi_departamento_id
            LEFT JOIN rrhh.puestos p ON e.fi_puesto_id = p.fi_puesto_id
            LEFT JOIN public.unidades_negocio un ON e.fi_unidad_negocio_id = un.fi_unidad_negocio_id
            LEFT JOIN public.usuarios u ON e.fi_usuario_id = u.fi_usuario_id
            WHERE e.fi_empleado_id = $1;
        `, [id]);
        return result.rows[0];
    }

    static async getByUsuarioId(usuarioId) {
        const result = await pool.query(`
            SELECT
                e.*,
                d.fc_nombre AS departamento_nombre,
                p.fc_nombre AS puesto_nombre,
                un.fc_nombre AS unidad_negocio_nombre,
                u.fc_nombre AS usuario_nombre
            FROM rrhh.empleados e
            LEFT JOIN rrhh.departamentos d ON e.fi_departamento_id = d.fi_departamento_id
            LEFT JOIN rrhh.puestos p ON e.fi_puesto_id = p.fi_puesto_id
            LEFT JOIN public.unidades_negocio un ON e.fi_unidad_negocio_id = un.fi_unidad_negocio_id
            LEFT JOIN public.usuarios u ON e.fi_usuario_id = u.fi_usuario_id
            WHERE e.fi_usuario_id = $1;
        `, [usuarioId]);
        return result.rows[0];
    }

    static async create(data) {
        const {
            fi_usuario_id, fi_departamento_id, fi_puesto_id, fi_unidad_negocio_id,
            fc_nombre, fc_apellido_paterno, fc_apellido_materno
        } = data;

        const result = await pool.query(`
            INSERT INTO rrhh.empleados
                (fi_usuario_id, fi_departamento_id, fi_puesto_id, fi_unidad_negocio_id,
                 fc_nombre, fc_apellido_paterno, fc_apellido_materno)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `, [
            fi_usuario_id || null,
            fi_departamento_id,
            fi_puesto_id || null,
            fi_unidad_negocio_id || null,
            fc_nombre,
            fc_apellido_paterno,
            fc_apellido_materno
        ]);
        return result.rows[0];
    }

    static async update(id, data) {
        const {
            fi_departamento_id, fi_puesto_id, fi_unidad_negocio_id,
            fc_nombre, fc_apellido_paterno, fc_apellido_materno,
            fc_genero, fd_fecha_nacimiento,
            fc_estado, fc_ciudad, fc_calle, fc_codigo_postal,
            fc_referencias, ft_comentarios_adicionales,
            fd_fecha_contratacion, fd_fecha_baja, fn_uniformes
        } = data;

        const result = await pool.query(`
            UPDATE rrhh.empleados SET
                fi_departamento_id = $1,
                fi_puesto_id = $2,
                fi_unidad_negocio_id = $3,
                fc_nombre = $4,
                fc_apellido_paterno = $5,
                fc_apellido_materno = $6,
                fc_genero = $7,
                fd_fecha_nacimiento = $8,
                fc_estado = $9,
                fc_ciudad = $10,
                fc_calle = $11,
                fc_codigo_postal = $12,
                fc_referencias = $13,
                ft_comentarios_adicionales = $14,
                fd_fecha_contratacion = $15,
                fd_fecha_baja = $16,
                fn_uniformes = $17
            WHERE fi_empleado_id = $18
            RETURNING *;
        `, [
            fi_departamento_id, fi_puesto_id || null, fi_unidad_negocio_id || null,
            fc_nombre, fc_apellido_paterno, fc_apellido_materno,
            fc_genero || null, fd_fecha_nacimiento || null,
            fc_estado || null, fc_ciudad || null, fc_calle || null, fc_codigo_postal || null,
            fc_referencias || null, ft_comentarios_adicionales || null,
            fd_fecha_contratacion || null, fd_fecha_baja || null, fn_uniformes ?? 0,
            id
        ]);
        return result.rows[0];
    }

    static async updatePersonalData(id, data) {
        const {
            fc_nombre, fc_apellido_paterno, fc_apellido_materno,
            fc_genero, fd_fecha_nacimiento,
            fc_estado, fc_ciudad, fc_calle, fc_codigo_postal,
            fc_referencias, ft_comentarios_adicionales
        } = data;

        const result = await pool.query(`
            UPDATE rrhh.empleados SET
                fc_nombre = $1,
                fc_apellido_paterno = $2,
                fc_apellido_materno = $3,
                fc_genero = $4,
                fd_fecha_nacimiento = $5,
                fc_estado = $6,
                fc_ciudad = $7,
                fc_calle = $8,
                fc_codigo_postal = $9,
                fc_referencias = $10,
                ft_comentarios_adicionales = $11
            WHERE fi_empleado_id = $12
            RETURNING *;
        `, [
            fc_nombre, fc_apellido_paterno, fc_apellido_materno,
            fc_genero || null, fd_fecha_nacimiento || null,
            fc_estado || null, fc_ciudad || null, fc_calle || null, fc_codigo_postal || null,
            fc_referencias || null, ft_comentarios_adicionales || null,
            id
        ]);
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query(`DELETE FROM rrhh.empleados WHERE fi_empleado_id = $1`, [id]);
        return true;
    }

    static async deactivate(id, fechaBaja = null) {
        const result = await pool.query(`
            UPDATE rrhh.empleados
            SET fb_activo = false,
                fd_fecha_baja = COALESCE($2::date, CURRENT_DATE)
            WHERE fi_empleado_id = $1
            RETURNING *;
        `, [id, fechaBaja || null]);
        return result.rows[0];
    }

    static async activate(id) {
        const result = await pool.query(`
            UPDATE rrhh.empleados
            SET fb_activo = true,
                fd_fecha_baja = NULL
            WHERE fi_empleado_id = $1
            RETURNING *;
        `, [id]);
        return result.rows[0];
    }
}

export default EmpleadoModel;
