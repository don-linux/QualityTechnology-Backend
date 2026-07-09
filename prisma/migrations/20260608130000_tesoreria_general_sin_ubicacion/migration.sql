-- Tesoreria general deja de separarse por ubicacion (granja).
-- Se redefine la vista para agregar TODO el flujo de caja por periodo,
-- categoria y subcategoria, incluyendo movimientos sin ubicacion asignada
-- (ubicacion_id NULL) que antes quedaban excluidos por el JOIN con ubicacion.
-- Se usa DROP + CREATE porque CREATE OR REPLACE no permite eliminar columnas
-- existentes de una vista (la columna `granja`).
DROP VIEW IF EXISTS public.vw_tesoreria_general;

CREATE VIEW public.vw_tesoreria_general AS
SELECT
    COALESCE(fc.mes_periodo, to_char(fc.fecha::date, 'YYYY-MM')) AS mes,
    fc.categoria,
    fc.subcategoria,
    SUM(fc.ingreso) AS total_ingreso,
    SUM(fc.egreso) AS total_egreso,
    SUM(fc.ingreso - fc.egreso) AS saldo_neto
FROM public.flujo_caja fc
GROUP BY COALESCE(fc.mes_periodo, to_char(fc.fecha::date, 'YYYY-MM')), fc.categoria, fc.subcategoria;

COMMENT ON VIEW public.vw_tesoreria_general IS
    'Agregado mensual de flujo_caja por periodo (YYYY-MM), categoria y subcategoria (sin separar por ubicacion).';
