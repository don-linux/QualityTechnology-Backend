-- 2026-04-17: alinear lotes.observacion con el patrón de 3 capas (500 chars).
--
-- Antes:
--   lotes.observacion  text
-- Después:
--   lotes.observacion  varchar(500)

ALTER TABLE public.lotes
    ALTER COLUMN observacion TYPE character varying(500)
    USING substring(observacion FROM 1 FOR 500);
