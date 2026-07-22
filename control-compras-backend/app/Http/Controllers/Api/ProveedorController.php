<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProveedorController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Proveedor::class);
        return response()->json(Proveedor::all());
    }

    public function store(Request $request)
    {
        $this->authorize('create', Proveedor::class);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:500',
            'email' => 'nullable|email:rfc|max:255',
            'nit' => 'nullable|string|max:100',
        ]);

        $proveedor = Proveedor::create($validated);
        return response()->json($proveedor, 201);
    }

    public function show($id)
    {
        $proveedor = Proveedor::findOrFail($id);
        $this->authorize('view', $proveedor);
        return response()->json($proveedor);
    }

    public function update(Request $request, $id)
    {
        $proveedor = Proveedor::findOrFail($id);
        $this->authorize('update', $proveedor);
        
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:500',
            'email' => 'nullable|email:rfc|max:255',
            'nit' => 'nullable|string|max:100',
            'estado' => 'boolean',
        ]);

        $proveedor->update($validated);
        return response()->json($proveedor);
    }

    public function destroy($id)
    {
        $proveedor = Proveedor::findOrFail($id);
        $this->authorize('delete', $proveedor);

        try {
            $proveedor->delete();
            return response()->json(['message' => 'Proveedor eliminado de manera definitiva']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar el proveedor porque tiene compras asociadas.'
            ], 422);
        }
    }

    public function uploadLogo(Request $request, $id)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        $proveedor = Proveedor::findOrFail($id);
        $this->authorize('update', $proveedor);

        if ($proveedor->logo) {
            Storage::disk('public')->delete($proveedor->logo);
        }

        $path = $request->file('logo')->store('proveedores', 'public');
        $proveedor->update(['logo' => $path]);

        return response()->json($proveedor);
    }

    public function deleteLogo($id)
    {
        $proveedor = Proveedor::findOrFail($id);

        if ($proveedor->logo) {
            Storage::disk('public')->delete($proveedor->logo);
            $proveedor->update(['logo' => null]);
        }

        return response()->json($proveedor);
    }
}
