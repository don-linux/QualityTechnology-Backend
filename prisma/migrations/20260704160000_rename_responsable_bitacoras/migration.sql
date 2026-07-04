-- Homogenizar campo responsable en bitácoras (preserva datos existentes)
ALTER TABLE "public"."control_limpieza" RENAME COLUMN "realizado_por" TO "responsable";
ALTER TABLE "public"."biometrias" RENAME COLUMN "encargado" TO "responsable";
ALTER TABLE "public"."limpieza_instalaciones" RENAME COLUMN "encargado" TO "responsable";
