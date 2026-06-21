/** Subtipos de movimiento en trazabilidad (UI y validación). */
export const SUBTIPOS_TRAZABILIDAD = {
  INCUBACION_A_ALEVINAJE: {
    label: "De eficiencia reproductiva a alevinaje",
    modo: "TRASLADO",
    etapaOrigen: "incubacion",
    etapaDestino: "alevinaje",
  },
  ALEVINAJE_A_ALEVINAJE: {
    label: "De alevinaje a alevinaje",
    modo: "TRASLADO",
    etapaOrigen: "alevinaje",
    etapaDestino: "alevinaje",
  },
  ALEVINAJE_A_ENGORDA: {
    label: "De alevinaje a engorda",
    modo: "TRASLADO",
    etapaOrigen: "alevinaje",
    etapaDestino: "engorda",
  },
  ALEVINAJE_A_VENTA: {
    label: "De alevinaje a venta",
    modo: "VENTA",
    etapaOrigen: "alevinaje",
    etapaDestino: null,
  },
  ENGORDA_A_ENGORDA: {
    label: "De engorda a engorda",
    modo: "TRASLADO",
    etapaOrigen: "engorda",
    etapaDestino: "engorda",
  },
  ENGORDA_A_REPRODUCTORES: {
    label: "De engorda a reproductores",
    modo: "TRASLADO",
    etapaOrigen: "engorda",
    etapaDestino: "reproductores",
  },
  REPRODUCTORES_A_INCUBACION: {
    label: "De reproductores a eficiencia reproductiva",
    modo: "TRASLADO",
    etapaOrigen: "reproductores",
    etapaDestino: "incubacion",
  },
  ENGORDA_A_VENTA: {
    label: "De engorda a venta",
    modo: "VENTA",
    etapaOrigen: "engorda",
    etapaDestino: null,
  },
  MORTALIDAD_ALEVINAJE: {
    label: "Mortalidad en alevinaje",
    modo: "MORTALIDAD",
    etapaOrigen: "alevinaje",
    etapaDestino: null,
  },
  MORTALIDAD_ENGORDA: {
    label: "Mortalidad en engorda",
    modo: "MORTALIDAD",
    etapaOrigen: "engorda",
    etapaDestino: null,
  },
};

/**
 * Resuelve subtipo desde el body. Acepta claves nuevas o legacy TRASLADO/VENTA.
 * @returns {{ subtipo: string, config: object } | { subtipo: null, modo: string } | null}
 */
export function resolverSubtipoMovimiento(raw) {
  const t = String(raw ?? "")
    .trim()
    .toUpperCase();

  if (SUBTIPOS_TRAZABILIDAD[t]) {
    return { subtipo: t, config: SUBTIPOS_TRAZABILIDAD[t] };
  }

  if (t === "VENTA") {
    return { subtipo: null, modo: "VENTA", config: null };
  }
  if (t === "MORTALIDAD") {
    return { subtipo: null, modo: "MORTALIDAD", config: null };
  }
  if (t === "INGRESO" || t === "SIEMBRA") {
    return { subtipo: null, modo: "INGRESO", config: null };
  }
  if (t === "TRASLADO" || t === "") {
    return { subtipo: null, modo: "TRASLADO", config: null };
  }

  return null;
}

export function assertPiletaEtapa(pil, etapaEsperada, rol) {
  if (!pil) {
    const err = new Error(`Pileta de ${rol} no encontrada`);
    err.code = "PILETA_NOT_FOUND";
    throw err;
  }
  const tipo = String(pil.tipo ?? "").toLowerCase();
  if (tipo !== etapaEsperada) {
    const err = new Error(
      `La pileta de ${rol} '${pil.nombre}' debe ser de etapa ${etapaEsperada}, no '${tipo}'`,
    );
    err.code = "PILETA_TIPO_INVALIDO";
    throw err;
  }
}

export async function validarPiletasSegunSubtipo(tx, { subtipoConfig, piletaOrigenId, piletaDestinoId }) {
  const { etapaOrigen, etapaDestino, modo } = subtipoConfig;

  if (modo === "VENTA" || modo === "MORTALIDAD") {
    if (!piletaOrigenId) {
      throw Object.assign(new Error("pileta_origen_id es obligatorio"), { code: "VALIDACION" });
    }
    const pilOr = await tx.pileta.findUnique({
      where: { id: piletaOrigenId },
      select: { id: true, nombre: true, tipo: true },
    });
    assertPiletaEtapa(pilOr, etapaOrigen, "origen");
    return { pilOr, pilDest: null };
  }

  if (!piletaOrigenId || !piletaDestinoId) {
    throw Object.assign(
      new Error("pileta_origen_id y pileta_destino_id son obligatorios"),
      { code: "VALIDACION" },
    );
  }

  const [pilOr, pilDest] = await Promise.all([
    tx.pileta.findUnique({
      where: { id: piletaOrigenId },
      select: { id: true, nombre: true, tipo: true },
    }),
    tx.pileta.findUnique({
      where: { id: piletaDestinoId },
      select: { id: true, nombre: true, tipo: true },
    }),
  ]);

  assertPiletaEtapa(pilOr, etapaOrigen, "origen");
  assertPiletaEtapa(pilDest, etapaDestino, "destino");

  if (piletaOrigenId === piletaDestinoId) {
    throw Object.assign(new Error("Origen y destino no pueden ser la misma pileta"), {
      code: "VALIDACION",
    });
  }

  return { pilOr, pilDest };
}

export function labelSubtipoMovimiento(pilOr, pilDest, esVenta, mortalidadRegistro = 0) {
  if (esVenta) {
    const et = String(pilOr?.tipo ?? "").toLowerCase();
    if (et === "alevinaje") return SUBTIPOS_TRAZABILIDAD.ALEVINAJE_A_VENTA.label;
    if (et === "engorda") return SUBTIPOS_TRAZABILIDAD.ENGORDA_A_VENTA.label;
    return "Venta";
  }

  const esMortalidadPura =
    pilOr &&
    pilDest &&
    pilOr.id === pilDest.id &&
    Number(mortalidadRegistro) > 0;
  if (esMortalidadPura) {
    const et = String(pilOr.tipo ?? "").toLowerCase();
    if (et === "alevinaje") return SUBTIPOS_TRAZABILIDAD.MORTALIDAD_ALEVINAJE.label;
    if (et === "engorda") return SUBTIPOS_TRAZABILIDAD.MORTALIDAD_ENGORDA.label;
    return "Mortalidad";
  }

  const o = String(pilOr?.tipo ?? "").toLowerCase();
  const d = String(pilDest?.tipo ?? "").toLowerCase();
  if (o === "incubacion" && d === "alevinaje") return SUBTIPOS_TRAZABILIDAD.INCUBACION_A_ALEVINAJE.label;
  if (o === "alevinaje" && d === "alevinaje") return SUBTIPOS_TRAZABILIDAD.ALEVINAJE_A_ALEVINAJE.label;
  if (o === "alevinaje" && d === "engorda") return SUBTIPOS_TRAZABILIDAD.ALEVINAJE_A_ENGORDA.label;
  if (o === "engorda" && d === "engorda") return SUBTIPOS_TRAZABILIDAD.ENGORDA_A_ENGORDA.label;
  if (o === "engorda" && d === "reproductores") {
    return SUBTIPOS_TRAZABILIDAD.ENGORDA_A_REPRODUCTORES.label;
  }
  if (o === "reproductores" && d === "incubacion") {
    return SUBTIPOS_TRAZABILIDAD.REPRODUCTORES_A_INCUBACION.label;
  }
  return null;
}
