# Análisis de Cuellos de Botella de Rendimiento (Bottleneck Analysis)

Este reporte detalla los posibles cuellos de botella identificados en el sistema de Control de Compras basándose en la arquitectura tecnológica (**Laravel 13, PostgreSQL, PHP 8.3-FPM**).

---

## 1. Módulo: Reportes (PDF y Excel)
* **Endpoint Afectado**: `GET /api/reportes/exportar/pdf` y `GET /api/reportes/exportar/excel`
* **Síntoma**: Tiempos de respuesta que superan los 5 segundos bajo concurrencia moderada (>25 usuarios).
* **Posible Causa**: 
  - La generación de archivos PDF (mediante librerías como dompdf o snappy) consume mucha CPU y memoria RAM.
  - Al ejecutarse de forma **sincrónica** en el ciclo solicitud-respuesta, mantiene bloqueados los hilos (workers) de PHP-FPM, impidiendo atender otras solicitudes rápidas.
* **Impacto**: Bloqueo del servidor web y aumento del tiempo de espera de otros endpoints rápidos (como el login o listados).

---

## 2. Módulo: Auditoría / Historial
* **Endpoint Afectado**: `GET /api/historial`
* **Síntoma**: Degradación exponencial del tiempo de respuesta a medida que crece la base de datos y la concurrencia.
* **Posible Causa**:
  - Búsquedas de texto mediante `ilike` en la columna de nombres de usuario sin la existencia de índices especializados (como índices de expresión o GIN/Trigram).
  - Escaneo secuencial (Sequential Scan) en PostgreSQL sobre la tabla `historial_operaciones` debido al tamaño de los datos auditados.
* **Impacto**: Alto consumo de I/O en la base de datos PostgreSQL, incrementando la latencia a más de 3 segundos por petición.

---

## 3. Módulo: Autenticación e Inicio de Sesión
* **Endpoint Afectado**: `POST /api/login`
* **Síntoma**: Cuello de botella en pruebas de estrés (>100 usuarios concurrentes).
* **Posible Causa**:
  - Hashing de contraseñas de alta seguridad (bcrypt/argon2) que consume intencionalmente bastante CPU por diseño de seguridad.
  - Bloqueo de sesiones de Laravel si se utiliza el driver de sesión `file` (el cual bloquea el archivo de sesión mientras dura la solicitud para evitar escrituras concurrentes).
* **Impacto**: Aumento del tiempo de espera en el login, excediendo la aserción de 1 segundo bajo alta concurrencia.

---

## 4. Módulo: Compras y Detalle de Compras
* **Endpoint Afectado**: `POST /api/compras`
* **Síntoma**: Tiempos de respuesta elevados al crear compras con múltiples detalles.
* **Posible Causa**:
  - Inserciones múltiples dentro de una transacción sin optimización de operaciones masivas (Bulk Inserts).
  - Múltiples consultas de verificación para cada ID de material y proveedor individualmente (problema de consultas redundantes).
* **Impacto**: Bloqueos de tablas o filas en la base de datos PostgreSQL y retraso en la aserción CRUD (>2 segundos).
