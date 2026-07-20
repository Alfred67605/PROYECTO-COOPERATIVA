<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Auto-detect Laravel root folder for cPanel hosting
if (file_exists(__DIR__ . '/control-compras-backend/vendor/autoload.php')) {
    $backendDir = __DIR__ . '/control-compras-backend';
} elseif (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    $backendDir = __DIR__ . '/..';
} elseif (file_exists(__DIR__ . '/vendor/autoload.php')) {
    $backendDir = __DIR__;
} else {
    die('Laravel backend folder not found.');
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = $backendDir . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require $backendDir . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require $backendDir . '/bootstrap/app.php')
    ->handleRequest(Request::capture());

