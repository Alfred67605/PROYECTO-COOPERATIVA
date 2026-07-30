<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class EnforceSingleSession
{
    /**
     * Handle an incoming request.
     * Enforces single active session per user. If another device logs in,
     * the previous session ID will mismatch the active session in Cache
     * and the request will be rejected with 401.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $request->hasSession()) {
            $activeSessionId = Cache::get('user_session_' . $user->id);
            $currentSessionId = $request->session()->getId();

            if ($activeSessionId && $activeSessionId !== $currentSessionId) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return response()->json([
                    'message' => 'Tu sesión ha sido cerrada porque se inició sesión desde otro dispositivo.'
                ], 401);
            }

            // If no active session recorded in cache yet, register current session ID
            if (!$activeSessionId) {
                Cache::put('user_session_' . $user->id, $currentSessionId, now()->addHours(24));
            }
        }

        return $next($request);
    }
}
