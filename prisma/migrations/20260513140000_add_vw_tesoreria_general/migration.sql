-- Vista agregada para /api/tesoreria y flujo-caja/tesoreria/:granja.
-- El baseline de Prisma no la incluía; sin ella las consultas fallan con "relation does not exist".

CREATE OR REPLACE VIEW public.vw_tesoreria_general AS
SELECT
    u.nombre AS granja,
    COALESCE(fc.mes_periodo, to_char(fc.fecha::date, 'YYYY-MM')) AS mes,
    fc.categoria,
    fc.subcategoria,
    SUM(fc.ingreso) AS total_ingreso,
    SUM(fc.egreso) AS total_egreso,
    SUM(fc.ingreso - fc.egreso) AS saldo_neto
FROM public.flujo_caja fc
JOIN public.ubicacion u ON u.id = fc.ubicacion_id
GROUP BY u.nombre, COALESCE(fc.mes_periodo, to_char(fc.fecha::date, 'YYYY-MM')), fc.categoria, fc.subcategoria;

COMMENT ON VIEW public.vw_tesoreria_general IS
    'Agregado mensual de flujo_caja por granja (ubicacion), período (YYYY-MM), categoría y subcategoría.';
