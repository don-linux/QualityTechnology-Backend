/**
 * Convierte salidas de Prisma (camelCase) al contrato HTTP de la API, que usa
 * nombres semánticos en snake_case sin prefijos húngaros. Cada valor se expone
 * con una sola clave limpia (o un alias semántico cuando ya formaba parte del
 * contrato).
 */

import {
  cantidadVigenteDesdeRegistrosPeriodicos,
  ultimoRegistroPorInfraestructuraFisica,
} from "./inventarioVigente.js";
import { calcularDiasEnInfraestructuraFisica } from "./eficienciaReproductivaRegistro.js";

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

export function serializeTipoInfraestructuraFisica(t) {
  if (!t) return null;
  return {
    tipo_infraestructura_fisica_id: t.id,
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
  const infraestructuraFisicaUlt = Array.isArray(r.infraestructuraFisica?.observaciones) ? r.infraestructuraFisica.observaciones[0] : null;
  const obsBio = r.biometrias?.observacionBiometria;
  const obsBioComentario = obsBio?.comentario ?? infraestructuraFisicaUlt?.comentario ?? null;
  const obsBioFecha = obsBio?.created_at ?? infraestructuraFisicaUlt?.created_at ?? null;
  const fechaBioInfraestructuraFisica = r.infraestructuraFisica?.biometrias?.[0]?.fecha ?? null;
  const fechaBiometria = r.biometrias?.fecha ?? fechaBioInfraestructuraFisica ?? null;
  const fechaSiembra = r.fecha_siembra ?? r.siembra_origen?.fecha ?? null;
  const machos = r.machos ?? 0;
  const hembras = r.hembras ?? 0;
  const cantidad = r.cantidad_total ?? machos + hembras;

  return {
    id: r.id,
    reproductor_id: r.id,
    infraestructura_fisica_id: r.infraestructura_fisica_id,
    infraestructura_fisica_destino_id: r.infraestructura_fisica_id,
    nombre_instalacion: r.infraestructuraFisica?.nombre ?? null,
    nombre_infraestructura_fisica: r.infraestructuraFisica?.nombre ?? null,
    nombre_infraestructura_fisica_destino: r.infraestructuraFisica?.nombre ?? null,
    granja: r.infraestructuraFisica?.ubicacion?.nombre ?? null,
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
    siembra_origen_infraestructura_fisica:
      r.siembra_origen?.infraestructuraFisicaOrigen?.nombre ?? null,
    siembra_origen_cantidad: r.siembra_origen?.cantidad
      ? Number(r.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: fechaSiembra,
    origen_infraestructura_fisica_id: r.siembra_origen?.infraestructura_fisica_origen ?? null,
    origen_nombre_infraestructura_fisica: r.siembra_origen?.infraestructuraFisicaOrigen?.nombre ?? null,
    dias_en_pila: diasDesdeFecha(fechaSiembra),
    biometria_id: r.biometria_id ?? null,
    fecha_biometria: fechaBiometria,
    dias_transcurridos_biometria: diasDesdeFecha(fechaBiometria),
    observacion: r.observacion?.comentario ?? null,
    observacion_id: r.observacion_id ?? null,
    ultima_observacion_infraestructura_fisica: infraestructuraFisicaUlt?.comentario ?? null,
    ultima_observacion_proceso: infraestructuraFisicaUlt?.proceso ?? null,
    fecha_ultima_observacion_infraestructura_fisica: infraestructuraFisicaUlt?.created_at ?? null,
    observacion_biometria: obsBioComentario,
    fecha_observacion_biometria: obsBioFecha,
  };
}

/** Inventario vigente en la infraestructura física, sin importar etapa (reproductores, alevinaje, incubacion o engorda). */
export function calcularCantidadInfraestructuraFisica(p) {
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
    const ultimo = ultimoRegistroPorInfraestructuraFisica(incRows, { infraestructuraFisicaKey: "infraestructura_fisica_id", idKey: "id" });
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

export function serializeInfraestructuraFisica(p) {
  if (!p) return null;
  const lista = Array.isArray(p.observaciones) ? p.observaciones : [];
  const ultima = lista[0];
  const comUlt = ultima?.comentario ?? null;
  const cantidad = calcularCantidadInfraestructuraFisica(p);

  return {
    infraestructura_fisica_id: p.id,
    nombre: p.nombre,
    largo: p.largo,
    ancho: p.ancho,
    alto: p.alto,
    metros_cubicos: p.metros_cubicos,
    material: p.material,
    estado: p.estado,
    tipo: p.tipo,
    estado_conservacion: p.estadoConservacion ?? null,
    tipo_infraestructura_fisica_id: p.tipoInfraestructuraFisicaId ?? null,
    tipo_infraestructura_fisica_nombre: p.tipoInfraestructuraFisica?.nombre ?? null,
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
  const infraestructuraFisicaUlt = Array.isArray(e.infraestructuraFisica?.observaciones) ? e.infraestructuraFisica.observaciones[0] : null;
  const obsBio = e.biometrias?.observacionBiometria;
  const obsBioComentario = obsBio?.comentario ?? infraestructuraFisicaUlt?.comentario ?? null;
  const obsBioFecha = obsBio?.created_at ?? infraestructuraFisicaUlt?.created_at ?? null;
  const hp = e.historial_peso ?? null;

  return {
    id: e.id,
    engorda_id: e.id,
    infraestructura_fisica_id: e.infraestructura_fisica_id,
    infraestructura_fisica_destino_id: e.infraestructura_fisica_id,
    nombre_infraestructura_fisica_destino: e.infraestructuraFisica?.nombre ?? null,
    nombre_infraestructura_fisica: e.infraestructuraFisica?.nombre ?? null,
    destino_nombre: e.infraestructuraFisica?.nombre ?? null,
    granja: e.infraestructuraFisica?.ubicacion?.nombre ?? null,
    cantidad_total: e.cantidad_total ?? 0,
    cantidad: e.cantidad_total ?? 0,
    cantidad_alimento: e.cantidad_alimento ?? 0,
    historial_peso_id: e.peso ?? null,
    peso: hp?.peso != null ? Number(hp.peso) : null,
    peso_gramos: hp?.peso != null ? Number(hp.peso) : null,
    fecha_peso: hp?.fecha ?? null,
    siembra_origen_id: e.siembra_origen_id ?? null,
    siembra_origen_infraestructura_fisica:
      e.siembra_origen?.infraestructuraFisicaOrigen?.nombre ?? null,
    siembra_origen_cantidad: e.siembra_origen?.cantidad
      ? Number(e.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: e.siembra_origen?.fecha ?? null,
    origen_infraestructura_fisica_id: e.siembra_origen?.infraestructura_fisica_origen ?? null,
    origen_nombre_infraestructura_fisica: e.siembra_origen?.infraestructuraFisicaOrigen?.nombre ?? null,
    biometria_id: e.biometria_id ?? null,
    observacion: e.observacion?.comentario ?? null,
    observacion_id: e.observacion_id ?? null,
    ultima_observacion_infraestructura_fisica: infraestructuraFisicaUlt?.comentario ?? null,
    ultima_observacion_proceso: infraestructuraFisicaUlt?.proceso ?? null,
    fecha_ultima_observacion_infraestructura_fisica: infraestructuraFisicaUlt?.created_at ?? null,
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

export function serializeMantenimientoEquipo(row) {
  if (!row) return null;
  return {
    mantenimiento_equipo_id: row.id,
    folio: row.folio,
    fecha_mantenimiento: row.fechaMantenimiento,
    usuario_id: row.usuarioId ?? null,
  };
}

export function serializeSiembra(s) {
  if (!s) return null;
  const pilOr = s.infraestructuraFisicaOrigen ?? null;
  const pilDest = s.infraestructuraFisicaDestino ?? null;
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
    infraestructura_fisica_origen_id: s.infraestructura_fisica_origen ?? null,
    nombre_infraestructura_fisica_origen: pilOr?.nombre ?? null,
    tipo_infraestructura_fisica_origen: pilOr?.tipo ?? null,
    familia_origen: familiaOrigen,
    infraestructura_fisica_destino_id: s.infraestructura_fisica_destino,
    nombre_infraestructura_fisica_destino: pilDest?.nombre ?? null,
    tipo_infraestructura_fisica_destino: pilDest?.tipo ?? null,
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
    infraestructura_fisica_id: a.infraestructura_fisica_id,
    infraestructura_fisica_destino_id: a.infraestructura_fisica_id,
    nombre_infraestructura_fisica_destino: a.infraestructuraFisica?.nombre ?? null,
    nombre_infraestructura_fisica: a.infraestructuraFisica?.nombre ?? null,
    granja: a.infraestructuraFisica?.ubicacion?.nombre ?? null,
    lote: a.lote ?? null,
    lote_genetico: a.lote ?? null,
    cantidad_total: a.cantidad_total ?? 0,
    historial_peso_id: a.peso ?? null,
    peso: hp?.peso != null ? Number(hp.peso) : null,
    peso_gramos: hp?.peso != null ? Number(hp.peso) : null,
    siembra_origen_id: a.siembra_origen_id ?? null,
    siembra_origen_infraestructura_fisica:
      a.siembra_origen?.infraestructuraFisicaOrigen?.nombre ?? null,
    siembra_origen_cantidad: a.siembra_origen?.cantidad
      ? Number(a.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: a.siembra_origen?.fecha ?? null,
    biometria_id: a.biometria_id ?? null,
  };
}

export function serializeEficienciaReproductiva(i) {
  if (!i) return null;
  const infraestructuraFisicaUlt = Array.isArray(i.infraestructuraFisica?.observaciones) ? i.infraestructuraFisica.observaciones[0] : null;
  const obsBio = i.biometrias?.observacionBiometria;
  const obsBioComentario = obsBio?.comentario ?? infraestructuraFisicaUlt?.comentario ?? null;
  const obsBioFecha = obsBio?.created_at ?? infraestructuraFisicaUlt?.created_at ?? null;
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
      ? calcularDiasEnInfraestructuraFisica(i.fecha_ingreso, i.fecha_egreso)
      : (i.dias_en_infraestructura_fisica ?? null);

  return {
    id: i.id,
    eficiencia_reproductiva_id: i.id,
    incubacion_id: i.id,
    codigo: i.codigo ?? null,
    id_evento: i.codigo ?? null,
    infraestructura_fisica_id: i.infraestructura_fisica_id,
    infraestructura_fisica_destino_id: i.infraestructura_fisica_id,
    eficiencia_reproductiva_infraestructura_fisica_id: i.infraestructura_fisica_id,
    incubacion_infraestructura_fisica_id: i.infraestructura_fisica_id,
    eficiencia_reproductiva_infraestructura_fisica_nombre: i.infraestructuraFisica?.nombre ?? null,
    incubacion_infraestructura_fisica_nombre: i.infraestructuraFisica?.nombre ?? null,
    nombre_infraestructura_fisica_destino: i.infraestructuraFisica?.nombre ?? null,
    nombre_infraestructura_fisica: i.infraestructuraFisica?.nombre ?? null,
    granja: i.infraestructuraFisica?.ubicacion?.nombre ?? null,
    infraestructura_fisica_origen_id: i.infraestructura_fisica_origen_id ?? null,
    nombre_infraestructura_fisica_origen: i.infraestructura_fisica_origen?.nombre ?? null,
    infraestructura_fisica_origen_reproduccion: i.infraestructura_fisica_origen?.nombre ?? null,
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
    dias_en_infraestructura_fisica: diasEnEficienciaReproductiva,
    dias_en_eficiencia_reproductiva: diasEnEficienciaReproductiva,
    dias_en_incubacion: diasEnEficienciaReproductiva,
    fecha_egreso: i.fecha_egreso ?? null,
    evento_cosecha_id: i.evento_cosecha_id ?? null,
    siembra_origen_id: i.siembra_origen_id ?? null,
    siembra_origen_infraestructura_fisica:
      i.siembra_origen?.infraestructuraFisicaOrigen?.nombre ?? null,
    siembra_origen_cantidad: i.siembra_origen?.cantidad
      ? Number(i.siembra_origen.cantidad)
      : null,
    siembra_origen_fecha: i.siembra_origen?.fecha ?? null,
    biometria_id: i.biometria_id ?? null,
    observacion: i.observacion?.comentario ?? null,
    observacion_id: i.observacion_id ?? null,
    ultima_observacion_infraestructura_fisica: infraestructuraFisicaUlt?.comentario ?? null,
    ultima_observacion_proceso: infraestructuraFisicaUlt?.proceso ?? null,
    fecha_ultima_observacion_infraestructura_fisica: infraestructuraFisicaUlt?.created_at ?? null,
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
    infraestructura_fisica_id: a.infraestructura_fisica_id ?? null,
    nombre_infraestructura_fisica: a.infraestructuraFisica?.nombre ?? null,
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
// trazabilidad debe migrar a `siembra` (con infraestructura_fisica_origen/infraestructura_fisica_destino,
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

export function serializeCatalogoInsumo(i) {
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
    infraestructura_fisica_origen_id: l.infraestructura_fisica_origen_id ?? null,
    nombre_infraestructura_fisica_origen: l.infraestructura_fisica_origen?.nombre ?? null,
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
    infraestructura_fisica_id: b.infraestructura_fisica_id,
    nombre_infraestructura_fisica: b.infraestructuraFisica?.nombre ?? null,
    instalacion_nombre: b.infraestructuraFisica?.nombre ?? null,
    no_lote: null,
    fecha: b.fecha,
    peso_total_gramos: toNumberSafe(b.pesoTotalGramos),
    organismos_muestreados: b.organismosMuestreados,
    peso_promedio: toNumberSafe(b.pesoPromedio),
    responsable: b.responsable,
    usuario_id: b.usuarioId,
    ubicacion: b.infraestructuraFisica?.ubicacion?.nombre ?? null,
    ubicacion_id: b.infraestructuraFisica?.ubicacionId ?? null,
    observaciones: obsBio?.comentario ?? null,
    observacion_proceso: obsBio?.proceso ?? null,
    observacion_biometria_id: obsBio?.id ?? null,
  };
}

export function serializeControlLimpieza(row) {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    tipo_instalacion: row.tipoInstalacion,
    responsable: row.responsable,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    usuario_id: row.usuarioId,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
  };
}

export function serializeParametrosFisicoQuimico(row) {
  if (!row) return null;

  const formatTime = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString().slice(11, 16);
    const s = String(value);
    const match = s.match(/(\d{2}:\d{2})/);
    return match ? match[1] : s;
  };

  return {
    id: row.id,
    codigo: row.codigo ?? null,
    fecha: row.fecha,
    hora: formatTime(row.hora),
    turno_muestreo: row.turnoMuestreo ?? null,
    infraestructura_fisica_id: row.infraestructuraFisicaId ?? null,
    infraestructura_fisica_nombre: row.infraestructuraFisica?.nombre ?? null,
    infraestructura_fisica_tipo: row.infraestructuraFisica?.tipo ?? null,
    oxigeno: toNumberSafe(row.oxigeno),
    temperatura_agua: toNumberSafe(row.temperaturaAgua),
    temperatura_ambiente: toNumberSafe(row.temperaturaAmbiente),
    ph: toNumberSafe(row.ph),
    amonio: toNumberSafe(row.amonio),
    nitrito: toNumberSafe(row.nitrito),
    nitrato: toNumberSafe(row.nitrato),
    transparencia_sechhi: toNumberSafe(row.transparenciaSechhi),
    coloracion_agua: row.coloracionAgua ?? null,
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
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
    infraestructura_fisica_id: row.infraestructuraFisicaId,
    nombre_instalacion: row.infraestructuraFisica?.nombre ?? null,
    diagnostico: row.diagnostico,
    farmaco: row.farmaco,
    fecha_inicio: row.fechaInicio,
    fecha_final: row.fechaFinal,
    periodo: row.periodo,
    usuario_id: row.usuarioId,
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

export function serializeLimpiezaInstalacion(row) {
  if (!row) return null;
  return {
    id: row.id,
    fecha: row.fecha,
    tipo_limpieza: row.tipoLimpieza,
    porcentaje_recambio_agua: row.porcentajeRecambioAgua,
    desinfectante_utilizado: row.desinfectanteUtilizado,
    responsable: row.responsable ?? null,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    infraestructura_fisica_id: row.infraestructuraFisicaId,
    nombre_infraestructura_fisica: row.infraestructuraFisica?.nombre ?? null,
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

export function serializeInventarioInsumo(row) {
  if (!row) return null;
  return {
    id: row.id,
    codigo: row.codigo,
    tipo_movimiento: row.tipoMovimiento,
    fecha: row.fecha,
    insumo_id: row.insumoId ?? null,
    producto: row.catalogoInsumo?.nombre ?? null,
    insumo_nombre: row.catalogoInsumo?.nombre ?? null,
    insumo_codigo: row.catalogoInsumo?.codigo ?? null,
    unidad_medida: row.catalogoInsumo?.unidadMedida ?? null,
    destino: row.destino ?? null,
    responsable: row.responsable ?? null,
    ubicacion: row.ubicacion?.nombre ?? null,
    ubicacion_id: row.ubicacionId,
    ubicacion_salida_id: row.ubicacionSalidaId ?? null,
    ubicacion_entrada_id: row.ubicacionEntradaId ?? null,
    unidad_negocio_salida: row.ubicacionSalida?.nombre ?? null,
    unidad_negocio_entrada: row.ubicacionEntrada?.nombre ?? null,
    traspaso_sentido: row.traspasoSentido ?? null,
    traspaso_grupo_id: row.traspasoGrupoId ?? null,
    observaciones: row.observacion?.comentario ?? null,
    observacion_id: row.observacionId ?? null,
    usuario_id: row.usuarioId,
  };
}

// ============================================================================
// Ciclos avícola
// ============================================================================

const ESTADO_CICLO_AVICOLA_LABEL = {
  activo: "Activo",
  cerrado: "Cerrado",
};

const TIPO_CICLO_AVICOLA_LABEL = {
  engorda: "Engorda",
  postura: "Postura",
  patos: "Patos",
  kikiriki: "Kikiriki",
  otro: "Otro",
};

function toIsoDateOnly(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function serializeDecimal(value) {
  if (value === null || value === undefined) return null;
  return Number(value);
}

export function serializeCicloCalendarioEvento(row) {
  if (!row) return null;
  return {
    id: row.id,
    ciclo_avicola_id: row.ciclo_avicola_id,
    fecha: toIsoDateOnly(row.fecha),
    dia_ciclo: row.dia_ciclo,
    tipo_evento: row.tipo_evento,
    actividad: row.actividad,
    producto: row.producto,
    dosis: row.dosis,
    responsable: row.responsable,
    estado_evento: row.estado_evento,
    observaciones: row.observaciones,
  };
}

export function serializeCicloGasto(row) {
  if (!row) return null;
  return {
    id: row.id,
    ciclo_avicola_id: row.ciclo_avicola_id,
    fecha: toIsoDateOnly(row.fecha),
    categoria: row.categoria,
    cantidad: serializeDecimal(row.cantidad),
    unidad: row.unidad,
    descripcion: row.descripcion,
    proveedor: row.proveedor,
    precio_unitario: serializeDecimal(row.precio_unitario),
    importe_final: serializeDecimal(row.importe_final),
    metodo_pago: row.metodo_pago,
    observaciones: row.observaciones,
  };
}

export function serializeCicloVenta(row) {
  if (!row) return null;
  return {
    id: row.id,
    ciclo_avicola_id: row.ciclo_avicola_id,
    fecha: toIsoDateOnly(row.fecha),
    producto: row.producto,
    cantidad: serializeDecimal(row.cantidad),
    unidad: row.unidad,
    cliente: row.cliente,
    precio_unitario: serializeDecimal(row.precio_unitario),
    importe_final: serializeDecimal(row.importe_final),
    estado_pago: row.estado_pago,
    observaciones: row.observaciones,
  };
}

export function serializeCicloBiometria(row) {
  if (!row) return null;
  return {
    id: row.id,
    ciclo_avicola_id: row.ciclo_avicola_id,
    fecha: toIsoDateOnly(row.fecha),
    dia_ciclo: row.dia_ciclo,
    animales_pesados: row.animales_pesados,
    peso_promedio_g: serializeDecimal(row.peso_promedio_g),
    peso_promedio_kg: serializeDecimal(row.peso_promedio_kg),
    indice_crecimiento_g_dia: serializeDecimal(row.indice_crecimiento_g_dia),
    dias_transcurridos: row.dias_transcurridos,
    ganancia_ultima_g: serializeDecimal(row.ganancia_ultima_g),
    observaciones: row.observaciones,
  };
}

export function serializeCicloMortalidad(row) {
  if (!row) return null;
  return {
    id: row.id,
    ciclo_avicola_id: row.ciclo_avicola_id,
    fecha: toIsoDateOnly(row.fecha),
    dia_ciclo: row.dia_ciclo,
    muertes: row.muertes,
    descartes: row.descartes,
    causa: row.causa,
    accion_correctiva: row.accion_correctiva,
    responsable: row.responsable,
    observaciones: row.observaciones,
  };
}

export function serializeCicloAlimentoFase(row) {
  if (!row) return null;
  return {
    id: row.id,
    ciclo_avicola_id: row.ciclo_avicola_id,
    fecha: toIsoDateOnly(row.fecha),
    dia_ciclo: row.dia_ciclo,
    fase_alimento: row.fase_alimento,
    producto: row.producto,
    kg_ingreso: serializeDecimal(row.kg_ingreso),
    kg_consumidos: serializeDecimal(row.kg_consumidos),
    existencia_final: serializeDecimal(row.existencia_final),
    observaciones: row.observaciones,
  };
}

export function serializeCicloConsumoEstimado(row) {
  if (!row) return null;
  return {
    id: row.id,
    ciclo_avicola_id: row.ciclo_avicola_id,
    semana: row.semana,
    rango_dias: row.rango_dias,
    fase_alimento: row.fase_alimento,
    producto: row.producto,
    kg_ingreso: serializeDecimal(row.kg_ingreso),
    consumo_individual: serializeDecimal(row.consumo_individual),
    consumo_conjunto: serializeDecimal(row.consumo_conjunto),
    consumo_acumulado: serializeDecimal(row.consumo_acumulado),
    gdp: serializeDecimal(row.gdp),
    conversion: serializeDecimal(row.conversion),
    mortalidad_semanal: serializeDecimal(row.mortalidad_semanal),
    mortalidad_acumulada: serializeDecimal(row.mortalidad_acumulada),
  };
}

export function serializeCicloSanidad(row) {
  if (!row) return null;
  return {
    id: row.id,
    ciclo_avicola_id: row.ciclo_avicola_id,
    fecha: toIsoDateOnly(row.fecha),
    dia_ciclo: row.dia_ciclo,
    tipo: row.tipo,
    producto: row.producto,
    dosis: row.dosis,
    via: row.via,
    responsable: row.responsable,
    observaciones: row.observaciones,
  };
}

export function serializeCicloAvicola(row, kpis = null) {
  if (!row) return null;
  return {
    id: row.id,
    id_ciclo: row.id_ciclo,
    nombre_lote: row.nombre_lote,
    tipo: row.tipo,
    tipo_label: TIPO_CICLO_AVICOLA_LABEL[row.tipo] ?? row.tipo,
    especie: row.especie,
    objetivo: row.objetivo,
    fecha_inicio: toIsoDateOnly(row.fecha_inicio),
    fecha_salida_estimada: toIsoDateOnly(row.fecha_salida_estimada),
    animales_iniciales: row.animales_iniciales,
    responsable: row.responsable,
    estado: row.estado,
    estado_label: ESTADO_CICLO_AVICOLA_LABEL[row.estado] ?? row.estado,
    observaciones: row.observaciones,
    ubicacion_id: row.ubicacion_id,
    ubicacion: row.ubicacion?.nombre ?? null,
    kpis: kpis ?? undefined,
    calendario: row.calendario?.map(serializeCicloCalendarioEvento),
    gastos: row.gastos?.map(serializeCicloGasto),
    ventas: row.ventas?.map(serializeCicloVenta),
    biometrias: row.biometrias?.map(serializeCicloBiometria),
    mortalidad: row.mortalidad?.map(serializeCicloMortalidad),
    alimento_fases: row.alimento_fases?.map(serializeCicloAlimentoFase),
    consumo_estimado: row.consumo_estimado?.map(serializeCicloConsumoEstimado),
    sanidad: row.sanidad?.map(serializeCicloSanidad),
  };
}
