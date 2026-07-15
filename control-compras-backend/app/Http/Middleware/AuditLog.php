<?php

namespace App\Http\Middleware;

use App\Models\HistorialOperacion;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AuditLog
{
    /**
     * Fields that must NEVER be stored in audit logs.
     * Contains passwords, tokens, secrets, and other sensitive data.
     */
    protected array $sensitiveFields = [
        'password',
        'password_confirmation',
        'current_password',
        '_token',
        '_method',
        'access_token',
        'token',
        'secret',
        'authorization',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response)
    {
        if (!in_array($request->method(), ['POST', 'PUT', 'DELETE'])) {
            return;
        }

        if (!$request->user()) {
            return;
        }

        $path = $request->path();
        if (str_starts_with($path, 'api/')) {
            $path = substr($path, 4);
        }
        
        $segments = explode('/', $path);
        $tabla = $segments[0] ?? 'unknown';
        
        $accion = 'unknown';
        if ($request->isMethod('POST')) $accion = 'crear';
        if ($request->isMethod('PUT')) $accion = 'editar';
        if ($request->isMethod('DELETE')) $accion = 'eliminar';

        try {
            $registroId = $request->route('id') ?? null;
            
            // Si es POST, intentar sacar el ID de la respuesta
            if ($request->isMethod('POST') && $response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                $content = json_decode($response->getContent(), true);
                if (isset($content['id'])) {
                    $registroId = $content['id'];
                } elseif (isset($content['data']['id'])) {
                    $registroId = $content['data']['id'];
                }
            }

            // Filter out sensitive fields before logging
            $datosNuevos = $request->isMethod('DELETE')
                ? null
                : $request->except($this->sensitiveFields);

            HistorialOperacion::create([
                'usuario_id' => $request->user()->id,
                'accion' => $accion,
                'tabla' => $tabla,
                'registro_id' => $registroId,
                'datos_nuevos' => $datosNuevos,
                'ip' => $request->ip(),
            ]);
        } catch (\Exception $e) {
            // Log audit failures instead of silently swallowing them
            Log::warning('Error en auditoría', [
                'error' => $e->getMessage(),
                'path' => $path,
                'user_id' => $request->user()?->id,
            ]);
        }
    }
}
