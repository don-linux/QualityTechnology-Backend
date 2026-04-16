--
-- PostgreSQL database dump
--

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
$$;

ALTER PROCEDURE public.sp_limpiarpiletassininstalacion() OWNER TO postgres;

--
-- Name: unaccent(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unaccent(text) RETURNS text
    LANGUAGE c STABLE STRICT
    AS '$libdir/unaccent', 'unaccent_dict';

ALTER FUNCTION public.unaccent(text) OWNER TO postgres;

--
-- Name: unaccent(regdictionary, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unaccent(regdictionary, text) RETURNS text
    LANGUAGE c STABLE STRICT
    AS '$libdir/unaccent', 'unaccent_dict';

ALTER FUNCTION public.unaccent(regdictionary, text) OWNER TO postgres;

--
-- Name: unaccent_init(internal); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unaccent_init(internal) RETURNS internal
    LANGUAGE c
    AS '$libdir/unaccent', 'unaccent_init';

ALTER FUNCTION public.unaccent_init(internal) OWNER TO postgres;

--
-- Name: unaccent_lexize(internal, internal, internal, internal); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.unaccent_lexize(internal, internal, internal, internal) RETURNS internal
    LANGUAGE c
    AS '$libdir/unaccent', 'unaccent_lexize';

ALTER FUNCTION public.unaccent_lexize(internal, internal, internal, internal) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alimentacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alimentacion (
    fi_id integer NOT NULL,
    fc_mes character varying(20),
    fn_num_instalacion integer,
    fn_peso_promedio_entrada numeric,
    fd_fecha_siembra date,
    fc_origen_alevines character varying(200),
    fd_fecha date,
    fn_total_alimento_kg numeric,
    fn_mortalidad integer,
    fc_recambio_agua character varying(50),
    fn_temp_agua numeric,
    fn_amonio numeric,
    fn_ph numeric,
    fc_observaciones character varying(500),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50) NOT NULL
);

ALTER TABLE public.alimentacion OWNER TO postgres;

--
-- Name: alimentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alimentos (
    fi_alimento_id integer NOT NULL,
    fi_reproductor_id integer,
    fi_pileta_id integer,
    fi_usuario_id integer,
    particula_mm numeric(10,2),
    alimento_dia numeric(10,3),
    porcion numeric(10,3),
    gasto_alimento numeric(12,2),
    fi_engorda_id integer
);

ALTER TABLE public.alimentos OWNER TO postgres;

--
-- Name: alimentos_fi_alimento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alimentos_fi_alimento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.alimentos_fi_alimento_id_seq OWNER TO postgres;

--
-- Name: alimentos_fi_alimento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alimentos_fi_alimento_id_seq OWNED BY public.alimentos.fi_alimento_id;

--
-- Name: alimentos_fi_alimento_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.alimentos ALTER COLUMN fi_alimento_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.alimentos_fi_alimento_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: banos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banos (
    fi_id integer NOT NULL,
    fd_fecha date NOT NULL,
    fc_tipo_banio character varying(20),
    fc_regadera character varying(100),
    fc_realizo character varying(100),
    fc_observaciones character varying(500),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50) NOT NULL
);

ALTER TABLE public.banos OWNER TO postgres;

--
-- Name: biometrias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biometrias (
    fi_id integer NOT NULL,
    fd_fecha date NOT NULL,
    fn_peso_total_gramos numeric,
    fn_organismos_muestreados integer,
    fn_peso_promedio numeric,
    fc_observaciones character varying(500),
    fc_encargado character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    fi_instalacion_id integer,
    tipo character varying(20),
    fc_granja character varying(100),
    ubicacion character varying(50) NOT NULL,
    fi_reproductor_id integer,
    CONSTRAINT chk_biometrias_tipo_repro CHECK (((((tipo)::text = 'REPRODUCTORES'::text) AND (fi_reproductor_id IS NOT NULL)) OR ((tipo)::text <> 'REPRODUCTORES'::text)))
);

ALTER TABLE public.biometrias OWNER TO postgres;

--
-- Name: caja_ahorro_movimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_ahorro_movimientos (
    id integer NOT NULL,
    categoria_id integer,
    fecha date DEFAULT CURRENT_DATE,
    tipo_movimiento character varying(10) DEFAULT 'EGRESO'::character varying,
    monto numeric(12,2) DEFAULT 0.00,
    descripcion text,
    CONSTRAINT caja_ahorro_movimientos_tipo_movimiento_check CHECK (((tipo_movimiento)::text = ANY (ARRAY[('INGRESO'::character varying)::text, ('EGRESO'::character varying)::text])))
);

ALTER TABLE public.caja_ahorro_movimientos OWNER TO postgres;

--
-- Name: caja_ahorro_movimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caja_ahorro_movimientos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.caja_ahorro_movimientos_id_seq OWNER TO postgres;

--
-- Name: caja_ahorro_movimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caja_ahorro_movimientos_id_seq OWNED BY public.caja_ahorro_movimientos.id;

--
-- Name: caja_ahorro_resumen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_ahorro_resumen (
    id integer NOT NULL,
    categoria character varying(100) NOT NULL,
    enero numeric(12,2) DEFAULT 0,
    febrero numeric(12,2) DEFAULT 0,
    marzo numeric(12,2) DEFAULT 0,
    abril numeric(12,2) DEFAULT 0,
    mayo numeric(12,2) DEFAULT 0,
    junio numeric(12,2) DEFAULT 0,
    julio numeric(12,2) DEFAULT 0,
    agosto numeric(12,2) DEFAULT 0,
    septiembre numeric(12,2) DEFAULT 0,
    octubre numeric(12,2) DEFAULT 0,
    noviembre numeric(12,2) DEFAULT 0,
    diciembre numeric(12,2) DEFAULT 0,
    total numeric(12,2) GENERATED ALWAYS AS ((((((((((((COALESCE(enero, (0)::numeric) + COALESCE(febrero, (0)::numeric)) + COALESCE(marzo, (0)::numeric)) + COALESCE(abril, (0)::numeric)) + COALESCE(mayo, (0)::numeric)) + COALESCE(junio, (0)::numeric)) + COALESCE(julio, (0)::numeric)) + COALESCE(agosto, (0)::numeric)) + COALESCE(septiembre, (0)::numeric)) + COALESCE(octubre, (0)::numeric)) + COALESCE(noviembre, (0)::numeric)) + COALESCE(diciembre, (0)::numeric))) STORED,
    actualizado timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    granja character varying(50) DEFAULT 'Ceiba'::character varying
);

ALTER TABLE public.caja_ahorro_resumen OWNER TO postgres;

--
-- Name: caja_ahorro_resumen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.caja_ahorro_resumen_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.caja_ahorro_resumen_id_seq OWNER TO postgres;

--
-- Name: caja_ahorro_resumen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.caja_ahorro_resumen_id_seq OWNED BY public.caja_ahorro_resumen.id;

--
-- Name: cat_caja_ahorro_categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_caja_ahorro_categorias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo character varying(10) DEFAULT 'EGRESO'::character varying,
    activo boolean DEFAULT true,
    CONSTRAINT cat_caja_ahorro_categorias_tipo_check CHECK (((tipo)::text = ANY (ARRAY[('INGRESO'::character varying)::text, ('EGRESO'::character varying)::text])))
);

ALTER TABLE public.cat_caja_ahorro_categorias OWNER TO postgres;

--
-- Name: cat_caja_ahorro_categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cat_caja_ahorro_categorias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.cat_caja_ahorro_categorias_id_seq OWNER TO postgres;

--
-- Name: cat_caja_ahorro_categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_caja_ahorro_categorias_id_seq OWNED BY public.cat_caja_ahorro_categorias.id;

--
-- Name: cat_tesoreria_categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cat_tesoreria_categorias (
    fi_categoria_id integer NOT NULL,
    fc_nombre character varying(100) NOT NULL,
    fc_grupo character varying(100) NOT NULL
);

ALTER TABLE public.cat_tesoreria_categorias OWNER TO postgres;

--
-- Name: cat_tesoreria_categorias_fi_categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cat_tesoreria_categorias_fi_categoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.cat_tesoreria_categorias_fi_categoria_id_seq OWNER TO postgres;

--
-- Name: cat_tesoreria_categorias_fi_categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cat_tesoreria_categorias_fi_categoria_id_seq OWNED BY public.cat_tesoreria_categorias.fi_categoria_id;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo_principal character varying(30),
    subcategoria character varying(50),
    descripcion text,
    fc_empresa character varying(20) DEFAULT 'ALL'::character varying
);

ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.categorias_id_seq OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;

--
-- Name: ceiba_alimentacion_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ceiba_alimentacion_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.ceiba_alimentacion_fi_id_seq OWNER TO postgres;

--
-- Name: ceiba_alimentacion_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ceiba_alimentacion_fi_id_seq OWNED BY public.alimentacion.fi_id;

--
-- Name: ceiba_biometrias_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ceiba_biometrias_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.ceiba_biometrias_fi_id_seq OWNER TO postgres;

--
-- Name: ceiba_biometrias_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ceiba_biometrias_fi_id_seq OWNED BY public.biometrias.fi_id;

--
-- Name: insumos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.insumos (
    fi_id integer NOT NULL,
    fd_fecha date NOT NULL,
    fc_cantidad_udm character varying(100),
    fc_num_lote character varying(100),
    fc_descripcion character varying(300),
    fc_observaciones character varying(500),
    fc_encargado_entrega character varying(100),
    fc_encargado_recepcion character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50) NOT NULL
);

ALTER TABLE public.insumos OWNER TO postgres;

--
-- Name: ceiba_insumos_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ceiba_insumos_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.ceiba_insumos_fi_id_seq OWNER TO postgres;

--
-- Name: ceiba_insumos_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ceiba_insumos_fi_id_seq OWNED BY public.insumos.fi_id;

--
-- Name: limpieza; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.limpieza (
    fi_id integer NOT NULL,
    fd_fecha date NOT NULL,
    fc_tipo_instalacion character varying(100),
    fn_num_instalacion integer,
    fc_desinfectante character varying(150),
    fc_observaciones text,
    fc_encargado character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50)
);

ALTER TABLE public.limpieza OWNER TO postgres;

--
-- Name: ceiba_limpieza_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ceiba_limpieza_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.ceiba_limpieza_fi_id_seq OWNER TO postgres;

--
-- Name: ceiba_limpieza_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ceiba_limpieza_fi_id_seq OWNED BY public.limpieza.fi_id;

--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    fi_cliente_id integer NOT NULL,
    fc_nombre character varying(100),
    fc_telefono character varying(20),
    fc_correo character varying(255),
    fi_usuario_id integer NOT NULL,
    fd_fecha_registro date NOT NULL,
    fd_fecha_modificacion date NOT NULL,
    fc_cp character(5),
    fc_localidad character varying(100)
);

ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_fi_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_fi_cliente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.clientes_fi_cliente_id_seq OWNER TO postgres;

--
-- Name: clientes_fi_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_fi_cliente_id_seq OWNED BY public.clientes.fi_cliente_id;

--
-- Name: clientes_fi_cliente_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clientes ALTER COLUMN fi_cliente_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.clientes_fi_cliente_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: cuentas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    saldo numeric(12,2) DEFAULT 0,
    tipo character varying(50) DEFAULT 'CUENTA CORRIENTE'::character varying,
    fd_fecha_registro timestamp(6) without time zone DEFAULT now()
);

ALTER TABLE public.cuentas OWNER TO postgres;

--
-- Name: cuentas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.cuentas_id_seq OWNER TO postgres;

--
-- Name: cuentas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_id_seq OWNED BY public.cuentas.id;

--
-- Name: engorda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.engorda (
    fi_engorda_id integer NOT NULL,
    fi_instalacion_id integer NOT NULL,
    cantidad integer NOT NULL,
    talla_gr numeric(10,2),
    observacion text,
    fecha_siembra date,
    fecha_biometria date,
    fecha_registro date DEFAULT CURRENT_DATE,
    fi_usuario_id integer,
    fc_granja character varying(100),
    fi_lote_id integer,
    origen_instalacion integer,
    fd_fecha_modificacion date
);

ALTER TABLE public.engorda OWNER TO postgres;

--
-- Name: engorda_fi_engorda_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.engorda_fi_engorda_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.engorda_fi_engorda_id_seq OWNER TO postgres;

--
-- Name: engorda_fi_engorda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.engorda_fi_engorda_id_seq OWNED BY public.engorda.fi_engorda_id;

--
-- Name: equipos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipos (
    fi_equipo_id integer NOT NULL,
    fc_nombre character varying(150) NOT NULL,
    fc_marca character varying(100),
    fc_modelo character varying(100),
    fc_tipo character varying(100),
    fd_fecha_compra date,
    fn_costo numeric(12,2),
    fc_estado character varying(50) DEFAULT 'Operativo'::character varying,
    fc_ubicacion character varying(150),
    fc_responsable character varying(100),
    fd_proximo_mantenimiento date,
    fc_notas text,
    fi_usuario_id integer
);

ALTER TABLE public.equipos OWNER TO postgres;

--
-- Name: equipos_fi_equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipos_fi_equipo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.equipos_fi_equipo_id_seq OWNER TO postgres;

--
-- Name: equipos_fi_equipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipos_fi_equipo_id_seq OWNED BY public.equipos.fi_equipo_id;

--
-- Name: flujo_caja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flujo_caja (
    fi_movimiento_id integer NOT NULL,
    fc_granja character varying(50) NOT NULL,
    fd_fecha date NOT NULL,
    fn_ingreso numeric(12,2) DEFAULT 0,
    fn_egreso numeric(12,2) DEFAULT 0,
    fc_descripcion character varying(200),
    fc_cuenta character varying(50),
    fc_categoria character varying(100),
    fc_subcategoria character varying(100),
    fc_factura character varying(50),
    fc_estatus character varying(20),
    fc_mes character varying(7),
    fd_fecha_registro timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    categoria_id integer,
    fc_beneficiario character varying(100),
    fc_noproyecto character varying(50),
    fc_equilibrar numeric(12,2),
    CONSTRAINT flujo_caja_fc_estatus_check CHECK (((fc_estatus)::text = ANY (ARRAY[('REPOSICION'::character varying)::text, ('LIQUIDADO'::character varying)::text, ('ADEUDO'::character varying)::text, ('PARCIAL'::character varying)::text])))
);

ALTER TABLE public.flujo_caja OWNER TO postgres;

--
-- Name: flujo_caja_fi_movimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.flujo_caja_fi_movimiento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.flujo_caja_fi_movimiento_id_seq OWNER TO postgres;

--
-- Name: flujo_caja_fi_movimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.flujo_caja_fi_movimiento_id_seq OWNED BY public.flujo_caja.fi_movimiento_id;

--
-- Name: instalaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instalaciones (
    fi_instalacion_id integer NOT NULL,
    nombre_instalacion character varying(100) NOT NULL,
    largo numeric(10,2) NOT NULL,
    ancho numeric(10,2) NOT NULL,
    altura numeric(10,2) NOT NULL,
    material character varying(100) NOT NULL,
    metros_cubicos numeric(10,2) GENERATED ALWAYS AS (((largo * ancho) * altura)) STORED,
    fi_usuario_id integer,
    fecha_registro date DEFAULT CURRENT_DATE,
    fd_fecha_modificacion date,
    fc_granja character varying(100),
    tipo_instalacion character varying(50),
    estado character varying(20) DEFAULT 'vacia'::character varying,
    CONSTRAINT chk_instalaciones_granja CHECK (((fc_granja)::text = ANY (ARRAY[('Granja Acuícola Medellin'::character varying)::text, ('Granja Acuícola La Ceiba'::character varying)::text]))),
    CONSTRAINT instalaciones_altura_check CHECK ((altura > (0)::numeric)),
    CONSTRAINT instalaciones_ancho_check CHECK ((ancho > (0)::numeric)),
    CONSTRAINT instalaciones_largo_check CHECK ((largo > (0)::numeric))
);

ALTER TABLE public.instalaciones OWNER TO postgres;

--
-- Name: instalaciones_fi_instalacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.instalaciones_fi_instalacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.instalaciones_fi_instalacion_id_seq OWNER TO postgres;

--
-- Name: instalaciones_fi_instalacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.instalaciones_fi_instalacion_id_seq OWNED BY public.instalaciones.fi_instalacion_id;

--
-- Name: inventario_alevines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventario_alevines (
    fi_id integer NOT NULL,
    fn_num_instalacion integer,
    fn_cantidad integer,
    fn_talla numeric,
    fc_lote character varying(100),
    fc_observacion text,
    fd_fecha_siembra date,
    fd_fecha_salida_hormonado date,
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50) NOT NULL
);

ALTER TABLE public.inventario_alevines OWNER TO postgres;

--
-- Name: lista_espera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lista_espera (
    fi_lista_id integer NOT NULL,
    fd_fecha_entrega date NOT NULL,
    fc_talla character varying(50),
    fn_cantidad numeric(12,2),
    fc_cliente character varying(200),
    fc_lugar_entrega character varying(200),
    fc_encargado_venta character varying(200),
    fc_unidad_produccion character varying(200),
    fc_hora_embolsado character varying(20),
    fc_hora_entrega character varying(20),
    fn_precio_venta numeric(12,2),
    fc_uap_asignada character varying(200),
    fc_granja_asignada character varying(200),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now()
);

ALTER TABLE public.lista_espera OWNER TO postgres;

--
-- Name: lista_espera_fi_lista_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lista_espera_fi_lista_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.lista_espera_fi_lista_id_seq OWNER TO postgres;

--
-- Name: lista_espera_fi_lista_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lista_espera_fi_lista_id_seq OWNED BY public.lista_espera.fi_lista_id;

--
-- Name: lote_movimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lote_movimientos (
    fi_mov_id integer NOT NULL,
    fi_lote_id integer NOT NULL,
    tipo_movimiento character varying(20) NOT NULL,
    cantidad integer NOT NULL,
    fecha date NOT NULL,
    destino character varying(100),
    observacion text,
    fi_usuario_id integer,
    talla numeric(5,2),
    CONSTRAINT lote_movimientos_cantidad_check CHECK ((cantidad > 0))
);

ALTER TABLE public.lote_movimientos OWNER TO postgres;

--
-- Name: lote_movimientos_fi_mov_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lote_movimientos_fi_mov_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.lote_movimientos_fi_mov_id_seq OWNER TO postgres;

--
-- Name: lote_movimientos_fi_mov_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lote_movimientos_fi_mov_id_seq OWNED BY public.lote_movimientos.fi_mov_id;

--
-- Name: lotes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lotes (
    fi_lote_id integer NOT NULL,
    fecha date NOT NULL,
    familia character varying(50) NOT NULL,
    fc_instalacion_id character varying(50) NOT NULL,
    huevos_ml numeric(10,2),
    alevines_inicial integer NOT NULL,
    no_lote character varying(50) NOT NULL,
    fc_granja character varying(100) NOT NULL,
    observacion text,
    fecha_registro date DEFAULT CURRENT_DATE,
    mortalidad integer DEFAULT 0,
    mortalidad_porcentaje numeric(5,2) DEFAULT 0,
    ovadas integer DEFAULT 0
);

ALTER TABLE public.lotes OWNER TO postgres;

--
-- Name: lotes_fi_lote_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lotes_fi_lote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.lotes_fi_lote_id_seq OWNER TO postgres;

--
-- Name: lotes_fi_lote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lotes_fi_lote_id_seq OWNED BY public.lotes.fi_lote_id;

--
-- Name: mantenimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mantenimientos (
    fi_mantenimiento_id integer NOT NULL,
    fi_equipo_id integer,
    fd_fecha date NOT NULL,
    fc_tipo character varying(50) DEFAULT 'Preventivo'::character varying,
    fc_responsable character varying(100),
    fc_descripcion text,
    fn_costo numeric(12,2) DEFAULT 0,
    fc_estado_post character varying(50),
    fd_proximo_mantenimiento date
);

ALTER TABLE public.mantenimientos OWNER TO postgres;

--
-- Name: mantenimientos_fi_mantenimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mantenimientos_fi_mantenimiento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.mantenimientos_fi_mantenimiento_id_seq OWNER TO postgres;

--
-- Name: mantenimientos_fi_mantenimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mantenimientos_fi_mantenimiento_id_seq OWNED BY public.mantenimientos.fi_mantenimiento_id;

--
-- Name: medellin_banos_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medellin_banos_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.medellin_banos_fi_id_seq OWNER TO postgres;

--
-- Name: medellin_banos_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medellin_banos_fi_id_seq OWNED BY public.banos.fi_id;

--
-- Name: medellin_inventario_alevines_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medellin_inventario_alevines_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.medellin_inventario_alevines_fi_id_seq OWNER TO postgres;

--
-- Name: medellin_inventario_alevines_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medellin_inventario_alevines_fi_id_seq OWNED BY public.inventario_alevines.fi_id;

--
-- Name: medicamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicamentos (
    fi_id integer NOT NULL,
    fd_fecha_hora timestamp(6) without time zone NOT NULL,
    fn_num_estanque integer,
    fc_diagnosis character varying(500),
    fc_tratamiento character varying(500),
    fc_dosis character varying(100),
    fc_forma_aplicacion character varying(100),
    fd_fecha_ultima_dosis date,
    fc_responsable character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50) NOT NULL
);

ALTER TABLE public.medicamentos OWNER TO postgres;

--
-- Name: medellin_medicamentos_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medellin_medicamentos_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.medellin_medicamentos_fi_id_seq OWNER TO postgres;

--
-- Name: medellin_medicamentos_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medellin_medicamentos_fi_id_seq OWNED BY public.medicamentos.fi_id;

--
-- Name: parametros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parametros (
    fi_id integer NOT NULL,
    fd_fecha date NOT NULL,
    fn_num_estanque integer,
    fn_oxigeno numeric,
    fn_temperatura numeric,
    fn_ph numeric,
    fn_amonio numeric,
    fn_nitritos numeric,
    fn_nitratos numeric,
    fc_responsable character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50) NOT NULL
);

ALTER TABLE public.parametros OWNER TO postgres;

--
-- Name: medellin_parametros_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medellin_parametros_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.medellin_parametros_fi_id_seq OWNER TO postgres;

--
-- Name: medellin_parametros_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medellin_parametros_fi_id_seq OWNED BY public.parametros.fi_id;

--
-- Name: plagas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plagas (
    fi_id integer NOT NULL,
    fd_fecha date NOT NULL,
    fc_num_trampa character varying(100),
    fc_hallazgo character varying(500),
    fc_malla character varying(200),
    fc_observaciones character varying(500),
    fc_verifico character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(100),
    tipo_trampa character varying(100),
    fc_veneno character varying(100),
    unidad_produccion character varying(100)
);

ALTER TABLE public.plagas OWNER TO postgres;

--
-- Name: medellin_plagas_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medellin_plagas_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.medellin_plagas_fi_id_seq OWNER TO postgres;

--
-- Name: medellin_plagas_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medellin_plagas_fi_id_seq OWNED BY public.plagas.fi_id;

--
-- Name: recambios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recambios (
    fi_id integer NOT NULL,
    fc_mes character varying(20),
    fn_num_instalacion integer,
    fd_fecha1 date,
    fc_tipo1 character varying(30),
    fd_fecha2 date,
    fc_tipo2 character varying(30),
    fd_fecha3 date,
    fc_tipo3 character varying(30),
    fd_fecha4 date,
    fc_tipo4 character varying(30),
    fd_fecha5 date,
    fc_tipo5 character varying(30),
    fd_fecha6 date,
    fc_tipo6 character varying(30),
    fc_responsable character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50) NOT NULL
);

ALTER TABLE public.recambios OWNER TO postgres;

--
-- Name: medellin_recambios_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medellin_recambios_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.medellin_recambios_fi_id_seq OWNER TO postgres;

--
-- Name: medellin_recambios_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medellin_recambios_fi_id_seq OWNED BY public.recambios.fi_id;

--
-- Name: recepcion_insumos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recepcion_insumos (
    fi_id integer NOT NULL,
    fc_mes character varying(20),
    fd_fecha date NOT NULL,
    fc_cantidad numeric(15,2),
    fc_lote character varying(100),
    fc_descripcion character varying(300),
    fc_encargado_entrega character varying(100),
    fc_verifico character varying(100),
    fc_observaciones character varying(500),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50),
    fc_proveedor character varying(100),
    fc_producto character varying(255),
    fc_unidad_medida character varying(255),
    fc_condiciones_entrega character varying(150)
);

ALTER TABLE public.recepcion_insumos OWNER TO postgres;

--
-- Name: medellin_recepcion_insumos_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medellin_recepcion_insumos_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.medellin_recepcion_insumos_fi_id_seq OWNER TO postgres;

--
-- Name: medellin_recepcion_insumos_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medellin_recepcion_insumos_fi_id_seq OWNED BY public.recepcion_insumos.fi_id;

--
-- Name: visitas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visitas (
    fi_id integer NOT NULL,
    fd_fecha date NOT NULL,
    fc_nombre_completo character varying(200),
    fc_origen character varying(200),
    fc_motivo character varying(300),
    fc_observaciones character varying(500),
    fc_foto_identificacion character varying(200),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50),
    fd_entrada time(6) without time zone,
    fd_salida time(6) without time zone
);

ALTER TABLE public.visitas OWNER TO postgres;

--
-- Name: medellin_visitas_fi_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medellin_visitas_fi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.medellin_visitas_fi_id_seq OWNER TO postgres;

--
-- Name: medellin_visitas_fi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medellin_visitas_fi_id_seq OWNED BY public.visitas.fi_id;

--
-- Name: nomina; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nomina (
    fi_nomina_id integer NOT NULL,
    fc_nombre_empleado character varying(120) NOT NULL,
    fi_empleado_id integer,
    fd_fecha_pago date DEFAULT CURRENT_DATE NOT NULL,
    fn_total numeric(10,2) DEFAULT 0,
    fn_bono numeric(10,2) DEFAULT 0,
    fn_deuda numeric(10,2) DEFAULT 0,
    fn_descuento numeric(10,2) DEFAULT 0,
    fn_anticipo numeric(10,2) DEFAULT 0,
    fi_usuario_id integer,
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_actualizacion timestamp(6) without time zone DEFAULT now()
);

ALTER TABLE public.nomina OWNER TO postgres;

--
-- Name: nomina_fi_nomina_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nomina_fi_nomina_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.nomina_fi_nomina_id_seq OWNER TO postgres;

--
-- Name: nomina_fi_nomina_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nomina_fi_nomina_id_seq OWNED BY public.nomina.fi_nomina_id;

--
-- Name: piletas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.piletas (
    fi_pileta_id integer NOT NULL,
    nombre_instalacion character varying(50),
    ubicacion character varying(100),
    fecha_registro date DEFAULT CURRENT_DATE NOT NULL,
    fd_fecha_modificacion date,
    fecha_siembra date DEFAULT now(),
    fecha_ultima_biometria date DEFAULT now(),
    cantidad integer DEFAULT 0,
    talla_gr numeric(10,2),
    observacion character varying(255),
    fi_usuario_id integer,
    fc_granja character varying(100),
    fi_instalacion_id integer,
    origen_instalacion character varying(100),
    fi_lote_id integer,
    CONSTRAINT chk_piletas_granja CHECK (((fc_granja)::text = ANY (ARRAY[('Granja Acuícola Medellin'::character varying)::text, ('Granja Acuícola La Ceiba'::character varying)::text])))
);

ALTER TABLE public.piletas OWNER TO postgres;

--
-- Name: piletas_fi_pileta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.piletas_fi_pileta_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.piletas_fi_pileta_id_seq OWNER TO postgres;

--
-- Name: piletas_fi_pileta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.piletas_fi_pileta_id_seq OWNED BY public.piletas.fi_pileta_id;

--
-- Name: piletas_fi_pileta_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.piletas ALTER COLUMN fi_pileta_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.piletas_fi_pileta_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    empresa character varying(255),
    rfc character varying(50),
    categoria character varying(100),
    contacto character varying(150),
    telefono character varying(50),
    correo character varying(150),
    direccion text,
    forma_pago character varying(50),
    plazo_credito integer,
    ultima_compra date,
    monto_promedio numeric(12,2) DEFAULT 0,
    activo boolean DEFAULT true,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.proveedores OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.proveedores_id_seq OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;

--
-- Name: trazabilidad_engorda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trazabilidad_engorda (
    fi_movimiento_id integer NOT NULL,
    fi_engorda_origen integer,
    fi_engorda_destino integer,
    cantidad_trasladada integer NOT NULL,
    fecha_movimiento date DEFAULT CURRENT_DATE,
    observacion text,
    fi_usuario_id integer,
    CONSTRAINT rastreabilidad_engorda_cantidad_trasladada_check CHECK (((cantidad_trasladada)::numeric > (0)::numeric))
);

ALTER TABLE public.trazabilidad_engorda OWNER TO postgres;

--
-- Name: rastreabilidad_engorda_fi_movimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rastreabilidad_engorda_fi_movimiento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.rastreabilidad_engorda_fi_movimiento_id_seq OWNER TO postgres;

--
-- Name: rastreabilidad_engorda_fi_movimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rastreabilidad_engorda_fi_movimiento_id_seq OWNED BY public.trazabilidad_engorda.fi_movimiento_id;

--
-- Name: trazabilidad_alevinaje; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trazabilidad_alevinaje (
    fi_movimiento_id integer NOT NULL,
    fi_pileta_origen integer,
    fi_pileta_destino integer,
    cantidad integer NOT NULL,
    fecha_movimiento date DEFAULT CURRENT_DATE,
    observacion text,
    fi_usuario_id integer,
    fi_lote_id integer,
    tipo_movimiento character varying(20) DEFAULT 'traslado'::character varying,
    origen_externo text,
    fc_granja character varying(100),
    fi_instalacion_origen integer,
    fi_instalacion_destino integer
);

ALTER TABLE public.trazabilidad_alevinaje OWNER TO postgres;

--
-- Name: rastreabilidad_fi_movimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rastreabilidad_fi_movimiento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.rastreabilidad_fi_movimiento_id_seq OWNER TO postgres;

--
-- Name: rastreabilidad_fi_movimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rastreabilidad_fi_movimiento_id_seq OWNED BY public.trazabilidad_alevinaje.fi_movimiento_id;

--
-- Name: trazabilidad_reproductores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trazabilidad_reproductores (
    fi_movimiento_id integer NOT NULL,
    fi_repro_origen integer,
    fi_repro_destino integer,
    cantidad_trasladada integer,
    fecha_movimiento date,
    observacion text,
    fi_usuario_id integer,
    origen_texto character varying(150),
    CONSTRAINT chk_origen_reproductores CHECK (((origen_texto IS NOT NULL) OR (fi_repro_origen IS NOT NULL)))
);

ALTER TABLE public.trazabilidad_reproductores OWNER TO postgres;

--
-- Name: rastreabilidad_reproductores_fi_movimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rastreabilidad_reproductores_fi_movimiento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.rastreabilidad_reproductores_fi_movimiento_id_seq OWNER TO postgres;

--
-- Name: rastreabilidad_reproductores_fi_movimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rastreabilidad_reproductores_fi_movimiento_id_seq OWNED BY public.trazabilidad_reproductores.fi_movimiento_id;

--
-- Name: reproductores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reproductores (
    fi_reproductor_id integer NOT NULL,
    fc_instalacion character varying(50),
    fn_cantidad integer,
    fn_talla numeric(10,2),
    fc_observacion character varying(100),
    fd_fecha_siembra date,
    fd_fecha_biometria date,
    fi_usuario_id integer,
    fd_fecha_registro timestamp(6) without time zone,
    fn_machos integer DEFAULT 0,
    fn_hembras integer DEFAULT 0,
    fc_ratio character varying(10),
    fc_granja character varying(100),
    fc_linea character varying(50),
    fc_familia character varying(20)
);

ALTER TABLE public.reproductores OWNER TO postgres;

--
-- Name: reproductores_fi_reproductor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reproductores_fi_reproductor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.reproductores_fi_reproductor_id_seq OWNER TO postgres;

--
-- Name: reproductores_fi_reproductor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reproductores_fi_reproductor_id_seq OWNED BY public.reproductores.fi_reproductor_id;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    fi_rol_id integer NOT NULL,
    fc_nombre character varying(50) NOT NULL,
    fb_es_root boolean DEFAULT false
);

ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_fi_rol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_fi_rol_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.roles_fi_rol_id_seq OWNER TO postgres;

--
-- Name: roles_fi_rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_fi_rol_id_seq OWNED BY public.roles.fi_rol_id;

--
-- Name: roles_fi_rol_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.roles ALTER COLUMN fi_rol_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.roles_fi_rol_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    fi_usuario_id integer NOT NULL,
    fc_nombre character varying(100) NOT NULL,
    "fc_contraseña" character varying(255) NOT NULL,
    fi_rol_id integer NOT NULL,
    fi_empresa_id integer,
    fb_activo boolean NOT NULL DEFAULT true
);

ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_fi_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_fi_usuario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.usuarios_fi_usuario_id_seq OWNER TO postgres;

--
-- Name: usuarios_fi_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_fi_usuario_id_seq OWNED BY public.usuarios.fi_usuario_id;

--
-- Name: usuarios_fi_usuario_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios ALTER COLUMN fi_usuario_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuarios_fi_usuario_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: vacaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vacaciones (
    fi_vacacion_id integer NOT NULL,
    fc_nombre_empleado character varying(120) NOT NULL,
    fi_empleado_id integer,
    fd_inicio_periodo date NOT NULL,
    fd_fin_periodo date NOT NULL,
    fc_departamento character varying(80),
    fn_dias_trabajados integer DEFAULT 0,
    fn_vacaciones_v integer DEFAULT 0,
    fn_enfermedad_e integer DEFAULT 0,
    fn_maternidad_m integer DEFAULT 0,
    fn_permiso_parcial_pp integer DEFAULT 0,
    fn_permiso_total_pt integer DEFAULT 0,
    fn_inasistencias_i integer DEFAULT 0,
    fn_vacaciones_anio integer DEFAULT 0,
    fn_dias_previos integer DEFAULT 0,
    fn_vacaciones_disponibles integer DEFAULT 0,
    fn_vacaciones_disfrutadas integer DEFAULT 0,
    fd_fecha_actualizacion timestamp(6) without time zone DEFAULT now(),
    fc_asistencia character varying(50) DEFAULT 'Asistió'::character varying
);

ALTER TABLE public.vacaciones OWNER TO postgres;

--
-- Name: vacaciones_fi_vacacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vacaciones_fi_vacacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE public.vacaciones_fi_vacacion_id_seq OWNER TO postgres;

--
-- Name: vacaciones_fi_vacacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vacaciones_fi_vacacion_id_seq OWNED BY public.vacaciones.fi_vacacion_id;

--
-- Name: ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas (
    fi_venta_id integer NOT NULL,
    fn_monto_total numeric(12,2) NOT NULL,
    fd_fecha_venta date NOT NULL,
    fd_fecha_registro date DEFAULT now() NOT NULL,
    fd_fecha_modificacion date DEFAULT now() NOT NULL,
    fc_observaciones text,
    fc_cliente character varying(150) NOT NULL,
    fn_cantidad_vendida integer NOT NULL,
    fn_precio_venta numeric(10,2) NOT NULL,
    fc_encargado_venta text,
    fn_abonado numeric(12,2) DEFAULT 0,
    fn_adeudo numeric(12,2),
    fc_empresa text NOT NULL,
    fc_folio character varying(50),
    fc_tipo_venta character varying(50) NOT NULL,
    fc_estado_pago character varying(20) DEFAULT 'ADEUDO'::character varying
);

ALTER TABLE public.ventas OWNER TO postgres;

--
-- Name: ventas_fi_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ventas_fi_venta_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.ventas_fi_venta_id_seq OWNER TO postgres;

--
-- Name: ventas_fi_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ventas_fi_venta_id_seq OWNED BY public.ventas.fi_venta_id;

--
-- Name: vw_tesoreria_general; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_tesoreria_general AS
 SELECT fc_granja,
    fc_mes,
    fc_categoria,
    sum(fn_ingreso) AS total_ingreso,
    sum(fn_egreso) AS total_egreso,
    sum((fn_ingreso - fn_egreso)) AS saldo_neto
   FROM public.flujo_caja
  WHERE ((fn_ingreso IS NOT NULL) OR (fn_egreso IS NOT NULL))
  GROUP BY fc_granja, fc_mes, fc_categoria
  ORDER BY fc_granja, fc_mes, fc_categoria;

ALTER VIEW public.vw_tesoreria_general OWNER TO postgres;

--
-- Name: vw_tesoreria_overview; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_tesoreria_overview AS
 SELECT EXTRACT(year FROM f.fd_fecha) AS anio,
    to_char((f.fd_fecha)::timestamp with time zone, 'YYYY-MM'::text) AS periodo,
    initcap(to_char((f.fd_fecha)::timestamp with time zone, 'TMMonth'::text)) AS mes_nombre,
    upper((f.fc_granja)::text) AS fc_granja,
    c.tipo_principal AS grupo,
    c.subcategoria AS subgrupo,
    c.nombre AS categoria,
    round(sum(f.fn_ingreso), 2) AS total_ingreso,
    round(sum(f.fn_egreso), 2) AS total_egreso,
    round(sum((f.fn_ingreso - f.fn_egreso)), 2) AS saldo_neto
   FROM (public.flujo_caja f
     LEFT JOIN public.categorias c ON ((f.categoria_id = c.id)))
  GROUP BY (EXTRACT(year FROM f.fd_fecha)), (to_char((f.fd_fecha)::timestamp with time zone, 'YYYY-MM'::text)), (initcap(to_char((f.fd_fecha)::timestamp with time zone, 'TMMonth'::text))), f.fc_granja, c.tipo_principal, c.subcategoria, c.nombre
  ORDER BY (EXTRACT(year FROM f.fd_fecha)), (to_char((f.fd_fecha)::timestamp with time zone, 'YYYY-MM'::text)), c.tipo_principal, c.subcategoria, c.nombre;

ALTER VIEW public.vw_tesoreria_overview OWNER TO postgres;

--
-- Name: puestos; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.puestos (
    fi_puesto_id integer NOT NULL,
    fc_nombre character varying(120) NOT NULL,
    fb_activo boolean DEFAULT true
);

ALTER TABLE rrhh.puestos OWNER TO postgres;

ALTER TABLE rrhh.puestos ALTER COLUMN fi_puesto_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME rrhh.puestos_fi_puesto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: tipos_documento; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.tipos_documento (
    fi_tipo_documento_id integer NOT NULL,
    fc_nombre character varying(80) NOT NULL,
    fb_obligatorio boolean DEFAULT false,
    fb_activo boolean DEFAULT true
);

ALTER TABLE rrhh.tipos_documento OWNER TO postgres;

ALTER TABLE rrhh.tipos_documento ALTER COLUMN fi_tipo_documento_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME rrhh.tipos_documento_fi_tipo_documento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: departamentos; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.departamentos (
    fi_departamento_id integer NOT NULL,
    fc_nombre character varying(80) NOT NULL,
    fb_activo boolean DEFAULT true
);

ALTER TABLE rrhh.departamentos OWNER TO postgres;

--
-- Name: departamentos_fi_departamento_id_seq; Type: SEQUENCE; Schema: rrhh; Owner: postgres
--

ALTER TABLE rrhh.departamentos ALTER COLUMN fi_departamento_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME rrhh.departamentos_fi_departamento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: empleados; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.empleados (
    fi_empleado_id integer NOT NULL,
    fi_usuario_id integer,
    fi_departamento_id integer NOT NULL,
    fi_puesto_id integer,
    fc_nombre character varying(60) NOT NULL,
    fc_apellido_paterno character varying(60) NOT NULL,
    fc_apellido_materno character varying(60) NOT NULL,
    fc_genero character varying(20),
    fd_fecha_nacimiento date,
    fc_estado character varying(50),
    fc_ciudad character varying(60),
    fc_calle character varying(120),
    fc_codigo_postal character varying(10),
    fc_referencias character varying(255),
    ft_comentarios_adicionales text,
    fd_fecha_contratacion date,
    fn_uniformes integer DEFAULT 0,
    fb_activo boolean DEFAULT true,
    fd_fecha_alta date DEFAULT CURRENT_DATE
);

ALTER TABLE rrhh.empleados OWNER TO postgres;

--
-- Name: empleados_fi_empleado_id_seq; Type: SEQUENCE; Schema: rrhh; Owner: postgres
--

ALTER TABLE rrhh.empleados ALTER COLUMN fi_empleado_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME rrhh.empleados_fi_empleado_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: documentos_empleado; Type: TABLE; Schema: rrhh; Owner: postgres
--

CREATE TABLE rrhh.documentos_empleado (
    fi_documento_id integer NOT NULL,
    fi_empleado_id integer NOT NULL,
    fi_tipo_documento_id integer NOT NULL,
    fc_ruta_archivo character varying(500) NOT NULL,
    fc_nombre_original character varying(255) NOT NULL,
    fd_fecha_carga date DEFAULT CURRENT_DATE
);

ALTER TABLE rrhh.documentos_empleado OWNER TO postgres;

ALTER TABLE rrhh.documentos_empleado ALTER COLUMN fi_documento_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME rrhh.documentos_empleado_fi_documento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: modulos; Type: TABLE; Schema: seguridad; Owner: postgres
--

CREATE TABLE seguridad.modulos (
    fi_modulo_id integer NOT NULL,
    fc_nombre character varying(50) NOT NULL,
    fc_ruta character varying(100) NOT NULL,
    fb_activo boolean DEFAULT true
);

ALTER TABLE seguridad.modulos OWNER TO postgres;

--
-- Name: modulos_fi_modulo_id_seq; Type: SEQUENCE; Schema: seguridad; Owner: postgres
--

ALTER TABLE seguridad.modulos ALTER COLUMN fi_modulo_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME seguridad.modulos_fi_modulo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

--
-- Name: roles_modulos; Type: TABLE; Schema: seguridad; Owner: postgres
--

CREATE TABLE seguridad.roles_modulos (
    fi_rol_id integer NOT NULL,
    fi_modulo_id integer NOT NULL
);

ALTER TABLE seguridad.roles_modulos OWNER TO postgres;

--
-- Name: alimentacion fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alimentacion ALTER COLUMN fi_id SET DEFAULT nextval('public.ceiba_alimentacion_fi_id_seq'::regclass);

--
-- Name: banos fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banos ALTER COLUMN fi_id SET DEFAULT nextval('public.medellin_banos_fi_id_seq'::regclass);

--
-- Name: biometrias fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometrias ALTER COLUMN fi_id SET DEFAULT nextval('public.ceiba_biometrias_fi_id_seq'::regclass);

--
-- Name: caja_ahorro_movimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_ahorro_movimientos ALTER COLUMN id SET DEFAULT nextval('public.caja_ahorro_movimientos_id_seq'::regclass);

--
-- Name: caja_ahorro_resumen id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_ahorro_resumen ALTER COLUMN id SET DEFAULT nextval('public.caja_ahorro_resumen_id_seq'::regclass);

--
-- Name: cat_caja_ahorro_categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_caja_ahorro_categorias ALTER COLUMN id SET DEFAULT nextval('public.cat_caja_ahorro_categorias_id_seq'::regclass);

--
-- Name: cat_tesoreria_categorias fi_categoria_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_tesoreria_categorias ALTER COLUMN fi_categoria_id SET DEFAULT nextval('public.cat_tesoreria_categorias_fi_categoria_id_seq'::regclass);

--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);

--
-- Name: cuentas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas ALTER COLUMN id SET DEFAULT nextval('public.cuentas_id_seq'::regclass);

--
-- Name: engorda fi_engorda_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engorda ALTER COLUMN fi_engorda_id SET DEFAULT nextval('public.engorda_fi_engorda_id_seq'::regclass);

--
-- Name: equipos fi_equipo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos ALTER COLUMN fi_equipo_id SET DEFAULT nextval('public.equipos_fi_equipo_id_seq'::regclass);

--
-- Name: flujo_caja fi_movimiento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flujo_caja ALTER COLUMN fi_movimiento_id SET DEFAULT nextval('public.flujo_caja_fi_movimiento_id_seq'::regclass);

--
-- Name: instalaciones fi_instalacion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones ALTER COLUMN fi_instalacion_id SET DEFAULT nextval('public.instalaciones_fi_instalacion_id_seq'::regclass);

--
-- Name: insumos fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insumos ALTER COLUMN fi_id SET DEFAULT nextval('public.ceiba_insumos_fi_id_seq'::regclass);

--
-- Name: inventario_alevines fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_alevines ALTER COLUMN fi_id SET DEFAULT nextval('public.medellin_inventario_alevines_fi_id_seq'::regclass);

--
-- Name: limpieza fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.limpieza ALTER COLUMN fi_id SET DEFAULT nextval('public.ceiba_limpieza_fi_id_seq'::regclass);

--
-- Name: lista_espera fi_lista_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lista_espera ALTER COLUMN fi_lista_id SET DEFAULT nextval('public.lista_espera_fi_lista_id_seq'::regclass);

--
-- Name: lote_movimientos fi_mov_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lote_movimientos ALTER COLUMN fi_mov_id SET DEFAULT nextval('public.lote_movimientos_fi_mov_id_seq'::regclass);

--
-- Name: lotes fi_lote_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lotes ALTER COLUMN fi_lote_id SET DEFAULT nextval('public.lotes_fi_lote_id_seq'::regclass);

--
-- Name: mantenimientos fi_mantenimiento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos ALTER COLUMN fi_mantenimiento_id SET DEFAULT nextval('public.mantenimientos_fi_mantenimiento_id_seq'::regclass);

--
-- Name: medicamentos fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamentos ALTER COLUMN fi_id SET DEFAULT nextval('public.medellin_medicamentos_fi_id_seq'::regclass);

--
-- Name: nomina fi_nomina_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomina ALTER COLUMN fi_nomina_id SET DEFAULT nextval('public.nomina_fi_nomina_id_seq'::regclass);

--
-- Name: parametros fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parametros ALTER COLUMN fi_id SET DEFAULT nextval('public.medellin_parametros_fi_id_seq'::regclass);

--
-- Name: plagas fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plagas ALTER COLUMN fi_id SET DEFAULT nextval('public.medellin_plagas_fi_id_seq'::regclass);

--
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);

--
-- Name: recambios fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recambios ALTER COLUMN fi_id SET DEFAULT nextval('public.medellin_recambios_fi_id_seq'::regclass);

--
-- Name: recepcion_insumos fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_insumos ALTER COLUMN fi_id SET DEFAULT nextval('public.medellin_recepcion_insumos_fi_id_seq'::regclass);

--
-- Name: reproductores fi_reproductor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproductores ALTER COLUMN fi_reproductor_id SET DEFAULT nextval('public.reproductores_fi_reproductor_id_seq'::regclass);

--
-- Name: trazabilidad_alevinaje fi_movimiento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_alevinaje ALTER COLUMN fi_movimiento_id SET DEFAULT nextval('public.rastreabilidad_fi_movimiento_id_seq'::regclass);

--
-- Name: trazabilidad_engorda fi_movimiento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_engorda ALTER COLUMN fi_movimiento_id SET DEFAULT nextval('public.rastreabilidad_engorda_fi_movimiento_id_seq'::regclass);

--
-- Name: trazabilidad_reproductores fi_movimiento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_reproductores ALTER COLUMN fi_movimiento_id SET DEFAULT nextval('public.rastreabilidad_reproductores_fi_movimiento_id_seq'::regclass);

--
-- Name: vacaciones fi_vacacion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacaciones ALTER COLUMN fi_vacacion_id SET DEFAULT nextval('public.vacaciones_fi_vacacion_id_seq'::regclass);

--
-- Name: ventas fi_venta_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas ALTER COLUMN fi_venta_id SET DEFAULT nextval('public.ventas_fi_venta_id_seq'::regclass);

--
-- Name: visitas fi_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas ALTER COLUMN fi_id SET DEFAULT nextval('public.medellin_visitas_fi_id_seq'::regclass);

--
-- Name: alimentos alimentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alimentos
    ADD CONSTRAINT alimentos_pkey PRIMARY KEY (fi_alimento_id);

--
-- Name: caja_ahorro_movimientos caja_ahorro_movimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_ahorro_movimientos
    ADD CONSTRAINT caja_ahorro_movimientos_pkey PRIMARY KEY (id);

--
-- Name: caja_ahorro_resumen caja_ahorro_resumen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_ahorro_resumen
    ADD CONSTRAINT caja_ahorro_resumen_pkey PRIMARY KEY (id);

--
-- Name: cat_caja_ahorro_categorias cat_caja_ahorro_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_caja_ahorro_categorias
    ADD CONSTRAINT cat_caja_ahorro_categorias_pkey PRIMARY KEY (id);

--
-- Name: cat_tesoreria_categorias cat_tesoreria_categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cat_tesoreria_categorias
    ADD CONSTRAINT cat_tesoreria_categorias_pkey PRIMARY KEY (fi_categoria_id);

--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);

--
-- Name: alimentacion ceiba_alimentacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alimentacion
    ADD CONSTRAINT ceiba_alimentacion_pkey PRIMARY KEY (fi_id);

--
-- Name: biometrias ceiba_biometrias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometrias
    ADD CONSTRAINT ceiba_biometrias_pkey PRIMARY KEY (fi_id);

--
-- Name: insumos ceiba_insumos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.insumos
    ADD CONSTRAINT ceiba_insumos_pkey PRIMARY KEY (fi_id);

--
-- Name: limpieza ceiba_limpieza_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.limpieza
    ADD CONSTRAINT ceiba_limpieza_pkey PRIMARY KEY (fi_id);

--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (fi_cliente_id);

--
-- Name: cuentas cuentas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas
    ADD CONSTRAINT cuentas_pkey PRIMARY KEY (id);

--
-- Name: engorda engorda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engorda
    ADD CONSTRAINT engorda_pkey PRIMARY KEY (fi_engorda_id);

--
-- Name: equipos equipos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_pkey PRIMARY KEY (fi_equipo_id);

--
-- Name: flujo_caja flujo_caja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flujo_caja
    ADD CONSTRAINT flujo_caja_pkey PRIMARY KEY (fi_movimiento_id);

--
-- Name: instalaciones instalaciones_nombre_granja_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones
    ADD CONSTRAINT instalaciones_nombre_granja_unique UNIQUE (nombre_instalacion, fc_granja);

--
-- Name: instalaciones instalaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones
    ADD CONSTRAINT instalaciones_pkey PRIMARY KEY (fi_instalacion_id);

--
-- Name: lista_espera lista_espera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lista_espera
    ADD CONSTRAINT lista_espera_pkey PRIMARY KEY (fi_lista_id);

--
-- Name: lote_movimientos lote_movimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lote_movimientos
    ADD CONSTRAINT lote_movimientos_pkey PRIMARY KEY (fi_mov_id);

--
-- Name: lotes lotes_no_lote_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lotes
    ADD CONSTRAINT lotes_no_lote_key UNIQUE (no_lote);

--
-- Name: lotes lotes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lotes
    ADD CONSTRAINT lotes_pkey PRIMARY KEY (fi_lote_id);

--
-- Name: mantenimientos mantenimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos
    ADD CONSTRAINT mantenimientos_pkey PRIMARY KEY (fi_mantenimiento_id);

--
-- Name: banos medellin_banos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banos
    ADD CONSTRAINT medellin_banos_pkey PRIMARY KEY (fi_id);

--
-- Name: inventario_alevines medellin_inventario_alevines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventario_alevines
    ADD CONSTRAINT medellin_inventario_alevines_pkey PRIMARY KEY (fi_id);

--
-- Name: medicamentos medellin_medicamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicamentos
    ADD CONSTRAINT medellin_medicamentos_pkey PRIMARY KEY (fi_id);

--
-- Name: parametros medellin_parametros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parametros
    ADD CONSTRAINT medellin_parametros_pkey PRIMARY KEY (fi_id);

--
-- Name: plagas medellin_plagas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plagas
    ADD CONSTRAINT medellin_plagas_pkey PRIMARY KEY (fi_id);

--
-- Name: recambios medellin_recambios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recambios
    ADD CONSTRAINT medellin_recambios_pkey PRIMARY KEY (fi_id);

--
-- Name: recepcion_insumos medellin_recepcion_insumos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_insumos
    ADD CONSTRAINT medellin_recepcion_insumos_pkey PRIMARY KEY (fi_id);

--
-- Name: visitas medellin_visitas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visitas
    ADD CONSTRAINT medellin_visitas_pkey PRIMARY KEY (fi_id);

--
-- Name: nomina nomina_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomina
    ADD CONSTRAINT nomina_pkey PRIMARY KEY (fi_nomina_id);

--
-- Name: piletas piletas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piletas
    ADD CONSTRAINT piletas_pkey PRIMARY KEY (fi_pileta_id);

--
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);

--
-- Name: trazabilidad_engorda rastreabilidad_engorda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_engorda
    ADD CONSTRAINT rastreabilidad_engorda_pkey PRIMARY KEY (fi_movimiento_id);

--
-- Name: trazabilidad_alevinaje rastreabilidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_alevinaje
    ADD CONSTRAINT rastreabilidad_pkey PRIMARY KEY (fi_movimiento_id);

--
-- Name: trazabilidad_reproductores rastreabilidad_reproductores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_reproductores
    ADD CONSTRAINT rastreabilidad_reproductores_pkey PRIMARY KEY (fi_movimiento_id);

--
-- Name: reproductores reproductores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproductores
    ADD CONSTRAINT reproductores_pkey PRIMARY KEY (fi_reproductor_id);

--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (fi_rol_id);

--
-- Name: usuarios usuarios_fc_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_fc_nombre_key UNIQUE (fc_nombre);

--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (fi_usuario_id);

--
-- Name: vacaciones vacaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vacaciones
    ADD CONSTRAINT vacaciones_pkey PRIMARY KEY (fi_vacacion_id);

--
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (fi_venta_id);

--
-- Name: puestos puestos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.puestos
    ADD CONSTRAINT puestos_pkey PRIMARY KEY (fi_puesto_id);

--
-- Name: tipos_documento tipos_documento_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.tipos_documento
    ADD CONSTRAINT tipos_documento_pkey PRIMARY KEY (fi_tipo_documento_id);

--
-- Name: documentos_empleado documentos_empleado_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.documentos_empleado
    ADD CONSTRAINT documentos_empleado_pkey PRIMARY KEY (fi_documento_id);

--
-- Name: documentos_empleado documentos_empleado_unique; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.documentos_empleado
    ADD CONSTRAINT documentos_empleado_unique UNIQUE (fi_empleado_id, fi_tipo_documento_id);

--
-- Name: departamentos departamentos_fc_nombre_key; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.departamentos
    ADD CONSTRAINT departamentos_fc_nombre_key UNIQUE (fc_nombre);

--
-- Name: departamentos departamentos_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.departamentos
    ADD CONSTRAINT departamentos_pkey PRIMARY KEY (fi_departamento_id);

--
-- Name: empleados empleados_fi_usuario_id_key; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.empleados
    ADD CONSTRAINT empleados_fi_usuario_id_key UNIQUE (fi_usuario_id);

--
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (fi_empleado_id);

--
-- Name: modulos modulos_fc_nombre_key; Type: CONSTRAINT; Schema: seguridad; Owner: postgres
--

ALTER TABLE ONLY seguridad.modulos
    ADD CONSTRAINT modulos_fc_nombre_key UNIQUE (fc_nombre);

--
-- Name: modulos modulos_fc_ruta_key; Type: CONSTRAINT; Schema: seguridad; Owner: postgres
--

ALTER TABLE ONLY seguridad.modulos
    ADD CONSTRAINT modulos_fc_ruta_key UNIQUE (fc_ruta);

--
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: postgres
--

ALTER TABLE ONLY seguridad.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (fi_modulo_id);

--
-- Name: roles_modulos roles_modulos_pkey; Type: CONSTRAINT; Schema: seguridad; Owner: postgres
--

ALTER TABLE ONLY seguridad.roles_modulos
    ADD CONSTRAINT roles_modulos_pkey PRIMARY KEY (fi_rol_id, fi_modulo_id);

--
-- Name: fki_fi_rol_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_fi_rol_id ON public.usuarios USING btree (fi_rol_id);

--
-- Name: unico_root; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unico_root ON public.roles USING btree (fb_es_root) WHERE (fb_es_root = true);

--
-- Name: caja_ahorro_movimientos caja_ahorro_movimientos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_ahorro_movimientos
    ADD CONSTRAINT caja_ahorro_movimientos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.cat_caja_ahorro_categorias(id) ON UPDATE CASCADE ON DELETE SET NULL;

--
-- Name: engorda engorda_fi_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engorda
    ADD CONSTRAINT engorda_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id) ON DELETE RESTRICT;

--
-- Name: equipos equipos_fi_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id);

--
-- Name: usuarios fi_rol_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fi_rol_id FOREIGN KEY (fi_rol_id) REFERENCES public.roles(fi_rol_id);

--
-- Name: clientes fi_usuario_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT fi_usuario_id FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id);

--
-- Name: alimentos fk_alimentos_engorda; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alimentos
    ADD CONSTRAINT fk_alimentos_engorda FOREIGN KEY (fi_engorda_id) REFERENCES public.engorda(fi_engorda_id) ON DELETE SET NULL;

--
-- Name: biometrias fk_biometrias_reproductores; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometrias
    ADD CONSTRAINT fk_biometrias_reproductores FOREIGN KEY (fi_reproductor_id) REFERENCES public.reproductores(fi_reproductor_id) ON DELETE CASCADE;

--
-- Name: engorda fk_engorda_lote; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engorda
    ADD CONSTRAINT fk_engorda_lote FOREIGN KEY (fi_lote_id) REFERENCES public.lotes(fi_lote_id) ON DELETE SET NULL;

--
-- Name: trazabilidad_alevinaje fk_mov_lote; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_alevinaje
    ADD CONSTRAINT fk_mov_lote FOREIGN KEY (fi_lote_id) REFERENCES public.lotes(fi_lote_id);

--
-- Name: alimentos fk_pileta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alimentos
    ADD CONSTRAINT fk_pileta FOREIGN KEY (fi_pileta_id) REFERENCES public.piletas(fi_pileta_id) ON DELETE CASCADE;

--
-- Name: alimentos fk_reproductor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alimentos
    ADD CONSTRAINT fk_reproductor FOREIGN KEY (fi_reproductor_id) REFERENCES public.reproductores(fi_reproductor_id);

--
-- Name: alimentos fk_usuario_alimentos; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alimentos
    ADD CONSTRAINT fk_usuario_alimentos FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id) ON DELETE RESTRICT;

--
-- Name: instalaciones instalaciones_fi_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones
    ADD CONSTRAINT instalaciones_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id) ON DELETE RESTRICT;

--
-- Name: lote_movimientos lote_movimientos_fi_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lote_movimientos
    ADD CONSTRAINT lote_movimientos_fi_lote_id_fkey FOREIGN KEY (fi_lote_id) REFERENCES public.lotes(fi_lote_id) ON DELETE CASCADE;

--
-- Name: mantenimientos mantenimientos_fi_equipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mantenimientos
    ADD CONSTRAINT mantenimientos_fi_equipo_id_fkey FOREIGN KEY (fi_equipo_id) REFERENCES public.equipos(fi_equipo_id) ON DELETE CASCADE;

--
-- Name: piletas piletas_fi_instalacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piletas
    ADD CONSTRAINT piletas_fi_instalacion_id_fkey FOREIGN KEY (fi_instalacion_id) REFERENCES public.instalaciones(fi_instalacion_id);

--
-- Name: trazabilidad_engorda rastreabilidad_engorda_fi_engorda_destino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_engorda
    ADD CONSTRAINT rastreabilidad_engorda_fi_engorda_destino_fkey FOREIGN KEY (fi_engorda_destino) REFERENCES public.engorda(fi_engorda_id) ON DELETE CASCADE;

--
-- Name: trazabilidad_engorda rastreabilidad_engorda_fi_engorda_origen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_engorda
    ADD CONSTRAINT rastreabilidad_engorda_fi_engorda_origen_fkey FOREIGN KEY (fi_engorda_origen) REFERENCES public.engorda(fi_engorda_id) ON DELETE CASCADE;

--
-- Name: trazabilidad_engorda rastreabilidad_engorda_fi_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_engorda
    ADD CONSTRAINT rastreabilidad_engorda_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id);

--
-- Name: trazabilidad_alevinaje rastreabilidad_fi_pileta_destino_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_alevinaje
    ADD CONSTRAINT rastreabilidad_fi_pileta_destino_fkey FOREIGN KEY (fi_pileta_destino) REFERENCES public.piletas(fi_pileta_id) ON DELETE SET NULL;

--
-- Name: trazabilidad_alevinaje rastreabilidad_fi_pileta_origen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_alevinaje
    ADD CONSTRAINT rastreabilidad_fi_pileta_origen_fkey FOREIGN KEY (fi_pileta_origen) REFERENCES public.piletas(fi_pileta_id) ON DELETE SET NULL;

--
-- Name: trazabilidad_alevinaje rastreabilidad_fi_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trazabilidad_alevinaje
    ADD CONSTRAINT rastreabilidad_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id);

--
-- Name: empleados empleados_fi_departamento_id_fkey; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.empleados
    ADD CONSTRAINT empleados_fi_departamento_id_fkey FOREIGN KEY (fi_departamento_id) REFERENCES rrhh.departamentos(fi_departamento_id) ON DELETE RESTRICT;

--
-- Name: empleados empleados_fi_puesto_id_fkey; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.empleados
    ADD CONSTRAINT empleados_fi_puesto_id_fkey FOREIGN KEY (fi_puesto_id) REFERENCES rrhh.puestos(fi_puesto_id) ON DELETE RESTRICT;

--
-- Name: empleados empleados_fi_usuario_id_fkey; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.empleados
    ADD CONSTRAINT empleados_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id) ON DELETE RESTRICT;

--
-- Name: documentos_empleado documentos_empleado_fi_empleado_id_fkey; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.documentos_empleado
    ADD CONSTRAINT documentos_empleado_fi_empleado_id_fkey FOREIGN KEY (fi_empleado_id) REFERENCES rrhh.empleados(fi_empleado_id) ON DELETE CASCADE;

--
-- Name: documentos_empleado documentos_empleado_fi_tipo_documento_id_fkey; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.documentos_empleado
    ADD CONSTRAINT documentos_empleado_fi_tipo_documento_id_fkey FOREIGN KEY (fi_tipo_documento_id) REFERENCES rrhh.tipos_documento(fi_tipo_documento_id);

--
-- Name: roles_modulos roles_modulos_fi_modulo_id_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: postgres
--

ALTER TABLE ONLY seguridad.roles_modulos
    ADD CONSTRAINT roles_modulos_fi_modulo_id_fkey FOREIGN KEY (fi_modulo_id) REFERENCES seguridad.modulos(fi_modulo_id);

--
-- Name: roles_modulos roles_modulos_fi_rol_id_fkey; Type: FK CONSTRAINT; Schema: seguridad; Owner: postgres
--

ALTER TABLE ONLY seguridad.roles_modulos
    ADD CONSTRAINT roles_modulos_fi_rol_id_fkey FOREIGN KEY (fi_rol_id) REFERENCES public.roles(fi_rol_id);

--
-- Data for initial setup
--

INSERT INTO public.roles (fi_rol_id, fc_nombre, fb_es_root) OVERRIDING SYSTEM VALUE
VALUES (1, 'Administrador', true)
ON CONFLICT (fi_rol_id) DO UPDATE
SET fc_nombre = EXCLUDED.fc_nombre,
    fb_es_root = EXCLUDED.fb_es_root;

INSERT INTO public.usuarios (fc_nombre, "fc_contraseña", fi_rol_id)
VALUES ('admin', '$2b$10$MAj2BLZF7j2s2Ors05KVfeASNl1m7IXUhnfzjzxe8MOJpj/KgYXP.', 1)
ON CONFLICT (fc_nombre) DO NOTHING;

-- Modulos base del menu (idempotente)
WITH modulos_base (fc_nombre, fc_ruta, fb_activo) AS (
  VALUES
    ('Dashboard', '/', true),
    ('Operaciones', '/operaciones', true),
    ('Inventarios', '/inventarios', true),
    ('Finanzas', '/finanzas', true),
    ('RRHH', '/rrhh', true),
    ('Catálogos', '/catalogos', true),
    ('Seguridad', '/seguridad', true),
    ('Roles', '/roles', true),
    ('Usuarios', '/usuarios', true),
    ('Piletas', '/piletas', true),
    ('Instalaciones', '/instalaciones', true),
    ('Lotes', '/lotes', true),
    ('Reproductores', '/reproductores', true),
    ('Engorda', '/engorda', true),
    ('Clientes', '/clientes', true),
    ('Ventas', '/ventas', true),
    ('Alimentos', '/alimentos', true),
    ('Lista de Espera', '/lista-espera', true),
    ('Equipos', '/equipos', true),
    ('Nomina', '/nomina', true),
    ('Vacaciones', '/vacaciones', true),
    ('Caja de Ahorro', '/caja-ahorro', true),
    ('Proveedores', '/proveedores', true),
    ('Flujo de Caja', '/flujo-caja', true),
    ('Tesoreria', '/tesoreria', true),
    ('Cuentas', '/cuentas', true),
    ('Biometrias', '/biometrias', true),
    ('Plagas', '/plagas', true),
    ('Alimentacion', '/alimentacion', true),
    ('Insumos', '/insumos', true),
    ('Recepcion Insumos', '/recepcion_insumos', true),
    ('Visitas', '/visitas', true),
    ('Banos', '/banos', true),
    ('Parametros', '/parametros', true),
    ('Medicamentos', '/medicamentos', true),
    ('Recambios', '/recambios', true),
    ('Inventario', '/inventario', true),
    ('Catalogo Estados', '/estados', false),
    ('Expedientes', '/expedientes', false),
    ('Puestos', '/puestos', true),
    ('Empleados', '/empleados', true),
    ('Departamentos', '/departamentos', true),
    ('Modulos', '/modulos', true),
    ('Roles Modulos', '/roles-modulos', true)
)
INSERT INTO seguridad.modulos (fc_nombre, fc_ruta, fb_activo)
SELECT mb.fc_nombre, mb.fc_ruta, mb.fb_activo
FROM modulos_base mb
ON CONFLICT (fc_ruta) DO UPDATE
SET fc_nombre = EXCLUDED.fc_nombre,
    fb_activo = EXCLUDED.fb_activo;

-- Asignacion inicial de modulos a roles root
INSERT INTO seguridad.roles_modulos (fi_rol_id, fi_modulo_id)
SELECT r.fi_rol_id, m.fi_modulo_id
FROM public.roles r
CROSS JOIN seguridad.modulos m
WHERE r.fb_es_root = true
ON CONFLICT (fi_rol_id, fi_modulo_id) DO NOTHING;

-- Refresh tokens para rotación de sesiones
CREATE TABLE IF NOT EXISTS seguridad.refresh_tokens (
    fi_token_id SERIAL PRIMARY KEY,
    fi_usuario_id INTEGER NOT NULL REFERENCES public.usuarios(fi_usuario_id) ON DELETE CASCADE,
    fc_token CHARACTER VARYING(255) NOT NULL UNIQUE,
    fd_expiracion TIMESTAMP NOT NULL,
    fb_revocado BOOLEAN DEFAULT FALSE,
    fd_creacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON seguridad.refresh_tokens (fc_token) WHERE fb_revocado = false;
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario ON seguridad.refresh_tokens (fi_usuario_id);

-- Seed: puestos
INSERT INTO rrhh.puestos (fc_nombre) VALUES
    ('Director General'),
    ('Director de Administracion, Finanzas y RRHH'),
    ('Encargado de Marketing'),
    ('Encargado de Contabilidad'),
    ('Encargado Legal'),
    ('Encargado de Laboratorio'),
    ('Encargado de Bienestar Animal y Control de Patologias'),
    ('Auxiliar de Laboratorio'),
    ('Encargado de Taller'),
    ('Auxiliar de Taller'),
    ('Becario')
ON CONFLICT DO NOTHING;

-- Seed: departamentos
INSERT INTO rrhh.departamentos (fc_nombre) VALUES
    ('Direccion General'),
    ('Administracion, Finanzas y RRHH'),
    ('Marketing'),
    ('Contabilidad'),
    ('Legal'),
    ('Laboratorio'),
    ('Bienestar Animal y Control de Patologias'),
    ('Taller')
ON CONFLICT (fc_nombre) DO NOTHING;

-- Seed: tipos_documento
INSERT INTO rrhh.tipos_documento (fc_nombre, fb_obligatorio) VALUES
    ('Credencial', true),
    ('Fotografia', true),
    ('Acta de Nacimiento', true),
    ('INE', true),
    ('Licencia de Conducir', false),
    ('Comprobante de Domicilio', true),
    ('RFC', true),
    ('CURP', true),
    ('Comprobante de Estudios', false),
    ('CV', false),
    ('Carta de Recomendacion', false),
    ('Acuerdo de Confidencialidad', true),
    ('Codigo de Etica', true),
    ('Codigo de Conducta', true),
    ('Solicitud de Empleo', true)
ON CONFLICT DO NOTHING;

--
-- Synchronize identity sequences with seed data
--

SELECT setval('public.roles_fi_rol_id_seq1',
              COALESCE((SELECT MAX(fi_rol_id) FROM public.roles), 0) + 1,
              false);

--
-- PostgreSQL database dump complete
