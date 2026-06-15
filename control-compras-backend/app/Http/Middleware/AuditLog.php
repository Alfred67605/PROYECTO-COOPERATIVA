<?php

namespace App\Http\Middleware;

use App\Models\HistorialOperacion;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuditLog
{
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

        // Para evitar errores si hay problemas con el log, lo metemos en un try-catch
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

            HistorialOperacion::create([
                'usuario_id' => $request->user()->id,
                'accion' => $accion,
                'tabla' => $tabla,
                'registro_id' => $registroId,
                'datos_nuevos' => $request->isMethod('DELETE') ? null : $request->except(['password', 'password_confirmation']),
                'ip' => $request->ip(),
            ]);
        } catch (\Exception $e) {
            // Ignorar errores de auditoría para no afectar la respuesta principal
        }
    }
}
