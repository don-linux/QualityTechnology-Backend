/**
 * Convierte salidas de Prisma (camelCase) a snake_case alineado con bd2.sql,
 * preservando el contrato HTTP esperado por el frontend existente.
 */

export function serializeRol(rol) {
  if (!rol) return null;
  return {
    rol_id: rol.rolId,
    nombre: rol.nombre,
    es_root: rol.esRoot,
  };
}

export function serializeModulo(modulo) {
  if (!modulo) return null;
  return {
    modulo_id: modulo.moduloId,
    nombre: modulo.nombre,
    ruta: modulo.ruta,
    activo: modulo.activo,
  };
}

export function serializeUsuario(usuario) {
  if (!usuario) return null;
  return {
    usuario_id: usuario.usuarioId,
    nombre: usuario.nombre,
    rol_id: usuario.rolId,
    empresa_id: usuario.empresaId ?? null,
    activo: usuario.activo,
  };
}

export function serializeRolModulo(relacion) {
  if (!relacion) return null;
  return {
    rol_id: relacion.rolId,
    modulo_id: relacion.moduloId,
  };
}
