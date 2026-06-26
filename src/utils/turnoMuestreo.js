export const TURNOS_MUESTREO = [
  "Madrugada",
  "Amanecer",
  "Mañana",
  "Medio dia",
  "Tarde",
  "Noche",
];

/**
 * Infiere turno de muestreo a partir de hora HH:MM (24h).
 * @param {string} horaHHMM
 * @returns {string}
 */
export function inferirTurnoMuestreo(horaHHMM) {
  if (!horaHHMM || typeof horaHHMM !== "string") return "Mañana";
  const match = horaHHMM.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "Mañana";

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "Mañana";

  const totalMinutes = hour * 60 + minute;

  if (totalMinutes >= 0 && totalMinutes < 5 * 60) return "Madrugada";
  if (totalMinutes >= 5 * 60 && totalMinutes < 7 * 60) return "Amanecer";
  if (totalMinutes >= 7 * 60 && totalMinutes < 12 * 60) return "Mañana";
  if (totalMinutes >= 12 * 60 && totalMinutes < 15 * 60) return "Medio dia";
  if (totalMinutes >= 15 * 60 && totalMinutes < 19 * 60) return "Tarde";
  return "Noche";
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function esTurnoMuestreoValido(value) {
  return TURNOS_MUESTREO.includes(String(value ?? "").trim());
}
