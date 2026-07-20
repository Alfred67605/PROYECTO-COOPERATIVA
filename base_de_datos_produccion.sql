--
-- PostgreSQL database dump
--

\restrict PJ3QhjxPfIhIsy5ylsUwgT1FzggEu5JdFh3lRMybm5YdJS1iiiK4YUgajcnCbsI

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alquiler_gruas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alquiler_gruas (
    id bigint NOT NULL,
    placa_grua character varying(50) NOT NULL,
    capacidad_carga character varying(50),
    nombre_chofer character varying(100) NOT NULL,
    tiempo_trabajo character varying(50),
    costo numeric(10,2),
    bocamina_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.alquiler_gruas OWNER TO postgres;

--
-- Name: alquiler_gruas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alquiler_gruas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alquiler_gruas_id_seq OWNER TO postgres;

--
-- Name: alquiler_gruas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alquiler_gruas_id_seq OWNED BY public.alquiler_gruas.id;


--
-- Name: bocaminas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bocaminas (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    ubicacion text,
    estado character varying(20) DEFAULT 'activa'::character varying NOT NULL,
    responsable character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    codigo character varying(255)
);


ALTER TABLE public.bocaminas OWNER TO postgres;

--
-- Name: bocaminas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bocaminas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bocaminas_id_seq OWNER TO postgres;

--
-- Name: bocaminas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bocaminas_id_seq OWNED BY public.bocaminas.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compras (
    id bigint NOT NULL,
    proveedor_id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    bocamina_id bigint,
    fecha date NOT NULL,
    numero_factura character varying(100),
    observaciones text,
    total numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    estado character varying(20) DEFAULT 'registrada'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.compras OWNER TO postgres;

--
-- Name: compras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compras_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compras_id_seq OWNER TO postgres;

--
-- Name: compras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compras_id_seq OWNED BY public.compras.id;


--
-- Name: costo_servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.costo_servicios (
    id bigint NOT NULL,
    servicio_id bigint NOT NULL,
    tipo_costo character varying(255) NOT NULL,
    monto numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    descripcion text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.costo_servicios OWNER TO postgres;

--
-- Name: costo_servicios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.costo_servicios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.costo_servicios_id_seq OWNER TO postgres;

--
-- Name: costo_servicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.costo_servicios_id_seq OWNED BY public.costo_servicios.id;


--
-- Name: detalle_compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_compras (
    id bigint NOT NULL,
    compra_id bigint NOT NULL,
    material_id bigint NOT NULL,
    cantidad numeric(12,2) NOT NULL,
    precio numeric(12,2) NOT NULL,
    subtotal numeric(14,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.detalle_compras OWNER TO postgres;

--
-- Name: detalle_compras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_compras_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_compras_id_seq OWNER TO postgres;

--
-- Name: detalle_compras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_compras_id_seq OWNED BY public.detalle_compras.id;


--
-- Name: empresa_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa_settings (
    id bigint NOT NULL,
    nombre_empresa character varying(255) DEFAULT 'MINERA COP'::character varying NOT NULL,
    subtitulo character varying(255) DEFAULT 'Sistema Empresarial'::character varying,
    logo character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.empresa_settings OWNER TO postgres;

--
-- Name: empresa_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresa_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresa_settings_id_seq OWNER TO postgres;

--
-- Name: empresa_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresa_settings_id_seq OWNED BY public.empresa_settings.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: gruas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gruas (
    id bigint NOT NULL,
    tipo character varying(255) NOT NULL,
    codigo character varying(255) NOT NULL,
    capacidad_carga numeric(10,2),
    operador_id bigint,
    estado character varying(20) DEFAULT 'operativa'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.gruas OWNER TO postgres;

--
-- Name: gruas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gruas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gruas_id_seq OWNER TO postgres;

--
-- Name: gruas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gruas_id_seq OWNED BY public.gruas.id;


--
-- Name: historial_operaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_operaciones (
    id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    accion character varying(50) NOT NULL,
    tabla character varying(100) NOT NULL,
    registro_id bigint,
    datos_anteriores jsonb,
    datos_nuevos jsonb,
    ip character varying(45),
    fecha timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.historial_operaciones OWNER TO postgres;

--
-- Name: historial_operaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_operaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_operaciones_id_seq OWNER TO postgres;

--
-- Name: historial_operaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_operaciones_id_seq OWNED BY public.historial_operaciones.id;


--
-- Name: inspeccions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inspeccions (
    id bigint NOT NULL,
    equipo_tipo character varying(255) NOT NULL,
    equipo_id bigint NOT NULL,
    motor_ok boolean DEFAULT true NOT NULL,
    frenos_ok boolean DEFAULT true NOT NULL,
    aceite_ok boolean DEFAULT true NOT NULL,
    neumaticos_ok boolean DEFAULT true NOT NULL,
    luces_ok boolean DEFAULT true NOT NULL,
    seguridad_ok boolean DEFAULT true NOT NULL,
    observaciones text,
    firma_responsable_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.inspeccions OWNER TO postgres;

--
-- Name: inspeccions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inspeccions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inspeccions_id_seq OWNER TO postgres;

--
-- Name: inspeccions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inspeccions_id_seq OWNED BY public.inspeccions.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: maquinarias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maquinarias (
    id bigint NOT NULL,
    tipo character varying(255) NOT NULL,
    nombre_codigo character varying(255) NOT NULL,
    marca character varying(255),
    modelo character varying(255),
    placa character varying(255),
    horometro numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    kilometraje numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    estado character varying(20) DEFAULT 'operativa'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.maquinarias OWNER TO postgres;

--
-- Name: maquinarias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maquinarias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maquinarias_id_seq OWNER TO postgres;

--
-- Name: maquinarias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maquinarias_id_seq OWNED BY public.maquinarias.id;


--
-- Name: materiales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materiales (
    id bigint NOT NULL,
    codigo character varying(50) NOT NULL,
    descripcion text NOT NULL,
    grupo character varying(100),
    imagen character varying(255),
    estado character varying(20) DEFAULT 'disponible'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.materiales OWNER TO postgres;

--
-- Name: materiales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materiales_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materiales_id_seq OWNER TO postgres;

--
-- Name: materiales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materiales_id_seq OWNED BY public.materiales.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: permiso_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permiso_user (
    permiso_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.permiso_user OWNER TO postgres;

--
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- Name: permisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permisos_id_seq OWNER TO postgres;

--
-- Name: permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_id_seq OWNED BY public.permisos.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    telefono character varying(50),
    direccion text,
    email character varying(255),
    nit character varying(50),
    estado boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    observaciones text,
    logo character varying(255)
);


ALTER TABLE public.proveedores OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proveedores_id_seq OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- Name: repuesto_servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repuesto_servicios (
    id bigint NOT NULL,
    servicio_id bigint NOT NULL,
    material_id bigint NOT NULL,
    cantidad numeric(12,2) NOT NULL,
    costo_unitario numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.repuesto_servicios OWNER TO postgres;

--
-- Name: repuesto_servicios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.repuesto_servicios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.repuesto_servicios_id_seq OWNER TO postgres;

--
-- Name: repuesto_servicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.repuesto_servicios_id_seq OWNED BY public.repuesto_servicios.id;


--
-- Name: respaldos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.respaldos (
    id bigint NOT NULL,
    nombre_archivo character varying(255) NOT NULL,
    tipo character varying(255) NOT NULL,
    tamano bigint NOT NULL,
    estado character varying(255) NOT NULL,
    creado_por bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.respaldos OWNER TO postgres;

--
-- Name: respaldos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.respaldos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.respaldos_id_seq OWNER TO postgres;

--
-- Name: respaldos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.respaldos_id_seq OWNED BY public.respaldos.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicios (
    id bigint NOT NULL,
    codigo character varying(255) NOT NULL,
    fecha date NOT NULL,
    hora time(0) without time zone NOT NULL,
    usuario_registro_id bigint NOT NULL,
    responsable_id bigint,
    estado character varying(20) DEFAULT 'Pendiente'::character varying NOT NULL,
    equipo_tipo character varying(255) NOT NULL,
    equipo_id bigint NOT NULL,
    boca_mina_id bigint,
    ubicacion_detalle character varying(255),
    tipo_mantenimiento_id bigint,
    descripcion text,
    fallas text,
    solucion text,
    observaciones text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.servicios OWNER TO postgres;

--
-- Name: servicios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servicios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servicios_id_seq OWNER TO postgres;

--
-- Name: servicios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servicios_id_seq OWNED BY public.servicios.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: tipo_mantenimientos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_mantenimientos (
    id bigint NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.tipo_mantenimientos OWNER TO postgres;

--
-- Name: tipo_mantenimientos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_mantenimientos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipo_mantenimientos_id_seq OWNER TO postgres;

--
-- Name: tipo_mantenimientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_mantenimientos_id_seq OWNED BY public.tipo_mantenimientos.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    nombre character varying(255) CONSTRAINT users_name_not_null NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    rol_id bigint,
    estado boolean DEFAULT true NOT NULL,
    avatar character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    id bigint NOT NULL,
    tipo character varying(255) NOT NULL,
    placa character varying(255) NOT NULL,
    marca character varying(255),
    modelo character varying(255),
    conductor_id bigint,
    estado character varying(20) DEFAULT 'operativo'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- Name: vehiculos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculos_id_seq OWNER TO postgres;

--
-- Name: vehiculos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculos_id_seq OWNED BY public.vehiculos.id;


--
-- Name: alquiler_gruas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alquiler_gruas ALTER COLUMN id SET DEFAULT nextval('public.alquiler_gruas_id_seq'::regclass);


--
-- Name: bocaminas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bocaminas ALTER COLUMN id SET DEFAULT nextval('public.bocaminas_id_seq'::regclass);


--
-- Name: compras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras ALTER COLUMN id SET DEFAULT nextval('public.compras_id_seq'::regclass);


--
-- Name: costo_servicios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.costo_servicios ALTER COLUMN id SET DEFAULT nextval('public.costo_servicios_id_seq'::regclass);


--
-- Name: detalle_compras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras ALTER COLUMN id SET DEFAULT nextval('public.detalle_compras_id_seq'::regclass);


--
-- Name: empresa_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_settings ALTER COLUMN id SET DEFAULT nextval('public.empresa_settings_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: gruas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gruas ALTER COLUMN id SET DEFAULT nextval('public.gruas_id_seq'::regclass);


--
-- Name: historial_operaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_operaciones ALTER COLUMN id SET DEFAULT nextval('public.historial_operaciones_id_seq'::regclass);


--
-- Name: inspeccions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspeccions ALTER COLUMN id SET DEFAULT nextval('public.inspeccions_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: maquinarias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquinarias ALTER COLUMN id SET DEFAULT nextval('public.maquinarias_id_seq'::regclass);


--
-- Name: materiales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiales ALTER COLUMN id SET DEFAULT nextval('public.materiales_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: permisos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id SET DEFAULT nextval('public.permisos_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- Name: repuesto_servicios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repuesto_servicios ALTER COLUMN id SET DEFAULT nextval('public.repuesto_servicios_id_seq'::regclass);


--
-- Name: respaldos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respaldos ALTER COLUMN id SET DEFAULT nextval('public.respaldos_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: servicios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios ALTER COLUMN id SET DEFAULT nextval('public.servicios_id_seq'::regclass);


--
-- Name: tipo_mantenimientos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_mantenimientos ALTER COLUMN id SET DEFAULT nextval('public.tipo_mantenimientos_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehiculos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos ALTER COLUMN id SET DEFAULT nextval('public.vehiculos_id_seq'::regclass);


--
-- Data for Name: alquiler_gruas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alquiler_gruas (id, placa_grua, capacidad_carga, nombre_chofer, tiempo_trabajo, costo, bocamina_id, created_at, updated_at) FROM stdin;
1	ALQ-701	25 Toneladas	Ramiro Soliz Choque	10 días	3924.00	5	2026-05-30 00:04:29	2026-07-20 00:04:29
2	ALQ-702	35 Toneladas	Guzmán Quiroga Siles	2 semanas	6691.00	5	2026-07-09 00:04:29	2026-07-20 00:04:29
3	ALQ-703	50 Toneladas	Zenón Ticona Alarcón	5 días	5273.00	5	2026-07-01 00:04:29	2026-07-20 00:04:29
4	ALQ-704	20 Toneladas	Hugo Vedia López	3 semanas	8665.00	3	2026-06-07 00:04:29	2026-07-20 00:04:29
5	ALQ-705	40 Toneladas	Jaime Mamani Flores	1 mes	15133.00	6	2026-06-28 00:04:29	2026-07-20 00:04:29
6	ALQ-706	30 Toneladas	Félix Condori Quispe	8 días	4693.00	1	2026-07-09 00:04:29	2026-07-20 00:04:29
7	ALQ-707	25 Toneladas	Mario Colque Cruz	15 días	5892.00	5	2026-07-09 00:04:29	2026-07-20 00:04:29
8	ALQ-701	25 Toneladas	Ramiro Soliz Choque	10 días	3879.00	4	2026-07-09 00:04:29	2026-07-20 00:04:29
9	ALQ-702	35 Toneladas	Guzmán Quiroga Siles	2 semanas	7287.00	1	2026-07-10 00:04:29	2026-07-20 00:04:29
10	ALQ-703	50 Toneladas	Zenón Ticona Alarcón	5 días	5207.00	4	2026-06-12 00:04:29	2026-07-20 00:04:29
11	ALQ-704	20 Toneladas	Hugo Vedia López	3 semanas	8167.00	6	2026-07-02 00:04:29	2026-07-20 00:04:29
12	ALQ-705	40 Toneladas	Jaime Mamani Flores	1 mes	15402.00	6	2026-07-17 00:04:29	2026-07-20 00:04:29
13	ALQ-706	30 Toneladas	Félix Condori Quispe	8 días	4025.00	2	2026-07-08 00:04:29	2026-07-20 00:04:29
14	ALQ-707	25 Toneladas	Mario Colque Cruz	15 días	5343.00	3	2026-06-01 00:04:29	2026-07-20 00:04:29
15	ALQ-701	25 Toneladas	Ramiro Soliz Choque	10 días	3704.00	2	2026-06-12 00:04:29	2026-07-20 00:04:29
16	GRU-CY99	15 Toneladas	Juan Pérez Cypress	8 horas	5500.00	1	2026-07-19 20:33:13	2026-07-19 20:33:13
\.


--
-- Data for Name: bocaminas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bocaminas (id, nombre, ubicacion, estado, responsable, created_at, updated_at, codigo) FROM stdin;
2	Gran Suraga	Nivel 2, Sector Sur	activa	Juan Carlos Incata	2026-07-20 00:04:28	2026-07-20 00:04:28	\N
3	4 Estrellas	Nivel 3, Sector Este	activa	Jose Luis Mencacho	2026-07-20 00:04:28	2026-07-20 00:04:28	\N
4	17 de Junio	Nivel 4, Sector Oeste	activa	Emilio Torrez	2026-07-20 00:04:28	2026-07-20 00:04:28	\N
5	San Lucas	Nivel 5, Sector Centro	activa	Waldo Hanco	2026-07-20 00:04:28	2026-07-20 00:04:28	\N
6	Bocamina Grande	Nivel 6, Sector Principal	activa	Elio Caceres	2026-07-20 00:04:28	2026-07-20 00:04:28	\N
92	Bocamina Cypress Nivel 5	Sector Norte, Potosí - Coordenadas: -19.5836, -65.7536	activa	\N	2026-07-19 20:37:05	2026-07-19 20:37:05	\N
1	Huari Huari	Ubicación actualizada por Cypress	activa	Juan Torrez	2026-07-20 00:04:28	2026-07-19 20:37:10	\N
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
minera-cop-cache-df21bfa12c4e294c70f64916c0fbc9a5:timer	i:1784506894;	1784506894
minera-cop-cache-94d92f976fd06fd3e8cf53ec4e03d646:timer	i:1784508020;	1784508020
minera-cop-cache-a3affa0d1e1a3c72b78aa984c3367a05:timer	i:1784507695;	1784507695
minera-cop-cache-df21bfa12c4e294c70f64916c0fbc9a5	i:9;	1784506894
minera-cop-cache-a3affa0d1e1a3c72b78aa984c3367a05	i:6;	1784507695
minera-cop-cache-62c733103630d8e79dbf0ff3500211d9:timer	i:1784508028;	1784508028
minera-cop-cache-62c733103630d8e79dbf0ff3500211d9	i:2;	1784508028
minera-cop-cache-3f9122582943130b62d9a45740307fa6:timer	i:1784508049;	1784508049
minera-cop-cache-3f9122582943130b62d9a45740307fa6	i:2;	1784508049
minera-cop-cache-94d92f976fd06fd3e8cf53ec4e03d646	i:5;	1784508020
minera-cop-cache-f1f70ec40aaa556905d4a030501c0ba4:timer	i:1784508061;	1784508061
minera-cop-cache-f1f70ec40aaa556905d4a030501c0ba4	i:9;	1784508061
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compras (id, proveedor_id, usuario_id, bocamina_id, fecha, numero_factura, observaciones, total, estado, created_at, updated_at) FROM stdin;
1	1	8	2	2026-01-30	F-81922	Compra de insumos químicos (ANFO/Dinamita) solicitada de emergencia para el avance de galería en Gran Suraga.	4279.60	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
2	3	1	6	2026-06-19	F-56507	Adquisición periódica de herramientas y repuestos de perforación para las labores en Bocamina Grande.	12017.90	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
3	2	2	3	2026-05-04	F-24113	Suministro de lubricantes y aceites de motor para las maquinarias operando en 4 Estrellas.	2236.50	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
4	2	8	5	2026-02-20	F-51197	Adquisición periódica de herramientas y repuestos de perforación para las labores en San Lucas.	5731.20	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
5	1	6	4	2026-02-06	F-03003	Compra de insumos químicos (ANFO/Dinamita) solicitada de emergencia para el avance de galería en 17 de Junio.	5316.60	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
6	1	7	6	2026-03-22	F-47367	Adquisición de maderas (callapos, tablas) para fortificación de galerías en Bocamina Grande.	1094.00	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
7	1	7	6	2026-06-15	F-10290	Adquisición de maderas (callapos, tablas) para fortificación de galerías en Bocamina Grande.	6491.70	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
8	1	5	5	2026-07-14	F-37096	Adquisición de maderas (callapos, tablas) para fortificación de galerías en San Lucas.	3221.10	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
9	1	6	4	2026-03-21	F-01438	Adquisición de maderas (callapos, tablas) para fortificación de galerías en 17 de Junio.	7450.40	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
10	3	5	5	2026-07-01	F-41918	Adquisición periódica de herramientas y repuestos de perforación para las labores en San Lucas.	11227.20	pendiente	2026-07-20 00:04:29	2026-07-20 00:04:29
11	3	8	5	2026-05-06	F-71625	Compra de insumos químicos (ANFO/Dinamita) solicitada de emergencia para el avance de galería en San Lucas.	9660.80	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
12	3	5	5	2026-07-04	F-24550	Adquisición de maderas (callapos, tablas) para fortificación de galerías en San Lucas.	1342.60	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
13	3	3	2	2026-01-27	F-57893	Suministro de lubricantes y aceites de motor para las maquinarias operando en Gran Suraga.	277.80	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
14	3	6	4	2026-03-30	F-20679	Reposición de herramientas manuales (picos, palas, combos) para el personal de la bocamina 17 de Junio.	5721.00	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
15	2	2	3	2026-07-14	F-10727	Suministro de lubricantes y aceites de motor para las maquinarias operando en 4 Estrellas.	6201.30	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
16	2	3	2	2026-07-02	F-82741	Compra de insumos químicos (ANFO/Dinamita) solicitada de emergencia para el avance de galería en Gran Suraga.	3180.80	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
17	3	6	4	2026-01-23	F-34718	Reposición de herramientas manuales (picos, palas, combos) para el personal de la bocamina 17 de Junio.	3301.80	pendiente	2026-07-20 00:04:29	2026-07-20 00:04:29
18	3	1	6	2026-03-03	F-16872	Reposición de herramientas manuales (picos, palas, combos) para el personal de la bocamina Bocamina Grande.	2362.50	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
19	3	5	5	2026-05-02	F-36051	Reposición de herramientas manuales (picos, palas, combos) para el personal de la bocamina San Lucas.	5509.90	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
20	1	4	1	2026-02-24	F-57724	Compra de insumos químicos (ANFO/Dinamita) solicitada de emergencia para el avance de galería en Huari Huari.	1918.80	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
21	3	6	4	2026-03-27	F-57977	Adquisición periódica de herramientas y repuestos de perforación para las labores en 17 de Junio.	6323.60	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
22	1	3	2	2026-03-17	F-16895	Adquisición de maderas (callapos, tablas) para fortificación de galerías en Gran Suraga.	2904.80	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
23	3	2	3	2026-01-22	F-91663	Adquisición periódica de herramientas y repuestos de perforación para las labores en 4 Estrellas.	3748.80	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
24	1	2	3	2026-05-13	F-62534	Reposición de herramientas manuales (picos, palas, combos) para el personal de la bocamina 4 Estrellas.	4528.00	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
25	2	6	4	2026-03-31	F-03776	Adquisición periódica de herramientas y repuestos de perforación para las labores en 17 de Junio.	4694.60	completado	2026-07-20 00:04:29	2026-07-20 00:04:29
46	1	1	2	2026-07-20	F-CYPRESS-001	\N	150000.00	registrada	2026-07-19 20:37:48	2026-07-19 20:37:48
\.


--
-- Data for Name: costo_servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.costo_servicios (id, servicio_id, tipo_costo, monto, descripcion, created_at, updated_at) FROM stdin;
1	1	Servicios externos	178.00	Servicio de Tornería externo	2026-07-20 00:04:29	2026-07-20 00:04:29
2	2	Mano de obra	755.00	Mano de obra técnico especializado	2026-07-20 00:04:29	2026-07-20 00:04:29
3	3	Servicios externos	808.00	Servicio de Tornería externo	2026-07-20 00:04:29	2026-07-20 00:04:29
4	4	Servicios externos	517.00	Servicio de Tornería externo	2026-07-20 00:04:29	2026-07-20 00:04:29
5	5	Servicios externos	1093.00	Servicio de Tornería externo	2026-07-20 00:04:29	2026-07-20 00:04:29
6	6	Mano de obra	753.00	Mano de obra técnico especializado	2026-07-20 00:04:29	2026-07-20 00:04:29
7	7	Servicios externos	810.00	Servicio de Tornería externo	2026-07-20 00:04:29	2026-07-20 00:04:29
8	8	Servicios externos	941.00	Servicio de Tornería externo	2026-07-20 00:04:29	2026-07-20 00:04:29
9	9	Mano de obra	1141.00	Mano de obra técnico especializado	2026-07-20 00:04:29	2026-07-20 00:04:29
10	10	Mano de obra	678.00	Mano de obra técnico especializado	2026-07-20 00:04:29	2026-07-20 00:04:29
11	11	Mano de obra	1197.00	Mano de obra técnico especializado	2026-07-20 00:04:29	2026-07-20 00:04:29
12	12	Servicios externos	558.00	Servicio de Tornería externo	2026-07-20 00:04:29	2026-07-20 00:04:29
13	13	Mano de obra	181.00	Mano de obra técnico especializado	2026-07-20 00:04:29	2026-07-20 00:04:29
14	14	Servicios externos	614.00	Servicio de Tornería externo	2026-07-20 00:04:29	2026-07-20 00:04:29
15	15	Mano de obra	471.00	Mano de obra técnico especializado	2026-07-20 00:04:29	2026-07-20 00:04:29
\.


--
-- Data for Name: detalle_compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_compras (id, compra_id, material_id, cantidad, precio, subtotal, created_at, updated_at) FROM stdin;
1	1	75	7.00	37.60	263.20	2026-07-20 00:04:29	2026-07-20 00:04:29
2	1	218	23.00	99.30	2283.90	2026-07-20 00:04:29	2026-07-20 00:04:29
3	1	234	25.00	69.30	1732.50	2026-07-20 00:04:29	2026-07-20 00:04:29
4	2	114	11.00	94.30	1037.30	2026-07-20 00:04:29	2026-07-20 00:04:29
5	2	138	47.00	124.10	5832.70	2026-07-20 00:04:29	2026-07-20 00:04:29
6	2	160	30.00	123.90	3717.00	2026-07-20 00:04:29	2026-07-20 00:04:29
7	2	235	41.00	34.90	1430.90	2026-07-20 00:04:29	2026-07-20 00:04:29
8	3	12	45.00	49.70	2236.50	2026-07-20 00:04:29	2026-07-20 00:04:29
9	4	231	48.00	119.40	5731.20	2026-07-20 00:04:29	2026-07-20 00:04:29
10	5	151	14.00	38.30	536.20	2026-07-20 00:04:29	2026-07-20 00:04:29
11	5	153	46.00	97.50	4485.00	2026-07-20 00:04:29	2026-07-20 00:04:29
12	5	154	2.00	74.50	149.00	2026-07-20 00:04:29	2026-07-20 00:04:29
13	5	237	2.00	73.20	146.40	2026-07-20 00:04:29	2026-07-20 00:04:29
14	6	214	10.00	109.40	1094.00	2026-07-20 00:04:29	2026-07-20 00:04:29
15	7	63	3.00	14.80	44.40	2026-07-20 00:04:29	2026-07-20 00:04:29
16	7	98	45.00	62.70	2821.50	2026-07-20 00:04:29	2026-07-20 00:04:29
17	7	122	39.00	38.60	1505.40	2026-07-20 00:04:29	2026-07-20 00:04:29
18	7	217	19.00	111.60	2120.40	2026-07-20 00:04:29	2026-07-20 00:04:29
19	8	43	22.00	31.10	684.20	2026-07-20 00:04:29	2026-07-20 00:04:29
20	8	70	11.00	71.70	788.70	2026-07-20 00:04:29	2026-07-20 00:04:29
21	8	85	28.00	14.30	400.40	2026-07-20 00:04:29	2026-07-20 00:04:29
22	8	166	46.00	29.30	1347.80	2026-07-20 00:04:29	2026-07-20 00:04:29
23	9	99	28.00	89.30	2500.40	2026-07-20 00:04:29	2026-07-20 00:04:29
24	9	166	50.00	99.00	4950.00	2026-07-20 00:04:29	2026-07-20 00:04:29
25	10	96	41.00	94.00	3854.00	2026-07-20 00:04:29	2026-07-20 00:04:29
26	10	156	18.00	14.50	261.00	2026-07-20 00:04:29	2026-07-20 00:04:29
27	10	205	48.00	10.50	504.00	2026-07-20 00:04:29	2026-07-20 00:04:29
28	10	239	47.00	140.60	6608.20	2026-07-20 00:04:29	2026-07-20 00:04:29
29	11	104	50.00	127.50	6375.00	2026-07-20 00:04:29	2026-07-20 00:04:29
30	11	122	26.00	110.80	2880.80	2026-07-20 00:04:29	2026-07-20 00:04:29
31	11	154	18.00	22.50	405.00	2026-07-20 00:04:29	2026-07-20 00:04:29
32	12	30	49.00	27.40	1342.60	2026-07-20 00:04:29	2026-07-20 00:04:29
33	13	104	2.00	83.70	167.40	2026-07-20 00:04:29	2026-07-20 00:04:29
34	13	105	4.00	27.60	110.40	2026-07-20 00:04:29	2026-07-20 00:04:29
35	14	14	47.00	21.20	996.40	2026-07-20 00:04:29	2026-07-20 00:04:29
36	14	185	23.00	99.40	2286.20	2026-07-20 00:04:29	2026-07-20 00:04:29
37	14	204	24.00	72.00	1728.00	2026-07-20 00:04:29	2026-07-20 00:04:29
38	14	227	6.00	118.40	710.40	2026-07-20 00:04:29	2026-07-20 00:04:29
39	15	71	42.00	28.80	1209.60	2026-07-20 00:04:29	2026-07-20 00:04:29
40	15	138	50.00	57.20	2860.00	2026-07-20 00:04:29	2026-07-20 00:04:29
41	15	212	16.00	84.40	1350.40	2026-07-20 00:04:29	2026-07-20 00:04:29
42	15	233	13.00	60.10	781.30	2026-07-20 00:04:29	2026-07-20 00:04:29
43	16	27	21.00	145.60	3057.60	2026-07-20 00:04:29	2026-07-20 00:04:29
44	16	232	4.00	30.80	123.20	2026-07-20 00:04:29	2026-07-20 00:04:29
45	17	41	4.00	143.90	575.60	2026-07-20 00:04:29	2026-07-20 00:04:29
46	17	64	2.00	73.00	146.00	2026-07-20 00:04:29	2026-07-20 00:04:29
47	17	89	13.00	108.60	1411.80	2026-07-20 00:04:29	2026-07-20 00:04:29
48	17	195	23.00	50.80	1168.40	2026-07-20 00:04:29	2026-07-20 00:04:29
49	18	59	20.00	47.60	952.00	2026-07-20 00:04:29	2026-07-20 00:04:29
50	18	183	31.00	45.50	1410.50	2026-07-20 00:04:29	2026-07-20 00:04:29
51	19	45	27.00	59.60	1609.20	2026-07-20 00:04:29	2026-07-20 00:04:29
52	19	118	48.00	37.20	1785.60	2026-07-20 00:04:29	2026-07-20 00:04:29
53	19	201	34.00	48.10	1635.40	2026-07-20 00:04:29	2026-07-20 00:04:29
54	19	238	41.00	11.70	479.70	2026-07-20 00:04:29	2026-07-20 00:04:29
55	20	95	39.00	49.20	1918.80	2026-07-20 00:04:29	2026-07-20 00:04:29
56	21	41	24.00	48.70	1168.80	2026-07-20 00:04:29	2026-07-20 00:04:29
57	21	95	19.00	112.20	2131.80	2026-07-20 00:04:29	2026-07-20 00:04:29
58	21	129	34.00	81.30	2764.20	2026-07-20 00:04:29	2026-07-20 00:04:29
59	21	239	2.00	129.40	258.80	2026-07-20 00:04:29	2026-07-20 00:04:29
60	22	25	23.00	23.50	540.50	2026-07-20 00:04:29	2026-07-20 00:04:29
61	22	198	37.00	63.90	2364.30	2026-07-20 00:04:29	2026-07-20 00:04:29
62	23	218	33.00	113.60	3748.80	2026-07-20 00:04:29	2026-07-20 00:04:29
63	24	139	40.00	113.20	4528.00	2026-07-20 00:04:29	2026-07-20 00:04:29
64	25	21	10.00	90.30	903.00	2026-07-20 00:04:29	2026-07-20 00:04:29
65	25	57	14.00	114.60	1604.40	2026-07-20 00:04:29	2026-07-20 00:04:29
66	25	73	16.00	136.70	2187.20	2026-07-20 00:04:29	2026-07-20 00:04:29
92	46	68	100.00	1500.00	150000.00	2026-07-19 20:37:48	2026-07-19 20:37:48
\.


--
-- Data for Name: empresa_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresa_settings (id, nombre_empresa, subtitulo, logo, created_at, updated_at) FROM stdin;
1	MINERA	Sistema Empresarial	empresa/JffHmpXGEmgUHMwMPfGYisyNuV93EHUsDiQlwCYz.jpg	2026-07-20 00:04:27	2026-07-19 20:30:55
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: gruas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gruas (id, tipo, codigo, capacidad_carga, operador_id, estado, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: historial_operaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_operaciones (id, usuario_id, accion, tabla, registro_id, datos_anteriores, datos_nuevos, ip, fecha, created_at, updated_at) FROM stdin;
1	1	crear	bocaminas	1	\N	{"nombre": "Huari Huari", "responsable": "Juan Torrez"}	192.168.1.100	2026-06-05 14:02:15	2026-07-20 00:04:29	2026-07-20 00:04:29
2	1	crear	bocaminas	2	\N	{"nombre": "Gran Suraga", "responsable": "Juan Carlos Incata"}	192.168.1.244	2026-06-05 15:34:41	2026-07-20 00:04:29	2026-07-20 00:04:29
3	1	crear	bocaminas	3	\N	{"nombre": "4 Estrellas", "responsable": "Jose Luis Mencacho"}	192.168.1.113	2026-06-05 14:34:58	2026-07-20 00:04:29	2026-07-20 00:04:29
4	1	crear	bocaminas	4	\N	{"nombre": "17 de Junio", "responsable": "Emilio Torrez"}	192.168.1.87	2026-06-06 16:09:11	2026-07-20 00:04:29	2026-07-20 00:04:29
5	1	crear	bocaminas	5	\N	{"nombre": "San Lucas", "responsable": "Waldo Hanco"}	192.168.1.172	2026-06-06 13:19:44	2026-07-20 00:04:29	2026-07-20 00:04:29
6	1	crear	bocaminas	6	\N	{"nombre": "Bocamina Grande", "responsable": "Elio Caceres"}	192.168.1.133	2026-06-06 15:09:39	2026-07-20 00:04:29	2026-07-20 00:04:29
7	1	actualizar	bocaminas	1	\N	{"ubicacion": "Nivel 1, Sector Norte - Actualizado"}	192.168.1.249	2026-06-30 07:00:27	2026-07-20 00:04:29	2026-07-20 00:04:29
8	1	crear	usuarios	2	\N	{"email": "joseluis@cooperativa.com", "nombre": "Jose Luis Mencacho"}	192.168.1.221	2026-06-07 10:51:46	2026-07-20 00:04:29	2026-07-20 00:04:29
9	1	crear	usuarios	3	\N	{"email": "juancarlos@cooperativa.com", "nombre": "Juan Carlos Incata"}	192.168.1.68	2026-06-07 16:29:58	2026-07-20 00:04:29	2026-07-20 00:04:29
10	1	crear	usuarios	4	\N	{"email": "juantorrez@cooperativa.com", "nombre": "Juan Torrez"}	192.168.1.125	2026-06-07 12:08:44	2026-07-20 00:04:29	2026-07-20 00:04:29
11	1	crear	usuarios	5	\N	{"email": "waldo@cooperativa.com", "nombre": "Waldo Hanco"}	192.168.1.152	2026-06-08 12:48:49	2026-07-20 00:04:29	2026-07-20 00:04:29
12	1	crear	usuarios	6	\N	{"email": "emilio@cooperativa.com", "nombre": "Emilio Torrez"}	192.168.1.33	2026-06-08 12:29:22	2026-07-20 00:04:29	2026-07-20 00:04:29
13	1	crear	usuarios	7	\N	{"email": "elio@cooperativa.com", "nombre": "Elio Caceres"}	192.168.1.65	2026-06-08 09:27:41	2026-07-20 00:04:29	2026-07-20 00:04:29
14	1	crear	usuarios	8	\N	{"email": "eloy@cooperativa.com", "nombre": "Eloy Canabiri"}	192.168.1.254	2026-06-08 17:31:51	2026-07-20 00:04:29	2026-07-20 00:04:29
15	1	crear	materiales	1	\N	{"grupo": "G-1", "descripcion": "NITRATO (ANFO)"}	192.168.1.50	2026-06-10 18:02:25	2026-07-20 00:04:29	2026-07-20 00:04:29
16	1	crear	materiales	2	\N	{"grupo": "G-1", "descripcion": "DINAMITA"}	192.168.1.150	2026-06-10 17:35:56	2026-07-20 00:04:29	2026-07-20 00:04:29
17	1	crear	materiales	3	\N	{"grupo": "G-1", "descripcion": "FULMINANTE (CAPSULAS)"}	192.168.1.150	2026-06-10 14:04:05	2026-07-20 00:04:29	2026-07-20 00:04:29
18	1	actualizar	materiales	1	\N	{"stock": 369.56, "precio_unitario": 28}	192.168.1.141	2026-07-05 14:34:39	2026-07-20 00:04:29	2026-07-20 00:04:29
19	1	crear	proveedores	1	\N	{"nit": "1234567890", "nombre": "Distribuidora Minera Potosí"}	192.168.1.31	2026-06-11 08:19:54	2026-07-20 00:04:29	2026-07-20 00:04:29
20	1	crear	proveedores	2	\N	{"nit": "9876543210", "nombre": "Insumos Industriales S.R.L."}	192.168.1.136	2026-06-11 16:56:32	2026-07-20 00:04:29	2026-07-20 00:04:29
21	1	crear	proveedores	3	\N	{"nit": "5432109876", "nombre": "Ferretería Central Sucre"}	192.168.1.47	2026-06-11 18:34:46	2026-07-20 00:04:29	2026-07-20 00:04:29
22	5	crear	compras	1	\N	{"total": 3250.5, "bocamina": "Huari Huari", "numero_factura": "FAC-00101"}	192.168.1.68	2026-06-15 08:59:25	2026-07-20 00:04:29	2026-07-20 00:04:29
23	3	crear	compras	2	\N	{"total": 5120, "bocamina": "4 Estrellas", "numero_factura": "FAC-00205"}	192.168.1.95	2026-06-20 07:51:59	2026-07-20 00:04:29	2026-07-20 00:04:29
24	6	crear	compras	3	\N	{"total": 1890.75, "bocamina": "San Lucas", "numero_factura": "FAC-00312"}	192.168.1.130	2026-06-25 13:33:21	2026-07-20 00:04:29	2026-07-20 00:04:29
25	4	crear	compras	4	\N	{"total": 7450, "bocamina": "Gran Suraga", "numero_factura": "FAC-00419"}	192.168.1.91	2026-07-02 17:41:57	2026-07-20 00:04:29	2026-07-20 00:04:29
26	7	crear	compras	5	\N	{"total": 2300.8, "bocamina": "17 de Junio", "numero_factura": "FAC-00520"}	192.168.1.230	2026-07-08 09:09:52	2026-07-20 00:04:29	2026-07-20 00:04:29
27	5	actualizar	compras	1	\N	{"estado": "completado"}	192.168.1.94	2026-06-17 14:31:14	2026-07-20 00:04:29	2026-07-20 00:04:29
28	3	actualizar	compras	2	\N	{"estado": "completado"}	192.168.1.76	2026-06-22 13:49:27	2026-07-20 00:04:29	2026-07-20 00:04:29
29	1	eliminar	compras	99	\N	\N	192.168.1.171	2026-07-10 18:18:35	2026-07-20 00:04:29	2026-07-20 00:04:29
30	1	crear	maquinaria	1	\N	{"tipo": "Perforadora Jumbo", "marca": "Sandvik", "modelo": "DD311"}	192.168.1.80	2026-06-12 08:54:07	2026-07-20 00:04:29	2026-07-20 00:04:29
31	1	crear	maquinaria	2	\N	{"tipo": "Perforadora Jumbo", "marca": "Epiroc", "modelo": "M2C"}	192.168.1.246	2026-06-12 14:33:12	2026-07-20 00:04:29	2026-07-20 00:04:29
32	1	actualizar	maquinaria	2	\N	{"estado": "en_mantenimiento", "horometro": 3400}	192.168.1.80	2026-07-12 07:13:02	2026-07-20 00:04:29	2026-07-20 00:04:29
33	1	crear	vehiculos	1	\N	{"tipo": "Volqueta", "marca": "Volvo FMX 460", "placa": "2245-LKP"}	192.168.1.44	2026-06-13 14:37:43	2026-07-20 00:04:29	2026-07-20 00:04:29
34	1	crear	vehiculos	4	\N	{"tipo": "Camioneta", "marca": "Toyota Hilux 4x4", "placa": "5010-XYZ"}	192.168.1.65	2026-06-13 17:08:36	2026-07-20 00:04:29	2026-07-20 00:04:29
35	1	actualizar	vehiculos	3	\N	{"estado": "en_mantenimiento"}	192.168.1.131	2026-07-15 11:46:36	2026-07-20 00:04:29	2026-07-20 00:04:29
36	1	crear	servicios	1	\N	{"codigo": "SRV-0001", "equipo": "Jumbo Sandvik DD311", "fallas": "Fuga hidráulica"}	192.168.1.26	2026-07-06 13:01:13	2026-07-20 00:04:29	2026-07-20 00:04:29
37	1	crear	servicios	2	\N	{"codigo": "SRV-0002", "equipo": "Volqueta Volvo FMX", "fallas": "Desgaste de frenos"}	192.168.1.177	2026-07-10 07:58:01	2026-07-20 00:04:29	2026-07-20 00:04:29
38	1	actualizar	servicios	1	\N	{"estado": "Finalizado", "solucion": "Cambio completo de mangueras hidráulicas"}	192.168.1.236	2026-07-08 13:50:07	2026-07-20 00:04:29	2026-07-20 00:04:29
39	1	crear	inspecciones	1	\N	{"equipo": "Compresor Atlas Copco XATS-350", "motor_ok": true, "frenos_ok": true}	192.168.1.178	2026-07-13 14:06:08	2026-07-20 00:04:29	2026-07-20 00:04:29
40	1	crear	inspecciones	2	\N	{"equipo": "Guinche Eléctrico GE-50HP", "motor_ok": true, "frenos_ok": false}	192.168.1.104	2026-07-16 09:09:53	2026-07-20 00:04:29	2026-07-20 00:04:29
41	1	crear	alquiler-gruas	1	\N	{"chofer": "Ramiro Soliz Choque", "capacidad": "25 Ton", "placa_grua": "ALQ-701"}	192.168.1.135	2026-06-30 08:03:50	2026-07-20 00:04:29	2026-07-20 00:04:29
42	1	crear	alquiler-gruas	2	\N	{"chofer": "Jaime Mamani Flores", "capacidad": "40 Ton", "placa_grua": "ALQ-705"}	192.168.1.73	2026-07-05 11:47:38	2026-07-20 00:04:29	2026-07-20 00:04:29
43	1	actualizar	alquiler-gruas	1	\N	{"costo": 3800, "tiempo_trabajo": "12 días"}	192.168.1.179	2026-07-11 12:33:54	2026-07-20 00:04:29	2026-07-20 00:04:29
44	8	crear	compras	20	\N	{"total": 4100, "bocamina": "Bocamina Grande", "numero_factura": "FAC-01520"}	192.168.1.219	2026-07-19 10:03:37	2026-07-20 00:04:29	2026-07-20 00:04:29
45	5	crear	compras	21	\N	{"total": 2750.3, "bocamina": "Huari Huari", "numero_factura": "FAC-01625"}	192.168.1.226	2026-07-20 18:14:29	2026-07-20 00:04:29	2026-07-20 00:04:29
46	1	actualizar	maquinaria	6	\N	{"estado": "en_mantenimiento", "horometro": 4100}	192.168.1.160	2026-07-20 09:44:46	2026-07-20 00:04:29	2026-07-20 00:04:29
47	1	crear	inspecciones	15	\N	{"equipo": "Bomba Sumergible Flygt 2640", "motor_ok": true}	192.168.1.216	2026-07-20 18:14:11	2026-07-20 00:04:29	2026-07-20 00:04:29
106	1	crear	respaldos	9	\N	{"tipo": "manual", "estado": "completado", "tamano": 810199, "nombre_archivo": "backup_2026-07-20_00-17-55.zip"}	127.0.0.1	2026-07-20 00:17:56	2026-07-20 00:17:56	2026-07-20 00:17:56
107	1	crear	respaldos	\N	\N	[]	127.0.0.1	2026-07-20 00:17:56	2026-07-20 00:17:56	2026-07-20 00:17:56
209	1	crear	respaldos	22	\N	{"tipo": "manual", "estado": "completado", "tamano": 833578, "nombre_archivo": "backup_2026-07-19_20-33-52.zip"}	127.0.0.1	2026-07-19 20:33:52	2026-07-19 20:33:52	2026-07-19 20:33:52
210	1	crear	respaldos	\N	\N	[]	127.0.0.1	2026-07-19 20:33:52	2026-07-19 20:33:52	2026-07-19 20:33:52
213	1	editar	bocaminas	\N	\N	{"nombre": "Huari Huari", "ubicacion": "Ubicación actualizada por Cypress"}	127.0.0.1	2026-07-19 20:37:10	2026-07-19 20:37:10	2026-07-19 20:37:10
216	1	crear	compras	46	\N	{"fecha": "2026-07-20", "total": 150000, "detalles": [{"precio": 1500, "cantidad": 100, "subtotal": 150000, "material_id": 68}], "bocamina_id": "2", "proveedor_id": "1", "observaciones": null, "numero_factura": "F-CYPRESS-001"}	127.0.0.1	2026-07-19 20:37:48	2026-07-19 20:37:48	2026-07-19 20:37:48
219	1	crear	vehiculos	21	\N	{"tipo": "CamionetaCamioneta", "marca": "Toyota", "placa": "CYP-1234", "estado": "operativo", "modelo": "Hilux 2024"}	127.0.0.1	2026-07-19 20:38:05	2026-07-19 20:38:05	2026-07-19 20:38:05
222	1	crear	vehiculos	22	\N	{"tipo": "CamionetaCamioneta", "marca": "Toyota", "placa": "CYP-1234", "estado": "operativo", "modelo": "Hilux 2024"}	127.0.0.1	2026-07-19 20:38:30	2026-07-19 20:38:30	2026-07-19 20:38:30
225	1	crear	vehiculos	23	\N	{"tipo": "CamionetaCamioneta", "marca": "Toyota", "placa": "CYP-1234", "estado": "operativo", "modelo": "Hilux 2024"}	127.0.0.1	2026-07-19 20:38:58	2026-07-19 20:38:58	2026-07-19 20:38:58
228	1	crear	logout	\N	\N	[]	127.0.0.1	2026-07-19 20:39:25	2026-07-19 20:39:25	2026-07-19 20:39:25
137	1	editar	usuarios	\N	\N	{"email": "waldo@cooperativa.com", "estado": true, "nombre": "Waldo Hanco", "rol_id": 3, "permisos": []}	127.0.0.1	2026-07-20 00:19:27	2026-07-20 00:19:27	2026-07-20 00:19:27
138	1	crear	logout	\N	\N	[]	127.0.0.1	2026-07-20 00:19:31	2026-07-20 00:19:31	2026-07-20 00:19:31
139	5	crear	logout	\N	\N	[]	127.0.0.1	2026-07-20 00:19:44	2026-07-20 00:19:44	2026-07-20 00:19:44
140	1	editar	usuarios	\N	\N	{"email": "waldo@cooperativa.com", "estado": true, "nombre": "Waldo Hanco", "rol_id": 1, "permisos": []}	127.0.0.1	2026-07-20 00:20:14	2026-07-20 00:20:14	2026-07-20 00:20:14
141	1	editar	usuarios	\N	\N	{"email": "waldo@cooperativa.com", "estado": true, "nombre": "Waldo Hanco", "rol_id": 5, "permisos": []}	127.0.0.1	2026-07-20 00:20:27	2026-07-20 00:20:27	2026-07-20 00:20:27
142	1	crear	logout	\N	\N	[]	127.0.0.1	2026-07-20 00:20:29	2026-07-20 00:20:29	2026-07-20 00:20:29
143	5	crear	logout	\N	\N	[]	127.0.0.1	2026-07-20 00:20:38	2026-07-20 00:20:38	2026-07-20 00:20:38
144	1	editar	usuarios	\N	\N	{"email": "waldo@cooperativa.com", "estado": true, "nombre": "Waldo Hanco", "rol_id": 4, "permisos": []}	127.0.0.1	2026-07-20 00:21:00	2026-07-20 00:21:00	2026-07-20 00:21:00
145	1	crear	logout	\N	\N	[]	127.0.0.1	2026-07-20 00:21:02	2026-07-20 00:21:02	2026-07-20 00:21:02
146	5	crear	logout	\N	\N	[]	127.0.0.1	2026-07-20 00:21:14	2026-07-20 00:21:14	2026-07-20 00:21:14
147	1	crear	empresa	\N	\N	{"logo": {}}	127.0.0.1	2026-07-20 00:24:06	2026-07-20 00:24:06	2026-07-20 00:24:06
148	1	editar	empresa	\N	\N	{"subtitulo": "Sistema Empresarial", "nombre_empresa": "MINERA COP"}	127.0.0.1	2026-07-20 00:24:07	2026-07-20 00:24:07	2026-07-20 00:24:07
211	1	crear	logout	\N	\N	[]	127.0.0.1	2026-07-19 20:36:13	2026-07-19 20:36:13	2026-07-19 20:36:13
214	1	crear	proveedores	54	\N	{"nit": "1234567890", "email": null, "nombre": "Minera Proveedora Cypress S.A.", "telefono": "+591 72345678", "direccion": "Av. Simón Bolívar #1234, Potosí, Bolivia"}	127.0.0.1	2026-07-19 20:37:39	2026-07-19 20:37:39	2026-07-19 20:37:39
217	1	crear	logout	\N	\N	[]	127.0.0.1	2026-07-19 20:37:52	2026-07-19 20:37:52	2026-07-19 20:37:52
220	1	crear	servicios	\N	\N	{"hora": "20:38", "fecha": "2026-07-20", "codigo": "SRV-6527", "estado": "Pendiente", "equipo_id": 1, "repuestos": [{"cantidad": 2, "material_id": null, "costo_unitario": 150, "material_nombre": "HERR"}], "descripcion": "Cambio de aceite hidráulico y filtros - Prueba Cypress", "equipo_tipo": "App\\\\Models\\\\Maquinaria", "observaciones": null, "usuario_registro_id": 1}	127.0.0.1	2026-07-19 20:38:11	2026-07-19 20:38:11	2026-07-19 20:38:11
223	1	crear	servicios	\N	\N	{"hora": "20:38", "fecha": "2026-07-20", "codigo": "SRV-1901", "estado": "Pendiente", "equipo_id": 1, "repuestos": [{"cantidad": 2, "material_id": null, "costo_unitario": 150, "material_nombre": "HERR"}], "descripcion": "Cambio de aceite hidráulico y filtros - Prueba Cypress", "equipo_tipo": "App\\\\Models\\\\Maquinaria", "observaciones": null, "usuario_registro_id": 1}	127.0.0.1	2026-07-19 20:38:37	2026-07-19 20:38:37	2026-07-19 20:38:37
226	1	crear	servicios	\N	\N	{"hora": "20:38", "fecha": "2026-07-20", "codigo": "SRV-9904", "estado": "Pendiente", "equipo_id": 1, "repuestos": [{"cantidad": 2, "material_id": null, "costo_unitario": 150, "material_nombre": "HERR"}], "descripcion": "Cambio de aceite hidráulico y filtros - Prueba Cypress", "equipo_tipo": "App\\\\Models\\\\Maquinaria", "observaciones": null, "usuario_registro_id": 1}	127.0.0.1	2026-07-19 20:39:05	2026-07-19 20:39:05	2026-07-19 20:39:05
229	1	crear	usuarios	460	\N	{"email": "cypress.test.1784507978019@cooperativaminera.com", "estado": true, "nombre": "Cypress Test User", "rol_id": 3, "permisos": []}	127.0.0.1	2026-07-19 20:39:45	2026-07-19 20:39:45	2026-07-19 20:39:45
178	1	editar	empresa	\N	\N	{"subtitulo": "Sistema Empresarial", "nombre_empresa": "MINERA"}	127.0.0.1	2026-07-19 20:30:55	2026-07-19 20:30:55	2026-07-19 20:30:55
212	1	crear	bocaminas	92	\N	{"nombre": "Bocamina Cypress Nivel 5", "ubicacion": "Sector Norte, Potosí - Coordenadas: -19.5836, -65.7536"}	127.0.0.1	2026-07-19 20:37:05	2026-07-19 20:37:05	2026-07-19 20:37:05
215	1	crear	materiales	325	\N	{"grupo": null, "codigo": "MAT-01", "descripcion": "Pico minero reforzado Cypress"}	127.0.0.1	2026-07-19 20:37:44	2026-07-19 20:37:44	2026-07-19 20:37:44
218	1	crear	maquinaria	36	\N	{"tipo": "RetroexcavadoraRetroexcavadora", "marca": "Caterpillar", "placa": null, "estado": "operativa", "modelo": "320D", "horometro": 1500, "kilometraje": 0, "nombre_codigo": "EXC-CY01"}	127.0.0.1	2026-07-19 20:38:02	2026-07-19 20:38:02	2026-07-19 20:38:02
221	1	crear	maquinaria	37	\N	{"tipo": "RetroexcavadoraRetroexcavadora", "marca": "Caterpillar", "placa": null, "estado": "operativa", "modelo": "320D", "horometro": 1500, "kilometraje": 0, "nombre_codigo": "EXC-CY01"}	127.0.0.1	2026-07-19 20:38:26	2026-07-19 20:38:26	2026-07-19 20:38:26
224	1	crear	maquinaria	38	\N	{"tipo": "RetroexcavadoraRetroexcavadora", "marca": "Caterpillar", "placa": null, "estado": "operativa", "modelo": "320D", "horometro": 1500, "kilometraje": 0, "nombre_codigo": "EXC-CY01"}	127.0.0.1	2026-07-19 20:38:54	2026-07-19 20:38:54	2026-07-19 20:38:54
227	1	crear	usuarios	459	\N	{"email": "cypress.test.1784507958159@cooperativaminera.com", "estado": true, "nombre": "Cypress Test User", "rol_id": 3, "permisos": []}	127.0.0.1	2026-07-19 20:39:25	2026-07-19 20:39:25	2026-07-19 20:39:25
230	1	crear	logout	\N	\N	[]	127.0.0.1	2026-07-19 20:39:46	2026-07-19 20:39:46	2026-07-19 20:39:46
208	1	crear	alquiler-gruas	16	\N	{"costo": 5500, "placa_grua": "GRU-CY99", "bocamina_id": "1", "nombre_chofer": "Juan Pérez Cypress", "tiempo_trabajo": "8 horas", "capacidad_carga": "15 Toneladas"}	127.0.0.1	2026-07-19 20:33:13	2026-07-19 20:33:13	2026-07-19 20:33:13
\.


--
-- Data for Name: inspeccions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inspeccions (id, equipo_tipo, equipo_id, motor_ok, frenos_ok, aceite_ok, neumaticos_ok, luces_ok, seguridad_ok, observaciones, firma_responsable_id, created_at, updated_at, deleted_at) FROM stdin;
1	App\\Models\\Vehiculo	3	t	t	t	t	t	t	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-07-03 00:04:29	2026-07-20 00:04:29	\N
2	App\\Models\\Maquinaria	8	f	t	t	t	t	t	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-06-27 00:04:29	2026-07-20 00:04:29	\N
3	App\\Models\\Maquinaria	1	t	t	t	t	t	f	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-06-27 00:04:29	2026-07-20 00:04:29	\N
4	App\\Models\\Vehiculo	3	t	t	t	t	t	t	Requiere ajuste de frenos a la brevedad y reposición de faro trasero roto.	1	2026-06-28 00:04:29	2026-07-20 00:04:29	\N
5	App\\Models\\Maquinaria	4	t	t	t	t	t	f	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-07-17 00:04:29	2026-07-20 00:04:29	\N
6	App\\Models\\Maquinaria	9	t	t	t	t	f	t	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-07-13 00:04:29	2026-07-20 00:04:29	\N
7	App\\Models\\Maquinaria	7	t	t	t	t	t	t	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-06-20 00:04:29	2026-07-20 00:04:29	\N
8	App\\Models\\Maquinaria	5	t	t	t	f	t	t	Requiere ajuste de frenos a la brevedad y reposición de faro trasero roto.	1	2026-07-12 00:04:29	2026-07-20 00:04:29	\N
9	App\\Models\\Vehiculo	1	t	f	t	t	t	f	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-06-24 00:04:29	2026-07-20 00:04:29	\N
10	App\\Models\\Maquinaria	1	t	t	t	t	t	t	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-06-21 00:04:29	2026-07-20 00:04:29	\N
11	App\\Models\\Vehiculo	2	t	t	t	t	t	t	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-07-07 00:04:29	2026-07-20 00:04:29	\N
12	App\\Models\\Vehiculo	4	t	t	t	t	t	t	Requiere ajuste de frenos a la brevedad y reposición de faro trasero roto.	1	2026-07-19 00:04:29	2026-07-20 00:04:29	\N
13	App\\Models\\Maquinaria	7	t	t	f	t	f	t	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-06-22 00:04:29	2026-07-20 00:04:29	\N
14	App\\Models\\Vehiculo	6	t	t	t	t	t	f	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-06-24 00:04:29	2026-07-20 00:04:29	\N
15	App\\Models\\Vehiculo	2	t	t	t	f	f	t	Equipo sin observaciones en su inspección estructural y de motor.	1	2026-07-07 00:04:29	2026-07-20 00:04:29	\N
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: maquinarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maquinarias (id, tipo, nombre_codigo, marca, modelo, placa, horometro, kilometraje, estado, created_at, updated_at, deleted_at) FROM stdin;
1	Perforadora Jumbo	JUM-01	Sandvik	DD311	\N	1250.00	0.00	operativa	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
2	Perforadora Jumbo	JUM-02	Epiroc	M2C	\N	3400.00	0.00	en_mantenimiento	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
3	Cargador de Bajo Perfil	SCO-01	CAT	R1300G	\N	5200.00	0.00	operativa	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
4	Cargador de Bajo Perfil	SCO-02	Sandvik	LH203	\N	850.00	0.00	operativa	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
5	Compresor de Aire	COM-01	Atlas Copco	XATS-350	\N	8900.00	0.00	operativa	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
6	Compresor de Aire	COM-02	Ingersoll Rand	P185	\N	4100.00	0.00	en_mantenimiento	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
7	Generador Eléctrico	GEN-01	Caterpillar	DE150	\N	1800.00	0.00	operativa	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
8	Extractor Axial	EXT-01	Howden	Axipal 120	\N	11200.00	0.00	operativa	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
9	Bomba Sumergible	BOM-01	Flygt	2640	\N	2900.00	0.00	operativa	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
10	Guinche Eléctrico	WIN-01	Insemine	GE-50HP	\N	7800.00	0.00	operativa	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
36	RetroexcavadoraRetroexcavadora	EXC-CY01	Caterpillar	320D	\N	1500.00	0.00	operativa	2026-07-19 20:38:02	2026-07-19 20:38:02	\N
37	RetroexcavadoraRetroexcavadora	EXC-CY01	Caterpillar	320D	\N	1500.00	0.00	operativa	2026-07-19 20:38:26	2026-07-19 20:38:26	\N
38	RetroexcavadoraRetroexcavadora	EXC-CY01	Caterpillar	320D	\N	1500.00	0.00	operativa	2026-07-19 20:38:54	2026-07-19 20:38:54	\N
\.


--
-- Data for Name: materiales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materiales (id, codigo, descripcion, grupo, imagen, estado, created_at, updated_at) FROM stdin;
325	MAT-01	Pico minero reforzado Cypress	\N	\N	disponible	2026-07-19 20:37:44	2026-07-19 20:37:44
2	G-1/0001	NITRATO (ANFO)	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
3	G-1/0002	DINAMITA	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
4	G-1/0003	FULMINANTE  (CAPSULAS)	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
20	G-2/0001	LLAVE DE PASO '1' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
21	G-2/0002	LLAVE DE PASO '1' CORTINA GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
22	G-2/0003	LLAVE DE PASO '2' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
23	G-2/0004	LLAVE DE PASO '2' CORTINA GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
24	G-2/0005	UNION PATENTE  '1' GALVANIZADO CON BRONCE	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
25	G-2/0006	UNION PATENTE '2' GALVANIZADO CON BRONCE	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
26	G-2/0007	NIPLE DE '1' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
27	G-2/0008	NIPLE DE '2' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
28	G-2/0009	COPLA DE '1' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
29	G-2/0010	COPLA DE '2' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
30	G-2/0011	CODO DE '2' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
31	G-2/0012	T DE '1' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
46	G-2/0027	BARILLA DE 3/8	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
68	G-3/0001	PICOTA CON PALA ANCHA	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
69	G-3/0002	PICOTA NORMAL	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
70	G-3/0003	PALA PUNTA HUEVO	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
71	G-3/0004	COMBO DE 2K	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
72	G-3/0005	COMBO DE 12 LB	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
73	G-3/0006	STILLSON # 24	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
74	G-3/0007	STILLSON # 14	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
76	G-3/0009	CURVINA '24'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
77	G-3/0010	DISCO DE DESGASTE DE '9'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
102	G-4/0001	ACEITE DE MAQUINA	Lubricantes y Aceites	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
103	G-4/0002	ACEITE MOTOR 15W40 DIESEL	Lubricantes y Aceites	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
104	G-4/0003	ACEITE TELLUS 2M / 68	Lubricantes y Aceites	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
105	G-4/0004	ACEITE HIDRAULICO ISO/68	Lubricantes y Aceites	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
106	G-4/0005	GASOLINA	Lubricantes y Aceites	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
107	G-4/0006	DIESEL	Lubricantes y Aceites	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
108	G-4/0007	GRASA DE RODAMIENTOS	Lubricantes y Aceites	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
110	G-5/0001	FILTRO DE AIRE C23610 (COMPRESORA)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
111	G-5/0002	FILTRO DE AIRE C20500 (COMPRESORA)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
112	G-5/0003	FILTRO DE AIRE SFA1107H (GEN. AZUL)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
113	G-5/0004	FILTRO DE AIRE SFA1196H (GEN. BLANCO)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
114	G-5/0005	FILTRO DE ACEITE PSL962 (COMPRESORA)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
115	G-5/0006	FILTRO DE ACEITE 1R-0739 (pala)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
116	G-5/0007	FILTRO DE DIESEL P551010	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
117	G-5/0008	CORREA 17X2845 B-112  'GUINCHE'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
118	G-5/0009	CORREA Ax-32 (pala)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
119	G-5/0010	CORREA A-52 (pala)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
120	G-5/0011	CORREA A-72 (pala)	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
121	G-5/0012	FILTRO DE AIRE SFA 2499 SET 'PALA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
122	G-5/0013	FILTRO DE AIRE SFA 2500S 'PALA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
123	G-5/0014	FILTRO DE ACEITE SPO4111 'GEN. BLANCO'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
141	G-6/0001	SACO IMPERMEABLE TALLA 'M'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
142	G-6/0002	SACO IMPERMEABLE TALLA 'L'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
143	G-6/0003	PANTALON IMPERMEABLE TALLA 'M'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
144	G-6/0004	PANTALON IMPERMEABLE TALLA 'L'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
145	G-6/0005	OVEROLES TALLA 'M'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
75	G-3/0008	SIERRA MECÁNICA 'N° 12'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
189	G-7/0018	ESTUCHE DE LLAVES DADO 'UTUSTOOLS'	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:17:31
146	G-6/0006	OVEROLES TALLA 'L'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
147	G-6/0007	OVEROLES TALLA 'XL'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
148	G-6/0008	CASCO MINERO BLANCO	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
172	G-7/0001	ARCO DE SOLDAR CROWN	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
173	G-7/0002	CARGADOR DE BATERIAS CD-530	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
175	G-7/0004	WINCHE TAMAÑO PEQUEÑO	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
176	G-7/0005	WINCHE TAMAÑO GRANDE	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
177	G-7/0006	AMOLADORA TAMAÑO GRANDE	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
178	G-7/0007	AMOLADORA TAMAÑO PEQUEÑO	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
180	G-7/0009	SOPLETE MANUAL	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
181	G-7/0010	SOPLETE DE PINTURA	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
183	G-7/0012	RODILLO PARA WINCHE	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
184	G-7/0013	CARRO METALERO DE 1 TN	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
188	G-7/0017	CARRO TRANSPORTADORA DE MADERA	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
203	G-8/0001	ANTICONGELANTE	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
204	G-8/0002	THINNER 900CC	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
205	G-8/0003	DESENGRASANTE DE MOTOR	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
206	G-8/0004	MONOPOL NEGRO	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
207	G-8/0005	MONOPOL AMARILLO	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
208	G-8/0006	MONOPOL AZUL	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
209	G-8/0007	AEROSOL VERDE	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
210	G-8/0008	AEROSOL AZUL	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
211	G-8/0009	AEROSOL ROJO	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
212	G-8/0010	AEROSOL AMARILLO	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
213	G-8/0011	LIMPIA CONTACTO	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
214	G-8/0012	PEGATANKE	Pinturas y Anticongelantes	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
190	G-7/0019	ESTUCHE DE BROCAS TAMAÑO PEQUEÑO "INECO"	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
179	G-7/0008	MOTOSIERRA (INECO)	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
187	G-7/0016	RONDANA TAMAÑO GRANDE DE '10'	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
216	G-9/0001	CAJA DISTRIBUIDORA ELÉCTRICA DE 59X50X20	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
217	G-9/0002	CAJA DISTRIBUIDORA ELÉCTRICA DE 40X30X17	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
186	G-7/0015	CARRO TRANSPORTADORA DE MINERAL A NEUMÁTICO	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
185	G-7/0014	CARRO TRANSPORTADORA DE MINERAL A METÁLICO	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
174	G-7/0003	TUBO DE OXÍGENO MEDIANO	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
182	G-7/0011	MICRO GASÓGENO 1K	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
238	G-11  —  PRUEBAS	PRUEBAS	Otros	\N	inactivo	2026-07-20 00:04:29	2026-07-20 00:11:38
5	G-1/0004	GUIA	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
6	G-1/0005	BARRA 0,80 (COREMAN)	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
7	G-1/0006	BARRA 1,20	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
8	G-1/0007	BARRA 1,80	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
9	G-1/0008	BARRENO 0,80	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
10	G-1/0009	BARRENO 1,20	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
11	G-1/0010	BARRENO 1,80	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
12	G-1/0011	BROCA N° 39 MM	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
13	G-1/0012	BROCA N° 41 MM	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
15	G-1/0014	GARRA '1' CON ROSCA EXTERIOR 3/4	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
16	G-1/0015	GARRA DE '1' CON ROSCA INTERIOR '1'	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
18	G-1/0017	BARRA 0,60	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
32	G-2/0013	T DE '2' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
33	G-2/0014	Y DE '1' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
34	G-2/0015	Y DE '2' GALVANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
36	G-2/0017	CANOTO A ROSCA DE '1'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
38	G-2/0019	CANOTO A ROSCA DE '2'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
39	G-2/0020	REDUCCION DE '2' A '1'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
40	G-2/0021	REDUCCION DE '2' A '1,5'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
42	G-2/0023	CLAVOS '7' PULGADAS	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
43	G-2/0024	CLAVOS '6' PULGADAS	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
44	G-2/0025	CLAVOS '5' PULGADAS	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
45	G-2/0026	CLAVOS '4' PULGADAS	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
47	G-2/0028	BARILLA DE 1/2	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
48	G-2/0029	VOLANDAS PLANA DE 3/8	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
49	G-2/0030	TUERCA DE 3/8	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
50	G-2/0031	VOLANDAS PLANA DE 1/2	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
51	G-2/0032	TUERCA DE 1/2	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
52	G-2/0033	PERNOS DE 3/8 X '2'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
53	G-2/0034	RODAMIENTO A BOLA /6209-2RS 'CARRO'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
54	G-2/0035	RODAMIENTO A BOLA /63092RSC3  'GUINCHE'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
55	G-2/0036	RADIO 'JANDI'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
56	G-2/0037	REDUCCION DE "1"A "3/4"	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
57	G-2/0038	RODAMIENTO A BOLA /62102RSC3 'GUINCHE'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
58	G-2/0039	RODAMIENTO  6212-2RS 'GUINCHE'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
59	G-2/0040	POLITUBO DE '2'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
60	G-2/0041	POLITUBO DE '1'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
220	G-9/0005	REFLECTOR LED 200W	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
230	G-10/0001	CALLAPOS DE "2.50 MTRS"	Maderas y Tablones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
231	G-10/0002	CHAJLLA REDONDA DE "2.50 MTRS"	Maderas y Tablones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
232	G-10/0003	CHAJLLA RALLADA DE "2.50 MTRS"	Maderas y Tablones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
233	G-10/0004	MADERA LABRADA DE "3 X 3 X 2,50 MTRS"	Maderas y Tablones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
234	G-10/0005	DURMIENTE DE "3 X 6 X 1 MTRS"	Maderas y Tablones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
235	G-10/0006	LINEA DE MADERA DE "3 X 3 X 4 MTRS"	Maderas y Tablones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
236	G-10/0007	ESCALERA DE MADERA "4 MTRS"	Maderas y Tablones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
237	G-10/0008	TABLON DE MADERA "1.5 X 3 X 2.50 MTRS"	Maderas y Tablones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
239	G-11/0001	HOLA	Otros	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
14	G-1/0013	GARRA '1' CON EESPIGA 3/4	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
17	G-1/0016	CARGADOR DE ANFO CON ESPIGA DE 3/4	Material Explosivo	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
35	G-2/0016	CANOTO CON ESPIGA DE '1'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
37	G-2/0018	CANOTO CON ESPIGA DE '2'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
41	G-2/0022	REDUCCION CON ESPIGA DE '2' A '1,5'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
218	G-9/0003	TÉRMICO TRIFÁSICO	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
219	G-9/0004	TÉRMICO MONOFÁSICO	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
61	G-2/0042	LLAVE DE PASO '3' GALBANIZADO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
62	G-2/0043	GRAPAS CROSPI  'N° 13'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
63	G-2/0044	GRAPAS CROSPI  'N° 10'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
64	G-2/0045	LLAVE CRECEN N°10	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
65	G-2/0046	RASTRILLO	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
66	G-2/0047	GRAPAS CROSPI  'N° 16'	Accesorios e Instalaciones	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
78	G-3/0011	DISCO DE DESGASTE DE '4,5'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
79	G-3/0012	DISCO DE CORTE '7'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
80	G-3/0013	DISCO DE CORTE '9'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
81	G-3/0014	DISCO DE CORTE '4,5'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
82	G-3/0015	ELECTRODO E6013	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
83	G-3/0016	ELECTRODO E7018	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
84	G-3/0017	CABLE DE ACERO 1/2	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
85	G-3/0018	CABLE DE ACERO 3/8	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
86	G-3/0019	SOGA 3/4	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
87	G-3/0020	SOGA 1/2	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
88	G-3/0021	CEPILLO DE ACERO	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
89	G-3/0022	FLEXOMETRO DE 5mtrs	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
91	G-3/0024	HOJAS DE CURVINA '24'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
93	G-3/0026	CAMARAS 4.00-8  'CARRETILLA'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
95	G-3/0028	ALAMBRE GALVANIZADO '6'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
96	G-3/0029	ALAMBRE DE AMARRE '6'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
97	G-3/0030	ALQUITRAN 'VISCOLA'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
98	G-3/0031	ALICATE PARA ANILLOS '7'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
100	G-3/0033	PUNTAS	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
124	G-5/0015	FILTRO DE ACEITE SFO0754 'GEN. AZUL Y AMARILLO'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
125	G-5/0016	FILTRO DE ACEITE  BT 339  'GEN. AZUL'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
126	G-5/0017	FILTRO DE ACEITE  PSL597  'GEN. AZUL'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
127	G-5/0018	FILTRO DE DIESEL WK1060/1  'COMPRESORA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
128	G-5/0019	FILTRO DE DIESEL PSC877 'GEN. AZUL'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
129	G-5/0020	FILTRO DE DIESEL SFR0143FW 'GEN. BLANCO'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
130	G-5/0021	FILTRO DE DIESEL P551427 'GEN. AZUL'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
131	G-5/0022	FILTRO DE DIESEL WK723  'COMPRESORA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
132	G-5/0023	FILTRO DE DIESEL 1R-0753 'PALA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
133	G-5/0024	FILTRO DE DIESEL P551424 'COMP. AMARILLA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
134	G-5/0025	FILTRO SEPARADOR DIESEL 151-2409 'PALA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
135	G-5/0026	CORREA 17X3048 B-120 'WINCHE-80'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
136	G-5/0027	CORREA AX-32 'PALA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
137	G-5/0028	CORREA A-52 'PALA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
138	G-5/0029	CORREA A-72  'PALA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
139	G-5/0030	FILTRO DE DIESEL WK1060/1  'BARRA'	Filtros y Correas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
149	G-6/0009	CASCO MINERO CAFÉ	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
150	G-6/0010	BOTAS DE GOMA '38'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
151	G-6/0011	BOTAS DE GOMA '39'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
152	G-6/0012	BOTAS DE GOMA '40'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
153	G-6/0013	BOTAS DE GOMA '41'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
154	G-6/0014	ARNES DE SEGURIDAD	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
155	G-6/0015	GUANTES CON GOMA	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
156	G-6/0016	LAMPARAS	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
157	G-6/0017	BUSO DESECHABLE TALLA 'M'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
158	G-6/0018	BUSO DESECHABLE TALLA 'L'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
159	G-6/0019	CHALECOS REFLECTIVOS TALLA 'M'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
160	G-6/0020	CHALECOS REFLECTIVOS TALLA 'L'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
161	G-6/0021	CHALECOS REFLECTIVOS TALLA 'XL'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
162	G-6/0022	POLARES TALLA 'M'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
163	G-6/0023	POLARES TALLA 'L'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
164	G-6/0024	DEPORTIVOS TALLA 'M'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
165	G-6/0025	DEPORTIVOS TALLA 'L'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
166	G-6/0026	CAPUCHON PARA CASCO	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
90	G-3/0023	STILLSON # 18	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
94	G-3/0027	NEUMÁTICO PARA CARRETILLA 3.50-8	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
99	G-3/0032	ESTUCHE DE ACCESORIOS COMPRESOR 'NEUMÁTICOS'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
167	G-6/0027	CABO DE VIDA DE UNA COLA	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
168	G-6/0028	CABO DE VIDA DE DOS COLAS	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
169	G-6/0029	SACO IMPERMEABLE TALLA 'XL'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
170	G-6/0030	PANTALON IMPERMEABLE TALLA 'XL'	Equipos de Protección Personal	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
191	G-7/0020	DESARMADOR A BATERIA "DYLLU"	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
196	G-7/0025	HIDROLAVADORA 'TRAMONTINA'	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
197	G-7/0026	SOLDADURA DE ESTAÑO EN HILO	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
198	G-7/0027	BATERIA BOSCH	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
199	G-7/0028	PASTA DE ESTAÑO EN SOLDADURA	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
200	G-7/0029	ENGRASADORA 5K "TRUPER"	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
201	G-7/0030	MOTOR DE ARRANQUE	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
221	G-9/0006	REFLECTOR LED 50W	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
222	G-9/0007	FOCO 9W	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
223	G-9/0008	INTERRUPTOR MIXTO	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
224	G-9/0009	ENCHUFE	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
193	G-7/0022	ESTUCHE DE SOLDAR "WELDING" NEGRO	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
194	G-7/0023	ESTUCHE DE TARRAJA "NEVA PROFESIONAL" 1/2 A 2 (6 UNIDADES)	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
92	G-3/0025	HOJAS DE SIERRA  '12'	Herramientas	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
192	G-7/0021	ESTUCHE DE LLAVES DADO "TAMAÑO PEQUEÑO TRAMONTINA"	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
225	G-9/0010	CINTA ELÉCTRICA	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
226	G-9/0011	CINTA ELÉCTRICA DE GOMA	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
227	G-9/0012	PRECINTO PLÁSTICO 5X300MM	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
228	G-9/0013	PRECINTO PLÁSTICO 4.8MM	Material Eléctrico	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
195	G-7/0024	MANGUERA DE OXÍGENO "COMPLETO"	Herramientas de Mecánica	\N	disponible	2026-07-20 00:04:29	2026-07-20 00:11:38
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_06_14_000001_create_roles_table	1
5	2026_06_14_000002_modify_users_table	1
6	2026_06_14_000003_create_proveedores_table	1
7	2026_06_14_000004_create_bocaminas_table	1
8	2026_06_14_000005_create_materiales_table	1
9	2026_06_14_000006_create_compras_table	1
10	2026_06_14_000007_create_detalle_compras_table	1
11	2026_06_14_000008_create_historial_operaciones_table	1
12	2026_06_14_135401_create_personal_access_tokens_table	1
13	2026_06_14_162134_drop_inventory_columns_from_materiales_table	1
14	2026_06_14_163733_add_codigo_and_observaciones_to_tables	1
15	2026_06_18_171110_create_maquinarias_table	1
16	2026_06_18_171111_create_gruas_table	1
17	2026_06_18_171111_create_vehiculos_table	1
18	2026_06_18_171112_create_tipo_mantenimientos_table	1
19	2026_06_18_171114_create_inspeccions_table	1
20	2026_06_18_171199_create_servicios_table	1
21	2026_06_18_171200_create_repuesto_servicios_table	1
22	2026_06_18_171201_create_costo_servicios_table	1
23	2026_06_24_173646_create_asignacion_transportes_table	1
24	2026_06_24_174559_create_permisos_table	1
25	2026_06_24_180500_add_logo_to_proveedores_table	1
26	2026_06_24_185523_create_alquiler_gruas_table	1
27	2026_06_24_190319_drop_gruas_table	1
28	2026_07_10_170000_add_soft_deletes_to_equipment_tables	1
29	2026_07_11_160000_add_imagen_to_materiales_table	1
30	2026_07_19_000000_create_respaldos_table	1
31	2026_07_19_184000_add_avatar_to_users_and_empresa_settings	1
32	2026_07_19_201017_add_trigram_index_to_users_nombre	1
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: permiso_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permiso_user (permiso_id, user_id) FROM stdin;
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	bocaminas	Gestión de Bocaminas del sistema.	2026-07-20 00:04:27	2026-07-20 00:04:27
2	proveedores	Gestión de Proveedores.	2026-07-20 00:04:27	2026-07-20 00:04:27
3	materiales	Gestión de Inventario y Materiales.	2026-07-20 00:04:27	2026-07-20 00:04:27
4	compras	Gestión de Compras y Adquisiciones.	2026-07-20 00:04:27	2026-07-20 00:04:27
5	servicios	Gestión de Maquinaria, Grúas, Vehículos, Mantenimientos e Inspecciones.	2026-07-20 00:04:27	2026-07-20 00:04:27
6	reportes	Ver Reportes, Gráficos y Costos del Sistema.	2026-07-20 00:04:27	2026-07-20 00:04:27
7	auditoria	Ver Auditoría del Sistema (Historial/Bitácora).	2026-07-20 00:04:27	2026-07-20 00:04:27
8	solo_lectura	Forzar todas las operaciones a modo consulta (sin editar ni eliminar).	2026-07-20 00:04:27	2026-07-20 00:04:27
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (id, nombre, telefono, direccion, email, nit, estado, created_at, updated_at, observaciones, logo) FROM stdin;
1	Maquinarias Mineras S.A.	2223344	\N	\N	10203040	t	2026-07-20 00:04:28	2026-07-20 00:04:28	\N	\N
2	Herramientas del Sur Ltda.	5556677	\N	\N	50607080	t	2026-07-20 00:04:28	2026-07-20 00:04:28	\N	\N
3	Insumos Industriales S.R.L.	8889900	\N	\N	90102030	t	2026-07-20 00:04:28	2026-07-20 00:04:28	\N	\N
54	Minera Proveedora Cypress S.A.	+591 72345678	Av. Simón Bolívar #1234, Potosí, Bolivia	\N	1234567890	t	2026-07-19 20:37:39	2026-07-19 20:37:39	\N	\N
\.


--
-- Data for Name: repuesto_servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repuesto_servicios (id, servicio_id, material_id, cantidad, costo_unitario, created_at, updated_at) FROM stdin;
1	1	9	3.00	55.00	2026-07-20 00:04:29	2026-07-20 00:04:29
2	1	132	4.00	50.00	2026-07-20 00:04:29	2026-07-20 00:04:29
3	1	175	4.00	143.00	2026-07-20 00:04:29	2026-07-20 00:04:29
4	2	186	4.00	33.00	2026-07-20 00:04:29	2026-07-20 00:04:29
5	2	237	4.00	130.00	2026-07-20 00:04:29	2026-07-20 00:04:29
6	4	31	2.00	96.00	2026-07-20 00:04:29	2026-07-20 00:04:29
7	4	177	2.00	159.00	2026-07-20 00:04:29	2026-07-20 00:04:29
8	5	104	5.00	60.00	2026-07-20 00:04:29	2026-07-20 00:04:29
9	5	118	4.00	107.00	2026-07-20 00:04:29	2026-07-20 00:04:29
10	5	131	4.00	119.00	2026-07-20 00:04:29	2026-07-20 00:04:29
11	7	20	3.00	194.00	2026-07-20 00:04:29	2026-07-20 00:04:29
12	8	157	3.00	77.00	2026-07-20 00:04:29	2026-07-20 00:04:29
13	8	221	5.00	32.00	2026-07-20 00:04:29	2026-07-20 00:04:29
14	10	71	1.00	89.00	2026-07-20 00:04:29	2026-07-20 00:04:29
15	11	236	4.00	56.00	2026-07-20 00:04:29	2026-07-20 00:04:29
16	13	93	3.00	170.00	2026-07-20 00:04:29	2026-07-20 00:04:29
17	14	22	5.00	81.00	2026-07-20 00:04:29	2026-07-20 00:04:29
18	14	186	1.00	39.00	2026-07-20 00:04:29	2026-07-20 00:04:29
\.


--
-- Data for Name: respaldos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.respaldos (id, nombre_archivo, tipo, tamano, estado, creado_por, created_at, updated_at) FROM stdin;
9	backup_2026-07-20_00-17-55.zip	manual	810199	completado	1	2026-07-20 00:17:56	2026-07-20 00:17:56
22	backup_2026-07-19_20-33-52.zip	manual	833578	completado	1	2026-07-19 20:33:52	2026-07-19 20:33:52
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Administrador General	\N	2026-07-20 00:04:27	2026-07-20 00:04:27
2	Gerencia	\N	2026-07-20 00:04:27	2026-07-20 00:04:27
3	Compras	\N	2026-07-20 00:04:27	2026-07-20 00:04:27
4	Supervisor Bocamina	\N	2026-07-20 00:04:27	2026-07-20 00:04:27
5	Contabilidad	\N	2026-07-20 00:04:27	2026-07-20 00:04:27
6	Consulta	\N	2026-07-20 00:04:27	2026-07-20 00:04:27
\.


--
-- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicios (id, codigo, fecha, hora, usuario_registro_id, responsable_id, estado, equipo_tipo, equipo_id, boca_mina_id, ubicacion_detalle, tipo_mantenimiento_id, descripcion, fallas, solucion, observaciones, created_at, updated_at, deleted_at) FROM stdin;
1	SRV-0001	2026-06-30	09:56:00	1	1	Finalizado	App\\Models\\Maquinaria	10	4	\N	5	Servicio técnico periódico programado para asegurar vida útil.	Ruidos anormales en rodajes y falta de engrase en juntas.	Engrase a presión de rodamientos de transmisión y juntas cardánicas.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
2	SRV-0002	2026-07-06	13:48:00	1	1	Finalizado	App\\Models\\Vehiculo	9	5	\N	2	Servicio técnico periódico programado para asegurar vida útil.	Filtros de aire completamente saturados y caída de rendimiento.	Limpieza de ductos de admisión y colocación de nuevos filtros de aire y aceite.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
3	SRV-0003	2026-07-17	17:53:00	1	1	Pendiente	App\\Models\\Maquinaria	10	2	\N	3	Servicio técnico periódico programado para asegurar vida útil.	Filtros de aire completamente saturados y caída de rendimiento.	Limpieza de ductos de admisión y colocación de nuevos filtros de aire y aceite.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
4	SRV-0004	2026-07-01	14:52:00	1	1	Finalizado	App\\Models\\Maquinaria	3	4	\N	4	Servicio técnico periódico programado para asegurar vida útil.	Ruidos anormales en rodajes y falta de engrase en juntas.	Engrase a presión de rodamientos de transmisión y juntas cardánicas.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
5	SRV-0005	2026-07-18	08:48:00	1	1	Finalizado	App\\Models\\Maquinaria	3	6	\N	4	Servicio técnico periódico programado para asegurar vida útil.	Fuga de fluido hidráulico en mangueras de presión.	Cambio completo de mangueras hidráulicas de 3/4 pulgadas y purgado de aire.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
6	SRV-0006	2026-06-12	10:06:00	1	1	Pendiente	App\\Models\\Maquinaria	9	1	\N	1	Servicio técnico periódico programado para asegurar vida útil.	Filtros de aire completamente saturados y caída de rendimiento.	Limpieza de ductos de admisión y colocación de nuevos filtros de aire y aceite.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
7	SRV-0007	2026-07-06	13:08:00	1	1	Finalizado	App\\Models\\Vehiculo	5	6	\N	2	Servicio técnico periódico programado para asegurar vida útil.	Fuga de fluido hidráulico en mangueras de presión.	Cambio completo de mangueras hidráulicas de 3/4 pulgadas y purgado de aire.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
8	SRV-0008	2026-06-30	11:54:00	1	1	Finalizado	App\\Models\\Maquinaria	8	4	\N	5	Servicio técnico periódico programado para asegurar vida útil.	Arranque difícil en frío y desgaste de bujías/calentadores.	Instalación de kit de mantenimiento de motor, cambio de calentadores y revisión de inyectores.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
9	SRV-0009	2026-07-15	17:54:00	1	1	Pendiente	App\\Models\\Vehiculo	3	3	\N	4	Servicio técnico periódico programado para asegurar vida útil.	Arranque difícil en frío y desgaste de bujías/calentadores.	Instalación de kit de mantenimiento de motor, cambio de calentadores y revisión de inyectores.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
10	SRV-0010	2026-06-30	13:35:00	1	1	Finalizado	App\\Models\\Maquinaria	7	2	\N	3	Servicio técnico periódico programado para asegurar vida útil.	Filtros de aire completamente saturados y caída de rendimiento.	Limpieza de ductos de admisión y colocación de nuevos filtros de aire y aceite.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
11	SRV-0011	2026-06-19	13:11:00	1	1	Finalizado	App\\Models\\Vehiculo	3	4	\N	1	Servicio técnico periódico programado para asegurar vida útil.	Filtros de aire completamente saturados y caída de rendimiento.	Limpieza de ductos de admisión y colocación de nuevos filtros de aire y aceite.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
12	SRV-0012	2026-07-08	17:36:00	1	1	Pendiente	App\\Models\\Vehiculo	8	1	\N	1	Servicio técnico periódico programado para asegurar vida útil.	Fuga de fluido hidráulico en mangueras de presión.	Cambio completo de mangueras hidráulicas de 3/4 pulgadas y purgado de aire.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
13	SRV-0013	2026-06-27	15:07:00	1	1	Finalizado	App\\Models\\Vehiculo	7	4	\N	2	Servicio técnico periódico programado para asegurar vida útil.	Desgaste severo de pastillas de freno y zapatas.	Reemplazo de pastillas y zapatas de freno por repuestos nuevos homologados.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
14	SRV-0014	2026-07-02	09:10:00	1	1	Finalizado	App\\Models\\Maquinaria	6	3	\N	3	Servicio técnico periódico programado para asegurar vida útil.	Arranque difícil en frío y desgaste de bujías/calentadores.	Instalación de kit de mantenimiento de motor, cambio de calentadores y revisión de inyectores.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
15	SRV-0015	2026-06-09	09:08:00	1	1	Pendiente	App\\Models\\Maquinaria	6	5	\N	4	Servicio técnico periódico programado para asegurar vida útil.	Arranque difícil en frío y desgaste de bujías/calentadores.	Instalación de kit de mantenimiento de motor, cambio de calentadores y revisión de inyectores.	Inspección técnica general posterior al servicio arrojó resultados óptimos.	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
G9tbToVxJ7ucvMI44ReDtot2LSRnlpMiEojyBbPQ	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJakpZUjBOSVFXdzFiMlIzUVhZeGVHMUhOV3RhWWxFOVBTSXNJblpoYkhWbElqb2lRbUZNZFRoUU4zWTBjeTlPZW5KVWEzTjBiMVpWVlZSa2JEbHdVMk5tTlVabWJTOWpTMmRIUWtsWVoxbDVabmxXV0dwR01VSkRVRXB5VlV4alpGcFVRbTA0TmxKa1ZqWkNhRTQwVGxCVFIzTmxPVU5zTHpKR05uQXdXSE5HUlVKek5TdFhiVTgzUkZwcGVDOW9VVWRWWVVvd1VUbDJPVnBOUm5aUGRHOUVkVlVpTENKdFlXTWlPaUl3TURKbE9XVTJNRFZrWWpjek5ERmxaalZsTVRSaVkyRTFNR1k1WlRoalptTTFNV1ZsTW1JM016TTVOV1EzTmpFd09UWmpNVE5rTURJell6TTJPRFl4SWl3aWRHRm5Jam9pSW4wPQ==	1784507657
sJ3EmDHfBxMgPNVS7fggh1V7J9te8mLWsj0ewBWv	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa3hLTm5kM1pHaGhjbGxEUlUwdk1TdDRVbm8ySzFFOVBTSXNJblpoYkhWbElqb2lOSE5VZW5CTWIwUndjSEJoTW1VNFVYcHBVMVE1VVc1SlpWVTJkRUpuTW14SE1Hb3dLMUJ3TjBVeVoxZHhaazFrWWtSTU9VOTVkeXRYT1dGalFYaDVaVFZDWlZBMk0yOXRjelJxVG05V1JXOUtTV05ZY3pobGRGSjVLMFI1YTFGbFpFaEdTa042UkhoR2VqaHpORUppVW1Kck5FSlZiMDQyUjJKRmMwSTRRVWtpTENKdFlXTWlPaUl5WmpVMU1qSXdOakEzTkdOa1pUY3laakEwTldNelpUazVPREE1WkRkaVpXWXdOalU0WWpSak9EZGhObU16TWpJNU5tSTBPR0kwTjJVMFl6TTBZemcwSWl3aWRHRm5Jam9pSW4wPQ==	1784507758
6bJqybMTyDasGh6lYewi7kBZIyYJPaCBwHpI67cX	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbEkxTVdSVGExUkpjVUpDWkNzdk1EWnhNVXBSYzJjOVBTSXNJblpoYkhWbElqb2lTVVJEVGtFdlRYQnlSaXM0WkZBeEsyVkZaRXB5UVZKd01tWkVRV1U1V1U1UVRETXJiRFJYUTJ0V2JrVklNQ3MzVGtSV2JXaHpVR1ptUVVWbk4yUlNSSEJMZWtwdlRYWkdiM3BpY0hwRWVrbHBObW92TW1wRWRYSlBOaXRhVVVkSFp6VlpTa2x4U0dWWkszRTNNemN2ZVdkWmNqVnFORWQ0VWs1V2JtMU1TRXNpTENKdFlXTWlPaUl5TXpSbU9UQmxPR00xWXpjNE5UTXhOamhpTTJNeU1UTmxORGc0WWpSaFpqSTFOVEJpTnpZek1tVTNOakptTVRFMVpHSTJPR1ZsWmpVek1XTXdNRFpoSWl3aWRHRm5Jam9pSW4wPQ==	1784507758
ewaHc9Fp7TR9mwmYjLVTll1q7ZPpAAL4YinV0BCZ	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa1pqUWxCMGVFSk9WMWs1V0hkT2NrNHhRamd3Y0hjOVBTSXNJblpoYkhWbElqb2lUMUZxV2pOb1ZqZDRTVEpUTXprMlYzcHdSR2h0UldSdWVrazFWVFoyUkhCSE5rbHplbkpoVlZWTU5sTklSRWhMTmxKTGJXZHFjWHBqYlhNNE1FMUxPV3hUYVhKNmEzaEJUMWxQTm1WVlFWTnJhVzEzWkhGTk5qVnRhRnBTTWs1bGVVSnBWa3h6UzFOemNuZzFZMUJpYWxCelFUSnNURTVXZFVZMFJUWnRXV2dpTENKdFlXTWlPaUkwTW1RMU9XRmtNRGcxWXpBMllqQmxaV1kxWXprMFlUQXpZV015WkRZeE9ETmhNMlF5T0dFd1ptVm1ZVFZtTURsbFpXTmlNR1U0Tm1NME5HUm1aRGcxSWl3aWRHRm5Jam9pSW4wPQ==	1784507759
Im6yrDPNOfdxUPUVstiK5BrVLo3jOzRtMFHQe4Rj	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	ZXlKcGRpSTZJa2cyS3pGNU1XMTVZakpYZW5kVFVtcFNVRzUxY0hjOVBTSXNJblpoYkhWbElqb2lNbGd2WmpZek9YcHpWbUpwUlZjeE5FUm5TbVF6YW1ad2FVRjFiVmROVWsxVFkyMWhNa3RwZG5oMlNrVlJXa1pzYlU1MWRtRlhUbWg1ZGxOclYyOHhjREI2TkRKcGVrRTNPRWw0UzBWT1NrMUhhekF2ZHpkaFdWRkRjRUZvV0VvMlptMXBTRXAzTDBSUVNIRk9ZbVJDTkhJNFVWSjVUVkF3ZDBKSk5FZ3JPWHBoYmxCdmNFOUdNelpoWWpCeVFVTkhjVkpxYWpoYVQzSXZkR3BMWldORGJWQldibWgxVURKbFdtTkdjRE41UWtGeE5GRjZLMGQ1VGtkcU9ITnFNbmRtUWprNVdGaFBWMnd2TDJFeWVEYzFTV3h5TldkS2JUTTJkWFZzU0VkTFVtRk9ORzFzVW1WcGJGazFVMVI0WWprelJtODFVMHRVZFhoclZFTkRhVXAxVURsNVJXTnhlV1ZLT1hsalQwNUNTMDFqYTAxU2NIaFNRMDlyU1RORE5tOVVkMUZGWTIxTE1YTktRV1l2ZFd0VlZXRktZMEoxY0Vob1UzcERaRVZ4Y1RJaUxDSnRZV01pT2lJME9XRXhaRE01TnpOaFpqUXhNekpsTldNNU5qQmpabVZsTldGak1URTBaRFJsTTJFelpqUTFNVFk1TVdNek5EVXlNalZrWXpSaFlUSXpOR0ZrTVdZNElpd2lkR0ZuSWpvaUluMD0=	1784507464
Nostd7CAuJZ4Elt82fUKxqNZbZNb72VTHRZcbgKC	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbE52TkdSc1MwVlFaV2h0V21OUVdUaHVaa1IxYkZFOVBTSXNJblpoYkhWbElqb2lVMnhMYVROSlNrNW5PR2hVYVhkaGMxVkZTM0Z6YUVRM1NtbEdiRzFUZFcxYUsxTkpMMFowWkdaUVdscHZOeXRLV2xsU1psbExhbUpJU1VSclVYcGpTV3MxY2twVGFqUnRlbmx4ZG0xM1YwcDJRM1ZyWjJsSk5VWkNRMjV4SzNCRlJreHJTM0p6V1RKVk16ZHBXRmg2VkcxbFJDdDVNQzl6T1hGTmRUQXhWWEFpTENKdFlXTWlPaUkwTUdSbE5ERTVNVE5qT0RRMFpUYzBZall6TURZNE5EWmlNMkkxTVdOaVptWTVNekl3TVdVeU5qRTJOakkyWmpVd00yTm1ZVGhsTnpjeE1XTTBNRFl6SWl3aWRHRm5Jam9pSW4wPQ==	1784507627
bRJ0Platz0UkujZ7Hd0EnJ8uDMHp6Iw0DfEaFkHi	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJblpuWldZMU0zQllOemgwUzNkdmRYcG5PQ3R5TDNjOVBTSXNJblpoYkhWbElqb2lXVTVEU0VacldFbE9ObEI1VEhZMU9EYzBPRXB1ZG1saU9WQjRjazlLZUhZM1ZWVlVWWGt2TjNCS2JVdHRkM1ZVT1djeVFUWlpWRGxWVmt4U2JURjRlR0YxY0dkdlYwRXdPVmhPU0dWcVIyTlBPV2MwVVd3MVV6UkZiRlJWU1hkWlFUaDNWR0Z6YzBJNFkwZDZWMjlNYUhWUFdrbEpSV051YkZCSWJYZDRiMElpTENKdFlXTWlPaUkxTWpGaVpERmtPR0kyTTJKak9HTXdNRGhrTUdFd01UTXlOREkwTlRNNE5UQTJPVEkwWTJaaU1XVTFNemsxWkdNMFpqbGxOek00WkRreFpUUXhaakZsSWl3aWRHRm5Jam9pSW4wPQ==	1784507630
fEtMQaYQn1hVnws33HoYyxUhXTUAQ0LUNuNjMkQ5	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJalJWUkZGcE9FRjNiWGg2UlM5NGRYZEJkM1F4U21jOVBTSXNJblpoYkhWbElqb2lTbU5xZUV4TWVDdDFPRVJ3ZVRSdU5UYzRWVVVyUldzM09YVlplVVpvTTFCb2MxWk9TVzlDWldkNmIwcEVVR2RoTW1sc1dVUlhOVFE1ZW5WR1NXNHJVMUk1VVRscE5qUjZUakJHWjAxbVkzTXdXakYzTTJWTlJGcFNkbkJtZWs1NE1qRnJLMU50VjFKb1VISktWMUpaYTB4eEx6WTVSWG9yWWs1cFNYZFpVMGh6YkhRMFZ5dFRXRWRzUmtsVFVGbDViVFpqUlVSYVdHOXVhVWd5T1RkdFZXWnlWSEppYVhnM2EzUnZWazg0UTNST1pIRTNWWEE0UjJaWE4yNWpNMDFNTTA1MFZIRmFabEl5ZDBZclRWcHVjSFU0WjIwMGMwcEJUVEJzYjJaemRUbFlVamROUWxwUGJ6QnNNSGh2VjJOcWExUlpTbkZtVlU1QmFuSkpNMDVuWVhKSVRYWkViV1UyVWs5YVpIbE1hVlpEV0dVcmJYSmxSazUyYUhWaFJWTnRZbTluYWsxd1FYSTVXbmx4TVhGTWFHWktOVmgwSzNnM09HdzFhbWh2YjFFaUxDSnRZV01pT2lKbE5UUmxOVGxqTURNNU56WTVNV0ppTkRnMk1qSmhOVGs1TkRVM05EVmhZbUUxTVRsak1EaGtNR1JrWXpNMVlURTVNVEZsWkRobU1HRXpOVEZqTTJJM0lpd2lkR0ZuSWpvaUluMD0=	1784507599
KV6TWspjNFIRKKTC9eojzYQJZNz24sBXiYGOzCip	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJazFSVkZSdFJqWlVPVVU0VGxGeFRHaGhNVmc1YzJjOVBTSXNJblpoYkhWbElqb2lLM1Z1WW1KTU1Fd3pabWwzTTJsQmJFUTBOa2x5UnpCb1YxTkNNVEpUT1dONmVsWjBOMk50V1VsWFYxQlpOMnRoWTFSMVdXeDFSMFJMTm01dVQyWm5NRlF2U2pkcU9WbzVja3RTZEdWM1NrNUxjWGcxWWpabmVUbDZaa3N2VjNKdFRERmhTVUpvY0hveGF6Vk1jWEpwYkV4M05UZFZWRlowTVZocVltTkpTR2haU0hvelN6RXlOR3d4ZG05Uk5YQkViMnhoVEdWWmNHcFhaV2hrV1VScU1tNUpjM2g2TmtNMFExaDNla3huZEhwd04wb3dNR1pQTkZweGJ6TTNRek12TWs5VVExZFZkSGhTZWpVM09XdDVVblJGY2tsTll5dEhaSFJHUlRoWmNuaDNOV3d6YlRSRlZ6QmpOekZoTUd0aVVuRjNVM05KWlcxR1FqQkdZVGR3SzFFMVkxQktPR2R6Y0RFMVZHWkdaMGhHWjNOMFpFWlBWbGxrVHpsU2MyUnJaREJuZDFSRmQyeE9SM0oxY1RSTlduaHROMWRyTm01WmEwUnpZbVkwTUZZaUxDSnRZV01pT2lKbE1UZzFOamN3WXpObU1Ea3pOVEptWldSbFpqbGtObVF4TUdWaVpHTTVZakU0WkRZMVpHUmhZamd3TTJGbFlXTTJOREJsWWpBNU9EWTVOemN4TVRZeElpd2lkR0ZuSWpvaUluMD0=	1784507633
yxPS6eSkGLbvvhE3WLaGkFMMpxcOVqB69BbKdsaT	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa2sxVkVvNE5FZHNiRmhzTVdaT1pWSk1kMXA1UTJjOVBTSXNJblpoYkhWbElqb2lha0p3UldSaldubzBiRllyUzBwb1REaHBTVUYxV2toSmRXbElNSEJtVlVwS1VVTlRlVVJVVmpJNFFURmFkRzF5Tkc1NVEyTm1aRU5SVWs5dVpscERUbWRqZWtwemNYY3ZkWGRHVEZOM1YxZ3lWVGhYTlZWRFJ6TnhUMUpuVFRabVpHOXdhVGN3Y210NFYweFBWMmtyZVN0R2NscERiRVpzT1ZSbVNuQm5lallpTENKdFlXTWlPaUl3TldJM05qUTRPRFpqWlRjMlpEazJZVFpqTm1SbU5qRTJPVEZoWWpJMk5tUXdPVE0wTURjM056SmhZemcwTUdRd056YzRZalk1TkdZeVpUaGlOV0kxSWl3aWRHRm5Jam9pSW4wPQ==	1784507645
F5lcYOo7YAzA4RzEBBQlicYgaTniTIiUfPAFYhh0	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa2xzU210T2FEVlVPR1pwWVVKTFRYRnRVelJwWmtFOVBTSXNJblpoYkhWbElqb2lkVXN4T1Roa2MxVlBia0pvTVdaVk5HRkhZVGMxVFZSR2FHZHVSRWN6YURWMWJUWTRMMEZSY1ZKcFVrNVJVVEZQT1d0cEwxYzNOelpQTDBSb1ozSlhUWGcwWkhsMFkxQkNiVEY0U1VjNWIxUmlhbWRGT1VoemVUQnhaSFpoTUhKWUwxQTRaRXRrWkVSYWExbHNjV2RJV25sNmJEaGpkR2xTVEhwbVpVbzBaaXNpTENKdFlXTWlPaUl3T1dJMk1USXhNR1ZqWkRNeU1ETTBZVGRoTVRFek16WTBaV0kxTUdWaU1tWmlNMlUwTkRZMllqQmxaREUxWWpFMlptWm1ZVFZrTWprME5UWTNPRGhqSWl3aWRHRm5Jam9pSW4wPQ==	1784507580
UfefxX4LMX2VarrlWGIP1RxJfhHIlWFv7oOxAosn	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJakp1TVhCaGF6ZGhSekJGZG1KbE9VSlBlR2xWTW5jOVBTSXNJblpoYkhWbElqb2lUbEZZTlRjdmJFMWFZa1F3Y0hwQ1VXeFpWMjgxWkhOME5FVkRRM1pFUkV0bmRGSkhUMDUxZWxjM1VFOU1LMkZOU0hodFZUZDZTSEJ1TkdwNk1IcHVMMlZqU1dJeGN6VmFlRmhaUjBzdlRVbzBaa2t5V0U5WlRqY3ZRbnBNVEd4UlVtRnhZMjExYXpWSmNESXlaVlk0WTFWclRuSm9PR2huVWpSNlVuVmFjRGtpTENKdFlXTWlPaUkwTVRVeU1UazBOV0k1WWpVMFlqQTJNRFkxTkdSallqUXdPR1k1WkRObFl6azBZV0l3TjJZelpESmhOREZpTWpFek1UVXdabUZqWldSa1pqZ3dOakExSWl3aWRHRm5Jam9pSW4wPQ==	1784507603
NSfZfKPMXzxM0SwoVIjw4PqrsXr0K1O57c9DzoHN	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbmhNUTBoeldXZFBkVTUxYjFBMFNYUnVkVUpFZWtFOVBTSXNJblpoYkhWbElqb2ljSE16VEN0dFJFc3lRMlZ1VEd0dlRWb3dkSGhXYm1wa2VHeEJXV0ZEU2tWd0wzQXpZakUyTUdGUWJEWXhaM0kwV0ZaYWVpOWhlRXc0YkhoSFRHOHhhWE5hV1cweUwwRmFWVFJ0UXpCTVZtTnNaR05wUXpkU1pVeDNORVp3Tmk5RlYyNDBXV2xNWlc1MllqWnFWSGxzWjJkb1JqVm1RVThyUzBaRmFGcHdkVkVpTENKdFlXTWlPaUpsTlRoaE5qRXpNVGd4Tm1VMU16VTVaRGc0TkdZM1pUaGxOV0ZsTTJVek5USmlZMlE1Tnpaa01HSmlPR05oTVRjMU0yUXdZMlJoT0RZME5UVmxPR014SWl3aWRHRm5Jam9pSW4wPQ==	1784507672
H6rxzcUtcqidG0JsriIdYOyGnhuXDqnChs4MDLV2	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbE13WTJaSFJtZFFZMHBSVmtOUU1qWlJUMnRFTWtFOVBTSXNJblpoYkhWbElqb2laMWxyU2tkSVJrOUhkSFJEVkVKNE1qWnJjVkkwUzI1TWNHWTFiVWRMTkhWYVJXTk9PV280VGtjNVZTdGtSeTh4VXpKWVdEWlNZakZaVDBGa09WcExUMGhhVUROMlRqVlRheXRpVTJkcVZWUnhaa00zZFhGUGEyTnpNRWRVVVhkdE5EaG5ka1JEY1RWV1dWaDBOMEZ6ZDBZeGMzUjBZMmNyVlZwdU1HaGlaMUVpTENKdFlXTWlPaUkwWXpnMlpqbGhORGxoTXpkbU5XWmlZV000TW1Wa05UWTNZakUyTnpFelpUUmtZbVU0TldSa01qQTBaRFpoWmpFellqSmhOalEzWm1WbE56ZzRPVGhoSWl3aWRHRm5Jam9pSW4wPQ==	1784507758
S9TThgbuV7nD2KnegLbU0uP4679ROiGbaXOshFJK	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa0V5VURkRk9UQlNZalUzUVV0MlNXVnJNM0pNWjNjOVBTSXNJblpoYkhWbElqb2laMFpsV0VVMlpXa3hUM1pIZEdaTFZVNXJkVEZIVG1sQ01sTmxkekJPWlRWRUwwWk1NM040SzJZeWFsQlpTMlpKUnpORFdsZElkWFZ2U0VKT2MzRXlNREpMZDI5eEwxUm1NWFJIWkdwT2RXNXRUV1JGZG5Cb0wxWlhUbk5OYVhka1NucG1jVmQzVDJnNEwweGlhREUxZUVKblpHczBhMGswTkdOaFltdFBkM1ZKWm01aVZFVjRPREYzTkZCc1ozZ3pLekZPYmpaUVdXcHhja3hUTmxoRk1Ib3pRVFpxWjJKSVExVkVhM2xoWVhoYVpYaGpkMGhyYjBWUlZFeHBjRVZ5YXpoVVlXaGhWakZVVkRGSmVEQkZVV3RTTW5aUUwxVmxhM2RXWWprMmJpdGhVRmx3Tmt3M2MxQXZNMDF0VG5GQlF6WkxObUpRUkVWWFJuVmlUbFZXT0ZCdGNWVkpRMGsyUnpsd0wwMUlVbm8wUWxKSmJWZDJSMkpNWWt0amFrdFpObTE2U0dseldUQXpXa001V0U5VWNHaDZSV1pHYUNzeFdIa3dkblJtTWxJaUxDSnRZV01pT2lJek9UWTJZakl3TlRZMk1qQmxZems1TURJMFlqRm1ZbVUwTVdKak1qazBOVGcxTjJRek5EQmxOR015TVdJME9ERTVaRFkwTjJJd1lqaGtPR1V6WlRnNUlpd2lkR0ZuSWpvaUluMD0=	1784507630
PktFgbzMCtMJPD24Im46DDn92TSHsB4EkaEYMfWU	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbVZDWjB4T1MxcHJkRWw2T1doUGEwcDZPVU5UWkVFOVBTSXNJblpoYkhWbElqb2lkRmM1U0dadFVqUkhkMEZQVkdsYWNHeFhjbVZrZVVsSEwxaEZPWFpZVDFWWVpsRlNUV2xFWWs1VVUzQk1LemMyTkZnNFRVVTRha2hhTXpKNVNGVlFSMFZEVEhWSGNTOW1lV3BzZGtsMFRFbzVOeTh3TkZWTWRXeG5aR000WlhVd2NXeE9lR0U1UWxGMWVrbFJjRmxMWkdkd1J6UlBVM3BRTmtwWlFqaFJOaTg1UlZkc1dtSXhZMG94WTBsd1ZXWnFVWHBpZDFwUlQySk1UbTlLU1VoaWVtZEdURUl4V0hKblNuRklRV2hNVkdkcFIyUlhTalZEZFM4dmVERmFaWEIzVWpCS1FuSjRjbFp2TlVOS1lVZ3lVSEJVWlVsUVJuUTROVGRrZFhsV1dFaFlWU3N3U1ZabmFHSlJLM0p3YzFsS01uUnhMMHBXZGt4RVZWQlZURkp0ZFc1WmFpdHlaRVJQV2tWdGFDOTBLemREYTBOWll6bDVibHBJY3paRVVsRXhUVVpuTkVwTGJtcEZkMWhNSzJwQ2NIUlVkaTgwYVVoR1ExSmxkMjlPWjBzaUxDSnRZV01pT2lKallUQTVPR0ZpWVdGbU9UZ3paV0k1WWpKbE16RXhNelEwTVRZek1XUTVaVGsxWW1SbU5XUTNNV1UyTTJReE5XVTVNR1JsWVdZeU4yVTBZamt4WXpjMklpd2lkR0ZuSWpvaUluMD0=	1784507624
GZtCbyZsnGg36M4FN1dkwwoznOva4sbhNEg1BQXy	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJamhwYVZwa2IzUmplRWg0Y1RGUVdYbDZkRnBRU25jOVBTSXNJblpoYkhWbElqb2laVVJQUTFWaU5Va3JSRWg1UjNWM1RFOWFhVW96WkU5eWFsbGtOa05TV0dWMWVHRlBTVTl2YmtOUk0yUnJZVTFPYVVKcGFFSXdlRVZGV2tsYU1YZDVjRUpEVTNKV1JWcE9WV2hSU2xaWVNGQlpZbEpSTkd3eFVYTkxPVlJtTDFGdlJIWnFOelprT0hoNlJGRkVkbmcyUjNCSlR6aGlZVkprTkdVeE9VSkJabU1pTENKdFlXTWlPaUkxTXpCaE9USTBNamt4WkRZNU1tVm1NalZoTm1WaVlqZzJPVE5qWlRjNE0ySXlOalV3TURjME1ESmhaR1JoTm1Sak5XSTBOamd4TXpGaU1UUXpOelUzSWl3aWRHRm5Jam9pSW4wPQ==	1784507633
85UgSvYPDxJVTpGMgtXT6Ehxc0BwoETJcNypOi5H	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJalJyU0ZSSldqbExiRTkzV0V3NGIwSTVUMkZOWVhjOVBTSXNJblpoYkhWbElqb2lPSGxYWnpCVlZVWnJVelZNVjFGdWFIUmFXRUZKTVRsS2FYWXlkbmxQSzNvd2VtSnBaV1ZHYTJsU09YQm5aRTVOWTNZNVdsTkRkbWRTVjFGQ09TczVSSFJtYlU5T2JHTXdPRmxLT0ZKa2MwTkJVRGd2U1ZOUWJVeFJOa2RVVldrclMwZEpSemgyVFVRclpGTmxNVmxYUWtVMmJrVk9NemhaU1ZodllrcExjRTR4YkVOSWJqUXlMMWgyWkUwMlFuQnRWRlV2UmpkemRsUnZkMVV6Y2toWFlVbzNlV052VGtGSWJWUTFiazlNWW1NeVp5dE1WVEV5TldWcmVYWlZkMGxpUm5SQ1ZXZHhSVkpCTkRVMVVUaEZORkIxVUdGYWQxcHhSbFpWYUVkWlUzTmhWVFZ1TjBJclIwMUxiSFV3T0hOemRWcHdTMHMwTVhGdlpqZHJVM2hTV2xSU1JFSkxNa1pVVFV4eE0wWjRRbkZEUmtwc01tSnRRemswTDBaTE9VWkdOVEJwV0VKbmRDOXZjalZZVkdjNU0xWXJiamdyZUdaRmVVWXJkSEEzUkZVaUxDSnRZV01pT2lJMk56azNOREF5TW1FM016TTVZemMyWkdZNE1EVTFNbVF5T1dJM05qUmxNbUV5TlRkaE1EazVPVEUxWlRreU9EazRNR1JoT0dWalptRXdPR05sWVdJeUlpd2lkR0ZuSWpvaUluMD0=	1784507635
shfAb2V545xb4CmjufbkkLGRZUvog3CeRaUrZtTi	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJamt4YzFvd1NtUnVVREV4VjNjNGRrMVhjQ3RoWVhjOVBTSXNJblpoYkhWbElqb2lSSEJ2YzFveU5IRjBibWxPWXpWdFJWbFlSVUl2TDNoa1ZFeGtjSFYxYUZZMFdGbGpNbk0yYVVac1IwaExkVFF5Ukd0UFRGQXlkRk50YzJwaWMwaFZkRGxEY25kbWMzWkJiV0pIYlRKNFlWTlJRVTR6Y20xMlZ6WnlhamxQZGtWWVRFZzFNbE51YXpGMk1sVTRSbUZFVm01NlZXdFJUa1JqVW5GQ1IyNHJValJHUnpCSFdVcGFkM0F4U2pndk9FaFhZbUk1TVdkVlUzbHlaMng1Y1VFeFRtSlBaMlpVUldWNFYwNDVOelJhUW5kWk1tUnZNVzVOWnpOeWFqRnRiMG8yVmtKT1ZEVkVkMUZuUzB0V2MxcHdTR0ZsTVdJcmNDdFJVa05yTmtwU2NHNDRaME5QTkcxdmFVOXBia0lyTTBzdk4xaGFjbEJ0V1U5MVptUlpjMmxSUnpjNE5rbHdaalF6UVhwMlVVaG5kVGszUTFwdmJIQjRWR3hhV21NeGNuaHJjRXBFU2pCWlFtRnhWSFUzTTJNeGVYZFBZMEpyZG1wbkswUXhZMnQ0Y0ZvaUxDSnRZV01pT2lJMU5tRXhOMkUyTlRBelltRTNZV05pWldNMlptTmxZVEJpTVdVNU5XWTJaREJpWkRWak5qYzNORGt4TnpNNU1XTm1NMkkwT1dGaU56WmtZV013WkRreUlpd2lkR0ZuSWpvaUluMD0=	1784507647
qmuik8MpcWr2KF1KwWwhXQudTBZzeVPW6DQuIWPT	4	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbkZTYVZscllYSTFPVlp3VFhsbGNXZEhUM1pVWm5jOVBTSXNJblpoYkhWbElqb2lUMEZLVTBOc2JrSlNhWEpoUzNsTVNUQmFja2w1S3pkQ2FWQnFabHBxUkRCbk1IQkhMMEpSYlhrek5VZHViVFpCYlRsaWFXcDJSMEo1Y2xBMVptWjFXa0pCVG1KRWRtOVFUazFEYm5weGVFMWFhakJZYlRkek1HbG5jemR4VWtjM1ZXdHBiWE14Y25kYU1VbDRWalJpUW1kc2EyWm5aelJ2YWxsdk4yVm1ObGRIVFZsU2JpOHdPU3RaVVc1UlFscFJlVmhhYm5GUlVFUTFkRTEyY1hCdE1XMWlSRlJFU1hKYVJHOUdkMFYzVTFjeWJsa3ljR0pqVG01SWFWZHBUMVJuU2xKdFVFMTZOMGd3Vkc5dE4xRkpjM1ZyUVVaMVEzTnZUVWR2Um10QldtVmhTR1pNVWlzNWVXdFhPVE5rZVV0T2IzVmtkbVZ0WjNKNE5tdEVhMWgyTW1OWU5tOTZTRlZYWlhocGRITlZOMWxwZDBwUFZESlhUbUpTTldKdWNHMVZjVTlxYVdJNVdsSXdTVlV5VURCblNWaGhTRXhuZGpOS1RWSjBTM0Z1U0hjaUxDSnRZV01pT2lJNFlqSXlOVFl3TjJFd016QTJaVFJoWldKbU5XSmlaamxpWldFek5Ea3lNV014WkRsbU5UWTRNRFZpTXpNd056YzRaV1UzTjJRNU1tRTNPRFJoTURJMUlpd2lkR0ZuSWpvaUluMD0=	1784507659
ct5aE6byBUrCWiPI7RzE7Y8Mo8IMHxie8yN3b0RV	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbkpQWVVNdlkyeFZjak5tVHpVd1pFNDVVV1pXWm5jOVBTSXNJblpoYkhWbElqb2lhMGRaWVVZNVVrMXRSRkZPWmpOcVVXMDFTbXd4WkhCRE1FRXJNbEJGY2tObFpVbERTSEZFU1RCclpIWmpjamwzZFU5cGEzaGlVMWt2Y1VKM2RGcHdVMFZ5WVVkUlZtMUNSVEJXZW14UVpGVkZNamR4SzFsb1FsSTVRbk55UnpWdVRsQktZMUZsV0dKWE1tTnVTMk5YZDBOelEyUnlNbUpFYWxGSFN5czFhVVFpTENKdFlXTWlPaUkyTW1Nd01ERTBNalUxTlRVMVlUWXdZVFF4WXpsaU4yVXdPV05qTVRVM01qWmtaV1psTm1Rd1ltVTROV1V3WW1JME9HWTJZbUV4TnpBM1kySXhOekE0SWl3aWRHRm5Jam9pSW4wPQ==	1784507785
2M4d4caVkkLaeUFGnzXgm37aNLNklSpn5YT7B505	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbU56TTNwYWRrRXJURU41T0c5MVpYQnJhemRqVkhjOVBTSXNJblpoYkhWbElqb2lNMmxNZGt3eVJteDNZM0p3TTFoT1V6bE1MM0ZSWmxKVlVXcFlhMVZFVVZoVVRWVlpaVUpzU1RNdlZISklibEZFY1U0d1lXOVdhRkp2VXpWRmVtSXhTbk5OUzJkT1FVMHhNRmRVZDBSTFEybFlabEZSZEU1NGMyWnFjRFZXZFZaa1pYSTFSMFowUmxwS2VFTTRXV1l4TVdSemVHMVVhM1ZpVDA1Tk1GUXZaa3NpTENKdFlXTWlPaUpqWXpOa05XUmhaakJpWlRObFpHSXlaR1JtWm1ZelltUTNZekZqTURRelpXTXhaREF3WWpKbFpUUmpaV1l4TnpFMU5tSTVZekk1TkdJeU1EbGhOVGRrSWl3aWRHRm5Jam9pSW4wPQ==	1784507959
TuLqhKpSsuQYL2lTRpQf1QYn226ciwEL6CYv7kjV	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJazFZTVRsSU9VTmpXR0pyVEVjMlJtSXdTakJyY1VFOVBTSXNJblpoYkhWbElqb2lURFJ5T0VNdmN6VTVhMnBXYUZWWE1qSkJZaXRVYjNOQ2FFbDNWeTgxTW1SNVprSlRLMVJuVkdoMFIyWkNSbWhJU21sSU1URlNWMDlwV1VwcWVsRktiV0p6ZUdZd05VWkxSSGRXZW1jNWJsQm9kR2t2WkRkVU0yNXJiSGx1UWl0S2JVZDZhMGRpZFZkeWNFdHpkSGxxYTBrNU5GSXpSbHA0THpSeWRrdE1ZalFpTENKdFlXTWlPaUk1T1dKaVpUTTRNV0poWXpSaE56QTNNbU13TURKbE1UVXpNMkUyT0dWaU1HSm1abUkwTUdJelpEbGhPR0prWkdVeFptTmlPREJrWVRVNFpHVmtOR1EwSWl3aWRHRm5Jam9pSW4wPQ==	1784507836
XCLHpkwcZXWmfjvffj1btpVz8dX8UbMpcfIAYv8e	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbTh5VldWbVozQkROR1ZIVGxsM1VHMTFhRmRTT0djOVBTSXNJblpoYkhWbElqb2llV1pUYlRSbVZWSXZNVGxTVm5ScmJHbERlRlpCTDBKa0wwVmpOSFJCTkVac1IxQTNXRlJaYVU0NVVtMU1VMEp0WmpCeFNVRm1MMmRwTTJkb0syeExOMFZDYzI5aFdHWnZMMWRRSzIxRFFWVjVNV0ZJYjI1SWVVeDRRVXRWU0dscWVuRmxXamd4TkRSM2RFUmhabmx0VFROM1pXRTJkMWRWYUZCc01tMXFlWFVpTENKdFlXTWlPaUk1TUdWa01URTJPV1UxTldOa05UQm1PVE5sWkdFMU1qSmpPRFF3TmpVeVpqRmpPV0U0T1Rsa1lXTmtPVEUxTkdVd1ptUXpNR1UzWWpobVpUSXpZVFF5SWl3aWRHRm5Jam9pSW4wPQ==	1784508000
LcrxXFW2uNRPcEtg9Am9jSfXANAgHDJGoGg0kqMF	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJalJJTjIwd1ZtRmhWbFpPVEdkemNrSmtkVWxsZWtFOVBTSXNJblpoYkhWbElqb2lMMWxtV1ZaQlJWZG1MM0l3VWs1TE5EaFlZMkZTY1RNeWRYQkxTWFJKWms1RFQzWjVPVzlQY2pGUk5rZFpLMFZaTTJwcWIwVk9hSFJHY0U4MlZIZEZRV3hCYm1SUFltcGxTVmxDYmpsTU5YRllXRTV4TkVsSFEwTmpWR1V4VVV0SFoybFVhRGhCU3pOaVZsQldkM0ZWYlVzNWFYTjJSelJuTDBOaWVWSlVjMGxIVmxscFlVZEhUbXBZYVNzM2VUQXhhMlo2WW5abGRqRXJOMlZUSzBwS1RUZG5VRzV5WkV4TGEwSXZNWE5MY2pOTE9XcENhVFF6V0hkTlZucHJjVUZEWWpneVJtWndRbTVKU21wSFNFeEdWMFl5Wm1kWWVsY3pWRmxZZFRGd09HSlpTMWx4TldSUGNXdHllVFJtVTA5TU4zRnFURXhRWTNkYUsyVjRXV1pWZFc4MWMzTnJaRVEyV0dzclRFaDZNMjVOYkZOdFdHMUpNR05RV1c5dGNUSlFaWFZ5UkRoSk4wVnZPRXBYVlZkcWREZ3ljMVpVYUhSb1NVdHFSVGhwTXlzaUxDSnRZV01pT2lJeU16VTJaak5rWVdFM1pUWm1OakF6WXpOa1lUZzJNR1pqWW1RMll6Z3daalF5WlROaVltWTVNRFpqWVRFM09UQmxabVpsWXpKa01EZG1NVFJtTVdReUlpd2lkR0ZuSWpvaUluMD0=	1784507850
Jn7hM9Wl81Lg9327ePEAcREUOGK6ULlQNEAEBad8	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbHBWTjFFME1rczBOQzlrU0UweFNHSjFZMW8yWlVFOVBTSXNJblpoYkhWbElqb2lRVzlQT1hNelRtWTRVMHRPTWsxTE5ub3lkSFZzTm14NlkyeEhSbk5FZEdKT1ltMTZORkk0ZWxZMFNIUnVSVEl2ZUdKc05FVTNVamxvY1hKTFlpOUxTMHRMUm5WT2NUaHlXa1E1TUZJcmFVSnJWRE5IY3pkaVRqRkhhVFJ2UW5OWU5VeGFWVlZvTUU4MlNUQnphazhyYzNWMmRFNUxMMnRhYVRORlZFcG1UamdpTENKdFlXTWlPaUl4WlRWaE5UVmlOR1EwT0RneE1tRmhaak5sWmpZek5URmpNak14WlRRME5URXhPREEwTXpnMlpqbGlNRFpoT0RKbU5qWTROVGczWW1abVlqazBNV1kwSWl3aWRHRm5Jam9pSW4wPQ==	1784507872
QmeT48IYbKSR5kNT3WQP6Ui6w2zshIDjRDD7WQDi	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbkJsUTJaa01FMXJjVkl2WWs1bU1UQnVkVFpMZGxFOVBTSXNJblpoYkhWbElqb2lNakUwWW1GTFdXWmpNV2R4YVZCdE1FcHZTVGRyYkhCU1lWcFlXbWhEU1hrMFdreEJWM00zU1RZNVJsQlFlbEJCUkZGNlNUYzRRblZ2VDBGNWQxVnhWRkJXYkZwVlprRk9SMFZzTVdGNGFHdEdVVnB0U0drMWNHeG5jWGxTU3pWR2RUSm9PSEp2Y3pBclpuQllNekJHVDJ0eFRVUnZTVXRoYUVSdFl6TldSVmRGVVU5eVUySnRZek52YlVWeWJHRXZkekpxU3l0dFUyNWlNbFo2VEd0bE5VMWhiRFpYZDNSRWFFNXBUM0pXUm5rdmRYQXhjMVZpYzBWbk9GUTBUMVpvY0ZCamRFTkRlSFZTTkhVME15OXpUVk5aV0UweGJ6WnBNMnBUTUVGb1ZsUmpZWEpEY0VkaFVVUnJPU3RvYldwc2FTOVdabTV5VkVKR1IxUlBhWEZzWVVwTkwwWk5TbWxqYTFsTU0xQkdZVTQzTkZCUVFsaHBVVE5LUzNsaFRFMU5VSFV6Y1dOb1JUZHNiRGhHUVhoaVRHcGhOVFl4V0hGMFJXMWFNV2Q1TTBjaUxDSnRZV01pT2lJd1pqUTNOamN5T1RRNFpqTmxOR05sWXpSallUazVaakZrWlRJMk5tRTNNR0UyTUdWaVpXVmtaalZrTnpRNVlUQXpORFExTURSaVpUTTNOV1JsWWpNNElpd2lkR0ZuSWpvaUluMD0=	1784507754
fjkfnKodjXCakV6LEf72LkTItAAcfdrCzibGBqwu	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJak5LWWxKTmQzRlZLMVE1TnpkWGVIZHVRV3g1VUVFOVBTSXNJblpoYkhWbElqb2lSblJ0V2pkemVHNVFNM1Z2VVVWVlJrazNkMmhCYzJOaWJEUkVkVWc1UTNGTGFVVXlPRk0xZHpKeVZGVXphbU5LYVU0NVdIcG1jMk5MWkdOTVZVVlpkbWRvY0V3cmFsSk9jMFJZWnpVcllXVlBhVTFtU0VkQ1MyZEhjU3RHV1VoRFVTdFVjRXROWVN0VVpWQTFUREZuYjJzdk9XRm1PRkF3U3psWFdTczVOMklpTENKdFlXTWlPaUppWldFMk1HVTVNMkkxWXpjMU1tUXlOVFF4TURreU1qSTRaVGRsTm1NMU5XWmhOVEEzT0daak1HRmlaR1F6WldVeE4ySXlZVEkxTWpGaU5HRTNPVEl4SWl3aWRHRm5Jam9pSW4wPQ==	1784507759
ncYjrlHx4fC0UMhEUcepqc3p2yC76WxjKmKN5txp	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa1JaWnpWS05XY3phWGxIYTJWR2NDdEpiVmh3SzFFOVBTSXNJblpoYkhWbElqb2lZbUpaV1ZST05HcHdOVTVpUVVsb1VYZG1UVlJUWlhOc2RVYzBXV2hyVEVReWJYaFJVbTFQV2pObkwwVnlhM1JJZEdNeGQxSjBTMHBsSzNnMmJuUklhMUUxV0ZwU1pqRXZNa05zWVhwcVExVm5kMEZVZW5kUGVFbFljVFZUTjBOdWIyNVNUbEpwWjBKRmN6bHFhbXhEUzBvd1Vtc3dXR3dyTlVOd2NXZFhVREFpTENKdFlXTWlPaUl5TmpJd09XRmtOMlJrTURrNFpXVTNaVGhoT1dFek9HVmhNREkxWm1GbFkyWTJPRFZsT1RFeFpEbG1aVEJoTnpWaFkyVXhORGhrWTJGak5qWTJPREUwSWl3aWRHRm5Jam9pSW4wPQ==	1784507759
n9YH9a5zokqH4IzcTdCkBbjRhPEcdhAamsgBvcVe	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbTlPT0VvMWNVTmlSa05pVDJsVVlrWldVSFZtVlhjOVBTSXNJblpoYkhWbElqb2lOVEp2YnpKUFQzazBiVXRaUjJSbFNYRk5RbmhKUTJ4eU1rcENVWEpIYkU4eVZGbHlTM013UVU5cVoybDFibWQwTlZCellUQkNOVlZ1V21JM2MxZENPSFp4UVhSUlNpOWxhV3RKZWpKRFIzbEdWMHhSY0dGRVYxcE9ZMHhHY0ZveldYSklSMlZzZEZwQ2RWSkpSRXh3YUdGS01IcEdVVWd4VW5jeVVXdFVjbkVpTENKdFlXTWlPaUppTlRVMU5UUTJZekF6T1dSaVlUVTVaREl3T0dWalpERXlNbUkwT1dJd056azFOR0kwWldObE1qUmpNRFF5WWpVNE1XVTBabVkzTm1aaE9HVmtZemRtSWl3aWRHRm5Jam9pSW4wPQ==	1784507759
p0sDBfv8n9qDdtzVCNPHDv076W6pVpULfeQbggAb	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa2h4U0ZjMlUyeG5iVzlUTVhKTWNuTnZUWEJDU1ZFOVBTSXNJblpoYkhWbElqb2ljMk5sVVVkblVWaHJTVzl3TlRoaFdqQlJhV1JyVVZsTldISktUSEJyVERCcVYwbDRRa1ZIV0hsbFlrWlVOR1ZFTkV0eFoweDNjbFpZWW1WUmJUQkVZVW8wTVVGV2VWcEdNWFlyYlNzMUt6TlVlalpWY205ek9YQXlTRkpKYWxJcldIaHNRVzFwWlRsaVJUbFRZMGN5TW1Rd1RGZ3JVMEYyU1c5SU4xYzFMME1pTENKdFlXTWlPaUpqTWpZd1pEVXlZelF4T1ROaFpEVTBOak01TVdZMlkyTTRNVFJsWmpVeVpqZzVaRFExTXpCak56TmtaRGczWkdWaE9EUmlNMlJrTkdNMFptWTBNRFF6SWl3aWRHRm5Jam9pSW4wPQ==	1784507760
zHVg1m2UcYjkPDy8GedtvUys5uFxEaH2v7xXmfWX	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbVpqVURGUFdVNVVLM2M0V2pBd2VrdGlTRkY2UkhjOVBTSXNJblpoYkhWbElqb2ljbUVyUlRJemFXaHNZbWROYlZkYWJXRk5UV2x1Wmk5UVlsVnBRV0ZzUTBoS2RXOW5hbFZxWmpOUmQwcHBXakZ3YW5Kc1dsbElVazVrWjNST1lsSkZUU3ROWTJwNk1HcHFSRlJhTjNrMU1ubE9jRmQ0Wmtaa1dtaHhSbHBQVkZrNWJsVXZNMDVNTkZkT1ZqY3ZkbUZVUVhNMWJUZGFjaTg0U1dzdlUyTXJSamNpTENKdFlXTWlPaUpsTW1JeU5HRTFPR1pqWmpsaVltWTBaR1JoTURFM1pEZzBNek0xTmpBMlpUVTNOMlJqTldaaE9EYzFNRE15WmpBNVpqazVORGt4TURoaFpURmhOVEU0SWl3aWRHRm5Jam9pSW4wPQ==	1784507760
mHznHHJwAal03vEycH1l3hhK47yuJNedM0VMUW5y	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbXhJZDNWbGJWcGpOMjFFYURSVVdEaHNkMHRYV25jOVBTSXNJblpoYkhWbElqb2lSeXRaUVVWT05HSXlOMFphUTNKR1pHdEtNREZwWTJWUVREbFRabEp0ZEVkUWExUmhURzFUYVhRNGVIVkJVamRCYnpObFYzZGtVR2x6Y205Q1IyWlRRa0ZRWkRoV2NqbHNOSHBVVm01QlJVZFhNeko1UkdKNVNEZHJSa0o2TlcxSVJXVnJhR3RJYWtkYU9FdDBURU5uVjNCYU4wSnBiVmRLT0VkYVQyVm5URVFpTENKdFlXTWlPaUl5TTJFeU9UYzNPRFEwTVRkalpURm1ZbVl3TURWaFlUUm1PRFEyTVRnM1lURmlPVE0yT1RZNE5qSmtOell3WVRJeFlqUm1aV1prTVRsa01UTmtNR00xSWl3aWRHRm5Jam9pSW4wPQ==	1784507761
oszSBVpASXt2AlTkUlrCA4D1AWaGAt98r8r0PiJo	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa3R6VERoRlJFWkxRWGRyTDFjNUwzRlFZVEUxZUVFOVBTSXNJblpoYkhWbElqb2lTRmxhYXl0NVpqVkhjMDV4ZVRSUlpUSmtPRmsyWlZkWmNYbHdiamwwVDNsMU1rdHNWblJSVkU1eU4xa3hWMjVvWkZZNGRUUlNNVVZUYURCWGFYaHJWVU56TUhablkwRXpiR0p0YlhSRmFsVkJlbEpoYjBWVFMzVmxPVTVQWjB4MVpISkZZMkozYjB4MFV6SnBhV053Y20xTmNWQlNXbVJ1YjFnek4zQXJhWFFpTENKdFlXTWlPaUl5TnpreU56SmxZMkZoWVRoa056TTNOemsyTldRMFpUa3lZV013TkdKbU1ESmtZelE1T0dZNU1XWXpZV00zTW1NNE9HVmpabUl3Wm1Oall6bGlOR0k1SWl3aWRHRm5Jam9pSW4wPQ==	1784507761
aHnVLsmv6Tx6IJA6NCrNDycHEMYm8YZXqtohPlmO	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbmhKYzBob01IQk5SekJWZHpRMkt5dHNTbFJIZDNjOVBTSXNJblpoYkhWbElqb2lTblZOZW1oVFVVSTJiSGxtT1RGbFkwMU1ORTlSY0Roek1XWTVUa2c0VUhKRmRXOUdMMXBoWjBKWWRqZHVlbk5UZURSTmRIWXZZVEZuVkVOM1dFdzBkMlZ4Y2tKNFJuWm1TRWhwZVZkbGVreDNMMUZNV2pWalYwbFhOVFZTY1c1TVoxWldkelkzZUVZMFZTOUxZMUpUTmpWSVMxRnNkU3MxVEhnMlpIZ3pNMGNpTENKdFlXTWlPaUpoWmpSak1qSTVZMll3T1RSaFpHVmpOR1prWkRjM09HWXdPVGN4WkRJMk9UYzFOMlJqTW1ObU1EVTNNakF5Wm1JMVlURXdZekEzTUdNMVpUUXpaVGhpSWl3aWRHRm5Jam9pSW4wPQ==	1784507762
YufTBKGYamKWWPM1scayjM4Tyvm2FxgfnbvDuOlj	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJakprTDFwUGNEWkJhMWw0TWt4NWNFOXJabGx2TTFFOVBTSXNJblpoYkhWbElqb2lhVEZFVm1KRVEyOXJaMVp3YVRKNFVqbGxSREZtZW5acVJIWk1SbUZTT1hKdE1ITjJWMloyYVU1WmMwdE1UazFXYzNKTE1HMUdOa3RRY0ZOSFJrZG9hSGxFYkZad2JEQjVkR3NyTUV4RGFUWlFZamRGYmtGSlFVOXVXRzV6V0haVVRTdGpaVlJYU0hNcldraHhUREpOTmxoMVpsbE1UQzlPVGtsb09GQllOSElpTENKdFlXTWlPaUppWldFd09UQTNNelV6WkdReE5UYzVZVGxpT0dKaU56VTJNekV4WkRGbE1tRmhORGhqWVRSaE1HUXpZemsxTkdZeE4yWTNZbU0zT0RnMllUUmlPVEkzSWl3aWRHRm5Jam9pSW4wPQ==	1784507797
QUq3J1CwviN3jGumbIHA6zzT1747ElMLOmw4mrgB	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbTVGUlU5ellUVmFibVI0S3poM1FtNWtiVmc0VTBFOVBTSXNJblpoYkhWbElqb2lkbGwyYVZwck5HbHFabVJIU25SbFJUWktTVXB3ZDBnMkwwWTBlRkV2WXpkTVoxUmpMMGxMWkc5MFEzTnVjeXN5U3pSNFZ6SllWRWhZYVc4MlNUQmxReXRZVWtVeGFHTmhNeXRKZEcxeFJYRTNSWFpLV1VoVWRrUnNlakpKVjBwbFNtdHJaM0o1VkROMVlubzNaamx3UVZsM05uZElTV3hqUmsxbmMwMXlZa1lpTENKdFlXTWlPaUkxTldWak9EWXpZVEF3TUdNNU1XVXpaV1F3T1dFNU5qVm1ObVE0TURVeFl6QXpaRFJtTm1Ga01tWmpOVGt5TkRJeVpUa3hZVGMyT1RGak1qSmlNR0ZoSWl3aWRHRm5Jam9pSW4wPQ==	1784507763
gORBS01rHDEtjU0dgTNVTC0apM093gvkGCe3ClJz	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbWwyYm5SNkszVmtZakpZWm1sU1NGZ3hSVzQ1UmtFOVBTSXNJblpoYkhWbElqb2lSV3hJVGtOMVZuWkhlQ3RZTm5kMkwxSTFNV0ZhZGxOWU5qVXhWRGhxTjNwRk1VWkdVVWN2SzNobGEyZHBOVkZTTURKM05VNXVRbWRVU3pSeGJYSk1TeTlKSzBKMUwwMXdhRUpCZUhCa1ptZDNRVEpXWTFWRWFWUlJjMkp2YVVkeFdFbElWWGR5V1ZNM1YxQTBXRU5tZUcxMWQyOTVOMGc0TmpkTFRGWXhRM1lpTENKdFlXTWlPaUpsWkRrMU5EQTVZV1F5TldRNU0yWXpNbVpqWTJaaFlXVmxNakJpWWpkaU9HWTNNVGxrTnpZMU1UWmtPV1k0TUdaa1pqWXdaamMyTm1RMVpXSXlaVEEzSWl3aWRHRm5Jam9pSW4wPQ==	1784507764
8p2H91Jxo9UZw7wa2f8ezBta5tMeOjr6ECgvW4kR	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa3hIVVcxTlptTjNWMDVXUnl0S1dWYzFSR05RVkZFOVBTSXNJblpoYkhWbElqb2llRmx4V0hSNVNuSkRXVE5uWlVWWFdXOVJWVFZ2Wmk5WGRreHJhVlJPYVZGVE1FYzRWa1J5ZFZKaGRXWTVibGRNUkdndk5HaG9NbGh2WldNNWRWSkJMMEZFU2xWR1IwczNWVVZxWm5ZeWRsRTFiRVZYY0M5MWFVRmFSalp6UlRCcE5uaFdZell4UjNOUkt6TkpUbGxuZVhSVlJ6UnJZV0pyU2t0SE5IbG5WM2tpTENKdFlXTWlPaUl4WkRJMlptUTVZekpsTkdWak1UbGhOalk1TldSbE1ETTVPVEE1T0RVMU5qY3lPREF3TVdJek1ERm1NVFl4WVRJeVltWmxZelprWWpZMU5UaGhaakJsSWl3aWRHRm5Jam9pSW4wPQ==	1784507765
vbDTpoMAWm4Rlx1xslTr1DiABjvMNoTk8ZRHX6c3	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJblV5T0UxWk1qQmlhbFpoZG1aRmJubzFPVmxIZW1jOVBTSXNJblpoYkhWbElqb2lielZ2TldWRlpsbEtOR3BzTnpWaWJuUTNNblpVUW5KcFpVTlVhMk01T0hGUlNYVklWbFJVU0VkYVpTdGxkVEJtUkZSWVJGRnViVkZ5VUhaSE5XTnZOMFJsUm10MFlsbDFaRXhWUkdkQk1rSTFValpUVTNSbVRWbFVhMloxTVZGS2NHZEtRM2hqYTI5WGR6RnNTMlJsVjNGb04wSjJhVXMxYldwWU5TdFhObFFpTENKdFlXTWlPaUprT1RnNFpqUTJOMlV4TUdGak1qa3dNRFJpTnprMll6TTRNREU0WWpGaU4yRmpNekZqWkRreU9UVXpNekpqTkRCak5qazJZamd6TTJZMU5EUXlZemczSWl3aWRHRm5Jam9pSW4wPQ==	1784507765
Sb9sUeKTg13qwnqLDB1OydvDhffbkeg5eHtlWBDp	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbVk1YjB4MWVEUkxiRzlxYUM4MFUzbEhlR3BXVDJjOVBTSXNJblpoYkhWbElqb2lVbk40WkZOVlNUZEhjak5ZYXpSNWNDdEdNMlZuYUM5eFl6WlhjMVZtY0dnclpYRTVWamRrUmxWQ2VFNXBXVkZvZEcxWE9YRmlLM0JITDNoVldHaE9UM3BGY0Vod2JVdHVTVThyTUVWaFdrZFhTa2RhWW04eVVtdFdTRWd2VG5kdllqbHZOMFF3U21zNE9FczBORVZ2Y25sdVlWSnRlRkZWYjJ4NGN6QjFNSGdpTENKdFlXTWlPaUptWVRCbU56TXdOelkxTjJFM01EUmtZamRsTXpjeU16TXdaV1E0WTJJeE9XVmtZVGczWVdFNU5EWXpNekl5WTJFM1pUa3dOamsyTmpjeU9UTTNaakkySWl3aWRHRm5Jam9pSW4wPQ==	1784507811
vNe1mPkRT4tO7xQCdT2VD4GLJHrvSyote6alfIYv	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbmR2UVhSWlpuVlZjRXBhU1VVM01qQlNNbGwwYzJjOVBTSXNJblpoYkhWbElqb2lZMWhoT0dWamVXYzFOazVCYWpjeWNFeG9ZbWQwV21KVU5Hd3hUbVo1YjJKRU5GbGhWWGR5U25kemRXaDNhMGxaU0ZodWNpOVlZbGN5Y2s0dmFWcDJUamN4VDFoRlJITk5RbEpSWkZaMFIweFhWRkJDYmxCbVpHVTBaVTltZHl0TU5Dc3dWVmRVZVd4dFEybHRUMHc0WTBSdVVFMTVhMWxMTTBoNWVrRlRNbkJXV1VRNFQxcE1OWEJSUWtOelVERk9SVXh4WjA5SVlXZFFMMk5wTjFKS1lVdHdhVlZNZEd4VE1ub3hiRmRrYzNwVlZsUlZaSFl4ZG5sVGFrcFpaR3hUVVdNeVFubDZXbU5DVDNKRVRUaGhiRWxyWlhaRFVqSnRVbFpSVEZSMmNHVkVlSEI1Ym1aQlYzZFdkRWxXYkRSNVZIbGtlbXhhZEc5RlNucHNXa1ZVV210elVFNVpkV2x1TWxkMk9XNXdZelV4UlhaVGVpOTNlV2xLUWtac2VrRkJSM0ZZY21kNVIwbDRSMFU0UlRCdFUzVmtkMVpVYkZVdlpsWlVXbVIwY1ZnaUxDSnRZV01pT2lKbU9ESmlZbVprTUdZd04yWXlaRGt5TlRRNVlUaGtZbUU0TUdRNE9UVTBZek14T0RKaU5EWmhOMlV5T0RVNU5UTTNNVGcxTUdaalpXUTVZVEl4TVRoaElpd2lkR0ZuSWpvaUluMD0=	1784507767
8Ss1exD9SkerP3VGHLYfCJBfah2uMiz5CeNYDH5M	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbGx3VldOQ2JFbHFTQ3RUYmtoMlZDdFVhRk5NY0VFOVBTSXNJblpoYkhWbElqb2lUazR4Y2t4aWVITlNjREpyTDNaRlowUjNOSE5pWjBkSmEwZFpZMFYwU2xNMlNrVjZhVXA1TDNCWmIwcFpNRk5tSzNWWGFWcE5ibk0yWVN0alNFVlhiRnBXYzA5SlVHZHpVazV6TjFnMFlrOVVZV3R2ZDBrcmVVNWhTR3M1UlVGWk0wNVhXbGhYV21rMlNHNXZPUzlNZGt0NWNXdHFhMnhPZDBoTVFXaHNRVmNpTENKdFlXTWlPaUppTkRRM01qa3dOMlZrTmpJeFpHSmxOekpoWTJKaFpUVTJNemRtTm1ObE5UQXlOVE0xTVROaFlqTXpOekZsT0RGaVpHUTFPRGd4TmpKbE9UaG1OemcxSWl3aWRHRm5Jam9pSW4wPQ==	1784507767
OkHuovQRhvsuKrb8gH0wGK65xtAT4MOw8fYwGQHG	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa05WVkROemVHdDZXbWQwZEhRNFdXcDVOMGhEWTNjOVBTSXNJblpoYkhWbElqb2lUM2xCV1RaMlRVaDFSazFrYlRsaWIweDZSbEE1Vmxwd09ISlBTbGxxYWtGT05DOVFNbFpYWjJkUWRsbHZSbE5aTlVaTFUxbGpTSGhNYVhsVGEwbGpWMWhVVFhkbkwxUnFXakl6VUVwV1VEQjNjRmx4UjNaMmQycHZXRTlHTVdjdk1VRnRZa2RKYm1VemJFcDJlWGt5ZFhkYWJIQnljamxVTDIxNWVVTTNVVGdpTENKdFlXTWlPaUpoTkRsak16ZGhPREU0TkRZM1lXTXdaREU0TmpSaU1UaG1NMkZqTXpNMU9Ea3lOelU0TlRBeE9HTmtaVFUxTlRWbE9XTmlOVGhqTmpsbU1HRXlNRFl3SWl3aWRHRm5Jam9pSW4wPQ==	1784507768
TenGCSZ6g4XXRagjEVcImlD9JdGTj37SR4AkXQlW	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbFJGUjJGcE9XYzNPSHB6U0haalVVeEROVzk1UW1jOVBTSXNJblpoYkhWbElqb2lZMk5NVW5SYVpGaElOMWRXVGtSamJVSkZMMVUyTWpCSmVVVXlPSEJJV1hsM01ERTFRV3RsWVVzeFZHRkxhbEJZUnk5SFZrUXZTR3RrV0M5TU5YTkxja2RDTDBOeWNHeHFWemt2ZWpsVk5tZHhVME4xT0c0MlZsZHdOSFpvVWxSeWRsUlJlR2xCUjJaYVFXVlhUMHhSY205MVZIVkdXVk5JYVU5MU1qTlhPR29pTENKdFlXTWlPaUl6T0dVME1UZGlOekF3WW1aa1lUZ3laVEl5WVRkbE16Y3pOR1F3WTJVeFpEUmtNV0k0TVRGa01qVTNOekppWlRCbU9USTVOMk13WlRnMk5UZ3hZbVJoSWl3aWRHRm5Jam9pSW4wPQ==	1784507768
F2FqdIdHF2bzIxzeKOWuFXrXhrtOdlkQ6HBxLkV9	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJblpuVjBveVdtRkZNMHc1ZDB3eVZWSjJaM1JRUzJjOVBTSXNJblpoYkhWbElqb2lUMmh0V21VeGFIQnRielp4WVZwQloxUmljWFo0UldSVE1WZ3pabXRHVUdsS1VYVk1iazVoU1U1SlEyRk1XR1p6V1VoeVRXSTRLMlp6YTNkT1FURmhSMnRHZWxoek1pOWFNUzltVW1NM1pqSXZOVzlQWVVKVVUwazFUSFJPSzFONmIyTlZla1pwYWtveGNXWkhiMHB3Y3paUk9FNXZhVE5HVWpBdlpsWlVWVWNpTENKdFlXTWlPaUppTTJZeE56WXlaV014TmpZNVl6RmhNalptTkRFd01EY3pOV0kxTmpoak5XSmtPVGszTnpjME5qY3pZV1EwTURZNU16SmxNR1ZrTnpoaVptSTNPVGxpSWl3aWRHRm5Jam9pSW4wPQ==	1784507769
8jHVbEPEeOkeI4JeL4aweA4IMdWv9U8KOogI7Hlp	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbXh5WWpreVdFOUpUak54TlU5alZEQmllWFpsZVhjOVBTSXNJblpoYkhWbElqb2lUV0ZNT1ZseU1WaHVWMGxTVEZkRFpGSk5la2hUYWtWMlMwdDBZVlZOWVV0WFR6bGtUVWdyZGs4NFkxZHdMeXQwYzA0eWFIcDJkMkpHWmxWcldqTkNZVWw2WTFjeGNYcDRRWFZtUmtkSFRUZGpWazgyTmpCRVVXZG1MM2xMWlRCaFExZHNhbTFZU2tvMmNVVTNSMnBrY0hWd04wUlViV1EzT1ZwbGJXWjBkVVFpTENKdFlXTWlPaUkyT1dZNFlqUXdORFZtWXpjeU1qTmpNbU15T1dJM05EUm1ZbU0wTkRjellqbGtZMk5sTXpGa09XWXpaREZpWTJZM09UbGtZV1l3TVdVME5UazVZV0l4SWl3aWRHRm5Jam9pSW4wPQ==	1784507769
eRTmEvDQ6PJ6SHKHKRTumc7RW7ZRagCWrvZXYxk8	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa1JHU0hSd1RrSXZNWHBuTW5oRGRHRTBTVEZXTUZFOVBTSXNJblpoYkhWbElqb2lWa0kxUVVWdk5sZEJUM1JpWjBrNFdWbFNhekZWYWxsTlVERmpibVJ4WlRrM1l6Wk1SV2hOZWtaak5IbENRMlF5UlU1UlJFZ3dSa0ZyY1VOTk1FNDRTVGRRV20xSk5rdFNNbWNyU25kc05GRkVWR1Z2ZUd0aFRrNHpha2w2TnpCWU1DOUxkbko0WlhCeGJESnZkVkYyY25GYVpFaEplaThyWkhaNFNrRkZXbk1pTENKdFlXTWlPaUkwWWpoaFltTTNNV05tWVRrek5tWXhZemxoTXpsbFptUmxNelF4WlRFME1HRXdaR0UyTkdZMVpHRmhZekV3WTJabE56UmpOVGxrTWprMFptWXlZakExSWl3aWRHRm5Jam9pSW4wPQ==	1784507769
MjM3gjF8QgdRawwGYrFFZC3JGbNp9u0nBNHOlLqt	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa2M1TkRsM1RtMVdUbTl6T1ZWWGVXUXZiV05FYlVFOVBTSXNJblpoYkhWbElqb2lXSFpKYWpkb2NHSlJXamhwYURadVdsSmhWbWx2TUc5U1MycERZbkpGV2twM1VWQlVRakZYZFVkcFpYVlRSbXRWZUhGSGFYaFRPV2RXUm1veVQzZGxORXN2YldveWRIcHdaMFpzVTBZNVdtSlVObTFDV1c4M2NUbDBZbWxvYjAxVVVuSTJkRTF4VmxwdWVXVnFXV1oyUVRCSFkxUm5OVEpVZGxWR1pXbFdhbG9pTENKdFlXTWlPaUprT1RZek4yWXpORGcxTlRFd01HWXhNRGN6TTJVd04yWmhOREV5TWpWaU1EbGlNekJpTmpsbU1tTmtNemN4TVRBMlptVTBaV1JsT0RReFlUSXdNVFZrSWl3aWRHRm5Jam9pSW4wPQ==	1784507770
G1fBMJAwaLaNTKOJj1iprPUmpE02O5D3uejBTgud	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa2RQUVVaSmNEUjFOV3d3VVVGM055OXFhSGN6VW5jOVBTSXNJblpoYkhWbElqb2lRamRDV1ZNMVYxazBWM2h1WTBzNVIyOWxNMjg0YkdsVU9WZG5jMWhUUlVkbFVXRjZjVmQzV1dOeU9HMW5iVVJsYkRSdVlrUm5abTF5YUhabVlUVmtkMUpwVkU1VU5XUkVOSE1yWkZsclJrZERlbWx6YzA5eUwzSkNZalY2Y2xoM0wwVnZaVWQ1THpoR1MybFRaRFZRWlU1VVdUWmtSV2hYTDJsMWNHWnZhWFFpTENKdFlXTWlPaUl3WlRRMFpqTmpPVE5sWmpCbVlqZzROalZrTVdaaVpUWm1OREE1TVdZNE56WXpabVk1TW1NNE9EZGhZMk00T0RRMlpUaGpPR0ZsTm1ZNFl6RXlNbUk1SWl3aWRHRm5Jam9pSW4wPQ==	1784507772
eTuvVUHM4jgew5EbscIZwxydmfBV9zZt4ivDGNCx	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbXhaT0VKRk1uZDRlVlJuWjBoNmJpdHVkREJ6UTJjOVBTSXNJblpoYkhWbElqb2lNazUyWlROVmRWQm5VVUZCU0ZGcldDOWxUVUV2UWxNeVJ5OVZlazl0TUhsTGJFc3dLMmR2YXl0UlptaEJNbHBhU1RWNFNFbE1TVEJDUTFrMGNHeFZTSGxyVFVoU1ZFRlZjVXByZEc1eFUxb3hSRW95TjNSNFR6TnJZazgzTmtFdlNrNUJhRUpsUVZoVE1FdzFURUpDTXpoWlluRkxZamhLVWxWUVJIVmxjRWNpTENKdFlXTWlPaUl3TkRFd016WTRNakEyTm1ObE9UUmxPV1ExTjJReVlXSTBOemc1T0RWa1kyWTBZMlF6T0RabE5XWTVOV0l6TkRjMVl6TmlaRE13TjJSak5UVTJaakU1SWl3aWRHRm5Jam9pSW4wPQ==	1784507774
ccUBz0OwDaSQ23pgsXDUnMEUdLO0JNOvU0ElW7uB	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa2hEWkhOVFREVmtkMXBPZEZOR1NFTTNkUzlMU1djOVBTSXNJblpoYkhWbElqb2lRM0ppU0drdlNrWlVNMU5wWnpKdFRWRklabWgwYTBKeFZFaFpWV1phVGt0SFVWUjNZeTlvU1hnM2RFeHdVWFpzVjJwRFlYZHphbWd2TnpGaFIxbzNkM2RTVlhCVGIzbGlia1Z4Y2tWdlpqWlljSGRXV0hwT1F6TklSbEF6TVZvd01rWXJRMVVyUzBaR1YzTnBSWFJMUlc5MFdWbFplWFpxTVdoVVZrMURMMWtpTENKdFlXTWlPaUkyTVRFMU1HRTNaakkwTURVd1l6aGtNekk0TURkbVlqa3paRFprWldGaFlUSXlNbUkzTjJFMk1UYzNaakJsTnpJek5qSXhNVEJsTXprM01UQTRZMk13SWl3aWRHRm5Jam9pSW4wPQ==	1784507774
0cvNi41SLvn6zALyUsEi7hcgqRLHnyRJUQUiy2vU	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbUpyUkhaRVVsaEhUemRTUjJ4Mk4yZEdLM1JxYjJjOVBTSXNJblpoYkhWbElqb2lja1l6UXpVMGRXdGFWbUUzZFdkbk9VaFZkWEV2VERSME5sTkNaSFpqWlZFcldFMVFjbnBNWW1sU1lUQnRNbXRIWTA1eU5rbGlVWEZqWXpsUllVbFRRMDlGTHpobFdYbDJSbUozVkVndlpIVjFWblJGWmt4blkzaFJObE0xSzNVNFFsQTNPUzkyWlRab1RYQnVjVGhrVkROaWFsaHlabTFzVEhNNVpWaDNTVllpTENKdFlXTWlPaUk0WmpJM09EZzBNak5qTm1VNFpHUTNObUZtT0RZell6QTFNR0V3TURobU5qRTVZMkZsTmpVNFlUazRObVl5WmpnNE9EUmxOVFUxTnpsaU16QTVOVFkzSWl3aWRHRm5Jam9pSW4wPQ==	1784507798
S52wJpRK6QQDc8nknQterMMCsKFZuFdpVIgBVNXW	459	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbnBPTVhvMGQzSlVlRzVvTm1obFNESTFjMGg0TkVFOVBTSXNJblpoYkhWbElqb2lNRWhPYnpKV1MwaFlZeXRSWWxaclRWbFdTMUYxUkhOSlYySlBTRVk0VVdoSU5qbFVRM2x2ZUU1UFNsSkRiMWg0VlN0bWNIWkRUazVyWW1rMmRHcHJVelZzZGtSMGFXc3lZWEoxY2t4cWMweHhjRlZtY2pWWlMwNTFMMjFZT1daMGJYTTFUM3B1UW14bFQzbG9TRzFXUTNOUVQyb3hTVUZVY0N0cVZraE5ka3BrUjBzNFJsQm1aamw1TTJ4Uk1VbDFhV1pzVERaVlVHRmxZWGs1ZFN0WmVuSnNRMWxoZGxOMWEyUm9NV1ZJTDNkT1RXNUlNMXBhVjA5b05rSkxTV2hIUTNSSWJraERTRzF2Y0hKSmRsRnJjbEZWZGxnek9HcDNRVWxYVG5wMGVTdEJhR1ppUjNoU2MzWnFSemN3T1RWQmJVZFBjVFZVWjNOQ1ZrazBhelZMYUdrNVpGbFhWbVk1Ukd0VGNsVnJibFptWlcxMmJrTmxPWFJRZERCTlNUWlhSR3M0ZDJScGNGQnhkbkpWV21sbUswRndhSGRMU3pWVk9FSlhVbFpyU1hZaUxDSnRZV01pT2lJME9XTmxaRGN4WlRBek5UYzVNVEpsTUdFMll6STFaR1ptWmpBeU16RXdaREF4TWpCbE56SXdOMlF6TTJVNVptVXlNVEE1WTJZNU9HUTJNV1JsT0RKaUlpd2lkR0ZuSWpvaUluMD0=	1784507968
kt8q3rZjtSCgAMMjjKdoWjMRMaOViNMcIjxAW8hy	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbGxsVUdsc2FreFdlSFp4TlVwdlJDOVdMMDlQUWxFOVBTSXNJblpoYkhWbElqb2llQ3RsVUZCSmJWSkNTa2gxVEU5MVVtWlNMMFEwY0U0NFJsTjVRbUZaUkVad01HNXdNVUpsVVVsNVYwZEJRemxFT1VZeVRVeDJPR3BRTDBZd1ZtcENNbFVyZW5sQk4ySkdRVEl5WWl0eWFtMVZNbVZTT1doVE5scGxaWGhwU0U5b1drSkJkRmhGYjBodU1HTmhUelpzU21nMmMzZ3JRa0V3ZDBkVGJYSXdhMmdpTENKdFlXTWlPaUk1WW1Fd016RmpNV1V4WW1RNVpURTVPV1ZqWlRWbFpqWmlaalU0TkRKaE1XSTBZMk13Tm1VNFkyTmpZelJoT0dWbFptSTJabVUxTm1abVptSmxNbVF6SWl3aWRHRm5Jam9pSW4wPQ==	1784507853
Q4v33CROD6DcF34tFyruTPIwt8ILNGVUDpLuZeQE	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbmxNWXpGWll5dFZSMkZyU1N0Q2RsQnBUbFIyU2xFOVBTSXNJblpoYkhWbElqb2lSVmRRWmt4R1ZrcHhaMVprY3k5Q1FVWm1SakpIV0V4UlUya3dXazFRV0RJemQzWkRhMHhDTm5GdE1sSXlUMHRyV2tSMUszWkRXVU5KVkRSS04wNUJLMGRrYVVwb1pEQkxiV1ZTUlZwcmQxUjVTMkpuZUZKd09FbFhZVEZUT0ZvMlpXazBSR2xQVlM4ME5WUmliMUZOYlV0bWJHcE1TRE5yVm5Gc1dtczBiRkJJV2xZNVprMXZUbmhxU0dsdFUwMVFTa1pNWW1KdUsxRjVhRWxsTVZWelNVTXJWRlJPTVM5NFUyTmpSMnhxVjNFeFdFczFOMVJPWlU1alVYSXJRVEZ2T1ZaTlNVdzBjVVUwZVhWc1JHUTBZa2RLYTNsV2JGbzJWakZNZGtKSFRIbFBVMWNyVm5OTWNFZGFVV0kyTjFaNlNISTFVMEp0YVcxWk9VVTRTSGgyU1dRdk1rUTFUR05YTDBwemJrTnpaVTVNTUVjeWMxVnRVVGhpTUZkUlNXOVpla05qTlRaNlpGUkJLMHNyZVd3elVYRXZlVVZwUmtaYU5XdE5MMUZzUmxjaUxDSnRZV01pT2lKaE5qVmtZalkzTmprelkyRXdOR1F5T0dFeFpHTmlZekZsWkRVeVpEaGxZV0kzTnpBelpUVTBPR0l3WlRabVpUbGlaalpoT0dJek1HRTFZVFV4Tm1Gaklpd2lkR0ZuSWpvaUluMD0=	1784507832
biNuHcGoQ82sPHUNV0xONHOcBMxzN0xi1JSHVpGf	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJa0ZHYjFrcmJ5OWFZVU15WjJ0UVVFUjRiVUp0ZEVFOVBTSXNJblpoYkhWbElqb2lhRUZTZG1oUU9XOXpSWFpRYW5oclREWmtLMHM0YVVSNlpYTnNTWEl5Wm1aclVFNXBOazlYV1VZMk4yOWFlR2t5ZEVoMU0ySjVPREpqZDA1S2JtcG1PVzVaVVZNdkwxcDNORUpTUm05SEwyZGxVa1IwVWxaTmVtNHZUbWt4UzFKb2FsZEVUMHg0TURNMlpYSXpMMHBPYWxVNGNWbFJiVWhrSzJFNVdIRnFjazhpTENKdFlXTWlPaUppTWpZNU9ESmtNbUpqTURoaVpHSmtNMlEzTUdZd016VTVZVFJpTXpCalltRmtPR1k0T1dKbVpUSXhORFpsTlRBd056Y3lOekUyWkdSbU5EUmxOVEkzSWl3aWRHRm5Jam9pSW4wPQ==	1784507876
xwicwecOZn59J9Oc15s7xEACjgAtmWczB1pqyqzW	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJblpXUlhwMVpXeFNjV05YUjFWa1FqaGlaM2RFT1VFOVBTSXNJblpoYkhWbElqb2lhV0paU1RWV1lXUklWRkIzT1ZKS1V6TjBLMWhTUzBocmFFWXdZekZsVVROS1RqYzFZMmhJYzNKTVFUQm5RbWhuTDNScE1XVlVhVzFQYUhWNlRqZ3dMMk5PVWpWME1ubHpaMmhvTVc1M2VpdGlkMHhNTjFKdFoyUkJkek01ZVZKTWFqQkNZVmQzU2tjNGIwSkxOSGgzTlVsTFlqaDVOazAyZGpWUWIyTkZUMVI2ZFV0MVJUWXdUWGhJZFhWcE1tOW9jQ3RZY1ZscWRpOUlWa3RyU1hFMU1HMHlNR2xUWW05aFpDdGFlbFUzVjBoT2ExSnlkRzFETUdkaE0ybHFlbWRvTTNKME9VdFBjbWN5TmswNFNYTnNNRlJOVVhSQ1FpOVNMMkkzVEdkbGFTdFJWbmh1Y1ZVMVkzaFFXbmd3T0hkUmFIaFpTRzFMUlZRek1VbE9SazVxZVdSblRrcHFlVVZ4Y1ZGM2FGTmlXaTlvZG1sc09HTm1UVXBxTVdaYU1sWkJVMFZVVG5oTGRFMUNSVmRtVnpkaE9WRldOeXR3YUhjeU5FdEtLMFpoWlcwaUxDSnRZV01pT2lJd05XWTRaVFJoTVdOaE5qVXhaak13WXpBell6SXhPRGRrTjJFd056TTBZakl4TW1SbE1tRTFPVFJqWW1SaE5XVTNZV1U1WmpJeFlXSTJZbVV5Wm1KaUlpd2lkR0ZuSWpvaUluMD0=	1784507945
m7ADNWKTK68eNxpwusbFAO0n6lrBBaSPWnKzbtHP	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJalJvYVc5VU9IaDRURVo2UWxSa1VteExNaXRqZUhjOVBTSXNJblpoYkhWbElqb2lObU5oZW04dmJDOHlkVEIxVldGM1kyTm5kREkwYUVSUVIwZDRiamcwUzNkMlNtSjVZVzVzTW1rdlFuZElhazVGUkM4d2FTOXdUWFlyVFZWdk0yOXBZMjVDVmpkQ2JTc3Zlamx2T0VaS1dqUk9jRkJHYnpSSVQwVnlORGR4VVdGUlp6aEtkVFUxVlU5b2VHUnBjR0pCVFhobE0xQlFSMFpvWlROVGIzaENiV01pTENKdFlXTWlPaUl5WmpOak4yUTROVFkzWmpSbE5XTmtaVFUyTldVek16UTBaRGcxWkRZMU0ySXdaak14TkRneU1EZ3lOMkZoTlRjMU16STNaVEZsWWpJMll6TTJPVE5tSWl3aWRHRm5Jam9pSW4wPQ==	1784507978
yFFMkv56ameCPDyrpvTPMHskVwUYf5zOiL7UpM23	1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJakZYV25Rd05GSldhRU53UVdkM2JpdE1PSFpHUWxFOVBTSXNJblpoYkhWbElqb2liMm8yVkZKSFlVNU1WR2c0ZVRSeGRtSlJaRGRpVGpSME1XOUZVVEZpY0hWemVXOXpWMjlPWWxjd1kzY3JNVlZEZVZsSmJWWkxZV05UYVd4NFZsQk5lbEZSUkZaU00xaEZkekJFZWt0ek4zRm5Wa2gyTTBwdmNrbFlUbmRtYUhneFFsUm5kVTFzVm5Zdk9UTTFORmw1TWxFNWFsSndaMGRpVW10RGMyRlNialV2VVhoTlZreG1ZV1pZZW5sRVUySk1kR1ZyWVZrd1JTdElXVTFuUWtrNVUwNXhVSGxzYkdwelYycDJhVFp0T0RCSVVUWmhSV1pyV0ZWblltVm5kVlVyUzNObEx6WlVkMWRDVEZOM1prb3dWM1JXVFVoRldrVnBZVVUzVjJWRVRtbFNPSGR3WTJ0VE0wdG1WRkZsYUM5NVZETTVNaXQwWlVGeVJtbHpPRTgzUlRWWmVUQmFRMVZJZW5ZNU9HdExTbUZoWW1JMVFWTXdVMVI2SzJWRGJWWmpOV1ExU21kMVJGQnVlblZLTmtZMmVsVlZiMGRzYjB4bWNFVlFjM0JaS3pRaUxDSnRZV01pT2lKbU1UY3pNRFF3TVdNNFpqUmpNVFV5WWpnM05qSXhOamd5TTJWa1ltSTBNV0kzTVdJek1EQXhZek5pTWpabE1qWTFZbUU0TjJWa01HRmlaREppTm1FNUlpd2lkR0ZuSWpvaUluMD0=	1784508003
U3u6G60dRvU0zMVUHjjW18jAa1WdyLYbwkoNVO5s	460	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cypress/15.18.1 Chrome/138.0.7204.251 Electron/37.6.0 Safari/537.36	ZXlKcGRpSTZJbEJoTTFNMFVsQmhOV1JrYlVrNU1EUnFVM292T1hjOVBTSXNJblpoYkhWbElqb2lVVU5OWlV3NFFXNDNkemd5T0U1aEsxbHpjRkZZV201MlVsTTBPSGhaUldWNlNHY3paVUZVZGtneE4wUm1WM1JITDNsS1RWSm5NMVZITkRGNVJsSXpXRWxMTUhsSFIxSjJVazh3Y0RsWldFY3ZNMFZVZWxKclpHWmFOVFZ4Um1zeVVHMDNUbU0zVG5odVVXZEZUa1kwZDB0U2RuSnlORWxNZW01bUt6ZHZPR1ZDVEhZM2VXd3laekpsYlhsR1MzWTFZbFJNTVVvMlJqUTJXRVk1VDNaVFZrOXpkVTVYWjNSRFVYUkNVRkU0ZEc1YVVVWjZMMVEyWW1sVk1IbHdjV2wyVW14ek5ubDRVbXR3YUhkU05VdFBhVUl4YUROTE16TmhZbXhRTjNvMk1rbDZRVmxXVEM5VGRIaEdZMFZxTVZOSE5WazRXVzFpY2pkTVRUZFlVRTVHVHl0alJGQlllSEV3UW5kemJHTXZUME14UVRSVVFXVnlTekpsVFRoMFNEVkRSV2swV2xoaFVYaG9aRzFJZVhWbFRWWm9PR0paYm1kaldVOVlSMjlMSzJFaUxDSnRZV01pT2lKa01UTXlNV016TmpnMk1UUTFNbVl5Tm1NMllqSXdPVEV3WXpBek9XUmxOVGt5TURkaE1tRm1OemxsWVRVNVpUazVNVGN6WXpjNVpUTXdNMk0zWkRFNElpd2lkR0ZuSWpvaUluMD0=	1784507989
\.


--
-- Data for Name: tipo_mantenimientos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_mantenimientos (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Mantenimiento Preventivo de Rutina	Revisión técnica general, cambio de filtros, aceites y engrase de piezas.	2026-07-20 00:04:29	2026-07-20 00:04:29
2	Mantenimiento Correctivo de Emergencia	Reparación inmediata por falla mecánica inesperada en labores.	2026-07-20 00:04:29	2026-07-20 00:04:29
3	Calibración y Ajuste de Sistemas	Optimización de parámetros eléctricos, de presión e hidráulicos del equipo.	2026-07-20 00:04:29	2026-07-20 00:04:29
4	Reparación Mayor de Motor/Transmisión	Overhaul completo o intervención profunda de partes mecánicas críticas.	2026-07-20 00:04:29	2026-07-20 00:04:29
5	Inspección de Seguridad Estructural	Validación de fatiga de metales, soldaduras y sistemas de protección contra derrumbes.	2026-07-20 00:04:29	2026-07-20 00:04:29
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, nombre, email, email_verified_at, password, remember_token, created_at, updated_at, rol_id, estado, avatar) FROM stdin;
1	Admin Cooperativa	admin@cooperativa.com	\N	$2y$12$PO8iEGy5JsA.ZeX44rbSQO5z1ZHboueYcHdTkZfDVJ98gjmc4/rv2	\N	2026-07-20 00:04:27	2026-07-20 00:04:27	1	t	\N
2	Jose Luis Mencacho	joseluis@cooperativa.com	\N	$2y$12$P1ce5MtEK7QQpCnhg8KL9e5jj.xFzAKFWIepLZIn7ga.dHJPUcOV6	\N	2026-07-20 00:04:27	2026-07-20 00:04:27	3	t	\N
3	Juan Carlos Incata	juancarlos@cooperativa.com	\N	$2y$12$zORsxtzfAMIRadLyvEokYu9Zp9Bd/G82mozmaeFUthLSGA5Vlflb.	\N	2026-07-20 00:04:27	2026-07-20 00:04:27	3	t	\N
4	Juan Torrez	juantorrez@cooperativa.com	\N	$2y$12$5Eiu5tMKjBOsWeK.bUuYy.iPiLB7iShzdAxcA0wqxaO54oCEwMdrq	\N	2026-07-20 00:04:27	2026-07-20 00:04:27	3	t	\N
6	Emilio Torrez	emilio@cooperativa.com	\N	$2y$12$tXx0BGBMq4A6UctlmNmlRO81ey7Y84/YdnvXaSnkxJy8LY1tVYYlu	\N	2026-07-20 00:04:28	2026-07-20 00:04:28	3	t	\N
7	Elio Caceres	elio@cooperativa.com	\N	$2y$12$yVXkR7ioQOF1uYF9gqPYfuX2S/y/ruNpBNu.xNzYQ8sr6Z.acqVFa	\N	2026-07-20 00:04:28	2026-07-20 00:04:28	3	t	\N
8	Eloy Canabiri	eloy@cooperativa.com	\N	$2y$12$ol/Y4fbWc5tceqdzP.PA6OVrwbEaqnNVuZr2yzOOR7sJc1BVuHlni	\N	2026-07-20 00:04:28	2026-07-20 00:04:28	3	t	\N
459	Cypress Test User	cypress.test.1784507958159@cooperativaminera.com	\N	$2y$12$vo/aAMgymrlAC/gmOt2XNuR3Vnjl.LWdjWJnB8oaTfHumkZa/fRIu	\N	2026-07-19 20:39:25	2026-07-19 20:39:25	3	t	\N
460	Cypress Test User	cypress.test.1784507978019@cooperativaminera.com	\N	$2y$12$i8RSjkOokbdZdBRRikdEUOgoPa0rQOZ1v.Cy3e9uSf.0yLLdzT0da	\N	2026-07-19 20:39:45	2026-07-19 20:39:45	3	t	\N
5	Waldo Hanco	waldo@cooperativa.com	\N	$2y$12$Xqs8LuIj9IEQSm4G62fsJuIJz4OoH3e9KTwbGL0YuFAVX/pEiYd5a	\N	2026-07-20 00:04:28	2026-07-20 00:21:00	4	t	\N
\.


--
-- Data for Name: vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculos (id, tipo, placa, marca, modelo, conductor_id, estado, created_at, updated_at, deleted_at) FROM stdin;
1	Volqueta	2245-LKP	Volvo	FMX 460	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
2	Volqueta	4890-SDF	Sinotruk	Howo 371	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
3	Volqueta	3122-JKC	Shacman	X3000	\N	en_mantenimiento	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
4	Camioneta	5010-XYZ	Toyota	Hilux 4x4	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
5	Camioneta	4090-ABC	Nissan	Frontier 4x4	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
6	Camioneta	2811-UIO	Mitsubishi	L200	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
7	Minibús	3555-PLM	King Long	Placer 15p	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
8	Minibús	4112-QWE	Foton	View CS2	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
9	Cisterna Agua	1909-VBN	Iveco	Tracker	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
10	Camión Plataforma	5420-TYU	Mercedes-Benz	Atego 1726	\N	operativo	2026-07-20 00:04:29	2026-07-20 00:04:29	\N
21	CamionetaCamioneta	CYP-1234	Toyota	Hilux 2024	\N	operativo	2026-07-19 20:38:05	2026-07-19 20:38:05	\N
22	CamionetaCamioneta	CYP-1234	Toyota	Hilux 2024	\N	operativo	2026-07-19 20:38:30	2026-07-19 20:38:30	\N
23	CamionetaCamioneta	CYP-1234	Toyota	Hilux 2024	\N	operativo	2026-07-19 20:38:58	2026-07-19 20:38:58	\N
\.


--
-- Name: alquiler_gruas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alquiler_gruas_id_seq', 16, true);


--
-- Name: bocaminas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bocaminas_id_seq', 92, true);


--
-- Name: compras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compras_id_seq', 46, true);


--
-- Name: costo_servicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.costo_servicios_id_seq', 30, true);


--
-- Name: detalle_compras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_compras_id_seq', 92, true);


--
-- Name: empresa_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresa_settings_id_seq', 1, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: gruas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gruas_id_seq', 1, false);


--
-- Name: historial_operaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_operaciones_id_seq', 230, true);


--
-- Name: inspeccions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inspeccions_id_seq', 20, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: maquinarias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maquinarias_id_seq', 38, true);


--
-- Name: materiales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materiales_id_seq', 325, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 32, true);


--
-- Name: permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permisos_id_seq', 18, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 54, true);


--
-- Name: repuesto_servicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.repuesto_servicios_id_seq', 43, true);


--
-- Name: respaldos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.respaldos_id_seq', 22, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: servicios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicios_id_seq', 40, true);


--
-- Name: tipo_mantenimientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_mantenimientos_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 460, true);


--
-- Name: vehiculos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehiculos_id_seq', 23, true);


--
-- Name: alquiler_gruas alquiler_gruas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alquiler_gruas
    ADD CONSTRAINT alquiler_gruas_pkey PRIMARY KEY (id);


--
-- Name: bocaminas bocaminas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bocaminas
    ADD CONSTRAINT bocaminas_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: compras compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_pkey PRIMARY KEY (id);


--
-- Name: costo_servicios costo_servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.costo_servicios
    ADD CONSTRAINT costo_servicios_pkey PRIMARY KEY (id);


--
-- Name: detalle_compras detalle_compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_pkey PRIMARY KEY (id);


--
-- Name: empresa_settings empresa_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa_settings
    ADD CONSTRAINT empresa_settings_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: gruas gruas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gruas
    ADD CONSTRAINT gruas_pkey PRIMARY KEY (id);


--
-- Name: historial_operaciones historial_operaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_operaciones
    ADD CONSTRAINT historial_operaciones_pkey PRIMARY KEY (id);


--
-- Name: inspeccions inspeccions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspeccions
    ADD CONSTRAINT inspeccions_pkey PRIMARY KEY (id);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: maquinarias maquinarias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maquinarias
    ADD CONSTRAINT maquinarias_pkey PRIMARY KEY (id);


--
-- Name: materiales materiales_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiales
    ADD CONSTRAINT materiales_codigo_unique UNIQUE (codigo);


--
-- Name: materiales materiales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materiales
    ADD CONSTRAINT materiales_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: permiso_user permiso_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso_user
    ADD CONSTRAINT permiso_user_pkey PRIMARY KEY (permiso_id, user_id);


--
-- Name: permisos permisos_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_nombre_unique UNIQUE (nombre);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- Name: repuesto_servicios repuesto_servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repuesto_servicios
    ADD CONSTRAINT repuesto_servicios_pkey PRIMARY KEY (id);


--
-- Name: respaldos respaldos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respaldos
    ADD CONSTRAINT respaldos_pkey PRIMARY KEY (id);


--
-- Name: roles roles_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_unique UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: servicios servicios_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_codigo_unique UNIQUE (codigo);


--
-- Name: servicios servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tipo_mantenimientos tipo_mantenimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_mantenimientos
    ADD CONSTRAINT tipo_mantenimientos_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehiculos vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_pkey PRIMARY KEY (id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: compras_estado_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compras_estado_index ON public.compras USING btree (estado);


--
-- Name: compras_fecha_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX compras_fecha_index ON public.compras USING btree (fecha);


--
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- Name: historial_operaciones_accion_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_operaciones_accion_index ON public.historial_operaciones USING btree (accion);


--
-- Name: historial_operaciones_fecha_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_operaciones_fecha_index ON public.historial_operaciones USING btree (fecha);


--
-- Name: historial_operaciones_tabla_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_operaciones_tabla_index ON public.historial_operaciones USING btree (tabla);


--
-- Name: historial_operaciones_tabla_registro_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX historial_operaciones_tabla_registro_id_index ON public.historial_operaciones USING btree (tabla, registro_id);


--
-- Name: idx_users_nombre_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_nombre_trgm ON public.users USING gin (nombre public.gin_trgm_ops);


--
-- Name: inspeccions_equipo_tipo_equipo_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inspeccions_equipo_tipo_equipo_id_index ON public.inspeccions USING btree (equipo_tipo, equipo_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: materiales_estado_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX materiales_estado_index ON public.materiales USING btree (estado);


--
-- Name: materiales_grupo_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX materiales_grupo_index ON public.materiales USING btree (grupo);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: servicios_equipo_tipo_equipo_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX servicios_equipo_tipo_equipo_id_index ON public.servicios USING btree (equipo_tipo, equipo_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: alquiler_gruas alquiler_gruas_bocamina_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alquiler_gruas
    ADD CONSTRAINT alquiler_gruas_bocamina_id_foreign FOREIGN KEY (bocamina_id) REFERENCES public.bocaminas(id) ON DELETE CASCADE;


--
-- Name: compras compras_bocamina_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_bocamina_id_foreign FOREIGN KEY (bocamina_id) REFERENCES public.bocaminas(id) ON DELETE SET NULL;


--
-- Name: compras compras_proveedor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_proveedor_id_foreign FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON DELETE RESTRICT;


--
-- Name: compras compras_usuario_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compras
    ADD CONSTRAINT compras_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: costo_servicios costo_servicios_servicio_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.costo_servicios
    ADD CONSTRAINT costo_servicios_servicio_id_foreign FOREIGN KEY (servicio_id) REFERENCES public.servicios(id) ON DELETE CASCADE;


--
-- Name: detalle_compras detalle_compras_compra_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_compra_id_foreign FOREIGN KEY (compra_id) REFERENCES public.compras(id) ON DELETE CASCADE;


--
-- Name: detalle_compras detalle_compras_material_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_material_id_foreign FOREIGN KEY (material_id) REFERENCES public.materiales(id) ON DELETE RESTRICT;


--
-- Name: gruas gruas_operador_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gruas
    ADD CONSTRAINT gruas_operador_id_foreign FOREIGN KEY (operador_id) REFERENCES public.users(id);


--
-- Name: historial_operaciones historial_operaciones_usuario_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_operaciones
    ADD CONSTRAINT historial_operaciones_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: inspeccions inspeccions_firma_responsable_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inspeccions
    ADD CONSTRAINT inspeccions_firma_responsable_id_foreign FOREIGN KEY (firma_responsable_id) REFERENCES public.users(id);


--
-- Name: permiso_user permiso_user_permiso_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso_user
    ADD CONSTRAINT permiso_user_permiso_id_foreign FOREIGN KEY (permiso_id) REFERENCES public.permisos(id) ON DELETE CASCADE;


--
-- Name: permiso_user permiso_user_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permiso_user
    ADD CONSTRAINT permiso_user_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: repuesto_servicios repuesto_servicios_material_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repuesto_servicios
    ADD CONSTRAINT repuesto_servicios_material_id_foreign FOREIGN KEY (material_id) REFERENCES public.materiales(id);


--
-- Name: repuesto_servicios repuesto_servicios_servicio_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repuesto_servicios
    ADD CONSTRAINT repuesto_servicios_servicio_id_foreign FOREIGN KEY (servicio_id) REFERENCES public.servicios(id) ON DELETE CASCADE;


--
-- Name: respaldos respaldos_creado_por_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respaldos
    ADD CONSTRAINT respaldos_creado_por_foreign FOREIGN KEY (creado_por) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: servicios servicios_boca_mina_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_boca_mina_id_foreign FOREIGN KEY (boca_mina_id) REFERENCES public.bocaminas(id);


--
-- Name: servicios servicios_responsable_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_responsable_id_foreign FOREIGN KEY (responsable_id) REFERENCES public.users(id);


--
-- Name: servicios servicios_tipo_mantenimiento_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_tipo_mantenimiento_id_foreign FOREIGN KEY (tipo_mantenimiento_id) REFERENCES public.tipo_mantenimientos(id);


--
-- Name: servicios servicios_usuario_registro_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_usuario_registro_id_foreign FOREIGN KEY (usuario_registro_id) REFERENCES public.users(id);


--
-- Name: users users_rol_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_rol_id_foreign FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: vehiculos vehiculos_conductor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_conductor_id_foreign FOREIGN KEY (conductor_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict PJ3QhjxPfIhIsy5ylsUwgT1FzggEu5JdFh3lRMybm5YdJS1iiiK4YUgajcnCbsI

