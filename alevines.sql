--
-- PostgreSQL database dump
--

\restrict x8Y2bzObi4btRmRBIk9MVghCioK4IWQ7cZj6jYMmaIUFPASefcU2nkwOOZe6XKL

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: catalogos; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA catalogos;


ALTER SCHEMA catalogos OWNER TO postgres;

--
-- Name: rrhh; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA rrhh;


ALTER SCHEMA rrhh OWNER TO postgres;

--
-- Name: seguridad; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA seguridad;


ALTER SCHEMA seguridad OWNER TO postgres;

--
-- Name: sp_limpiarpiletassininstalacion(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_limpiarpiletassininstalacion()
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_contador_piletas INT := 0;
    v_contador_alimentos INT := 0;
    v_contador_rastreabilidad INT := 0;
BEGIN
    -- Inicia la transacción manualmente
    PERFORM pg_advisory_xact_lock(99999);

    -- Eliminar dependencias de alimentos
    DELETE FROM alimentos
    WHERE fi_pileta_id IN (
        SELECT fi_pileta_id
        FROM piletas
        WHERE fi_instalacion_id IS NULL
    );

    GET DIAGNOSTICS v_contador_alimentos = ROW_COUNT;
    RAISE NOTICE 'Se eliminaron % registros en la tabla alimentos.', v_contador_alimentos;

    -- Eliminar dependencias en trazabilidad_alevinaje
    DELETE FROM trazabilidad_alevinaje
    WHERE fi_pileta_origen IN (
        SELECT fi_pileta_id FROM piletas WHERE fi_instalacion_id IS NULL
    )
    OR fi_pileta_destino IN (
        SELECT fi_pileta_id FROM piletas WHERE fi_instalacion_id IS NULL
    );

    GET DIAGNOSTICS v_contador_rastreabilidad = ROW_COUNT;
    RAISE NOTICE 'Se eliminaron % registros en trazabilidad_alevinaje.', v_contador_rastreabilidad;

    -- Finalmente eliminar las piletas huerfanas
    DELETE FROM piletas
    WHERE fi_instalacion_id IS NULL;

    GET DIAGNOSTICS v_contador_piletas = ROW_COUNT;
    RAISE NOTICE 'Se eliminaron % piletas sin instalacion.', v_contador_piletas;

    RAISE NOTICE 'Limpieza completada correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al limpiar piletas sin instalacion: %', SQLERRM;
END;
$BODY$
  LANGUAGE plpgsql;

-- ----------------------------
-- Function structure for unaccent
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent"(regdictionary, text);
CREATE FUNCTION "public"."unaccent"(regdictionary, text)
  RETURNS "pg_catalog"."text" AS '$libdir/unaccent', 'unaccent_dict'
  LANGUAGE c STABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for unaccent
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent"(text);
CREATE FUNCTION "public"."unaccent"(text)
  RETURNS "pg_catalog"."text" AS '$libdir/unaccent', 'unaccent_dict'
  LANGUAGE c STABLE STRICT
  COST 1;

-- ----------------------------
-- Function structure for unaccent_init
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent_init"(internal);
CREATE FUNCTION "public"."unaccent_init"(internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/unaccent', 'unaccent_init'
  LANGUAGE c VOLATILE
  COST 1;

-- ----------------------------
-- Function structure for unaccent_lexize
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."unaccent_lexize"(internal, internal, internal, internal);
CREATE FUNCTION "public"."unaccent_lexize"(internal, internal, internal, internal)
  RETURNS "pg_catalog"."internal" AS '$libdir/unaccent', 'unaccent_lexize'
  LANGUAGE c VOLATILE
  COST 1;

-- ----------------------------
-- View structure for vw_tesoreria_overview
-- ----------------------------
DROP VIEW IF EXISTS "public"."vw_tesoreria_overview";
CREATE VIEW "public"."vw_tesoreria_overview" AS  SELECT EXTRACT(year FROM f.fd_fecha) AS anio,
    to_char(f.fd_fecha::timestamp with time zone, 'YYYY-MM'::text) AS periodo,
    initcap(to_char(f.fd_fecha::timestamp with time zone, 'TMMonth'::text)) AS mes_nombre,
    upper(f.fc_granja::text) AS fc_granja,
    c.tipo_principal AS grupo,
    c.subcategoria AS subgrupo,
    c.nombre AS categoria,
    round(sum(f.fn_ingreso), 2) AS total_ingreso,
    round(sum(f.fn_egreso), 2) AS total_egreso,
    round(sum(f.fn_ingreso - f.fn_egreso), 2) AS saldo_neto
   FROM flujo_caja f
     LEFT JOIN categorias c ON f.categoria_id = c.id
  GROUP BY (EXTRACT(year FROM f.fd_fecha)), (to_char(f.fd_fecha::timestamp with time zone, 'YYYY-MM'::text)), (initcap(to_char(f.fd_fecha::timestamp with time zone, 'TMMonth'::text))), f.fc_granja, c.tipo_principal, c.subcategoria, c.nombre
  ORDER BY (EXTRACT(year FROM f.fd_fecha)), (to_char(f.fd_fecha::timestamp with time zone, 'YYYY-MM'::text)), c.tipo_principal, c.subcategoria, c.nombre;

-- ----------------------------
-- View structure for vw_tesoreria_general
-- ----------------------------
DROP VIEW IF EXISTS "public"."vw_tesoreria_general";
CREATE VIEW "public"."vw_tesoreria_general" AS  SELECT fc_granja,
    fc_mes,
    fc_categoria,
    sum(fn_ingreso) AS total_ingreso,
    sum(fn_egreso) AS total_egreso,
    sum(fn_ingreso - fn_egreso) AS saldo_neto
   FROM flujo_caja
  WHERE fn_ingreso IS NOT NULL OR fn_egreso IS NOT NULL
  GROUP BY fc_granja, fc_mes, fc_categoria
  ORDER BY fc_granja, fc_mes, fc_categoria;


-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."alimentos_fi_alimento_id_seq"
OWNED BY "public"."alimentos"."fi_alimento_id";
SELECT setval('"public"."alimentos_fi_alimento_id_seq"', 29, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."caja_ahorro_movimientos_id_seq"
OWNED BY "public"."caja_ahorro_movimientos"."id";
SELECT setval('"public"."caja_ahorro_movimientos_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."caja_ahorro_resumen_id_seq"
OWNED BY "public"."caja_ahorro_resumen"."id";
SELECT setval('"public"."caja_ahorro_resumen_id_seq"', 14, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."cat_caja_ahorro_categorias_id_seq"
OWNED BY "public"."cat_caja_ahorro_categorias"."id";
SELECT setval('"public"."cat_caja_ahorro_categorias_id_seq"', 12, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."cat_tesoreria_categorias_fi_categoria_id_seq"
OWNED BY "public"."cat_tesoreria_categorias"."fi_categoria_id";
SELECT setval('"public"."cat_tesoreria_categorias_fi_categoria_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."categorias_id_seq"
OWNED BY "public"."categorias"."id";
SELECT setval('"public"."categorias_id_seq"', 68, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ceiba_alimentacion_fi_id_seq"
OWNED BY "public"."alimentacion"."fi_id";
SELECT setval('"public"."ceiba_alimentacion_fi_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ceiba_biometrias_fi_id_seq"
OWNED BY "public"."biometrias"."fi_id";
SELECT setval('"public"."ceiba_biometrias_fi_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ceiba_insumos_fi_id_seq"
OWNED BY "public"."insumos"."fi_id";
SELECT setval('"public"."ceiba_insumos_fi_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ceiba_limpieza_fi_id_seq"
OWNED BY "public"."limpieza"."fi_id";
SELECT setval('"public"."ceiba_limpieza_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."clientes_fi_cliente_id_seq"
OWNED BY "public"."clientes"."fi_cliente_id";
SELECT setval('"public"."clientes_fi_cliente_id_seq"', 17, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."cuentas_id_seq"
OWNED BY "public"."cuentas"."id";
SELECT setval('"public"."cuentas_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."engorda_fi_engorda_id_seq"
OWNED BY "public"."engorda"."fi_engorda_id";
SELECT setval('"public"."engorda_fi_engorda_id_seq"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."equipos_fi_equipo_id_seq"
OWNED BY "public"."equipos"."fi_equipo_id";
SELECT setval('"public"."equipos_fi_equipo_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."expedientes_fi_expediente_id_seq"
OWNED BY "public"."expedientes"."fi_expediente_id";
SELECT setval('"public"."expedientes_fi_expediente_id_seq"', 13, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."flujo_caja_fi_movimiento_id_seq"
OWNED BY "public"."flujo_caja"."fi_movimiento_id";
SELECT setval('"public"."flujo_caja_fi_movimiento_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."instalaciones_fi_instalacion_id_seq"
OWNED BY "public"."instalaciones"."fi_instalacion_id";
SELECT setval('"public"."instalaciones_fi_instalacion_id_seq"', 100, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."lista_espera_fi_lista_id_seq"
OWNED BY "public"."lista_espera"."fi_lista_id";
SELECT setval('"public"."lista_espera_fi_lista_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."lote_movimientos_fi_mov_id_seq"
OWNED BY "public"."lote_movimientos"."fi_mov_id";
SELECT setval('"public"."lote_movimientos_fi_mov_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."lotes_fi_lote_id_seq"
OWNED BY "public"."lotes"."fi_lote_id";
SELECT setval('"public"."lotes_fi_lote_id_seq"', 21, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."mantenimientos_fi_mantenimiento_id_seq"
OWNED BY "public"."mantenimientos"."fi_mantenimiento_id";
SELECT setval('"public"."mantenimientos_fi_mantenimiento_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_banos_fi_id_seq"
OWNED BY "public"."banos"."fi_id";
SELECT setval('"public"."medellin_banos_fi_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_inventario_alevines_fi_id_seq"
OWNED BY "public"."inventario_alevines"."fi_id";
SELECT setval('"public"."medellin_inventario_alevines_fi_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_medicamentos_fi_id_seq"
OWNED BY "public"."medicamentos"."fi_id";
SELECT setval('"public"."medellin_medicamentos_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_parametros_fi_id_seq"
OWNED BY "public"."parametros"."fi_id";
SELECT setval('"public"."medellin_parametros_fi_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_plagas_fi_id_seq"
OWNED BY "public"."plagas"."fi_id";
SELECT setval('"public"."medellin_plagas_fi_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_recambios_fi_id_seq"
OWNED BY "public"."recambios"."fi_id";
SELECT setval('"public"."medellin_recambios_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_recepcion_insumos_fi_id_seq"
OWNED BY "public"."recepcion_insumos"."fi_id";
SELECT setval('"public"."medellin_recepcion_insumos_fi_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."medellin_visitas_fi_id_seq"
OWNED BY "public"."visitas"."fi_id";
SELECT setval('"public"."medellin_visitas_fi_id_seq"', 5, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."nomina_fi_nomina_id_seq"
OWNED BY "public"."nomina"."fi_nomina_id";
SELECT setval('"public"."nomina_fi_nomina_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."piletas_fi_pileta_id_seq"
OWNED BY "public"."piletas"."fi_pileta_id";
SELECT setval('"public"."piletas_fi_pileta_id_seq"', 102, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."proveedores_id_seq"
OWNED BY "public"."proveedores"."id";
SELECT setval('"public"."proveedores_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."rastreabilidad_engorda_fi_movimiento_id_seq"
OWNED BY "public"."trazabilidad_engorda"."fi_movimiento_id";
SELECT setval('"public"."rastreabilidad_engorda_fi_movimiento_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."rastreabilidad_fi_movimiento_id_seq"
OWNED BY "public"."trazabilidad_alevinaje"."fi_movimiento_id";
SELECT setval('"public"."rastreabilidad_fi_movimiento_id_seq"', 25, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."rastreabilidad_reproductores_fi_movimiento_id_seq"
OWNED BY "public"."trazabilidad_reproductores"."fi_movimiento_id";
SELECT setval('"public"."rastreabilidad_reproductores_fi_movimiento_id_seq"', 17, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."reproductores_fi_reproductor_id_seq"
OWNED BY "public"."reproductores"."fi_reproductor_id";
SELECT setval('"public"."reproductores_fi_reproductor_id_seq"', 36, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."roles_fi_rol_id_seq"
OWNED BY "public"."roles"."fi_rol_id";
SELECT setval('"public"."roles_fi_rol_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."usuarios_fi_usuario_id_seq"
OWNED BY "public"."usuarios"."fi_usuario_id";
SELECT setval('"public"."usuarios_fi_usuario_id_seq"', 4, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."vacaciones_fi_vacacion_id_seq"
OWNED BY "public"."vacaciones"."fi_vacacion_id";
SELECT setval('"public"."vacaciones_fi_vacacion_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."ventas_fi_venta_id_seq"
OWNED BY "public"."ventas"."fi_venta_id";
SELECT setval('"public"."ventas_fi_venta_id_seq"', 48, true);

-- ----------------------------
-- Primary Key structure for table alimentacion
-- ----------------------------
ALTER TABLE "public"."alimentacion" ADD CONSTRAINT "ceiba_alimentacion_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table alimentos
-- ----------------------------
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "alimentos_pkey" PRIMARY KEY ("fi_alimento_id");

-- ----------------------------
-- Primary Key structure for table banos
-- ----------------------------
ALTER TABLE "public"."banos" ADD CONSTRAINT "medellin_banos_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Checks structure for table biometrias
-- ----------------------------
ALTER TABLE "public"."biometrias" ADD CONSTRAINT "chk_biometrias_tipo_repro" CHECK (tipo::text = 'REPRODUCTORES'::text AND fi_reproductor_id IS NOT NULL OR tipo::text <> 'REPRODUCTORES'::text);

-- ----------------------------
-- Primary Key structure for table biometrias
-- ----------------------------
ALTER TABLE "public"."biometrias" ADD CONSTRAINT "ceiba_biometrias_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Checks structure for table caja_ahorro_movimientos
-- ----------------------------
ALTER TABLE "public"."caja_ahorro_movimientos" ADD CONSTRAINT "caja_ahorro_movimientos_tipo_movimiento_check" CHECK (tipo_movimiento::text = ANY (ARRAY['INGRESO'::character varying, 'EGRESO'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table caja_ahorro_movimientos
-- ----------------------------
ALTER TABLE "public"."caja_ahorro_movimientos" ADD CONSTRAINT "caja_ahorro_movimientos_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table caja_ahorro_resumen
-- ----------------------------
ALTER TABLE "public"."caja_ahorro_resumen" ADD CONSTRAINT "caja_ahorro_resumen_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Checks structure for table cat_caja_ahorro_categorias
-- ----------------------------
ALTER TABLE "public"."cat_caja_ahorro_categorias" ADD CONSTRAINT "cat_caja_ahorro_categorias_tipo_check" CHECK (tipo::text = ANY (ARRAY['INGRESO'::character varying, 'EGRESO'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table cat_caja_ahorro_categorias
-- ----------------------------
ALTER TABLE "public"."cat_caja_ahorro_categorias" ADD CONSTRAINT "cat_caja_ahorro_categorias_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table cat_tesoreria_categorias
-- ----------------------------
ALTER TABLE "public"."cat_tesoreria_categorias" ADD CONSTRAINT "cat_tesoreria_categorias_pkey" PRIMARY KEY ("fi_categoria_id");

-- ----------------------------
-- Primary Key structure for table categorias
-- ----------------------------
ALTER TABLE "public"."categorias" ADD CONSTRAINT "categorias_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Auto increment value for clientes
-- ----------------------------
SELECT setval('"public"."clientes_fi_cliente_id_seq"', 17, true);

-- ----------------------------
-- Primary Key structure for table clientes
-- ----------------------------
ALTER TABLE "public"."clientes" ADD CONSTRAINT "clientes_pkey" PRIMARY KEY ("fi_cliente_id");

-- ----------------------------
-- Primary Key structure for table cuentas
-- ----------------------------
ALTER TABLE "public"."cuentas" ADD CONSTRAINT "cuentas_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table engorda
-- ----------------------------
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_pkey" PRIMARY KEY ("fi_engorda_id");

-- ----------------------------
-- Primary Key structure for table equipos
-- ----------------------------
ALTER TABLE "public"."equipos" ADD CONSTRAINT "equipos_pkey" PRIMARY KEY ("fi_equipo_id");

-- ----------------------------
-- Indexes structure for table expedientes
-- ----------------------------
CREATE INDEX "idx_expedientes_nombre" ON "public"."expedientes" USING btree (
  "fc_nombre" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table expedientes
-- ----------------------------
ALTER TABLE "public"."expedientes" ADD CONSTRAINT "expedientes_pkey" PRIMARY KEY ("fi_expediente_id");

-- ----------------------------
-- Checks structure for table flujo_caja
-- ----------------------------
ALTER TABLE "public"."flujo_caja" ADD CONSTRAINT "flujo_caja_fc_estatus_check" CHECK (fc_estatus::text = ANY (ARRAY['REPOSICION'::character varying, 'LIQUIDADO'::character varying, 'ADEUDO'::character varying, 'PARCIAL'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table flujo_caja
-- ----------------------------
ALTER TABLE "public"."flujo_caja" ADD CONSTRAINT "flujo_caja_pkey" PRIMARY KEY ("fi_movimiento_id");

-- ----------------------------
-- Uniques structure for table instalaciones
-- ----------------------------
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_nombre_granja_unique" UNIQUE ("nombre_instalacion", "fc_granja");

-- ----------------------------
-- Checks structure for table instalaciones
-- ----------------------------
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_ancho_check" CHECK (ancho > 0::numeric);
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_altura_check" CHECK (altura > 0::numeric);
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_largo_check" CHECK (largo > 0::numeric);
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "chk_instalaciones_granja" CHECK (fc_granja::text = ANY (ARRAY['Granja Acuícola Medellin'::character varying, 'Granja Acuícola La Ceiba'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table instalaciones
-- ----------------------------
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_pkey" PRIMARY KEY ("fi_instalacion_id");

-- ----------------------------
-- Primary Key structure for table insumos
-- ----------------------------
ALTER TABLE "public"."insumos" ADD CONSTRAINT "ceiba_insumos_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table inventario_alevines
-- ----------------------------
ALTER TABLE "public"."inventario_alevines" ADD CONSTRAINT "medellin_inventario_alevines_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table limpieza
-- ----------------------------
ALTER TABLE "public"."limpieza" ADD CONSTRAINT "ceiba_limpieza_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table lista_espera
-- ----------------------------
ALTER TABLE "public"."lista_espera" ADD CONSTRAINT "lista_espera_pkey" PRIMARY KEY ("fi_lista_id");

-- ----------------------------
-- Checks structure for table lote_movimientos
-- ----------------------------
ALTER TABLE "public"."lote_movimientos" ADD CONSTRAINT "lote_movimientos_cantidad_check" CHECK (cantidad > 0);

-- ----------------------------
-- Primary Key structure for table lote_movimientos
-- ----------------------------
ALTER TABLE "public"."lote_movimientos" ADD CONSTRAINT "lote_movimientos_pkey" PRIMARY KEY ("fi_mov_id");

-- ----------------------------
-- Uniques structure for table lotes
-- ----------------------------
ALTER TABLE "public"."lotes" ADD CONSTRAINT "lotes_no_lote_key" UNIQUE ("no_lote");

-- ----------------------------
-- Primary Key structure for table lotes
-- ----------------------------
ALTER TABLE "public"."lotes" ADD CONSTRAINT "lotes_pkey" PRIMARY KEY ("fi_lote_id");

-- ----------------------------
-- Primary Key structure for table mantenimientos
-- ----------------------------
ALTER TABLE "public"."mantenimientos" ADD CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("fi_mantenimiento_id");

-- ----------------------------
-- Primary Key structure for table medicamentos
-- ----------------------------
ALTER TABLE "public"."medicamentos" ADD CONSTRAINT "medellin_medicamentos_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table nomina
-- ----------------------------
ALTER TABLE "public"."nomina" ADD CONSTRAINT "nomina_pkey" PRIMARY KEY ("fi_nomina_id");

-- ----------------------------
-- Primary Key structure for table parametros
-- ----------------------------
ALTER TABLE "public"."parametros" ADD CONSTRAINT "medellin_parametros_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Auto increment value for piletas
-- ----------------------------
SELECT setval('"public"."piletas_fi_pileta_id_seq"', 102, true);

-- ----------------------------
-- Checks structure for table piletas
-- ----------------------------
ALTER TABLE "public"."piletas" ADD CONSTRAINT "chk_piletas_granja" CHECK (fc_granja::text = ANY (ARRAY['Granja Acuícola Medellin'::character varying, 'Granja Acuícola La Ceiba'::character varying]::text[]));

-- ----------------------------
-- Primary Key structure for table piletas
-- ----------------------------
ALTER TABLE "public"."piletas" ADD CONSTRAINT "piletas_pkey" PRIMARY KEY ("fi_pileta_id");

-- ----------------------------
-- Primary Key structure for table plagas
-- ----------------------------
ALTER TABLE "public"."plagas" ADD CONSTRAINT "medellin_plagas_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table proveedores
-- ----------------------------
ALTER TABLE "public"."proveedores" ADD CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table recambios
-- ----------------------------
ALTER TABLE "public"."recambios" ADD CONSTRAINT "medellin_recambios_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table recepcion_insumos
-- ----------------------------
ALTER TABLE "public"."recepcion_insumos" ADD CONSTRAINT "medellin_recepcion_insumos_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Primary Key structure for table reproductores
-- ----------------------------
ALTER TABLE "public"."reproductores" ADD CONSTRAINT "reproductores_pkey" PRIMARY KEY ("fi_reproductor_id");

-- ----------------------------
-- Auto increment value for roles
-- ----------------------------
SELECT setval('"public"."roles_fi_rol_id_seq"', 2, true);

-- ----------------------------
-- Primary Key structure for table roles
-- ----------------------------
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("fi_rol_id");

-- ----------------------------
-- Primary Key structure for table trazabilidad_alevinaje
-- ----------------------------
ALTER TABLE "public"."trazabilidad_alevinaje" ADD CONSTRAINT "rastreabilidad_pkey" PRIMARY KEY ("fi_movimiento_id");

-- ----------------------------
-- Checks structure for table trazabilidad_engorda
-- ----------------------------
ALTER TABLE "public"."trazabilidad_engorda" ADD CONSTRAINT "rastreabilidad_engorda_cantidad_trasladada_check" CHECK (cantidad_trasladada::numeric > 0::numeric);

-- ----------------------------
-- Primary Key structure for table trazabilidad_engorda
-- ----------------------------
ALTER TABLE "public"."trazabilidad_engorda" ADD CONSTRAINT "rastreabilidad_engorda_pkey" PRIMARY KEY ("fi_movimiento_id");

-- ----------------------------
-- Checks structure for table trazabilidad_reproductores
-- ----------------------------
ALTER TABLE "public"."trazabilidad_reproductores" ADD CONSTRAINT "chk_origen_reproductores" CHECK (origen_texto IS NOT NULL OR fi_repro_origen IS NOT NULL);

-- ----------------------------
-- Primary Key structure for table trazabilidad_reproductores
-- ----------------------------
ALTER TABLE "public"."trazabilidad_reproductores" ADD CONSTRAINT "rastreabilidad_reproductores_pkey" PRIMARY KEY ("fi_movimiento_id");

-- ----------------------------
-- Auto increment value for usuarios
-- ----------------------------
SELECT setval('"public"."usuarios_fi_usuario_id_seq"', 4, true);

-- ----------------------------
-- Indexes structure for table usuarios
-- ----------------------------
CREATE INDEX "fki_fi_rol_id" ON "public"."usuarios" USING btree (
  "fi_rol_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_fc_nombre_key" UNIQUE ("fc_nombre");

-- ----------------------------
-- Primary Key structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("fi_usuario_id");

-- ----------------------------
-- Primary Key structure for table vacaciones
-- ----------------------------
ALTER TABLE "public"."vacaciones" ADD CONSTRAINT "vacaciones_pkey" PRIMARY KEY ("fi_vacacion_id");

-- ----------------------------
-- Primary Key structure for table ventas
-- ----------------------------
ALTER TABLE "public"."ventas" ADD CONSTRAINT "ventas_pkey" PRIMARY KEY ("fi_venta_id");

-- ----------------------------
-- Primary Key structure for table visitas
-- ----------------------------
ALTER TABLE "public"."visitas" ADD CONSTRAINT "medellin_visitas_pkey" PRIMARY KEY ("fi_id");

-- ----------------------------
-- Foreign Keys structure for table alimentos
-- ----------------------------
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "fk_alimentos_engorda" FOREIGN KEY ("fi_engorda_id") REFERENCES "public"."engorda" ("fi_engorda_id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "fk_pileta" FOREIGN KEY ("fi_pileta_id") REFERENCES "public"."piletas" ("fi_pileta_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "fk_reproductor" FOREIGN KEY ("fi_reproductor_id") REFERENCES "public"."reproductores" ("fi_reproductor_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."alimentos" ADD CONSTRAINT "fk_usuario_alimentos" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table biometrias
-- ----------------------------
ALTER TABLE "public"."biometrias" ADD CONSTRAINT "fk_biometrias_reproductores" FOREIGN KEY ("fi_reproductor_id") REFERENCES "public"."reproductores" ("fi_reproductor_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table caja_ahorro_movimientos
-- ----------------------------
ALTER TABLE "public"."caja_ahorro_movimientos" ADD CONSTRAINT "caja_ahorro_movimientos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "public"."cat_caja_ahorro_categorias" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table clientes
-- ----------------------------
ALTER TABLE "public"."clientes" ADD CONSTRAINT "fi_usuario_id" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table engorda
-- ----------------------------
ALTER TABLE "public"."engorda" ADD CONSTRAINT "engorda_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."engorda" ADD CONSTRAINT "fk_engorda_lote" FOREIGN KEY ("fi_lote_id") REFERENCES "public"."lotes" ("fi_lote_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table equipos
-- ----------------------------
ALTER TABLE "public"."equipos" ADD CONSTRAINT "equipos_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table instalaciones
-- ----------------------------
ALTER TABLE "public"."instalaciones" ADD CONSTRAINT "instalaciones_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table lote_movimientos
-- ----------------------------
ALTER TABLE "public"."lote_movimientos" ADD CONSTRAINT "lote_movimientos_fi_lote_id_fkey" FOREIGN KEY ("fi_lote_id") REFERENCES "public"."lotes" ("fi_lote_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table mantenimientos
-- ----------------------------
ALTER TABLE "public"."mantenimientos" ADD CONSTRAINT "mantenimientos_fi_equipo_id_fkey" FOREIGN KEY ("fi_equipo_id") REFERENCES "public"."equipos" ("fi_equipo_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table piletas
-- ----------------------------
ALTER TABLE "public"."piletas" ADD CONSTRAINT "piletas_fi_instalacion_id_fkey" FOREIGN KEY ("fi_instalacion_id") REFERENCES "public"."instalaciones" ("fi_instalacion_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table trazabilidad_alevinaje
-- ----------------------------
ALTER TABLE "public"."trazabilidad_alevinaje" ADD CONSTRAINT "fk_mov_lote" FOREIGN KEY ("fi_lote_id") REFERENCES "public"."lotes" ("fi_lote_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "public"."trazabilidad_alevinaje" ADD CONSTRAINT "rastreabilidad_fi_pileta_destino_fkey" FOREIGN KEY ("fi_pileta_destino") REFERENCES "public"."piletas" ("fi_pileta_id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."trazabilidad_alevinaje" ADD CONSTRAINT "rastreabilidad_fi_pileta_origen_fkey" FOREIGN KEY ("fi_pileta_origen") REFERENCES "public"."piletas" ("fi_pileta_id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."trazabilidad_alevinaje" ADD CONSTRAINT "rastreabilidad_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table trazabilidad_engorda
-- ----------------------------
ALTER TABLE "public"."trazabilidad_engorda" ADD CONSTRAINT "rastreabilidad_engorda_fi_engorda_destino_fkey" FOREIGN KEY ("fi_engorda_destino") REFERENCES "public"."engorda" ("fi_engorda_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."trazabilidad_engorda" ADD CONSTRAINT "rastreabilidad_engorda_fi_engorda_origen_fkey" FOREIGN KEY ("fi_engorda_origen") REFERENCES "public"."engorda" ("fi_engorda_id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."trazabilidad_engorda" ADD CONSTRAINT "rastreabilidad_engorda_fi_usuario_id_fkey" FOREIGN KEY ("fi_usuario_id") REFERENCES "public"."usuarios" ("fi_usuario_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table usuarios
-- ----------------------------
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "fi_rol_id" FOREIGN KEY ("fi_rol_id") REFERENCES "public"."roles" ("fi_rol_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE SCHEMA IF NOT EXISTS catalogos;

CREATE TABLE catalogos.estados (
  fi_estado_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fc_nombre VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO catalogos.estados (fc_nombre) VALUES
('Activo'),
('Inactivo'),
('Vacaciones'),
('Baja Temporal'),
('Baja Definitiva');

CREATE SCHEMA IF NOT EXISTS rrhh;

CREATE TABLE rrhh.departamentos (
  fi_departamento_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fc_nombre VARCHAR(80) UNIQUE NOT NULL,
  fb_activo BOOLEAN DEFAULT true
);

INSERT INTO rrhh.departamentos (fc_nombre) VALUES
('Recursos Humanos'),
('Finanzas'),
('Contabilidad'),
('Sistemas'),
('Tecnología'),
('Operaciones'),
('Logística'),
('Compras'),
('Ventas'),
('Marketing'),
('Atención al Cliente'),
('Producción'),
('Calidad'),
('Legal'),
('Dirección General');

CREATE TABLE rrhh.empleados (
  fi_empleado_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fi_usuario_id INT UNIQUE REFERENCES usuarios(fi_usuario_id) ON DELETE SET NULL,
  fi_departamento_id INT NOT NULL REFERENCES rrhh.departamentos(fi_departamento_id) ON DELETE RESTRICT,
  fi_estado_id INT NOT NULL REFERENCES catalogos.estados(fi_estado_id) ON DELETE RESTRICT,
  fc_ciudad VARCHAR(60) NOT NULL,
  fc_nombre VARCHAR(60) NOT NULL,
  fc_apellido_paterno VARCHAR(60) NOT NULL,
  fc_apellido_materno VARCHAR(60) NOT NULL,
  fd_fecha_nacimiento DATE NOT NULL,
  fc_calle VARCHAR(120) NOT NULL,
  fc_codigo_postal VARCHAR(10) NOT NULL,
  fc_referencias VARCHAR(255),
  ft_comentarios_adicionales TEXT,
  fd_fecha_alta DATE DEFAULT CURRENT_DATE
);

INSERT INTO rrhh.empleados (
  fi_usuario_id,
  fi_departamento_id,
  fi_estado_id,
  fc_ciudad,
  fc_nombre,
  fc_apellido_paterno,
  fc_apellido_materno,
  fd_fecha_nacimiento,
  fc_calle,
  fc_codigo_postal,
  fc_referencias,
  ft_comentarios_adicionales
)
VALUES (
  NULL,
  4,
  1,
  'Villahermosa',
  'Carlos',
  'Ramírez',
  'López',
  '1995-08-15',
  'Av. Universidad 123',
  '86000',
  'Casa color azul frente a parque',
  'Empleado operativo sin acceso al sistema'
);

CREATE SCHEMA IF NOT EXISTS seguridad;

CREATE TABLE seguridad.modulos (
  fi_modulo_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fc_nombre VARCHAR(50) UNIQUE NOT NULL,
  fc_ruta VARCHAR(100) UNIQUE NOT NULL,
  fb_activo BOOLEAN DEFAULT true
);

INSERT INTO seguridad.modulos (fc_nombre, fc_ruta) VALUES
('Operaciones', '/operaciones'),
('Inventarios', '/inventarios'),
('Ventas', '/ventas'),
('Finanzas', '/finanzas'),
('RRHH', '/rrhh'),
('Catálogos', '/catalogos'),
('Seguridad', '/seguridad');

CREATE TABLE seguridad.roles_modulos (
  fi_rol_id INT REFERENCES public.roles(fi_rol_id),
  fi_modulo_id INT REFERENCES seguridad.modulos(fi_modulo_id),
  PRIMARY KEY (fi_rol_id, fi_modulo_id)
);

-- ADMIN (1)
INSERT INTO seguridad.roles_modulos VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7);

-- Biologa - Ejemplo (2)
INSERT INTO seguridad.roles_modulos VALUES
(2,1),(2,2);

-- Jefe Empresa - Ejemplo (3)
INSERT INTO seguridad.roles_modulos VALUES
(3,4);

ALTER TABLE public.roles
ADD COLUMN fb_es_root BOOLEAN DEFAULT FALSE;

UPDATE public.roles
SET fb_es_root = true
WHERE fi_rol_id = 1;

CREATE UNIQUE INDEX unico_root
ON public.roles (fb_es_root)
WHERE fb_es_root = true;

-- Campo agregado para registrar ovadas en lotes
ALTER TABLE public.lotes
ADD COLUMN IF NOT EXISTS ovadas INTEGER DEFAULT 0;

-- Cambios de Carlos CRIP
ALTER TABLE trazabilidad_alevinaje
ADD COLUMN IF NOT EXISTS fi_instalacion_origen INTEGER;

ALTER TABLE trazabilidad_alevinaje
ADD COLUMN IF NOT EXISTS fi_instalacion_destino INTEGER;
