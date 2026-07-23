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

        if (empty($validated['codigo']) || trim($validated['codigo']) === '') {
            $validated['codigo'] = $this->generarCodigoAutomatico($validated['nombre']);
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

        if (empty($validated['codigo']) || trim($validated['codigo']) === '') {
            $validated['codigo'] = $this->generarCodigoAutomatico($validated['nombre'], $id);
        }

        $categoria->update($validated);

        return response()->json([
            'message' => 'Categoría actualizada exitosamente',
            'data' => $categoria
        ]);
    }

    /**
     * Genera automáticamente un código/prefijo único basado en el nombre de la categoría.
     */
    private function generarCodigoAutomatico(string $nombre, $exceptId = null): string
    {
        $str = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $nombre);
        $clean = strtoupper(preg_replace('/[^A-Za-z0-9\s]/', '', $str ?: $nombre));

        $stopWords = ['DE', 'DEL', 'LA', 'LAS', 'LOS', 'EL', 'Y', 'EN', 'PARA', 'POR', 'UN', 'UNA', 'CON'];
        $words = array_values(array_filter(explode(' ', $clean), function ($w) use ($stopWords) {
            return !empty($w) && !in_array($w, $stopWords);
        }));

        if (empty($words)) {
            $baseCode = 'CAT';
        } elseif (count($words) === 1) {
            $baseCode = substr($words[0], 0, 5);
        } elseif (count($words) === 2) {
            $baseCode = substr($words[0], 0, 4) . '-' . substr($words[1], 0, 1);
        } else {
            $initials = implode('', array_map(fn($w) => substr($w, 0, 1), array_slice($words, 0, 4)));
            $baseCode = strlen($initials) >= 3 ? $initials : substr($words[0], 0, 4) . '-' . substr($words[1], 0, 1);
        }

        $baseCode = strtoupper($baseCode);
        $codigo = $baseCode;
        $counter = 1;

        while (Categoria::where('codigo', $codigo)
            ->when($exceptId, fn($q) => $q->where('id', '!=', $exceptId))
            ->exists()) {
            $codigo = "{$baseCode}-{$counter}";
            $counter++;
        }

        return $codigo;
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
