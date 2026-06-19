<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GruasController extends Controller
{
    public function index()
    {
        $gruas = \App\Models\Grua::with('operador')->get();
        return response()->json($gruas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|string|max:255',
            'codigo' => 'required|string|max:255',
            'capacidad_carga' => 'nullable|numeric',
            'operador_id' => 'nullable|exists:users,id',
            'estado' => 'nullable|string|max:20',
        ]);

        $grua = \App\Models\Grua::create($validated);
        return response()->json($grua, 201);
    }

    public function show(string $id)
    {
        $grua = \App\Models\Grua::with(['operador', 'servicios.costos', 'servicios.repuestos'])->findOrFail($id);
        return response()->json($grua);
    }

    public function update(Request $request, string $id)
    {
        $grua = \App\Models\Grua::findOrFail($id);
        
        $validated = $request->validate([
            'tipo' => 'sometimes|required|string|max:255',
            'codigo' => 'sometimes|required|string|max:255',
            'capacidad_carga' => 'nullable|numeric',
            'operador_id' => 'nullable|exists:users,id',
            'estado' => 'nullable|string|max:20',
        ]);

        $grua->update($validated);
        return response()->json($grua);
    }

    public function destroy(string $id)
    {
        $grua = \App\Models\Grua::findOrFail($id);
        $grua->delete();
        return response()->json(null, 204);
    }
}
