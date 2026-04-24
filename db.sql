BEGIN;

-- ============================================================================
-- 1.  Función utilitaria para auditoría
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_touch_fecha_modificacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fd_fecha_modificacion := now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_touch_fecha_modificacion() IS
    'Actualiza fd_fecha_modificacion en cada UPDATE. Úsese en triggers BEFORE UPDATE FOR EACH ROW.';

-- Variante para tablas heredadas que usan fd_fecha_actualizacion
-- (public.nomina, public.vacaciones) en vez de fd_fecha_modificacion.
CREATE OR REPLACE FUNCTION public.fn_touch_fecha_actualizacion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.fd_fecha_actualizacion := now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_touch_fecha_actualizacion() IS
    'Actualiza fd_fecha_actualizacion en cada UPDATE (solo nomina y vacaciones).';

-- Variante para tablas con naming snake_case heredado (proveedores.updated_at)
CREATE OR REPLACE FUNCTION public.fn_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_touch_updated_at() IS
    'Actualiza updated_at en cada UPDATE (solo public.proveedores).';

-- Variante para caja_ahorro_resumen que usa la columna "actualizado"
CREATE OR REPLACE FUNCTION public.fn_touch_actualizado()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.actualizado := now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_touch_actualizado() IS
    'Actualiza la columna "actualizado" en cada UPDATE (solo caja_ahorro_resumen).';


-- ============================================================================
-- 1.5  Dependencias: esquemas + tablas de apoyo (auth, RRHH, seguridad)
-- ----------------------------------------------------------------------------
-- Todo aquí es idempotente (CREATE ... IF NOT EXISTS). Si tu base ya tiene
-- estos objetos, no se tocan. Si está vacía, quedan creados para que los
-- FK del módulo Inventarios y los seeds finales puedan ejecutarse.
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS rrhh;

-- ----------------------------------------------------------------------------
-- Roles y usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    fi_rol_id   integer      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre   varchar(50)  NOT NULL,
    fb_es_root  boolean      NOT NULL DEFAULT false,
    CONSTRAINT roles_nombre_uk UNIQUE (fc_nombre)
);

CREATE TABLE IF NOT EXISTS public.usuarios (
    fi_usuario_id    integer       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre        varchar(100)  NOT NULL,
    "fc_contraseña"  varchar(255)  NOT NULL,
    fi_rol_id        integer       NOT NULL,
    fi_empresa_id    integer,
    fb_activo        boolean       NOT NULL DEFAULT true,
    CONSTRAINT usuarios_nombre_uk UNIQUE (fc_nombre),
    CONSTRAINT usuarios_rol_fk
        FOREIGN KEY (fi_rol_id) REFERENCES public.roles (fi_rol_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS usuarios_rol_idx ON public.usuarios (fi_rol_id);

COMMENT ON TABLE public.roles    IS 'Roles del sistema. fb_es_root = acceso a todos los módulos.';
COMMENT ON TABLE public.usuarios IS 'Usuarios del sistema, vinculados a un rol.';

-- ----------------------------------------------------------------------------
-- Seguridad: módulos (menú), pivote roles×módulos y refresh tokens
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seguridad.modulos (
    fi_modulo_id integer       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre    varchar(50)   NOT NULL,
    fc_ruta      varchar(100)  NOT NULL,
    fb_activo    boolean       NOT NULL DEFAULT true,
    CONSTRAINT modulos_nombre_uk UNIQUE (fc_nombre),
    CONSTRAINT modulos_ruta_uk   UNIQUE (fc_ruta)
);

CREATE TABLE IF NOT EXISTS seguridad.roles_modulos (
    fi_rol_id    integer NOT NULL,
    fi_modulo_id integer NOT NULL,
    CONSTRAINT roles_modulos_pk PRIMARY KEY (fi_rol_id, fi_modulo_id),
    CONSTRAINT roles_modulos_rol_fk
        FOREIGN KEY (fi_rol_id) REFERENCES public.roles (fi_rol_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT roles_modulos_modulo_fk
        FOREIGN KEY (fi_modulo_id) REFERENCES seguridad.modulos (fi_modulo_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS seguridad.refresh_tokens (
    fi_token_id    integer       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_usuario_id  integer       NOT NULL,
    fc_token       varchar(255)  NOT NULL,
    fd_expiracion  timestamp     NOT NULL,
    fb_revocado    boolean       NOT NULL DEFAULT false,
    fd_creacion    timestamp     NOT NULL DEFAULT now(),
    CONSTRAINT refresh_tokens_token_uk UNIQUE (fc_token),
    CONSTRAINT refresh_tokens_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS refresh_tokens_token_idx
    ON seguridad.refresh_tokens (fc_token) WHERE fb_revocado = false;
CREATE INDEX IF NOT EXISTS refresh_tokens_usuario_idx
    ON seguridad.refresh_tokens (fi_usuario_id);

-- ----------------------------------------------------------------------------
-- RRHH: puestos, departamentos y tipos de documento
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rrhh.puestos (
    fi_puesto_id integer       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre    varchar(120)  NOT NULL,
    fb_activo    boolean       NOT NULL DEFAULT true,
    CONSTRAINT puestos_nombre_uk UNIQUE (fc_nombre)
);

CREATE TABLE IF NOT EXISTS rrhh.departamentos (
    fi_departamento_id integer      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre          varchar(80)  NOT NULL,
    fb_activo          boolean      NOT NULL DEFAULT true,
    CONSTRAINT departamentos_nombre_uk UNIQUE (fc_nombre)
);

CREATE TABLE IF NOT EXISTS rrhh.tipos_documento (
    fi_tipo_documento_id integer      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre            varchar(80)  NOT NULL,
    fb_obligatorio       boolean      NOT NULL DEFAULT false,
    fb_activo            boolean      NOT NULL DEFAULT true,
    CONSTRAINT tipos_documento_nombre_uk UNIQUE (fc_nombre)
);

COMMENT ON TABLE rrhh.puestos         IS 'Catálogo de puestos organizacionales.';
COMMENT ON TABLE rrhh.departamentos   IS 'Catálogo de departamentos.';
COMMENT ON TABLE rrhh.tipos_documento IS 'Tipos de documento para expedientes de empleados.';

-- ----------------------------------------------------------------------------
-- Catálogo de unidades de negocio
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.unidades_negocio (
    fi_unidad_negocio_id integer      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre            varchar(100) NOT NULL,
    fb_activo            boolean      NOT NULL DEFAULT true,
    CONSTRAINT unidades_negocio_nombre_uk UNIQUE (fc_nombre)
);

COMMENT ON TABLE public.unidades_negocio IS 'Catálogo de unidades de negocio del grupo.';


-- ============================================================================
-- 2.  INSTALACIONES
-- ----------------------------------------------------------------------------
-- Infraestructura física (tinas, piletas, estanques) donde se alojan los
-- organismos. Base del flujo de inventarios.
-- ============================================================================
CREATE TABLE public.instalaciones (
    fi_instalacion_id       integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_instalacion      varchar(100)   NOT NULL,
    largo                   numeric(10,2)  NOT NULL,
    ancho                   numeric(10,2)  NOT NULL,
    altura                  numeric(10,2)  NOT NULL,
    material                varchar(100)   NOT NULL,
    metros_cubicos          numeric(12,2)  GENERATED ALWAYS AS (largo * ancho * altura) STORED,
    tipo_instalacion        varchar(20)    NOT NULL,
    estado                  varchar(20)    NOT NULL DEFAULT 'vacia',
    fc_granja               varchar(100)   NOT NULL,
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),
    fd_fecha_modificacion   timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT instalaciones_largo_chk   CHECK (largo  > 0),
    CONSTRAINT instalaciones_ancho_chk   CHECK (ancho  > 0),
    CONSTRAINT instalaciones_altura_chk  CHECK (altura > 0),
    CONSTRAINT instalaciones_tipo_chk
        CHECK (tipo_instalacion IN ('Alevinaje', 'Reproductores', 'Engorda')),
    CONSTRAINT instalaciones_estado_chk
        CHECK (estado IN ('vacia', 'ocupada')),
    CONSTRAINT instalaciones_granja_chk
        CHECK (fc_granja IN ('Granja Acuícola Medellin', 'Granja Acuícola La Ceiba')),
    CONSTRAINT instalaciones_nombre_granja_uk
        UNIQUE (nombre_instalacion, fc_granja),
    CONSTRAINT instalaciones_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX instalaciones_granja_idx  ON public.instalaciones (fc_granja);
CREATE INDEX instalaciones_tipo_idx    ON public.instalaciones (tipo_instalacion);
CREATE INDEX instalaciones_usuario_idx ON public.instalaciones (fi_usuario_id);

CREATE TRIGGER instalaciones_modif_trg
    BEFORE UPDATE ON public.instalaciones
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

COMMENT ON TABLE  public.instalaciones IS
    'Infraestructura física por granja. Base del inventario.';
COMMENT ON COLUMN public.instalaciones.metros_cubicos IS
    'Volumen en m³ = largo * ancho * altura (columna calculada).';
COMMENT ON COLUMN public.instalaciones.tipo_instalacion IS
    'Enum: Alevinaje, Reproductores, Engorda.';
COMMENT ON COLUMN public.instalaciones.estado IS
    'Enum: vacia (inicial) | ocupada (al sembrar).';


-- ============================================================================
-- 3.  REPRODUCTORES
-- ----------------------------------------------------------------------------
-- Peces reproductores alojados en instalaciones de tipo Reproductores.
-- Generan los lotes de huevos que bajan a las piletas de alevinaje.
-- ============================================================================
CREATE TABLE public.reproductores (
    fi_reproductor_id       integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_instalacion_id       integer        NOT NULL,
    fn_machos               integer        NOT NULL DEFAULT 0,
    fn_hembras              integer        NOT NULL DEFAULT 0,
    fn_cantidad             integer        GENERATED ALWAYS AS (fn_machos + fn_hembras) STORED,
    fn_talla                numeric(10,2),
    fc_ratio                varchar(10),
    fc_linea                varchar(50),
    fc_familia              varchar(20),
    fc_observacion          varchar(500),
    fd_fecha_siembra        date,
    fd_fecha_biometria      date,
    fc_granja               varchar(100)   NOT NULL,
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),
    fd_fecha_modificacion   timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT reproductores_machos_chk  CHECK (fn_machos  >= 0),
    CONSTRAINT reproductores_hembras_chk CHECK (fn_hembras >= 0),
    CONSTRAINT reproductores_talla_chk   CHECK (fn_talla IS NULL OR fn_talla > 0),
    CONSTRAINT reproductores_granja_chk
        CHECK (fc_granja IN ('Granja Acuícola Medellin', 'Granja Acuícola La Ceiba')),
    CONSTRAINT reproductores_instalacion_fk
        FOREIGN KEY (fi_instalacion_id) REFERENCES public.instalaciones (fi_instalacion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT reproductores_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX reproductores_instalacion_idx ON public.reproductores (fi_instalacion_id);
CREATE INDEX reproductores_granja_idx      ON public.reproductores (fc_granja);
CREATE INDEX reproductores_familia_idx     ON public.reproductores (fc_familia);

CREATE TRIGGER reproductores_modif_trg
    BEFORE UPDATE ON public.reproductores
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

COMMENT ON TABLE  public.reproductores IS
    'Stock de reproductores por instalación. fn_cantidad es calculada.';
COMMENT ON COLUMN public.reproductores.fi_instalacion_id IS
    'FK a instalaciones. Sustituye al antiguo fc_instalacion VARCHAR(50).';
COMMENT ON COLUMN public.reproductores.fn_cantidad IS
    'Total = fn_machos + fn_hembras (columna calculada).';


-- ============================================================================
-- 4.  LOTES
-- ----------------------------------------------------------------------------
-- Cada lote es una camada producida por los reproductores: ovadas, huevos
-- por ml, alevines disponibles y mortalidad acumulada.
-- ============================================================================
CREATE TABLE public.lotes (
    fi_lote_id              integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_instalacion_id       integer        NOT NULL,
    fd_fecha                date           NOT NULL,
    familia                 varchar(50)    NOT NULL,
    no_lote                 varchar(50)    NOT NULL,
    huevos_ml               numeric(10,2),
    ovadas                  integer        NOT NULL DEFAULT 0,
    alevines_inicial        integer        NOT NULL,
    mortalidad              integer        NOT NULL DEFAULT 0,
    mortalidad_porcentaje   numeric(6,2)   GENERATED ALWAYS AS (
                                CASE
                                    WHEN alevines_inicial > 0
                                        THEN round(mortalidad::numeric * 100 / alevines_inicial, 2)
                                    ELSE 0
                                END
                            ) STORED,
    fc_granja               varchar(100)   NOT NULL,
    observacion             varchar(500),
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),
    fd_fecha_modificacion   timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT lotes_ovadas_chk           CHECK (ovadas           >= 0),
    CONSTRAINT lotes_alevines_chk         CHECK (alevines_inicial >= 0),
    CONSTRAINT lotes_mortalidad_chk       CHECK (mortalidad       >= 0),
    CONSTRAINT lotes_mortalidad_limit_chk CHECK (mortalidad       <= alevines_inicial),
    CONSTRAINT lotes_no_lote_chk          CHECK (no_lote ~ '^[A-Z0-9-]+$'),
    CONSTRAINT lotes_granja_chk
        CHECK (fc_granja IN ('Granja Acuícola Medellin', 'Granja Acuícola La Ceiba')),
    CONSTRAINT lotes_no_lote_uk
        UNIQUE (no_lote),
    CONSTRAINT lotes_instalacion_fk
        FOREIGN KEY (fi_instalacion_id) REFERENCES public.instalaciones (fi_instalacion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT lotes_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX lotes_instalacion_idx ON public.lotes (fi_instalacion_id);
CREATE INDEX lotes_granja_idx      ON public.lotes (fc_granja);
CREATE INDEX lotes_fecha_idx       ON public.lotes (fd_fecha);

CREATE TRIGGER lotes_modif_trg
    BEFORE UPDATE ON public.lotes
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

COMMENT ON TABLE  public.lotes IS
    'Camadas producidas por los reproductores. Origen de los alevines.';
COMMENT ON COLUMN public.lotes.fi_instalacion_id IS
    'FK a instalaciones (de tipo Reproductores). Sustituye al antiguo fc_instalacion_id VARCHAR(50).';
COMMENT ON COLUMN public.lotes.mortalidad_porcentaje IS
    'Porcentaje calculado = mortalidad * 100 / alevines_inicial (0 si alevines_inicial = 0).';


-- ============================================================================
-- 5.  PILETAS (Alevinaje)
-- ----------------------------------------------------------------------------
-- Inventario actual por instalación de tipo Alevinaje: cantidad de alevines,
-- lote de origen, talla. El histórico de movimientos vive en
-- trazabilidad_alevinaje.
-- ============================================================================
CREATE TABLE public.piletas (
    fi_pileta_id            integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_instalacion_id       integer        NOT NULL,
    fi_lote_id              integer,
    cantidad                bigint         NOT NULL DEFAULT 0,
    talla_gr                numeric(14,2),
    observacion             varchar(500),
    fd_fecha_siembra        date           NOT NULL DEFAULT CURRENT_DATE,
    fd_fecha_ultima_biometria date         NOT NULL DEFAULT CURRENT_DATE,
    fc_granja               varchar(100)   NOT NULL,
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),
    fd_fecha_modificacion   timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT piletas_cantidad_chk CHECK (cantidad >= 0),
    CONSTRAINT piletas_talla_chk    CHECK (talla_gr IS NULL OR talla_gr > 0),
    CONSTRAINT piletas_granja_chk
        CHECK (fc_granja IN ('Granja Acuícola Medellin', 'Granja Acuícola La Ceiba')),
    CONSTRAINT piletas_instalacion_uk
        UNIQUE (fi_instalacion_id),
    CONSTRAINT piletas_instalacion_fk
        FOREIGN KEY (fi_instalacion_id) REFERENCES public.instalaciones (fi_instalacion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT piletas_lote_fk
        FOREIGN KEY (fi_lote_id) REFERENCES public.lotes (fi_lote_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT piletas_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX piletas_lote_idx    ON public.piletas (fi_lote_id);
CREATE INDEX piletas_granja_idx  ON public.piletas (fc_granja);
CREATE INDEX piletas_usuario_idx ON public.piletas (fi_usuario_id);

CREATE TRIGGER piletas_modif_trg
    BEFORE UPDATE ON public.piletas
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

COMMENT ON TABLE  public.piletas IS
    'Estado vigente de cada instalación de alevinaje. El histórico de movimientos está en trazabilidad_alevinaje.';
COMMENT ON CONSTRAINT piletas_instalacion_uk ON public.piletas IS
    'Una pileta por instalación: los movimientos SUMAN a la pileta existente, no crean duplicados.';


-- ============================================================================
-- 6.  ENGORDA
-- ----------------------------------------------------------------------------
-- Traslado desde piletas de alevinaje hacia instalaciones de tipo Engorda.
-- fi_lote_id indica el lote de origen directamente (ya no existe el campo
-- confuso origen_instalacion).
-- ============================================================================
CREATE TABLE public.engorda (
    fi_engorda_id           integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_instalacion_id       integer        NOT NULL,
    fi_lote_id              integer        NOT NULL,
    cantidad                integer        NOT NULL,
    talla_gr                numeric(10,2),
    observacion             varchar(500),
    fd_fecha_siembra        date,
    fd_fecha_biometria      date,
    fc_granja               varchar(100)   NOT NULL,
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),
    fd_fecha_modificacion   timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT engorda_cantidad_chk CHECK (cantidad > 0),
    CONSTRAINT engorda_talla_chk    CHECK (talla_gr IS NULL OR talla_gr > 0),
    CONSTRAINT engorda_granja_chk
        CHECK (fc_granja IN ('Granja Acuícola Medellin', 'Granja Acuícola La Ceiba')),
    CONSTRAINT engorda_instalacion_fk
        FOREIGN KEY (fi_instalacion_id) REFERENCES public.instalaciones (fi_instalacion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT engorda_lote_fk
        FOREIGN KEY (fi_lote_id) REFERENCES public.lotes (fi_lote_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT engorda_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX engorda_instalacion_idx ON public.engorda (fi_instalacion_id);
CREATE INDEX engorda_lote_idx        ON public.engorda (fi_lote_id);
CREATE INDEX engorda_granja_idx      ON public.engorda (fc_granja);

CREATE TRIGGER engorda_modif_trg
    BEFORE UPDATE ON public.engorda
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

COMMENT ON TABLE  public.engorda IS
    'Estado vigente de cada instalación de engorda. El histórico está en trazabilidad_engorda.';
COMMENT ON COLUMN public.engorda.fi_lote_id IS
    'FK directo al lote de origen. Sustituye al antiguo origen_instalacion integer.';


-- ============================================================================
-- 7.  EQUIPOS
-- ----------------------------------------------------------------------------
-- Inventario de equipos/herramientas por usuario (bombas, redes, sensores).
-- Independiente del flujo biológico.
-- ============================================================================
CREATE TABLE public.equipos (
    fi_equipo_id                integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre                   varchar(150)   NOT NULL,
    fc_marca                    varchar(100),
    fc_modelo                   varchar(100),
    fc_tipo                     varchar(100),
    fd_fecha_compra             date,
    fn_costo                    numeric(12,2),
    fc_estado                   varchar(50)    NOT NULL DEFAULT 'Operativo',
    fc_ubicacion                varchar(150),
    fc_responsable              varchar(100),
    fd_proximo_mantenimiento    date,
    fc_notas                    text,
    fi_usuario_id               integer        NOT NULL,
    fd_fecha_registro           timestamp      NOT NULL DEFAULT now(),
    fd_fecha_modificacion       timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT equipos_costo_chk CHECK (fn_costo IS NULL OR fn_costo >= 0),
    CONSTRAINT equipos_estado_chk
        CHECK (fc_estado IN ('Operativo', 'En mantenimiento', 'Dañado')),
    CONSTRAINT equipos_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX equipos_usuario_idx ON public.equipos (fi_usuario_id);
CREATE INDEX equipos_estado_idx  ON public.equipos (fc_estado);

CREATE TRIGGER equipos_modif_trg
    BEFORE UPDATE ON public.equipos
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

COMMENT ON TABLE public.equipos IS
    'Equipos/herramientas del usuario (bombas, redes, sensores, etc.).';


-- ============================================================================
-- 8.  MANTENIMIENTOS
-- ----------------------------------------------------------------------------
-- Bitácora de mantenimientos aplicados a cada equipo.
-- ============================================================================
CREATE TABLE public.mantenimientos (
    fi_mantenimiento_id         integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_equipo_id                integer        NOT NULL,
    fd_fecha                    date           NOT NULL,
    fc_tipo                     varchar(50)    NOT NULL DEFAULT 'Preventivo',
    fc_responsable              varchar(100),
    fc_descripcion              text,
    fn_costo                    numeric(12,2)  NOT NULL DEFAULT 0,
    fc_estado_post              varchar(50),
    fd_proximo_mantenimiento    date,
    fd_fecha_registro           timestamp      NOT NULL DEFAULT now(),
    fd_fecha_modificacion       timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT mantenimientos_costo_chk CHECK (fn_costo >= 0),
    CONSTRAINT mantenimientos_tipo_chk
        CHECK (fc_tipo IN ('Preventivo', 'Correctivo', 'Predictivo')),
    CONSTRAINT mantenimientos_equipo_fk
        FOREIGN KEY (fi_equipo_id) REFERENCES public.equipos (fi_equipo_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX mantenimientos_equipo_idx ON public.mantenimientos (fi_equipo_id);
CREATE INDEX mantenimientos_fecha_idx  ON public.mantenimientos (fd_fecha);

CREATE TRIGGER mantenimientos_modif_trg
    BEFORE UPDATE ON public.mantenimientos
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

COMMENT ON TABLE public.mantenimientos IS
    'Histórico de visitas de mantenimiento por equipo. Cascade al borrar el equipo.';


-- ============================================================================
-- 9.  ALIMENTOS
-- ----------------------------------------------------------------------------
-- Registro diario de alimentación. Cada fila referencia exactamente UNA
-- unidad productiva: pileta, engorda o reproductor (nunca varias).
-- ============================================================================
CREATE TABLE public.alimentos (
    fi_alimento_id          integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_pileta_id            integer,
    fi_engorda_id           integer,
    fi_reproductor_id       integer,
    particula_mm            numeric(10,2),
    alimento_dia            numeric(10,3),
    porcion                 numeric(10,3),
    gasto_alimento          numeric(12,2),
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),
    fd_fecha_modificacion   timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT alimentos_unidad_chk CHECK (
        (CASE WHEN fi_pileta_id      IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN fi_engorda_id     IS NOT NULL THEN 1 ELSE 0 END)
      + (CASE WHEN fi_reproductor_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    ),
    CONSTRAINT alimentos_pileta_fk
        FOREIGN KEY (fi_pileta_id) REFERENCES public.piletas (fi_pileta_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT alimentos_engorda_fk
        FOREIGN KEY (fi_engorda_id) REFERENCES public.engorda (fi_engorda_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT alimentos_reproductor_fk
        FOREIGN KEY (fi_reproductor_id) REFERENCES public.reproductores (fi_reproductor_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT alimentos_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX alimentos_pileta_idx      ON public.alimentos (fi_pileta_id);
CREATE INDEX alimentos_engorda_idx     ON public.alimentos (fi_engorda_id);
CREATE INDEX alimentos_reproductor_idx ON public.alimentos (fi_reproductor_id);
CREATE INDEX alimentos_usuario_idx     ON public.alimentos (fi_usuario_id);

CREATE TRIGGER alimentos_modif_trg
    BEFORE UPDATE ON public.alimentos
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

COMMENT ON TABLE public.alimentos IS
    'Bitácora de alimentación. Cada fila referencia exactamente una unidad productiva (pileta | engorda | reproductor).';
COMMENT ON CONSTRAINT alimentos_unidad_chk ON public.alimentos IS
    'Garantiza que exactamente una de las tres FKs (pileta/engorda/reproductor) esté poblada.';


-- ============================================================================
-- 10.  TRAZABILIDAD — ALEVINAJE
-- ----------------------------------------------------------------------------
-- Histórico de movimientos entre piletas / desde origen externo / bajas por
-- mortalidad. Se conserva aunque se borren piletas o lotes (SET NULL).
-- ============================================================================
CREATE TABLE public.trazabilidad_alevinaje (
    fi_movimiento_id        integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_pileta_origen        integer,
    fi_pileta_destino       integer,
    fi_instalacion_origen   integer,
    fi_instalacion_destino  integer,
    fi_lote_id              integer,
    origen_externo          text,
    tipo_movimiento         varchar(20)    NOT NULL DEFAULT 'TRASLADO',
    cantidad                bigint         NOT NULL,
    observacion             varchar(500),
    fc_granja               varchar(100)   NOT NULL,
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_movimiento     date           NOT NULL DEFAULT CURRENT_DATE,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT traza_alev_cantidad_chk CHECK (cantidad > 0),
    CONSTRAINT traza_alev_tipo_chk
        CHECK (tipo_movimiento IN ('TRASLADO', 'SIEMBRA', 'MORTALIDAD')),
    CONSTRAINT traza_alev_granja_chk
        CHECK (fc_granja IN ('Granja Acuícola Medellin', 'Granja Acuícola La Ceiba')),
    CONSTRAINT traza_alev_origen_chk CHECK (
        fi_pileta_origen     IS NOT NULL
     OR fi_instalacion_origen IS NOT NULL
     OR origen_externo       IS NOT NULL
    ),
    CONSTRAINT traza_alev_origen_interno_externo_chk CHECK (
        NOT (origen_externo IS NOT NULL
             AND (fi_pileta_origen IS NOT NULL OR fi_instalacion_origen IS NOT NULL))
    ),
    CONSTRAINT traza_alev_pileta_origen_fk
        FOREIGN KEY (fi_pileta_origen)  REFERENCES public.piletas (fi_pileta_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_pileta_destino_fk
        FOREIGN KEY (fi_pileta_destino) REFERENCES public.piletas (fi_pileta_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_instalacion_origen_fk
        FOREIGN KEY (fi_instalacion_origen)  REFERENCES public.instalaciones (fi_instalacion_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_instalacion_destino_fk
        FOREIGN KEY (fi_instalacion_destino) REFERENCES public.instalaciones (fi_instalacion_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_lote_fk
        FOREIGN KEY (fi_lote_id) REFERENCES public.lotes (fi_lote_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_alev_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX traza_alev_pileta_origen_idx       ON public.trazabilidad_alevinaje (fi_pileta_origen);
CREATE INDEX traza_alev_pileta_destino_idx      ON public.trazabilidad_alevinaje (fi_pileta_destino);
CREATE INDEX traza_alev_instalacion_origen_idx  ON public.trazabilidad_alevinaje (fi_instalacion_origen);
CREATE INDEX traza_alev_instalacion_destino_idx ON public.trazabilidad_alevinaje (fi_instalacion_destino);
CREATE INDEX traza_alev_lote_idx                ON public.trazabilidad_alevinaje (fi_lote_id);
CREATE INDEX traza_alev_fecha_idx               ON public.trazabilidad_alevinaje (fd_fecha_movimiento DESC);
CREATE INDEX traza_alev_granja_idx              ON public.trazabilidad_alevinaje (fc_granja);

COMMENT ON TABLE public.trazabilidad_alevinaje IS
    'Histórico de movimientos de alevinaje (traslados, siembras, mortalidad).';
COMMENT ON CONSTRAINT traza_alev_origen_chk ON public.trazabilidad_alevinaje IS
    'Todo movimiento debe tener algún origen: pileta interna, instalación o texto externo.';
COMMENT ON CONSTRAINT traza_alev_origen_interno_externo_chk ON public.trazabilidad_alevinaje IS
    'origen_externo y origen interno son mutuamente excluyentes.';


-- ============================================================================
-- 11.  TRAZABILIDAD — ENGORDA
-- ----------------------------------------------------------------------------
-- Histórico de traslados entre instalaciones de engorda.
-- ============================================================================
CREATE TABLE public.trazabilidad_engorda (
    fi_movimiento_id        integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_engorda_origen       integer,
    fi_engorda_destino      integer,
    cantidad_trasladada     integer        NOT NULL,
    observacion             text,
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_movimiento     date           NOT NULL DEFAULT CURRENT_DATE,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT traza_eng_cantidad_chk CHECK (cantidad_trasladada > 0),
    CONSTRAINT traza_eng_distinto_chk
        CHECK (fi_engorda_origen IS DISTINCT FROM fi_engorda_destino),
    CONSTRAINT traza_eng_origen_fk
        FOREIGN KEY (fi_engorda_origen)  REFERENCES public.engorda (fi_engorda_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_eng_destino_fk
        FOREIGN KEY (fi_engorda_destino) REFERENCES public.engorda (fi_engorda_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_eng_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX traza_eng_origen_idx  ON public.trazabilidad_engorda (fi_engorda_origen);
CREATE INDEX traza_eng_destino_idx ON public.trazabilidad_engorda (fi_engorda_destino);
CREATE INDEX traza_eng_fecha_idx   ON public.trazabilidad_engorda (fd_fecha_movimiento DESC);

COMMENT ON TABLE public.trazabilidad_engorda IS
    'Histórico de traslados entre instalaciones de engorda.';


-- ============================================================================
-- 12.  TRAZABILIDAD — REPRODUCTORES
-- ----------------------------------------------------------------------------
-- Histórico de altas/traslados de reproductores. Origen puede ser interno
-- (otro reproductor registrado) o externo (texto libre: "proveedor X").
-- ============================================================================
CREATE TABLE public.trazabilidad_reproductores (
    fi_movimiento_id        integer        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_repro_origen         integer,
    fi_repro_destino        integer,
    origen_texto            varchar(150),
    cantidad_trasladada     integer,
    observacion             text,
    fi_usuario_id           integer        NOT NULL,
    fd_fecha_movimiento     date           NOT NULL DEFAULT CURRENT_DATE,
    fd_fecha_registro       timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT traza_repro_cantidad_chk
        CHECK (cantidad_trasladada IS NULL OR cantidad_trasladada > 0),
    CONSTRAINT traza_repro_origen_chk
        CHECK (origen_texto IS NOT NULL OR fi_repro_origen IS NOT NULL),
    CONSTRAINT traza_repro_distinto_chk
        CHECK (fi_repro_origen IS DISTINCT FROM fi_repro_destino),
    CONSTRAINT traza_repro_origen_fk
        FOREIGN KEY (fi_repro_origen)  REFERENCES public.reproductores (fi_reproductor_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_repro_destino_fk
        FOREIGN KEY (fi_repro_destino) REFERENCES public.reproductores (fi_reproductor_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT traza_repro_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX traza_repro_origen_idx  ON public.trazabilidad_reproductores (fi_repro_origen);
CREATE INDEX traza_repro_destino_idx ON public.trazabilidad_reproductores (fi_repro_destino);
CREATE INDEX traza_repro_fecha_idx   ON public.trazabilidad_reproductores (fd_fecha_movimiento DESC);

COMMENT ON TABLE public.trazabilidad_reproductores IS
    'Histórico de altas/traslados de reproductores (interno o externo).';


-- ============================================================================
-- 13.  RRHH — TRANSACCIONAL  (empleados, documentos, nómina, vacaciones,
--                             caja de ahorro)
-- ----------------------------------------------------------------------------
-- Las tablas catálogo (puestos, departamentos, tipos_documento) ya quedaron
-- creadas en la sección 1.5. Aquí se definen las tablas que acumulan
-- movimientos diarios del área de Recursos Humanos.
-- ============================================================================

CREATE TABLE rrhh.empleados (
    fi_empleado_id           INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_usuario_id            INTEGER,
    fi_departamento_id       INTEGER         NOT NULL,
    fi_puesto_id             INTEGER,
    fi_unidad_negocio_id     INTEGER,

    fc_nombre                VARCHAR(60)     NOT NULL,
    fc_apellido_paterno      VARCHAR(60)     NOT NULL,
    fc_apellido_materno      VARCHAR(60)     NOT NULL,
    fc_genero                VARCHAR(20),
    fd_fecha_nacimiento      DATE,

    fc_estado                VARCHAR(50),
    fc_ciudad                VARCHAR(60),
    fc_calle                 VARCHAR(120),
    fc_codigo_postal         VARCHAR(10),
    fc_referencias           VARCHAR(255),
    ft_comentarios_adicionales TEXT,

    fd_fecha_contratacion    DATE,
    fn_uniformes             INTEGER         NOT NULL DEFAULT 0,
    fb_activo                BOOLEAN         NOT NULL DEFAULT TRUE,
    fd_fecha_alta            DATE            NOT NULL DEFAULT CURRENT_DATE,
    fd_fecha_baja            DATE,

    fd_fecha_registro        TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)    NOT NULL DEFAULT NOW(),

    CONSTRAINT empleados_genero_check
        CHECK (fc_genero IS NULL OR fc_genero IN ('M','F','Masculino','Femenino','Otro')),
    CONSTRAINT empleados_uniformes_check
        CHECK (fn_uniformes >= 0),
    CONSTRAINT empleados_codigo_postal_check
        CHECK (fc_codigo_postal IS NULL OR fc_codigo_postal ~ '^[0-9]{4,10}$'),

    CONSTRAINT empleados_usuario_fk
        FOREIGN KEY (fi_usuario_id)      REFERENCES public.usuarios (fi_usuario_id)      ON DELETE SET NULL,
    CONSTRAINT empleados_departamento_fk
        FOREIGN KEY (fi_departamento_id) REFERENCES rrhh.departamentos (fi_departamento_id) ON DELETE RESTRICT,
    CONSTRAINT empleados_puesto_fk
        FOREIGN KEY (fi_puesto_id)       REFERENCES rrhh.puestos (fi_puesto_id)           ON DELETE SET NULL,
    CONSTRAINT empleados_unidad_negocio_fk
        FOREIGN KEY (fi_unidad_negocio_id) REFERENCES public.unidades_negocio (fi_unidad_negocio_id) ON DELETE SET NULL
);

CREATE INDEX empleados_departamento_idx ON rrhh.empleados (fi_departamento_id);
CREATE INDEX empleados_puesto_idx       ON rrhh.empleados (fi_puesto_id);
CREATE INDEX empleados_unidad_negocio_idx ON rrhh.empleados (fi_unidad_negocio_id);
CREATE INDEX empleados_usuario_idx      ON rrhh.empleados (fi_usuario_id);
CREATE INDEX empleados_activo_idx       ON rrhh.empleados (fb_activo);
CREATE INDEX empleados_apellidos_idx    ON rrhh.empleados (fc_apellido_paterno, fc_apellido_materno);

COMMENT ON TABLE rrhh.empleados IS
'Expediente de empleados. fi_usuario_id es opcional: no todo empleado
 tiene cuenta de acceso. Al borrar un usuario, el empleado conserva su
 historial (SET NULL).';


-- Documentos del expediente -------------------------------------------------

CREATE TABLE rrhh.documentos_empleado (
    fi_documento_id          INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_empleado_id           INTEGER         NOT NULL,
    fi_tipo_documento_id     INTEGER         NOT NULL,
    fc_ruta_archivo          VARCHAR(500)    NOT NULL,
    fc_nombre_original       VARCHAR(255)    NOT NULL,
    fd_fecha_carga           DATE            NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT doc_emp_unico UNIQUE (fi_empleado_id, fi_tipo_documento_id),

    CONSTRAINT doc_emp_empleado_fk
        FOREIGN KEY (fi_empleado_id)       REFERENCES rrhh.empleados (fi_empleado_id)       ON DELETE CASCADE,
    CONSTRAINT doc_emp_tipo_fk
        FOREIGN KEY (fi_tipo_documento_id) REFERENCES rrhh.tipos_documento (fi_tipo_documento_id) ON DELETE RESTRICT
);

CREATE INDEX doc_emp_empleado_idx ON rrhh.documentos_empleado (fi_empleado_id);
CREATE INDEX doc_emp_tipo_idx     ON rrhh.documentos_empleado (fi_tipo_documento_id);

COMMENT ON TABLE rrhh.documentos_empleado IS
'Archivos cargados al expediente (INE, RFC, CURP, etc.). Un empleado
 no puede tener dos documentos del mismo tipo: UNIQUE (empleado, tipo).';


-- Actas administrativas -----------------------------------------------------

CREATE TABLE rrhh.actas_administrativas (
    fi_acta_id               INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_empleado_id           INTEGER         NOT NULL,
    fc_motivo                TEXT            NOT NULL,
    fd_fecha                 DATE            NOT NULL,
    fc_ruta_archivo          VARCHAR(500)    NOT NULL,
    fc_nombre_original       VARCHAR(255)    NOT NULL,
    fd_fecha_registro        TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)    NOT NULL DEFAULT NOW(),

    CONSTRAINT actas_admin_empleado_fk
        FOREIGN KEY (fi_empleado_id) REFERENCES rrhh.empleados (fi_empleado_id) ON DELETE CASCADE
);

CREATE INDEX actas_admin_empleado_idx ON rrhh.actas_administrativas (fi_empleado_id);
CREATE INDEX actas_admin_fecha_idx    ON rrhh.actas_administrativas (fd_fecha DESC);

COMMENT ON TABLE rrhh.actas_administrativas IS
'Actas administrativas vinculadas al expediente de cada empleado.';


-- Nómina --------------------------------------------------------------------

CREATE TABLE public.nomina (
    fi_nomina_id             INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_empleado_id           INTEGER,
    fc_nombre_empleado       VARCHAR(120)    NOT NULL,
    fd_fecha_pago            DATE            NOT NULL DEFAULT CURRENT_DATE,
    fn_total                 NUMERIC(10,2)   NOT NULL DEFAULT 0,
    fn_bono                  NUMERIC(10,2)   NOT NULL DEFAULT 0,
    fn_deuda                 NUMERIC(10,2)   NOT NULL DEFAULT 0,
    fn_descuento             NUMERIC(10,2)   NOT NULL DEFAULT 0,
    fn_anticipo              NUMERIC(10,2)   NOT NULL DEFAULT 0,
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)    NOT NULL DEFAULT NOW(),
    fd_fecha_actualizacion   TIMESTAMP(6)    NOT NULL DEFAULT NOW(),

    CONSTRAINT nomina_montos_no_negativos
        CHECK (fn_total >= 0 AND fn_bono >= 0 AND fn_deuda >= 0
               AND fn_descuento >= 0 AND fn_anticipo >= 0),

    CONSTRAINT nomina_empleado_fk
        FOREIGN KEY (fi_empleado_id) REFERENCES rrhh.empleados (fi_empleado_id) ON DELETE SET NULL,
    CONSTRAINT nomina_usuario_fk
        FOREIGN KEY (fi_usuario_id)  REFERENCES public.usuarios (fi_usuario_id)  ON DELETE SET NULL
);

CREATE INDEX nomina_empleado_idx    ON public.nomina (fi_empleado_id);
CREATE INDEX nomina_fecha_pago_idx  ON public.nomina (fd_fecha_pago DESC);
CREATE INDEX nomina_usuario_idx     ON public.nomina (fi_usuario_id);

COMMENT ON TABLE public.nomina IS
'Pagos de nómina. Mantiene fc_nombre_empleado para preservar el histórico
 aunque el empleado sea eliminado o renombrado. El trigger de auditoría
 mantiene fd_fecha_actualizacion alineada con cualquier UPDATE.';


-- Vacaciones ----------------------------------------------------------------

CREATE TABLE public.vacaciones (
    fi_vacacion_id              INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_empleado_id              INTEGER,
    fc_nombre_empleado          VARCHAR(120) NOT NULL,
    fc_departamento             VARCHAR(80),

    fd_inicio_periodo           DATE         NOT NULL,
    fd_fin_periodo              DATE         NOT NULL,

    fn_dias_trabajados          INTEGER      NOT NULL DEFAULT 0,
    fn_vacaciones_v             INTEGER      NOT NULL DEFAULT 0,
    fn_enfermedad_e             INTEGER      NOT NULL DEFAULT 0,
    fn_maternidad_m             INTEGER      NOT NULL DEFAULT 0,
    fn_permiso_parcial_pp       INTEGER      NOT NULL DEFAULT 0,
    fn_permiso_total_pt         INTEGER      NOT NULL DEFAULT 0,
    fn_inasistencias_i          INTEGER      NOT NULL DEFAULT 0,
    fn_vacaciones_anio          INTEGER      NOT NULL DEFAULT 0,
    fn_dias_previos             INTEGER      NOT NULL DEFAULT 0,
    fn_vacaciones_disponibles   INTEGER      NOT NULL DEFAULT 0,
    fn_vacaciones_disfrutadas   INTEGER      NOT NULL DEFAULT 0,

    fc_asistencia               VARCHAR(50)  NOT NULL DEFAULT 'Asistió',
    fd_fecha_actualizacion      TIMESTAMP(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT vacaciones_periodo_valido
        CHECK (fd_inicio_periodo <= fd_fin_periodo),
    CONSTRAINT vacaciones_contadores_no_negativos
        CHECK (fn_dias_trabajados        >= 0
           AND fn_vacaciones_v           >= 0
           AND fn_enfermedad_e           >= 0
           AND fn_maternidad_m           >= 0
           AND fn_permiso_parcial_pp     >= 0
           AND fn_permiso_total_pt       >= 0
           AND fn_inasistencias_i        >= 0
           AND fn_vacaciones_anio        >= 0
           AND fn_dias_previos           >= 0
           AND fn_vacaciones_disponibles >= 0
           AND fn_vacaciones_disfrutadas >= 0),

    CONSTRAINT vacaciones_empleado_fk
        FOREIGN KEY (fi_empleado_id) REFERENCES rrhh.empleados (fi_empleado_id) ON DELETE SET NULL
);

CREATE INDEX vacaciones_empleado_idx ON public.vacaciones (fi_empleado_id);
CREATE INDEX vacaciones_periodo_idx  ON public.vacaciones (fd_inicio_periodo, fd_fin_periodo);

COMMENT ON TABLE public.vacaciones IS
'Registro semanal de días trabajados / ausencias / vacaciones por empleado.
 fi_empleado_id es opcional para soportar periodos históricos previos a la
 creación formal del expediente.';


-- Caja de ahorro (resumen mensual) -----------------------------------------

CREATE TABLE public.caja_ahorro_resumen (
    fi_caja_ahorro_id   INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_categoria        VARCHAR(100)   NOT NULL,
    fc_granja           VARCHAR(50)    NOT NULL DEFAULT 'Ceiba',

    enero       NUMERIC(12,2) NOT NULL DEFAULT 0,
    febrero     NUMERIC(12,2) NOT NULL DEFAULT 0,
    marzo       NUMERIC(12,2) NOT NULL DEFAULT 0,
    abril       NUMERIC(12,2) NOT NULL DEFAULT 0,
    mayo        NUMERIC(12,2) NOT NULL DEFAULT 0,
    junio       NUMERIC(12,2) NOT NULL DEFAULT 0,
    julio       NUMERIC(12,2) NOT NULL DEFAULT 0,
    agosto      NUMERIC(12,2) NOT NULL DEFAULT 0,
    septiembre  NUMERIC(12,2) NOT NULL DEFAULT 0,
    octubre     NUMERIC(12,2) NOT NULL DEFAULT 0,
    noviembre   NUMERIC(12,2) NOT NULL DEFAULT 0,
    diciembre   NUMERIC(12,2) NOT NULL DEFAULT 0,

    total NUMERIC(14,2) GENERATED ALWAYS AS (
        COALESCE(enero,0)      + COALESCE(febrero,0)   + COALESCE(marzo,0)
      + COALESCE(abril,0)      + COALESCE(mayo,0)      + COALESCE(junio,0)
      + COALESCE(julio,0)      + COALESCE(agosto,0)    + COALESCE(septiembre,0)
      + COALESCE(octubre,0)    + COALESCE(noviembre,0) + COALESCE(diciembre,0)
    ) STORED,

    actualizado TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT caja_ahorro_categoria_granja_uq UNIQUE (fc_categoria, fc_granja),

    CONSTRAINT caja_ahorro_montos_no_negativos
        CHECK (enero>=0 AND febrero>=0 AND marzo>=0 AND abril>=0
           AND mayo>=0  AND junio>=0   AND julio>=0 AND agosto>=0
           AND septiembre>=0 AND octubre>=0 AND noviembre>=0 AND diciembre>=0)
);

CREATE INDEX caja_ahorro_categoria_idx ON public.caja_ahorro_resumen (fc_categoria);
CREATE INDEX caja_ahorro_granja_idx    ON public.caja_ahorro_resumen (fc_granja);

COMMENT ON TABLE public.caja_ahorro_resumen IS
'Resumen anual (12 meses) del fondo de caja de ahorro. Una fila por
 categoría/granja. La columna total se calcula automáticamente (GENERATED).';

COMMENT ON COLUMN public.caja_ahorro_resumen.total IS
'Total anual calculado automáticamente como suma de los 12 meses.';


-- ============================================================================
-- 14.  VENTAS / CRM  (clientes, proveedores, ventas, lista_espera)
-- ============================================================================

CREATE TABLE public.clientes (
    fi_cliente_id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_nombre              VARCHAR(100) NOT NULL,
    fc_telefono            VARCHAR(20),
    fc_correo              VARCHAR(255),
    fc_cp                  CHAR(5),
    fc_localidad           VARCHAR(100),
    fi_usuario_id          INTEGER      NOT NULL,
    fd_fecha_registro      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion  TIMESTAMP(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT clientes_correo_check
        CHECK (fc_correo IS NULL OR fc_correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    CONSTRAINT clientes_cp_check
        CHECK (fc_cp IS NULL OR fc_cp ~ '^[0-9]{5}$'),

    CONSTRAINT clientes_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE RESTRICT
);

CREATE INDEX clientes_nombre_idx   ON public.clientes (fc_nombre);
CREATE INDEX clientes_localidad_idx ON public.clientes (fc_localidad);
CREATE INDEX clientes_usuario_idx  ON public.clientes (fi_usuario_id);

COMMENT ON TABLE public.clientes IS
'Catálogo de clientes. fi_usuario_id registra quién dio de alta al cliente.';


-- Proveedores ---------------------------------------------------------------
--
-- Nota: en el schema original esta tabla usa snake_case (razon_social,
-- created_at, updated_at). Se mantiene esa convención para no romper el
-- backend, pero se añaden restricciones y auditoría.

CREATE TABLE public.proveedores (
    id                 INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    razon_social       VARCHAR(255) NOT NULL,
    rfc                VARCHAR(50),
    udn                VARCHAR(100),
    nombre_contacto    VARCHAR(150),
    telefono           VARCHAR(50),
    correo             VARCHAR(150),
    localidad          VARCHAR(150),
    estado             VARCHAR(100),
    ejecutivo          VARCHAR(150),
    precio_venta       NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at         TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT proveedores_precio_venta_no_negativo
        CHECK (precio_venta >= 0),
    CONSTRAINT proveedores_correo_check
        CHECK (correo IS NULL OR correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

CREATE INDEX proveedores_razon_social_idx ON public.proveedores (razon_social);
CREATE INDEX proveedores_udn_idx          ON public.proveedores (udn);
CREATE INDEX proveedores_rfc_idx          ON public.proveedores (rfc);

COMMENT ON TABLE public.proveedores IS
'Catálogo de proveedores. Mantiene naming snake_case heredado del esquema
 original por compatibilidad con el backend.';


-- Ventas --------------------------------------------------------------------
--
-- fc_cliente y fc_encargado_venta se conservan como texto para preservar el
-- historial aunque el cliente/usuario sea eliminado o renombrado.

CREATE TABLE public.ventas (
    fi_venta_id           INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_folio              VARCHAR(50),
    fd_fecha_venta        DATE          NOT NULL,
    fc_cliente            VARCHAR(150)  NOT NULL,
    fc_tipo_venta         VARCHAR(50)   NOT NULL,
    fn_cantidad_vendida   INTEGER       NOT NULL,
    fn_precio_venta       NUMERIC(10,2) NOT NULL,
    fn_monto_total        NUMERIC(12,2) NOT NULL,
    fn_abonado            NUMERIC(12,2) NOT NULL DEFAULT 0,
    fn_adeudo             NUMERIC(12,2) GENERATED ALWAYS AS (fn_monto_total - fn_abonado) STORED,
    fc_estado_pago        VARCHAR(20)   NOT NULL DEFAULT 'ADEUDO',
    fc_empresa            TEXT          NOT NULL,
    fc_encargado_venta    TEXT,
    fc_observaciones      TEXT,
    fd_fecha_registro     TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT ventas_cantidad_positiva   CHECK (fn_cantidad_vendida > 0),
    CONSTRAINT ventas_precio_no_negativo  CHECK (fn_precio_venta    >= 0),
    CONSTRAINT ventas_monto_no_negativo   CHECK (fn_monto_total     >= 0),
    CONSTRAINT ventas_abonado_no_negativo CHECK (fn_abonado         >= 0),
    CONSTRAINT ventas_abonado_max         CHECK (fn_abonado <= fn_monto_total),
    CONSTRAINT ventas_estado_pago_check
        CHECK (fc_estado_pago IN ('PAGADO','ADEUDO','PARCIAL','CANCELADO'))
);

CREATE INDEX ventas_cliente_idx     ON public.ventas (fc_cliente);
CREATE INDEX ventas_fecha_idx       ON public.ventas (fd_fecha_venta DESC);
CREATE INDEX ventas_estado_pago_idx ON public.ventas (fc_estado_pago);
CREATE INDEX ventas_empresa_idx     ON public.ventas (fc_empresa);
CREATE INDEX ventas_folio_idx       ON public.ventas (fc_folio) WHERE fc_folio IS NOT NULL;

COMMENT ON TABLE public.ventas IS
'Ventas registradas. fn_adeudo se calcula automáticamente como
 fn_monto_total - fn_abonado. El CHECK (abonado <= monto_total) evita
 pagos en exceso.';


-- Lista de espera (reservas pendientes) ------------------------------------

CREATE TABLE public.lista_espera (
    fi_lista_id             INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fd_fecha_entrega        DATE         NOT NULL,
    fc_talla                VARCHAR(50),
    fn_cantidad             NUMERIC(12,2) NOT NULL,
    fn_precio_venta         NUMERIC(12,2),
    fc_cliente              VARCHAR(200),
    fc_lugar_entrega        VARCHAR(200),
    fc_encargado_venta      VARCHAR(200),
    fc_unidad_produccion    VARCHAR(200),
    fc_uap_asignada         VARCHAR(200),
    fc_granja_asignada      VARCHAR(200),
    fc_hora_embolsado       VARCHAR(20),
    fc_hora_entrega         VARCHAR(20),
    fd_fecha_registro       TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion   TIMESTAMP(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT lista_espera_cantidad_positiva   CHECK (fn_cantidad > 0),
    CONSTRAINT lista_espera_precio_no_negativo
        CHECK (fn_precio_venta IS NULL OR fn_precio_venta >= 0)
);

CREATE INDEX lista_espera_fecha_entrega_idx ON public.lista_espera (fd_fecha_entrega);
CREATE INDEX lista_espera_cliente_idx       ON public.lista_espera (fc_cliente);
CREATE INDEX lista_espera_granja_idx        ON public.lista_espera (fc_granja_asignada);

COMMENT ON TABLE public.lista_espera IS
'Pedidos confirmados pendientes de entrega. Al concretarse la entrega se
 convierten en filas de public.ventas (responsabilidad de la aplicación).';


-- ============================================================================
-- 15.  FINANZAS  (cuentas, flujo_caja)
-- ============================================================================

CREATE TABLE public.cuentas (
    fi_cuenta_id        INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_udn              VARCHAR(100)   NOT NULL,
    fc_nombre           VARCHAR(100)   NOT NULL,
    fc_numero_cuenta    VARCHAR(50),
    fc_banco            VARCHAR(150),
    fc_tipo             VARCHAR(20)    NOT NULL,
    fn_saldo_actual     NUMERIC(15,2)  NOT NULL DEFAULT 0,
    fb_activo           BOOLEAN        NOT NULL DEFAULT TRUE,
    fd_fecha_registro   TIMESTAMP(6)   NOT NULL DEFAULT NOW(),

    CONSTRAINT cuentas_tipo_check CHECK (fc_tipo IN ('Cheques','Efectivo','Inversion','Ahorro')),
    CONSTRAINT cuentas_nombre_udn_uq UNIQUE (fc_nombre, fc_udn)
);

CREATE INDEX cuentas_udn_idx      ON public.cuentas (fc_udn);
CREATE INDEX cuentas_activo_idx   ON public.cuentas (fb_activo);
CREATE INDEX cuentas_nombre_idx   ON public.cuentas (fc_nombre);

COMMENT ON TABLE public.cuentas IS
'Cuentas bancarias / cajas de efectivo del grupo. fc_udn guarda el nombre
 de la unidad de negocio (referencia lógica al catálogo public.unidades_negocio).
 UNIQUE (fc_nombre, fc_udn) impide duplicados dentro de la misma UdN.';


-- Flujo de caja -------------------------------------------------------------
--
-- fc_cuenta se mantiene como VARCHAR (referencia lógica por nombre) porque
-- el backend busca en cuentas por nombre; así la vista de tesorería y los
-- agrupamientos siguen funcionando.

CREATE TABLE public.flujo_caja (
    fi_movimiento_id      INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fc_granja             VARCHAR(50)    NOT NULL,
    fd_fecha              DATE           NOT NULL,
    fn_ingreso            NUMERIC(12,2)  NOT NULL DEFAULT 0,
    fn_egreso             NUMERIC(12,2)  NOT NULL DEFAULT 0,
    fc_descripcion        VARCHAR(200),
    fc_cuenta             VARCHAR(50),
    fc_categoria          VARCHAR(100),
    fc_subcategoria       VARCHAR(100),
    fc_beneficiario       VARCHAR(100),
    fc_noproyecto         VARCHAR(50),
    fc_factura            VARCHAR(50),
    fc_estatus            VARCHAR(20),
    fc_mes                VARCHAR(7),
    fc_equilibrar         NUMERIC(12,2),
    fd_fecha_registro     TIMESTAMP(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT flujo_caja_ingreso_no_negativo CHECK (fn_ingreso >= 0),
    CONSTRAINT flujo_caja_egreso_no_negativo  CHECK (fn_egreso  >= 0),
    CONSTRAINT flujo_caja_mov_valido          CHECK (fn_ingreso > 0 OR fn_egreso > 0),
    CONSTRAINT flujo_caja_estatus_check
        CHECK (fc_estatus IS NULL
               OR fc_estatus IN ('REPOSICION','LIQUIDADO','ADEUDO','PARCIAL')),
    CONSTRAINT flujo_caja_mes_formato
        CHECK (fc_mes IS NULL OR fc_mes ~ '^[0-9]{4}-[0-9]{2}$')
);

CREATE INDEX flujo_caja_granja_idx    ON public.flujo_caja (fc_granja);
CREATE INDEX flujo_caja_fecha_idx     ON public.flujo_caja (fd_fecha DESC);
CREATE INDEX flujo_caja_cuenta_idx    ON public.flujo_caja (fc_cuenta);
CREATE INDEX flujo_caja_categoria_idx ON public.flujo_caja (fc_categoria);
CREATE INDEX flujo_caja_mes_idx       ON public.flujo_caja (fc_mes);
CREATE INDEX flujo_caja_estatus_idx   ON public.flujo_caja (fc_estatus);

COMMENT ON TABLE public.flujo_caja IS
'Movimientos de tesorería. CHECK (ingreso > 0 OR egreso > 0) obliga a que
 cada fila represente un movimiento real (sin ceros en ambos lados).';


-- Vista agregada usada por flujoCajaModel.getTesoreriaByGranja -------------

CREATE OR REPLACE VIEW public.vw_tesoreria_general AS
SELECT
    fc_granja,
    fc_mes,
    fc_categoria,
    SUM(fn_ingreso)                   AS total_ingreso,
    SUM(fn_egreso)                    AS total_egreso,
    SUM(fn_ingreso - fn_egreso)       AS saldo_neto
FROM public.flujo_caja
WHERE fn_ingreso IS NOT NULL OR fn_egreso IS NOT NULL
GROUP BY fc_granja, fc_mes, fc_categoria
ORDER BY fc_granja, fc_mes, fc_categoria;

COMMENT ON VIEW public.vw_tesoreria_general IS
'Agregado mensual de flujo_caja por granja y categoría. Consumido por
 flujoCajaModel.getTesoreriaByGranja.';


-- ============================================================================
-- 16.  LOTE MOVIMIENTOS  (historial de traslados/mermas por lote)
-- ============================================================================

CREATE TABLE public.lote_movimientos (
    fi_mov_id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fi_lote_id         INTEGER      NOT NULL,
    tipo_movimiento    VARCHAR(20)  NOT NULL,
    cantidad           INTEGER      NOT NULL,
    talla              NUMERIC(5,2),
    fecha              DATE         NOT NULL,
    destino            VARCHAR(100),
    observacion        TEXT,
    fi_usuario_id      INTEGER,

    CONSTRAINT lote_mov_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT lote_mov_tipo_check
        CHECK (tipo_movimiento IN (
            'siembra','traslado','cosecha','venta','mortalidad','merma','ajuste'
        )),

    CONSTRAINT lote_mov_lote_fk
        FOREIGN KEY (fi_lote_id)    REFERENCES public.lotes (fi_lote_id)    ON DELETE CASCADE,
    CONSTRAINT lote_mov_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX lote_mov_lote_idx    ON public.lote_movimientos (fi_lote_id);
CREATE INDEX lote_mov_fecha_idx   ON public.lote_movimientos (fecha DESC);
CREATE INDEX lote_mov_tipo_idx    ON public.lote_movimientos (tipo_movimiento);
CREATE INDEX lote_mov_usuario_idx ON public.lote_movimientos (fi_usuario_id);

COMMENT ON TABLE public.lote_movimientos IS
'Bitácora de eventos por lote. Al borrar un lote se borra su historial
 (CASCADE). CHECK restringe tipo_movimiento a un conjunto cerrado.';


-- ============================================================================
-- 17.  BITÁCORAS — REGISTRO OPERATIVO
-- ----------------------------------------------------------------------------
-- Patrón común:
--   · Clave primaria  : fi_id (IDENTITY)
--   · fc_granja/ubicacion: texto libre que referencia a una instalación
--                          por nombre (se preservó como VARCHAR por
--                          compatibilidad con el backend actual)
--   · fi_usuario_id   : FK blanda a public.usuarios (ON DELETE SET NULL)
--   · Auditoría       : fd_fecha_registro + fd_fecha_modificacion
--                       con trigger fn_touch_fecha_modificacion().
-- ============================================================================

-- 17.1  Alimentación (consumo diario por estanque) -------------------------

CREATE TABLE public.alimentacion (
    fi_id                      INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                  VARCHAR(50)   NOT NULL,
    fd_fecha                   DATE,
    fc_mes                     VARCHAR(20),
    fn_num_instalacion         INTEGER,
    fd_fecha_siembra           DATE,
    fc_origen_alevines         VARCHAR(200),
    fn_peso_promedio_entrada   NUMERIC(12,3),
    fn_total_alimento_kg       NUMERIC(12,3),
    fn_mortalidad              INTEGER,
    fc_recambio_agua           VARCHAR(50),
    fn_temp_agua               NUMERIC(6,2),
    fn_amonio                  NUMERIC(10,4),
    fn_ph                      NUMERIC(5,2),
    fc_observaciones           VARCHAR(500),
    fi_usuario_id              INTEGER,
    fd_fecha_registro          TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion      TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT alimentacion_ph_check
        CHECK (fn_ph IS NULL OR (fn_ph >= 0 AND fn_ph <= 14)),
    CONSTRAINT alimentacion_alimento_no_negativo
        CHECK (fn_total_alimento_kg IS NULL OR fn_total_alimento_kg >= 0),
    CONSTRAINT alimentacion_mortalidad_no_negativa
        CHECK (fn_mortalidad IS NULL OR fn_mortalidad >= 0),

    CONSTRAINT alimentacion_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX alimentacion_ubicacion_idx ON public.alimentacion (ubicacion);
CREATE INDEX alimentacion_fecha_idx     ON public.alimentacion (fd_fecha DESC);
CREATE INDEX alimentacion_usuario_idx   ON public.alimentacion (fi_usuario_id);


-- 17.2  Baños (tratamientos de regadera) -----------------------------------

CREATE TABLE public.banos (
    fi_id                  INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion              VARCHAR(50)  NOT NULL,
    fd_fecha               DATE         NOT NULL,
    fc_tipo_banio          VARCHAR(20),
    fc_regadera            VARCHAR(100),
    fc_realizo             VARCHAR(100),
    fc_observaciones       VARCHAR(500),
    fi_usuario_id          INTEGER,
    fd_fecha_registro      TIMESTAMP(6) NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion  TIMESTAMP(6) NOT NULL DEFAULT NOW(),

    CONSTRAINT banos_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX banos_ubicacion_idx ON public.banos (ubicacion);
CREATE INDEX banos_fecha_idx     ON public.banos (fd_fecha DESC);
CREATE INDEX banos_usuario_idx   ON public.banos (fi_usuario_id);


-- 17.3  Biometrías ---------------------------------------------------------
--
-- Esta bitácora SÍ tiene FKs reales a instalaciones y reproductores porque
-- es la única que las necesita para discriminar el tipo de sujeto medido.

CREATE TABLE public.biometrias (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(50)   NOT NULL,
    fi_instalacion_id        INTEGER,
    fi_reproductor_id        INTEGER,
    tipo                     VARCHAR(20),
    fc_granja                VARCHAR(100),
    fd_fecha                 DATE          NOT NULL,
    fn_peso_total_gramos     NUMERIC(12,3),
    fn_organismos_muestreados INTEGER,
    fn_peso_promedio         NUMERIC(10,3),
    fc_encargado             VARCHAR(100),
    fc_observaciones         VARCHAR(500),
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT biometrias_tipo_check
        CHECK (tipo IS NULL
               OR tipo IN ('ALEVINAJE','ENGORDA','REPRODUCTORES')),
    CONSTRAINT biometrias_tipo_repro_coherente
        CHECK (tipo <> 'REPRODUCTORES' OR fi_reproductor_id IS NOT NULL),
    CONSTRAINT biometrias_organismos_positivo
        CHECK (fn_organismos_muestreados IS NULL OR fn_organismos_muestreados > 0),
    CONSTRAINT biometrias_peso_no_negativo
        CHECK (fn_peso_total_gramos IS NULL OR fn_peso_total_gramos >= 0),

    CONSTRAINT biometrias_instalacion_fk
        FOREIGN KEY (fi_instalacion_id) REFERENCES public.instalaciones (fi_instalacion_id) ON DELETE SET NULL,
    CONSTRAINT biometrias_reproductor_fk
        FOREIGN KEY (fi_reproductor_id) REFERENCES public.reproductores (fi_reproductor_id) ON DELETE SET NULL,
    CONSTRAINT biometrias_usuario_fk
        FOREIGN KEY (fi_usuario_id)     REFERENCES public.usuarios (fi_usuario_id)          ON DELETE SET NULL
);

CREATE INDEX biometrias_ubicacion_idx    ON public.biometrias (ubicacion);
CREATE INDEX biometrias_instalacion_idx  ON public.biometrias (fi_instalacion_id);
CREATE INDEX biometrias_reproductor_idx  ON public.biometrias (fi_reproductor_id);
CREATE INDEX biometrias_fecha_idx        ON public.biometrias (fd_fecha DESC);
CREATE INDEX biometrias_tipo_idx         ON public.biometrias (tipo);
CREATE INDEX biometrias_usuario_idx      ON public.biometrias (fi_usuario_id);


-- 17.4  Insumos (uso diario) ----------------------------------------------

CREATE TABLE public.insumos (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(50)   NOT NULL,
    fd_fecha                 DATE          NOT NULL,
    fc_cantidad_udm          VARCHAR(100),
    fc_num_lote              VARCHAR(100),
    fc_descripcion           VARCHAR(300),
    fc_encargado_entrega     VARCHAR(100),
    fc_encargado_recepcion   VARCHAR(100),
    fc_observaciones         VARCHAR(500),
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT insumos_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX insumos_ubicacion_idx ON public.insumos (ubicacion);
CREATE INDEX insumos_fecha_idx     ON public.insumos (fd_fecha DESC);
CREATE INDEX insumos_usuario_idx   ON public.insumos (fi_usuario_id);


-- 17.5  Inventario de alevines (conteos por lote) -------------------------

CREATE TABLE public.inventario_alevines (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(50)   NOT NULL,
    fn_num_instalacion       INTEGER,
    fc_lote                  VARCHAR(100),
    fn_cantidad              INTEGER,
    fn_talla                 NUMERIC(10,2),
    fc_observacion           TEXT,
    fd_fecha_siembra         DATE,
    fd_fecha_salida_hormonado DATE,
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT inv_alev_cantidad_no_negativa
        CHECK (fn_cantidad IS NULL OR fn_cantidad >= 0),
    CONSTRAINT inv_alev_fechas_coherentes
        CHECK (fd_fecha_salida_hormonado IS NULL
               OR fd_fecha_siembra IS NULL
               OR fd_fecha_salida_hormonado >= fd_fecha_siembra),

    CONSTRAINT inv_alev_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX inv_alev_ubicacion_idx ON public.inventario_alevines (ubicacion);
CREATE INDEX inv_alev_lote_idx      ON public.inventario_alevines (fc_lote);
CREATE INDEX inv_alev_usuario_idx   ON public.inventario_alevines (fi_usuario_id);


-- 17.6  Medicamentos ------------------------------------------------------

CREATE TABLE public.medicamentos (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(50)   NOT NULL,
    fd_fecha_hora            TIMESTAMP(6)  NOT NULL,
    fn_num_estanque          INTEGER,
    fc_diagnosis             VARCHAR(500),
    fc_tratamiento           VARCHAR(500),
    fc_dosis                 VARCHAR(100),
    fc_forma_aplicacion      VARCHAR(100),
    fd_fecha_ultima_dosis    DATE,
    fc_responsable           VARCHAR(100),
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT medicamentos_ultima_dosis_coherente
        CHECK (fd_fecha_ultima_dosis IS NULL
               OR fd_fecha_ultima_dosis >= fd_fecha_hora::date),

    CONSTRAINT medicamentos_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX medicamentos_ubicacion_idx ON public.medicamentos (ubicacion);
CREATE INDEX medicamentos_fecha_idx     ON public.medicamentos (fd_fecha_hora DESC);
CREATE INDEX medicamentos_usuario_idx   ON public.medicamentos (fi_usuario_id);


-- 17.7  Parámetros de agua ------------------------------------------------

CREATE TABLE public.parametros (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(50)   NOT NULL,
    fd_fecha                 DATE          NOT NULL,
    fn_num_estanque          INTEGER,
    fn_oxigeno               NUMERIC(8,3),
    fn_temperatura           NUMERIC(6,2),
    fn_ph                    NUMERIC(5,2),
    fn_amonio                NUMERIC(10,4),
    fn_nitritos              NUMERIC(10,4),
    fn_nitratos              NUMERIC(10,4),
    fc_responsable           VARCHAR(100),
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT parametros_ph_range
        CHECK (fn_ph IS NULL OR (fn_ph >= 0 AND fn_ph <= 14)),
    CONSTRAINT parametros_oxigeno_no_negativo
        CHECK (fn_oxigeno IS NULL OR fn_oxigeno >= 0),
    CONSTRAINT parametros_amonio_no_negativo
        CHECK (fn_amonio IS NULL OR fn_amonio >= 0),
    CONSTRAINT parametros_nitritos_no_negativo
        CHECK (fn_nitritos IS NULL OR fn_nitritos >= 0),
    CONSTRAINT parametros_nitratos_no_negativo
        CHECK (fn_nitratos IS NULL OR fn_nitratos >= 0),

    CONSTRAINT parametros_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX parametros_ubicacion_idx ON public.parametros (ubicacion);
CREATE INDEX parametros_fecha_idx     ON public.parametros (fd_fecha DESC);
CREATE INDEX parametros_usuario_idx   ON public.parametros (fi_usuario_id);


-- 17.8  Plagas (trampas y control) ----------------------------------------

CREATE TABLE public.plagas (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(100),
    unidad_produccion        VARCHAR(100),
    fd_fecha                 DATE          NOT NULL,
    fc_num_trampa            VARCHAR(100),
    tipo_trampa              VARCHAR(100),
    fc_hallazgo              VARCHAR(500),
    fc_malla                 VARCHAR(200),
    fc_veneno                VARCHAR(100),
    fc_verifico              VARCHAR(100),
    fc_observaciones         VARCHAR(500),
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT plagas_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX plagas_ubicacion_idx ON public.plagas (ubicacion);
CREATE INDEX plagas_fecha_idx     ON public.plagas (fd_fecha DESC);
CREATE INDEX plagas_usuario_idx   ON public.plagas (fi_usuario_id);


-- 17.9  Recambios de agua (calendarizado mensual) -------------------------
--
-- La tabla almacena hasta 6 recambios por mes como columnas separadas
-- (fd_fecha1..fd_fecha6, fc_tipo1..fc_tipo6). Se conserva así por
-- compatibilidad con el backend existente.

CREATE TABLE public.recambios (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(50)   NOT NULL,
    fc_mes                   VARCHAR(20),
    fn_num_instalacion       INTEGER,
    fd_fecha1                DATE,
    fc_tipo1                 VARCHAR(30),
    fd_fecha2                DATE,
    fc_tipo2                 VARCHAR(30),
    fd_fecha3                DATE,
    fc_tipo3                 VARCHAR(30),
    fd_fecha4                DATE,
    fc_tipo4                 VARCHAR(30),
    fd_fecha5                DATE,
    fc_tipo5                 VARCHAR(30),
    fd_fecha6                DATE,
    fc_tipo6                 VARCHAR(30),
    fc_responsable           VARCHAR(100),
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT recambios_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX recambios_ubicacion_idx ON public.recambios (ubicacion);
CREATE INDEX recambios_mes_idx       ON public.recambios (fc_mes);
CREATE INDEX recambios_usuario_idx   ON public.recambios (fi_usuario_id);


-- 17.10  Recepción de insumos (entrada desde proveedor) -------------------

CREATE TABLE public.recepcion_insumos (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(50),
    fd_fecha                 DATE          NOT NULL,
    fc_proveedor             VARCHAR(100),
    fc_producto              VARCHAR(255),
    fc_unidad_medida         VARCHAR(255),
    fc_cantidad              NUMERIC(15,2),
    fc_lote                  VARCHAR(100),
    fc_condiciones_entrega   VARCHAR(150),
    fc_encargado_entrega     VARCHAR(100),
    fc_verifico              VARCHAR(100),
    fc_observaciones         VARCHAR(500),
    fi_usuario_id            INTEGER,

    CONSTRAINT recepcion_cantidad_no_negativa
        CHECK (fc_cantidad IS NULL OR fc_cantidad >= 0),

    CONSTRAINT recepcion_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX recepcion_ubicacion_idx  ON public.recepcion_insumos (ubicacion);
CREATE INDEX recepcion_fecha_idx      ON public.recepcion_insumos (fd_fecha DESC);
CREATE INDEX recepcion_proveedor_idx  ON public.recepcion_insumos (fc_proveedor);
CREATE INDEX recepcion_usuario_idx    ON public.recepcion_insumos (fi_usuario_id);


-- 17.11  Visitas (registro de entrada/salida de personas externas) --------

CREATE TABLE public.visitas (
    fi_id                    INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ubicacion                VARCHAR(50),
    fd_fecha                 DATE          NOT NULL,
    fd_entrada               TIME(6),
    fd_salida                TIME(6),
    fc_nombre_completo       VARCHAR(200),
    fc_origen                VARCHAR(200),
    fc_motivo                VARCHAR(300),
    fc_observaciones         VARCHAR(500),
    fc_foto_identificacion   VARCHAR(200),
    fi_usuario_id            INTEGER,
    fd_fecha_registro        TIMESTAMP(6)  NOT NULL DEFAULT NOW(),
    fd_fecha_modificacion    TIMESTAMP(6)  NOT NULL DEFAULT NOW(),

    CONSTRAINT visitas_horario_coherente
        CHECK (fd_entrada IS NULL OR fd_salida IS NULL OR fd_salida >= fd_entrada),

    CONSTRAINT visitas_usuario_fk
        FOREIGN KEY (fi_usuario_id) REFERENCES public.usuarios (fi_usuario_id) ON DELETE SET NULL
);

CREATE INDEX visitas_ubicacion_idx ON public.visitas (ubicacion);
CREATE INDEX visitas_fecha_idx     ON public.visitas (fd_fecha DESC);
CREATE INDEX visitas_usuario_idx   ON public.visitas (fi_usuario_id);


-- ============================================================================
-- 17.X  TRIGGERS de auditoría para las nuevas tablas
-- ============================================================================

CREATE TRIGGER trg_empleados_touch_modif            BEFORE UPDATE ON rrhh.empleados            FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_actas_admin_touch_modif          BEFORE UPDATE ON rrhh.actas_administrativas FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_nomina_touch_actualiz            BEFORE UPDATE ON public.nomina             FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_actualizacion();
CREATE TRIGGER trg_vacaciones_touch_actualiz        BEFORE UPDATE ON public.vacaciones         FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_actualizacion();
CREATE TRIGGER trg_clientes_touch_modif             BEFORE UPDATE ON public.clientes           FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_ventas_touch_modif               BEFORE UPDATE ON public.ventas             FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_lista_espera_touch_modif         BEFORE UPDATE ON public.lista_espera       FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_alimentacion_touch_modif         BEFORE UPDATE ON public.alimentacion       FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_banos_touch_modif                BEFORE UPDATE ON public.banos              FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_biometrias_touch_modif           BEFORE UPDATE ON public.biometrias         FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_insumos_touch_modif              BEFORE UPDATE ON public.insumos            FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_inv_alev_touch_modif             BEFORE UPDATE ON public.inventario_alevines FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_medicamentos_touch_modif         BEFORE UPDATE ON public.medicamentos       FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_parametros_touch_modif           BEFORE UPDATE ON public.parametros         FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_plagas_touch_modif               BEFORE UPDATE ON public.plagas             FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_recambios_touch_modif            BEFORE UPDATE ON public.recambios          FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();
CREATE TRIGGER trg_visitas_touch_modif              BEFORE UPDATE ON public.visitas            FOR EACH ROW EXECUTE FUNCTION public.fn_touch_fecha_modificacion();

-- Triggers con columnas de nombre distinto
CREATE TRIGGER trg_proveedores_touch_updated_at     BEFORE UPDATE ON public.proveedores        FOR EACH ROW EXECUTE FUNCTION public.fn_touch_updated_at();
CREATE TRIGGER trg_caja_ahorro_touch_actualizado    BEFORE UPDATE ON public.caja_ahorro_resumen FOR EACH ROW EXECUTE FUNCTION public.fn_touch_actualizado();


-- ============================================================================
-- 18.  SEEDS (idempotentes)
-- ----------------------------------------------------------------------------
-- Seguros de re-ejecutar: todos los INSERT usan ON CONFLICT DO NOTHING/UPDATE.
-- Al final se sincronizan las secuencias de identidad con el máximo insertado.
-- ============================================================================

-- Rol raíz
INSERT INTO public.roles (fi_rol_id, fc_nombre, fb_es_root)
OVERRIDING SYSTEM VALUE
VALUES (1, 'Administrador', true)
ON CONFLICT (fi_rol_id) DO UPDATE
    SET fc_nombre  = EXCLUDED.fc_nombre,
        fb_es_root = EXCLUDED.fb_es_root;

-- Usuario admin por defecto (recordar cambiar la contraseña en producción)
INSERT INTO public.usuarios (fc_nombre, "fc_contraseña", fi_rol_id)
VALUES ('admin', '$2b$10$MAj2BLZF7j2s2Ors05KVfeASNl1m7IXUhnfzjzxe8MOJpj/KgYXP.', 1)
ON CONFLICT (fc_nombre) DO NOTHING;

-- Módulos base del menú
WITH modulos_base (fc_nombre, fc_ruta, fb_activo) AS (
    VALUES
        ('Dashboard',         '/',                  true),
        ('Operaciones',       '/operaciones',       true),
        ('Inventarios',       '/inventarios',       true),
        ('Finanzas',          '/finanzas',          true),
        ('RRHH',              '/rrhh',              true),
        ('Catálogos',         '/catalogos',         true),
        ('Seguridad',         '/seguridad',         true),
        ('Roles',             '/roles',             true),
        ('Usuarios',          '/usuarios',          true),
        ('Piletas',           '/piletas',           true),
        ('Instalaciones',     '/instalaciones',     true),
        ('Lotes',             '/lotes',             true),
        ('Reproductores',     '/reproductores',     true),
        ('Engorda',           '/engorda',           true),
        ('Clientes',          '/clientes',          true),
        ('Ventas',            '/ventas',            true),
        ('Alimentos',         '/alimentos',         true),
        ('Lista de Espera',   '/lista-espera',      true),
        ('Equipos',           '/equipos',           true),
        ('Nomina',            '/nomina',            true),
        ('Vacaciones',        '/vacaciones',        true),
        ('Caja de Ahorro',    '/caja-ahorro',       true),
        ('Proveedores',       '/proveedores',       true),
        ('Flujo de Caja',     '/flujo-caja',        true),
        ('Tesoreria',         '/tesoreria',         true),
        ('Cuentas',           '/cuentas',           true),
        ('Biometrias',        '/biometrias',        true),
        ('Plagas',            '/plagas',            true),
        ('Alimentacion',      '/alimentacion',      true),
        ('Insumos',           '/insumos',           true),
        ('Recepcion Insumos', '/recepcion_insumos', true),
        ('Visitas',           '/visitas',           true),
        ('Banos',             '/banos',             true),
        ('Parametros',        '/parametros',        true),
        ('Medicamentos',      '/medicamentos',      true),
        ('Recambios',         '/recambios',         true),
        ('Inventario',        '/inventario',        true),
        ('Catalogo Estados',  '/estados',           false),
        ('Expedientes',       '/expedientes',       false),
        ('Puestos',           '/puestos',           true),
        ('Empleados',         '/empleados',         true),
        ('Departamentos',     '/departamentos',     true),
        ('Modulos',           '/modulos',           true),
        ('Roles Modulos',     '/roles-modulos',     true),
        ('Unidades de Negocio', '/unidades-negocio', true)
)
INSERT INTO seguridad.modulos (fc_nombre, fc_ruta, fb_activo)
SELECT fc_nombre, fc_ruta, fb_activo FROM modulos_base
ON CONFLICT (fc_ruta) DO UPDATE
    SET fc_nombre = EXCLUDED.fc_nombre,
        fb_activo = EXCLUDED.fb_activo;

-- Todos los roles root reciben acceso a todos los módulos
INSERT INTO seguridad.roles_modulos (fi_rol_id, fi_modulo_id)
SELECT r.fi_rol_id, m.fi_modulo_id
FROM public.roles r
CROSS JOIN seguridad.modulos m
WHERE r.fb_es_root = true
ON CONFLICT (fi_rol_id, fi_modulo_id) DO NOTHING;

-- Puestos organizacionales
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
ON CONFLICT (fc_nombre) DO NOTHING;

-- Departamentos
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

-- Unidades de negocio
INSERT INTO public.unidades_negocio (fc_nombre) VALUES
    ('Granja Acuicola Medellin'),
    ('Granja Acuicola Ceiba'),
    ('Quality Technology')
ON CONFLICT (fc_nombre) DO NOTHING;

-- Tipos de documento para expedientes
INSERT INTO rrhh.tipos_documento (fc_nombre, fb_obligatorio) VALUES
    ('Credencial',                  true),
    ('Fotografia',                  true),
    ('Acta de Nacimiento',          true),
    ('INE',                         true),
    ('Licencia de Conducir',        false),
    ('Comprobante de Domicilio',    true),
    ('RFC',                         true),
    ('CURP',                        true),
    ('Comprobante de Estudios',     false),
    ('CV',                          false),
    ('Carta de Recomendacion',      false),
    ('Acuerdo de Confidencialidad', true),
    ('Codigo de Etica',             true),
    ('Codigo de Conducta',          true),
    ('Solicitud de Empleo',         true)
ON CONFLICT (fc_nombre) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Sincronizar secuencias de identidad con los datos sembrados
-- ----------------------------------------------------------------------------
-- Usamos pg_get_serial_sequence para no depender del nombre exacto de la
-- secuencia (sea _seq, _seq1, etc. según versión de pg_dump previa).
SELECT setval(
    pg_get_serial_sequence('public.roles', 'fi_rol_id'),
    GREATEST(COALESCE((SELECT MAX(fi_rol_id) FROM public.roles), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('public.usuarios', 'fi_usuario_id'),
    GREATEST(COALESCE((SELECT MAX(fi_usuario_id) FROM public.usuarios), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('seguridad.modulos', 'fi_modulo_id'),
    GREATEST(COALESCE((SELECT MAX(fi_modulo_id) FROM seguridad.modulos), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('rrhh.puestos', 'fi_puesto_id'),
    GREATEST(COALESCE((SELECT MAX(fi_puesto_id) FROM rrhh.puestos), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('rrhh.departamentos', 'fi_departamento_id'),
    GREATEST(COALESCE((SELECT MAX(fi_departamento_id) FROM rrhh.departamentos), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('rrhh.tipos_documento', 'fi_tipo_documento_id'),
    GREATEST(COALESCE((SELECT MAX(fi_tipo_documento_id) FROM rrhh.tipos_documento), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('public.unidades_negocio', 'fi_unidad_negocio_id'),
    GREATEST(COALESCE((SELECT MAX(fi_unidad_negocio_id) FROM public.unidades_negocio), 0), 1)
);

SELECT setval(
    pg_get_serial_sequence('rrhh.actas_administrativas', 'fi_acta_id'),
    GREATEST(COALESCE((SELECT MAX(fi_acta_id) FROM rrhh.actas_administrativas), 0), 1)
);


COMMIT;