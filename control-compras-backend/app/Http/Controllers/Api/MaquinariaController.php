<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MaquinariaController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->canAccess('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $maquinarias = \App\Models\Maquinaria::all();
        return response()->json($maquinarias);
    }

    public function store(Request $request)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }

        $validated = $request->validate([
            'tipo' => 'required|string|max:255',
            'nombre_codigo' => 'required|string|max:255',
            'marca' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'placa' => 'nullable|string|max:255',
            'horometro' => 'nullable|numeric',
            'kilometraje' => 'nullable|numeric',
            'estado' => 'nullable|string|max:20',
        ]);

        $maquinaria = \App\Models\Maquinaria::create($validated);
        return response()->json($maquinaria, 201);
    }

    public function show(Request $request, string $id)
    {
        if (!$request->user()->canAccess('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $maquinaria = \App\Models\Maquinaria::with(['servicios.costos', 'servicios.repuestos'])->findOrFail($id);
        return response()->json($maquinaria);
    }

    public function update(Request $request, string $id)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $maquinaria = \App\Models\Maquinaria::findOrFail($id);
        
        $validated = $request->validate([
            'tipo' => 'sometimes|required|string|max:255',
            'nombre_codigo' => 'sometimes|required|string|max:255',
            'marca' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'placa' => 'nullable|string|max:255',
            'horometro' => 'nullable|numeric',
            'kilometraje' => 'nullable|numeric',
            'estado' => 'nullable|string|max:20',
        ]);

        $maquinaria->update($validated);
        return response()->json($maquinaria);
    }

    public function destroy(Request $request, string $id)
    {
        if (!$request->user()->canWrite('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $maquinaria = \App\Models\Maquinaria::withTrashed()->findOrFail($id);
        try {
            $maquinaria->forceDelete();
            return response()->json(['message' => 'Maquinaria eliminada de manera definitiva']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar la maquinaria porque tiene registros asociados.'
            ], 422);
        }
    }
}
