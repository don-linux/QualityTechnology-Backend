/*
 Navicat Premium Dump SQL

 Source Server         : PostgreSQL
 Source Server Type    : PostgreSQL
 Source Server Version : 160010 (160010)
 Source Host           : 127.0.0.1:5432
 Source Catalog        : quality
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160010 (160010)
 File Encoding         : 65001

 Date: 13/02/2026 01:37:53
*/


-- ----------------------------
-- Sequence structure for alimentos_fi_alimento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."alimentos_fi_alimento_id_seq";
CREATE SEQUENCE "public"."alimentos_fi_alimento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for caja_ahorro_movimientos_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."caja_ahorro_movimientos_id_seq";
CREATE SEQUENCE "public"."caja_ahorro_movimientos_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for caja_ahorro_resumen_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."caja_ahorro_resumen_id_seq";
CREATE SEQUENCE "public"."caja_ahorro_resumen_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for cat_caja_ahorro_categorias_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."cat_caja_ahorro_categorias_id_seq";
CREATE SEQUENCE "public"."cat_caja_ahorro_categorias_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for cat_tesoreria_categorias_fi_categoria_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."cat_tesoreria_categorias_fi_categoria_id_seq";
CREATE SEQUENCE "public"."cat_tesoreria_categorias_fi_categoria_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for categorias_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."categorias_id_seq";
CREATE SEQUENCE "public"."categorias_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ceiba_alimentacion_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ceiba_alimentacion_fi_id_seq";
CREATE SEQUENCE "public"."ceiba_alimentacion_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ceiba_biometrias_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ceiba_biometrias_fi_id_seq";
CREATE SEQUENCE "public"."ceiba_biometrias_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ceiba_insumos_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ceiba_insumos_fi_id_seq";
CREATE SEQUENCE "public"."ceiba_insumos_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ceiba_limpieza_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ceiba_limpieza_fi_id_seq";
CREATE SEQUENCE "public"."ceiba_limpieza_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for clientes_fi_cliente_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."clientes_fi_cliente_id_seq";
CREATE SEQUENCE "public"."clientes_fi_cliente_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for cuentas_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."cuentas_id_seq";
CREATE SEQUENCE "public"."cuentas_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for engorda_fi_engorda_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."engorda_fi_engorda_id_seq";
CREATE SEQUENCE "public"."engorda_fi_engorda_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for equipos_fi_equipo_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."equipos_fi_equipo_id_seq";
CREATE SEQUENCE "public"."equipos_fi_equipo_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for expedientes_fi_expediente_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."expedientes_fi_expediente_id_seq";
CREATE SEQUENCE "public"."expedientes_fi_expediente_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for flujo_caja_fi_movimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."flujo_caja_fi_movimiento_id_seq";
CREATE SEQUENCE "public"."flujo_caja_fi_movimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for instalaciones_fi_instalacion_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."instalaciones_fi_instalacion_id_seq";
CREATE SEQUENCE "public"."instalaciones_fi_instalacion_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for lista_espera_fi_lista_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."lista_espera_fi_lista_id_seq";
CREATE SEQUENCE "public"."lista_espera_fi_lista_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for lote_movimientos_fi_mov_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."lote_movimientos_fi_mov_id_seq";
CREATE SEQUENCE "public"."lote_movimientos_fi_mov_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for lotes_fi_lote_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."lotes_fi_lote_id_seq";
CREATE SEQUENCE "public"."lotes_fi_lote_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for mantenimientos_fi_mantenimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."mantenimientos_fi_mantenimiento_id_seq";
CREATE SEQUENCE "public"."mantenimientos_fi_mantenimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_banos_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_banos_fi_id_seq";
CREATE SEQUENCE "public"."medellin_banos_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_inventario_alevines_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_inventario_alevines_fi_id_seq";
CREATE SEQUENCE "public"."medellin_inventario_alevines_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_medicamentos_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_medicamentos_fi_id_seq";
CREATE SEQUENCE "public"."medellin_medicamentos_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_parametros_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_parametros_fi_id_seq";
CREATE SEQUENCE "public"."medellin_parametros_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_plagas_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_plagas_fi_id_seq";
CREATE SEQUENCE "public"."medellin_plagas_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_recambios_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_recambios_fi_id_seq";
CREATE SEQUENCE "public"."medellin_recambios_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_recepcion_insumos_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_recepcion_insumos_fi_id_seq";
CREATE SEQUENCE "public"."medellin_recepcion_insumos_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for medellin_visitas_fi_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."medellin_visitas_fi_id_seq";
CREATE SEQUENCE "public"."medellin_visitas_fi_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for nomina_fi_nomina_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."nomina_fi_nomina_id_seq";
CREATE SEQUENCE "public"."nomina_fi_nomina_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for piletas_fi_pileta_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."piletas_fi_pileta_id_seq";
CREATE SEQUENCE "public"."piletas_fi_pileta_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for proveedores_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."proveedores_id_seq";
CREATE SEQUENCE "public"."proveedores_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for rastreabilidad_engorda_fi_movimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."rastreabilidad_engorda_fi_movimiento_id_seq";
CREATE SEQUENCE "public"."rastreabilidad_engorda_fi_movimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for rastreabilidad_fi_movimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."rastreabilidad_fi_movimiento_id_seq";
CREATE SEQUENCE "public"."rastreabilidad_fi_movimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for rastreabilidad_reproductores_fi_movimiento_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."rastreabilidad_reproductores_fi_movimiento_id_seq";
CREATE SEQUENCE "public"."rastreabilidad_reproductores_fi_movimiento_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for reproductores_fi_reproductor_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."reproductores_fi_reproductor_id_seq";
CREATE SEQUENCE "public"."reproductores_fi_reproductor_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for roles_fi_rol_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."roles_fi_rol_id_seq";
CREATE SEQUENCE "public"."roles_fi_rol_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for usuarios_fi_usuario_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."usuarios_fi_usuario_id_seq";
CREATE SEQUENCE "public"."usuarios_fi_usuario_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for vacaciones_fi_vacacion_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."vacaciones_fi_vacacion_id_seq";
CREATE SEQUENCE "public"."vacaciones_fi_vacacion_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for ventas_fi_venta_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."ventas_fi_venta_id_seq";
CREATE SEQUENCE "public"."ventas_fi_venta_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;

-- ----------------------------
-- Table structure for alimentacion
-- ----------------------------
DROP TABLE IF EXISTS "public"."alimentacion";
CREATE TABLE "public"."alimentacion" (
  "fi_id" int4 NOT NULL DEFAULT nextval('ceiba_alimentacion_fi_id_seq'::regclass),
  "fc_mes" varchar(20) COLLATE "pg_catalog"."default",
  "fn_num_instalacion" int4,
  "fn_peso_promedio_entrada" numeric,
  "fd_fecha_siembra" date,
  "fc_origen_alevines" varchar(200) COLLATE "pg_catalog"."default",
  "fd_fecha" date,
  "fn_total_alimento_kg" numeric,
  "fn_mortalidad" int4,
  "fc_recambio_agua" varchar(50) COLLATE "pg_catalog"."default",
  "fn_temp_agua" numeric,
  "fn_amonio" numeric,
  "fn_ph" numeric,
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of alimentacion
-- ----------------------------

-- ----------------------------
-- Table structure for alimentos
-- ----------------------------
DROP TABLE IF EXISTS "public"."alimentos";
CREATE TABLE "public"."alimentos" (
  "fi_alimento_id" int4 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "fi_reproductor_id" int4,
  "fi_pileta_id" int4,
  "fi_usuario_id" int4,
  "particula_mm" numeric(10,2),
  "alimento_dia" numeric(10,3),
  "porcion" numeric(10,3),
  "gasto_alimento" numeric(12,2),
  "fi_engorda_id" int4
)
;

-- ----------------------------
-- Records of alimentos
-- ----------------------------

-- ----------------------------
-- Table structure for banos
-- ----------------------------
DROP TABLE IF EXISTS "public"."banos";
CREATE TABLE "public"."banos" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_banos_fi_id_seq'::regclass),
  "fc_mes" varchar(20) COLLATE "pg_catalog"."default",
  "fc_dia" varchar(20) COLLATE "pg_catalog"."default",
  "fc_banio_hombres" varchar(100) COLLATE "pg_catalog"."default",
  "fc_banio_mujeres" varchar(100) COLLATE "pg_catalog"."default",
  "fc_regadera" varchar(100) COLLATE "pg_catalog"."default",
  "fc_realizo" varchar(100) COLLATE "pg_catalog"."default",
  "fc_firma" varchar(100) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of banos
-- ----------------------------

-- ----------------------------
-- Table structure for biometrias
-- ----------------------------
DROP TABLE IF EXISTS "public"."biometrias";
CREATE TABLE "public"."biometrias" (
  "fi_id" int4 NOT NULL DEFAULT nextval('ceiba_biometrias_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fn_peso_total_gramos" numeric,
  "fn_organismos_muestreados" int4,
  "fn_peso_promedio" numeric,
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_encargado" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "fi_instalacion_id" int4,
  "tipo" varchar(20) COLLATE "pg_catalog"."default",
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default",
  "fi_reproductor_id" int4
)
;

-- ----------------------------
-- Records of biometrias
-- ----------------------------

-- ----------------------------
-- Table structure for caja_ahorro_movimientos
-- ----------------------------
DROP TABLE IF EXISTS "public"."caja_ahorro_movimientos";
CREATE TABLE "public"."caja_ahorro_movimientos" (
  "id" int4 NOT NULL DEFAULT nextval('caja_ahorro_movimientos_id_seq'::regclass),
  "categoria_id" int4,
  "fecha" date DEFAULT CURRENT_DATE,
  "tipo_movimiento" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 'EGRESO'::character varying,
  "monto" numeric(12,2) DEFAULT 0.00,
  "descripcion" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of caja_ahorro_movimientos
-- ----------------------------

-- ----------------------------
-- Table structure for caja_ahorro_resumen
-- ----------------------------
DROP TABLE IF EXISTS "public"."caja_ahorro_resumen";
CREATE TABLE "public"."caja_ahorro_resumen" (
  "id" int4 NOT NULL DEFAULT nextval('caja_ahorro_resumen_id_seq'::regclass),
  "categoria" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "enero" numeric(12,2) DEFAULT 0,
  "febrero" numeric(12,2) DEFAULT 0,
  "marzo" numeric(12,2) DEFAULT 0,
  "abril" numeric(12,2) DEFAULT 0,
  "mayo" numeric(12,2) DEFAULT 0,
  "junio" numeric(12,2) DEFAULT 0,
  "julio" numeric(12,2) DEFAULT 0,
  "agosto" numeric(12,2) DEFAULT 0,
  "septiembre" numeric(12,2) DEFAULT 0,
  "octubre" numeric(12,2) DEFAULT 0,
  "noviembre" numeric(12,2) DEFAULT 0,
  "diciembre" numeric(12,2) DEFAULT 0,
  "total" numeric(12,2) GENERATED ALWAYS AS (
(((((((((((COALESCE(enero, (0)::numeric) + COALESCE(febrero, (0)::numeric)) + COALESCE(marzo, (0)::numeric)) + COALESCE(abril, (0)::numeric)) + COALESCE(mayo, (0)::numeric)) + COALESCE(junio, (0)::numeric)) + COALESCE(julio, (0)::numeric)) + COALESCE(agosto, (0)::numeric)) + COALESCE(septiembre, (0)::numeric)) + COALESCE(octubre, (0)::numeric)) + COALESCE(noviembre, (0)::numeric)) + COALESCE(diciembre, (0)::numeric))
) STORED,
  "actualizado" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "granja" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'Ceiba'::character varying
)
;

-- ----------------------------
-- Records of caja_ahorro_resumen
-- ----------------------------
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (3, 'Caja de Ahorro', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (4, 'Seguro Social', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (5, 'INFONAVIT', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (6, '2.5% Sobre Nómina', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (7, 'Capacitación', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (8, 'Viáticos', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (9, 'Incentivos/Bonos', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (10, 'EPP/Uniformes', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (11, 'Liquidaciones', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (12, 'Otro RRHH', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (14, 'Prestamos y Nomina', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:47:46.168501', 'Medellín');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (1, 'Sueldos y Salarios', 500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (13, 'Sueldos y salarios', 2500.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:47:29.154625', 'Medellín');
INSERT INTO "public"."caja_ahorro_resumen" ("id", "categoria", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre", "actualizado", "granja") VALUES (2, 'Préstamos de Nómina', 400.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-12-15 14:25:19.410587', 'Ceiba');

-- ----------------------------
-- Table structure for cat_caja_ahorro_categorias
-- ----------------------------
DROP TABLE IF EXISTS "public"."cat_caja_ahorro_categorias";
CREATE TABLE "public"."cat_caja_ahorro_categorias" (
  "id" int4 NOT NULL DEFAULT nextval('cat_caja_ahorro_categorias_id_seq'::regclass),
  "nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo" varchar(10) COLLATE "pg_catalog"."default" DEFAULT 'EGRESO'::character varying,
  "activo" bool DEFAULT true
)
;

-- ----------------------------
-- Records of cat_caja_ahorro_categorias
-- ----------------------------
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (1, 'Sueldos y Salarios', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (2, 'Préstamos de Nómina', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (3, 'Caja de Ahorro', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (4, 'Seguro Social', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (5, 'INFONAVIT', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (6, '2.5% Sobre Nómina', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (7, 'Capacitación', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (8, 'Viáticos', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (9, 'Incentivos/Bonos', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (10, 'EPP/Uniformes', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (11, 'Liquidaciones', 'EGRESO', 't');
INSERT INTO "public"."cat_caja_ahorro_categorias" VALUES (12, 'Otro RRHH', 'EGRESO', 't');

-- ----------------------------
-- Table structure for cat_tesoreria_categorias
-- ----------------------------
DROP TABLE IF EXISTS "public"."cat_tesoreria_categorias";
CREATE TABLE "public"."cat_tesoreria_categorias" (
  "fi_categoria_id" int4 NOT NULL DEFAULT nextval('cat_tesoreria_categorias_fi_categoria_id_seq'::regclass),
  "fc_nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_grupo" varchar(100) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of cat_tesoreria_categorias
-- ----------------------------

-- ----------------------------
-- Table structure for categorias
-- ----------------------------
DROP TABLE IF EXISTS "public"."categorias";
CREATE TABLE "public"."categorias" (
  "id" int4 NOT NULL DEFAULT nextval('categorias_id_seq'::regclass),
  "nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "tipo_principal" varchar(30) COLLATE "pg_catalog"."default",
  "subcategoria" varchar(50) COLLATE "pg_catalog"."default",
  "descripcion" text COLLATE "pg_catalog"."default",
  "fc_empresa" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'ALL'::character varying
)
;

-- ----------------------------
-- Records of categorias
-- ----------------------------
INSERT INTO "public"."categorias" VALUES (1, 'Venta de Alevines', 'INGRESOS', 'Venta de Alevines', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (2, 'Venta de Mojarras (Kg)', 'INGRESOS', 'Venta de Mojarras (Kg)', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (3, 'Venta de Alimento', 'INGRESOS', 'Venta de Alimento', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (4, 'Venta Medicamentos/Vitaminas', 'INGRESOS', 'Venta Medicamentos/Vitaminas', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (5, 'Servicios de Gestión', 'INGRESOS', 'Servicios de Gestión', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (6, 'Ingresos por Intereses', 'INGRESOS', 'Ingresos por Intereses', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (7, 'Reembolsos', 'INGRESOS', 'Reembolsos', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (8, 'Comisiones', 'INGRESOS', 'Comisiones', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (9, 'Fondeo Externo y Pasivos', 'INGRESOS', 'Fondeo Externo y Pasivos', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (10, 'Miscelaneo', 'INGRESOS', 'Miscelaneo', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (11, 'Fondo Líquido', 'CAPITAL', 'Fondo Líquido', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (12, 'Capital en Caja de Ahorro', 'CAPITAL', 'Capital en Caja de Ahorro', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (13, 'Intereses Caja de Ahorro', 'CAPITAL', 'Intereses Caja de Ahorro', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (14, 'Cuentas por Cobrar', 'CAPITAL', 'Cuentas por Cobrar', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (15, 'Otro', 'CAPITAL', 'Otro', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (16, 'Sueldos y Salarios', 'RECURSOS HUMANOS', 'Sueldos y Salarios', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (17, 'Aguinaldo', 'RECURSOS HUMANOS', 'Aguinaldo', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (18, 'Préstamos de Nómina', 'RECURSOS HUMANOS', 'Préstamos de Nómina', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (19, 'Caja de Ahorro', 'RECURSOS HUMANOS', 'Caja de Ahorro', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (20, 'Seguro Social', 'RECURSOS HUMANOS', 'Seguro Social', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (21, 'Gastos Médicos', 'RECURSOS HUMANOS', 'Gastos Médicos', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (22, 'ISR', 'RECURSOS HUMANOS', 'ISR', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (23, 'INFONAVIT', 'RECURSOS HUMANOS', 'INFONAVIT', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (24, '2.5% Sobre Nómina', 'RECURSOS HUMANOS', '2.5% Sobre Nómina', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (25, 'Vacaciones No Disfrutadas', 'RECURSOS HUMANOS', 'Vacaciones No Disfrutadas', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (26, 'Prima Vacacional', 'RECURSOS HUMANOS', 'Prima Vacacional', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (27, 'Capacitación', 'RECURSOS HUMANOS', 'Capacitación', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (28, 'Viáticos', 'RECURSOS HUMANOS', 'Viáticos', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (29, 'Incentivos/Bonos', 'RECURSOS HUMANOS', 'Incentivos/Bonos', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (30, 'EPP/Uniformes', 'RECURSOS HUMANOS', 'EPP/Uniformes', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (31, 'Liquidaciones', 'RECURSOS HUMANOS', 'Liquidaciones', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (32, 'Otro RRHH', 'RECURSOS HUMANOS', 'Otro RRHH', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (33, 'Pagos de Automóviles', 'LOGÍSTICA', 'Pagos de Automóviles', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (34, 'Seguro de Auto', 'LOGÍSTICA', 'Seguro de Auto', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (35, 'Casetas/Peajes', 'LOGÍSTICA', 'Casetas/Peajes', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (36, 'Impuestos y Referendos', 'LOGÍSTICA', 'Impuestos y Referendos', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (37, 'Combustible', 'LOGÍSTICA', 'Combustible', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (38, 'Transporte Público', 'LOGÍSTICA', 'Transporte Público', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (39, 'Reparaciones y Mantenimiento', 'LOGÍSTICA', 'Reparaciones y Mantenimiento', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (40, 'Registros y Licencias', 'LOGÍSTICA', 'Registros y Licencias', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (41, 'Otro', 'LOGÍSTICA', 'Otro', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (42, 'Internet y Telefonico', 'SERVICIOS', 'Internet y Telefonico', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (43, 'Electricidad CFE', 'SERVICIOS', 'Electricidad CFE', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (44, 'Limpieza', 'SERVICIOS', 'Limpieza', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (45, 'Comisiones Bancarias', 'SERVICIOS', 'Comisiones Bancarias', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (46, 'Certificaciones', 'SERVICIOS', 'Certificaciones', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (47, 'Marketing', 'SERVICIOS', 'Marketing', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (48, 'Otros Servicios', 'SERVICIOS', 'Otros Servicios', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (49, 'Compra de Alevines', 'RECURSOS MATERIALES', 'Compra de Alevines', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (50, 'Compra de Alimento', 'RECURSOS MATERIALES', 'Compra de Alimento', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (51, 'Compra de Alimento Engorda', 'RECURSOS MATERIALES', 'Compra de Alimento Engorda', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (52, 'Compra de Medicamentos', 'RECURSOS MATERIALES', 'Compra de Medicamentos', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (53, 'Compra Reproductores', 'RECURSOS MATERIALES', 'Compra Reproductores', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (54, 'Compra Artículos Probióticos/Bacterias', 'RECURSOS MATERIALES', 'Compra Artículos Probióticos/Bacterias', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (55, 'Compra Artículos Para Venta', 'RECURSOS MATERIALES', 'Compra Artículos Para Venta', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (56, 'Compra Artículos Limpieza', 'RECURSOS MATERIALES', 'Compra Artículos Limpieza', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (57, 'Material Construcción Interno', 'RECURSOS MATERIALES', 'Material Construcción Interno', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (58, 'Artículos Infraestructura Interna', 'RECURSOS MATERIALES', 'Artículos Infraestructura Interna', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (59, 'Artículos de Mantenimiento', 'RECURSOS MATERIALES', 'Artículos de Mantenimiento', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (60, 'Pintura Barniz', 'RECURSOS MATERIALES', 'Pintura Barniz', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (61, 'Servicios Profesionales', 'RECURSOS MATERIALES', 'Servicios Profesionales', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (62, 'Hardware Tecnología', 'RECURSOS MATERIALES', 'Hardware Tecnología', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (63, 'Seguridad', 'RECURSOS MATERIALES', 'Seguridad', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (64, 'Mano de Obra', 'RECURSOS MATERIALES', 'Mano de Obra', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (65, 'Renta Instalaciones', 'INSTALACIONES', 'Renta Instalaciones', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (66, 'Depósito Garantía', 'INSTALACIONES', 'Depósito Garantía', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (67, 'Préstamo Capital', 'AJUSTE DE CAPITALES', 'Préstamo Capital', NULL, 'TODAS');
INSERT INTO "public"."categorias" VALUES (68, 'Devolución de Préstamos', 'AJUSTE DE CAPITALES', 'Devolución de Préstamos', NULL, 'TODAS');

-- ----------------------------
-- Table structure for clientes
-- ----------------------------
DROP TABLE IF EXISTS "public"."clientes";
CREATE TABLE "public"."clientes" (
  "fi_cliente_id" int4 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "fc_nombre" varchar(100) COLLATE "pg_catalog"."default",
  "fc_telefono" varchar(20) COLLATE "pg_catalog"."default",
  "fc_correo" varchar(255) COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4 NOT NULL,
  "fd_fecha_registro" date NOT NULL,
  "fd_fecha_modificacion" date NOT NULL,
  "fc_cp" char(5) COLLATE "pg_catalog"."default",
  "fc_localidad" varchar(100) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of clientes
-- ----------------------------
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (12, 'MIGUEL PEREZ', NULL, NULL, 1, '2026-02-07', '2026-02-07', NULL, 'CUNDUACAN');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (13, 'RICARDO BASURTO ZAPATA', NULL, NULL, 1, '2026-02-07', '2026-02-07', NULL, 'PIE DE GRANJA');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (14, 'BIOLOGO JORDAN', NULL, NULL, 1, '2026-02-07', '2026-02-07', NULL, 'CATAZAJA');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (15, 'LUIS ALFREDO MIGUEL', NULL, NULL, 1, '2026-02-07', '2026-02-07', NULL, 'ESCARCEGA');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (16, 'ARTEMIO MORENO', NULL, NULL, 1, '2026-02-07', '2026-02-07', NULL, 'CENTRO');
INSERT INTO "public"."clientes" OVERRIDING SYSTEM VALUE VALUES (17, 'GRANJA EL AMANECER', NULL, NULL, 1, '2026-02-07', '2026-02-07', NULL, 'PIE DE GRANJA');

-- ----------------------------
-- Table structure for cuentas
-- ----------------------------
DROP TABLE IF EXISTS "public"."cuentas";
CREATE TABLE "public"."cuentas" (
  "id" int4 NOT NULL DEFAULT nextval('cuentas_id_seq'::regclass),
  "nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "saldo" numeric(12,2) DEFAULT 0,
  "tipo" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'CUENTA CORRIENTE'::character varying,
  "fd_fecha_registro" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of cuentas
-- ----------------------------
INSERT INTO "public"."cuentas" VALUES (2, 'Cheques BBVA GAC', 35000.00, 'CUENTA CORRIENTE', '2026-02-04 17:23:36.526311');
INSERT INTO "public"."cuentas" VALUES (1, 'Cheques BBVA GAM', 50000.00, 'CUENTA CORRIENTE', '2026-02-04 17:23:36.526311');
INSERT INTO "public"."cuentas" VALUES (3, 'Efectivo', 7500.00, 'CUENTA CORRIENTE', '2026-02-04 17:23:36.526311');

-- ----------------------------
-- Table structure for engorda
-- ----------------------------
DROP TABLE IF EXISTS "public"."engorda";
CREATE TABLE "public"."engorda" (
  "fi_engorda_id" int4 NOT NULL DEFAULT nextval('engorda_fi_engorda_id_seq'::regclass),
  "fi_instalacion_id" int4 NOT NULL,
  "cantidad" int4 NOT NULL,
  "talla_gr" numeric(10,2),
  "observacion" text COLLATE "pg_catalog"."default",
  "fecha_siembra" date,
  "fecha_biometria" date,
  "fecha_registro" date DEFAULT CURRENT_DATE,
  "fi_usuario_id" int4,
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default",
  "fi_lote_id" int4,
  "origen_instalacion" int4,
  "fd_fecha_modificacion" date
)
;

-- ----------------------------
-- Records of engorda
-- ----------------------------

-- ----------------------------
-- Table structure for equipos
-- ----------------------------
DROP TABLE IF EXISTS "public"."equipos";
CREATE TABLE "public"."equipos" (
  "fi_equipo_id" int4 NOT NULL DEFAULT nextval('equipos_fi_equipo_id_seq'::regclass),
  "fc_nombre" varchar(150) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_marca" varchar(100) COLLATE "pg_catalog"."default",
  "fc_modelo" varchar(100) COLLATE "pg_catalog"."default",
  "fc_tipo" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_compra" date,
  "fn_costo" numeric(12,2),
  "fc_estado" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'Operativo'::character varying,
  "fc_ubicacion" varchar(150) COLLATE "pg_catalog"."default",
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fd_proximo_mantenimiento" date,
  "fc_notas" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4
)
;

-- ----------------------------
-- Records of equipos
-- ----------------------------

-- ----------------------------
-- Table structure for expedientes
-- ----------------------------
DROP TABLE IF EXISTS "public"."expedientes";
CREATE TABLE "public"."expedientes" (
  "fi_expediente_id" int4 NOT NULL DEFAULT nextval('expedientes_fi_expediente_id_seq'::regclass),
  "fc_nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_id_empleado" varchar(50) COLLATE "pg_catalog"."default",
  "fn_uniformes" int4 DEFAULT 0,
  "fc_credencial" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_fotografia" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_acta_nacimiento" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_ine" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_licencia_conducir" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_comprobante_domicilio" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_rfc" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_curp" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_comprobante_estudios" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_cv" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_carta_recomendacion" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_acuerdo_confidencialidad" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_codigo_etica" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_codigo_conducta" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fc_solicitud_empleo" varchar(15) COLLATE "pg_catalog"."default" DEFAULT 'NO'::character varying,
  "fd_fecha_actualizacion" date DEFAULT CURRENT_DATE,
  "fi_usuario_id" int4,
  "fc_puesto" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of expedientes
-- ----------------------------
INSERT INTO "public"."expedientes" VALUES (4, 'Juan Carlos Jimenez Ara', '10101011', 4, 'NO', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'SI', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', 1, 'Direccion');
INSERT INTO "public"."expedientes" VALUES (5, 'Agustín Montejo Coronel', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'GAC');
INSERT INTO "public"."expedientes" VALUES (6, 'Derki Alexis Chable Pascual', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'GAM');
INSERT INTO "public"."expedientes" VALUES (7, 'Jose Alfredo Acosta Farias', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'GAM');
INSERT INTO "public"."expedientes" VALUES (8, 'Jose Daniel Álvarez de la O', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'GAC');
INSERT INTO "public"."expedientes" VALUES (9, 'Manlio Flavio Aguilar', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'CQT');
INSERT INTO "public"."expedientes" VALUES (10, 'Patricio Valentino Acosta Perez', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'CAM');
INSERT INTO "public"."expedientes" VALUES (11, 'Francisco Javier Álvarez de la O', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'GAC');
INSERT INTO "public"."expedientes" VALUES (12, 'Yara Odilia Marquez Rivera', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'General');
INSERT INTO "public"."expedientes" VALUES (13, 'Selene Rivera Alcazar', '', 0, 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', 'NO', '2026-02-07', NULL, 'General');
INSERT INTO "public"."expedientes" VALUES (1, 'Juan Carlos Jimenez Morales', '10101010', 5, 'NO', 'SI', 'NO', 'SI', 'SI', 'NO', 'SI', 'SI', 'NO', 'NO', 'NO', 'NO', 'SI', 'SUSTITUIR', 'NO', '2026-02-07', 1, 'Direccion');

-- ----------------------------
-- Table structure for flujo_caja
-- ----------------------------
DROP TABLE IF EXISTS "public"."flujo_caja";
CREATE TABLE "public"."flujo_caja" (
  "fi_movimiento_id" int4 NOT NULL DEFAULT nextval('flujo_caja_fi_movimiento_id_seq'::regclass),
  "fc_granja" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "fd_fecha" date NOT NULL,
  "fn_ingreso" numeric(12,2) DEFAULT 0,
  "fn_egreso" numeric(12,2) DEFAULT 0,
  "fc_descripcion" varchar(200) COLLATE "pg_catalog"."default",
  "fc_cuenta" varchar(50) COLLATE "pg_catalog"."default",
  "fc_categoria" varchar(100) COLLATE "pg_catalog"."default",
  "fc_subcategoria" varchar(100) COLLATE "pg_catalog"."default",
  "fc_factura" varchar(50) COLLATE "pg_catalog"."default",
  "fc_estatus" varchar(20) COLLATE "pg_catalog"."default",
  "fc_mes" varchar(7) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "categoria_id" int4,
  "fc_beneficiario" varchar(100) COLLATE "pg_catalog"."default",
  "fc_noproyecto" varchar(50) COLLATE "pg_catalog"."default",
  "fc_equilibrar" numeric(12,2)
)
;

-- ----------------------------
-- Records of flujo_caja
-- ----------------------------

-- ----------------------------
-- Table structure for instalaciones
-- ----------------------------
DROP TABLE IF EXISTS "public"."instalaciones";
CREATE TABLE "public"."instalaciones" (
  "fi_instalacion_id" int4 NOT NULL DEFAULT nextval('instalaciones_fi_instalacion_id_seq'::regclass),
  "nombre_instalacion" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "largo" numeric(10,2) NOT NULL,
  "ancho" numeric(10,2) NOT NULL,
  "altura" numeric(10,2) NOT NULL,
  "material" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "metros_cubicos" numeric(10,2) GENERATED ALWAYS AS (
((largo * ancho) * altura)
) STORED,
  "fi_usuario_id" int4,
  "fecha_registro" date DEFAULT CURRENT_DATE,
  "fd_fecha_modificacion" date,
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default",
  "tipo_instalacion" varchar(50) COLLATE "pg_catalog"."default",
  "estado" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'vacia'::character varying
)
;

-- ----------------------------
-- Records of instalaciones
-- ----------------------------
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (99, 'REPRO-03', 5.80, 4.00, 1.20, 'Concreto', NULL, '2026-02-08', NULL, 'Granja Acuícola Medellin', 'Reproductores', 'vacia');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (97, 'REPRO-01', 5.80, 4.00, 1.20, 'Concreto', NULL, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'Reproductores', 'vacia');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (42, 'R-01', 6.00, 3.00, 1.20, 'Concreto', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (43, 'R-02', 6.00, 3.00, 1.20, 'Concreto', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (44, 'R-03', 6.00, 3.00, 1.20, 'Concreto', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (31, 'Estanque 1', 100.00, 28.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ENGORDA', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (32, 'Estanque 2', 100.00, 25.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ENGORDA', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (33, 'Estanque 3', 100.00, 25.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ENGORDA', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (34, 'Estanque 4', 100.00, 25.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ENGORDA', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (35, 'Estanque 5', 100.00, 30.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ENGORDA', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (36, 'Estanque 6', 100.00, 30.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ENGORDA', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (37, 'Estanque 7', 100.00, 30.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ENGORDA', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (38, 'Estanque Chico 1', 45.00, 17.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (39, 'Estanque Chico 2', 45.00, 16.00, 2.50, 'Tierra', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (40, 'Liner 1', 55.00, 20.00, 2.00, 'Geomembrana', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (41, 'Liner 2', 45.00, 25.00, 2.00, 'Geomembrana', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (45, 'P-01', 10.00, 4.10, 1.50, 'Concreto', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (46, 'CR-01', 9.30, 2.10, 1.50, 'Concreto', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (47, 'A-01', 6.20, 2.50, 1.50, 'Concreto', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (48, 'B-01', 9.50, 2.00, 1.50, 'Concreto', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (49, 'C-01', 9.50, 5.60, 1.50, 'Concreto', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola La Ceiba', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (79, 'L-02', 5.80, 0.80, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (82, 'L-05', 5.80, 0.80, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (85, 'L-08', 5.80, 0.80, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (91, 'R-05', 5.80, 4.00, 1.20, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (92, 'R-06', 5.80, 4.00, 1.20, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (93, 'R-07', 5.80, 4.00, 1.20, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (94, 'R-08', 6.80, 4.00, 1.50, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (95, 'R-09', 6.80, 4.00, 1.50, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (96, 'R-10', 6.80, 4.00, 1.50, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (98, 'REPRO-02', 5.80, 4.00, 1.20, 'Concreto', NULL, '2026-02-08', NULL, 'Granja Acuícola Medellin', 'Reproductores', 'vacia');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (100, 'REPRO-04', 5.80, 4.00, 1.20, 'Concreto', NULL, '2026-02-08', NULL, 'Granja Acuícola Medellin', 'Reproductores', 'vacia');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (71, 'H-02', 1.00, 1.00, 1.00, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (72, 'H-03', 1.00, 1.00, 1.00, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (73, 'H-04', 1.00, 1.00, 1.00, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (74, 'H-05', 1.00, 1.00, 1.00, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (75, 'H-06', 1.00, 1.00, 1.00, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (76, 'H-07', 1.00, 1.00, 1.00, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (77, 'H-08', 1.00, 1.00, 1.00, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (70, 'H-01', 1.00, 1.00, 1.00, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'vacia');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (69, 'R-01', 6.00, 3.00, 1.20, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (88, 'R-02', 6.00, 3.00, 1.20, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (89, 'R-03', 6.00, 3.00, 1.20, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (90, 'R-04', 6.00, 3.00, 1.20, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (78, 'L-01', 5.80, 1.10, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (80, 'L-03', 5.80, 1.10, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (81, 'L-04', 5.80, 1.10, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (83, 'L-06', 5.80, 1.10, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (84, 'L-07', 5.80, 1.10, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (86, 'L-09', 5.80, 1.10, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');
INSERT INTO "public"."instalaciones" ("fi_instalacion_id", "nombre_instalacion", "largo", "ancho", "altura", "material", "fi_usuario_id", "fecha_registro", "fd_fecha_modificacion", "fc_granja", "tipo_instalacion", "estado") VALUES (87, 'L-10', 5.80, 1.10, 0.80, 'PENDIENTE', 1, '2026-02-08', '2026-02-08', 'Granja Acuícola Medellin', 'ALEVINAJE', 'ACTIVA');

-- ----------------------------
-- Table structure for insumos
-- ----------------------------
DROP TABLE IF EXISTS "public"."insumos";
CREATE TABLE "public"."insumos" (
  "fi_id" int4 NOT NULL DEFAULT nextval('ceiba_insumos_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fc_cantidad_udm" varchar(100) COLLATE "pg_catalog"."default",
  "fc_num_lote" varchar(100) COLLATE "pg_catalog"."default",
  "fc_descripcion" varchar(300) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_encargado_entrega" varchar(100) COLLATE "pg_catalog"."default",
  "fc_encargado_recepcion" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of insumos
-- ----------------------------

-- ----------------------------
-- Table structure for inventario_alevines
-- ----------------------------
DROP TABLE IF EXISTS "public"."inventario_alevines";
CREATE TABLE "public"."inventario_alevines" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_inventario_alevines_fi_id_seq'::regclass),
  "fn_num_instalacion" int4,
  "fn_cantidad" int4,
  "fn_talla" numeric,
  "fc_lote" varchar(100) COLLATE "pg_catalog"."default",
  "fc_observacion" text COLLATE "pg_catalog"."default",
  "fd_fecha_siembra" date,
  "fd_fecha_salida_hormonado" date,
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of inventario_alevines
-- ----------------------------

-- ----------------------------
-- Table structure for limpieza
-- ----------------------------
DROP TABLE IF EXISTS "public"."limpieza";
CREATE TABLE "public"."limpieza" (
  "fi_id" int4 NOT NULL DEFAULT nextval('ceiba_limpieza_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fc_tipo_instalacion" varchar(100) COLLATE "pg_catalog"."default",
  "fn_num_instalacion" int4,
  "fc_desinfectante" varchar(150) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_encargado" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of limpieza
-- ----------------------------

-- ----------------------------
-- Table structure for lista_espera
-- ----------------------------
DROP TABLE IF EXISTS "public"."lista_espera";
CREATE TABLE "public"."lista_espera" (
  "fi_lista_id" int4 NOT NULL DEFAULT nextval('lista_espera_fi_lista_id_seq'::regclass),
  "fd_fecha_entrega" date NOT NULL,
  "fc_talla" varchar(50) COLLATE "pg_catalog"."default",
  "fn_cantidad" numeric(12,2),
  "fc_cliente" varchar(200) COLLATE "pg_catalog"."default",
  "fc_lugar_entrega" varchar(200) COLLATE "pg_catalog"."default",
  "fc_encargado_venta" varchar(200) COLLATE "pg_catalog"."default",
  "fc_unidad_produccion" varchar(200) COLLATE "pg_catalog"."default",
  "fc_hora_embolsado" varchar(20) COLLATE "pg_catalog"."default",
  "fc_hora_entrega" varchar(20) COLLATE "pg_catalog"."default",
  "fn_precio_venta" numeric(12,2),
  "fc_uap_asignada" varchar(200) COLLATE "pg_catalog"."default",
  "fc_granja_asignada" varchar(200) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of lista_espera
-- ----------------------------
INSERT INTO "public"."lista_espera" VALUES (4, '2026-02-10', '12', 132.00, 'RICARDO BASURTO ZAPATA', 'Ixtacomitan', 'admin', 'Ceiba', '12', '1', 123.00, 'ALEVIN', 'La Ceiba', '2026-02-10 19:36:11.753148', '2026-02-10 19:36:11.753148');

-- ----------------------------
-- Table structure for lote_movimientos
-- ----------------------------
DROP TABLE IF EXISTS "public"."lote_movimientos";
CREATE TABLE "public"."lote_movimientos" (
  "fi_mov_id" int4 NOT NULL DEFAULT nextval('lote_movimientos_fi_mov_id_seq'::regclass),
  "fi_lote_id" int4 NOT NULL,
  "tipo_movimiento" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "cantidad" int4 NOT NULL,
  "fecha" date NOT NULL,
  "destino" varchar(100) COLLATE "pg_catalog"."default",
  "observacion" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4,
  "talla" numeric(5,2)
)
;

-- ----------------------------
-- Records of lote_movimientos
-- ----------------------------

-- ----------------------------
-- Table structure for lotes
-- ----------------------------
DROP TABLE IF EXISTS "public"."lotes";
CREATE TABLE "public"."lotes" (
  "fi_lote_id" int4 NOT NULL DEFAULT nextval('lotes_fi_lote_id_seq'::regclass),
  "fecha" date NOT NULL,
  "familia" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_instalacion_id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "huevos_ml" numeric(10,2),
  "alevines_inicial" int4 NOT NULL,
  "no_lote" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "observacion" text COLLATE "pg_catalog"."default",
  "fecha_registro" date DEFAULT CURRENT_DATE,
  "mortalidad" int4 DEFAULT 0,
  "mortalidad_porcentaje" numeric(5,2) DEFAULT 0
)
;

-- ----------------------------
-- Records of lotes
-- ----------------------------
INSERT INTO "public"."lotes" VALUES (21, '2026-01-31', 'Rocky0', 'H-03', 500.00, 200, '70', 'Granja Acuícola Medellin', '', '2026-02-09', 0, 0.00);

-- ----------------------------
-- Table structure for mantenimientos
-- ----------------------------
DROP TABLE IF EXISTS "public"."mantenimientos";
CREATE TABLE "public"."mantenimientos" (
  "fi_mantenimiento_id" int4 NOT NULL DEFAULT nextval('mantenimientos_fi_mantenimiento_id_seq'::regclass),
  "fi_equipo_id" int4,
  "fd_fecha" date NOT NULL,
  "fc_tipo" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'Preventivo'::character varying,
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fc_descripcion" text COLLATE "pg_catalog"."default",
  "fn_costo" numeric(12,2) DEFAULT 0,
  "fc_estado_post" varchar(50) COLLATE "pg_catalog"."default",
  "fd_proximo_mantenimiento" date
)
;

-- ----------------------------
-- Records of mantenimientos
-- ----------------------------

-- ----------------------------
-- Table structure for medicamentos
-- ----------------------------
DROP TABLE IF EXISTS "public"."medicamentos";
CREATE TABLE "public"."medicamentos" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_medicamentos_fi_id_seq'::regclass),
  "fd_fecha_hora" timestamp(6) NOT NULL,
  "fn_num_estanque" int4,
  "fc_diagnosis" text COLLATE "pg_catalog"."default",
  "fc_tratamiento" text COLLATE "pg_catalog"."default",
  "fc_dosis" varchar(100) COLLATE "pg_catalog"."default",
  "fc_forma_aplicacion" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_ultima_dosis" date,
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of medicamentos
-- ----------------------------

-- ----------------------------
-- Table structure for nomina
-- ----------------------------
DROP TABLE IF EXISTS "public"."nomina";
CREATE TABLE "public"."nomina" (
  "fi_nomina_id" int4 NOT NULL DEFAULT nextval('nomina_fi_nomina_id_seq'::regclass),
  "fc_nombre_empleado" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  "fi_empleado_id" int4,
  "fd_fecha_pago" date NOT NULL DEFAULT CURRENT_DATE,
  "fn_total" numeric(10,2) DEFAULT 0,
  "fn_bono" numeric(10,2) DEFAULT 0,
  "fn_deuda" numeric(10,2) DEFAULT 0,
  "fn_descuento" numeric(10,2) DEFAULT 0,
  "fn_anticipo" numeric(10,2) DEFAULT 0,
  "fi_usuario_id" int4,
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_actualizacion" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of nomina
-- ----------------------------
INSERT INTO "public"."nomina" VALUES (1, 'Jose Carlos Ermesio Cequef', 230092, '2025-12-08', 2500.00, 500.00, 2000.00, 0.00, 0.00, 1, '2025-12-08 17:00:28.182154', '2025-12-08 17:00:28.182154');

-- ----------------------------
-- Table structure for parametros
-- ----------------------------
DROP TABLE IF EXISTS "public"."parametros";
CREATE TABLE "public"."parametros" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_parametros_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fn_num_estanque" int4,
  "fn_oxigeno" numeric,
  "fn_temperatura" numeric,
  "fn_ph" numeric,
  "fn_amonio" numeric,
  "fn_nitritos" numeric,
  "fn_nitratos" numeric,
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of parametros
-- ----------------------------

-- ----------------------------
-- Table structure for piletas
-- ----------------------------
DROP TABLE IF EXISTS "public"."piletas";
CREATE TABLE "public"."piletas" (
  "fi_pileta_id" int4 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "nombre_instalacion" varchar(50) COLLATE "pg_catalog"."default",
  "ubicacion" varchar(100) COLLATE "pg_catalog"."default",
  "fecha_registro" date NOT NULL DEFAULT CURRENT_DATE,
  "fd_fecha_modificacion" date,
  "fecha_siembra" date DEFAULT now(),
  "fecha_ultima_biometria" date DEFAULT now(),
  "cantidad" int4 DEFAULT 0,
  "talla_gr" numeric(10,2),
  "observacion" varchar(255) COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4,
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default",
  "fi_instalacion_id" int4,
  "origen_instalacion" varchar(100) COLLATE "pg_catalog"."default",
  "fi_lote_id" int4
)
;

-- ----------------------------
-- Records of piletas
-- ----------------------------
INSERT INTO "public"."piletas" OVERRIDING SYSTEM VALUE VALUES (102, NULL, NULL, '2026-02-09', NULL, '2026-01-30', '2026-02-09', 200, 0.40, '', 1, 'Granja Acuícola Medellin', 79, '72', 21);

-- ----------------------------
-- Table structure for plagas
-- ----------------------------
DROP TABLE IF EXISTS "public"."plagas";
CREATE TABLE "public"."plagas" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_plagas_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fc_num_trampa" varchar(100) COLLATE "pg_catalog"."default",
  "fc_hallazgo" text COLLATE "pg_catalog"."default",
  "fc_malla" varchar(200) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_verifico" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(100) COLLATE "pg_catalog"."default",
  "tipo_trampa" varchar(100) COLLATE "pg_catalog"."default",
  "fc_veneno" varchar(100) COLLATE "pg_catalog"."default",
  "unidad_produccion" varchar(100) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of plagas
-- ----------------------------
INSERT INTO "public"."plagas" VALUES (2, '2025-12-23', '1', 'Ratas', 'ROTA', '', 'Jose', '2025-12-23 14:13:12.466512', '2025-12-23 14:13:12.466512', 1, NULL, NULL, NULL, NULL);
INSERT INTO "public"."plagas" VALUES (5, '2026-01-06', '114d', 'ahaosja ', 'sdiqhwidjns', 'sansjbjsn', 'xwwkhi2h2', '2026-01-06 14:55:03.393528', '2026-01-06 14:55:03.393528', 1, 'quality', NULL, NULL, NULL);
INSERT INTO "public"."plagas" VALUES (6, '2026-01-06', 'c12', 'rata', 'Dañada', 'no', 'juan', '2026-01-06 15:06:36.382843', '2026-01-06 15:13:46.534329', 1, 'medellin', 'Adhesiva', 'Líquido', 'Engorda 1');
INSERT INTO "public"."plagas" VALUES (4, '2026-01-07', '121sss', 'rata', 'Sin Malla', 'uana', '231', '2026-01-06 14:54:43.562833', '2026-01-06 15:20:48.505116', 1, 'ceiba', 'Cebadera', 'Ninguno', 'Reproductores');

-- ----------------------------
-- Table structure for proveedores
-- ----------------------------
DROP TABLE IF EXISTS "public"."proveedores";
CREATE TABLE "public"."proveedores" (
  "id" int4 NOT NULL DEFAULT nextval('proveedores_id_seq'::regclass),
  "nombre" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "empresa" varchar(255) COLLATE "pg_catalog"."default",
  "rfc" varchar(50) COLLATE "pg_catalog"."default",
  "categoria" varchar(100) COLLATE "pg_catalog"."default",
  "contacto" varchar(150) COLLATE "pg_catalog"."default",
  "telefono" varchar(50) COLLATE "pg_catalog"."default",
  "correo" varchar(150) COLLATE "pg_catalog"."default",
  "direccion" text COLLATE "pg_catalog"."default",
  "forma_pago" varchar(50) COLLATE "pg_catalog"."default",
  "plazo_credito" int4,
  "ultima_compra" date,
  "monto_promedio" numeric(12,2) DEFAULT 0,
  "activo" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of proveedores
-- ----------------------------
INSERT INTO "public"."proveedores" VALUES (2, 'Alexander Julian Navarro', 'SACO', 'SA34OWP2', 'Jefe de Allande', 'Vendedor', '99921302912', 'edualexo@gmail.com', 'jaunw´s', 'efectivo', 23, '2025-12-22', 2.50, 't', '2025-12-22 16:23:55.113155', '2026-02-04 17:09:05.792324');
INSERT INTO "public"."proveedores" VALUES (3, 'JULIAN FRANCISCO CRUZ', 'ACCIONES', '1243S11', 'SWWDQ', 'WQWEQWD', '92171291', 'jljuan@gmail.com', 'E12E2', '2ESD', 12, '2026-02-04', 1233.00, 't', '2026-02-04 17:10:53.998697', '2026-02-04 17:10:53.998697');

-- ----------------------------
-- Table structure for recambios
-- ----------------------------
DROP TABLE IF EXISTS "public"."recambios";
CREATE TABLE "public"."recambios" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_recambios_fi_id_seq'::regclass),
  "fc_mes" varchar(20) COLLATE "pg_catalog"."default",
  "fn_num_instalacion" int4,
  "fd_fecha1" date,
  "fc_tipo1" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha2" date,
  "fc_tipo2" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha3" date,
  "fc_tipo3" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha4" date,
  "fc_tipo4" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha5" date,
  "fc_tipo5" varchar(30) COLLATE "pg_catalog"."default",
  "fd_fecha6" date,
  "fc_tipo6" varchar(30) COLLATE "pg_catalog"."default",
  "fc_responsable" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of recambios
-- ----------------------------

-- ----------------------------
-- Table structure for recepcion_insumos
-- ----------------------------
DROP TABLE IF EXISTS "public"."recepcion_insumos";
CREATE TABLE "public"."recepcion_insumos" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_recepcion_insumos_fi_id_seq'::regclass),
  "fc_mes" varchar(20) COLLATE "pg_catalog"."default",
  "fd_fecha" date NOT NULL,
  "fc_cantidad" varchar(100) COLLATE "pg_catalog"."default",
  "fc_lote" varchar(100) COLLATE "pg_catalog"."default",
  "fc_descripcion" varchar(300) COLLATE "pg_catalog"."default",
  "fc_encargado_entrega" varchar(100) COLLATE "pg_catalog"."default",
  "fc_verifico" varchar(100) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default",
  "fc_proveedor" varchar(100) COLLATE "pg_catalog"."default",
  "fc_producto" varchar(255) COLLATE "pg_catalog"."default",
  "fc_unidad_medida" varchar(255) COLLATE "pg_catalog"."default",
  "fc_condiciones_entrega" varchar(150) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of recepcion_insumos
-- ----------------------------
INSERT INTO "public"."recepcion_insumos" VALUES (2, NULL, '2026-01-09', '5', '2', NULL, NULL, 'JC JIMENEZ ARA', '', '2026-01-09 14:37:32.572406', '2026-01-09 14:37:32.572406', 1, 'medellin', 'Ernesto Alandro', 'Alimento', 'Kg', 'Buenas');
INSERT INTO "public"."recepcion_insumos" VALUES (3, NULL, '2026-01-09', '2', '45', NULL, NULL, 'Jose Alfredo', '', '2026-01-09 14:38:39.736136', '2026-01-09 14:38:39.736136', 1, 'ceiba', 'Julio Alonso Mendez', 'Aceite', 'Litros', 'Buena');

-- ----------------------------
-- Table structure for reproductores
-- ----------------------------
DROP TABLE IF EXISTS "public"."reproductores";
CREATE TABLE "public"."reproductores" (
  "fi_reproductor_id" int4 NOT NULL DEFAULT nextval('reproductores_fi_reproductor_id_seq'::regclass),
  "fc_instalacion" varchar(50) COLLATE "pg_catalog"."default",
  "fn_cantidad" int4,
  "fn_talla" numeric(10,2),
  "fc_observacion" varchar(100) COLLATE "pg_catalog"."default",
  "fd_fecha_siembra" date,
  "fd_fecha_biometria" date,
  "fi_usuario_id" int4,
  "fd_fecha_registro" timestamp(6),
  "fn_machos" int4 DEFAULT 0,
  "fn_hembras" int4 DEFAULT 0,
  "fc_ratio" varchar(10) COLLATE "pg_catalog"."default",
  "fc_granja" varchar(100) COLLATE "pg_catalog"."default",
  "fc_linea" varchar(50) COLLATE "pg_catalog"."default",
  "fc_familia" varchar(20) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of reproductores
-- ----------------------------
INSERT INTO "public"."reproductores" VALUES (33, 'REPRO-01', 140, 500.00, '', '2026-02-08', '2026-02-08', 1, '2026-02-08 15:47:26.813579', 112, 28, '1:28', 'Granja Acuícola Medellin', 'garbanos', 'FM1');
INSERT INTO "public"."reproductores" VALUES (34, 'REPRO-02', 147, 500.00, '', '2026-02-08', '2026-02-08', 1, '2026-02-08 20:11:55.007165', 122, 25, '1:25', 'Granja Acuícola Medellin', 'garzos', 'FM2');
INSERT INTO "public"."reproductores" VALUES (35, 'H-01', 200, 500.00, '', '2026-02-08', '2026-02-08', 1, '2026-02-08 22:22:20.752277', 122, 78, '1:78', 'Granja Acuícola Medellin', 'Zacatos', 'FM3');
INSERT INTO "public"."reproductores" VALUES (36, 'H-03', 105, 500.00, '', '2026-02-09', '2026-02-09', 1, '2026-02-09 17:10:20.169017', 25, 80, '1:80', 'Granja Acuícola Medellin', 'Gif', 'Rocky0');

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS "public"."roles";
CREATE TABLE "public"."roles" (
  "fi_rol_id" int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "fc_nombre" varchar(50) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO "public"."roles" VALUES (2, 'Bióloga');
INSERT INTO "public"."roles" VALUES (3, 'Jefe de Empresa');
INSERT INTO "public"."roles" VALUES (1, 'Administrador');

-- ----------------------------
-- Table structure for trazabilidad_alevinaje
-- ----------------------------
DROP TABLE IF EXISTS "public"."trazabilidad_alevinaje";
CREATE TABLE "public"."trazabilidad_alevinaje" (
  "fi_movimiento_id" int4 NOT NULL DEFAULT nextval('rastreabilidad_fi_movimiento_id_seq'::regclass),
  "fi_pileta_origen" int4,
  "fi_pileta_destino" int4,
  "cantidad" int4 NOT NULL,
  "fecha_movimiento" date DEFAULT CURRENT_DATE,
  "observacion" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4,
  "fi_lote_id" int4,
  "tipo_movimiento" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'traslado'::character varying,
  "origen_externo" text COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of trazabilidad_alevinaje
-- ----------------------------

-- ----------------------------
-- Table structure for trazabilidad_engorda
-- ----------------------------
DROP TABLE IF EXISTS "public"."trazabilidad_engorda";
CREATE TABLE "public"."trazabilidad_engorda" (
  "fi_movimiento_id" int4 NOT NULL DEFAULT nextval('rastreabilidad_engorda_fi_movimiento_id_seq'::regclass),
  "fi_engorda_origen" int4,
  "fi_engorda_destino" int4,
  "cantidad_trasladada" int4 NOT NULL,
  "fecha_movimiento" date DEFAULT CURRENT_DATE,
  "observacion" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4
)
;

-- ----------------------------
-- Records of trazabilidad_engorda
-- ----------------------------

-- ----------------------------
-- Table structure for trazabilidad_reproductores
-- ----------------------------
DROP TABLE IF EXISTS "public"."trazabilidad_reproductores";
CREATE TABLE "public"."trazabilidad_reproductores" (
  "fi_movimiento_id" int4 NOT NULL DEFAULT nextval('rastreabilidad_reproductores_fi_movimiento_id_seq'::regclass),
  "fi_repro_origen" int4,
  "fi_repro_destino" int4,
  "cantidad_trasladada" int4,
  "fecha_movimiento" date,
  "observacion" text COLLATE "pg_catalog"."default",
  "fi_usuario_id" int4,
  "origen_texto" varchar(150) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of trazabilidad_reproductores
-- ----------------------------
INSERT INTO "public"."trazabilidad_reproductores" VALUES (13, NULL, 32, 189, '2026-02-08', NULL, 1, 'Ingreso inicial');
INSERT INTO "public"."trazabilidad_reproductores" VALUES (14, NULL, 33, 140, '2026-02-08', NULL, 1, 'Granjas los soles');
INSERT INTO "public"."trazabilidad_reproductores" VALUES (15, NULL, 34, 147, '2026-02-08', NULL, 1, 'Granja Aful');
INSERT INTO "public"."trazabilidad_reproductores" VALUES (16, NULL, 35, 200, '2026-02-08', NULL, 1, 'Rio el salvo');
INSERT INTO "public"."trazabilidad_reproductores" VALUES (17, NULL, 36, 105, '2026-02-09', NULL, 1, 'Granja Mapa');

-- ----------------------------
-- Table structure for usuarios
-- ----------------------------
DROP TABLE IF EXISTS "public"."usuarios";
CREATE TABLE "public"."usuarios" (
  "fi_usuario_id" int4 NOT NULL GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1
),
  "fc_nombre" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_contraseña" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "fi_rol_id" int4 NOT NULL,
  "fi_empresa_id" int4
)
;

-- ----------------------------
-- Records of usuarios
-- ----------------------------
INSERT INTO "public"."usuarios" OVERRIDING SYSTEM VALUE VALUES (1, 'admin', '$2b$10$jaFu4Rk2.OC.VlKMn9sk5eZkhUHJervY806TO.Xawqi/4EPeEsT2O', 1, NULL);
INSERT INTO "public"."usuarios" OVERRIDING SYSTEM VALUE VALUES (2, 'biologa', '$2b$10$8/hDsHZ6u2r.Pa2GupqW8eGcksyrJIcr8F1qzKCZ8WHs8Icji5jh6', 2, NULL);
INSERT INTO "public"."usuarios" OVERRIDING SYSTEM VALUE VALUES (3, 'jefegam', '$2b$10$MaZ6c3EDw/VogC1KtONo4.1lZJjVgYQ4Zr.RDKuFCC1a599G3Io/K', 3, 1);
INSERT INTO "public"."usuarios" OVERRIDING SYSTEM VALUE VALUES (4, 'jefegac', '$2b$10$Z9SJnP2gIGT57LLCAMbUr.y61rDx/YyEV9qx5KP6tEMBLBJ1Zn4kS', 3, 2);

-- ----------------------------
-- Table structure for vacaciones
-- ----------------------------
DROP TABLE IF EXISTS "public"."vacaciones";
CREATE TABLE "public"."vacaciones" (
  "fi_vacacion_id" int4 NOT NULL DEFAULT nextval('vacaciones_fi_vacacion_id_seq'::regclass),
  "fc_nombre_empleado" varchar(120) COLLATE "pg_catalog"."default" NOT NULL,
  "fi_empleado_id" int4,
  "fd_inicio_periodo" date NOT NULL,
  "fd_fin_periodo" date NOT NULL,
  "fc_departamento" varchar(80) COLLATE "pg_catalog"."default",
  "fn_dias_trabajados" int4 DEFAULT 0,
  "fn_vacaciones_v" int4 DEFAULT 0,
  "fn_enfermedad_e" int4 DEFAULT 0,
  "fn_maternidad_m" int4 DEFAULT 0,
  "fn_permiso_parcial_pp" int4 DEFAULT 0,
  "fn_permiso_total_pt" int4 DEFAULT 0,
  "fn_inasistencias_i" int4 DEFAULT 0,
  "fn_vacaciones_anio" int4 DEFAULT 0,
  "fn_dias_previos" int4 DEFAULT 0,
  "fn_vacaciones_disponibles" int4 DEFAULT 0,
  "fn_vacaciones_disfrutadas" int4 DEFAULT 0,
  "fd_fecha_actualizacion" timestamp(6) DEFAULT now(),
  "fc_asistencia" varchar(50) COLLATE "pg_catalog"."default" DEFAULT 'Asistió'::character varying
)
;

-- ----------------------------
-- Records of vacaciones
-- ----------------------------
INSERT INTO "public"."vacaciones" VALUES (5, 'Juan Carlos Jimenez Morales', 10101010, '2024-12-31', '2025-12-30', 'General', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '2025-12-08 18:22:32.176599', 'NO');
INSERT INTO "public"."vacaciones" VALUES (6, 'Juan Carlos Jimenez Ara', 10101011, '2025-01-01', '2025-12-31', 'Direccion', 364, 10, 1, 0, 0, 0, 0, 12, 0, 0, 2, '2025-12-15 14:06:13.13212', 'Asistió');
INSERT INTO "public"."vacaciones" VALUES (4, 'Carlos Manuel Perez Ruiz', 10101014, '2024-12-31', '2025-12-30', 'General', 365, 1, 0, 0, 0, 0, 0, 26, 0, 0, 1, '2025-12-15 14:41:20.189885', 'NO');

-- ----------------------------
-- Table structure for ventas
-- ----------------------------
DROP TABLE IF EXISTS "public"."ventas";
CREATE TABLE "public"."ventas" (
  "fi_venta_id" int4 NOT NULL DEFAULT nextval('ventas_fi_venta_id_seq'::regclass),
  "fn_monto_total" numeric(12,2) NOT NULL,
  "fd_fecha_venta" date NOT NULL,
  "fd_fecha_registro" date NOT NULL DEFAULT now(),
  "fd_fecha_modificacion" date NOT NULL DEFAULT now(),
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_cliente" varchar(150) COLLATE "pg_catalog"."default" NOT NULL,
  "fn_cantidad_vendida" int4 NOT NULL,
  "fn_precio_venta" numeric(10,2) NOT NULL,
  "fc_encargado_venta" text COLLATE "pg_catalog"."default",
  "fn_abonado" numeric(12,2) DEFAULT 0,
  "fn_adeudo" numeric(12,2),
  "fc_empresa" text COLLATE "pg_catalog"."default" NOT NULL,
  "fc_folio" varchar(50) COLLATE "pg_catalog"."default",
  "fc_tipo_venta" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "fc_estado_pago" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'ADEUDO'::character varying
)
;

-- ----------------------------
-- Records of ventas
-- ----------------------------
INSERT INTO "public"."ventas" VALUES (48, 1488.00, '2026-02-09', '2026-02-09', '2026-02-09', '', 'ARTEMIO MORENO', 124, 12.00, 'Jose Alfredo Acosta Farias', 1478.00, 10.00, 'MEDELLIN', 'GAM20A21', 'ALEVINES', 'PARCIAL');

-- ----------------------------
-- Table structure for visitas
-- ----------------------------
DROP TABLE IF EXISTS "public"."visitas";
CREATE TABLE "public"."visitas" (
  "fi_id" int4 NOT NULL DEFAULT nextval('medellin_visitas_fi_id_seq'::regclass),
  "fd_fecha" date NOT NULL,
  "fc_nombre_completo" varchar(200) COLLATE "pg_catalog"."default",
  "fc_origen" varchar(200) COLLATE "pg_catalog"."default",
  "fc_motivo" varchar(300) COLLATE "pg_catalog"."default",
  "fc_observaciones" text COLLATE "pg_catalog"."default",
  "fc_foto_identificacion" varchar(200) COLLATE "pg_catalog"."default",
  "fd_fecha_registro" timestamp(6) DEFAULT now(),
  "fd_fecha_modificacion" timestamp(6) DEFAULT now(),
  "fi_usuario_id" int4,
  "ubicacion" varchar(50) COLLATE "pg_catalog"."default",
  "fd_entrada" time(6),
  "fd_salida" time(6)
)
;

-- ----------------------------
-- Records of visitas
-- ----------------------------
INSERT INTO "public"."visitas" VALUES (4, '2026-01-08', 'Adrian Felix Felez', 'Campeche', 'Empleo', '', NULL, '2026-01-09 15:29:17.383992', '2026-01-09 15:29:17.383992', 1, 'ceiba', '15:26:00', '16:26:00');
INSERT INTO "public"."visitas" VALUES (5, '2026-01-09', 'Julian Alonso Perez', 'Macuspana', 'Vendedor', 'No', NULL, '2026-01-09 15:30:18.284792', '2026-01-09 15:30:18.284792', 1, 'ceiba', '16:30:00', '18:30:00');

-- ----------------------------
-- Procedure structure for sp_limpiarpiletassininstalacion
-- ----------------------------
DROP PROCEDURE IF EXISTS "public"."sp_limpiarpiletassininstalacion"();
CREATE PROCEDURE "public"."sp_limpiarpiletassininstalacion"()
 AS $BODY$
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