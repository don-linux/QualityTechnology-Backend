export function calcularDiasEnPileta(fechaIngreso, fechaEgreso) {
  if (!fechaIngreso) return null;
  const inicio = new Date(fechaIngreso);
  const fin = fechaEgreso ? new Date(fechaEgreso) : new Date();
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return null;
  const diff = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}
