<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CompraController extends Controller
{
    public function index()
    {
        $compras = Compra::with(['proveedor', 'usuario', 'bocamina'])->paginate(15);
        return response()->json($compras);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'proveedor_id' => 'required|exists:proveedores,id',
            'bocamina_id' => 'nullable|exists:bocaminas,id',
            'fecha' => 'required|date',
            'numero_factura' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'detalles' => 'required|array|min:1',
            'detalles.*.material_id' => 'required|exists:materiales,id',
            'detalles.*.cantidad' => 'required|numeric|min:0.01',
            'detalles.*.precio' => 'required|numeric|min:0',
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
            return response()->json(['message' => 'Error al registrar la compra', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $compra = Compra::with(['proveedor', 'usuario', 'bocamina', 'detalles.material'])->findOrFail($id);
        return response()->json($compra);
    }
    
    // Updates and deletes are generally disabled or restricted for accounting records
}
