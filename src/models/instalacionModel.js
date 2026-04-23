import pool from "../db.js";

class InstalacionModel {
    static normalizarGranja(valor) {
        if (!valor) return "Granja Acuícola Medellin";
        const texto = valor.toLowerCase();
        if (texto.includes("medell")) return "Granja Acuícola Medellin";
        if (texto.includes("ceiba")) return "Granja Acuícola La Ceiba";
        return "Granja Acuícola Medellin";
    }

    static async getAll() {
        const result = await pool.query(`
      SELECT 
        fi_instalacion_id,
        nombre_instalacion,
        tipo_instalacion,
        fc_granja,
        estado,
        largo,
        ancho,
        altura,
        material,
        metros_cubicos
      FROM instalaciones
      ORDER BY nombre_instalacion ASC;
    `);
        return result.rows;
    }

    static async getByGranja(granja) {
        const result = await pool.query(
            `
      SELECT 
        fi_instalacion_id,
        nombre_instalacion,
        tipo_instalacion,
        fc_granja,
        estado,
        largo,
        ancho,
        altura,
        material,
        ROUND(
          COALESCE(largo::numeric, 0) *
          COALESCE(ancho::numeric, 0) *
          COALESCE(altura::numeric, 0),
        2) AS metros_cubicos
      FROM instalaciones
      WHERE fc_granja = $1
      ORDER BY nombre_instalacion ASC;
      `,
            [granja]
        );
        return result.rows;
    }

    static async create(data) {
        const {
            nombre_instalacion,
            tipo_instalacion,
            fc_granja,
            estado,
            largo,
            ancho,
            altura,
            material,
            fi_usuario_id
        } = data;

        const result = await pool.query(
            `
      INSERT INTO instalaciones
      (nombre_instalacion, tipo_instalacion, fc_granja, estado,
       largo, ancho, altura, material, fi_usuario_id, fd_fecha_registro)
      VALUES ($1,$2,$3,$4,
        NULLIF($5,'')::numeric,
        NULLIF($6,'')::numeric,
        NULLIF($7,'')::numeric,
        $8, $9,
      CURRENT_DATE) RETURNING *;
      `,
            [nombre_instalacion, tipo_instalacion, fc_granja, estado, largo, ancho, altura, material, fi_usuario_id]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const {
            nombre_instalacion,
            tipo_instalacion,
            fc_granja,
            estado,
            largo,
            ancho,
            altura,
            material
        } = data;

        const result = await pool.query(
            `
      UPDATE instalaciones
      SET 
        nombre_instalacion = $1,
        tipo_instalacion = $2,
        fc_granja = $3,
        estado = $4,
        largo  = NULLIF($5,'')::numeric,
        ancho  = NULLIF($6,'')::numeric,
        altura = NULLIF($7,'')::numeric,
        material = $8,
        fd_fecha_modificacion = CURRENT_DATE
      WHERE fi_instalacion_id = $9
      RETURNING *;
      `,
            [nombre_instalacion, tipo_instalacion, fc_granja, estado, largo, ancho, altura, material, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const ref = await pool.query(
            `SELECT COUNT(*) AS total FROM piletas WHERE fi_instalacion_id = $1`,
            [id]
        );
        if (Number(ref.rows[0].total) > 0) {
            throw new Error("No se puede eliminar: la instalación tiene piletas activas asociadas.");
        }

        const result = await pool.query(
            `DELETE FROM instalaciones WHERE fi_instalacion_id = $1 RETURNING *`,
            [id]
        );
        return result.rowCount > 0;
    }

    static async getByTipoAndGranja(tipo, granja) {
        const result = await pool.query(
            `
      SELECT 
        fi_instalacion_id,
        nombre_instalacion,
        tipo_instalacion,
        estado
      FROM instalaciones
      WHERE tipo_instalacion ILIKE $1
        AND fc_granja = $2
      ORDER BY nombre_instalacion ASC;
      `,
            [`%${tipo}%`, granja]
        );
        return result.rows;
    }
}

export default InstalacionModel;
