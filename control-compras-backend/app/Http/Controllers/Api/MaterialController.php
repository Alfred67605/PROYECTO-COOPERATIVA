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
        $this->authorize('viewAny', Material::class);
        $query = Material::where('estado', 'disponible');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('codigo', 'ilike', "%{$search}%")
                  ->orWhere('descripcion', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('grupo')) {
            $query->where('grupo', $request->input('grupo'));
        }

        return response()->json(['data' => $query->orderBy('grupo')->orderBy('codigo')->get()]);
    }

    public function grupos()
    {
        return response()->json(
            Material::where('estado', 'disponible')
                ->select('grupo')
                ->distinct()
                ->orderBy('grupo')
                ->pluck('grupo')
        );
    }

    public function store(Request $request)
    {
        $this->authorize('create', Material::class);

        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:materiales,codigo',
            'descripcion' => 'required|string|max:500',
            'grupo' => 'nullable|string|max:100',
        ]);

        $material = Material::create($validated);
        return response()->json($material, 201);
    }

    public function show($id)
    {
        $material = Material::findOrFail($id);
        $this->authorize('view', $material);
        return response()->json($material);
    }

    public function update(Request $request, $id)
    {
        $material = Material::findOrFail($id);
        $this->authorize('update', $material);
        
        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:materiales,codigo,' . $id,
            'descripcion' => 'required|string|max:500',
            'grupo' => 'nullable|string|max:100',
            'estado' => 'nullable|string|max:20',
        ]);

        $material->update($validated);
        return response()->json($material);
    }

    public function destroy($id)
    {
        $material = Material::findOrFail($id);
        $this->authorize('delete', $material);
        
        $rawImagen = $material->getRawOriginal('imagen');
        if ($rawImagen) {
            Storage::disk('public')->delete($rawImagen);
        }

        $material->update([
            'estado' => 'inactivo',
            'imagen' => null
        ]);
        
        return response()->json(['message' => 'Material marcado como inactivo']);
    }

    public function uploadImagen(Request $request, $id)
    {
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);
        $material = Material::findOrFail($id);
        $this->authorize('update', $material);

        $rawImagen = $material->getRawOriginal('imagen');
        if ($rawImagen) {
            Storage::disk('public')->delete($rawImagen);
        }

        $path = $request->file('imagen')->store('materiales', 'public');
        $material->update(['imagen' => $path]);

        return response()->json(['message' => 'Imagen subida', 'path' => asset('storage/' . $path)]);
    }

    public function deleteImagen($id)
    {
        $material = Material::findOrFail($id);
        $this->authorize('update', $material);

        $rawImagen = $material->getRawOriginal('imagen');
        if ($rawImagen) {
            Storage::disk('public')->delete($rawImagen);
            $material->update(['imagen' => null]);
        }
        return response()->json(['message' => 'Imagen eliminada']);
    }
}
