/**
 * Middleware de manejo centralizado de errores
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Error de validación
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Error de validación",
      detalles: err.message,
    });
  }

  // Error de base de datos
  if (err.code && err.code.startsWith("23")) {
    return res.status(409).json({
      error: "Error de integridad de datos",
      detalles: err.message,
    });
  }

  // Error de autenticación/autorización
  if (err.status === 401 || err.status === 403) {
    return res.status(err.status).json({
      error: err.message || "Error de autenticación/autorización",
    });
  }

  // Error por defecto
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Wrapper para manejar errores asíncronos
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
