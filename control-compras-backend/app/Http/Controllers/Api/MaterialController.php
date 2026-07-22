<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Material::class);
        $query = Material::query();

        if ($request->filled('search')) {
            $search = mb_strtolower(trim($request->input('search')), 'UTF-8');
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(codigo) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(descripcion) LIKE ?', ["%{$search}%"]);
            });
        }

        if ($request->filled('grupo')) {
            $grupoInput = trim($request->input('grupo'));
            $mapping = [
                'G-1'  => 'Material Explosivo',
                'G-2'  => 'Accesorios e Instalaciones',
                'G-3'  => 'Herramientas',
                'G-4'  => 'Lubricantes y Aceites',
                'G-5'  => 'Filtros y Correas',
                'G-6'  => 'Equipos de Protección Personal',
                'G-7'  => 'Herramientas de Mecánica',
                'G-8'  => 'Pinturas y Anticongelantes',
                'G-9'  => 'Material Eléctrico',
                'G-10' => 'Maderas y Tablones',
                'G-11' => 'Otros',
            ];
            $reverseMapping = array_flip($mapping);

            $possibleValues = [$grupoInput];
            if (isset($mapping[$grupoInput])) {
                $possibleValues[] = $mapping[$grupoInput];
            }
            if (isset($reverseMapping[$grupoInput])) {
                $possibleValues[] = $reverseMapping[$grupoInput];
            }

            $query->whereIn('grupo', $possibleValues);
        }

        $materials = $query->orderBy('grupo')->orderBy('codigo')->get();

        return response()->json(['data' => $materials]);
    }

    public function grupos()
    {
        $catNombres = Categoria::where('estado', 'activo')->pluck('nombre')->toArray();
        $matGrupos = Material::where('estado', 'disponible')
            ->select('grupo')
            ->whereNotNull('grupo')
            ->distinct()
            ->pluck('grupo')
            ->toArray();

        $allGrupos = array_values(array_unique(array_filter(array_merge($catNombres, $matGrupos))));
        sort($allGrupos);

        return response()->json($allGrupos);
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
            $path = storage_path('app/public/' . $rawImagen);
            if (file_exists($path)) {
                @unlink($path);
            }
        }

        try {
            $material->delete();
            return response()->json(['message' => 'Material eliminado de manera definitiva']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar el material porque tiene compras o movimientos de inventario asociados.'
            ], 422);
        }
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
            $oldPath = storage_path('app/public/' . $rawImagen);
            if (file_exists($oldPath)) {
                @unlink($oldPath);
            }
        }

        $file = $request->file('imagen');
        $filename = 'materiales/' . uniqid() . '.' . $file->getClientOriginalExtension();
        $destPath = storage_path('app/public/' . $filename);
        $destDir = dirname($destPath);
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }
        $file->move($destDir, basename($destPath));
        $material->update(['imagen' => $filename]);

        return response()->json(['message' => 'Imagen subida', 'path' => asset('storage/' . $filename)]);
    }

    public function deleteImagen($id)
    {
        $material = Material::findOrFail($id);
        $this->authorize('update', $material);

        $rawImagen = $material->getRawOriginal('imagen');
        if ($rawImagen) {
            $path = storage_path('app/public/' . $rawImagen);
            if (file_exists($path)) {
                @unlink($path);
            }
            $material->update(['imagen' => null]);
        }
        return response()->json(['message' => 'Imagen eliminada']);
    }
}
