<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $query = Material::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('codigo', 'ilike', "%{$search}%")
                  ->orWhere('descripcion', 'ilike', "%{$search}%");
        }

        if ($request->has('grupo')) {
            $query->where('grupo', $request->grupo);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|unique:materiales,codigo',
            'descripcion' => 'required|string',
            'grupo' => 'nullable|string',
        ]);

        $material = Material::create($validated);
        return response()->json($material, 201);
    }

    public function show($id)
    {
        $material = Material::findOrFail($id);
        return response()->json($material);
    }

    public function update(Request $request, $id)
    {
        $material = Material::findOrFail($id);
        
        $validated = $request->validate([
            'codigo' => 'required|unique:materiales,codigo,' . $id,
            'descripcion' => 'required|string',
            'grupo' => 'nullable|string',
            'estado' => 'nullable|string',
        ]);

        $material->update($validated);
        return response()->json($material);
    }

    public function destroy($id)
    {
        $material = Material::findOrFail($id);
        $material->update(['estado' => 'inactivo']);
        return response()->json(['message' => 'Material marcado como inactivo']);
    }

    public function uploadImagen(Request $request, $id)
    {
        $request->validate(['imagen' => 'required|image|max:2048']);
        $material = Material::findOrFail($id);

        if ($material->imagen) {
            Storage::disk('public')->delete($material->imagen);
        }

        $path = $request->file('imagen')->store('materiales', 'public');
        $material->update(['imagen' => $path]);

        return response()->json(['message' => 'Imagen subida', 'path' => $path]);
    }

    public function deleteImagen($id)
    {
        $material = Material::findOrFail($id);
        if ($material->imagen) {
            Storage::disk('public')->delete($material->imagen);
            $material->update(['imagen' => null]);
        }
        return response()->json(['message' => 'Imagen eliminada']);
    }
}
