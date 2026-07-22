<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    public function index()
    {
        return response()->json(User::with(['rol', 'permisos'])->get());
    }

    public function store(Request $request)
    {
        if (!$request->user()->canWrite('usuarios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => [
                'required',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'rol_id' => 'required|exists:roles,id',
            'permisos' => 'nullable|array',
            'permisos.*' => 'exists:permisos,id'
        ]);

        // Prevent duplicate Administrador General
        $adminRol = \App\Models\Rol::where('nombre', 'Administrador General')->first();
        if ($adminRol && $validated['rol_id'] == $adminRol->id) {
            $adminExists = User::where('rol_id', $adminRol->id)->where('estado', true)->exists();
            if ($adminExists) {
                return response()->json([
                    'message' => 'Ya existe un Administrador General activo en el sistema.'
                ], 422);
            }
        }

        $validated['password'] = Hash::make($validated['password']);
        $permisoIds = $validated['permisos'] ?? [];
        unset($validated['permisos']);

        $user = DB::transaction(function () use ($validated, $permisoIds) {
            $user = User::create($validated);
            $user->permisos()->sync($permisoIds);
            return $user;
        });
        
        return response()->json($user->load(['rol', 'permisos']), 201);
    }

    public function show($id)
    {
        return response()->json(User::with(['rol', 'permisos'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->canWrite('usuarios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }

        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $id,
            'password' => [
                'nullable',
                Password::min(8)
                    ->letters()
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
            'rol_id' => 'required|exists:roles,id',
            'estado' => 'boolean',
            'permisos' => 'nullable|array',
            'permisos.*' => 'exists:permisos,id'
        ]);

        // Prevent duplicate Administrador General
        $adminRol = \App\Models\Rol::where('nombre', 'Administrador General')->first();
        if ($adminRol && $validated['rol_id'] == $adminRol->id) {
            $adminExists = User::where('rol_id', $adminRol->id)
                ->where('id', '!=', $id)
                ->where('estado', true)
                ->exists();
            if ($adminExists) {
                return response()->json([
                    'message' => 'Ya existe un Administrador General activo en el sistema.'
                ], 422);
            }
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Prevent admin from deactivating themselves
        if (isset($validated['estado']) && !$validated['estado'] && $user->id === $request->user()->id) {
            return response()->json([
                'message' => 'No puede desactivar su propia cuenta.'
            ], 422);
        }

        $permisoIds = $validated['permisos'] ?? [];
        unset($validated['permisos']);

        DB::transaction(function () use ($user, $validated, $permisoIds) {
            $user->update($validated);
            $user->permisos()->sync($permisoIds);
        });
        
        return response()->json($user->load(['rol', 'permisos']));
    }

    public function destroy($id, Request $request)
    {
        if (!$request->user()->canWrite('usuarios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        // Prevent admin from deleting themselves
        if ((int) $id === $request->user()->id) {
            return response()->json([
                'message' => 'No puede eliminar su propia cuenta.'
            ], 422);
        }

        $user = User::findOrFail($id);
        try {
            $user->delete();
            return response()->json(['message' => 'Usuario eliminado de manera definitiva']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar el usuario porque tiene transacciones registradas.'
            ], 422);
        }
    }
}
