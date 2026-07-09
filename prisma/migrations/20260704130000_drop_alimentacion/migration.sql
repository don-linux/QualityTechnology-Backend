-- Eliminar sub-módulo obsoleto Alimentación (bitácora)

DELETE FROM public.observacion
WHERE id IN (
  SELECT observacion_id FROM public.alimentacion WHERE observacion_id IS NOT NULL
);

DELETE FROM public.roles_modulos
WHERE modulo_id IN (SELECT id FROM public.modulos WHERE ruta = '/alimentacion');

DELETE FROM public.modulos WHERE ruta = '/alimentacion';

DROP TABLE IF EXISTS public.alimentacion CASCADE;
