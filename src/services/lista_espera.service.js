import pool from "../config/database.js";

/**
 * Servicio de Lista de Espera
 * Maneja la conversión de lista de espera a venta
 */
export const listaEsperaService = {
  /**
   * Convertir registro de lista de espera a venta real
   */
  convertirAVenta: async (id, usuario_id) => {
    // 1) Obtener registro de lista de espera
    const dato = await pool.query(
      `SELECT * FROM lista_espera WHERE fi_lista_id = $1`,
      [id]
    );

    if (dato.rows.length === 0) {
      throw new Error("Registro no encontrado");
    }

    const d = dato.rows[0];
    const now = new Date();

    // Convertir tipos
    const cantidad = parseInt(d.fn_cantidad);
    const precio = parseFloat(d.fn_precio_venta);
    const total = cantidad * precio;

    // 2) Crear venta REAL
    const ventaNueva = await pool.query(
      `
      INSERT INTO ventas (
        fd_fecha_venta,
        fn_talla,
        fn_cantidad_vendida,
        fc_cliente,
        fn_precio_venta,
        fn_monto_total,
        fc_lugar_entrega,
        fc_estado,
        fc_encargado_venta,
        fc_estanque_cosecha,
        fc_estado_pago,
        fc_metodo_pago,
        fc_observaciones,
        fc_unidad_produccion,
        fc_granja,
        fd_fecha_registro,
        fd_fecha_modificacion,
        fi_usuario_id
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, 'PENDIENTE', $8, '',
        'PENDIENTE', 'EFECTIVO', '',
        $9, $10, $11, $11, $12
      )
      RETURNING *
    `,
      [
        d.fd_fecha_entrega,
        d.fc_talla,
        cantidad,
        d.fc_cliente,
        precio,
        total,
        d.fc_lugar_entrega,
        d.fc_encargado_venta,
        d.fc_unidad_produccion,
        d.fc_granja_asignada,
        now,
        usuario_id,
      ]
    );

    // 3) Eliminar de lista de espera
    await pool.query(`DELETE FROM lista_espera WHERE fi_lista_id = $1`, [id]);

    return ventaNueva.rows[0];
  },
};
