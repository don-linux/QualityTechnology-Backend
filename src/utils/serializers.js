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
    fi_instalacion_id: i.instalacionId,
    instalacion_id: i.instalacionId,
    nombre_instalacion: i.nombreInstalacion,
    tipo_instalacion: i.tipoInstalacion,
    estado: i.estado,
    largo: i.largo,
    ancho: i.ancho,
    altura: i.altura,
    material: i.material,
    metros_cubicos: i.metrosCubicos,
    ubicacion_id: i.ubicacionId,
    fc_granja: i.ubicacion?.nombre ?? null,
    usuario_id: i.usuarioId,
  };
}

export function serializeReproductor(r) {
  if (!r) return null;
  return {
    fi_reproductor_id: r.reproductorId,
    reproductor_id: r.reproductorId,
    fi_instalacion_id: r.instalacionId,
    instalacion_id: r.instalacionId,
    nombre_instalacion: r.instalacion?.nombreInstalacion ?? null,
    fn_machos: r.machos,
    fn_hembras: r.hembras,
    fn_cantidad: r.cantidad ?? (Number(r.machos || 0) + Number(r.hembras || 0)),
    fn_talla: r.talla,
    fc_ratio: r.ratio,
    fc_linea: r.linea,
    fc_familia: r.familia,
    fd_fecha_siembra: r.fechaSiembra,
    fd_fecha_biometria: r.fechaBiometria,
    ubicacion_id: r.ubicacionId,
    fc_granja: r.ubicacion?.nombre ?? null,
    fi_usuario_id: r.usuarioId,
    fc_observacion: r.observacion?.observacion ?? null,
    observacion_id: r.observacionId ?? null,
  };
}

export function serializeLote(l) {
  if (!l) return null;
  return {
    fi_lote_id: l.loteId,
    lote_id: l.loteId,
    no_lote: l.noLote,
    fd_fecha: l.fecha,
    fecha: l.fecha,
    familia: l.familia,
    fi_instalacion_id: l.instalacionId,
    fc_instalacion_id: l.instalacionId,
    instalacion_id: l.instalacionId,
    nombre_instalacion: l.instalacion?.nombreInstalacion ?? null,
    huevos_ml: l.huevosMl,
    ovadas: l.ovadas,
    alevines_inicial: l.alevinesInicial,
    mortalidad: l.mortalidad,
    mortalidad_porcentaje: l.mortalidadPorcentaje,
    ubicacion_id: l.ubicacionId,
    fc_granja: l.ubicacion?.nombre ?? null,
    fi_usuario_id: l.usuarioId,
    observacion: l.observacion?.observacion ?? null,
    observacion_id: l.observacionId ?? null,
  };
}

export function serializePileta(p) {
  if (!p) return null;
  return {
    fi_pileta_id: p.piletaId,
    pileta_id: p.piletaId,
    fi_instalacion_id: p.instalacionId,
    instalacion_id: p.instalacionId,
    nombre_instalacion: p.instalacion?.nombreInstalacion ?? null,
    fi_lote_id: p.loteId,
    lote_id: p.loteId,
    no_lote: p.lote?.noLote ?? null,
    cantidad: toNumberSafe(p.cantidad),
    talla_gr: p.tallaGr,
    fd_fecha_siembra: p.fechaSiembra,
    fecha_siembra: p.fechaSiembra,
    fd_fecha_ultima_biometria: p.fechaUltimaBiometria,
    fecha_ultima_biometria: p.fechaUltimaBiometria,
    ubicacion_id: p.ubicacionId,
    fc_granja: p.ubicacion?.nombre ?? null,
    fi_usuario_id: p.usuarioId,
    observacion: p.observacion?.observacion ?? null,
    observacion_id: p.observacionId ?? null,
  };
}

export function serializeEngorda(e) {
  if (!e) return null;
  return {
    fi_engorda_id: e.engordaId,
    engorda_id: e.engordaId,
    fi_instalacion_id: e.instalacionId,
    instalacion_id: e.instalacionId,
    destino_nombre: e.instalacion?.nombreInstalacion ?? null,
    fi_lote_id: e.loteId,
    no_lote: e.lote?.noLote ?? null,
    cantidad: e.cantidad,
    talla_gr: e.tallaGr,
    fd_fecha_siembra: e.fechaSiembra,
    fecha_siembra: e.fechaSiembra,
    fd_fecha_biometria: e.fechaBiometria,
    fecha_biometria: e.fechaBiometria,
    ubicacion_id: e.ubicacionId,
    fc_granja: e.ubicacion?.nombre ?? null,
    fi_usuario_id: e.usuarioId,
    observacion: e.observacion?.observacion ?? null,
    observacion_id: e.observacionId ?? null,
  };
}

export function serializeEquipo(eq) {
  if (!eq) return null;
  return {
    fi_equipo_id: eq.equipoId,
    equipo_id: eq.equipoId,
    fc_nombre: eq.nombre,
    fc_marca: eq.marca,
    fc_modelo: eq.modelo,
    fc_tipo: eq.tipo,
    fd_fecha_compra: eq.fechaCompra,
    fn_costo: eq.costo,
    fc_estado: eq.estado,
    fc_ubicacion: eq.ubicacion,
    fc_responsable: null,
    fd_proximo_mantenimiento: eq.proximoMantenimiento,
    fc_notas: eq.notas,
    fi_usuario_id: eq.usuarioId,
    observacion: eq.observacion?.observacion ?? null,
    observacion_id: eq.observacionId ?? null,
  };
}

export function serializeMantenimiento(m) {
  if (!m) return null;
  return {
    fi_mantenimiento_id: m.mantenimientoId,
    mantenimiento_id: m.mantenimientoId,
    fi_equipo_id: m.equipoId,
    fd_fecha: m.fecha,
    fc_tipo: m.tipo,
    fc_descripcion: m.descripcion,
    fn_costo: m.costo,
    fc_estado_post: m.estadoPost,
    fd_proximo_mantenimiento: m.proximoMantenimiento,
    observacion: m.observacion?.observacion ?? null,
    observacion_id: m.observacionId ?? null,
  };
}

export function serializeAlimento(a) {
  if (!a) return null;
  return {
    fi_alimento_id: a.alimentoId,
    alimento_id: a.alimentoId,
    fi_pileta_id: a.piletaId,
    fi_engorda_id: a.engordaId,
    fi_reproductor_id: a.reproductorId,
    particula_mm: a.particulaMm,
    alimento_dia: a.alimentoDia,
    porcion: a.porcion,
    gasto_alimento: a.gastoAlimento,
    fi_usuario_id: a.usuarioId,
    pileta_nombre: a.pileta?.instalacion?.nombreInstalacion ?? null,
    engorda_instalacion: a.engorda?.instalacion?.nombreInstalacion ?? null,
    reproductor_instalacion: a.reproductor?.instalacion?.nombreInstalacion ?? null,
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
    fn_num_instalacion: a.numInstalacion,
    fc_lote: a.lote,
    fn_cantidad: a.cantidad,
    fn_talla: a.talla,
    fc_observacion: a.observacion?.observacion ?? null,
    observacion_id: a.observacionId ?? null,
    fd_fecha_siembra: a.fechaSiembra,
    fd_fecha_salida_hormonado: a.fechaSalidaHormonado,
    fi_usuario_id: a.usuarioId,
  };
}

export function serializeTrazaAlevinaje(t) {
  if (!t) return null;
  return {
    fi_movimiento_id: t.movimientoId,
    movimiento_id: t.movimientoId,
    fi_pileta_origen: t.piletaOrigen,
    fi_pileta_destino: t.piletaDestino,
    fi_instalacion_origen: t.instalacionOrigen,
    fi_instalacion_destino: t.instalacionDestino,
    fi_lote_id: t.loteId,
    origen_externo: t.origenExterno,
    tipo_movimiento: t.tipoMovimiento,
    cantidad: toNumberSafe(t.cantidad),
    fd_fecha_movimiento: t.fechaMovimiento,
    fecha_movimiento: t.fechaMovimiento,
    fi_usuario_id: t.usuarioId,
    ubicacion_id: t.ubicacionId,
    observacion: t.observacion?.observacion ?? null,
    observacion_id: t.observacionId ?? null,
    origen_nombre: t.instalacionOrig?.nombreInstalacion ?? t.origenExterno ?? null,
    destino_nombre: t.instalacionDest?.nombreInstalacion ?? null,
  };
}

export function serializeTrazaEngorda(t) {
  if (!t) return null;
  return {
    fi_movimiento_id: t.movimientoId,
    movimiento_id: t.movimientoId,
    fi_engorda_origen: t.engordaOrigen,
    fi_engorda_destino: t.engordaDestino,
    cantidad_trasladada: t.cantidadTrasladada,
    fd_fecha_movimiento: t.fechaMovimiento,
    fecha_movimiento: t.fechaMovimiento,
    fi_usuario_id: t.usuarioId,
    observacion: t.observacion?.observacion ?? null,
    observacion_id: t.observacionId ?? null,
    origen_nombre: t.origen?.instalacion?.nombreInstalacion ?? "Siembra Lote",
    destino_nombre: t.destino?.instalacion?.nombreInstalacion ?? null,
  };
}

export function serializeTrazaReproductor(t) {
  if (!t) return null;
  return {
    fi_movimiento_id: t.movimientoId,
    movimiento_id: t.movimientoId,
    fi_repro_origen: t.reproOrigen,
    fi_repro_destino: t.reproDestino,
    origen_texto: t.origenTexto,
    origen: t.origen?.instalacion?.nombreInstalacion ?? t.origenTexto ?? null,
    destino: t.destino?.instalacion?.nombreInstalacion ?? null,
    cantidad_trasladada: t.cantidadTrasladada,
    fd_fecha_movimiento: t.fechaMovimiento,
    fecha_movimiento: t.fechaMovimiento,
    fi_usuario_id: t.usuarioId,
    observacion: t.observacion?.observacion ?? null,
    observacion_id: t.observacionId ?? null,
  };
}

// ============================================================================
// Ventas / Finanzas / Catalogos
// ============================================================================

export function serializeCliente(c) {
  if (!c) return null;
  const ejecutivo = c.ejecutivo
    ? [c.ejecutivo.nombre, c.ejecutivo.apellidoPaterno, c.ejecutivo.apellidoMaterno]
        .filter(Boolean)
        .join(" ")
    : null;
  return {
    fi_cliente_id: c.clienteId,
    cliente_id: c.clienteId,
    fc_razon_social: c.razonSocial,
    fc_rfc: c.rfc,
    fi_unidad_negocio_id: c.unidadNegocioId,
    unidad_negocio_nombre: c.unidadNegocio?.nombre ?? null,
    fc_nombre_contacto: c.nombreContacto,
    fc_telefono: c.telefono,
    fc_correo: c.correo,
    fc_localidad: c.localidad,
    fc_estado: c.estado,
    fi_ejecutivo_empleado_id: c.ejecutivoEmpleadoId,
    ejecutivo_nombre: ejecutivo,
    fi_usuario_id: c.usuarioId,
  };
}

export function serializeProveedor(p) {
  if (!p) return null;
  return {
    fi_proveedor_id: p.proveedorId,
    proveedor_id: p.proveedorId,
    fc_razon_social: p.razonSocial,
    fc_rfc: p.rfc,
    fc_producto_servicio: p.productoServicio,
    fi_unidad_negocio_id: p.unidadNegocioId,
    unidad_negocio_nombre: p.unidadNegocio?.nombre ?? null,
    fc_nombre_contacto: p.nombreContacto,
    fc_telefono: p.telefono,
    fc_correo: p.correo,
    fc_localidad: p.localidad,
    fc_estado: p.estado,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export function serializeVenta(v) {
  if (!v) return null;
  return {
    fi_venta_id: v.ventaId,
    venta_id: v.ventaId,
    fc_folio: v.folio,
    fd_fecha_venta: v.fechaVenta,
    fc_cliente: v.cliente,
    fc_tipo_venta: v.tipoVenta,
    fn_cantidad_vendida: v.cantidadVendida,
    fn_precio_venta: v.precioVenta,
    fn_monto_total: v.montoTotal,
    fn_abonado: v.abonado,
    fn_adeudo: v.adeudo,
    fc_estado_pago: v.estadoPago,
    fc_empresa: v.empresa,
    fc_encargado_venta: v.encargadoVenta,
    fc_observaciones: v.observacion?.observacion ?? null,
    observacion_id: v.observacionId ?? null,
  };
}

export function serializeListaEspera(l) {
  if (!l) return null;
  return {
    fi_lista_id: l.listaId,
    lista_id: l.listaId,
    fd_fecha_entrega: l.fechaEntrega,
    fc_talla: l.talla,
    fn_cantidad: l.cantidad,
    fn_precio_venta: l.precioVenta,
    fc_cliente: l.cliente,
    fc_lugar_entrega: l.lugarEntrega,
    fc_encargado_venta: l.encargadoVenta,
    fc_unidad_produccion: l.unidadProduccion,
    fc_uap_asignada: l.uapAsignada,
    fc_granja_asignada: l.ubicacion?.nombre ?? null,
    ubicacion_id: l.ubicacionId,
    fc_hora_embolsado: l.horaEmbolsado,
    fc_hora_entrega: l.horaEntrega,
  };
}

export function serializeCuenta(c) {
  if (!c) return null;
  return {
    fi_cuenta_id: c.cuentaId,
    cuenta_id: c.cuentaId,
    fc_udn: c.udn,
    fc_nombre: c.nombre,
    fc_numero_cuenta: c.numeroCuenta,
    fc_banco: c.banco,
    fc_tipo: c.tipo,
    fn_saldo_actual: c.saldoActual,
    fb_activo: c.activo,
    activo: c.activo,
  };
}

export function serializeFlujoCaja(f) {
  if (!f) return null;
  return {
    fi_movimiento_id: f.movimientoId,
    movimiento_id: f.movimientoId,
    fc_granja: f.ubicacion?.nombre ?? null,
    ubicacion_id: f.ubicacionId,
    fd_fecha: f.fecha,
    fn_ingreso: f.ingreso,
    fn_egreso: f.egreso,
    fc_descripcion: f.descripcion,
    fc_cuenta: f.cuenta,
    fc_categoria: f.categoria,
    fc_subcategoria: f.subcategoria,
    fc_beneficiario: f.beneficiario,
    fc_noproyecto: f.noproyecto,
    fc_factura: f.factura,
    fc_estatus: f.estatus,
    fc_mes: f.mes,
  };
}

export function serializeUnidadNegocioFull(u) {
  if (!u) return null;
  return {
    fi_unidad_negocio_id: u.unidadNegocioId,
    unidad_negocio_id: u.unidadNegocioId,
    fc_nombre: u.nombre,
    fb_activo: u.activo,
    activo: u.activo,
  };
}

export function serializeUbicacion(u) {
  if (!u) return null;
  return {
    ubicacion_id: u.ubicacionId,
    nombre: u.nombre,
    direccion: u.direccion,
    descripcion: u.descripcion,
    activo: u.activo,
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

// ============================================================================
// Bitácoras (bd2.sql / Prisma)
// ============================================================================

export function serializeBiometria(b) {
  if (!b) return null;
  return {
    fi_id: b.id,
    fd_fecha: b.fecha,
    fn_peso_total_gramos: toNumberSafe(b.pesoTotalGramos),
    fn_organismos_muestreados: b.organismosMuestreados,
    fn_peso_promedio: toNumberSafe(b.pesoPromedio),
    fc_observaciones: b.observacion?.observacion ?? null,
    fc_encargado: b.encargado,
    fi_instalacion_id: b.instalacionId,
    fi_lote_id: null,
    tipo: b.tipo,
    fi_usuario_id: b.usuarioId,
    ubicacion: b.ubicacion?.nombre ?? null,
    ubicacion_id: b.ubicacionId,
    instalacion_nombre: b.instalacion?.nombreInstalacion ?? null,
    observacion_id: b.observacionId ?? null,
    reproductor_id: b.reproductorId ?? null,
  };
}

export function serializeAlimentacion(a) {
  if (!a) return null;
  return {
    fi_id: a.id,
    fc_mes: a.mes,
    fn_num_instalacion: a.numInstalacion,
    fn_peso_promedio_entrada: toNumberSafe(a.pesoPromedioEntrada),
    fd_fecha_siembra: a.fechaSiembra,
    fc_origen_alevines: a.origenAlevines,
    fd_fecha: a.fecha,
    fn_total_alimento_kg: toNumberSafe(a.totalAlimentoKg),
    fn_mortalidad: a.mortalidad,
    fc_recambio_agua: a.recambioAgua,
    fn_temp_agua: toNumberSafe(a.tempAgua),
    fn_amonio: toNumberSafe(a.amonio),
    fn_ph: toNumberSafe(a.ph),
    fc_observaciones: a.observacion?.observacion ?? null,
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
    fd_fecha: row.fecha,
    fc_tipo_banio: row.tipoBanio,
    fc_regadera: row.regadera,
    fc_realizo: row.realizo,
    fc_observaciones: row.observacion?.observacion ?? null,
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
    fd_fecha: row.fecha,
    fc_cantidad_udm: row.cantidadUdm,
    fc_num_lote: row.numLote,
    fc_descripcion: row.descripcion,
    fc_observaciones: row.observacion?.observacion ?? null,
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
    fd_fecha: row.fecha,
    fn_num_estanque: row.numEstanque,
    fn_oxigeno: toNumberSafe(row.oxigeno),
    fn_temperatura: toNumberSafe(row.temperatura),
    fn_ph: toNumberSafe(row.ph),
    fn_amonio: toNumberSafe(row.amonio),
    fn_nitritos: toNumberSafe(row.nitritos),
    fn_nitratos: toNumberSafe(row.nitratos),
    fc_responsable: row.observacion?.responsable ?? null,
    fc_observaciones: row.observacion?.observacion ?? null,
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
    fd_fecha_hora: row.fechaHora,
    fn_num_estanque: row.numEstanque,
    fc_diagnosis: row.diagnosis,
    fc_tratamiento: row.tratamiento,
    fc_dosis: row.dosis,
    fc_forma_aplicacion: row.formaAplicacion,
    fd_fecha_ultima_dosis: row.fechaUltimaDosis,
    fc_responsable: row.observacion?.responsable ?? null,
    fc_observaciones: row.observacion?.observacion ?? null,
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
    fd_fecha: row.fecha,
    fc_num_trampa: row.numTrampa,
    tipo_trampa: row.tipoTrampa,
    fc_tipo_trampa: row.tipoTrampa,
    fc_hallazgo: row.hallazgo,
    fc_malla: row.malla,
    fc_veneno: row.veneno,
    fc_observaciones: row.observacion?.observacion ?? null,
    observacion_id: row.observacionId ?? null,
    fc_verifico: row.verifico,
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
    fc_mes: row.mes,
    fn_num_instalacion: row.numInstalacion,
    fd_fecha1: row.fecha1,
    fc_tipo1: row.tipo1,
    fd_fecha2: row.fecha2,
    fc_tipo2: row.tipo2,
    fd_fecha3: row.fecha3,
    fc_tipo3: row.tipo3,
    fd_fecha4: row.fecha4,
    fc_tipo4: row.tipo4,
    fd_fecha5: row.fecha5,
    fc_tipo5: row.tipo5,
    fd_fecha6: row.fecha6,
    fc_tipo6: row.tipo6,
    fc_responsable: row.observacion?.responsable ?? null,
    fc_observaciones: row.observacion?.observacion ?? null,
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
    fd_fecha: row.fecha,
    fd_entrada: row.entrada,
    fd_salida: row.salida,
    fc_nombre_completo: row.nombreCompleto,
    fc_origen: row.origen,
    fc_motivo: row.motivo,
    fc_observaciones: row.observacion?.observacion ?? null,
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
    fd_fecha: row.fecha,
    fc_proveedor: row.proveedor,
    fc_producto: row.producto,
    fc_unidad_medida: row.unidadMedida,
    fc_cantidad: toNumberSafe(row.cantidad),
    fc_lote: row.lote,
    fc_condiciones_entrega: row.condicionesEntrega,
    fc_encargado_entrega: row.encargadoEntrega,
    fc_verifico: row.verifico,
    fc_observaciones: row.observacion?.observacion ?? null,
    observacion_id: row.observacionId ?? null,
    fi_usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}
