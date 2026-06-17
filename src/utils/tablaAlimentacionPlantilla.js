import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, "../config/tabla-alimentacion-diaria.json");

export const CANTIDAD_BASE_ALIMENTACION = 18500;

let _plantillaCache = null;

function cargarPlantilla() {
  if (_plantillaCache) return _plantillaCache;
  const raw = readFileSync(CONFIG_PATH, "utf-8");
  _plantillaCache = JSON.parse(raw);
  return _plantillaCache;
}

function round6(n) {
  return Math.round(Number(n) * 1e6) / 1e6;
}

export function generarTablaAlimentacion(opts = {}) {
  const plantilla = cargarPlantilla();
  const cantidadBase = plantilla.cantidad_base ?? CANTIDAD_BASE_ALIMENTACION;
  const cantidad = Math.max(0, Number(opts.cantidad) || 0);
  const factor = cantidadBase > 0 ? cantidad / cantidadBase : 0;

  const filas = (plantilla.filas ?? []).map((f) => {
    const biomasaKg = round6((f.biomasa_base_kg ?? 0) * factor);
    const kgAlimentoDia = round6((f.kg_alimento_base_dia ?? biomasaKg * (f.tasa_alimentacion_pct ?? 0)) * factor);
    return {
      dia: f.dia,
      tipo_alimento: f.tipo_alimento ?? "",
      peso_promedio_g: f.peso_promedio_g ?? 0,
      tasa_alimentacion_pct: f.tasa_alimentacion_pct ?? 0,
      biomasa_kg: biomasaKg,
      kg_alimento_dia: kgAlimentoDia,
    };
  });

  const alimentoTotalKg = round6(
    filas.reduce((acc, f) => acc + (f.kg_alimento_dia ?? 0), 0),
  );

  return {
    cantidad,
    cantidad_base: cantidadBase,
    factor_escala: round6(factor),
    tipo_venta: opts.tipoVenta ?? null,
    cliente: opts.cliente ?? null,
    fecha_inicio: opts.fechaInicio ?? null,
    filas,
    totales: {
      dias: filas.length,
      alimento_total_kg: alimentoTotalKg,
    },
  };
}

export function resetPlantillaCacheForTests() {
  _plantillaCache = null;
}
