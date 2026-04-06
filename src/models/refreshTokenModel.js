import crypto from "node:crypto";
import pool from "../db.js";

const REFRESH_TOKEN_DAYS = 7;

class RefreshTokenModel {
  static generate() {
    return crypto.randomBytes(40).toString("hex");
  }

  static async create(usuarioId) {
    const token = this.generate();
    const expiracion = new Date();
    expiracion.setDate(expiracion.getDate() + REFRESH_TOKEN_DAYS);

    await pool.query(
      `INSERT INTO seguridad.refresh_tokens (fi_usuario_id, fc_token, fd_expiracion)
       VALUES ($1, $2, $3)`,
      [usuarioId, token, expiracion]
    );
    return token;
  }

  static async findValidAndRevoke(token) {
    const result = await pool.query(
      `UPDATE seguridad.refresh_tokens rt_upd
       SET fb_revocado = true
       FROM seguridad.refresh_tokens rt
       JOIN public.usuarios u ON u.fi_usuario_id = rt.fi_usuario_id
       JOIN public.roles r ON r.fi_rol_id = u.fi_rol_id
       WHERE rt_upd.fi_token_id = rt.fi_token_id
         AND rt.fc_token = $1
         AND rt.fb_revocado = false
         AND rt.fd_expiracion > NOW()
         AND u.fb_activo = true
       RETURNING rt.fi_token_id, rt.fi_usuario_id, rt.fd_expiracion,
                 u.fc_nombre AS nombre, u.fi_rol_id AS rol_id,
                 r.fc_nombre AS rol_nombre`,
      [token]
    );
    return result.rows[0] || null;
  }

  static async revoke(token) {
    await pool.query(
      `UPDATE seguridad.refresh_tokens
       SET fb_revocado = true
       WHERE fc_token = $1`,
      [token]
    );
  }

  static async revokeAllByUser(usuarioId) {
    await pool.query(
      `UPDATE seguridad.refresh_tokens SET fb_revocado = true WHERE fi_usuario_id = $1`,
      [usuarioId]
    );
  }

  static async cleanup() {
    await pool.query(
      `DELETE FROM seguridad.refresh_tokens WHERE fd_expiracion < NOW() OR fb_revocado = true`
    );
  }
}

export default RefreshTokenModel;
