import pool from "../db.js";

class AlimentoModel {
    static async getContextData(type, id) {
        if (type === "pileta") {
            const result = await pool.query("SELECT cantidad, talla_gr FROM piletas WHERE fi_pileta_id = $1", [id]);
            return result.rows[0];
        } else if (type === "reproductor") {
            const result = await pool.query("SELECT fn_cantidad FROM reproductores WHERE fi_reproductor_id = $1", [id]);
            return result.rows[0];
        } else if (type === "engorda") {
            const result = await pool.query("SELECT cantidad, talla_gr FROM engorda WHERE fi_engorda_id = $1", [id]);
            return result.rows[0];
        }
        return null;
    }

    static async create(data) {
        const {
            fi_reproductor_id, fi_pileta_id, fi_engorda_id,
            particula_mm, alimento_dia, porcion, gasto_alimento, fi_usuario_id
        } = data;

        const result = await pool.query(
            `
      INSERT INTO alimentos (
        fi_reproductor_id,
        fi_pileta_id,
        fi_engorda_id,
        particula_mm,
        alimento_dia,
        porcion,
        gasto_alimento,
        fi_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
            [
                fi_reproductor_id || null,
                fi_pileta_id || null,
                fi_engorda_id || null,
                particula_mm,
                alimento_dia,
                porcion,
                gasto_alimento,
                fi_usuario_id
            ]
        );
        return result.rows[0];
    }

    static async getAll(isAdmin, usuarioId) {
        let query;
        let params = [];

        if (isAdmin) {
            query = `
        SELECT 
          a.fi_alimento_id,
          a.fi_reproductor_id,
          a.fi_pileta_id,
          a.fi_engorda_id,
          a.particula_mm,
          a.alimento_dia,
          a.porcion,
          a.gasto_alimento,
          ir.nombre_instalacion AS reproductor_instalacion,
          ip.nombre_instalacion AS pileta_nombre,
          ie.nombre_instalacion AS engorda_instalacion,
          u.fc_nombre AS usuario_nombre
        FROM alimentos a
        LEFT JOIN reproductores r ON r.fi_reproductor_id = a.fi_reproductor_id
        LEFT JOIN instalaciones ir ON ir.fi_instalacion_id = r.fi_instalacion_id
        LEFT JOIN piletas p ON p.fi_pileta_id = a.fi_pileta_id
        LEFT JOIN instalaciones ip ON ip.fi_instalacion_id = p.fi_instalacion_id
        LEFT JOIN engorda e ON e.fi_engorda_id = a.fi_engorda_id
        LEFT JOIN instalaciones ie ON ie.fi_instalacion_id = e.fi_instalacion_id
        LEFT JOIN usuarios u ON u.fi_usuario_id = a.fi_usuario_id
        ORDER BY a.fi_alimento_id DESC
      `;
        } else {
            query = `
        SELECT 
          a.fi_alimento_id,
          a.fi_reproductor_id,
          a.fi_pileta_id,
          a.fi_engorda_id,
          a.particula_mm,
          a.alimento_dia,
          a.porcion,
          a.gasto_alimento,
          ir.nombre_instalacion AS reproductor_instalacion,
          ip.nombre_instalacion AS pileta_nombre,
          ie.nombre_instalacion AS engorda_instalacion
        FROM alimentos a
        LEFT JOIN reproductores r ON r.fi_reproductor_id = a.fi_reproductor_id
        LEFT JOIN instalaciones ir ON ir.fi_instalacion_id = r.fi_instalacion_id
        LEFT JOIN piletas p ON p.fi_pileta_id = a.fi_pileta_id
        LEFT JOIN instalaciones ip ON ip.fi_instalacion_id = p.fi_instalacion_id
        LEFT JOIN engorda e ON e.fi_engorda_id = a.fi_engorda_id
        LEFT JOIN instalaciones ie ON ie.fi_instalacion_id = e.fi_instalacion_id
        WHERE a.fi_usuario_id = $1
        ORDER BY a.fi_alimento_id DESC
      `;
            params = [usuarioId];
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    static async delete(id) {
        await pool.query("DELETE FROM alimentos WHERE fi_alimento_id = $1", [id]);
    }
}

export default AlimentoModel;
