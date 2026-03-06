import express from "express";
import pool from "../db.js";

const router = express.Router();

/* ======================================================
    Crear registro en lista de espera
   ====================================================== */
router.post("/", async (req, res) => {
  try {
    const {
      fd_fecha_entrega,
      fc_talla,
      fn_cantidad,
      fc_cliente,
      fc_lugar_entrega,
      fc_encargado_venta,
      fc_unidad_produccion,
      fc_hora_embolsado,
      fc_hora_entrega,
      fn_precio_venta,
      fc_uap_asignada,
      fc_granja_asignada
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO lista_espera (
        fd_fecha_entrega,
        fc_talla,
        fn_cantidad,
        fc_cliente,
        fc_lugar_entrega,
        fc_encargado_venta,
        fc_unidad_produccion,
        fc_hora_embolsado,
        fc_hora_entrega,
        fn_precio_venta,
        fc_uap_asignada,
        fc_granja_asignada
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        fd_fecha_entrega,
        fc_talla,
        fn_cantidad,
        fc_cliente,
        fc_lugar_entrega,
        fc_encargado_venta,
        fc_unidad_produccion,
        fc_hora_embolsado,
        fc_hora_entrega,
        fn_precio_venta,
        fc_uap_asignada,
        fc_granja_asignada
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al registrar lista de espera:", err);
    res.status(500).send("Error en servidor");
  }
});

/* ======================================================
    Obtener lista de espera
   ====================================================== */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM lista_espera ORDER BY fi_lista_id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener lista de espera:", err);
    res.status(500).send("Error del servidor");
  }
});

/* ======================================================
    Actualizar un registro
   ====================================================== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const campos = req.body;

    await pool.query(
      `
      UPDATE lista_espera SET
        fd_fecha_entrega=$1, fc_talla=$2, fn_cantidad=$3, fc_cliente=$4,
        fc_lugar_entrega=$5, fc_encargado_venta=$6, fc_unidad_produccion=$7,
        fc_hora_embolsado=$8, fc_hora_entrega=$9, fn_precio_venta=$10,
        fc_uap_asignada=$11, fc_granja_asignada=$12
      WHERE fi_lista_id=$13
      `,
      [
        campos.fd_fecha_entrega,
        campos.fc_talla,
        campos.fn_cantidad,
        campos.fc_cliente,
        campos.fc_lugar_entrega,
        campos.fc_encargado_venta,
        campos.fc_unidad_produccion,
        campos.fc_hora_embolsado,
        campos.fc_hora_entrega,
        campos.fn_precio_venta,
        campos.fc_uap_asignada,
        campos.fc_granja_asignada,
        id
      ]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Error en PUT:", err);
    res.status(500).send("Error al actualizar");
  }
});

/* ======================================================
    Eliminar un registro
   ====================================================== */
router.delete("/:id", async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM lista_espera WHERE fi_lista_id=$1`,
      [req.params.id]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error("Error en DELETE:", err);
    res.status(500).send("Error al eliminar");
  }
});

/* ======================================================
    Convertir registro de Lista de Espera → Venta real
   ====================================================== */
router.post("/convertir/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1) Traer registro de lista de espera
    const dato = await pool.query(
      `SELECT * FROM lista_espera WHERE fi_lista_id = $1`,
      [id]
    );

    if (dato.rows.length === 0)
      return res.status(404).json({ error: "Registro no encontrado" });

    const d = dato.rows[0];

    const usuario_id = req.headers["usuario_id"] || 1;
    const now = new Date();

    // Convertir correctamente los tipos
    const cantidad = parseInt(d.fn_cantidad);   // <--- aquí el fix
    const precio = parseFloat(d.fn_precio_venta);
    const total = cantidad * precio;

    // 3) Crear venta REAL con la estructura correcta
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
        d.fd_fecha_entrega,     // $1 Fecha venta
        d.fc_talla,             // $2 Talla
        cantidad,               // $3 Cantidad (YA COMO INT)
        d.fc_cliente,           // $4 Cliente
        precio,                 // $5 Precio (FLOAT)
        total,                  // $6 Total (FLOAT)
        d.fc_lugar_entrega,     // $7 Lugar
        d.fc_encargado_venta,   // $8 Encargado
        d.fc_unidad_produccion, // $9 Unidad producción
        d.fc_granja_asignada,   // $10 Granja
        now,                    // $11 fecha reg / mod
        usuario_id              // $12 usuario
      ]
    );

    // 4) Eliminar de lista de espera
    await pool.query(
      `DELETE FROM lista_espera WHERE fi_lista_id = $1`,
      [id]
    );

    res.json({
      mensaje: "Convertido en venta real correctamente",
      venta_id: ventaNueva.rows[0].fi_venta_id
    });

  } catch (err) {
    console.error("Error al convertir:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
