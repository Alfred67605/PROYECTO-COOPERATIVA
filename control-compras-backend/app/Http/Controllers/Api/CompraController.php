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

    public function analisisCategorias(Request $request)
    {
        $fechaInicio = $request->input('fecha_inicio');
        $fechaFin = $request->input('fecha_fin');
        $bocaminaId = $request->input('bocamina_id');
        $proveedorId = $request->input('proveedor_id');
        $categoriaSel = $request->input('categoria');

        $query = DB::table('detalle_compras')
            ->join('compras', 'detalle_compras.compra_id', '=', 'compras.id')
            ->join('materiales', 'detalle_compras.material_id', '=', 'materiales.id')
            ->leftJoin('bocaminas', 'compras.bocamina_id', '=', 'bocaminas.id')
            ->leftJoin('proveedores', 'compras.proveedor_id', '=', 'proveedores.id')
            ->select(
                'materiales.grupo as categoria',
                'materiales.id as material_id',
                'materiales.codigo',
                'materiales.descripcion',
                'bocaminas.id as bocamina_id',
                'bocaminas.nombre as bocamina_nombre',
                'proveedores.id as proveedor_id',
                'proveedores.nombre as proveedor_nombre',
                'compras.id as compra_id',
                'compras.fecha',
                'compras.numero_factura',
                'detalle_compras.cantidad',
                'detalle_compras.precio',
                'detalle_compras.subtotal'
            );

        if ($fechaInicio) {
            $query->where('compras.fecha', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->where('compras.fecha', '<=', $fechaFin);
        }
        if ($bocaminaId) {
            $query->where('compras.bocamina_id', $bocaminaId);
        }
        if ($proveedorId) {
            $query->where('compras.proveedor_id', $proveedorId);
        }

        $rows = $query->get();

        $categoriasGrouped = [];
        $totalGeneralInversion = 0;

        foreach ($rows as $r) {
            $catName = $r->categoria ?: 'Sin Categoría';
            $subtotal = floatval($r->subtotal);
            $totalGeneralInversion += $subtotal;

            if (!isset($categoriasGrouped[$catName])) {
                $categoriasGrouped[$catName] = [
                    'categoria' => $catName,
                    'total_gastado' => 0,
                    'total_cantidad' => 0,
                    'total_ordenes' => 0,
                    'compras_set' => [],
                ];
            }

            $categoriasGrouped[$catName]['total_gastado'] += $subtotal;
            $categoriasGrouped[$catName]['total_cantidad'] += floatval($r->cantidad);
            $categoriasGrouped[$catName]['compras_set'][$r->compra_id] = true;
        }

        $rankingCategorias = [];
        foreach ($categoriasGrouped as $catName => $data) {
            $data['total_ordenes'] = count($data['compras_set']);
            unset($data['compras_set']);
            $data['porcentaje'] = $totalGeneralInversion > 0 ? round(($data['total_gastado'] / $totalGeneralInversion) * 100, 1) : 0;
            $rankingCategorias[] = $data;
        }

        usort($rankingCategorias, fn($a, $b) => $b['total_gastado'] <=> $a['total_gastado']);

        $targetCategory = $categoriaSel;
        if (!$targetCategory && count($rankingCategorias) > 0) {
            $targetCategory = $rankingCategorias[0]['categoria'];
        }

        $materialesGrouped = [];
        foreach ($rows as $r) {
            $catName = $r->categoria ?: 'Sin Categoría';
            if ($targetCategory && strtolower($catName) !== strtolower($targetCategory)) {
                continue;
            }

            $matId = $r->material_id;
            if (!isset($materialesGrouped[$matId])) {
                $materialesGrouped[$matId] = [
                    'material_id' => $matId,
                    'codigo' => $r->codigo,
                    'descripcion' => $r->descripcion,
                    'grupo' => $catName,
                    'total_gastado' => 0,
                    'total_cantidad' => 0,
                    'bocaminas_map' => [],
                    'proveedores_map' => [],
                    'compras_historial' => [],
                ];
            }

            $subtotal = floatval($r->subtotal);
            $cant = floatval($r->cantidad);

            $materialesGrouped[$matId]['total_gastado'] += $subtotal;
            $materialesGrouped[$matId]['total_cantidad'] += $cant;

            $bocName = $r->bocamina_nombre ?: 'Bodega Central';
            if (!isset($materialesGrouped[$matId]['bocaminas_map'][$bocName])) {
                $materialesGrouped[$matId]['bocaminas_map'][$bocName] = ['nombre' => $bocName, 'total_gastado' => 0, 'cantidad' => 0];
            }
            $materialesGrouped[$matId]['bocaminas_map'][$bocName]['total_gastado'] += $subtotal;
            $materialesGrouped[$matId]['bocaminas_map'][$bocName]['cantidad'] += $cant;

            $provName = $r->proveedor_nombre ?: 'Sin Proveedor';
            if (!isset($materialesGrouped[$matId]['proveedores_map'][$provName])) {
                $materialesGrouped[$matId]['proveedores_map'][$provName] = ['nombre' => $provName, 'total_gastado' => 0, 'cantidad' => 0];
            }
            $materialesGrouped[$matId]['proveedores_map'][$provName]['total_gastado'] += $subtotal;
            $materialesGrouped[$matId]['proveedores_map'][$provName]['cantidad'] += $cant;

            $materialesGrouped[$matId]['compras_historial'][] = [
                'compra_id' => $r->compra_id,
                'fecha' => $r->fecha,
                'numero_factura' => $r->numero_factura ?: 'S/F',
                'bocamina' => $bocName,
                'proveedor' => $provName,
                'cantidad' => $cant,
                'precio' => floatval($r->precio),
                'subtotal' => $subtotal,
            ];
        }

        $materialesDetalle = [];
        foreach ($materialesGrouped as $matId => $m) {
            $m['bocaminas'] = array_values($m['bocaminas_map']);
            $m['proveedores'] = array_values($m['proveedores_map']);
            unset($m['bocaminas_map'], $m['proveedores_map']);
            $materialesDetalle[] = $m;
        }

        usort($materialesDetalle, fn($a, $b) => $b['total_gastado'] <=> $a['total_gastado']);

        return response()->json([
            'ranking_categorias' => $rankingCategorias,
            'categoria_seleccionada' => $targetCategory,
            'materiales_detalle' => $materialesDetalle,
            'totales' => [
                'total_inversion' => round($totalGeneralInversion, 2),
                'total_materiales_mostrados' => count($materialesDetalle),
                'top_categoria' => count($rankingCategorias) > 0 ? $rankingCategorias[0]['categoria'] : null,
            ]
        ]);
    }
}
