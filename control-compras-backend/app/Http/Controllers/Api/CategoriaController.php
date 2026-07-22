<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Categoria::class);

        $query = Categoria::query();

        if ($request->filled('search')) {
            $search = mb_strtolower(trim($request->input('search')), 'UTF-8');
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nombre) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(codigo) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(descripcion) LIKE ?', ["%{$search}%"]);
            });
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $categorias = $query->orderBy('nombre')->get();

        return response()->json(['data' => $categorias]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Categoria::class);

        $validated = $request->validate([
            'nombre' => 'required|string|max:150|unique:categorias,nombre',
            'codigo' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'nullable|string|max:20',
        ]);

        if (empty($validated['estado'])) {
            $validated['estado'] = 'activo';
        }

        $categoria = Categoria::create($validated);

        return response()->json([
            'message' => 'Categoría creada exitosamente',
            'data' => $categoria,
            'id' => $categoria->id
        ], 201);
    }

    public function show($id)
    {
        $categoria = Categoria::findOrFail($id);
        $this->authorize('view', $categoria);
        return response()->json(['data' => $categoria]);
    }

    public function update(Request $request, $id)
    {
        $categoria = Categoria::findOrFail($id);
        $this->authorize('update', $categoria);

        $validated = $request->validate([
            'nombre' => 'required|string|max:150|unique:categorias,nombre,' . $id,
            'codigo' => 'nullable|string|max:50',
            'descripcion' => 'nullable|string|max:500',
            'estado' => 'nullable|string|max:20',
        ]);

        $categoria->update($validated);

        return response()->json([
            'message' => 'Categoría actualizada exitosamente',
            'data' => $categoria
        ]);
    }

    public function destroy($id)
    {
        $categoria = Categoria::findOrFail($id);
        $this->authorize('delete', $categoria);

        try {
            $categoria->delete();
            return response()->json(['message' => 'Categoría eliminada de manera definitiva']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar la categoría porque tiene materiales asociados.'
            ], 422);
        }
    }
}
