import pool from "../db.js";

// Este modelo es específico para la ruta de piletas/origen que usa una consulta distinta
class OrigenModel {
    static async getOrigen(granja) {
        const result = await pool.query(
            `
      SELECT fi_instalacion_id, nombre_instalacion
      FROM instalaciones
      WHERE LOWER(fc_granja) = LOWER($1)
      ORDER BY nombre_instalacion ASC
      `,
            [granja]
        );
        return result.rows;
    }
}

export default OrigenModel;
