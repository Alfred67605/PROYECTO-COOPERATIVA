<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            // Generic error message to avoid user enumeration (CWE-204)
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $user = Auth::user();
        if (!$user->estado) {
            Auth::logout();
            return response()->json([
                'message' => 'Usuario inactivo. Contacte al administrador.'
            ], 403);
        }

        // Regenerar sesión solo si está disponible (SPA con cookie) 
        // En API stateless no hay sesión — se omite para evitar el 500
        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        $user->load(['rol', 'permisos']);

        Log::info('Login exitoso', ['user_id' => $user->id, 'ip' => $request->ip()]);

        return response()->json([
            'message' => 'Login exitoso',
            'user'    => $user
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $user->load(['rol', 'permisos']);
        return response()->json($user);
    }
}

