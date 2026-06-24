import { labelSubtipoMovimiento } from "./trazabilidadSubtipos.js";

function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

/** Ingreso/traslado entre piletas (tabla `siembra`). Origen opcional (= externo si null). */
export async function crearSiembraMovimiento(
  tx,
  { piletaOrigenId, piletaDestinoId, cantidadEntera, usuarioId, fechaMovimiento },
) {
  const dest = toInt(piletaDestinoId);
  const cant = Math.floor(Number(cantidadEntera) || 0);
  if (!dest || cant <= 0) return null;

  let origen =
    piletaOrigenId !== undefined && piletaOrigenId !== null && piletaOrigenId !== ""
      ? toInt(piletaOrigenId)
      : null;
  if (origen !== null && origen === dest) origen = null;

  const data = {
    pileta_origen: origen,
    pileta_destino: dest,
    cantidad: BigInt(cant),
    mortalidad: 0,
    usuario_id: usuarioId,
  };
  if (fechaMovimiento) data.fecha = fechaMovimiento;

  const s = await tx.siembra.create({ data });
  return s.id;
}

export function crearSiembraVenta(
  tx,
  { piletaOrigenId, cantidadEntera, ventaId, usuarioId, fechaMovimiento },
) {
  const origen = toInt(piletaOrigenId);
  const cant = Math.floor(Number(cantidadEntera) || 0);
  const venta = toInt(ventaId);
  if (!origen || cant <= 0 || !venta) return null;

  const data = {
    pileta_origen: origen,
    pileta_destino: null,
    cantidad: BigInt(cant),
    mortalidad: 0,
    venta_id: venta,
    usuario_id: usuarioId,
  };
  if (fechaMovimiento) data.fecha = fechaMovimiento;

  return tx.siembra.create({ data }).then((s) => s.id);
}

/** Etapas con ajuste de inventario vía API manual de trazabilidad. */
export const ETAPAS_TRAZABILIDAD = ["alevinaje", "engorda"];

/** Etapas visibles en el listado de movimientos (incluye flujo reproductivo). */
export const ETAPAS_PILETA_MOVIMIENTOS = [
  ...ETAPAS_TRAZABILIDAD,
  "reproductores",
  "incubacion",
];

const ETAPA_LABEL = {
  alevinaje: "Alevinaje",
  engorda: "Engorda",
  reproductores: "Reproductores",
  incubacion: "Incubación",
};

export function labelEtapa(tipo) {
  if (!tipo) return "—";
  return ETAPA_LABEL[String(tipo).toLowerCase()] ?? tipo;
}

export function resolverEtapaMovimiento(pilOr, pilDest) {
  const tipos = new Set(ETAPAS_PILETA_MOVIMIENTOS);
  if (pilDest?.tipo && tipos.has(pilDest.tipo)) return pilDest.tipo;
  if (pilOr?.tipo && tipos.has(pilOr.tipo)) return pilOr.tipo;
  return pilDest?.tipo ?? pilOr?.tipo ?? null;
}

export function serializarMovimientoSiembra(s) {
  const pilOr = s.piletas_siembra_pileta_origenTopiletas;
  const pilDest = s.piletas_siembra_pileta_destinoTopiletas;
  const brutas =
    typeof s.cantidad === "bigint" ? Number(s.cantidad) : Number(s.cantidad ?? 0);
  const mortalidad = s.mortalidad ?? 0;
  const netas = Math.max(0, brutas - mortalidad);
  const esVenta = Boolean(s.venta_id ?? s.venta?.id);

  const obsEng = s.engordas_como_origen?.[0]?.observacion?.comentario?.trim();
  const obsInc = s.eficiencias_reproductivas_como_origen?.[0]?.observacion?.comentario?.trim();
  const obsParts = [];
  const obsUsuario = obsEng || obsInc;
  if (obsUsuario) obsParts.push(obsUsuario);

  const incMeta = s.eficiencias_reproductivas_como_origen?.[0];
  const incCodigo = incMeta?.codigo ?? incMeta?.evento_cosecha?.codigo ?? null;
  if (incCodigo) {
    const tag = `Evento: ${incCodigo}`;
    if (!obsUsuario || !obsUsuario.includes(tag)) obsParts.push(tag);
  }
  if (incMeta?.lote) {
    const tagLote = `Lote: ${incMeta.lote}`;
    if (!obsUsuario || !obsUsuario.includes(incMeta.lote)) obsParts.push(tagLote);
  }

  if (mortalidad > 0) obsParts.push(`Mortalidad: ${mortalidad}`);
  if (esVenta && s.venta?.folio) {
    const folioTag = `Folio: ${s.venta.folio}`;
    if (!obsUsuario || !obsUsuario.includes(folioTag)) {
      obsParts.push(folioTag);
    }
  }

  const etapa = resolverEtapaMovimiento(pilOr, pilDest);
  const subtipoLabel = labelSubtipoMovimiento(pilOr, pilDest, esVenta, mortalidad);
  const esMortalidadPura =
    Boolean(pilOr && pilDest && pilOr.id === pilDest.id && mortalidad > 0);

  let destinoLabel = pilDest?.nombre ?? "—";
  if (esVenta) {
    const cliente = s.venta?.cliente_nombre ?? "Cliente";
    const tipo = s.venta?.tipoVenta ? ` (${s.venta.tipoVenta})` : "";
    destinoLabel = `Venta: ${cliente}${tipo}`;
  } else if (!pilDest && pilOr && mortalidad >= brutas && brutas > 0) {
    destinoLabel = pilOr.nombre;
  } else if (!pilDest && !pilOr) {
    destinoLabel = "—";
  } else if (!pilDest) {
    destinoLabel = "Externo";
  }

  const ubicacionId = pilDest?.ubicacion?.id ?? pilOr?.ubicacion?.id ?? null;
  const granjaNombre = pilDest?.ubicacion?.nombre ?? pilOr?.ubicacion?.nombre ?? null;

  const usuario = s.usuarios ?? null;
  const usuarioNombre = usuario?.nombre ?? null;
  const usuarioRol = usuario?.rol?.nombre ?? null;

  return {
    movimiento_id: s.id,
    origen: pilOr?.nombre ?? "Externo",
    destino: destinoLabel,
    cantidad_trasladada: esMortalidadPura ? mortalidad : netas,
    fecha_movimiento: s.fecha,
    observacion: obsParts.length ? obsParts.join(" · ") : null,
    origen_pileta_id: pilOr?.id ?? null,
    etapa,
    etapa_label: subtipoLabel ?? (esVenta ? "Venta" : labelEtapa(etapa)),
    subtipo_movimiento: subtipoLabel,
    ubicacion_id: ubicacionId,
    granja: granjaNombre,
    es_venta: esVenta,
    venta_id: s.venta_id ?? s.venta?.id ?? null,
    usuario_id: s.usuario_id ?? usuario?.id ?? null,
    usuario_nombre: usuarioNombre,
    rol_nombre: usuarioRol,
  };
}
