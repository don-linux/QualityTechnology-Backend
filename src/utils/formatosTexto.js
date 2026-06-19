/**
 * Formatos de transformación para campos de texto (espejo del frontend).
 */

export const FORMATOS_TEXTO = {
  MAYUSCULA_INICIAL_TODO: "mayuscula_inicial_todo",
};

const LOCALE = "es";

const CLAVES_SIN_FORMATO =
  /(correo|email|password|rfc|codigo|busqueda|usuario|token|url|foto|mime)/i;

export function debeAplicarFormatoTextoCampo(fieldName) {
  if (!fieldName) return false;
  const k = String(fieldName).toLowerCase();

  if (CLAVES_SIN_FORMATO.test(k)) return false;
  if (/(^|_)id$/.test(k) || k.endsWith("_id")) return false;
  if (/^fd_|fecha|hora/.test(k)) return false;
  if (/^fn_|^fi_/.test(k)) return false;
  if (/^tipo$|^estado$|^granja$|^tipo_/.test(k)) return false;
  if (/cantidad|precio|monto|saldo|numero|num_|peso|ph|temperatura|mortalidad|ratio|talla|volumen|duracion|indice|alcalinidad|dureza|turbidez|oxigeno|amoniaco|nitrito|nitrate/.test(k)) {
    return false;
  }

  if (k.startsWith("fc_") && !/fc_(correo|email|rfc|tipo|uap)/.test(k)) return true;

  return /nombre|razon|contacto|localidad|direccion|observacion|motivo|procedencia|familia|genetica|producto|marca|modelo|descripcion|comentario|empresa|instalacion|area|cargo|visitante|medicamento|insumo|equipo|fabricante|serie|notas|detalle|parentesco|documento|lote|departamento|puesto|categoria|origen|destino|trampa|parametro|plaga|bano|recambio|recepcion|biometria|vacacion|acta|cuenta|proveedor|cliente|ubicacion|unidad|pileta|reproductor|engorda|alevin|incubacion|evento|siembra|venta|tecnico|responsable|autor|empresa|procedencia|instalacion|granja/.test(
    k,
  );
}

export function formatoMayusculaInicialTodo(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(
      (palabra) =>
        palabra.charAt(0).toLocaleUpperCase(LOCALE) +
        palabra.slice(1).toLocaleLowerCase(LOCALE),
    )
    .join(" ");
}

export function aplicarFormatoTexto(value, formato) {
  switch (formato) {
    case FORMATOS_TEXTO.MAYUSCULA_INICIAL_TODO:
      return formatoMayusculaInicialTodo(value);
    default:
      return value == null ? "" : String(value);
  }
}

export function normalizeTextoCampo(value, fieldName = null) {
  if (value === undefined || value === null) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return trimmed;

  const n = String(fieldName || "").toLowerCase();
  if (/rfc/.test(n)) return trimmed.toUpperCase();
  if (!debeAplicarFormatoTextoCampo(fieldName)) return trimmed;

  return aplicarFormatoTexto(trimmed, FORMATOS_TEXTO.MAYUSCULA_INICIAL_TODO);
}

export function formatearStringsEnBody(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return obj;
  if (Array.isArray(obj)) return obj.map((item) => formatearStringsEnBody(item));
  if (typeof obj !== "object") return obj;

  const out = { ...obj };
  for (const [key, value] of Object.entries(out)) {
    if (typeof value === "string") {
      out[key] = normalizeTextoCampo(value, key);
    } else if (value && typeof value === "object") {
      out[key] = formatearStringsEnBody(value);
    }
  }
  return out;
}
