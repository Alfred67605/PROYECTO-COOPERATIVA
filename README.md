# PROYECTO-COOPERATIVA - Sistema de Control de Compras

Este proyecto está dividido en dos partes principales:
1. **Backend**: Desarrollado con PHP (Laravel 13).
2. **Frontend**: Desarrollado con React 19, Vite, TypeScript y TailwindCSS.

A continuación, se detallan los pasos exactos para configurar y ejecutar todo el proyecto en una nueva computadora.

---

## 🛠️ Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu PC antes de comenzar:

- **[PHP](https://www.php.net/downloads)** (Versión 8.3 o superior). Puedes verificarlo ejecutando `php -v` en la terminal.
- **[Composer](https://getcomposer.org/download/)**: Gestor de dependencias de PHP. Puedes verificarlo con `composer -v`.
- **[Node.js](https://nodejs.org/es/)** (Se recomienda la versión LTS, >= 20.x). Puedes verificarlo con `node -v` y `npm -v`.
- **Base de Datos**: Por defecto, el backend está configurado para utilizar **SQLite** (no requiere instalar un gestor adicional). Si deseas usar MySQL/PostgreSQL, debes tener el servidor correspondiente instalado y corriendo.

---

## 🚀 Configuración y Ejecución del Backend

El backend gestiona la base de datos, la API y la lógica de negocio. 

### Pasos:

1. **Abrir la terminal** y navegar a la carpeta del backend:
   ```bash
   cd control-compras-backend
   ```

2. **Instalar dependencias de PHP**:
   Ejecuta el siguiente comando para que Composer descargue todos los paquetes necesarios.
   ```bash
   composer install
   ```

3. **Configurar las variables de entorno**:
   Copia el archivo de ejemplo para crear tu propio archivo `.env`.
   - **En Windows (CMD/PowerShell)**: 
     ```bash
     copy .env.example .env
     ```
   - *(O simplemente renombra/duplica el archivo `.env.example` a `.env` manualmente desde el explorador de archivos).*

4. **Generar la clave de la aplicación**:
   ```bash
   php artisan key:generate
   ```

5. **Configurar la base de datos (SQLite)**:
   Por defecto, el archivo `.env` usa `DB_CONNECTION=sqlite`. Para que funcione, crea el archivo de la base de datos vacío.
   - En la carpeta `control-compras-backend/database`, crea un archivo llamado `database.sqlite` (puedes crear un archivo de texto vacío y cambiarle el nombre).
   - *Nota: Si vas a usar MySQL, edita el archivo `.env` y cambia `DB_CONNECTION=mysql`, y descomenta las líneas de `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` poniendo tus credenciales.*

6. **Ejecutar las migraciones**:
   Esto creará las tablas necesarias en la base de datos.
   ```bash
   php artisan migrate
   ```
   *(Si usas SQLite y no creaste el archivo del paso 5, Laravel te preguntará si deseas crearlo. Responde que "sí" / "yes").*

7. **Iniciar el servidor del Backend**:
   ```bash
   php artisan serve
   ```
   El backend estará disponible en: **http://127.0.0.1:8000** (Déjalo corriendo en esta terminal).

---

## 🎨 Configuración y Ejecución del Frontend

El frontend es la interfaz gráfica donde interactuarán los usuarios.

### Pasos:

1. **Abrir una NUEVA ventana de terminal** (no cierres la del backend) y navegar a la carpeta del frontend:
   ```bash
   cd control-compras-frontend
   ```

2. **Instalar las dependencias de Node.js**:
   Ejecuta el siguiente comando para que NPM descargue todos los paquetes (React, Tailwind, etc.).
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo del Frontend**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   El comando anterior te mostrará una URL (por lo general es **http://localhost:5173**). Ábrela en tu navegador (Chrome, Edge, Firefox, etc.) para ver la aplicación funcionando.

---

## 📝 Resumen de Comandos Rápidos (Para el Día a Día)

Una vez que ya configuraste todo por primera vez, las próximas veces que enciendas la PC solo necesitas ejecutar dos comandos (en dos terminales distintas):

**Terminal 1 (Backend):**
```bash
cd control-compras-backend
php artisan serve
```

**Terminal 2 (Frontend):**
```bash
cd control-compras-frontend
npm run dev
```

---

## 🐞 Posibles Problemas Comunes

- **Error: "php no se reconoce como un comando interno o externo"**: 
  Necesitas agregar la ruta de instalación de PHP a las Variables de Entorno (PATH) de Windows.
- **Error: "CORS" en el frontend**:
  Asegúrate de que la URL del frontend esté permitida en la configuración CORS del backend de Laravel (`config/cors.php` o archivo `.env` si aplica).
- **La base de datos dice "no such table"**:
  Te faltó correr las migraciones en el backend (`php artisan migrate`).
