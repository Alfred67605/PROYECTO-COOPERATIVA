<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BocaminaController;
use App\Http\Controllers\Api\CompraController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\HistorialController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\ProveedorController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\RespaldoController;
use Illuminate\Support\Facades\Route;

// Public seeder endpoint
Route::get('/seed-db', function () {
    try {
        if (\Illuminate\Support\Facades\DB::table('proveedores')->count() == 0) {
            \Illuminate\Support\Facades\DB::table('proveedores')->insert([
                ['nombre' => 'Maquinarias Mineras S.A.', 'telefono' => '2223344', 'nit' => '10203040', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Herramientas del Sur Ltda.', 'telefono' => '5556677', 'nit' => '50607080', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Insumos Industriales S.R.L.', 'telefono' => '8889900', 'nit' => '90102030', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (\Illuminate\Support\Facades\DB::table('bocaminas')->count() == 0) {
            \Illuminate\Support\Facades\DB::table('bocaminas')->insert([
                ['nombre' => 'Huari Huari', 'ubicacion' => 'Nivel 1, Sector Norte', 'responsable' => 'Juan Torrez', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Gran Suraga', 'ubicacion' => 'Nivel 2, Sector Sur', 'responsable' => 'Juan Carlos Incata', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => '4 Estrellas', 'ubicacion' => 'Nivel 3, Sector Este', 'responsable' => 'Jose Luis Mencacho', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => '17 de Junio', 'ubicacion' => 'Nivel 4, Sector Oeste', 'responsable' => 'Emilio Torrez', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'San Lucas', 'ubicacion' => 'Nivel 5, Sector Centro', 'responsable' => 'Waldo Hanco', 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Bocamina Grande', 'ubicacion' => 'Nivel 6, Sector Principal', 'responsable' => 'Elio Caceres', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        \Illuminate\Support\Facades\DB::statement("DELETE FROM bocaminas WHERE id NOT IN (SELECT MIN(id) FROM bocaminas GROUP BY nombre)");
        \Illuminate\Support\Facades\DB::statement("DELETE FROM proveedores WHERE id NOT IN (SELECT MIN(id) FROM proveedores GROUP BY nombre)");

        \Illuminate\Support\Facades\DB::table('materiales')->truncate();

        $seeder = new \Database\Seeders\MaterialesRealesSeeder();
        $seeder->run();

        $count = \Illuminate\Support\Facades\DB::table('materiales')->count();

        return response()->json([
            'success' => true,
            'message' => "¡Éxito total! Se cargaron {$count} materiales clasificados por grupo, compras iniciales, y se limpiaron los duplicados de bocaminas y proveedores.",
            'count' => $count
        ]);
    } catch (\Throwable $e) {
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

// Diagnostic endpoint — shows exact error from materiales query
Route::get('/debug-materiales', function () {
    try {
        $count = \Illuminate\Support\Facades\DB::table('materiales')->count();
        $first3 = \Illuminate\Support\Facades\DB::table('materiales')->limit(3)->get();
        $grupos = \Illuminate\Support\Facades\DB::table('materiales')
            ->select('grupo')
            ->distinct()
            ->pluck('grupo');

        // Test the exact query the controller uses
        $testQuery = \App\Models\Material::query()
            ->orderBy('grupo')
            ->orderBy('codigo')
            ->limit(5)
            ->get();

        return response()->json([
            'db_connection' => config('database.default'),
            'total_count' => $count,
            'grupos' => $grupos,
            'first_3_raw' => $first3,
            'controller_query_test' => $testQuery,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => collect($e->getTrace())->take(5)->map(fn($t) => ($t['file'] ?? '?') . ':' . ($t['line'] ?? '?'))->toArray(),
        ], 500);
    }
});

// Auth públicas — Rate limited para proteger contra brute force
Route::middleware('throttle:login')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Rutas protegidas — Rate limited globalmente
Route::middleware(['auth:sanctum', 'throttle:api', 'audit'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/avatar', [AuthController::class, 'uploadAvatar']);
    Route::delete('/user/avatar', [AuthController::class, 'deleteAvatar']);

    // Empresa Settings (read for all authenticated users)
    Route::get('/empresa/settings', [AuthController::class, 'getEmpresaSettings']);

    // Admin Only — Gestión de usuarios, roles y permisos
    Route::middleware('role:Administrador General')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
        Route::get('/roles', [RolController::class, 'index']);
        Route::get('/permisos', [\App\Http\Controllers\Api\PermisoController::class, 'index']);
        
        // Respaldos (Backups & Disaster Recovery)
        Route::get('/respaldos', [RespaldoController::class, 'index']);
        Route::get('/respaldos/configuracion', [RespaldoController::class, 'getConfiguracion']);
        Route::put('/respaldos/configuracion', [RespaldoController::class, 'updateConfiguracion']);
        Route::post('/respaldos/crear', [RespaldoController::class, 'crear']);
        Route::get('/respaldos/{id}/descargar', [RespaldoController::class, 'descargar']);
        Route::post('/respaldos/{id}/restaurar', [RespaldoController::class, 'restaurar']);
        Route::post('/respaldos/restaurar-upload', [RespaldoController::class, 'restaurarUpload']);
        Route::delete('/respaldos/{id}', [RespaldoController::class, 'destroy']);

        // Empresa Settings (write — admin only)
        Route::put('/empresa/settings', [AuthController::class, 'updateEmpresaSettings']);
        Route::post('/empresa/logo', [AuthController::class, 'uploadEmpresaLogo']);
        Route::delete('/empresa/logo', [AuthController::class, 'deleteEmpresaLogo']);
    });

    // Auditoría / Historial — Admin + Gerencia + permiso auditoria
    Route::middleware('role:Administrador General,Gerencia,auditoria')->group(function () {
        Route::get('/historial', [HistorialController::class, 'index']);
        Route::get('/historial/{id}', [HistorialController::class, 'show']);
    });

    // Materiales y Categorías
    Route::apiResource('categorias', CategoriaController::class);
    Route::get('/materiales/grupos', [MaterialController::class, 'grupos']);
    Route::apiResource('materiales', MaterialController::class);
    Route::post('/materiales/{id}/imagen', [MaterialController::class, 'uploadImagen']);
    Route::delete('/materiales/{id}/imagen', [MaterialController::class, 'deleteImagen']);

    // Proveedores y Bocaminas
    Route::apiResource('proveedores', ProveedorController::class);
    Route::post('/proveedores/{id}/logo', [ProveedorController::class, 'uploadLogo']);
    Route::delete('/proveedores/{id}/logo', [ProveedorController::class, 'deleteLogo']);
    Route::apiResource('bocaminas', BocaminaController::class);
    Route::apiResource('alquiler-gruas', \App\Http\Controllers\Api\AlquilerGruaController::class);

    // Compras — Admin + Compras + Contabilidad + Gerencia + permiso compras
    Route::middleware('role:Compras,Contabilidad,Gerencia,Administrador General,compras')->group(function () {
        Route::apiResource('compras', CompraController::class);
    });

    // Servicios y Mantenimiento
    Route::apiResource('maquinaria', \App\Http\Controllers\Api\MaquinariaController::class);
    Route::apiResource('vehiculos', \App\Http\Controllers\Api\VehiculosController::class);
    Route::apiResource('servicios', \App\Http\Controllers\Api\ServiciosController::class);
    Route::apiResource('inspecciones', \App\Http\Controllers\Api\InspeccionController::class);
    Route::get('/dashboard-servicios', [\App\Http\Controllers\Api\DashboardServiciosController::class, 'index']);

    // Reportes — Admin + Gerencia + Contabilidad + permiso reportes
    Route::middleware('role:Gerencia,Contabilidad,Administrador General,reportes')->group(function () {
        Route::get('/reportes/gastos', [ReporteController::class, 'gastos']);
        Route::get('/reportes/gastos-bocamina', [ReporteController::class, 'gastosBocamina']);
        Route::get('/reportes/materiales', [ReporteController::class, 'materiales']);
        Route::get('/reportes/compras-fecha', [ReporteController::class, 'comprasPorFecha']);
        Route::get('/reportes/generar', [ReporteController::class, 'generarReporte']);
        Route::get('/reportes/exportar/pdf', [ReporteController::class, 'exportarPdf']);
        Route::get('/reportes/exportar/excel', [ReporteController::class, 'exportarExcel']);
    });
    Route::get('/reportes/dashboard', [ReporteController::class, 'dashboard'])->middleware('role:Administrador General,dashboard');
});


