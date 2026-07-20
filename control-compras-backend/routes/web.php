<?php

use Illuminate\Support\Facades\Route;

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

// Serve compiled React SPA (index.html) for all web routes except /api and /sanctum
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api|sanctum).*$');

