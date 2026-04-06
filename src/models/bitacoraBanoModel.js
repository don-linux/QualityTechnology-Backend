import pool from "../db.js";

const normalizeBathType = (value = "") => {
    const normalized = String(value).trim().toLowerCase();
    if (normalized === "hombre" || normalized === "hombres") return "Hombre";
    if (normalized === "mujer" || normalized === "mujeres") return "Mujer";
    return "";
};

const getLegacyBathColumns = (fc_tipo_banio, fc_banio_hombres, fc_banio_mujeres) => {
    const normalizedType = normalizeBathType(fc_tipo_banio);

    if (normalizedType === "Hombre") {
        return {
            fc_banio_hombres_value: "Hombre",
            fc_banio_mujeres_value: "",
        };
    }

    if (normalizedType === "Mujer") {
        return {
            fc_banio_hombres_value: "",
            fc_banio_mujeres_value: "Mujer",
        };
    }

    // Compatibilidad con payloads antiguos que aún envían columnas separadas.
    if (String(fc_banio_hombres || "").trim()) {
        return {
            fc_banio_hombres_value: fc_banio_hombres,
            fc_banio_mujeres_value: "",
        };
    }

    if (String(fc_banio_mujeres || "").trim()) {
        return {
            fc_banio_hombres_value: "",
            fc_banio_mujeres_value: fc_banio_mujeres,
        };
    }

    return {
        fc_banio_hombres_value: "",
        fc_banio_mujeres_value: "",
    };
};

class BitacoraBanoModel {
    static async getAll() {
        const result = await pool.query(
            `SELECT *,
                CASE
                    WHEN COALESCE(TRIM(fc_banio_hombres), '') <> '' THEN 'Hombre'
                    WHEN COALESCE(TRIM(fc_banio_mujeres), '') <> '' THEN 'Mujer'
                    ELSE ''
                END AS fc_tipo_banio
            FROM banos
            ORDER BY fi_id DESC`
        );
        return result.rows;
    }

    static async create(data) {
        const {
            fc_mes, fc_dia, fc_tipo_banio, fc_banio_hombres, fc_banio_mujeres, fc_regadera,
            fc_realizo, fc_firma, fc_observaciones, fi_usuario_id
        } = data;

        const { fc_banio_hombres_value, fc_banio_mujeres_value } = getLegacyBathColumns(
            fc_tipo_banio,
            fc_banio_hombres,
            fc_banio_mujeres
        );

        await pool.query(
            `INSERT INTO banos
        (fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera, fc_realizo, fc_firma, fc_observaciones, fi_usuario_id, fd_fecha_registro)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
            [fc_mes, fc_dia, fc_banio_hombres_value, fc_banio_mujeres_value, fc_regadera, fc_realizo, fc_firma, fc_observaciones, fi_usuario_id]
        );
    }

    static async update(id, data) {
        const {
            fc_mes, fc_dia, fc_tipo_banio, fc_banio_hombres, fc_banio_mujeres, fc_regadera,
            fc_realizo, fc_firma, fc_observaciones
        } = data;

        const { fc_banio_hombres_value, fc_banio_mujeres_value } = getLegacyBathColumns(
            fc_tipo_banio,
            fc_banio_hombres,
            fc_banio_mujeres
        );

        await pool.query(
            `UPDATE banos SET
      fc_mes=$1, fc_dia=$2, fc_banio_hombres=$3, fc_banio_mujeres=$4,
      fc_regadera=$5, fc_realizo=$6, fc_firma=$7, fc_observaciones=$8,
      fd_fecha_modificacion=NOW()
      WHERE fi_id=$9`,
            [fc_mes, fc_dia, fc_banio_hombres_value, fc_banio_mujeres_value, fc_regadera, fc_realizo, fc_firma, fc_observaciones, id]
        );
    }

    static async delete(id) {
        await pool.query("DELETE FROM banos WHERE fi_id=$1", [id]);
    }

    static async deleteAll() {
        await pool.query("DELETE FROM banos");
    }
}

export default BitacoraBanoModel;
