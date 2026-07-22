<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VehiculosController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->canAccess('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $vehiculos = \App\Models\Vehiculo::with('conductor')->get();
        return response()->json($vehiculos);
    }

    public function store(Request $request)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }

        $validated = $request->validate([
            'tipo' => 'required|string|max:255',
            'placa' => 'required|string|max:255',
            'marca' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'conductor_id' => 'nullable|exists:users,id',
            'estado' => 'nullable|string|max:20',
        ]);

        $vehiculo = \App\Models\Vehiculo::create($validated);
        return response()->json($vehiculo, 201);
    }

    public function show(Request $request, string $id)
    {
        if (!$request->user()->canAccess('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $vehiculo = \App\Models\Vehiculo::with(['conductor', 'servicios.costos', 'servicios.repuestos'])->findOrFail($id);
        return response()->json($vehiculo);
    }

    public function update(Request $request, string $id)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $vehiculo = \App\Models\Vehiculo::findOrFail($id);
        
        $validated = $request->validate([
            'tipo' => 'sometimes|required|string|max:255',
            'placa' => 'sometimes|required|string|max:255',
            'marca' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'conductor_id' => 'nullable|exists:users,id',
            'estado' => 'nullable|string|max:20',
        ]);

        $vehiculo->update($validated);
        return response()->json($vehiculo);
    }

    public function destroy(Request $request, string $id)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $vehiculo = \App\Models\Vehiculo::withTrashed()->findOrFail($id);
        try {
            $vehiculo->forceDelete();
            return response()->json(['message' => 'Vehículo eliminado de manera definitiva']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar el vehículo porque tiene registros asociados.'
            ], 422);
        }
    }
}
