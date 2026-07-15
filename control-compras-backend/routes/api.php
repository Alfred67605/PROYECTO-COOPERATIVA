<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BocaminaController;
use App\Http\Controllers\Api\CompraController;
use App\Http\Controllers\Api\HistorialController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\ProveedorController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\UsuarioController;
use Illuminate\Support\Facades\Route;

// Auth públicas — Rate limited para proteger contra brute force
Route::middleware('throttle:login')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Rutas protegidas — Rate limited globalmente
Route::middleware(['auth:sanctum', 'throttle:api', 'audit'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Admin Only — Gestión de usuarios, roles y permisos
    Route::middleware('role:Administrador General')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
        Route::get('/roles', [RolController::class, 'index']);
        Route::get('/permisos', [\App\Http\Controllers\Api\PermisoController::class, 'index']);
    });

    // Auditoría / Historial — Admin + Gerencia + permiso auditoria
    Route::middleware('role:Administrador General,Gerencia,auditoria')->group(function () {
        Route::get('/historial', [HistorialController::class, 'index']);
        Route::get('/historial/{id}', [HistorialController::class, 'show']);
    });

    // Materiales
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
    Route::apiResource('gruas', \App\Http\Controllers\Api\GruasController::class);
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
        Route::get('/reportes/dashboard', [ReporteController::class, 'dashboard']);
        Route::get('/reportes/generar', [ReporteController::class, 'generarReporte']);
        Route::get('/reportes/exportar/pdf', [ReporteController::class, 'exportarPdf']);
        Route::get('/reportes/exportar/excel', [ReporteController::class, 'exportarExcel']);
    });
});


