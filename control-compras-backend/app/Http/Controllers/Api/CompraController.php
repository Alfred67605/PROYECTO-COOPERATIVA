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
        
        $query = Compra::with(['proveedor', 'usuario', 'bocamina']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('numero_factura', 'ilike', "%{$search}%")
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

        $validated = $request->validate([
            'proveedor_id' => 'required|exists:proveedores,id',
            'bocamina_id' => 'nullable|exists:bocaminas,id',
            'fecha' => 'required|date',
            'numero_factura' => 'nullable|string|max:100',
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

                // Ya no actualizamos inventario en la tabla materiales porque ahora es solo un catálogo maestro.
            }

            $compra->update(['total' => $total]);

            DB::commit();

            return response()->json($compra->load('detalles'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log the actual error for debugging, never expose to the client (CWE-209)
            Log::error('Error al registrar compra', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Error al registrar la compra'], 500);
        }
    }

    public function show($id)
    {
        $compra = Compra::with(['proveedor', 'usuario', 'bocamina', 'detalles.material'])->findOrFail($id);
        $this->authorize('view', $compra);
        return response()->json($compra);
    }
    
    // Updates and deletes are generally disabled or restricted for accounting records
}
