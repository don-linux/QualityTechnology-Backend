export function diasTranscurridos(fechaInicio, fechaFin = new Date()) {
  if (!fechaInicio) return 0;
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const ms = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor(ms / 86400000));
}

export function costoProduccionPorOrganismo(costoTotal, cantidadInicial) {
  const total = Number(costoTotal) || 0;
  const n = Number(cantidadInicial) || 0;
  if (n <= 0) return 0;
  return Math.round((total / n) * 1e4) / 1e4;
}

export function biomasaKg(cantidad, pesoPromedioGramos) {
  const n = Number(cantidad) || 0;
  const p = Number(pesoPromedioGramos) || 0;
  return Math.round(((n * p) / 1000) * 1e3) / 1e3;
}

export function indiceCrecimientoSGR(pesoInicialG, pesoFinalG, dias) {
  const wi = Number(pesoInicialG) || 0;
  const wf = Number(pesoFinalG) || 0;
  const d = Number(dias) || 0;
  if (wi <= 0 || wf <= 0 || d <= 0) return null;
  return Math.round(((Math.log(wf) - Math.log(wi)) / d) * 100 * 1e4) / 1e4;
}

export function calcularKpisCiclo(input = {}) {
  const dias = diasTranscurridos(input.fechaInicio, input.fechaCierre ?? new Date());
  const costoPorOrg = costoProduccionPorOrganismo(
    input.costoProduccionTotal,
    input.cantidadInicial,
  );

  let sgr = null;
  const biometrias = input.biometrias ?? [];
  if (biometrias.length >= 2) {
    const sorted = [...biometrias].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    sgr = indiceCrecimientoSGR(
      first.peso_promedio ?? first.pesoPromedio,
      last.peso_promedio ?? last.pesoPromedio,
      diasTranscurridos(first.fecha, last.fecha) || dias,
    );
  }

  return {
    fecha_inicio: input.fechaInicio,
    dias_transcurridos: dias,
    cantidad_inicial: input.cantidadInicial ?? 0,
    costo_compra_por_organismo: input.costoCompraPorOrganismo ?? 0,
    costo_produccion_total: input.costoProduccionTotal ?? 0,
    costo_produccion_por_organismo: costoPorOrg,
    mortalidad_acumulada: input.mortalidadAcumulada ?? 0,
    organismos_aprovechados: input.organismosAprovechados ?? 0,
    ventas_realizadas: input.ventasRealizadas ?? 0,
    organismos_restantes: input.organismosRestantes ?? 0,
    biomasa_estimada_kg: input.biomasaEstimadaKg ?? 0,
    biomasa_vendida_kg: input.biomasaVendidaKg ?? 0,
    peso_promedio_actual_g: input.pesoPromedioActualG ?? 0,
    indice_crecimiento_sgr: sgr,
  };
}
