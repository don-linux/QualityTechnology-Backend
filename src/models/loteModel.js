import pool from "../db.js";

class LoteModel {
    static normalizarGranja(valor) {
        if (!valor) return "Granja Acuícola Medellin";
        const v = valor.toLowerCase();
        if (v.includes("medell")) return "Granja Acuícola Medellin";
        if (v.includes("ceiba")) return "Granja Acuícola La Ceiba";
        return "Granja Acuícola Medellin";
    }

    static async getInstalacionesByGranja(granja) {
        const result = await pool.query(
            `
      SELECT 
        fi_instalacion_id,
        nombre_instalacion
      FROM instalaciones
      WHERE fc_granja = $1
      ORDER BY nombre_instalacion ASC;
      `,
            [granja]
        );
        return result.rows;
    }

    static async getFamiliaByInstalacion(instalacion) {
        const result = await pool.query(`
      SELECT fc_familia 
      FROM reproductores
      WHERE fc_instalacion = $1
      ORDER BY fi_reproductor_id DESC
      LIMIT 1;
    `, [instalacion]);
        return result.rows.length > 0 ? result.rows[0] : { fc_familia: "" };
    }

    static async getByGranja(granja) {
        const result = await pool.query(
            `
      SELECT 
        l.*,
        r.fc_instalacion AS nombre_instalacion
      FROM lotes l
      LEFT JOIN reproductores r
        ON l.fi_instalacion_id = r.fc_instalacion
      WHERE l.fc_granja = $1
      ORDER BY l.fecha DESC
      `,
            [granja]
        );
        return result.rows;
    }

    static async create(data) {
        const {
            fecha, familia, fi_instalacion_id, huevos_ml,
            alevines_inicial, no_lote, fc_granja, observacion,
            mortalidad, mortalidad_porcentaje
        } = data;

        const result = await pool.query(
            `
      INSERT INTO lotes 
      (fecha, familia, fi_instalacion_id, huevos_ml, 
       alevines_inicial, no_lote, fc_granja, observacion,
       mortalidad, mortalidad_porcentaje, fecha_registro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE)
      RETURNING *
      `,
            [fecha, familia, fi_instalacion_id, huevos_ml, alevines_inicial, no_lote, fc_granja, observacion, mortalidad, mortalidad_porcentaje]
        );
        return result.rows[0];
    }

    static async getAlevinesInicial(id) {
        const result = await pool.query("SELECT alevines_inicial FROM lotes WHERE fi_lote_id = $1", [id]);
        return result.rows[0]?.alevines_inicial || 0;
    }

    static async update(id, data) {
        const {
            fecha, familia, fi_instalacion_id, huevos_ml,
            no_lote, fc_granja, observacion,
            mortalidad, mortalidad_porcentaje
        } = data;

        const result = await pool.query(
            `
      UPDATE lotes
      SET 
        fecha = $1,
        familia = $2,
        fi_instalacion_id = $3,
        huevos_ml = $4,
        no_lote = $5,
        fc_granja = $6,
        observacion = $7,
        mortalidad = $8,
        mortalidad_porcentaje = $9
      WHERE fi_lote_id = $10
      RETURNING *
      `,
            [fecha, familia, fi_instalacion_id, huevos_ml, no_lote, fc_granja, observacion, mortalidad, mortalidad_porcentaje, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query("DELETE FROM lotes WHERE fi_lote_id = $1", [id]);
        return true;
    }

    static async getByInstalacion(id) {
        const result = await pool.query(
            `
      SELECT 
        fi_lote_id,
        no_lote
      FROM lotes
      WHERE fi_instalacion_id = $1
      ORDER BY fi_lote_id DESC
      `,
            [id]
        );
        return result.rows;
    }
}

export default LoteModel;
