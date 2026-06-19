<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReporteController extends Controller
{
    public function dashboard()
    {
        $totalCompras = Compra::count();
        $gastoTotalCompras = Compra::sum('total');
        
        $gastoTotalServicios = 0;
        $serviciosAll = \App\Models\Servicio::with(['costos', 'repuestos', 'bocamina'])->get();
        foreach ($serviciosAll as $s) {
            $gastoTotalServicios += $s->costos->sum('monto') + $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });
        }
        $gastoTotal = $gastoTotalCompras + $gastoTotalServicios;
        
        $totalProveedores = \App\Models\Proveedor::count();
        $totalBocaminas = \App\Models\Bocamina::count();
        
        $gastosBocamina = Compra::select('bocaminas.nombre', DB::raw('SUM(compras.total) as total_gastado'))
            ->join('bocaminas', 'compras.bocamina_id', '=', 'bocaminas.id')
            ->groupBy('bocaminas.id', 'bocaminas.nombre')
            ->get()
            ->keyBy('nombre');
            
        foreach ($serviciosAll as $s) {
            if ($s->boca_mina_id) {
                $nombre = $s->bocamina->nombre ?? 'Central';
                $costo = $s->costos->sum('monto') + $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });
                if ($costo > 0) {
                    if (isset($gastosBocamina[$nombre])) {
                        $gastosBocamina[$nombre]->total_gastado += $costo;
                    } else {
                        $gastosBocamina[$nombre] = (object)['nombre' => $nombre, 'total_gastado' => $costo];
                    }
                }
            }
        }
        $gastosBocamina = $gastosBocamina->sortByDesc('total_gastado')->values();
            
        $comprasRecientes = Compra::with(['proveedor', 'bocamina'])
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        return response()->json([
            'total_compras' => $totalCompras,
            'gasto_total' => $gastoTotal,
            'total_proveedores' => $totalProveedores,
            'total_bocaminas' => $totalBocaminas,
            'gastos_por_bocamina' => $gastosBocamina,
            'compras_recientes' => $comprasRecientes
        ]);
    }

    public function generarReporte(Request $request)
    {
        $inicio = $request->query('inicio', now()->startOfMonth()->toDateString());
        $fin = $request->query('fin', now()->endOfMonth()->toDateString());
        
        $inicio = \Carbon\Carbon::parse($inicio)->startOfDay();
        $fin = \Carbon\Carbon::parse($fin)->endOfDay();

        $comprasQuery = Compra::whereBetween('fecha', [$inicio, $fin]);

        $gastoTotalCompras = $comprasQuery->sum('total');
        $totalOperaciones = $comprasQuery->count();

        $serviciosAll = \App\Models\Servicio::with(['costos', 'repuestos', 'bocamina'])
            ->whereBetween('fecha', [$inicio, $fin])
            ->get();

        $gastoTotalServicios = 0;
        foreach ($serviciosAll as $s) {
            $gastoTotalServicios += $s->costos->sum('monto') + $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });
        }
        $gastoTotal = $gastoTotalCompras + $gastoTotalServicios;

        $gastosBocamina = Compra::whereBetween('compras.fecha', [$inicio, $fin])
            ->select('bocaminas.nombre', DB::raw('SUM(compras.total) as total_gastado'))
            ->join('bocaminas', 'compras.bocamina_id', '=', 'bocaminas.id')
            ->groupBy('bocaminas.id', 'bocaminas.nombre')
            ->get()
            ->keyBy('nombre');
            
        foreach ($serviciosAll as $s) {
            if ($s->boca_mina_id) {
                $nombre = $s->bocamina->nombre ?? 'Central';
                $costo = $s->costos->sum('monto') + $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });
                if ($costo > 0) {
                    if (isset($gastosBocamina[$nombre])) {
                        $gastosBocamina[$nombre]->total_gastado += $costo;
                    } else {
                        $gastosBocamina[$nombre] = (object)['nombre' => $nombre, 'total_gastado' => $costo];
                    }
                }
            }
        }
        $gastosBocamina = $gastosBocamina->sortByDesc('total_gastado')->values();
            
        $gastosProveedor = Compra::whereBetween('compras.fecha', [$inicio, $fin])
            ->select('proveedores.nombre', DB::raw('SUM(compras.total) as total_gastado'))
            ->join('proveedores', 'compras.proveedor_id', '=', 'proveedores.id')
            ->groupBy('proveedores.id', 'proveedores.nombre')
            ->orderByDesc('total_gastado')
            ->get();

        $topMateriales = DB::table('detalle_compras')
            ->join('compras', 'detalle_compras.compra_id', '=', 'compras.id')
            ->join('materiales', 'detalle_compras.material_id', '=', 'materiales.id')
            ->whereBetween('compras.fecha', [$inicio, $fin])
            ->select('materiales.descripcion', 'materiales.codigo', DB::raw('SUM(detalle_compras.cantidad) as total_cantidad'), DB::raw('SUM(detalle_compras.subtotal) as total_gastado'))
            ->groupBy('materiales.id', 'materiales.descripcion', 'materiales.codigo')
            ->orderByDesc('total_cantidad')
            ->limit(15)
            ->get();

        $comprasLista = Compra::with(['proveedor', 'bocamina', 'usuario'])
            ->whereBetween('fecha', [$inicio, $fin])
            ->orderByDesc('fecha')
            ->get();

        return response()->json([
            'resumen' => [
                'gasto_total' => $gastoTotal,
                'total_operaciones' => $totalOperaciones,
            ],
            'gastos_bocamina' => $gastosBocamina,
            'gastos_proveedor' => $gastosProveedor,
            'top_materiales' => $topMateriales,
            'compras' => $comprasLista
        ]);
    }

    // Other simple data endpoints
    public function gastos()
    {
        return response()->json(Compra::sum('total'));
    }

    public function gastosBocamina()
    {
        return response()->json(
            Compra::with('bocamina')
                ->select('bocamina_id', DB::raw('SUM(total) as total'))
                ->groupBy('bocamina_id')
                ->get()
        );
    }

    public function materiales()
    {
        return response()->json(Material::all());
    }

    public function comprasPorFecha(Request $request)
    {
        $inicio = $request->query('inicio', now()->subDays(30)->toDateString());
        $fin = $request->query('fin', now()->toDateString());
        
        return response()->json(
            Compra::whereBetween('fecha', [$inicio, $fin])->get()
        );
    }

    public function exportarPdf(Request $request)
    {
        $inicio = $request->query('inicio') ? \Carbon\Carbon::parse($request->query('inicio'))->startOfDay() : null;
        $fin = $request->query('fin') ? \Carbon\Carbon::parse($request->query('fin'))->endOfDay() : null;

        $query = Compra::with(['proveedor', 'bocamina', 'usuario', 'detalles.material'])->orderByDesc('fecha');
        
        if ($inicio && $fin) {
            $query->whereBetween('fecha', [$inicio, $fin]);
            $periodoTexto = "Periodo: " . $inicio->format('d/m/Y') . " - " . $fin->format('d/m/Y');
        } else {
            $periodoTexto = "Histórico Completo";
        }

        $compras = $query->get();

        $gastoTotalCompras = $compras->sum('total');
        
        $queryServicios = \App\Models\Servicio::with(['costos', 'repuestos']);
        if ($inicio && $fin) {
            $queryServicios->whereBetween('fecha', [$inicio, $fin]);
        }
        $servicios = $queryServicios->get();
        $gastoTotalServicios = 0;
        foreach ($servicios as $s) {
            $gastoTotalServicios += $s->costos->sum('monto') + $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });
        }
        
        $gastoTotal = $gastoTotalCompras + $gastoTotalServicios;
        $fecha = now()->format('d/m/Y H:i');

        $html = '<!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <title>Reporte de Compras - Minera Cop</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 30px; color: #1a2332; font-size: 12px; }
            h1 { color: #d96a43; border-bottom: 3px solid #d96a43; padding-bottom: 10px; font-size: 22px; }
            .meta { color: #64748b; margin-bottom: 20px; }
            .summary { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; display: flex; gap: 30px; }
            .summary-item { text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; color: #d96a43; }
            .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #1a2332; color: white; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #f8fafc; }
            .text-right { text-align: right; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            .total-row { background: #f1f5f9; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style></head><body>
        <h1>📋 Reporte de Compras</h1>
        <p class="meta">Minera Cop — Generado el ' . $fecha . ' | ' . $periodoTexto . '</p>
        <div class="summary">
            <div class="summary-item"><div class="summary-value">' . $compras->count() . '</div><div class="summary-label">Total Compras</div></div>
            <div class="summary-item"><div class="summary-value">$' . number_format($gastoTotal, 2) . '</div><div class="summary-label">Gasto Total</div></div>
        </div>
        <table>
            <thead><tr>
                <th>ID</th><th>Fecha</th><th>Proveedor</th><th>Factura</th><th>Bocamina</th><th>Responsable</th><th class="text-right">Total</th>
            </tr></thead><tbody>';

        foreach ($compras as $c) {
            $html .= '<tr>
                <td>#' . $c->id . '</td>
                <td>' . $c->fecha->format('d/m/Y') . '</td>
                <td>' . ($c->proveedor->nombre ?? '-') . '</td>
                <td>' . ($c->numero_factura ?: '-') . '</td>
                <td>' . ($c->bocamina->nombre ?? 'Central') . '</td>
                <td>' . ($c->usuario->nombre ?? '-') . '</td>
                <td class="text-right">$' . number_format($c->total, 2) . '</td>
            </tr>';
        }

        $html .= '<tr class="total-row"><td colspan="6">TOTAL GENERAL</td><td class="text-right">$' . number_format($gastoTotal, 2) . '</td></tr>';
        $html .= '</tbody></table>';
        $html .= '<div class="footer">Reporte generado automáticamente por el Sistema de Control de Compras — Minera Cop</div>';
        $html .= '</body></html>';

        return response($html)
            ->header('Content-Type', 'text/html')
            ->header('Content-Disposition', 'attachment; filename="reporte_compras_' . now()->format('Y-m-d') . '.html"');
    }

    public function exportarExcel(Request $request)
    {
        $inicio = $request->query('inicio') ? \Carbon\Carbon::parse($request->query('inicio'))->startOfDay() : null;
        $fin = $request->query('fin') ? \Carbon\Carbon::parse($request->query('fin'))->endOfDay() : null;

        $query = Compra::with(['proveedor', 'bocamina', 'usuario'])->orderByDesc('fecha');
        if ($inicio && $fin) {
            $query->whereBetween('fecha', [$inicio, $fin]);
        }
        $compras = $query->get();

        $response = new StreamedResponse(function () use ($compras) {
            $handle = fopen('php://output', 'w');
            
            // BOM for Excel UTF-8 compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header row
            fputcsv($handle, [
                'ID',
                'Fecha',
                'Proveedor',
                'NIT Proveedor',
                'Número Factura',
                'Bocamina Destino',
                'Responsable',
                'Observaciones',
                'Total ($)',
                'Estado'
            ]);

            // Data rows
            foreach ($compras as $compra) {
                fputcsv($handle, [
                    $compra->id,
                    $compra->fecha->format('d/m/Y'),
                    $compra->proveedor->nombre ?? '-',
                    $compra->proveedor->nit ?? '-',
                    $compra->numero_factura ?: '-',
                    $compra->bocamina->nombre ?? 'Bodega Central',
                    $compra->usuario->nombre ?? '-',
                    $compra->observaciones ?: '-',
                    number_format($compra->total, 2, '.', ''),
                    $compra->estado ?? 'completada'
                ]);
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="reporte_compras_' . now()->format('Y-m-d') . '.csv"');
        
        return $response;
    }
}
