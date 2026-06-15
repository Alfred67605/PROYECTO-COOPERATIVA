<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bocamina;
use Illuminate\Http\Request;

class BocaminaController extends Controller
{
    public function index()
    {
        return response()->json(Bocamina::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'ubicacion' => 'nullable|string',
            'estado' => 'boolean',
            'responsable' => 'nullable|string',
        ]);

        $bocamina = Bocamina::create($validated);
        return response()->json($bocamina, 201);
    }

    public function show($id)
    {
        return response()->json(Bocamina::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $bocamina = Bocamina::findOrFail($id);
        
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'ubicacion' => 'nullable|string',
            'estado' => 'boolean',
            'responsable' => 'nullable|string',
        ]);

        $bocamina->update($validated);
        return response()->json($bocamina);
    }

    public function destroy($id)
    {
        Bocamina::findOrFail($id)->update(['estado' => false]);
        return response()->json(['message' => 'Bocamina inhabilitada']);
    }
}
