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

// ============================================================================
// RRHH
// ============================================================================

export function serializeDepartamento(d) {
  if (!d) return null;
  return {
    departamento_id: d.departamentoId,
    nombre: d.nombre,
    activo: d.activo,
  };
}

export function serializePuesto(p) {
  if (!p) return null;
  return {
    puesto_id: p.puestoId,
    nombre: p.nombre,
    activo: p.activo,
  };
}

export function serializeTipoDocumento(t) {
  if (!t) return null;
  return {
    tipo_documento_id: t.tipoDocumentoId,
    nombre: t.nombre,
    obligatorio: t.obligatorio,
    activo: t.activo,
  };
}

export function serializeUnidadNegocio(u) {
  if (!u) return null;
  return {
    unidad_negocio_id: u.unidadNegocioId,
    nombre: u.nombre,
    activo: u.activo,
  };
}

export function serializeEmpleado(e) {
  if (!e) return null;
  return {
    empleado_id: e.empleadoId,
    usuario_id: e.usuarioId ?? null,
    departamento_id: e.departamentoId,
    puesto_id: e.puestoId ?? null,
    unidad_negocio_id: e.unidadNegocioId ?? null,
    nombre: e.nombre,
    apellido_paterno: e.apellidoPaterno,
    apellido_materno: e.apellidoMaterno,
    genero: e.genero,
    fecha_nacimiento: e.fechaNacimiento,
    estado: e.estado,
    ciudad: e.ciudad,
    calle: e.calle,
    codigo_postal: e.codigoPostal,
    referencias: e.referencias,
    comentarios_adicionales: e.comentariosAdicionales,
    fecha_contratacion: e.fechaContratacion,
    uniformes: e.uniformes,
    activo: e.activo,
    fecha_alta: e.fechaAlta,
    fecha_baja: e.fechaBaja,
    departamento_nombre: e.departamento?.nombre ?? null,
    puesto_nombre: e.puesto?.nombre ?? null,
    unidad_negocio_nombre: e.unidadNegocio?.nombre ?? null,
    usuario_nombre: e.usuario?.nombre ?? null,
  };
}

export function serializeDocumentoEmpleado(d) {
  if (!d) return null;
  return {
    documento_id: d.documentoId,
    empleado_id: d.empleadoId,
    tipo_documento_id: d.tipoDocumentoId,
    ruta_archivo: d.rutaArchivo,
    nombre_original: d.nombreOriginal,
    fecha_carga: d.fechaCarga,
    tipo_nombre: d.tipoDocumento?.nombre ?? null,
    obligatorio: d.tipoDocumento?.obligatorio ?? null,
  };
}

export function serializeActaAdministrativa(a) {
  if (!a) return null;
  return {
    acta_id: a.actaId,
    empleado_id: a.empleadoId,
    motivo: a.motivo,
    fecha: a.fecha,
    ruta_archivo: a.rutaArchivo,
    nombre_original: a.nombreOriginal,
  };
}

export function serializeNomina(n) {
  if (!n) return null;
  return {
    nomina_id: n.nominaId,
    empleado_id: n.empleadoId,
    nombre_empleado: n.nombreEmpleado,
    fecha_pago: n.fechaPago,
    total: n.total,
    bono: n.bono,
    deuda: n.deuda,
    descuento: n.descuento,
    anticipo: n.anticipo,
    usuario_id: n.usuarioId,
    fecha_actualizacion: n.fechaActualizacion,
  };
}

export function serializeVacacion(v) {
  if (!v) return null;
  return {
    vacacion_id: v.vacacionId,
    empleado_id: v.empleadoId,
    nombre_empleado: v.nombreEmpleado,
    departamento: v.departamento,
    inicio_periodo: v.inicioPeriodo,
    fin_periodo: v.finPeriodo,
    dias_trabajados: v.diasTrabajados,
    vacaciones_v: v.vacacionesV,
    enfermedad_e: v.enfermedadE,
    maternidad_m: v.maternidadM,
    permiso_parcial_pp: v.permisoParcialPp,
    permiso_total_pt: v.permisoTotalPt,
    inasistencias_i: v.inasistenciasI,
    vacaciones_anio: v.vacacionesAnio,
    dias_previos: v.diasPrevios,
    vacaciones_disponibles: v.vacacionesDisponibles,
    vacaciones_disfrutadas: v.vacacionesDisfrutadas,
    asistencia: v.asistencia,
    fecha_actualizacion: v.fechaActualizacion,
  };
}

export function serializeCajaAhorroResumen(c) {
  if (!c) return null;
  return {
    caja_ahorro_id: c.cajaAhorroId,
    categoria: c.categoria,
    ubicacion_id: c.ubicacionId,
    granja: c.ubicacion?.nombre ?? null,
    enero: c.enero,
    febrero: c.febrero,
    marzo: c.marzo,
    abril: c.abril,
    mayo: c.mayo,
    junio: c.junio,
    julio: c.julio,
    agosto: c.agosto,
    septiembre: c.septiembre,
    octubre: c.octubre,
    noviembre: c.noviembre,
    diciembre: c.diciembre,
    total: c.total,
    actualizado: c.actualizado,
  };
}
