/**
 * Convierte salidas de Prisma (camelCase) al contrato HTTP de la API, que usa
 * nombres semánticos en snake_case sin prefijos húngaros. Cada valor se expone
 * con una sola clave limpia (o un alias semántico cuando ya formaba parte del
 * contrato).
 */

import {
  cantidadVigenteDesdeRegistrosPeriodicos,
  ultimoRegistroPorPileta,
} from "./inventarioVigente.js";
import { calcularDiasEnPileta } from "./eficienciaReproductivaRegistro.js";

export function serializeRol(rol) {
  if (!rol) return null;
  return {
    rol_id: rol.id,
    nombre: rol.nombre,
    es_root: rol.esRoot,
    activo: rol.esta_activo,
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

export function serializeTipoPileta(t) {
  if (!t) return null;
  return {
    tipo_pileta_id: t.id,
    nombre: t.nombre,
    activo: t.esta_activo,
  };
}

export function serializeAreaInstalacion(a) {
  if (!a) return null;
  return {
    area_instalacion_id: a.id,
    nombre: a.nombre,
    activo: a.esta_activo,
  };
}

export function serializeFaunaDetectada(f) {
  if (!f) return null;
  return {
    fauna_detectada_id: f.id,
    nombre: f.nombre,
    activo: f.esta_activo,
  };
}

export function serializeEvidenciaFauna(e) {
  if (!e) return null;
  return {
    evidencia_fauna_id: e.id,
    nombre: e.nombre,
    activo: e.esta_activo,
  };
}

export function serializeEstadoTrampa(e) {
  if (!e) return null;
  return {
    estado_trampa_id: e.id,
    nombre: e.nombre,
    activo: e.esta_activo,
  };
}

export function serializeAccionCorrectiva(a) {
  if (!a) return null;
  return {
    accion_correctiva_id: a.id,
    nombre: a.nombre,
    activo: a.esta_activo,
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

export function serializeEmpleado(e, opts = {}) {
  if (!e) return null;
  const nombre = e.nombre;
  const apellidoPaterno = e.apellidoPaterno;
  const apellidoMaterno = e.apellidoMaterno ?? null;
  const fechaIngreso = e.fecha_ingreso ?? null;
  const unidadNegocioId =
    e.unidadNegocioId ??
    e.unidadNegocio?.id ??
    opts.unidad_negocio_id ??
    null;
  const unidadNegocioNombre =
    e.unidadNegocio?.nombre ??
    opts.unidad_negocio_nombre ??
    null;
  return {
    empleado_id: e.id,
    usuario_id: e.usuarioId ?? null,
    departamento_id: e.departamentoId ?? null,
    puesto_id: e.puestoId ?? null,
    unidad_negocio_id: unidadNegocioId,
    nombre,
    apellido_paterno: apellidoPaterno,
    apellido_materno: apellidoMaterno,
    fecha_nacimiento: e.fechaNacimiento ?? null,
    sueldo_base: e.sueldo_base ?? null,
    fecha_ingreso: fechaIngreso,
    fecha_contratacion: fechaIngreso,
    activo: e.esta_activo,
    departamento_nombre: e.departamento?.nombre ?? null,
    puesto_nombre: e.puesto?.nombre ?? null,
    unidad_negocio_nombre: unidadNegocioNombre,
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

function diasDesdeFecha(fecha) {
  if (!fecha) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha);
  if (Number.isNaN(f.getTime())) return null;
  f.setHours(0, 0, 0, 0);
  return Math.floor((hoy - f) / (1000 * 60 * 60 * 24));
}

export function serializeReproductor(r) {
  if (!r) return null;
  const piletaUlt = Array.isArray(r.piletas?.observaciones) ? r.piletas.observaciones[0] : null;
  const obsBio = r.biometrias?.observacionBiometria;
  const obsBioComentario = obsBio?.comentario ?? piletaUlt?.comentario ?? null;
  const obsBioFecha = obsBio?.created_at ?? piletaUlt?.created_at ?? null;
  const fechaBioPileta = r.piletas?.biometrias?.[0]?.fecha ?? null;
  const fechaBiometria = r.biometrias?.fecha ?? fechaBioPileta ?? null;
  const fechaSiembra = r.fecha_siembra ?? r.siembra_origen?.fecha ?? null;
  const machos = r.machos ?? 0;
  const hembras = r.hembras ?? 0;
  const cantidad = r.cantidad_total ?? machos + hembras;

  return {
    id: r.id,
    reproductor_id: r.id,
    pileta_id: r.pileta_id,
    pileta_destino_id: r.pileta_id,
    nombre_instalacion: r.piletas?.nombre ?? null,
    nombre_pileta: r.piletas?.nombre ?? null,
    nombre_pileta_destino: r.piletas?.nombre ?? null,
    granja: r.piletas?.ubicacion?.nombre ?? null,
    fecha_siembra: fechaSiembra,
    fecha_siembra_reproductores: fechaSiembra,
    lote_genetico: r.lote_genetico ?? null,
    activo: r.activo !== false,
    desovez: r.desovez ?? 0,
    estado_ciclo: r.estado_ciclo ?? "activo",
    estado_ciclo_label: ESTADO_CICLO_LABEL[r.estado_ciclo] ?? r.estado_ciclo ?? "Activo",
    machos,
    genetica_machos: r.genetica_machos ?? null,
    familia_machos: r.familia_machos ?? null,
    procedencia_machos: r.procedencia_machos ?? null,
    hembras,
    genetica_hembras: r.genetica_hembras ?? null,
    familia_hembras: r.familia_hembras ?? null,
    procedencia_hembras: r.procedencia_hembras ?? null,
    cantidad_total: cantidad,
    cantidad,
    ratio: r.ratio ?? null,
    talla: r.talla != null ? Number(r.talla) : null,
    cantidad_alimento: r.cantidad_alimento ?? 0,
    siembra_origen_id: r.siembra_origen_id ?? null,
    siembra_origen_pileta:
      r.siembra_origen?.piletas_siembra_pileta_origenTopiletas?.nombre ?? null,
    siembra_origen_cantidad: r.siembra_origen?.cantidad
      ? Number(r.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: fechaSiembra,
    origen_pileta_id: r.siembra_origen?.pileta_origen ?? null,
    origen_nombre_pileta: r.siembra_origen?.piletas_siembra_pileta_origenTopiletas?.nombre ?? null,
    dias_en_pila: diasDesdeFecha(fechaSiembra),
    biometria_id: r.biometria_id ?? null,
    fecha_biometria: fechaBiometria,
    dias_transcurridos_biometria: diasDesdeFecha(fechaBiometria),
    observacion: r.observacion?.comentario ?? null,
    observacion_id: r.observacion_id ?? null,
    ultima_observacion_pileta: piletaUlt?.comentario ?? null,
    ultima_observacion_proceso: piletaUlt?.proceso ?? null,
    fecha_ultima_observacion_pileta: piletaUlt?.created_at ?? null,
    observacion_biometria: obsBioComentario,
    fecha_observacion_biometria: obsBioFecha,
  };
}

/** Inventario vigente en la pileta, sin importar etapa (reproductores, alevinaje, incubacion o engorda). */
export function calcularCantidadPileta(p) {
  if (!p) return 0;

  const repRows = Array.isArray(p.reproductores) ? p.reproductores : p.reproductores ? [p.reproductores] : [];
  if (repRows.length > 0) {
    return cantidadVigenteDesdeRegistrosPeriodicos(repRows);
  }

  const engRows = Array.isArray(p.engorda) ? p.engorda : p.engorda ? [p.engorda] : [];
  if (engRows.length > 0) {
    return cantidadVigenteDesdeRegistrosPeriodicos(engRows);
  }

  const incRows = Array.isArray(p.eficiencia_reproductiva) ? p.eficiencia_reproductiva : [];
  if (incRows.length > 0) {
    const ultimo = ultimoRegistroPorPileta(incRows, { piletaKey: "pileta_id", idKey: "id" });
    const row = ultimo[0];
    return row && !row.fecha_egreso ? 1 : 0;
  }

  const rows = Array.isArray(p.alevinaje) ? p.alevinaje : [];
  return cantidadVigenteDesdeRegistrosPeriodicos(rows);
}

export function serializeObservacionHistorial(o) {
  if (!o) return null;
  const usuario = o.usuarios ?? o.usuario ?? null;
  const rolNombre = usuario?.rol?.nombre ?? null;
  return {
    observacion_id: o.id,
    comentario: o.comentario,
    observacion: o.comentario,
    proceso: o.proceso ?? null,
    created_at: o.created_at,
    fecha: o.created_at,
    usuario_nombre: usuario?.nombre ?? null,
    rol_nombre: rolNombre,
  };
}

export function serializePileta(p) {
  if (!p) return null;
  const lista = Array.isArray(p.observaciones) ? p.observaciones : [];
  const ultima = lista[0];
  const comUlt = ultima?.comentario ?? null;
  const cantidad = calcularCantidadPileta(p);

  return {
    pileta_id: p.id,
    nombre: p.nombre,
    largo: p.largo,
    ancho: p.ancho,
    alto: p.alto,
    metros_cubicos: p.metros_cubicos,
    material: p.material,
    estado: p.estado,
    tipo: p.tipo,
    estado_conservacion: p.estadoConservacion ?? null,
    tipo_pileta_id: p.tipoPiletaId ?? null,
    tipo_pileta_nombre: p.tipoPileta?.nombre ?? null,
    ubicacion_id: p.ubicacionId,
    granja: p.ubicacion?.nombre ?? null,
    cantidad,
    ultima_observacion: comUlt,
    ultima_observacion_proceso: ultima?.proceso ?? null,
    fecha_ultima_observacion: ultima?.created_at ?? null,
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
    id: e.id,
    engorda_id: e.id,
    pileta_id: e.pileta_id,
    pileta_destino_id: e.pileta_id,
    nombre_pileta_destino: e.piletas?.nombre ?? null,
    nombre_pileta: e.piletas?.nombre ?? null,
    destino_nombre: e.piletas?.nombre ?? null,
    granja: e.piletas?.ubicacion?.nombre ?? null,
    cantidad_total: e.cantidad_total ?? 0,
    cantidad: e.cantidad_total ?? 0,
    cantidad_alimento: e.cantidad_alimento ?? 0,
    historial_peso_id: e.peso ?? null,
    peso: hp?.peso != null ? Number(hp.peso) : null,
    peso_gramos: hp?.peso != null ? Number(hp.peso) : null,
    fecha_peso: hp?.fecha ?? null,
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
    observacion: e.observacion?.comentario ?? null,
    observacion_id: e.observacion_id ?? null,
    ultima_observacion_pileta: piletaUlt?.comentario ?? null,
    ultima_observacion_proceso: piletaUlt?.proceso ?? null,
    fecha_ultima_observacion_pileta: piletaUlt?.created_at ?? null,
    observacion_biometria: obsBioComentario,
    fecha_observacion_biometria: obsBioFecha,
  };
}

export function serializeEquipo(eq) {
  if (!eq) return null;
  return {
    equipo_id: eq.id,
    nombre: eq.nombre,
    marca: eq.marca,
    modelo: eq.modelo,
    tipo: eq.tipo,
    serial: eq.serial ?? null,
    estado: eq.estado,
    observaciones: eq.observaciones ?? null,
    notas: eq.observaciones ?? null,
    usuario_id: eq.usuarioId,
  };
}

export function serializeMantenimiento(m) {
  if (!m) return null;
  return {
    mantenimiento_id: m.id,
    equipo_id: m.equipoId,
    fecha: m.fecha,
    descripcion: m.descripcion,
    costo: m.costo,
    responsable: m.responsable ?? null,
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
  const familiaOrigen = null;

  return {
    id: s.id,
    siembra_id: s.id,
    pileta_origen_id: s.pileta_origen ?? null,
    nombre_pileta_origen: pilOr?.nombre ?? null,
    tipo_pileta_origen: pilOr?.tipo ?? null,
    familia_origen: familiaOrigen,
    pileta_destino_id: s.pileta_destino,
    nombre_pileta_destino: pilDest?.nombre ?? null,
    tipo_pileta_destino: pilDest?.tipo ?? null,
    granja: pilDest?.ubicacion?.nombre ?? null,
    cantidad: cant,
    mortalidad: s.mortalidad ?? 0,
    fecha: s.fecha,
  };
}

export function serializeAlevinaje(a) {
  if (!a) return null;
  const hp = a.historial_peso ?? null;

  return {
    id: a.id,
    pileta_id: a.pileta_id,
    pileta_destino_id: a.pileta_id,
    nombre_pileta_destino: a.piletas?.nombre ?? null,
    nombre_pileta: a.piletas?.nombre ?? null,
    granja: a.piletas?.ubicacion?.nombre ?? null,
    lote: a.lote ?? null,
    lote_genetico: a.lote ?? null,
    cantidad_total: a.cantidad_total ?? 0,
    historial_peso_id: a.peso ?? null,
    peso: hp?.peso != null ? Number(hp.peso) : null,
    peso_gramos: hp?.peso != null ? Number(hp.peso) : null,
    siembra_origen_id: a.siembra_origen_id ?? null,
    siembra_origen_pileta:
      a.siembra_origen?.piletas_siembra_pileta_origenTopiletas?.nombre ?? null,
    siembra_origen_cantidad: a.siembra_origen?.cantidad
      ? Number(a.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: a.siembra_origen?.fecha ?? null,
    biometria_id: a.biometria_id ?? null,
  };
}

export function serializeEficienciaReproductiva(i) {
  if (!i) return null;
  const piletaUlt = Array.isArray(i.piletas?.observaciones) ? i.piletas.observaciones[0] : null;
  const obsBio = i.biometrias?.observacionBiometria;
  const obsBioComentario = obsBio?.comentario ?? piletaUlt?.comentario ?? null;
  const obsBioFecha = obsBio?.created_at ?? piletaUlt?.created_at ?? null;
  const huevos = i.huevos_ml != null ? Number(i.huevos_ml) : null;
  const tiposCosecha = Array.isArray(i.tipo_cosecha)
    ? i.tipo_cosecha
    : i.tipo_cosecha
      ? [i.tipo_cosecha]
      : [];
  const tipoCosechaLabel =
    tiposCosecha.map((t) => TIPO_COSECHA_LABEL[t] ?? t).join(", ") || null;
  const volumenPorTipo = (() => {
    const raw = i.volumen_por_tipo;
    const mapa = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [clave, valor] of Object.entries(raw)) {
        if (valor != null && Number.isFinite(Number(valor))) mapa[clave] = Number(valor);
      }
    }
    // Compatibilidad: registros de un solo tipo creados antes del desglose por tipo.
    if (Object.keys(mapa).length === 0 && tiposCosecha.length === 1 && huevos != null) {
      mapa[tiposCosecha[0]] = huevos;
    }
    return mapa;
  })();
  const volumenesCosecha = tiposCosecha.map((t) => ({
    tipo: t,
    label: TIPO_COSECHA_LABEL[t] ?? t,
    volumen: volumenPorTipo[t] ?? null,
  }));
  const diasEnEficienciaReproductiva =
    i.fecha_ingreso != null
      ? calcularDiasEnPileta(i.fecha_ingreso, i.fecha_egreso)
      : (i.dias_en_pileta ?? null);

  return {
    id: i.id,
    eficiencia_reproductiva_id: i.id,
    incubacion_id: i.id,
    codigo: i.codigo ?? null,
    id_evento: i.codigo ?? null,
    pileta_id: i.pileta_id,
    pileta_destino_id: i.pileta_id,
    eficiencia_reproductiva_pileta_id: i.pileta_id,
    incubacion_pileta_id: i.pileta_id,
    eficiencia_reproductiva_pileta_nombre: i.piletas?.nombre ?? null,
    incubacion_pileta_nombre: i.piletas?.nombre ?? null,
    nombre_pileta_destino: i.piletas?.nombre ?? null,
    nombre_pileta: i.piletas?.nombre ?? null,
    granja: i.piletas?.ubicacion?.nombre ?? null,
    pileta_origen_id: i.pileta_origen_id ?? null,
    nombre_pileta_origen: i.pileta_origen?.nombre ?? null,
    pileta_origen_reproduccion: i.pileta_origen?.nombre ?? null,
    reproductor_id: i.reproductor_id ?? null,
    lote: i.lote ?? null,
    lote_genetico: i.lote ?? null,
    tipo_cosecha: tiposCosecha,
    tipos_cosecha: tiposCosecha,
    tipo_cosecha_label: tipoCosechaLabel,
    tipo_cosecha_origen: tiposCosecha,
    estadio_desarrollo: i.estadio_desarrollo ?? null,
    hembras_ovadas: i.hembras_ovadas ?? 0,
    fecha_cosecha: i.fecha_cosecha ?? null,
    huevos_ml: huevos,
    volumen_ml: huevos,
    volumen_por_tipo: volumenPorTipo,
    volumenes_cosecha: volumenesCosecha,
    fecha_ingreso: i.fecha_ingreso ?? null,
    dias_en_pileta: diasEnEficienciaReproductiva,
    dias_en_eficiencia_reproductiva: diasEnEficienciaReproductiva,
    dias_en_incubacion: diasEnEficienciaReproductiva,
    fecha_egreso: i.fecha_egreso ?? null,
    evento_cosecha_id: i.evento_cosecha_id ?? null,
    siembra_origen_id: i.siembra_origen_id ?? null,
    siembra_origen_pileta:
      i.siembra_origen?.piletas_siembra_pileta_origenTopiletas?.nombre ?? null,
    siembra_origen_cantidad: i.siembra_origen?.cantidad
      ? Number(i.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: i.siembra_origen?.fecha ?? null,
    biometria_id: i.biometria_id ?? null,
    observacion: i.observacion?.comentario ?? null,
    observacion_id: i.observacion_id ?? null,
    ultima_observacion_pileta: piletaUlt?.comentario ?? null,
    ultima_observacion_proceso: piletaUlt?.proceso ?? null,
    fecha_ultima_observacion_pileta: piletaUlt?.created_at ?? null,
    observacion_biometria: obsBioComentario,
    fecha_observacion_biometria: obsBioFecha,
  };
}

const TIPO_COSECHA_LABEL = {
  huevo: "Huevo",
  larva_saco: "Larva con saco",
  alevin_nadando: "Alevín nadando",
};

const ESTADO_CICLO_LABEL = {
  activo: "Activo",
  agotado: "Agotado",
};

export function serializeInventarioAlevin(a) {
  if (!a) return null;
  return {
    id: a.id,
    ubicacion_id: a.ubicacionId,
    ubicacion: a.ubicacion?.nombre ?? null,
    pileta_id: a.pileta_id ?? null,
    nombre_pileta: a.piletas?.nombre ?? null,
    lote_nombre: a.lote_nombre ?? null,
    cantidad: a.cantidad,
    talla: a.talla,
    observacion: a.observacion?.comentario ?? null,
    observacion_id: a.observacionId ?? null,
    fecha_siembra: a.fechaSiembra,
    fecha_salida_hormonado: a.fechaSalidaHormonado,
    usuario_id: a.usuarioId,
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
  const unidadNegocioId = c.unidadNegocioId ?? c.unidadNegocio?.id ?? null;
  return {
    cliente_id: c.id,
    nombre: c.nombre,
    rfc: c.rfc ?? null,
    unidad_negocio_id: unidadNegocioId,
    unidad_negocio_nombre: c.unidadNegocio?.nombre ?? null,
    empresa: c.empresa ?? null,
    telefono: c.telefono ?? null,
    email: c.email ?? null,
    localidad: c.localidad ?? null,
    estado: c.estado ?? null,
    ejecutivo_empleado_id: ejecutivoId,
    ejecutivo_nombre: nombreEmpleado(c.ejecutivo) ?? null,
    activo: c.esta_activo,
  };
}

export function serializeInsumo(i) {
  if (!i) return null;
  const clienteId = i.clienteId ?? i.cliente?.id ?? null;
  return {
    insumo_id: i.id,
    codigo: i.codigo,
    nombre: i.nombre,
    marca: i.marca ?? null,
    unidad_medida: i.unidadMedida,
    cliente_id: clienteId,
    razon_social: i.cliente?.nombre ?? null,
    presentacion: i.presentacion != null ? Number(i.presentacion) : null,
    precio_bulto: i.precioBulto != null ? Number(i.precioBulto) : null,
    precio_unitario: i.precioUnitario != null ? Number(i.precioUnitario) : null,
    stock_minimo: i.stockMinimo != null ? Number(i.stockMinimo) : null,
    activo: i.esta_activo,
  };
}

export function serializeProveedor(p) {
  if (!p) return null;
  return {
    proveedor_id: p.id,
    nombre: p.nombre,
    rfc: p.rfc ?? null,
    telefono: p.telefono ?? null,
    email: p.email ?? null,
    direccion: p.direccion ?? null,
    activo: p.esta_activo,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export function serializeVenta(v) {
  if (!v) return null;
  return {
    venta_id: v.id,
    folio: v.folio,
    fecha: v.fecha,
    cliente_nombre: v.cliente_nombre,
    tipo_venta: v.tipoVenta,
    cantidad: v.cantidad,
    precio_unitario: v.precio_unitario,
    monto_total: v.montoTotal,
    monto_abonado: v.monto_abonado,
    monto_adeudo: v.monto_adeudo,
    estado_pago: v.estadoPago,
    empresa: v.empresa,
    locacion: v.empresa,
    vendedor_nombre: v.vendedor_nombre,
    observaciones: v.observacion?.comentario ?? null,
    observacion_id: v.observacionId ?? null,
    usuario_id: v.usuario_id,
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
    lista_id: l.id,
    cliente_id: l.cliente_id ?? null,
    cliente_nombre: l.cliente_nombre,
    cantidad_peces: l.cantidad_peces ?? null,
    precio_unitario: l.precio_unitario ?? null,
    tipo_venta: l.tipo_venta ?? null,
    granja: l.granja ?? null,
    fecha_entrega: fechaEntrega,
    lugar_entrega: l.lugar_entrega ?? null,
    unidad_produccion: l.unidad_produccion ?? null,
    hora_embolsado: l.hora_embolsado ?? null,
    hora_entrega: l.hora_entrega ?? null,
    encargado_venta: l.encargado_venta ?? null,
    pileta_origen_id: l.pileta_origen_id ?? null,
    nombre_pileta_origen: l.pileta_origen?.nombre ?? null,
    venta_id: l.venta_id ?? null,
    notas: l.notas ?? null,
    estatus: l.estatus,
    cliente_nombre_relacionado: l.clientes?.nombre ?? null,
  };
}

export function serializeCuenta(c) {
  if (!c) return null;
  return {
    cuenta_id: c.id,
    unidad_negocio: c.unidad_negocio,
    nombre: c.nombre,
    numero_cuenta: c.numeroCuenta,
    banco: c.banco,
    tipo_cuenta: c.tipo_cuenta,
    saldo_actual: c.saldoActual,
    activo: c.esta_activa,
  };
}

export function serializeFlujoCaja(f) {
  if (!f) return null;
  return {
    movimiento_id: f.id,
    granja: f.ubicacion?.nombre ?? null,
    ubicacion_id: f.ubicacionId,
    fecha: f.fecha,
    ingreso: f.ingreso,
    egreso: f.egreso,
    observaciones: f.observaciones,
    cuenta_nombre: f.cuenta_nombre,
    categoria: f.categoria,
    subcategoria: f.subcategoria,
    beneficiario: f.beneficiario,
    estatus: f.estatus,
    mes_periodo: f.mes_periodo,
    usuario_id: f.usuario_id ?? null,
    venta_id: f.venta_id ?? null,
  };
}

export function serializeUnidadNegocioFull(u, opts = {}) {
  if (!u) return null;
  const ubicacionNombre =
    opts.ubicacionNombre !== undefined ? opts.ubicacionNombre : (u.ubicacion?.nombre ?? null);
  return {
    unidad_negocio_id: u.id,
    nombre: u.nombre,
    activo: u.esta_activo,
    ubicacion_id: u.ubicacionId ?? null,
    ubicacion_nombre: ubicacionNombre,
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
// Bitácoras (Prisma)
// ============================================================================

export function serializeBiometria(b) {
  if (!b) return null;
  const obsBio = b.observacionBiometria;
  return {
    id: b.id,
    pileta_id: b.pileta_id,
    nombre_pileta: b.piletas?.nombre ?? null,
    instalacion_nombre: b.piletas?.nombre ?? null,
    no_lote: null,
    fecha: b.fecha,
    peso_total_gramos: toNumberSafe(b.pesoTotalGramos),
    organismos_muestreados: b.organismosMuestreados,
    peso_promedio: toNumberSafe(b.pesoPromedio),
    encargado: b.encargado,
    usuario_id: b.usuarioId,
    ubicacion: b.piletas?.ubicacion?.nombre ?? null,
    ubicacion_id: b.piletas?.ubicacionId ?? null,
    observaciones: obsBio?.comentario ?? null,
    observacion_proceso: obsBio?.proceso ?? null,
    observacion_biometria_id: obsBio?.id ?? null,
  };
}

export function serializeAlimentacion(a) {
  if (!a) return null;
  return {
    id: a.id,
    mes: a.mes,
    pileta_id: a.pileta_id ?? null,
    peso_promedio_entrada: toNumberSafe(a.pesoPromedioEntrada),
    fecha_siembra: a.fechaSiembra,
    origen_alevines: a.origenAlevines,
    fecha: a.fecha,
    total_alimento_gramos: toNumberSafe(a.totalAlimentoGramos),
    mortalidad: a.mortalidad,
    recambio_agua: a.recambioAgua,
    temperatura_agua: toNumberSafe(a.temperatura_agua),
    amonio: toNumberSafe(a.amonio),
    ph: toNumberSafe(a.ph),
    observaciones: a.observacion?.comentario ?? null,
    observacion_id: a.observacionId ?? null,
    usuario_id: a.usuarioId,
    ubicacion: a.ubicacion?.nombre ?? null,
    ubicacion_id: a.ubicacionId,
  };
}

export function serializeControlLimpieza(row) {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    tipo_instalacion: row.tipoInstalacion,
    realizado_por: row.realizado_por,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeParametro(row) {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    numero_estanque: row.numero_estanque,
    oxigeno: toNumberSafe(row.oxigeno),
    temperatura: toNumberSafe(row.temperatura),
    ph: toNumberSafe(row.ph),
    amonio: toNumberSafe(row.amonio),
    nitritos: toNumberSafe(row.nitritos),
    nitratos: toNumberSafe(row.nitratos),
    responsable: row.responsable ?? null,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeMedicamento(row) {
  if (!row) return null;
  return {
    id: row.id,
    fecha_hora: row.fechaHora,
    numero_estanque: row.numero_estanque,
    diagnostico: row.diagnostico,
    tratamiento: row.tratamiento,
    dosis: row.dosis,
    forma_aplicacion: row.formaAplicacion,
    fecha_ultima_dosis: row.fechaUltimaDosis,
    responsable: row.responsable ?? null,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeControlFaunaNociva(row) {
  if (!row) return null;
  return {
    id: row.id,
    codigo: row.codigo ?? null,
    fecha: row.fecha,
    area_instalacion_id: row.areaInstalacionId ?? null,
    area_instalacion_nombre: row.areaInstalacion?.nombre ?? null,
    fauna_detectada_id: row.faunaDetectadaId ?? null,
    fauna_detectada_nombre: row.faunaDetectada?.nombre ?? null,
    evidencia_fauna_id: row.evidenciaFaunaId ?? null,
    evidencia_fauna_nombre: row.evidenciaFauna?.nombre ?? null,
    estado_trampa_id: row.estadoTrampaId ?? null,
    estado_trampa_nombre: row.estadoTrampa?.nombre ?? null,
    condicion_malla: row.condicionMalla ?? null,
    accion_correctiva_id: row.accionCorrectivaId ?? null,
    accion_correctiva_nombre: row.accionCorrectiva?.nombre ?? null,
    responsable: row.responsable ?? null,
    usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeRecambio(row) {
  if (!row) return null;
  return {
    id: row.id,
    mes_periodo: row.mes_periodo,
    pileta_id: row.pileta_id,
    fecha_1: row.fecha_1,
    tipo_1: row.tipo_1,
    fecha_2: row.fecha_2,
    tipo_2: row.tipo_2,
    fecha_3: row.fecha_3,
    tipo_3: row.tipo_3,
    fecha_4: row.fecha_4,
    tipo_4: row.tipo_4,
    fecha_5: row.fecha_5,
    tipo_5: row.tipo_5,
    fecha_6: row.fecha_6,
    tipo_6: row.tipo_6,
    responsable: row.responsable ?? null,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeControlVisita(row) {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    hora_entrada: row.hora_entrada,
    hora_salida: row.hora_salida,
    nombre_completo: row.nombreCompleto,
    procedencia: row.procedencia,
    motivo: row.motivo,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    foto_identificacion: row.fotoIdentificacion,
    usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeRecepcionInsumo(row) {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    proveedor_nombre: row.proveedor_nombre,
    producto: row.producto,
    unidad_medida: row.unidadMedida,
    cantidad: toNumberSafe(row.cantidad),
    numero_lote: row.numero_lote,
    condiciones_entrega: row.condicionesEntrega,
    encargado_entrega: row.encargadoEntrega,
    verificador: row.verificador,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}
