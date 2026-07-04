function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sumDecimal(rows, field) {
  return rows.reduce((acc, row) => acc + toNumber(row[field]), 0);
}

function toIsoDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function daysBetween(startDate, endDate) {
  const start = new Date(toIsoDate(startDate));
  const end = new Date(toIsoDate(endDate));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function calcularDiaCiclo(fechaInicio, fecha) {
  return Math.max(0, daysBetween(fechaInicio, fecha));
}

export function calcularKpisCicloAvicola(ciclo) {
  const gastos = ciclo.gastos ?? [];
  const ventas = ciclo.ventas ?? [];
  const biometrias = [...(ciclo.biometrias ?? [])].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha),
  );
  const mortalidad = ciclo.mortalidad ?? [];
  const alimentoFases = ciclo.alimento_fases ?? [];
  const consumoEstimado = [...(ciclo.consumo_estimado ?? [])].sort(
    (a, b) => (a.semana ?? 0) - (b.semana ?? 0),
  );

  const totalGastos = sumDecimal(gastos, "importe_final");
  const totalVentas = sumDecimal(ventas, "importe_final");
  const utilidad = totalVentas - totalGastos;
  const margenPct = totalVentas > 0 ? (utilidad / totalVentas) * 100 : 0;
  const animalesIniciales = toNumber(ciclo.animales_iniciales);
  const costoAnimal = animalesIniciales > 0 ? totalGastos / animalesIniciales : 0;

  const totalMuertes = mortalidad.reduce((acc, row) => acc + toNumber(row.muertes), 0);
  const totalDescartes = mortalidad.reduce((acc, row) => acc + toNumber(row.descartes), 0);
  const mortalidadPct =
    animalesIniciales > 0 ? ((totalMuertes + totalDescartes) / animalesIniciales) * 100 : 0;

  let consumoKg = sumDecimal(alimentoFases, "kg_consumidos");
  if (consumoKg <= 0 && consumoEstimado.length > 0) {
    const last = consumoEstimado[consumoEstimado.length - 1];
    consumoKg = toNumber(last.consumo_acumulado);
  }

  const primeraBiometria = biometrias[0];
  const ultimaBiometria = biometrias[biometrias.length - 1];
  const pesoFinalG = ultimaBiometria ? toNumber(ultimaBiometria.peso_promedio_g) : 0;
  const pesoInicialG = primeraBiometria ? toNumber(primeraBiometria.peso_promedio_g) : 0;
  const gdpFinal =
    ultimaBiometria && ultimaBiometria.indice_crecimiento_g_dia != null
      ? toNumber(ultimaBiometria.indice_crecimiento_g_dia)
      : 0;

  const gananciaKg = Math.max((pesoFinalG - pesoInicialG) / 1000, 0.0001);
  const fcr = consumoKg > 0 && gananciaKg > 0 ? consumoKg / gananciaKg : 0;

  return {
    total_gastos: Number(totalGastos.toFixed(2)),
    total_ventas: Number(totalVentas.toFixed(2)),
    utilidad_neta: Number(utilidad.toFixed(2)),
    margen_pct: Number(margenPct.toFixed(2)),
    costo_animal_inicial: Number(costoAnimal.toFixed(2)),
    mortalidad_pct: Number(mortalidadPct.toFixed(4)),
    consumo_alimento_kg: Number(consumoKg.toFixed(3)),
    peso_final_prom_g: Number(pesoFinalG.toFixed(4)),
    gdp_final_g_dia: Number(gdpFinal.toFixed(4)),
    fcr_aprox: Number(fcr.toFixed(4)),
  };
}

export function calcularImporteFinal(cantidad, precioUnitario, importeFinal) {
  const importe = toNumber(importeFinal, NaN);
  if (Number.isFinite(importe) && importe > 0) return Number(importe.toFixed(2));
  return Number((toNumber(cantidad) * toNumber(precioUnitario)).toFixed(2));
}

export async function calcularBiometriaDerivada(tx, cicloAvicolaId, fechaInicio, payload) {
  const fecha = payload.fecha;
  const diaCiclo = calcularDiaCiclo(fechaInicio, fecha);
  const pesoPromedioG = toNumber(payload.peso_promedio_g);
  const pesoPromedioKg = payload.peso_promedio_kg != null
    ? toNumber(payload.peso_promedio_kg)
    : Number((pesoPromedioG / 1000).toFixed(6));

  const prev = await tx.cicloBiometria.findFirst({
    where: {
      ciclo_avicola_id: cicloAvicolaId,
      ...(payload.id ? { id: { not: Number(payload.id) } } : {}),
      fecha: { lt: new Date(fecha) },
    },
    orderBy: { fecha: "desc" },
  });

  let diasTranscurridos = diaCiclo;
  let gananciaUltimaG = pesoPromedioG;
  let indiceCrecimiento = 0;

  if (prev) {
    const prevPeso = toNumber(prev.peso_promedio_g);
    const prevDia = prev.dia_ciclo ?? calcularDiaCiclo(fechaInicio, prev.fecha);
    diasTranscurridos = Math.max(1, diaCiclo - prevDia);
    gananciaUltimaG = pesoPromedioG - prevPeso;
    indiceCrecimiento = gananciaUltimaG / diasTranscurridos;
  }

  return {
    dia_ciclo: diaCiclo,
    peso_promedio_kg: pesoPromedioKg,
    dias_transcurridos: diasTranscurridos,
    ganancia_ultima_g: Number(gananciaUltimaG.toFixed(4)),
    indice_crecimiento_g_dia: Number(indiceCrecimiento.toFixed(4)),
  };
}
