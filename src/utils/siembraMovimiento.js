function toInt(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isInteger(n) ? n : fallback;
}

/** Ingreso/traslado entre piletas (tabla `siembra`). Origen opcional (= externo si null). */
export async function crearSiembraMovimiento(
  tx,
  { piletaOrigenId, piletaDestinoId, cantidadEntera, usuarioId },
) {
  const dest = toInt(piletaDestinoId);
  const cant = Math.floor(Number(cantidadEntera) || 0);
  if (!dest || cant <= 0) return null;

  let origen =
    piletaOrigenId !== undefined && piletaOrigenId !== null && piletaOrigenId !== ""
      ? toInt(piletaOrigenId)
      : null;
  if (origen !== null && origen === dest) origen = null;

  const s = await tx.siembra.create({
    data: {
      pileta_origen: origen,
      pileta_destino: dest,
      cantidad: BigInt(cant),
      mortalidad: 0,
      usuario_id: usuarioId,
    },
  });
  return s.id;
}

export const ETAPAS_TRAZABILIDAD = ["alevinaje", "engorda"];

const ETAPA_LABEL = {
  alevinaje: "Alevinaje",
  engorda: "Engorda",
};

export function labelEtapa(tipo) {
  if (!tipo) return "—";
  return ETAPA_LABEL[String(tipo).toLowerCase()] ?? tipo;
}

export function resolverEtapaMovimiento(pilOr, pilDest) {
  const tipos = new Set(ETAPAS_TRAZABILIDAD);
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

  const obsAlev = s.alevinajes_como_origen?.[0]?.observacion?.comentario?.trim();
  const obsEng = s.engordas_como_origen?.[0]?.observacion?.comentario?.trim();
  const obsParts = [];
  const obsUsuario = obsAlev || obsEng;
  if (obsUsuario) obsParts.push(obsUsuario);
  if (mortalidad > 0) obsParts.push(`Mortalidad: ${mortalidad}`);

  const etapa = resolverEtapaMovimiento(pilOr, pilDest);

  return {
    fi_movimiento_id: s.id,
    origen: pilOr?.nombre ?? "Externo",
    destino: pilDest?.nombre ?? "—",
    cantidad_trasladada: netas,
    fecha_movimiento: s.fecha,
    observacion: obsParts.length ? obsParts.join(" · ") : null,
    origen_pileta_id: pilOr?.id ?? null,
    etapa,
    fc_etapa: labelEtapa(etapa),
    fc_granja: pilDest?.ubicacion?.nombre ?? pilOr?.ubicacion?.nombre ?? null,
  };
}
