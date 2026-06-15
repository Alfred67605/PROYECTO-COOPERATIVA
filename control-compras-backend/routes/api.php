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

// Auth públicas
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware(['auth:sanctum', 'audit'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Admin
    Route::middleware('role:Administrador General')->group(function () {
        Route::apiResource('usuarios', UsuarioController::class);
        Route::get('/roles', [RolController::class, 'index']);
        Route::get('/historial', [HistorialController::class, 'index']);
        Route::get('/historial/{id}', [HistorialController::class, 'show']);
    });

    // Materiales
    Route::apiResource('materiales', MaterialController::class);
    Route::post('/materiales/{id}/imagen', [MaterialController::class, 'uploadImagen']);
    Route::delete('/materiales/{id}/imagen', [MaterialController::class, 'deleteImagen']);

    // Proveedores y Bocaminas
    Route::apiResource('proveedores', ProveedorController::class);
    Route::apiResource('bocaminas', BocaminaController::class);

    // Compras (Compras / Admin)
    Route::middleware('role:Compras,Administrador General')->group(function () {
        Route::apiResource('compras', CompraController::class);
    });

    // Reportes (Gerencia / Contabilidad / Admin)
    Route::middleware('role:Gerencia,Contabilidad,Administrador General')->group(function () {
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
