
import pool from './src/db.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

async function createNewUser() {
  try {
    const nombre = 'antigravity';
    const contrasena = 'pass123';
    const rol_id = 1; // Administrador usualmente es 1
    
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    const query = `
      INSERT INTO usuarios (fc_nombre, "fc_contraseña", fi_rol_id)
      VALUES ($1, $2, $3)
      RETURNING fi_usuario_id, fc_nombre
    `;
    
    const result = await pool.query(query, [nombre, hashedPassword, rol_id]);
    console.log('Usuario creado exitosamente:');
    console.log('Nombre:', result.rows[0].fc_nombre);
    console.log('Contraseña:', contrasena);
    
    process.exit(0);
  } catch (err) {
    console.error('Error al crear el usuario:', err.message);
    process.exit(1);
  }
}

createNewUser();
