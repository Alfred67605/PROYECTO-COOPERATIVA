# Plan de Recomendaciones de Optimización de Rendimiento

Este informe presenta recomendaciones estratégicas para resolver los cuellos de botella identificados en el sistema sin necesidad de reescribir la lógica de negocio de la aplicación.

---

## 1. Optimización en la Base de Datos (PostgreSQL)

### A. Creación de Índices Trigram (GIN) para Búsquedas Case-Insensitive
Para mejorar el rendimiento de la búsqueda en la sección de Auditoría (`GET /api/historial`) que utiliza `ilike "%{search}%"`:
* **Recomendación**: Habilitar la extensión de trigramas en PostgreSQL y añadir un índice GIN en la columna `nombre` de la tabla `users` y en columnas de búsqueda habituales.
* **SQL**:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX idx_users_nombre_trgm ON users USING gin (nombre gin_trgm_ops);
  CREATE INDEX idx_historial_operaciones_tabla ON historial_operaciones (tabla);
  ```

### B. Implementación de Connection Pooling (PgBouncer)
En escenarios de alta concurrencia (como el Escenario 4 y 7), PostgreSQL puede quedarse sin hilos de conexión disponibles, aumentando la latencia de establecimiento de conexión.
* **Recomendación**: Instalar y configurar **PgBouncer** como pooler de conexiones en modo transaccional (Transaction Mode) delante de PostgreSQL.

---

## 2. Optimización en el Backend (Laravel y PHP)

### A. Cambiar Driver de Sesiones a Redis
El driver de sesión por defecto de Laravel (`file`) realiza bloqueos sobre los archivos de sesión del servidor para evitar colisiones de escritura, lo cual paraliza las peticiones concurrentes de un mismo usuario.
* **Recomendación**: Modificar el archivo `.env` del backend para utilizar **Redis** como driver de caché y sesión.
  ```env
  SESSION_DRIVER=redis
  CACHE_STORE=redis
  ```

### B. Habilitar OPcache y JIT en PHP 8.3
OPcache compila el código PHP una sola vez y lo guarda en memoria RAM, evitando que PHP-FPM tenga que parsear los archivos en cada petición.
* **Recomendación**: Asegurar la siguiente configuración en el archivo `php.ini` del servidor de producción:
  ```ini
  opcache.enable=1
  opcache.memory_consumption=128
  opcache.interned_strings_buffer=8
  opcache.max_accelerated_files=10000
  opcache.validate_timestamps=0 ; Deshabilitar en producción para máxima velocidad
  opcache.jit=1255 ; Habilitar compilación JIT
  ```

### C. Generación Asíncrona de Reportes (Colas/Queues)
Para evitar que los procesos de PHP-FPM se bloqueen durante la generación pesada de PDFs o Excel:
* **Recomendación**: Pasar de generación síncrona a asíncrona mediante **Laravel Queues (Redis/Database)**. El usuario solicita el reporte, el backend encola el trabajo y el frontend consulta periódicamente (polling o WebSockets) si el archivo ya está disponible en almacenamiento en la nube (S3/Local).

---

## 3. Servidor Web y PHP-FPM (Nginx / Apache)

### Sintonización de workers en PHP-FPM
Si el servidor se queda sin workers libres para procesar código PHP concurrentemente:
* **Recomendación**: Ajustar los límites de procesos en el pool de PHP-FPM (`www.conf`):
  ```ini
  pm = dynamic
  pm.max_children = 50 ; Aumentar según la RAM disponible (aprox 30MB por proceso)
  pm.start_servers = 10
  pm.min_spare_servers = 5
  pm.max_spare_servers = 15
  ```
