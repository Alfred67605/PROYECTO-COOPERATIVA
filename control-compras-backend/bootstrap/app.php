<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\ThrottleRequestsException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register named middleware aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'audit' => \App\Http\Middleware\AuditLog::class,
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        ]);

        // Append global middleware for all requests
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Append sanitization middleware to API requests
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ], append: [
            \App\Http\Middleware\SanitizeInput::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Always render JSON for API requests
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Customize throttle exception response
        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Demasiadas solicitudes. Intente nuevamente más tarde.',
                ], 429);
            }
        });

        // Customize 403 authorization exception response
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                $user = $request->user();
                $nombre = $user ? $user->nombre : 'Usuario';
                return response()->json([
                    'message' => "Usuario {$nombre}, no tienes los permisos para hacer ninguna modificación.",
                ], 403);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, Request $request) {
            if ($request->is('api/*')) {
                $user = $request->user();
                $nombre = $user ? $user->nombre : 'Usuario';
                return response()->json([
                    'message' => "Usuario {$nombre}, no tienes los permisos para hacer ninguna modificación.",
                ], 403);
            }
        });

        // In production, never expose internal error details via API
        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*') && app()->environment('production')) {
                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;

                if ($status >= 500) {
                    return response()->json([
                        'message' => 'Error interno del servidor.',
                    ], $status);
                }
            }
        });
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        try {
            $setting = \App\Models\EmpresaSetting::first();
            $frecuencia = $setting->backup_frecuencia ?? 'semanal';
            $hora = $setting->backup_hora ?? '02:00';
            $diaSemana = strtolower($setting->backup_dia_semana ?? 'domingo');
            $diaMes = (int)($setting->backup_dia_mes ?? 1);

            if ($frecuencia === 'desactivado') {
                return;
            }

            $diasMap = [
                'domingo' => 0,
                'lunes' => 1,
                'martes' => 2,
                'miercoles' => 3,
                'jueves' => 4,
                'viernes' => 5,
                'sabado' => 6,
            ];
            $diaNum = $diasMap[$diaSemana] ?? 0;

            if ($frecuencia === 'diario') {
                $schedule->command('backup:run')->dailyAt($hora);
            } elseif ($frecuencia === 'semanal') {
                $schedule->command('backup:run')->weeklyOn($diaNum, $hora);
            } elseif ($frecuencia === 'mensual') {
                $schedule->command('backup:run')->monthlyOn($diaMes, $hora);
            }
        } catch (\Throwable $t) {
            $schedule->command('backup:run')->weeklyOn(0, '02:00');
        }
    })
    ->create();
