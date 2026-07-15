<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Arguments can be role names OR permission names.
     * Access is granted if the user's role matches any argument,
     * or if the user has a special permission matching any argument.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string[]  ...$allowed  Role names or permission names
     */
    public function handle(Request $request, Closure $next, ...$allowed): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        $user->load(['rol', 'permisos']);

        // Admin always passes
        if ($user->rol->nombre === 'Administrador General') {
            return $next($request);
        }

        // Check if the user's role is directly in the allowed list
        if (in_array($user->rol->nombre, $allowed)) {
            return $next($request);
        }

        // Check if the user has access to any of the allowed resources (role defaults or explicit permissions)
        foreach ($allowed as $item) {
            if ($user->canAccess($item)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'No autorizado'], 403);
    }
}
