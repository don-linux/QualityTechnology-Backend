/**
 * Convierte salidas de Prisma (camelCase) a snake_case alineado con bd2.sql,
 * preservando el contrato HTTP esperado por el frontend existente.
 */

import { cantidadVigenteDesdeRegistrosPeriodicos } from "./inventarioVigente.js";

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

export function serializeEstadoConservacion(e) {
  if (!e) return null;
  return {
    estado_conservacion_id: e.id,
    nombre: e.nombre,
    activo: e.esta_activo,
  };
}

export function serializeTipoInstanciaPileta(t) {
  if (!t) return null;
  return {
    tipo_instancia_pileta_id: t.id,
    nombre: t.nombre,
    activo: t.esta_activo,
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

export function serializeReproductor(r) {
  if (!r) return null;
  const listaObs = r.piletas?.observaciones;
  const ultObs = Array.isArray(listaObs) ? listaObs[0] : null;
  const fechaBioDirecta = r.biometrias?.fecha ?? null;
  const fechaBioUltimaPileta = r.piletas?.biometrias?.[0]?.fecha ?? null;
  const fd_fecha_biometria = fechaBioDirecta ?? fechaBioUltimaPileta ?? null;

  return {
    fi_reproductor_id: r.id,
    reproductor_id: r.id,
    pileta_id: r.pileta_id,
    nombre_instalacion: r.piletas?.nombre ?? null,
    nombre_pileta: r.piletas?.nombre ?? null,
    fn_machos: r.machos,
    fn_hembras: r.hembras,
    fn_cantidad: Number(r.machos || 0) + Number(r.hembras || 0),
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
    /** Fecha del movimiento `siembra` vinculado (traslado/ingreso a esta pileta). */
    fd_fecha_siembra: r.siembra?.fecha ?? null,
    /** Última biometría: puntero del reproductor o, si no hay, la más reciente de la pileta. */
    fd_fecha_biometria,
    /** Alta del inventario repro (fallback para “días en pila” si aún no hay siembra vinculada). */
    fd_alta_reproductor: r.created_at ?? null,
    fc_granja: r.piletas?.ubicacion?.nombre ?? null,
    fi_usuario_id: r.usuarioId,
    fc_observacion: r.observacion?.comentario ?? null,
    observacion_id: r.observacionId ?? null,
    fc_ultima_observacion_pileta: ultObs?.comentario ?? null,
    fc_ultima_observacion_proceso: ultObs?.proceso ?? null,
    fd_ultima_observacion_pileta: ultObs?.created_at ?? null,
  };
}

/** Inventario vigente en la pileta, sin importar etapa (reproductores, alevinaje o engorda). */
export function calcularCantidadPileta(p) {
  if (!p) return 0;

  const rep = p.reproductores;
  if (rep) {
    return Number(rep.machos || 0) + Number(rep.hembras || 0) || 0;
  }

  const engRows = Array.isArray(p.engorda) ? p.engorda : p.engorda ? [p.engorda] : [];
  if (engRows.length > 0) {
    return cantidadVigenteDesdeRegistrosPeriodicos(engRows);
  }

  const rows = Array.isArray(p.alevinaje) ? p.alevinaje : [];
  return cantidadVigenteDesdeRegistrosPeriodicos(rows);
}

export function serializePileta(p) {
  if (!p) return null;
  const lista = Array.isArray(p.observaciones) ? p.observaciones : [];
  const ultima = lista[0];
  const comUlt = ultima?.comentario ?? null;
  const cantidad = calcularCantidadPileta(p);

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
    estado_conservacion_id: p.estadoConservacionId ?? null,
    fc_estado_conservacion: p.estadoConservacion?.nombre ?? null,
    tipo_instancia: p.tipoInstanciaId ?? null,
    fc_tipo_instancia: p.tipoInstancia?.nombre ?? null,
    ubicacion_id: p.ubicacionId,
    fc_granja: p.ubicacion?.nombre ?? null,
    cantidad,
    fn_cantidad: cantidad,
    ultima_observacion: comUlt,
    fc_ultima_observacion_proceso: ultima?.proceso ?? null,
    fd_ultima_observacion: ultima?.created_at ?? null,
    observacion: comUlt,
  };
}

export function serializeEngorda(e) {
  if (!e) return null;
  const piletaUlt = Array.isArray(e.piletas?.observaciones) ? e.piletas.observaciones[0] : null;
  const obsBio = e.biometrias?.observacionBiometria;
  const obsBioComentario = obsBio?.comentario ?? piletaUlt?.comentario ?? null;
  const obsBioFecha = obsBio?.created_at ?? piletaUlt?.created_at ?? null;
  const hp = e.historial_peso ?? null;

  return {
    fi_engorda_id: e.id,
    fi_id: e.id,
    id: e.id,
    engorda_id: e.id,
    pileta_id: e.pileta_id,
    fi_pileta_destino_id: e.pileta_id,
    pileta_destino_id: e.pileta_id,
    nombre_pileta_destino: e.piletas?.nombre ?? null,
    nombre_pileta: e.piletas?.nombre ?? null,
    destino_nombre: e.piletas?.nombre ?? null,
    fc_granja: e.piletas?.ubicacion?.nombre ?? null,
    cantidad_total: e.cantidad_total ?? 0,
    cantidad: e.cantidad_total ?? 0,
    cantidad_alimento: e.cantidad_alimento ?? 0,
    historial_peso_id: e.peso ?? null,
    peso: hp?.peso != null ? Number(hp.peso) : null,
    peso_kg: hp?.peso != null ? Number(hp.peso) : null,
    fecha_peso: hp?.fecha ?? null,
    fd_fecha_peso: hp?.fecha ?? null,
    siembra_origen_id: e.siembra_origen_id ?? null,
    siembra_origen_pileta:
      e.siembra_origen?.piletas_siembra_pileta_origenTopiletas?.nombre ?? null,
    siembra_origen_cantidad: e.siembra_origen?.cantidad
      ? Number(e.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: e.siembra_origen?.fecha ?? null,
    origen_pileta_id: e.siembra_origen?.pileta_origen ?? null,
    origen_nombre_pileta: e.siembra_origen?.piletas_siembra_pileta_origenTopiletas?.nombre ?? null,
    biometria_id: e.biometria_id ?? null,
    fc_observacion: e.observacion?.comentario ?? null,
    observacion: e.observacion?.comentario ?? null,
    observacion_id: e.observacion_id ?? null,
    fc_ultima_observacion_pileta: piletaUlt?.comentario ?? null,
    fc_ultima_observacion_proceso: piletaUlt?.proceso ?? null,
    fd_ultima_observacion_pileta: piletaUlt?.created_at ?? null,
    fc_observacion_biometria: obsBioComentario,
    fd_observacion_biometria: obsBioFecha,
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

export function serializeSiembra(s) {
  if (!s) return null;
  const pilOr = s.piletas_siembra_pileta_origenTopiletas ?? null;
  const pilDest = s.piletas_siembra_pileta_destinoTopiletas ?? null;
  const cant =
    typeof s.cantidad === "bigint"
      ? Number(s.cantidad)
      : s.cantidad != null
        ? Number(s.cantidad)
        : null;
  const familiaOrigen = pilOr?.reproductores?.familia ?? null;

  return {
    fi_siembra_id: s.id,
    id: s.id,
    pileta_origen_id: s.pileta_origen ?? null,
    nombre_pileta_origen: pilOr?.nombre ?? null,
    tipo_pileta_origen: pilOr?.tipo ?? null,
    familia_origen: familiaOrigen,
    pileta_destino_id: s.pileta_destino,
    nombre_pileta_destino: pilDest?.nombre ?? null,
    tipo_pileta_destino: pilDest?.tipo ?? null,
    fc_granja: pilDest?.ubicacion?.nombre ?? null,
    cantidad: cant,
    mortalidad: s.mortalidad ?? 0,
    fecha: s.fecha,
  };
}

export function serializeAlevinaje(a) {
  if (!a) return null;
  const piletaUlt = Array.isArray(a.piletas?.observaciones) ? a.piletas.observaciones[0] : null;
  const obsBio = a.biometrias?.observacionBiometria;
  const obsBioComentario = obsBio?.comentario ?? piletaUlt?.comentario ?? null;
  const obsBioFecha = obsBio?.created_at ?? piletaUlt?.created_at ?? null;
  const hp = a.historial_peso ?? null;

  return {
    fi_id: a.id,
    id: a.id,
    pileta_id: a.pileta_id,
    fi_pileta_destino_id: a.pileta_id,
    pileta_destino_id: a.pileta_id,
    nombre_pileta_destino: a.piletas?.nombre ?? null,
    nombre_pileta: a.piletas?.nombre ?? null,
    fc_granja: a.piletas?.ubicacion?.nombre ?? null,
    cantidad_total: a.cantidad_total ?? 0,
    cantidad_alimento: a.cantidad_alimento ?? 0,
    historial_peso_id: a.peso ?? null,
    peso: hp?.peso != null ? Number(hp.peso) : null,
    peso_kg: hp?.peso != null ? Number(hp.peso) : null,
    fecha_peso: hp?.fecha ?? null,
    fd_fecha_peso: hp?.fecha ?? null,
    siembra_origen_id: a.siembra_origen_id ?? null,
    siembra_origen_pileta:
      a.siembra_origen?.piletas_siembra_pileta_origenTopiletas?.nombre ?? null,
    siembra_origen_cantidad: a.siembra_origen?.cantidad
      ? Number(a.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: a.siembra_origen?.fecha ?? null,
    biometria_id: a.biometria_id ?? null,
    fc_observacion: a.observacion?.comentario ?? null,
    observacion: a.observacion?.comentario ?? null,
    observacion_id: a.observacion_id ?? null,
    fc_ultima_observacion_pileta: piletaUlt?.comentario ?? null,
    fc_ultima_observacion_proceso: piletaUlt?.proceso ?? null,
    fd_ultima_observacion_pileta: piletaUlt?.created_at ?? null,
    fc_observacion_biometria: obsBioComentario,
    fd_observacion_biometria: obsBioFecha,
  };
}

export function serializeControlReproductivo(r) {
  if (!r) return null;
  return {
    fi_id: r.id,
    id: r.id,
    pileta_id: r.pileta_id,
    fi_pileta_destino_id: r.pileta_id,
    pileta_destino_id: r.pileta_id,
    nombre_pileta_destino: r.piletas?.nombre ?? null,
    nombre_pileta: r.piletas?.nombre ?? null,
    fc_granja: r.piletas?.ubicacion?.nombre ?? null,
    pileta_origen_reproductora_id: r.pileta_origen_reproductora_id ?? null,
    fi_instalacion_id: r.pileta_origen_reproductora_id ?? null,
    instalacion_id: r.pileta_origen_reproductora_id ?? null,
    nombre_pileta_origen: r.pileta_origen_reproductora?.nombre ?? null,
    nombre_instalacion: r.pileta_origen_reproductora?.nombre ?? null,
    fecha: r.fecha ?? null,
    fd_fecha: r.fecha ?? null,
    lote: r.lote ?? null,
    fc_lote: r.lote ?? null,
    familia: r.familia ?? null,
    fc_familia: r.familia ?? null,
    huevos_ml: r.huevos_ml != null ? Number(r.huevos_ml) : null,
    fn_huevos_ml: r.huevos_ml != null ? Number(r.huevos_ml) : null,
    ovadas: r.ovadas ?? 0,
    fn_ovadas: r.ovadas ?? 0,
    machos: r.machos ?? 0,
    fn_machos: r.machos ?? 0,
    hembras: r.hembras ?? 0,
    fn_hembras: r.hembras ?? 0,
    cantidad_total: r.cantidad_total ?? 0,
    fn_cantidad_total: r.cantidad_total ?? 0,
    alevines_iniciales: r.alevines_iniciales ?? 0,
    fn_alevines_iniciales: r.alevines_iniciales ?? 0,
    mortalidad: r.mortalidad ?? 0,
    fn_mortalidad: r.mortalidad ?? 0,
    mortalidad_porcentaje:
      r.mortalidad_porcentaje != null ? Number(r.mortalidad_porcentaje) : 0,
    siembra_origen_id: r.siembra_origen_id ?? null,
    biometria_id: r.biometria_id ?? null,
    fc_observacion: r.observacion?.comentario ?? null,
    observacion: r.observacion?.comentario ?? null,
    observacion_id: r.observacion_id ?? null,
    created_at: r.created_at ?? null,
    updated_at: r.updated_at ?? null,
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

function nombreEmpleado(e) {
  if (!e) return null;
  return [e.nombre, e.apellidoPaterno, e.apellidoMaterno].filter(Boolean).join(" ");
}

export function serializeCliente(c) {
  if (!c) return null;
  const ejecutivoId = c.ejecutivoEmpleadoId ?? c.ejecutivo?.id ?? null;
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
    ejecutivo_empleado_id: ejecutivoId,
    fi_ejecutivo_empleado_id: ejecutivoId,
    ejecutivo_nombre: nombreEmpleado(c.ejecutivo) ?? null,
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
  const fechaEntrega = l.fecha_entrega
    ? (l.fecha_entrega instanceof Date
        ? l.fecha_entrega.toISOString().slice(0, 10)
        : String(l.fecha_entrega).slice(0, 10))
    : null;
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
    tipo_venta: l.tipo_venta ?? null,
    fc_uap_asignada: l.tipo_venta ?? null,
    granja: l.granja ?? null,
    fc_granja_asignada: l.granja ?? null,
    fecha_entrega: fechaEntrega,
    fd_fecha_entrega: fechaEntrega,
    lugar_entrega: l.lugar_entrega ?? null,
    fc_lugar_entrega: l.lugar_entrega ?? null,
    unidad_produccion: l.unidad_produccion ?? null,
    fc_unidad_produccion: l.unidad_produccion ?? null,
    hora_embolsado: l.hora_embolsado ?? null,
    fc_hora_embolsado: l.hora_embolsado ?? null,
    hora_entrega: l.hora_entrega ?? null,
    fc_hora_entrega: l.hora_entrega ?? null,
    encargado_venta: l.encargado_venta ?? null,
    fc_encargado_venta: l.encargado_venta ?? null,
    pileta_origen_id: l.pileta_origen_id ?? null,
    fi_pileta_origen_id: l.pileta_origen_id ?? null,
    nombre_pileta_origen: l.pileta_origen?.nombre ?? null,
    venta_id: l.venta_id ?? null,
    fi_venta_id: l.venta_id ?? null,
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

export function serializeUnidadNegocioFull(u, opts = {}) {
  if (!u) return null;
  const ubicacionNombre =
    opts.ubicacionNombre !== undefined ? opts.ubicacionNombre : (u.ubicacion?.nombre ?? null);
  return {
    fi_unidad_negocio_id: u.id,
    unidad_negocio_id: u.id,
    fc_nombre: u.nombre,
    fb_activo: u.esta_activo,
    activo: u.esta_activo,
    fi_ubicacion_id: u.ubicacionId ?? null,
    ubicacion_id: u.ubicacionId ?? null,
    fc_ubicacion_nombre: ubicacionNombre,
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
  const obsBio = b.observacionBiometria;
  return {
    fi_id: b.id,
    id: b.id,
    pileta_id: b.pileta_id,
    nombre_pileta: b.piletas?.nombre ?? null,
    instalacion_nombre: b.piletas?.nombre ?? null,
    no_lote: null,
    fd_fecha: b.fecha,
    fecha: b.fecha,
    fn_peso_total_gramos: toNumberSafe(b.pesoTotalGramos),
    fn_organismos_muestreados: b.organismosMuestreados,
    fn_peso_promedio: toNumberSafe(b.pesoPromedio),
    fc_encargado: b.encargado,
    fi_usuario_id: b.usuarioId,
    ubicacion: b.piletas?.ubicacion?.nombre ?? null,
    ubicacion_id: b.piletas?.ubicacionId ?? null,
    fc_observaciones: obsBio?.comentario ?? null,
    fc_observacion_proceso: obsBio?.proceso ?? null,
    observacion_biometria_id: obsBio?.id ?? null,
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
