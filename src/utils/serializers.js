/**
 * Convierte salidas de Prisma (camelCase) a snake_case alineado con bd2.sql,
 * preservando el contrato HTTP esperado por el frontend existente.
 */

export function serializeRol(rol) {
  if (!rol) return null;
  return {
    rol_id: rol.id,
    nombre: rol.nombre,
    es_root: rol.esRoot,
  };
}

export function serializeModulo(modulo) {
  if (!modulo) return null;
  return {
    modulo_id: modulo.id,
    nombre: modulo.nombre,
    ruta: modulo.ruta,
    activo: modulo.esta_activo,
  };
}

export function serializeUsuario(usuario) {
  if (!usuario) return null;
  return {
    usuario_id: usuario.id,
    nombre: usuario.nombre,
    rol_id: usuario.rolId,
    empresa_id: usuario.empresaId ?? null,
    activo: usuario.esta_activo,
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
    departamento_id: d.id,
    nombre: d.nombre,
    activo: d.esta_activo,
  };
}

export function serializePuesto(p) {
  if (!p) return null;
  return {
    puesto_id: p.id,
    nombre: p.nombre,
    activo: p.esta_activo,
  };
}

export function serializeTipoDocumento(t) {
  if (!t) return null;
  return {
    tipo_documento_id: t.id,
    nombre: t.nombre,
    obligatorio: t.obligatorio ?? null,
    activo: t.esta_activo,
  };
}

export function serializeUnidadNegocio(u) {
  if (!u) return null;
  return {
    unidad_negocio_id: u.id,
    nombre: u.nombre,
    activo: u.esta_activo,
  };
}

export function serializeEmpleado(e) {
  if (!e) return null;
  const nombre = e.nombre;
  const apellidoPaterno = e.apellidoPaterno;
  const apellidoMaterno = e.apellidoMaterno ?? null;
  const fechaIngreso = e.fecha_ingreso ?? null;
  return {
    empleado_id: e.id,
    fi_empleado_id: e.id,
    usuario_id: e.usuarioId ?? null,
    departamento_id: e.departamentoId ?? null,
    fi_departamento_id: e.departamentoId ?? null,
    puesto_id: e.puestoId ?? null,
    fi_puesto_id: e.puestoId ?? null,
    unidad_negocio_id: null,
    fi_unidad_negocio_id: null,
    nombre,
    apellido_paterno: apellidoPaterno,
    apellido_materno: apellidoMaterno,
    fc_nombre: nombre,
    fc_apellido_paterno: apellidoPaterno,
    fc_apellido_materno: apellidoMaterno,
    sueldo_base: e.sueldo_base ?? null,
    fecha_ingreso: fechaIngreso,
    fecha_contratacion: fechaIngreso,
    fd_fecha_contratacion: fechaIngreso,
    activo: e.esta_activo,
    fb_activo: e.esta_activo,
    departamento_nombre: e.departamento?.nombre ?? null,
    puesto_nombre: e.puesto?.nombre ?? null,
    unidad_negocio_nombre: null,
    usuario_nombre: e.usuario?.nombre ?? null,
  };
}

export function serializeDocumentoEmpleado(d) {
  if (!d) return null;
  return {
    documento_id: d.id,
    empleado_id: d.empleadoId,
    tipo_documento_id: d.tipoDocumentoId ?? null,
    ruta_archivo: d.rutaArchivo,
    nombre_original: d.nombre_archivo,
    fecha_carga: d.created_at,
    tipo_nombre: d.tipoDocumento?.nombre ?? null,
    obligatorio: null,
  };
}

export function serializeActaAdministrativa(a) {
  if (!a) return null;
  return {
    acta_id: a.id,
    empleado_id: a.empleadoId,
    motivo: a.descripcion ?? null,
    descripcion: a.descripcion ?? null,
    fecha: a.created_at,
    ruta_archivo: a.rutaArchivo,
    nombre_original: a.nombre_archivo,
  };
}

export function serializeNomina(n) {
  if (!n) return null;
  const nombreEmpleado = n.empleado
    ? [n.empleado.nombre, n.empleado.apellidoPaterno, n.empleado.apellidoMaterno]
        .filter(Boolean)
        .join(" ")
    : null;
  return {
    nomina_id: n.id,
    empleado_id: n.empleadoId,
    nombre_empleado: nombreEmpleado,
    periodo: n.periodo,
    sueldo_bruto: n.sueldo_bruto,
    descuentos: n.descuentos,
    sueldo_neto: n.sueldo_neto,
    fecha_pago: n.fechaPago,
    observaciones: n.observaciones ?? null,
    total: n.sueldo_neto,
    descuento: n.descuentos,
    fecha_actualizacion: n.updated_at,
  };
}

export function serializeVacacion(v) {
  if (!v) return null;
  return {
    vacacion_id: v.id,
    empleado_id: v.empleadoId,
    fecha_inicio: v.fecha_inicio,
    fecha_fin: v.fecha_fin,
    dias_tomados: v.dias_tomados,
    tipo: v.tipo,
    estatus: v.estatus,
    observaciones: v.observaciones ?? null,
    fecha_actualizacion: v.updated_at,
  };
}

// ============================================================================
// Operaciones
// ============================================================================

export function toNumberSafe(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return Number(value);
  return value;
}

export function serializeInstalacion(i) {
  if (!i) return null;
  return {
    fi_instalacion_id: i.id,
    instalacion_id: i.id,
    nombre: i.nombre,
    nombre_instalacion: i.nombre,
    tipo: i.tipo ?? null,
    tipo_instalacion: i.tipo ?? null,
    granja: i.granja,
    fc_granja: i.granja,
    capacidad: i.capacidad ?? null,
    observaciones: i.observaciones ?? null,
  };
}

export function serializeReproductor(r) {
  if (!r) return null;
  return {
    fi_reproductor_id: r.id,
    reproductor_id: r.id,
    pileta_id: r.pileta_id,
    nombre_pileta: r.piletas?.nombre ?? null,
    fn_machos: r.machos,
    fn_hembras: r.hembras,
    fn_cantidad: r.cantidad_total ?? (Number(r.machos || 0) + Number(r.hembras || 0)),
    cantidad_total: r.cantidad_total ?? null,
    fn_talla: r.talla,
    talla: r.talla,
    fc_ratio: r.ratio,
    ratio: r.ratio,
    fc_linea: r.linea,
    linea: r.linea,
    fc_familia: r.familia,
    familia: r.familia,
    siembra_id: r.siembra_id ?? null,
    biometria_id: r.biometria_id ?? null,
    fc_granja: r.piletas?.ubicacion?.nombre ?? null,
    fi_usuario_id: r.usuarioId,
    fc_observacion: r.observacion?.comentario ?? null,
    observacion_id: r.observacionId ?? null,
  };
}

export function serializeLote(l) {
  if (!l) return null;
  return {
    fi_lote_id: l.id,
    lote_id: l.id,
    nombre: l.nombre,
    no_lote: l.nombre,
    instalacion_id: l.instalacionId,
    fi_instalacion_id: l.instalacionId,
    nombre_instalacion: l.instalacion?.nombre ?? null,
    familia: l.familia ?? null,
    fecha_ingreso: l.fecha_ingreso ?? null,
    fd_fecha: l.fecha_ingreso ?? null,
    fecha: l.fecha_ingreso ?? null,
    cantidad: l.cantidad ?? null,
    alevines_inicial: l.cantidad ?? null,
    estatus: l.estatus ?? null,
    fc_granja: l.instalacion?.granja ?? null,
  };
}

export function serializePileta(p) {
  if (!p) return null;
  return {
    fi_pileta_id: p.id,
    pileta_id: p.id,
    nombre: p.nombre,
    largo: p.largo,
    ancho: p.ancho,
    alto: p.alto,
    metros_cubicos: p.metros_cubicos,
    material: p.material,
    estado: p.estado,
    tipo: p.tipo,
    ubicacion_id: p.ubicacionId,
    fc_granja: p.ubicacion?.nombre ?? null,
  };
}

export function serializeEngorda(e) {
  if (!e) return null;
  return {
    fi_engorda_id: e.id,
    engorda_id: e.id,
    pileta_id: e.pileta_id,
    nombre_pileta: e.piletas?.nombre ?? null,
    destino_nombre: e.piletas?.nombre ?? null,
    cantidad: e.cantidad,
    talla_gr: e.tallaGr,
    siembra_id: e.siembra_id ?? null,
    biometria_id: e.biometria_id ?? null,
    fc_granja: e.piletas?.ubicacion?.nombre ?? null,
    fi_usuario_id: e.usuarioId,
    observacion: e.observacion?.comentario ?? null,
    observacion_id: e.observacionId ?? null,
  };
}

export function serializeEquipo(eq) {
  if (!eq) return null;
  return {
    fi_equipo_id: eq.id,
    equipo_id: eq.id,
    fc_nombre: eq.nombre,
    nombre: eq.nombre,
    fc_marca: eq.marca,
    marca: eq.marca,
    fc_modelo: eq.modelo,
    modelo: eq.modelo,
    fc_tipo: eq.tipo,
    tipo: eq.tipo,
    serial: eq.serial ?? null,
    fc_estado: eq.estado,
    estado: eq.estado,
    fc_observaciones: eq.observaciones ?? null,
    observaciones: eq.observaciones ?? null,
    fc_notas: eq.observaciones ?? null,
    fi_usuario_id: eq.usuarioId,
  };
}

export function serializeMantenimiento(m) {
  if (!m) return null;
  return {
    fi_mantenimiento_id: m.id,
    mantenimiento_id: m.id,
    fi_equipo_id: m.equipoId,
    equipo_id: m.equipoId,
    fd_fecha: m.fecha,
    fecha: m.fecha,
    fc_descripcion: m.descripcion,
    descripcion: m.descripcion,
    fn_costo: m.costo,
    costo: m.costo,
    fc_responsable: m.responsable ?? null,
    responsable: m.responsable ?? null,
  };
}

export function serializeAlimento(a) {
  if (!a) return null;
  return {
    fi_alimento_id: a.id,
    alimento_id: a.id,
    fi_pileta_id: a.piletaId ?? null,
    pileta_id: a.piletaId ?? null,
    fi_engorda_id: a.engordaId ?? null,
    engorda_id: a.engordaId ?? null,
    fi_reproductor_id: a.reproductorId ?? null,
    reproductor_id: a.reproductorId ?? null,
    milimetros_particula: a.milimetros_particula,
    particula_mm: a.milimetros_particula,
    cantidad_dia: a.cantidad_dia,
    alimento_dia: a.cantidad_dia,
    porcion: a.porcion,
    costo_total: a.costo_total,
    gasto_alimento: a.costo_total,
    fi_usuario_id: a.usuarioId,
    pileta_nombre: a.pileta?.nombre ?? null,
    engorda_pileta: a.engorda?.piletas?.nombre ?? null,
    reproductor_pileta: a.reproductor?.piletas?.nombre ?? null,
    usuario_nombre: a.usuario?.nombre ?? null,
  };
}

export function serializeInventarioAlevin(a) {
  if (!a) return null;
  return {
    fi_id: a.id,
    id: a.id,
    ubicacion_id: a.ubicacionId,
    ubicacion: a.ubicacion?.nombre ?? null,
    pileta_id: a.pileta_id ?? null,
    nombre_pileta: a.piletas?.nombre ?? null,
    fn_num_instalacion: a.pileta_id ?? null,
    lote_nombre: a.lote_nombre ?? null,
    fc_lote: a.lote_nombre ?? null,
    fn_cantidad: a.cantidad,
    cantidad: a.cantidad,
    fn_talla: a.talla,
    talla: a.talla,
    fc_observacion: a.observacion?.comentario ?? null,
    observacion_id: a.observacionId ?? null,
    fd_fecha_siembra: a.fechaSiembra,
    fd_fecha_salida_hormonado: a.fechaSalidaHormonado,
    fi_usuario_id: a.usuarioId,
  };
}

// Los serializers de TrazaAlevinaje/TrazaEngorda/TrazaReproductor se
// removieron porque esos modelos ya no existen en el schema. Quien necesite
// trazabilidad debe migrar a `siembra` (con pileta_origen/pileta_destino,
// cantidad, fecha y usuario_id) y `Biometria`.

// ============================================================================
// Ventas / Finanzas / Catalogos
// ============================================================================

export function serializeCliente(c) {
  if (!c) return null;
  return {
    fi_cliente_id: c.id,
    cliente_id: c.id,
    nombre: c.nombre,
    fc_razon_social: c.nombre,
    empresa: c.empresa ?? null,
    fc_nombre_contacto: c.empresa ?? null,
    telefono: c.telefono ?? null,
    fc_telefono: c.telefono ?? null,
    email: c.email ?? null,
    fc_correo: c.email ?? null,
    activo: c.esta_activo,
  };
}

export function serializeProveedor(p) {
  if (!p) return null;
  return {
    fi_proveedor_id: p.id,
    proveedor_id: p.id,
    nombre: p.nombre,
    fc_razon_social: p.nombre,
    rfc: p.rfc ?? null,
    fc_rfc: p.rfc ?? null,
    telefono: p.telefono ?? null,
    fc_telefono: p.telefono ?? null,
    email: p.email ?? null,
    fc_correo: p.email ?? null,
    direccion: p.direccion ?? null,
    fc_direccion: p.direccion ?? null,
    activo: p.esta_activo,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export function serializeVenta(v) {
  if (!v) return null;
  return {
    fi_venta_id: v.id,
    venta_id: v.id,
    fc_folio: v.folio,
    folio: v.folio,
    fd_fecha_venta: v.fecha,
    fecha: v.fecha,
    fc_cliente: v.cliente_nombre,
    cliente_nombre: v.cliente_nombre,
    fc_tipo_venta: v.tipoVenta,
    tipo_venta: v.tipoVenta,
    fn_cantidad_vendida: v.cantidad,
    cantidad: v.cantidad,
    fn_precio_venta: v.precio_unitario,
    precio_unitario: v.precio_unitario,
    fn_monto_total: v.montoTotal,
    monto_total: v.montoTotal,
    fn_abonado: v.monto_abonado,
    monto_abonado: v.monto_abonado,
    fn_adeudo: v.monto_adeudo,
    monto_adeudo: v.monto_adeudo,
    fc_estado_pago: v.estadoPago,
    estado_pago: v.estadoPago,
    fc_empresa: v.empresa,
    empresa: v.empresa,
    fc_encargado_venta: v.vendedor_nombre,
    vendedor_nombre: v.vendedor_nombre,
    fc_observaciones: v.observacion?.comentario ?? null,
    observacion_id: v.observacionId ?? null,
    fi_usuario_id: v.usuario_id,
  };
}

export function serializeListaEspera(l) {
  if (!l) return null;
  return {
    fi_lista_id: l.id,
    lista_id: l.id,
    cliente_id: l.cliente_id ?? null,
    cliente_nombre: l.cliente_nombre,
    fc_cliente: l.cliente_nombre,
    cantidad_peces: l.cantidad_peces ?? null,
    fn_cantidad: l.cantidad_peces ?? null,
    precio_unitario: l.precio_unitario ?? null,
    fn_precio_venta: l.precio_unitario ?? null,
    notas: l.notas ?? null,
    fc_notas: l.notas ?? null,
    estatus: l.estatus,
    cliente_nombre_relacionado: l.clientes?.nombre ?? null,
  };
}

export function serializeCuenta(c) {
  if (!c) return null;
  return {
    fi_cuenta_id: c.id,
    cuenta_id: c.id,
    fc_udn: c.unidad_negocio,
    unidad_negocio: c.unidad_negocio,
    fc_nombre: c.nombre,
    nombre: c.nombre,
    fc_numero_cuenta: c.numeroCuenta,
    numero_cuenta: c.numeroCuenta,
    fc_banco: c.banco,
    banco: c.banco,
    fc_tipo: c.tipo_cuenta,
    tipo_cuenta: c.tipo_cuenta,
    fn_saldo_actual: c.saldoActual,
    saldo_actual: c.saldoActual,
    fb_activo: c.esta_activa,
    activo: c.esta_activa,
  };
}

export function serializeFlujoCaja(f) {
  if (!f) return null;
  return {
    fi_movimiento_id: f.id,
    movimiento_id: f.id,
    fc_granja: f.ubicacion?.nombre ?? null,
    ubicacion_id: f.ubicacionId,
    fd_fecha: f.fecha,
    fecha: f.fecha,
    fn_ingreso: f.ingreso,
    ingreso: f.ingreso,
    fn_egreso: f.egreso,
    egreso: f.egreso,
    fc_descripcion: f.descripcion,
    descripcion: f.descripcion,
    fc_cuenta: f.cuenta_nombre,
    cuenta_nombre: f.cuenta_nombre,
    fc_categoria: f.categoria,
    categoria: f.categoria,
    fc_subcategoria: f.subcategoria,
    subcategoria: f.subcategoria,
    fc_beneficiario: f.beneficiario,
    beneficiario: f.beneficiario,
    fc_estatus: f.estatus,
    estatus: f.estatus,
    fc_mes: f.mes_periodo,
    mes_periodo: f.mes_periodo,
    fi_usuario_id: f.usuario_id ?? null,
  };
}

export function serializeUnidadNegocioFull(u) {
  if (!u) return null;
  return {
    fi_unidad_negocio_id: u.id,
    unidad_negocio_id: u.id,
    fc_nombre: u.nombre,
    fb_activo: u.esta_activo,
    activo: u.esta_activo,
  };
}

export function serializeUbicacion(u) {
  if (!u) return null;
  return {
    ubicacion_id: u.id,
    nombre: u.nombre,
    direccion: u.direccion ?? null,
    descripcion: u.descripcion ?? null,
    activo: u.esta_activo ?? true,
  };
}

export function serializeCajaAhorroResumen(c) {
  if (!c) return null;
  return {
    caja_ahorro_id: c.id,
    id: c.id,
    granja: c.granja,
    categoria: c.categoria,
    concepto: c.concepto ?? null,
    monto: c.monto,
    fecha: c.fecha ?? null,
    actualizado: c.updated_at ?? null,
  };
}

// ============================================================================
// Bitácoras (bd2.sql / Prisma)
// ============================================================================

export function serializeBiometria(b) {
  if (!b) return null;
  return {
    fi_id: b.id,
    id: b.id,
    pileta_id: b.pileta_id,
    nombre_pileta: b.piletas?.nombre ?? null,
    fd_fecha: b.fecha,
    fecha: b.fecha,
    fn_peso_total_gramos: toNumberSafe(b.pesoTotalGramos),
    fn_organismos_muestreados: b.organismosMuestreados,
    fn_peso_promedio: toNumberSafe(b.pesoPromedio),
    fc_encargado: b.encargado,
    fi_usuario_id: b.usuarioId,
    ubicacion: b.piletas?.ubicacion?.nombre ?? null,
    ubicacion_id: b.piletas?.ubicacionId ?? null,
  };
}

export function serializeAlimentacion(a) {
  if (!a) return null;
  return {
    fi_id: a.id,
    id: a.id,
    fc_mes: a.mes,
    fn_num_instalacion: a.pileta_id ?? null,
    pileta_id: a.pileta_id ?? null,
    fn_peso_promedio_entrada: toNumberSafe(a.pesoPromedioEntrada),
    fd_fecha_siembra: a.fechaSiembra,
    fc_origen_alevines: a.origenAlevines,
    fd_fecha: a.fecha,
    fn_total_alimento_kg: toNumberSafe(a.totalAlimentoKg),
    fn_mortalidad: a.mortalidad,
    fc_recambio_agua: a.recambioAgua,
    fn_temp_agua: toNumberSafe(a.temperatura_agua),
    temperatura_agua: toNumberSafe(a.temperatura_agua),
    fn_amonio: toNumberSafe(a.amonio),
    fn_ph: toNumberSafe(a.ph),
    fc_observaciones: a.observacion?.comentario ?? null,
    observacion_id: a.observacionId ?? null,
    fi_usuario_id: a.usuarioId,
    ubicacion: a.ubicacion?.nombre ?? null,
    ubicacion_id: a.ubicacionId,
  };
}

export function serializeBano(row) {
  if (!row) return null;
  return {
    fi_id: row.id,
    id: row.id,
    fd_fecha: row.fecha,
    fc_tipo_banio: row.tipoBanio,
    fc_regadera: row.regadera,
    fc_realizo: row.realizado_por,
    realizado_por: row.realizado_por,
    fc_observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeBitacoraInsumo(row) {
  if (!row) return null;
  return {
    fi_id: row.id,
    id: row.id,
    fd_fecha: row.fecha,
    fc_cantidad_udm: row.cantidadUdm,
    fc_num_lote: row.numero_lote,
    numero_lote: row.numero_lote,
    fc_descripcion: row.descripcion,
    fc_observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    fc_encargado_entrega: row.encargadoEntrega,
    fc_encargado_recepcion: row.encargadoRecepcion,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeParametro(row) {
  if (!row) return null;
  return {
    fi_id: row.id,
    id: row.id,
    fd_fecha: row.fecha,
    fn_num_estanque: row.numero_estanque,
    numero_estanque: row.numero_estanque,
    fn_oxigeno: toNumberSafe(row.oxigeno),
    fn_temperatura: toNumberSafe(row.temperatura),
    fn_ph: toNumberSafe(row.ph),
    fn_amonio: toNumberSafe(row.amonio),
    fn_nitritos: toNumberSafe(row.nitritos),
    fn_nitratos: toNumberSafe(row.nitratos),
    fc_responsable: row.responsable ?? null,
    responsable: row.responsable ?? null,
    fc_observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeMedicamento(row) {
  if (!row) return null;
  return {
    fi_id: row.id,
    id: row.id,
    fd_fecha_hora: row.fechaHora,
    fn_num_estanque: row.numero_estanque,
    numero_estanque: row.numero_estanque,
    fc_diagnosis: row.diagnostico,
    diagnostico: row.diagnostico,
    fc_tratamiento: row.tratamiento,
    fc_dosis: row.dosis,
    fc_forma_aplicacion: row.formaAplicacion,
    fd_fecha_ultima_dosis: row.fechaUltimaDosis,
    fc_responsable: row.responsable ?? null,
    responsable: row.responsable ?? null,
    fc_observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializePlaga(row) {
  if (!row) return null;
  return {
    fi_id: row.id,
    id: row.id,
    fd_fecha: row.fecha,
    fc_num_trampa: row.numero_trampa,
    numero_trampa: row.numero_trampa,
    tipo_trampa: row.tipoTrampa,
    fc_tipo_trampa: row.tipoTrampa,
    fc_hallazgo: row.hallazgo,
    fc_malla: row.malla,
    fc_veneno: row.veneno,
    fc_observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    fc_verifico: row.verificador,
    verificador: row.verificador,
    unidad_produccion: row.unidadProduccion,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeRecambio(row) {
  if (!row) return null;
  return {
    fi_id: row.id,
    id: row.id,
    fc_mes: row.mes_periodo,
    mes_periodo: row.mes_periodo,
    fn_num_instalacion: row.pileta_id,
    pileta_id: row.pileta_id,
    fd_fecha1: row.fecha_1,
    fc_tipo1: row.tipo_1,
    fd_fecha2: row.fecha_2,
    fc_tipo2: row.tipo_2,
    fd_fecha3: row.fecha_3,
    fc_tipo3: row.tipo_3,
    fd_fecha4: row.fecha_4,
    fc_tipo4: row.tipo_4,
    fd_fecha5: row.fecha_5,
    fc_tipo5: row.tipo_5,
    fd_fecha6: row.fecha_6,
    fc_tipo6: row.tipo_6,
    fc_responsable: row.responsable ?? null,
    responsable: row.responsable ?? null,
    fc_observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeVisita(row) {
  if (!row) return null;
  return {
    fi_id: row.id,
    id: row.id,
    fd_fecha: row.fecha,
    fd_entrada: row.hora_entrada,
    hora_entrada: row.hora_entrada,
    fd_salida: row.hora_salida,
    hora_salida: row.hora_salida,
    fc_nombre_completo: row.nombreCompleto,
    fc_origen: row.procedencia,
    procedencia: row.procedencia,
    fc_motivo: row.motivo,
    fc_observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    fc_foto_identificacion: row.fotoIdentificacion,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeRecepcionInsumo(row) {
  if (!row) return null;
  return {
    fi_id: row.id,
    id: row.id,
    fd_fecha: row.fecha,
    fc_proveedor: row.proveedor_nombre,
    proveedor_nombre: row.proveedor_nombre,
    fc_producto: row.producto,
    fc_unidad_medida: row.unidadMedida,
    fc_cantidad: toNumberSafe(row.cantidad),
    cantidad: toNumberSafe(row.cantidad),
    fc_lote: row.numero_lote,
    numero_lote: row.numero_lote,
    fc_condiciones_entrega: row.condicionesEntrega,
    fc_encargado_entrega: row.encargadoEntrega,
    fc_verifico: row.verificador,
    verificador: row.verificador,
    fc_observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}
