import pool from "../db.js";

class CuentaModel {
  static async getAll() {
    const result = await pool.query("SELECT * FROM cuentas ORDER BY id ASC");
    return result.rows;
  }

  static async create(nombre, saldo) {
    const result = await pool.query(
      "INSERT INTO cuentas (nombre, saldo) VALUES ($1, $2) RETURNING *",
      [nombre, saldo || 0]
    );
    return result.rows[0];
  }

  static async update(id, nombre, saldo) {
    const result = await pool.query(
      "UPDATE cuentas SET nombre=$1, saldo=$2 WHERE id=$3 RETURNING *",
      [nombre, saldo, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM cuentas WHERE id=$1", [id]);
  }

  static async updateSaldo(id, tipo, monto) {
    const query =
      tipo === "ingreso"
        ? "UPDATE cuentas SET saldo = saldo + $1 WHERE id=$2 RETURNING *"
        : "UPDATE cuentas SET saldo = saldo - $1 WHERE id=$2 RETURNING *";
    const result = await pool.query(query, [monto, id]);
    return result.rows[0];
  }
}

export default CuentaModel;
