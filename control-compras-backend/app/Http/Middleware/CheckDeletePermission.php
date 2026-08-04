<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckDeletePermission
{
    /**
     * Intercepta todas las peticiones DELETE.
     * Solo permite eliminar si el usuario es admin o tiene puede_eliminar = true.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('DELETE')) {
            $user = $request->user();

            if ($user && !$user->isAdmin() && !$user->puede_eliminar) {
                return response()->json([
                    'message' => 'No tiene permisos para realizar esta acción.'
                ], 403);
            }
        }

        return $next($request);
    }
}
