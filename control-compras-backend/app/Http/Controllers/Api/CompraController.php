<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompraController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Compra::class);
        
        $query = Compra::with(['proveedor', 'usuario', 'bocamina'])->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('numero_factura', 'ilike', "%{$search}%")
                  ->orWhere('comprador_responsable', 'ilike', "%{$search}%")
                  ->orWhereHas('proveedor', function ($pq) use ($search) {
                      $pq->where('nombre', 'ilike', "%{$search}%");
                  });
            });
        }

        $compras = $query->paginate(15);
        return response()->json($compras);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Compra::class);

        if ($request->has('bocamina_id') && ($request->input('bocamina_id') === '' || $request->input('bocamina_id') === null)) {
            $request->merge(['bocamina_id' => null]);
        }

        $validated = $request->validate([
            'proveedor_id' => 'required|exists:proveedores,id',
            'bocamina_id' => 'nullable|exists:bocaminas,id',
            'fecha' => 'required|date',
            'comprador_responsable' => 'nullable|string|max:255',
            'numero_factura' => 'required|string|max:100',
            'observaciones' => 'nullable|string|max:1000',
            'detalles' => 'required|array|min:1',
            'detalles.*.material_id' => 'required|exists:materiales,id',
            'detalles.*.cantidad' => 'required|numeric|min:0.01|max:999999.99',
            'detalles.*.precio' => 'required|numeric|min:0|max:999999.99',
        ]);

        try {
            DB::beginTransaction();

            $total = 0;
            $compra = Compra::create([
                'proveedor_id' => $validated['proveedor_id'],
                'usuario_id' => $request->user()->id,
                'comprador_responsable' => $validated['comprador_responsable'] ?? null,
                'bocamina_id' => $validated['bocamina_id'] ?? null,
                'fecha' => $validated['fecha'],
                'numero_factura' => $validated['numero_factura'] ?? null,
                'observaciones' => $validated['observaciones'] ?? null,
                'total' => 0,
            ]);

            foreach ($validated['detalles'] as $detalle) {
                $subtotal = $detalle['cantidad'] * $detalle['precio'];
                $total += $subtotal;

                DetalleCompra::create([
                    'compra_id' => $compra->id,
                    'material_id' => $detalle['material_id'],
                    'cantidad' => $detalle['cantidad'],
                    'precio' => $detalle['precio'],
                    'subtotal' => $subtotal,
                ]);
            }

            $compra->update(['total' => $total]);

            DB::commit();

            return response()->json($compra->load('detalles'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al registrar compra', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Error al registrar la compra: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $compra = Compra::with(['proveedor', 'usuario', 'bocamina', 'detalles.material'])->findOrFail($id);
        $this->authorize('view', $compra);
        return response()->json($compra);
    }

    public function destroy($id)
    {
        $compra = Compra::findOrFail($id);
        $this->authorize('delete', $compra);

        try {
            DB::beginTransaction();
            $compra->detalles()->delete();
            $compra->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Compra eliminada exitosamente.'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar compra', [
                'compra_id' => $id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Error al eliminar la compra: ' . $e->getMessage()], 500);
        }
    }
}
