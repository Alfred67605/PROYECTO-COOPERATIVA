<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlquilerGrua;
use Illuminate\Http\Request;

class AlquilerGruaController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->canAccess('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $alquileres = AlquilerGrua::with('bocamina')->orderBy('created_at', 'desc')->get();
        return response()->json($alquileres);
    }

    public function store(Request $request)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }

        $validated = $request->validate([
            'placa_grua' => 'required|string|max:50',
            'capacidad_carga' => 'nullable|string|max:50',
            'nombre_chofer' => 'required|string|max:100',
            'tiempo_trabajo' => 'nullable|string|max:50',
            'costo' => 'nullable|numeric|min:0',
            'bocamina_id' => 'required|exists:bocaminas,id'
        ]);

        $alquiler = AlquilerGrua::create($validated);
        
        return response()->json($alquiler->load('bocamina'), 201);
    }

    public function show(Request $request, $id)
    {
        if (!$request->user()->canAccess('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $alquiler = AlquilerGrua::with('bocamina')->findOrFail($id);
        return response()->json($alquiler);
    }

    public function update(Request $request, $id)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $alquiler = AlquilerGrua::findOrFail($id);

        $validated = $request->validate([
            'placa_grua' => 'string|max:50',
            'capacidad_carga' => 'nullable|string|max:50',
            'nombre_chofer' => 'string|max:100',
            'tiempo_trabajo' => 'nullable|string|max:50',
            'costo' => 'nullable|numeric|min:0',
            'bocamina_id' => 'exists:bocaminas,id'
        ]);

        $alquiler->update($validated);

        return response()->json($alquiler->load('bocamina'));
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $alquiler = AlquilerGrua::findOrFail($id);
        $alquiler->delete();
        
        return response()->json(['message' => 'Alquiler de grúa eliminado correctamente']);
    }
}
