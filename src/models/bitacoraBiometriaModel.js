import pool from "../db.js";

class BitacoraBiometriaModel {
    static normalizarGranja(g) {
        if (!g) return null;
        g = g.toLowerCase().trim();
        if (g.includes("med")) return "Granja Acuícola Medellín";
        if (g.includes("ceiba")) return "Granja Acuícola La Ceiba";
        return null;
    }

    static async actualizarFechaBiometria(instalacionId, fecha) {
        const inst = await pool.query(
            `SELECT tipo_instalacion, nombre_instalacion FROM instalaciones WHERE fi_instalacion_id = $1`,
            [instalacionId]
        );

        if (inst.rowCount === 0) return;

        const { tipo_instalacion, nombre_instalacion } = inst.rows[0];
        let tabla = "";
        let campoFecha = "";

        if (tipo_instalacion === "Alevinaje") {
            tabla = "piletas";
            campoFecha = "fecha_ultima_biometria";
        } else if (tipo_instalacion === "Engorda") {
            tabla = "engorda";
            campoFecha = "fecha_biometria";
        } else if (tipo_instalacion === "Reproductores") {
            tabla = "reproductores";
            campoFecha = "fd_fecha_biometria";
        }

        if (!tabla || !campoFecha) return;

        if (tabla === "reproductores") {
            await pool.query(
                `UPDATE ${tabla} SET ${campoFecha} = $1 WHERE fc_instalacion = $2`,
                [fecha, nombre_instalacion]
            );
            return;
        }

        await pool.query(
            `UPDATE ${tabla} SET ${campoFecha} = $1 WHERE fi_instalacion_id = $2`,
            [fecha, instalacionId]
        );
    }

    static async getAll() {
        const result = await pool.query(`
            SELECT b.*, i.nombre_instalacion AS instalacion_nombre
            FROM biometrias b
            LEFT JOIN instalaciones i ON b.fi_instalacion_id = i.fi_instalacion_id
            ORDER BY b.fd_fecha DESC
        `);
        return result.rows;
    }

    static async getByGranja(granja) {
        const result = await pool.query(
            `
      SELECT 
                b.*,
                i.nombre_instalacion AS instalacion_nombre
      FROM biometrias b
      LEFT JOIN instalaciones i ON b.fi_instalacion_id = i.fi_instalacion_id
      WHERE b.fc_granja = $1
      ORDER BY b.fd_fecha DESC;
      `,
            [granja]
        );
        return result.rows;
    }

    static async create(data) {
        const {
            fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fn_peso_promedio,
            fc_observaciones, fc_encargado, fi_instalacion_id, tipo,
            fi_usuario_id, fc_granja, ubicacion
        } = data;

        const result = await pool.query(
            `
      INSERT INTO biometrias (
        fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fn_peso_promedio,
                fc_observaciones, fc_encargado, fi_instalacion_id, tipo,
        fi_usuario_id, fc_granja, ubicacion, fd_fecha_registro
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_TIMESTAMP)
      RETURNING fi_id
      `,
            [
                fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fn_peso_promedio,
                                fc_observaciones, fc_encargado, fi_instalacion_id || null,
                                tipo || null, fi_usuario_id, fc_granja, ubicacion
            ]
        );
        return result.rows[0].fi_id;
    }

    static async update(id, data) {
        const {
            fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fn_peso_promedio,
            fc_observaciones, fc_encargado, fi_instalacion_id, tipo,
            fi_usuario_id, ubicacion
        } = data;

        await pool.query(
            `
      UPDATE biometrias SET
        fd_fecha = $1, fn_peso_total_gramos = $2, fn_organismos_muestreados = $3,
        fn_peso_promedio = $4, fc_observaciones = $5, fc_encargado = $6,
                fi_instalacion_id = $7, tipo = $8, fi_usuario_id = $9,
        ubicacion = $10, fd_fecha_modificacion = CURRENT_TIMESTAMP
            WHERE fi_id = $11
      `,
            [
                fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fn_peso_promedio,
                                fc_observaciones, fc_encargado, fi_instalacion_id || null,
                                tipo, fi_usuario_id, ubicacion, id
            ]
        );
    }

    static async getInfoByInstalacion(instalacionId) {
        const inst = await pool.query(
            `SELECT tipo_instalacion, nombre_instalacion FROM instalaciones WHERE fi_instalacion_id = $1`,
            [instalacionId]
        );

        if (inst.rowCount === 0) return null;

        const { tipo_instalacion, nombre_instalacion } = inst.rows[0];
        let tabla = "";
        let campoFecha = "";

        if (tipo_instalacion === "Alevinaje") {
            tabla = "piletas";
            campoFecha = "fecha_ultima_biometria";
        } else if (tipo_instalacion === "Engorda") {
            tabla = "engorda";
            campoFecha = "fecha_biometria";
        } else if (tipo_instalacion === "Reproductores") {
            tabla = "reproductores";
            campoFecha = "fd_fecha_biometria";
        }

        if (!tabla || !campoFecha) return { tipo: tipo_instalacion };

        if (tabla === "reproductores") {
            const q = await pool.query(
                `
      SELECT 
        ${campoFecha} AS fecha_biometria
      FROM ${tabla}
      WHERE fc_instalacion = $1
      LIMIT 1
      `,
                [nombre_instalacion]
            );

            if (q.rowCount === 0) return { tipo: tipo_instalacion, fi_lote_id: null };

            const row = q.rows[0];
            return {
                tipo: tipo_instalacion,
                fi_lote_id: null,
                fecha_biometria: row.fecha_biometria
            };
        }

        const q = await pool.query(
            `
      SELECT 
        m.fi_lote_id, l.no_lote, m.cantidad, m.talla_gr, m.fecha_siembra,
        m.${campoFecha} AS fecha_biometria
      FROM ${tabla} m
      LEFT JOIN lotes l ON m.fi_lote_id = l.fi_lote_id
      WHERE m.fi_instalacion_id = $1
      LIMIT 1
      `,
            [instalacionId]
        );

        if (q.rowCount === 0) return { tipo: tipo_instalacion, fi_lote_id: null };

        const row = q.rows[0];
        return {
            tipo: tipo_instalacion,
            fi_lote_id: row.fi_lote_id,
            no_lote: row.no_lote,
            cantidad: row.cantidad,
            talla: row.talla_gr,
            fecha_siembra: row.fecha_siembra,
            fecha_biometria: row.fecha_biometria
        };
    }

    static async delete(id) {
        const result = await pool.query(
            "DELETE FROM biometrias WHERE fi_id = $1 RETURNING fi_id",
            [id]
        );
        return result.rowCount;
    }
}

export default BitacoraBiometriaModel;
