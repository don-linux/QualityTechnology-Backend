import prisma from "../src/prisma.js";

function d(iso) {
  return new Date(`${iso}T12:00:00.000Z`);
}

export async function seedCicloEngorda2026() {
  const laCeiba = await prisma.ubicacion.findFirst({ where: { nombre: "La Ceiba" } });
  if (!laCeiba) return;

  const existing = await prisma.cicloAvicola.findUnique({ where: { id_ciclo: "1-2026" } });
  if (existing) {
    await prisma.cicloAvicola.delete({ where: { id: existing.id } });
  }

  await prisma.cicloAvicola.create({
    data: {
      id_ciclo: "1-2026",
      nombre_lote: "1-2026",
      tipo: "engorda",
      especie: "Pollos de Engorda",
      objetivo: "Carne",
      fecha_inicio: d("2026-06-16"),
      fecha_salida_estimada: d("2026-08-11"),
      animales_iniciales: 50,
      responsable: null,
      estado: "activo",
      ubicacion_id: laCeiba.id,
      calendario: {
        create: [
          { fecha: d("2026-06-16"), dia_ciclo: 0, tipo_evento: "Inicio", actividad: "Inicio del ciclo/lote", estado_evento: "Pendiente" },
          { fecha: d("2026-06-16"), dia_ciclo: 0, tipo_evento: "Biometría", actividad: "Biometría programada", estado_evento: "Pendiente", observaciones: "Biometria de Entrada" },
          { fecha: d("2026-06-26"), dia_ciclo: 10, tipo_evento: "Vacuna", actividad: "Newcastle", estado_evento: "Pendiente" },
          { fecha: d("2026-07-01"), dia_ciclo: 15, tipo_evento: "Biometría", actividad: "Biometría programada", estado_evento: "Pendiente" },
          { fecha: d("2026-07-07"), dia_ciclo: 21, tipo_evento: "Vacuna", actividad: "Viruela Aviar", estado_evento: "Pendiente" },
          { fecha: d("2026-07-07"), dia_ciclo: 21, tipo_evento: "Cambio de alimento", actividad: "Cambio de fase de alimento", producto: "Inicio/Crecimiento", estado_evento: "Pendiente" },
          { fecha: d("2026-07-16"), dia_ciclo: 30, tipo_evento: "Biometría", actividad: "Biometría programada", estado_evento: "Pendiente" },
          { fecha: d("2026-07-22"), dia_ciclo: 36, tipo_evento: "Refuerzo", actividad: "Viruela Aviar", estado_evento: "Pendiente" },
          { fecha: d("2026-07-28"), dia_ciclo: 42, tipo_evento: "Vacuna", actividad: "Triple + Coriza", estado_evento: "Pendiente" },
          { fecha: d("2026-07-28"), dia_ciclo: 42, tipo_evento: "Cambio de alimento", actividad: "Cambio de fase de alimento", producto: "Engorda", estado_evento: "Pendiente" },
          { fecha: d("2026-07-31"), dia_ciclo: 45, tipo_evento: "Biometría", actividad: "Biometría programada", estado_evento: "Pendiente" },
          { fecha: d("2026-08-11"), dia_ciclo: 56, tipo_evento: "Salida a mercado", actividad: "Primera revisión para salida/venta", estado_evento: "Pendiente", observaciones: "Opcional" },
        ],
      },
      gastos: {
        create: [
          { fecha: d("2026-06-15"), categoria: "Alimento", cantidad: 40, unidad: "kg", descripcion: "Alimento Inicio", proveedor: "JYY Agropecuaria de Tabasco", precio_unitario: 11.425, importe_final: 457, metodo_pago: "TDD", observaciones: "Ejecutado" },
          { fecha: d("2026-06-16"), categoria: "Compra de animales", cantidad: 50, unidad: "servicio", descripcion: "Pollo", proveedor: "Mtro. Manuel", precio_unitario: 20, importe_final: 1000, metodo_pago: "TDD", observaciones: "Ejecutado" },
          { fecha: d("2026-06-25"), categoria: "Vacunas", cantidad: 1, unidad: "Dosis", descripcion: "New Castle", proveedor: "Agrotropic", precio_unitario: 70, importe_final: 70, metodo_pago: "TDD", observaciones: "Pendiente" },
          { fecha: d("2026-07-06"), categoria: "Alimento", cantidad: 160, unidad: "kg", descripcion: "Alimento Engorda", proveedor: "JYY Agropecuaria de Tabasco", precio_unitario: 11.225, importe_final: 1796, metodo_pago: "TDD", observaciones: "Pendiente" },
          { fecha: d("2026-07-06"), categoria: "Vacunas", cantidad: 1, unidad: "Dosis", descripcion: "Viruela Aviar", proveedor: "Agrotropic", precio_unitario: 70, importe_final: 70, metodo_pago: "TDD", observaciones: "Pendiente" },
          { fecha: d("2026-07-27"), categoria: "Alimento", cantidad: 80, unidad: "kg", descripcion: "Alimento Engorda", proveedor: "JYY Agropecuaria de Tabasco", precio_unitario: 11.225, importe_final: 898, metodo_pago: "TDD", observaciones: "Pendiente" },
          { fecha: d("2026-07-27"), categoria: "Alimento", cantidad: 40, unidad: "kg", descripcion: "Maiz Quebrado", proveedor: "JYY Agropecuaria de Tabasco", precio_unitario: 7.125, importe_final: 285, metodo_pago: "TDD", observaciones: "Pendiente" },
        ],
      },
      biometrias: {
        create: [
          { fecha: d("2026-06-16"), dia_ciclo: 0, animales_pesados: 50, peso_promedio_g: 0.46, peso_promedio_kg: 0.00046, indice_crecimiento_g_dia: 0, dias_transcurridos: 0, ganancia_ultima_g: 0.46 },
          { fecha: d("2026-06-20"), dia_ciclo: 4, animales_pesados: 49, peso_promedio_g: 0.7, peso_promedio_kg: 0.0007, indice_crecimiento_g_dia: 0.06, dias_transcurridos: 4, ganancia_ultima_g: 0.24 },
        ],
      },
      mortalidad: {
        create: [
          {
            fecha: d("2026-06-19"),
            dia_ciclo: 3,
            muertes: 1,
            descartes: 0,
            causa: "Desconocida",
            accion_correctiva: "No se aplica",
            responsable: "Jesus Daniel Ortiz Cruz",
            observaciones: "Temperatura se mantuvo en 31 minimo",
          },
        ],
      },
      alimento_fases: {
        create: [
          { fecha: d("2026-06-16"), dia_ciclo: 0, fase_alimento: "Inicio", kg_ingreso: 40, kg_consumidos: 0, existencia_final: 40 },
          { fecha: d("2026-06-23"), dia_ciclo: 7, kg_consumidos: 8.3, existencia_final: 31.7 },
          { fecha: d("2026-06-30"), dia_ciclo: 14, kg_consumidos: 16.85, existencia_final: 14.85 },
          { fecha: d("2026-07-07"), dia_ciclo: 21, fase_alimento: "Engorda", kg_ingreso: 160, kg_consumidos: 27.4, existencia_final: 147.45 },
          { fecha: d("2026-07-14"), dia_ciclo: 28, kg_consumidos: 35, existencia_final: 112.45 },
          { fecha: d("2026-07-21"), dia_ciclo: 35, kg_consumidos: 45, existencia_final: 67.45 },
          { fecha: d("2026-07-28"), dia_ciclo: 42, kg_ingreso: 105, kg_consumidos: 55, existencia_final: 117.45 },
          { fecha: d("2026-08-04"), dia_ciclo: 49, kg_consumidos: 60, existencia_final: 57.45 },
          { fecha: d("2026-08-11"), dia_ciclo: 56, kg_consumidos: 66, existencia_final: -8.55 },
          { fecha: d("2026-08-18"), dia_ciclo: 63, kg_consumidos: 0, existencia_final: -8.55 },
        ],
      },
      consumo_estimado: {
        create: [
          { semana: 0, rango_dias: "0 - 6", fase_alimento: "Inicio", producto: "Proteina al 20%", kg_ingreso: 0.045, consumo_conjunto: 0, consumo_acumulado: 0 },
          { semana: 1, rango_dias: "7 - 13", fase_alimento: "Inicio", consumo_individual: 0.166, consumo_conjunto: 8.3, consumo_acumulado: 8.3, gdp: 27, conversion: 0.87, mortalidad_semanal: 0.01, mortalidad_acumulada: 0.015 },
          { semana: 2, rango_dias: "14 - 20", fase_alimento: "Inicio", consumo_individual: 0.337, consumo_conjunto: 16.85, consumo_acumulado: 25.15, gdp: 27, conversion: 1.32, mortalidad_semanal: 0.005, mortalidad_acumulada: 0.02 },
          { semana: 3, rango_dias: "21 - 27", fase_alimento: "Engorda", producto: "Proteina al 18%", kg_ingreso: 0.8, consumo_individual: 0.548, consumo_conjunto: 27.4, consumo_acumulado: 52.55, gdp: 38, conversion: 1.31, mortalidad_semanal: 0.005, mortalidad_acumulada: 0.025 },
          { semana: 4, rango_dias: "28 - 34", fase_alimento: "Engorda", consumo_individual: 0.7, consumo_conjunto: 35, consumo_acumulado: 87.55, gdp: 46, conversion: 1.35, mortalidad_semanal: 0.008, mortalidad_acumulada: 0.028 },
          { semana: 5, rango_dias: "35 - 41", fase_alimento: "Engorda", consumo_individual: 0.9, consumo_conjunto: 45, consumo_acumulado: 132.55, gdp: 54, conversion: 1.4, mortalidad_semanal: 0.008, mortalidad_acumulada: 0.036 },
          { semana: 6, rango_dias: "42 - 49", fase_alimento: "Engorda", consumo_individual: 1.1, consumo_conjunto: 55, consumo_acumulado: 187.55, gdp: 60, conversion: 1.5, mortalidad_semanal: 0.01, mortalidad_acumulada: 0.046 },
          { semana: 7, rango_dias: "50 - 56", fase_alimento: "Engorda", consumo_individual: 1.2, consumo_conjunto: 60, consumo_acumulado: 247.55, gdp: 63, conversion: 1.6, mortalidad_semanal: 0.01, mortalidad_acumulada: 0.056 },
          { semana: 8, rango_dias: "57 - 64", fase_alimento: "Engorda", consumo_individual: 1.32, consumo_conjunto: 66, consumo_acumulado: 313.55, gdp: 63, conversion: 1.79, mortalidad_semanal: 0.01, mortalidad_acumulada: 0.066 },
        ],
      },
    },
  });
}
