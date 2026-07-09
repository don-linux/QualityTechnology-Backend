-- Renombrar módulo principal Operaciones → Bitacoras (menú y permisos por rol)

UPDATE public.modulos
SET nombre = 'Bitacoras',
    ruta = '/bitacoras'
WHERE nombre = 'Operaciones'
   OR ruta = '/operaciones';
