import pool from "../config/database.js";

/**
 * Servicio de Alimentos
 * Contiene la lógica de negocio para calcular parámetros de alimentos
 */
export const alimentosService = {
  /**
   * Calcular parámetros de alimento según el tipo (pileta, reproductor o engorda)
   */
  calcularParametros: async (fi_pileta_id, fi_reproductor_id, fi_engorda_id) => {
    let particula_mm = 0;
    let alimento_dia = 0;
    let porcion = 0;
    let gasto_alimento = 0;

    // Caso 1: PILETA (Alevinaje)
    if (fi_pileta_id && !fi_reproductor_id && !fi_engorda_id) {
      const p = await pool.query(
        `SELECT cantidad, talla_gr FROM piletas WHERE fi_pileta_id = $1`,
        [fi_pileta_id]
      );

      if (p.rows.length > 0) {
        const cantidad = Number(p.rows[0].cantidad) || 0;
        const talla = Number(p.rows[0].talla_gr) || 0;

        if (talla < 5) particula_mm = 1.0;
        else if (talla < 20) particula_mm = 2.0;
        else if (talla < 50) particula_mm = 3.0;
        else particula_mm = 4.0;

        porcion = 0.03;
        alimento_dia = cantidad * porcion;
        gasto_alimento = alimento_dia * 60;
      }
    }
    // Caso 2: REPRODUCTOR
    else if (fi_reproductor_id && !fi_pileta_id && !fi_engorda_id) {
      const r = await pool.query(
        `SELECT fn_cantidad FROM reproductores WHERE fi_reproductor_id = $1`,
        [fi_reproductor_id]
      );
      if (r.rows.length > 0) {
        const cantidad = Number(r.rows[0].fn_cantidad) || 0;
        alimento_dia = cantidad * 0.03;
        porcion = 0.03;
        particula_mm = 3.0;
        gasto_alimento = alimento_dia * 60;
      }
    }
    // Caso 3: ENGORDA
    else if (fi_engorda_id && !fi_pileta_id && !fi_reproductor_id) {
      const e = await pool.query(
        `SELECT cantidad, talla_gr FROM engorda WHERE fi_engorda_id = $1`,
        [fi_engorda_id]
      );

      if (e.rows.length > 0) {
        const cantidad = Number(e.rows[0].cantidad) || 0;
        const talla = Number(e.rows[0].talla_gr) || 0;

        if (talla < 100) particula_mm = 3.0;
        else if (talla < 400) particula_mm = 4.0;
        else particula_mm = 5.0;

        porcion = 0.02;
        alimento_dia = cantidad * porcion;
        gasto_alimento = alimento_dia * 60;
      }
    }

    return {
      particula_mm,
      alimento_dia,
      porcion,
      gasto_alimento,
    };
  },
};
