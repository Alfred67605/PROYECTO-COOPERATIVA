<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class InspeccionController extends Controller
{
    public function index()
    {
        $inspecciones = \App\Models\Inspeccion::with(['responsable', 'equipo'])
            ->orderBy('id', 'desc')
            ->get();
        return response()->json($inspecciones);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'equipo_tipo' => 'required|string',
            'equipo_id' => 'required|integer',
            'motor_ok' => 'boolean',
            'frenos_ok' => 'boolean',
            'aceite_ok' => 'boolean',
            'neumaticos_ok' => 'boolean',
            'luces_ok' => 'boolean',
            'seguridad_ok' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);
        
        $validated['firma_responsable_id'] = $request->user()->id ?? null;

        $inspeccion = \App\Models\Inspeccion::create($validated);
        return response()->json($inspeccion->load(['responsable', 'equipo']), 201);
    }

    public function show(string $id)
    {
        $inspeccion = \App\Models\Inspeccion::with(['responsable', 'equipo'])->findOrFail($id);
        return response()->json($inspeccion);
    }

    public function update(Request $request, string $id)
    {
        $inspeccion = \App\Models\Inspeccion::findOrFail($id);
        $validated = $request->validate([
            'equipo_tipo' => 'sometimes|required|string',
            'equipo_id' => 'sometimes|required|integer',
            'motor_ok' => 'boolean',
            'frenos_ok' => 'boolean',
            'aceite_ok' => 'boolean',
            'neumaticos_ok' => 'boolean',
            'luces_ok' => 'boolean',
            'seguridad_ok' => 'boolean',
            'observaciones' => 'nullable|string',
        ]);

        $inspeccion->update($validated);
        return response()->json($inspeccion->load(['responsable', 'equipo']));
    }

    public function destroy(string $id)
    {
        $inspeccion = \App\Models\Inspeccion::findOrFail($id);
        $inspeccion->delete();
        return response()->json(null, 204);
    }
}
