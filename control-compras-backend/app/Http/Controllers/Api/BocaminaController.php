<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bocamina;
use Illuminate\Http\Request;

class BocaminaController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Bocamina::class);
        return response()->json(Bocamina::all());
    }

    public function store(Request $request)
    {
        $this->authorize('create', Bocamina::class);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'ubicacion' => 'nullable|string|max:500',
            'estado' => 'boolean',
            'responsable' => 'nullable|string|max:255',
        ]);

        $bocamina = Bocamina::create($validated);
        return response()->json($bocamina, 201);
    }

    public function show($id)
    {
        $bocamina = Bocamina::findOrFail($id);
        $this->authorize('view', $bocamina);
        return response()->json($bocamina);
    }

    public function update(Request $request, $id)
    {
        $bocamina = Bocamina::findOrFail($id);
        $this->authorize('update', $bocamina);
        
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'ubicacion' => 'nullable|string|max:500',
            'estado' => 'boolean',
            'responsable' => 'nullable|string|max:255',
        ]);

        $bocamina->update($validated);
        return response()->json($bocamina);
    }

    public function destroy($id)
    {
        $bocamina = Bocamina::findOrFail($id);
        $this->authorize('delete', $bocamina);
        $bocamina->update(['estado' => false]);
        return response()->json(['message' => 'Bocamina inhabilitada']);
    }
}
