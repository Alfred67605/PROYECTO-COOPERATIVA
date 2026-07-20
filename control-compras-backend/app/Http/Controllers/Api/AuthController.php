<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\EmpresaSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'password' => [
                'nullable',
                'confirmed',
                \Illuminate\Validation\Rules\Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $user->nombre = $validated['nombre'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $user->save();

        $user->load(['rol', 'permisos']);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }

    // ─── Avatar Upload ───

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);
        $user->load(['rol', 'permisos']);

        return response()->json([
            'message' => 'Avatar actualizado',
            'user' => $user
        ]);
    }

    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        $user->load(['rol', 'permisos']);

        return response()->json([
            'message' => 'Avatar eliminado',
            'user' => $user
        ]);
    }

    // ─── Empresa Settings ───

    public function getEmpresaSettings()
    {
        return response()->json(EmpresaSetting::instance());
    }

    public function updateEmpresaSettings(Request $request)
    {
        $validated = $request->validate([
            'nombre_empresa' => 'required|string|max:255',
            'subtitulo' => 'nullable|string|max:255',
        ]);

        $settings = EmpresaSetting::instance();
        $settings->update($validated);

        return response()->json([
            'message' => 'Configuración de empresa actualizada',
            'settings' => $settings
        ]);
    }

    public function uploadEmpresaLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp,svg|max:5120',
        ]);

        $settings = EmpresaSetting::instance();

        // Delete old logo if exists
        if ($settings->logo) {
            Storage::disk('public')->delete($settings->logo);
        }

        $path = $request->file('logo')->store('empresa', 'public');
        $settings->update(['logo' => $path]);

        return response()->json([
            'message' => 'Logo actualizado',
            'settings' => $settings
        ]);
    }

    public function deleteEmpresaLogo()
    {
        $settings = EmpresaSetting::instance();

        if ($settings->logo) {
            Storage::disk('public')->delete($settings->logo);
            $settings->update(['logo' => null]);
        }

        return response()->json([
            'message' => 'Logo eliminado',
            'settings' => $settings
        ]);
    }
}
