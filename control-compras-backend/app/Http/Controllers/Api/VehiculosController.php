<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VehiculosController extends Controller
{
    public function index()
    {
        $vehiculos = \App\Models\Vehiculo::with('conductor')->get();
        return response()->json($vehiculos);
    }

    public function store(Request $request)
    {
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

    public function show(string $id)
    {
        $vehiculo = \App\Models\Vehiculo::with(['conductor', 'servicios.costos', 'servicios.repuestos'])->findOrFail($id);
        return response()->json($vehiculo);
    }

    public function update(Request $request, string $id)
    {
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

    public function destroy(string $id)
    {
        $vehiculo = \App\Models\Vehiculo::findOrFail($id);
        $vehiculo->delete();
        return response()->json(null, 204);
    }
}
