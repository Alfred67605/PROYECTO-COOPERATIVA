<?php

use Illuminate\Support\Facades\Route;

// Helper route for cPanel hosting to clear config cache
Route::get('/clear-cache', function () {
    try {
        @unlink(base_path('bootstrap/cache/config.php'));
        @unlink(base_path('bootstrap/cache/routes-v7.php'));
        @unlink(base_path('bootstrap/cache/services.php'));
        \Illuminate\Support\Facades\Artisan::call('config:clear');
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        return '¡Caché de configuración limpiada exitosamente! Ahora Laravel leerá tu archivo .env actualizado.';
    } catch (\Throwable $e) {
        return 'Error al limpiar caché: ' . $e->getMessage();
    }
});

// Helper route for cPanel hosting to run migrations directly from browser
Route::get('/migrate', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        return 'Migraciones ejecutadas exitosamente: <pre>' . \Illuminate\Support\Facades\Artisan::output() . '</pre>';
    } catch (\Throwable $e) {
        return 'Error al ejecutar migraciones: ' . $e->getMessage();
    }
});

// Helper route for cPanel hosting to create storage symlink without SSH
Route::get('/symlink', function () {
    $target = storage_path('app/public');
    $shortcut = public_path('storage');
    if (!file_exists($shortcut)) {
        @symlink($target, $shortcut);
        return 'Enlace simbólico creado exitosamente para imágenes';
    }
    return 'El enlace simbólico ya existe';
});

// Helper route for cPanel hosting to reset admin password and ensure admin user exists
Route::get('/reset-admin', function () {
    try {
        $rol = \App\Models\Rol::where('nombre', 'Administrador General')->first();
        if (!$rol) {
            $rol = \App\Models\Rol::create(['nombre' => 'Administrador General', 'descripcion' => 'Administrador del sistema']);
        }
        
        $user = \App\Models\User::where('email', 'admin@cooperativa.com')->first();
        if (!$user) {
            $user = \App\Models\User::create([
                'nombre' => 'Admin Cooperativa',
                'email' => 'admin@cooperativa.com',
                'password' => \Illuminate\Support\Facades\Hash::make('Admin2026!'),
                'rol_id' => $rol->id,
                'estado' => true,
            ]);
            return 'Usuario admin@cooperativa.com creado exitosamente con clave: Admin2026!';
        }

        $user->password = \Illuminate\Support\Facades\Hash::make('Admin2026!');
        $user->estado = true;
        $user->rol_id = $rol->id;
        $user->save();

        return 'Contraseña de admin@cooperativa.com restablecida correctamente a: Admin2026!';
    } catch (\Throwable $e) {
        return 'Error al restablecer admin: ' . $e->getMessage();
    }
});

// Helper route for cPanel hosting to seed database with materials, providers, bocaminas, etc.
Route::get('/seed-db', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        $output = \Illuminate\Support\Facades\Artisan::output();
        $uCount = \App\Models\User::count();
        $mCount = \App\Models\Material::count();
        $cCount = \App\Models\Compra::count();
        return "¡Éxito total! Base de datos poblada completamente con {$uCount} usuarios, {$mCount} materiales, y {$cCount} compras.<br/><pre>{$output}</pre>";
    } catch (\Throwable $e) {
        return 'Error al sembrar base de datos: ' . $e->getMessage() . '<br/><pre>' . $e->getTraceAsString() . '</pre>';
    }
});

// Diagnostic route for cPanel hosting to test PostgreSQL database connection
Route::get('/debug-db', function () {
    $results = [];
    $results['php_version'] = PHP_VERSION;
    $results['pdo_drivers'] = \PDO::getAvailableDrivers();
    $results['db_connection_config'] = config('database.default');
    $results['db_host'] = config('database.connections.pgsql.host');
    $results['db_port'] = config('database.connections.pgsql.port');
    $results['db_database'] = config('database.connections.pgsql.database');
    $results['db_username'] = config('database.connections.pgsql.username');

    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $results['connection_status'] = '¡CONECTADO EXITOSAMENTE A POSTGRESQL!';

        $tables = \Illuminate\Support\Facades\DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        $results['tables_count'] = count($tables);
        $results['tables_list'] = array_map(fn($t) => $t->table_name, $tables);

        $results['users_count'] = \App\Models\User::count();
        $results['roles_count'] = \App\Models\Rol::count();
    } catch (\Throwable $e) {
        $results['connection_status'] = 'ERROR DE CONEXIÓN A LA BASE DE DATOS';
        $results['error_message'] = $e->getMessage();
        $results['error_code'] = $e->getCode();
        $results['error_file'] = $e->getFile() . ':' . $e->getLine();
    }

    return response()->json($results, 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
});

// Serve compiled React SPA (index.html) for all web routes except /api and /sanctum
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api|sanctum|symlink|reset-admin|seed-db|migrate|clear-cache|debug-db).*$');

