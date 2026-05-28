-- Eliminar columna redundante: la cantidad se deriva de machos + hembras.
ALTER TABLE "public"."reproductores" DROP COLUMN "cantidad_total";
