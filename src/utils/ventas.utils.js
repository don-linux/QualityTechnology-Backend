/**
 * Utilidades para Ventas
 */
export const ventasUtils = {
  calcularTotal: (cantidad, precio) => {
    const c = Number(cantidad) || 0;
    const p = Number(precio) || 0;
    return c * p;
  },

  normalizarGranja: (g) => {
    if (!g) return null;
    const g2 = g.toLowerCase().trim();

    if (g2 === "medellin") return "Medellin";
    if (g2 === "la ceiba") return "La Ceiba";
    return g;
  },

  sanitizeNumeric: (val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  },
};
