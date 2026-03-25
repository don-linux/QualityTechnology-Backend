import pool from "../db.js";

const ALLOWED_COLUMNS = new Set([
  "categoria", "granja",
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]);

function sanitize(data) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (ALLOWED_COLUMNS.has(key)) clean[key] = value;
  }
  return clean;
}

class CajaAhorroModel {
  static async getByGranja(granja) {
    const result = await pool.query(
      "SELECT * FROM caja_ahorro_resumen WHERE granja = $1 ORDER BY id",
      [granja]
    );
    return result.rows;
  }

  static async create(categoria, granja) {
    const result = await pool.query(
      "INSERT INTO caja_ahorro_resumen (categoria, granja) VALUES ($1, $2) RETURNING *",
      [categoria, granja]
    );
    return result.rows[0];
  }

  static async update(id, rawCampos) {
    const campos = sanitize(rawCampos);
    const columnas = Object.keys(campos);
    const valores = Object.values(campos);

    if (columnas.length === 0) return;

    const set = columnas.map((col, i) => `${col} = $${i + 1}`).join(", ");
    await pool.query(
      `UPDATE caja_ahorro_resumen SET ${set} WHERE id = $${columnas.length + 1}`,
      [...valores, id]
    );
  }

  static async delete(id) {
    await pool.query("DELETE FROM caja_ahorro_resumen WHERE id = $1", [id]);
  }

  static async deleteByGranja(granja) {
    await pool.query(
      "DELETE FROM caja_ahorro_resumen WHERE granja = $1",
      [granja]
    );
  }
}

export default CajaAhorroModel;
