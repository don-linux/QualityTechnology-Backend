--
-- PostgreSQL database dump
--

\restrict 0drERyiStwJZkRKrhjKBl8pPFfEFtTnPACuvfv5BM2XdF9r2CvuOef1naA7Gjdd

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
-- Name: estados; Type: TABLE; Schema: catalogos; Owner: postgres
--

CREATE TABLE catalogos.estados (
    fi_estado_id integer NOT NULL,
    fc_nombre character varying(50) NOT NULL
);


ALTER TABLE catalogos.estados OWNER TO postgres;

--
-- Name: estados_fi_estado_id_seq; Type: SEQUENCE; Schema: catalogos; Owner: postgres
--

ALTER TABLE catalogos.estados ALTER COLUMN fi_estado_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME catalogos.estados_fi_estado_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
    fc_observaciones text,
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50)
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
    fc_mes character varying(20),
    fc_dia character varying(20),
    fc_banio_hombres character varying(100),
    fc_banio_mujeres character varying(100),
    fc_regadera character varying(100),
    fc_realizo character varying(100),
    fc_firma character varying(100),
    fc_observaciones text,
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50)
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
    fc_observaciones text,
    fc_encargado character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    fi_instalacion_id integer,
    tipo character varying(20),
    fc_granja character varying(100),
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
    fc_observaciones text,
    fc_encargado_entrega character varying(100),
    fc_encargado_recepcion character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50)
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
-- Name: expedientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expedientes (
    fi_expediente_id integer NOT NULL,
    fc_nombre character varying(255) NOT NULL,
    fc_id_empleado character varying(50),
    fn_uniformes integer DEFAULT 0,
    fc_credencial character varying(15) DEFAULT 'NO'::character varying,
    fc_fotografia character varying(15) DEFAULT 'NO'::character varying,
    fc_acta_nacimiento character varying(15) DEFAULT 'NO'::character varying,
    fc_ine character varying(15) DEFAULT 'NO'::character varying,
    fc_licencia_conducir character varying(15) DEFAULT 'NO'::character varying,
    fc_comprobante_domicilio character varying(15) DEFAULT 'NO'::character varying,
    fc_rfc character varying(15) DEFAULT 'NO'::character varying,
    fc_curp character varying(15) DEFAULT 'NO'::character varying,
    fc_comprobante_estudios character varying(15) DEFAULT 'NO'::character varying,
    fc_cv character varying(15) DEFAULT 'NO'::character varying,
    fc_carta_recomendacion character varying(15) DEFAULT 'NO'::character varying,
    fc_acuerdo_confidencialidad character varying(15) DEFAULT 'NO'::character varying,
    fc_codigo_etica character varying(15) DEFAULT 'NO'::character varying,
    fc_codigo_conducta character varying(15) DEFAULT 'NO'::character varying,
    fc_solicitud_empleo character varying(15) DEFAULT 'NO'::character varying,
    fd_fecha_actualizacion date DEFAULT CURRENT_DATE,
    fi_usuario_id integer,
    fc_puesto character varying(50)
);


ALTER TABLE public.expedientes OWNER TO postgres;

--
-- Name: expedientes_fi_expediente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expedientes_fi_expediente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 2147483647
    CACHE 1;


ALTER SEQUENCE public.expedientes_fi_expediente_id_seq OWNER TO postgres;

--
-- Name: expedientes_fi_expediente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expedientes_fi_expediente_id_seq OWNED BY public.expedientes.fi_expediente_id;


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
    ubicacion character varying(50)
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
    fc_diagnosis text,
    fc_tratamiento text,
    fc_dosis character varying(100),
    fc_forma_aplicacion character varying(100),
    fd_fecha_ultima_dosis date,
    fc_responsable character varying(100),
    fd_fecha_registro timestamp(6) without time zone DEFAULT now(),
    fd_fecha_modificacion timestamp(6) without time zone DEFAULT now(),
    fi_usuario_id integer,
    ubicacion character varying(50)
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
    ubicacion character varying(50)
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
    fc_hallazgo text,
    fc_malla character varying(200),
    fc_observaciones text,
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
    ubicacion character varying(50)
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
    fc_cantidad character varying(100),
    fc_lote character varying(100),
    fc_descripcion character varying(300),
    fc_encargado_entrega character varying(100),
    fc_verifico character varying(100),
    fc_observaciones text,
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
    fc_observaciones text,
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
    fi_empresa_id integer
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
    fi_estado_id integer NOT NULL,
    fc_ciudad character varying(60) NOT NULL,
    fc_nombre character varying(60) NOT NULL,
    fc_apellido_paterno character varying(60) NOT NULL,
    fc_apellido_materno character varying(60) NOT NULL,
    fd_fecha_nacimiento date NOT NULL,
    fc_calle character varying(120) NOT NULL,
    fc_codigo_postal character varying(10) NOT NULL,
    fc_referencias character varying(255),
    ft_comentarios_adicionales text,
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
-- Name: expedientes fi_expediente_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expedientes ALTER COLUMN fi_expediente_id SET DEFAULT nextval('public.expedientes_fi_expediente_id_seq'::regclass);


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
-- Data for Name: estados; Type: TABLE DATA; Schema: catalogos; Owner: postgres
--

COPY catalogos.estados (fi_estado_id, fc_nombre) FROM stdin;
1	Activo
2	Inactivo
3	Vacaciones
4	Baja Temporal
5	Baja Definitiva
\.


--
-- Data for Name: alimentacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alimentacion (fi_id, fc_mes, fn_num_instalacion, fn_peso_promedio_entrada, fd_fecha_siembra, fc_origen_alevines, fd_fecha, fn_total_alimento_kg, fn_mortalidad, fc_recambio_agua, fn_temp_agua, fn_amonio, fn_ph, fc_observaciones, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion) FROM stdin;
6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-06 21:23:55.569554	2026-03-06 21:23:55.569554	\N	ceiba
\.


--
-- Data for Name: alimentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alimentos (fi_alimento_id, fi_reproductor_id, fi_pileta_id, fi_usuario_id, particula_mm, alimento_dia, porcion, gasto_alimento, fi_engorda_id) FROM stdin;
\.


--
-- Data for Name: banos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banos (fi_id, fc_mes, fc_dia, fc_banio_hombres, fc_banio_mujeres, fc_regadera, fc_realizo, fc_firma, fc_observaciones, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion) FROM stdin;
5	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-06 21:23:55.787	2026-03-06 21:23:55.787682	1002	\N
\.


--
-- Data for Name: biometrias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.biometrias (fi_id, fd_fecha, fn_peso_total_gramos, fn_organismos_muestreados, fn_peso_promedio, fc_observaciones, fc_encargado, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, fi_instalacion_id, tipo, fc_granja, fi_reproductor_id) FROM stdin;
7	2026-03-06	120	20	6	smoke-1772823493865-upd	QA2	2026-03-06 18:58:13.937	2026-03-06 18:58:13.965	1	1	Alevinaje	Granja Acuícola Medellín	\N
\.


--
-- Data for Name: caja_ahorro_movimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caja_ahorro_movimientos (id, categoria_id, fecha, tipo_movimiento, monto, descripcion) FROM stdin;
\.


--
-- Data for Name: caja_ahorro_resumen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caja_ahorro_resumen (id, categoria, enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre, actualizado, granja) FROM stdin;
3	Caja de Ahorro	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
4	Seguro Social	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
5	INFONAVIT	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
6	2.5% Sobre Nómina	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
7	Capacitación	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
8	Viáticos	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
9	Incentivos/Bonos	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
10	EPP/Uniformes	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
11	Liquidaciones	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
12	Otro RRHH	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
14	Prestamos y Nomina	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:47:46.168501	Medellín
1	Sueldos y Salarios	500.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
13	Sueldos y salarios	2500.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:47:29.154625	Medellín
2	Préstamos de Nómina	400.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	0.00	2025-12-15 14:25:19.410587	Ceiba
\.


--
-- Data for Name: cat_caja_ahorro_categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_caja_ahorro_categorias (id, nombre, tipo, activo) FROM stdin;
1	Sueldos y Salarios	EGRESO	t
2	Préstamos de Nómina	EGRESO	t
3	Caja de Ahorro	EGRESO	t
4	Seguro Social	EGRESO	t
5	INFONAVIT	EGRESO	t
6	2.5% Sobre Nómina	EGRESO	t
7	Capacitación	EGRESO	t
8	Viáticos	EGRESO	t
9	Incentivos/Bonos	EGRESO	t
10	EPP/Uniformes	EGRESO	t
11	Liquidaciones	EGRESO	t
12	Otro RRHH	EGRESO	t
\.


--
-- Data for Name: cat_tesoreria_categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cat_tesoreria_categorias (fi_categoria_id, fc_nombre, fc_grupo) FROM stdin;
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre, tipo_principal, subcategoria, descripcion, fc_empresa) FROM stdin;
1	Venta de Alevines	INGRESOS	Venta de Alevines	\N	TODAS
2	Venta de Mojarras (Kg)	INGRESOS	Venta de Mojarras (Kg)	\N	TODAS
3	Venta de Alimento	INGRESOS	Venta de Alimento	\N	TODAS
4	Venta Medicamentos/Vitaminas	INGRESOS	Venta Medicamentos/Vitaminas	\N	TODAS
5	Servicios de Gestión	INGRESOS	Servicios de Gestión	\N	TODAS
6	Ingresos por Intereses	INGRESOS	Ingresos por Intereses	\N	TODAS
7	Reembolsos	INGRESOS	Reembolsos	\N	TODAS
8	Comisiones	INGRESOS	Comisiones	\N	TODAS
9	Fondeo Externo y Pasivos	INGRESOS	Fondeo Externo y Pasivos	\N	TODAS
10	Miscelaneo	INGRESOS	Miscelaneo	\N	TODAS
11	Fondo Líquido	CAPITAL	Fondo Líquido	\N	TODAS
12	Capital en Caja de Ahorro	CAPITAL	Capital en Caja de Ahorro	\N	TODAS
13	Intereses Caja de Ahorro	CAPITAL	Intereses Caja de Ahorro	\N	TODAS
14	Cuentas por Cobrar	CAPITAL	Cuentas por Cobrar	\N	TODAS
15	Otro	CAPITAL	Otro	\N	TODAS
16	Sueldos y Salarios	RECURSOS HUMANOS	Sueldos y Salarios	\N	TODAS
17	Aguinaldo	RECURSOS HUMANOS	Aguinaldo	\N	TODAS
18	Préstamos de Nómina	RECURSOS HUMANOS	Préstamos de Nómina	\N	TODAS
19	Caja de Ahorro	RECURSOS HUMANOS	Caja de Ahorro	\N	TODAS
20	Seguro Social	RECURSOS HUMANOS	Seguro Social	\N	TODAS
21	Gastos Médicos	RECURSOS HUMANOS	Gastos Médicos	\N	TODAS
22	ISR	RECURSOS HUMANOS	ISR	\N	TODAS
23	INFONAVIT	RECURSOS HUMANOS	INFONAVIT	\N	TODAS
24	2.5% Sobre Nómina	RECURSOS HUMANOS	2.5% Sobre Nómina	\N	TODAS
25	Vacaciones No Disfrutadas	RECURSOS HUMANOS	Vacaciones No Disfrutadas	\N	TODAS
26	Prima Vacacional	RECURSOS HUMANOS	Prima Vacacional	\N	TODAS
27	Capacitación	RECURSOS HUMANOS	Capacitación	\N	TODAS
28	Viáticos	RECURSOS HUMANOS	Viáticos	\N	TODAS
29	Incentivos/Bonos	RECURSOS HUMANOS	Incentivos/Bonos	\N	TODAS
30	EPP/Uniformes	RECURSOS HUMANOS	EPP/Uniformes	\N	TODAS
31	Liquidaciones	RECURSOS HUMANOS	Liquidaciones	\N	TODAS
32	Otro RRHH	RECURSOS HUMANOS	Otro RRHH	\N	TODAS
33	Pagos de Automóviles	LOGÍSTICA	Pagos de Automóviles	\N	TODAS
34	Seguro de Auto	LOGÍSTICA	Seguro de Auto	\N	TODAS
35	Casetas/Peajes	LOGÍSTICA	Casetas/Peajes	\N	TODAS
36	Impuestos y Referendos	LOGÍSTICA	Impuestos y Referendos	\N	TODAS
37	Combustible	LOGÍSTICA	Combustible	\N	TODAS
38	Transporte Público	LOGÍSTICA	Transporte Público	\N	TODAS
39	Reparaciones y Mantenimiento	LOGÍSTICA	Reparaciones y Mantenimiento	\N	TODAS
40	Registros y Licencias	LOGÍSTICA	Registros y Licencias	\N	TODAS
41	Otro	LOGÍSTICA	Otro	\N	TODAS
42	Internet y Telefonico	SERVICIOS	Internet y Telefonico	\N	TODAS
43	Electricidad CFE	SERVICIOS	Electricidad CFE	\N	TODAS
44	Limpieza	SERVICIOS	Limpieza	\N	TODAS
45	Comisiones Bancarias	SERVICIOS	Comisiones Bancarias	\N	TODAS
46	Certificaciones	SERVICIOS	Certificaciones	\N	TODAS
47	Marketing	SERVICIOS	Marketing	\N	TODAS
48	Otros Servicios	SERVICIOS	Otros Servicios	\N	TODAS
49	Compra de Alevines	RECURSOS MATERIALES	Compra de Alevines	\N	TODAS
50	Compra de Alimento	RECURSOS MATERIALES	Compra de Alimento	\N	TODAS
51	Compra de Alimento Engorda	RECURSOS MATERIALES	Compra de Alimento Engorda	\N	TODAS
52	Compra de Medicamentos	RECURSOS MATERIALES	Compra de Medicamentos	\N	TODAS
53	Compra Reproductores	RECURSOS MATERIALES	Compra Reproductores	\N	TODAS
54	Compra Artículos Probióticos/Bacterias	RECURSOS MATERIALES	Compra Artículos Probióticos/Bacterias	\N	TODAS
55	Compra Artículos Para Venta	RECURSOS MATERIALES	Compra Artículos Para Venta	\N	TODAS
56	Compra Artículos Limpieza	RECURSOS MATERIALES	Compra Artículos Limpieza	\N	TODAS
57	Material Construcción Interno	RECURSOS MATERIALES	Material Construcción Interno	\N	TODAS
58	Artículos Infraestructura Interna	RECURSOS MATERIALES	Artículos Infraestructura Interna	\N	TODAS
59	Artículos de Mantenimiento	RECURSOS MATERIALES	Artículos de Mantenimiento	\N	TODAS
60	Pintura Barniz	RECURSOS MATERIALES	Pintura Barniz	\N	TODAS
61	Servicios Profesionales	RECURSOS MATERIALES	Servicios Profesionales	\N	TODAS
62	Hardware Tecnología	RECURSOS MATERIALES	Hardware Tecnología	\N	TODAS
63	Seguridad	RECURSOS MATERIALES	Seguridad	\N	TODAS
64	Mano de Obra	RECURSOS MATERIALES	Mano de Obra	\N	TODAS
65	Renta Instalaciones	INSTALACIONES	Renta Instalaciones	\N	TODAS
66	Depósito Garantía	INSTALACIONES	Depósito Garantía	\N	TODAS
67	Préstamo Capital	AJUSTE DE CAPITALES	Préstamo Capital	\N	TODAS
68	Devolución de Préstamos	AJUSTE DE CAPITALES	Devolución de Préstamos	\N	TODAS
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (fi_cliente_id, fc_nombre, fc_telefono, fc_correo, fi_usuario_id, fd_fecha_registro, fd_fecha_modificacion, fc_cp, fc_localidad) FROM stdin;
12	MIGUEL PEREZ	\N	\N	1	2026-02-07	2026-02-07	\N	CUNDUACAN
13	RICARDO BASURTO ZAPATA	\N	\N	1	2026-02-07	2026-02-07	\N	PIE DE GRANJA
14	BIOLOGO JORDAN	\N	\N	1	2026-02-07	2026-02-07	\N	CATAZAJA
15	LUIS ALFREDO MIGUEL	\N	\N	1	2026-02-07	2026-02-07	\N	ESCARCEGA
16	ARTEMIO MORENO	\N	\N	1	2026-02-07	2026-02-07	\N	CENTRO
17	GRANJA EL AMANECER	\N	\N	1	2026-02-07	2026-02-07	\N	PIE DE GRANJA
\.


--
-- Data for Name: cuentas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuentas (id, nombre, saldo, tipo, fd_fecha_registro) FROM stdin;
2	Cheques BBVA GAC	35000.00	CUENTA CORRIENTE	2026-02-04 17:23:36.526311
3	Efectivo	7500.00	CUENTA CORRIENTE	2026-02-04 17:23:36.526311
1	Cheques BBVA GAM	50270.75	CUENTA CORRIENTE	2026-02-04 17:23:36.526311
\.


--
-- Data for Name: engorda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.engorda (fi_engorda_id, fi_instalacion_id, cantidad, talla_gr, observacion, fecha_siembra, fecha_biometria, fecha_registro, fi_usuario_id, fc_granja, fi_lote_id, origen_instalacion, fd_fecha_modificacion) FROM stdin;
\.


--
-- Data for Name: equipos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipos (fi_equipo_id, fc_nombre, fc_marca, fc_modelo, fc_tipo, fd_fecha_compra, fn_costo, fc_estado, fc_ubicacion, fc_responsable, fd_proximo_mantenimiento, fc_notas, fi_usuario_id) FROM stdin;
\.


--
-- Data for Name: expedientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expedientes (fi_expediente_id, fc_nombre, fc_id_empleado, fn_uniformes, fc_credencial, fc_fotografia, fc_acta_nacimiento, fc_ine, fc_licencia_conducir, fc_comprobante_domicilio, fc_rfc, fc_curp, fc_comprobante_estudios, fc_cv, fc_carta_recomendacion, fc_acuerdo_confidencialidad, fc_codigo_etica, fc_codigo_conducta, fc_solicitud_empleo, fd_fecha_actualizacion, fi_usuario_id, fc_puesto) FROM stdin;
\.


--
-- Data for Name: flujo_caja; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flujo_caja (fi_movimiento_id, fc_granja, fd_fecha, fn_ingreso, fn_egreso, fc_descripcion, fc_cuenta, fc_categoria, fc_subcategoria, fc_factura, fc_estatus, fc_mes, fd_fecha_registro, categoria_id, fc_beneficiario, fc_noproyecto, fc_equilibrar) FROM stdin;
\.


--
-- Data for Name: instalaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instalaciones (fi_instalacion_id, nombre_instalacion, largo, ancho, altura, material, fi_usuario_id, fecha_registro, fd_fecha_modificacion, fc_granja, tipo_instalacion, estado) FROM stdin;
42	R-01	6.00	3.00	1.20	Concreto	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
43	R-02	6.00	3.00	1.20	Concreto	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
44	R-03	6.00	3.00	1.20	Concreto	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
31	Estanque 1	100.00	28.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ENGORDA	ACTIVA
32	Estanque 2	100.00	25.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ENGORDA	ACTIVA
33	Estanque 3	100.00	25.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ENGORDA	ACTIVA
34	Estanque 4	100.00	25.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ENGORDA	ACTIVA
35	Estanque 5	100.00	30.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ENGORDA	ACTIVA
36	Estanque 6	100.00	30.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ENGORDA	ACTIVA
37	Estanque 7	100.00	30.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ENGORDA	ACTIVA
38	Estanque Chico 1	45.00	17.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
39	Estanque Chico 2	45.00	16.00	2.50	Tierra	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
40	Liner 1	55.00	20.00	2.00	Geomembrana	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
41	Liner 2	45.00	25.00	2.00	Geomembrana	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
45	P-01	10.00	4.10	1.50	Concreto	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
46	CR-01	9.30	2.10	1.50	Concreto	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
47	A-01	6.20	2.50	1.50	Concreto	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
48	B-01	9.50	2.00	1.50	Concreto	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
49	C-01	9.50	5.60	1.50	Concreto	1	2026-02-08	2026-02-08	Granja Acuícola La Ceiba	ALEVINAJE	ACTIVA
82	L-05	5.80	0.80	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
85	L-08	5.80	0.80	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
91	R-05	5.80	4.00	1.20	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
92	R-06	5.80	4.00	1.20	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
93	R-07	5.80	4.00	1.20	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
94	R-08	6.80	4.00	1.50	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
95	R-09	6.80	4.00	1.50	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
96	R-10	6.80	4.00	1.50	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
71	H-02	1.00	1.00	1.00	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
72	H-03	1.00	1.00	1.00	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
73	H-04	1.00	1.00	1.00	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
74	H-05	1.00	1.00	1.00	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
75	H-06	1.00	1.00	1.00	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
76	H-07	1.00	1.00	1.00	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
77	H-08	1.00	1.00	1.00	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
69	R-01	6.00	3.00	1.20	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
88	R-02	6.00	3.00	1.20	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
89	R-03	6.00	3.00	1.20	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
90	R-04	6.00	3.00	1.20	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
78	L-01	5.80	1.10	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
80	L-03	5.80	1.10	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
81	L-04	5.80	1.10	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
83	L-06	5.80	1.10	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
84	L-07	5.80	1.10	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
86	L-09	5.80	1.10	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
87	L-10	5.80	1.10	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	ACTIVA
79	L-02	5.80	0.80	0.80	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	Ocupada
97	REPRO-01	5.80	4.00	1.20	Concreto	\N	2026-02-08	2026-02-08	Granja Acuícola Medellin	Reproductores	Ocupada
99	REPRO-03	5.80	4.00	1.20	Concreto	\N	2026-02-08	\N	Granja Acuícola Medellin	Reproductores	Ocupada
100	REPRO-04	5.80	4.00	1.20	Concreto	\N	2026-02-08	\N	Granja Acuícola Medellin	Reproductores	Ocupada
70	H-01	1.00	1.00	1.00	PENDIENTE	1	2026-02-08	2026-02-08	Granja Acuícola Medellin	ALEVINAJE	Ocupada
98	REPRO-02	5.80	4.00	1.20	Concreto	\N	2026-02-08	\N	Granja Acuícola Medellin	Reproductores	Ocupada
\.


--
-- Data for Name: insumos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.insumos (fi_id, fd_fecha, fc_cantidad_udm, fc_num_lote, fc_descripcion, fc_observaciones, fc_encargado_entrega, fc_encargado_recepcion, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion) FROM stdin;
\.


--
-- Data for Name: inventario_alevines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventario_alevines (fi_id, fn_num_instalacion, fn_cantidad, fn_talla, fc_lote, fc_observacion, fd_fecha_siembra, fd_fecha_salida_hormonado, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion) FROM stdin;
4	\N	\N	\N	\N	\N	\N	\N	2026-03-06 21:23:55.801	2026-03-06 21:23:55.80174	1002	medellin
\.


--
-- Data for Name: limpieza; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.limpieza (fi_id, fd_fecha, fc_tipo_instalacion, fn_num_instalacion, fc_desinfectante, fc_observaciones, fc_encargado, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion) FROM stdin;
\.


--
-- Data for Name: lista_espera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lista_espera (fi_lista_id, fd_fecha_entrega, fc_talla, fn_cantidad, fc_cliente, fc_lugar_entrega, fc_encargado_venta, fc_unidad_produccion, fc_hora_embolsado, fc_hora_entrega, fn_precio_venta, fc_uap_asignada, fc_granja_asignada, fd_fecha_registro, fd_fecha_modificacion) FROM stdin;
4	2026-02-10	12	132.00	RICARDO BASURTO ZAPATA	Ixtacomitan	admin	Ceiba	12	1	123.00	ALEVIN	La Ceiba	2026-02-10 19:36:11.753148	2026-02-10 19:36:11.753148
6	2026-03-06	M	120.00	R9_Cliente_1772826050766	CEIBA	QA	UP1	08:00	10:00	4.50	UAP1	G1	2026-03-06 19:40:50.830634	2026-03-06 19:40:50.830634
\.


--
-- Data for Name: lote_movimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lote_movimientos (fi_mov_id, fi_lote_id, tipo_movimiento, cantidad, fecha, destino, observacion, fi_usuario_id, talla) FROM stdin;
\.


--
-- Data for Name: lotes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lotes (fi_lote_id, fecha, familia, fc_instalacion_id, huevos_ml, alevines_inicial, no_lote, fc_granja, observacion, fecha_registro, mortalidad, mortalidad_porcentaje, ovadas) FROM stdin;
24	2026-03-10	FM1	97	1000.00	467	12	Granja Acuícola Medellin		2026-03-10	0	0.00	122
30	2026-03-10	Rocky0	72	1231.00	1231	1231	Granja Acuícola Medellin		2026-03-10	0	0.00	1231
36	2026-03-10	FM3	70	5000.00	12312	12311	Granja Acuícola Medellin	dasfdsfs	2026-03-10	0	0.00	3000
37	2026-03-10	FM2	98	200.00	800	432	Granja Acuícola Medellin	nada	2026-03-10	0	0.00	34
\.


--
-- Data for Name: mantenimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mantenimientos (fi_mantenimiento_id, fi_equipo_id, fd_fecha, fc_tipo, fc_responsable, fc_descripcion, fn_costo, fc_estado_post, fd_proximo_mantenimiento) FROM stdin;
\.


--
-- Data for Name: medicamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicamentos (fi_id, fd_fecha_hora, fn_num_estanque, fc_diagnosis, fc_tratamiento, fc_dosis, fc_forma_aplicacion, fd_fecha_ultima_dosis, fc_responsable, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion) FROM stdin;
\.


--
-- Data for Name: nomina; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nomina (fi_nomina_id, fc_nombre_empleado, fi_empleado_id, fd_fecha_pago, fn_total, fn_bono, fn_deuda, fn_descuento, fn_anticipo, fi_usuario_id, fd_fecha_registro, fd_fecha_actualizacion) FROM stdin;
1	Jose Carlos Ermesio Cequef	230092	2025-12-08	2500.00	500.00	2000.00	0.00	0.00	1	2025-12-08 17:00:28.182154	2025-12-08 17:00:28.182154
\.


--
-- Data for Name: parametros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parametros (fi_id, fd_fecha, fn_num_estanque, fn_oxigeno, fn_temperatura, fn_ph, fn_amonio, fn_nitritos, fn_nitratos, fc_responsable, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion) FROM stdin;
\.


--
-- Data for Name: piletas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.piletas (fi_pileta_id, nombre_instalacion, ubicacion, fecha_registro, fd_fecha_modificacion, fecha_siembra, fecha_ultima_biometria, cantidad, talla_gr, observacion, fi_usuario_id, fc_granja, fi_instalacion_id, origen_instalacion, fi_lote_id) FROM stdin;
7	\N	\N	2026-03-10	\N	2026-03-10	2026-03-10	121231	121.00	12123	\N	Granja Acuícola Medellin	99	\N	30
6	\N	\N	2026-03-10	\N	2026-03-10	2026-03-10	631	1.00	\N	\N	Granja Acuícola Medellin	97	\N	\N
9	\N	\N	2026-03-10	\N	2026-03-10	2026-03-10	6888	12.00	\N	\N	Granja Acuícola Medellin	79	\N	30
10	\N	\N	2026-03-10	\N	2026-03-10	2026-03-10	12312	12.00	dsafsd	\N	Granja Acuícola Medellin	100	\N	36
11	\N	\N	2026-03-10	\N	2026-03-01	2026-03-10	800	54.00	\N	\N	Granja Acuícola Medellin	70	\N	37
8	\N	\N	2026-03-10	\N	2026-03-10	2026-03-10	-200	12.00	\N	\N	Granja Acuícola Medellin	98	\N	24
\.


--
-- Data for Name: plagas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plagas (fi_id, fd_fecha, fc_num_trampa, fc_hallazgo, fc_malla, fc_observaciones, fc_verifico, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion, tipo_trampa, fc_veneno, unidad_produccion) FROM stdin;
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (id, nombre, empresa, rfc, categoria, contacto, telefono, correo, direccion, forma_pago, plazo_credito, ultima_compra, monto_promedio, activo, created_at, updated_at) FROM stdin;
2	Alexander Julian Navarro	SACO	SA34OWP2	Jefe de Allande	Vendedor	99921302912	edualexo@gmail.com	jaunw´s	efectivo	23	2025-12-22	2.50	t	2025-12-22 16:23:55.113155	2026-02-04 17:09:05.792324
3	JULIAN FRANCISCO CRUZ	ACCIONES	1243S11	SWWDQ	WQWEQWD	92171291	jljuan@gmail.com	E12E2	2ESD	12	2026-02-04	1233.00	t	2026-02-04 17:10:53.998697	2026-02-04 17:10:53.998697
\.


--
-- Data for Name: recambios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recambios (fi_id, fc_mes, fn_num_instalacion, fd_fecha1, fc_tipo1, fd_fecha2, fc_tipo2, fd_fecha3, fc_tipo3, fd_fecha4, fc_tipo4, fd_fecha5, fc_tipo5, fd_fecha6, fc_tipo6, fc_responsable, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion) FROM stdin;
5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-03-06 21:23:55.836	2026-03-06 21:23:55.837282	1002	medellin
\.


--
-- Data for Name: recepcion_insumos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recepcion_insumos (fi_id, fc_mes, fd_fecha, fc_cantidad, fc_lote, fc_descripcion, fc_encargado_entrega, fc_verifico, fc_observaciones, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion, fc_proveedor, fc_producto, fc_unidad_medida, fc_condiciones_entrega) FROM stdin;
\.


--
-- Data for Name: reproductores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reproductores (fi_reproductor_id, fc_instalacion, fn_cantidad, fn_talla, fc_observacion, fd_fecha_siembra, fd_fecha_biometria, fi_usuario_id, fd_fecha_registro, fn_machos, fn_hembras, fc_ratio, fc_granja, fc_linea, fc_familia) FROM stdin;
33	REPRO-01	140	500.00		2026-02-08	2026-02-08	1	2026-02-08 15:47:26.813579	112	28	1:28	Granja Acuícola Medellin	garbanos	FM1
34	REPRO-02	147	500.00		2026-02-08	2026-02-08	1	2026-02-08 20:11:55.007165	122	25	1:25	Granja Acuícola Medellin	garzos	FM2
35	H-01	200	500.00		2026-02-08	2026-02-08	1	2026-02-08 22:22:20.752277	122	78	1:78	Granja Acuícola Medellin	Zacatos	FM3
36	H-03	105	500.00		2026-02-09	2026-02-09	1	2026-02-09 17:10:20.169017	25	80	1:80	Granja Acuícola Medellin	Gif	Rocky0
37	QA_INST_R19_1772833213220_UPD	30	150.00	R19	2026-03-01	2026-03-06	1011	2026-03-06 21:40:13.267	10	20	1:2	Granja Acuícola Medellin	L1	F1
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (fi_rol_id, fc_nombre, fb_es_root) FROM stdin;
2	Bióloga	f
3	Jefe de Empresa	f
1	Administrador	t
4	DBGQ-1772825171179	f
\.


--
-- Data for Name: trazabilidad_alevinaje; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trazabilidad_alevinaje (fi_movimiento_id, fi_pileta_origen, fi_pileta_destino, cantidad, fecha_movimiento, observacion, fi_usuario_id, fi_lote_id, tipo_movimiento, origen_externo, fc_granja, fi_instalacion_origen, fi_instalacion_destino) FROM stdin;
35	6	8	600	2026-03-10		1020	24	TRASLADO	\N	Granja Acuícola Medellin	97	98
38	\N	10	12312	2026-03-10	dsafsd	1020	36	TRASLADO	\N	Granja Acuícola Medellin	70	100
39	8	11	800	2026-03-10		1020	37	TRASLADO	\N	Granja Acuícola Medellin	98	70
40	\N	\N	800	2026-03-10	\N	1020	37	MORTALIDAD	\N	Granja Acuícola Medellin	\N	\N
41	\N	\N	800	2026-03-10	\N	1020	37	MORTALIDAD	\N	Granja Acuícola Medellin	\N	\N
\.


--
-- Data for Name: trazabilidad_engorda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trazabilidad_engorda (fi_movimiento_id, fi_engorda_origen, fi_engorda_destino, cantidad_trasladada, fecha_movimiento, observacion, fi_usuario_id) FROM stdin;
\.


--
-- Data for Name: trazabilidad_reproductores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trazabilidad_reproductores (fi_movimiento_id, fi_repro_origen, fi_repro_destino, cantidad_trasladada, fecha_movimiento, observacion, fi_usuario_id, origen_texto) FROM stdin;
13	\N	32	189	2026-02-08	\N	1	Ingreso inicial
14	\N	33	140	2026-02-08	\N	1	Granjas los soles
15	\N	34	147	2026-02-08	\N	1	Granja Aful
16	\N	35	200	2026-02-08	\N	1	Rio el salvo
17	\N	36	105	2026-02-09	\N	1	Granja Mapa
19	\N	37	30	2026-03-06	R19	1011	Origen QA 1772833213220
20	\N	99999999	32	2026-03-06	R19-UPD	1011	Origen QA 1772833213220
21	\N	38	30	2026-03-06	R19	1013	Origen QA 1772833493589
22	\N	38	32	2026-03-06	R19-UPD	1013	Origen QA 1772833493589
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (fi_usuario_id, fc_nombre, "fc_contraseña", fi_rol_id, fi_empresa_id) FROM stdin;
1	admin	$2b$10$jaFu4Rk2.OC.VlKMn9sk5eZkhUHJervY806TO.Xawqi/4EPeEsT2O	1	\N
2	biologa	$2b$10$8/hDsHZ6u2r.Pa2GupqW8eGcksyrJIcr8F1qzKCZ8WHs8Icji5jh6	2	\N
3	jefegam	$2b$10$MaZ6c3EDw/VogC1KtONo4.1lZJjVgYQ4Zr.RDKuFCC1a599G3Io/K	3	1
4	jefegac	$2b$10$Z9SJnP2gIGT57LLCAMbUr.y61rDx/YyEV9qx5KP6tEMBLBJ1Zn4kS	3	2
1001	testuser	$2b$10$DHr2sDr6KSiB0ld87SJvpOzwX/J2/sOwTCNI5OolymKLaSIhwHHYC	1	\N
1020	antigravity	$2b$10$JUwDu0zDofzu6qPaIY16OegOLVh/d0w5lR2WFRVRx44Dj/zhiskh.	1	\N
\.


--
-- Data for Name: vacaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vacaciones (fi_vacacion_id, fc_nombre_empleado, fi_empleado_id, fd_inicio_periodo, fd_fin_periodo, fc_departamento, fn_dias_trabajados, fn_vacaciones_v, fn_enfermedad_e, fn_maternidad_m, fn_permiso_parcial_pp, fn_permiso_total_pt, fn_inasistencias_i, fn_vacaciones_anio, fn_dias_previos, fn_vacaciones_disponibles, fn_vacaciones_disfrutadas, fd_fecha_actualizacion, fc_asistencia) FROM stdin;
\.


--
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas (fi_venta_id, fn_monto_total, fd_fecha_venta, fd_fecha_registro, fd_fecha_modificacion, fc_observaciones, fc_cliente, fn_cantidad_vendida, fn_precio_venta, fc_encargado_venta, fn_abonado, fn_adeudo, fc_empresa, fc_folio, fc_tipo_venta, fc_estado_pago) FROM stdin;
48	1488.00	2026-02-09	2026-02-09	2026-02-09		ARTEMIO MORENO	124	12.00	Jose Alfredo Acosta Farias	1478.00	10.00	MEDELLIN	GAM20A21	ALEVINES	PARCIAL
\.


--
-- Data for Name: visitas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visitas (fi_id, fd_fecha, fc_nombre_completo, fc_origen, fc_motivo, fc_observaciones, fc_foto_identificacion, fd_fecha_registro, fd_fecha_modificacion, fi_usuario_id, ubicacion, fd_entrada, fd_salida) FROM stdin;
\.


--
-- Data for Name: departamentos; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.departamentos (fi_departamento_id, fc_nombre, fb_activo) FROM stdin;
1	Recursos Humanos	t
2	Finanzas	t
3	Contabilidad	t
4	Sistemas	t
5	Tecnología	t
6	Operaciones	t
7	Logística	t
8	Compras	t
9	Ventas	t
10	Marketing	t
11	Atención al Cliente	t
12	Producción	t
13	Calidad	t
14	Legal	t
15	Dirección General	t
18	QA_R17_DEP_1772832595922	t
19	QA_R17_DEP_1772832807897	t
20	QA_DEP_1772832873129	t
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: rrhh; Owner: postgres
--

COPY rrhh.empleados (fi_empleado_id, fi_usuario_id, fi_departamento_id, fi_estado_id, fc_ciudad, fc_nombre, fc_apellido_paterno, fc_apellido_materno, fd_fecha_nacimiento, fc_calle, fc_codigo_postal, fc_referencias, ft_comentarios_adicionales, fd_fecha_alta) FROM stdin;
1	\N	4	1	Villahermosa	Carlos	Ramírez	López	1995-08-15	Av. Universidad 123	86000	Casa color azul frente a parque	Empleado operativo sin acceso al sistema	2026-03-06
\.


--
-- Data for Name: modulos; Type: TABLE DATA; Schema: seguridad; Owner: postgres
--

COPY seguridad.modulos (fi_modulo_id, fc_nombre, fc_ruta, fb_activo) FROM stdin;
1	Operaciones	/operaciones	t
2	Inventarios	/inventarios	t
3	Ventas	/ventas	t
4	Finanzas	/finanzas	t
5	RRHH	/rrhh	t
6	Catálogos	/catalogos	t
7	Seguridad	/seguridad	t
\.


--
-- Data for Name: roles_modulos; Type: TABLE DATA; Schema: seguridad; Owner: postgres
--

COPY seguridad.roles_modulos (fi_rol_id, fi_modulo_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
3	4
\.


--
-- Name: estados_fi_estado_id_seq; Type: SEQUENCE SET; Schema: catalogos; Owner: postgres
--

SELECT pg_catalog.setval('catalogos.estados_fi_estado_id_seq', 6, true);


--
-- Name: alimentos_fi_alimento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alimentos_fi_alimento_id_seq', 29, true);


--
-- Name: alimentos_fi_alimento_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alimentos_fi_alimento_id_seq1', 1, true);


--
-- Name: caja_ahorro_movimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caja_ahorro_movimientos_id_seq', 1, false);


--
-- Name: caja_ahorro_resumen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.caja_ahorro_resumen_id_seq', 16, true);


--
-- Name: cat_caja_ahorro_categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_caja_ahorro_categorias_id_seq', 12, true);


--
-- Name: cat_tesoreria_categorias_fi_categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cat_tesoreria_categorias_fi_categoria_id_seq', 1, false);


--
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 68, true);


--
-- Name: ceiba_alimentacion_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ceiba_alimentacion_fi_id_seq', 7, true);


--
-- Name: ceiba_biometrias_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ceiba_biometrias_fi_id_seq', 7, true);


--
-- Name: ceiba_insumos_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ceiba_insumos_fi_id_seq', 6, true);


--
-- Name: ceiba_limpieza_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ceiba_limpieza_fi_id_seq', 3, true);


--
-- Name: clientes_fi_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_fi_cliente_id_seq', 17, true);


--
-- Name: clientes_fi_cliente_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_fi_cliente_id_seq1', 5, true);


--
-- Name: cuentas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuentas_id_seq', 12, true);


--
-- Name: engorda_fi_engorda_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.engorda_fi_engorda_id_seq', 14, true);


--
-- Name: equipos_fi_equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipos_fi_equipo_id_seq', 4, true);


--
-- Name: expedientes_fi_expediente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expedientes_fi_expediente_id_seq', 14, true);


--
-- Name: flujo_caja_fi_movimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.flujo_caja_fi_movimiento_id_seq', 10, true);


--
-- Name: instalaciones_fi_instalacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.instalaciones_fi_instalacion_id_seq', 104, true);


--
-- Name: lista_espera_fi_lista_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lista_espera_fi_lista_id_seq', 9, true);


--
-- Name: lote_movimientos_fi_mov_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lote_movimientos_fi_mov_id_seq', 1, false);


--
-- Name: lotes_fi_lote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lotes_fi_lote_id_seq', 37, true);


--
-- Name: mantenimientos_fi_mantenimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mantenimientos_fi_mantenimiento_id_seq', 2, true);


--
-- Name: medellin_banos_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medellin_banos_fi_id_seq', 6, true);


--
-- Name: medellin_inventario_alevines_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medellin_inventario_alevines_fi_id_seq', 4, true);


--
-- Name: medellin_medicamentos_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medellin_medicamentos_fi_id_seq', 6, true);


--
-- Name: medellin_parametros_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medellin_parametros_fi_id_seq', 6, true);


--
-- Name: medellin_plagas_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medellin_plagas_fi_id_seq', 8, true);


--
-- Name: medellin_recambios_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medellin_recambios_fi_id_seq', 6, true);


--
-- Name: medellin_recepcion_insumos_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medellin_recepcion_insumos_fi_id_seq', 6, true);


--
-- Name: medellin_visitas_fi_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medellin_visitas_fi_id_seq', 7, true);


--
-- Name: nomina_fi_nomina_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nomina_fi_nomina_id_seq', 4, true);


--
-- Name: piletas_fi_pileta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.piletas_fi_pileta_id_seq', 102, true);


--
-- Name: piletas_fi_pileta_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.piletas_fi_pileta_id_seq1', 11, true);


--
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 5, true);


--
-- Name: rastreabilidad_engorda_fi_movimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rastreabilidad_engorda_fi_movimiento_id_seq', 2, true);


--
-- Name: rastreabilidad_fi_movimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rastreabilidad_fi_movimiento_id_seq', 41, true);


--
-- Name: rastreabilidad_reproductores_fi_movimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rastreabilidad_reproductores_fi_movimiento_id_seq', 22, true);


--
-- Name: reproductores_fi_reproductor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reproductores_fi_reproductor_id_seq', 38, true);


--
-- Name: roles_fi_rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_fi_rol_id_seq', 2, true);


--
-- Name: roles_fi_rol_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_fi_rol_id_seq1', 9, true);


--
-- Name: usuarios_fi_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_fi_usuario_id_seq', 4, true);


--
-- Name: usuarios_fi_usuario_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_fi_usuario_id_seq1', 1020, true);


--
-- Name: vacaciones_fi_vacacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vacaciones_fi_vacacion_id_seq', 9, true);


--
-- Name: ventas_fi_venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ventas_fi_venta_id_seq', 50, true);


--
-- Name: departamentos_fi_departamento_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.departamentos_fi_departamento_id_seq', 20, true);


--
-- Name: empleados_fi_empleado_id_seq; Type: SEQUENCE SET; Schema: rrhh; Owner: postgres
--

SELECT pg_catalog.setval('rrhh.empleados_fi_empleado_id_seq', 3, true);


--
-- Name: modulos_fi_modulo_id_seq; Type: SEQUENCE SET; Schema: seguridad; Owner: postgres
--

SELECT pg_catalog.setval('seguridad.modulos_fi_modulo_id_seq', 7, true);


--
-- Name: estados estados_fc_nombre_key; Type: CONSTRAINT; Schema: catalogos; Owner: postgres
--

ALTER TABLE ONLY catalogos.estados
    ADD CONSTRAINT estados_fc_nombre_key UNIQUE (fc_nombre);


--
-- Name: estados estados_pkey; Type: CONSTRAINT; Schema: catalogos; Owner: postgres
--

ALTER TABLE ONLY catalogos.estados
    ADD CONSTRAINT estados_pkey PRIMARY KEY (fi_estado_id);


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
-- Name: expedientes expedientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expedientes
    ADD CONSTRAINT expedientes_pkey PRIMARY KEY (fi_expediente_id);


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
-- Name: idx_expedientes_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_expedientes_nombre ON public.expedientes USING btree (fc_nombre);


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
    ADD CONSTRAINT engorda_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id) ON DELETE SET NULL;


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
    ADD CONSTRAINT fk_usuario_alimentos FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id) ON DELETE CASCADE;


--
-- Name: instalaciones instalaciones_fi_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instalaciones
    ADD CONSTRAINT instalaciones_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id) ON DELETE CASCADE;


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
-- Name: empleados empleados_fi_estado_id_fkey; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.empleados
    ADD CONSTRAINT empleados_fi_estado_id_fkey FOREIGN KEY (fi_estado_id) REFERENCES catalogos.estados(fi_estado_id) ON DELETE RESTRICT;


--
-- Name: empleados empleados_fi_usuario_id_fkey; Type: FK CONSTRAINT; Schema: rrhh; Owner: postgres
--

ALTER TABLE ONLY rrhh.empleados
    ADD CONSTRAINT empleados_fi_usuario_id_fkey FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios(fi_usuario_id) ON DELETE SET NULL;


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
-- PostgreSQL database dump complete
--

\unrestrict 0drERyiStwJZkRKrhjKBl8pPFfEFtTnPACuvfv5BM2XdF9r2CvuOef1naA7Gjdd

