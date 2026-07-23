<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;

class ReporteController extends Controller
{
    public function dashboard()
    {
        $year = request('year', date('Y'));

        // 1. Estadísticas de Compras
        $totalCompras = Compra::whereYear('fecha', $year)->count();
        $gastoTotalCompras = (float)Compra::whereYear('fecha', $year)->sum('total');

        // 2. Estadísticas de Servicios y Mantenimientos
        $serviciosQuery = \App\Models\Servicio::with(['costos', 'repuestos', 'bocamina'])
            ->whereYear('fecha', $year);
        $totalServiciosCount = (float)$serviciosQuery->count();
        $serviciosAll = $serviciosQuery->get();

        $alquilerGruasQuery = \App\Models\AlquilerGrua::with('bocamina')
            ->whereYear('created_at', $year);
        $totalAlquilerGruas = (float)$alquilerGruasQuery->count();
        $alquilerGruasAll = $alquilerGruasQuery->get();

        $totalServicios = $totalServiciosCount + $totalAlquilerGruas;

        $gastoTotalServicios = 0.0;
        foreach ($serviciosAll as $s) {
            $gastoTotalServicios += (float)($s->costos->sum('monto') + $s->repuestos->sum(function($r) {
                return $r->cantidad * $r->costo_unitario;
            }));
        }

        foreach ($alquilerGruasAll as $g) {
            $gastoTotalServicios += (float)($g->costo ?? 0);
        }

        $gastoTotal = $gastoTotalCompras + $gastoTotalServicios;

        // 3. Métricas Globales
        $totalProveedores = \App\Models\Proveedor::count();
        $totalBocaminas = \App\Models\Bocamina::count();
        $totalMateriales = \App\Models\Material::count();

        // 4. Distribución por Bocamina (Compras + Servicios)
        $gastosBocaminaMap = [];

        $bocaminasBd = \App\Models\Bocamina::all();
        foreach ($bocaminasBd as $b) {
            $gastosBocaminaMap[$b->nombre] = [
                'nombre' => $b->nombre,
                'compras' => 0.0,
                'servicios' => 0.0,
                'total_gastado' => 0.0,
            ];
        }

        $comprasBocamina = Compra::select('bocaminas.nombre', DB::raw('SUM(compras.total) as total_gastado'))
            ->join('bocaminas', 'compras.bocamina_id', '=', 'bocaminas.id')
            ->whereYear('compras.fecha', $year)
            ->groupBy('bocaminas.id', 'bocaminas.nombre')
            ->get();

        foreach ($comprasBocamina as $cb) {
            $nombre = $cb->nombre;
            if (!isset($gastosBocaminaMap[$nombre])) {
                $gastosBocaminaMap[$nombre] = ['nombre' => $nombre, 'compras' => 0.0, 'servicios' => 0.0, 'total_gastado' => 0.0];
            }
            $gastosBocaminaMap[$nombre]['compras'] += (float)$cb->total_gastado;
            $gastosBocaminaMap[$nombre]['total_gastado'] += (float)$cb->total_gastado;
        }

        foreach ($serviciosAll as $s) {
            $nombre = $s->bocamina->nombre ?? 'Bodega Central';
            $costo = (float)($s->costos->sum('monto') + $s->repuestos->sum(fn($r) => $r->cantidad * $r->costo_unitario));
            if ($costo > 0 || $s->bocamina) {
                if (!isset($gastosBocaminaMap[$nombre])) {
                    $gastosBocaminaMap[$nombre] = ['nombre' => $nombre, 'compras' => 0.0, 'servicios' => 0.0, 'total_gastado' => 0.0];
                }
                $gastosBocaminaMap[$nombre]['servicios'] += $costo;
                $gastosBocaminaMap[$nombre]['total_gastado'] += $costo;
            }
        }

        foreach ($alquilerGruasAll as $g) {
            $nombre = $g->bocamina->nombre ?? 'Bodega Central';
            $costo = (float)($g->costo ?? 0);
            if ($costo > 0 || $g->bocamina) {
                if (!isset($gastosBocaminaMap[$nombre])) {
                    $gastosBocaminaMap[$nombre] = ['nombre' => $nombre, 'compras' => 0.0, 'servicios' => 0.0, 'total_gastado' => 0.0];
                }
                $gastosBocaminaMap[$nombre]['servicios'] += $costo;
                $gastosBocaminaMap[$nombre]['total_gastado'] += $costo;
            }
        }

        $gastosBocamina = collect(array_values($gastosBocaminaMap))
            ->filter(fn($item) => $item['total_gastado'] > 0)
            ->sortByDesc('total_gastado')
            ->values();

        // 5. Tendencia Mensual (Compras vs Servicios)
        $mesesNombres = [
            1 => 'Ene', 2 => 'Feb', 3 => 'Mar', 4 => 'Abr', 5 => 'May', 6 => 'Jun',
            7 => 'Jul', 8 => 'Ago', 9 => 'Sep', 10 => 'Oct', 11 => 'Nov', 12 => 'Dic'
        ];

        $tendenciaMensualMap = [];
        for ($m = 1; $m <= 12; $m++) {
            $tendenciaMensualMap[$m] = [
                'name' => $mesesNombres[$m],
                'compras' => 0.0,
                'servicios' => 0.0,
                'gastos' => 0.0,
            ];
        }

        $tendenciaDiariaMap = [];

        // Sumar Compras
        $comprasYear = Compra::whereYear('fecha', $year)->get();
        foreach ($comprasYear as $compra) {
            $fecha = \Carbon\Carbon::parse($compra->fecha);
            $m = (int)$fecha->format('n');
            $d = $fecha->toDateString();
            $dFormatted = $fecha->format('d/m');
            $total = (float)$compra->total;

            if (isset($tendenciaMensualMap[$m])) {
                $tendenciaMensualMap[$m]['compras'] += $total;
                $tendenciaMensualMap[$m]['gastos'] += $total;
            }

            if (!isset($tendenciaDiariaMap[$d])) {
                $tendenciaDiariaMap[$d] = [
                    'name' => $dFormatted,
                    'date' => $d,
                    'compras' => 0.0,
                    'servicios' => 0.0,
                    'gastos' => 0.0,
                ];
            }
            $tendenciaDiariaMap[$d]['compras'] += $total;
            $tendenciaDiariaMap[$d]['gastos'] += $total;
        }

        // Sumar Servicios
        foreach ($serviciosAll as $servicio) {
            $fecha = \Carbon\Carbon::parse($servicio->fecha);
            $m = (int)$fecha->format('n');
            $d = $fecha->toDateString();
            $dFormatted = $fecha->format('d/m');
            $total = (float)($servicio->costos->sum('monto') + $servicio->repuestos->sum(fn($r) => $r->cantidad * $r->costo_unitario));

            if (isset($tendenciaMensualMap[$m])) {
                $tendenciaMensualMap[$m]['servicios'] += $total;
                $tendenciaMensualMap[$m]['gastos'] += $total;
            }

            if (!isset($tendenciaDiariaMap[$d])) {
                $tendenciaDiariaMap[$d] = [
                    'name' => $dFormatted,
                    'date' => $d,
                    'compras' => 0.0,
                    'servicios' => 0.0,
                    'gastos' => 0.0,
                ];
            }
            $tendenciaDiariaMap[$d]['servicios'] += $total;
            $tendenciaDiariaMap[$d]['gastos'] += $total;
        }

        // Sumar Alquiler de Grúas
        foreach ($alquilerGruasAll as $grua) {
            $fecha = \Carbon\Carbon::parse($grua->created_at);
            $m = (int)$fecha->format('n');
            $d = $fecha->toDateString();
            $dFormatted = $fecha->format('d/m');
            $total = (float)($grua->costo ?? 0);

            if (isset($tendenciaMensualMap[$m])) {
                $tendenciaMensualMap[$m]['servicios'] += $total;
                $tendenciaMensualMap[$m]['gastos'] += $total;
            }

            if (!isset($tendenciaDiariaMap[$d])) {
                $tendenciaDiariaMap[$d] = [
                    'name' => $dFormatted,
                    'date' => $d,
                    'compras' => 0.0,
                    'servicios' => 0.0,
                    'gastos' => 0.0,
                ];
            }
            $tendenciaDiariaMap[$d]['servicios'] += $total;
            $tendenciaDiariaMap[$d]['gastos'] += $total;
        }

        ksort($tendenciaDiariaMap);
        $tendenciaDiaria = array_values($tendenciaDiariaMap);
        $tendenciaMensual = array_values($tendenciaMensualMap);

        // 6. Actividad Reciente Consolidada (Compras + Servicios + Grúas)
        $comprasRecientes = Compra::with(['proveedor', 'bocamina'])
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(function($c) {
                return [
                    'id' => 'compra_' . $c->id,
                    'tipo' => 'compra',
                    'titulo' => 'Compra #' . ($c->numero_factura ?: $c->id),
                    'subtitulo' => $c->proveedor->nombre ?? 'Proveedor Desconocido',
                    'bocamina' => $c->bocamina->nombre ?? 'Bodega Central',
                    'monto' => (float)$c->total,
                    'fecha' => $c->fecha,
                ];
            });

        $serviciosRecientes = \App\Models\Servicio::with(['bocamina', 'costos', 'repuestos', 'equipo'])
            ->orderByDesc('fecha')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(function($s) {
                $costo = (float)($s->costos->sum('monto') + $s->repuestos->sum(fn($r) => $r->cantidad * $r->costo_unitario));
                $equipoNombre = $s->equipo->nombre ?? $s->equipo->nombre_codigo ?? $s->equipo->placa ?? ($s->descripcion ?: 'Servicio Técnico');
                return [
                    'id' => 'servicio_' . $s->id,
                    'tipo' => 'servicio',
                    'titulo' => ($s->codigo ? $s->codigo . ' - ' : '') . 'Mantenimiento',
                    'subtitulo' => $equipoNombre,
                    'bocamina' => $s->bocamina->nombre ?? 'Bodega Central',
                    'monto' => $costo,
                    'fecha' => $s->fecha,
                ];
            });

        $alquileresRecientes = \App\Models\AlquilerGrua::with('bocamina')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(function($g) {
                return [
                    'id' => 'grua_' . $g->id,
                    'tipo' => 'servicio',
                    'titulo' => 'Alquiler Grúa - ' . $g->placa_grua,
                    'subtitulo' => $g->nombre_chofer ?: 'Grúa',
                    'bocamina' => $g->bocamina->nombre ?? 'Bodega Central',
                    'monto' => (float)($g->costo ?? 0),
                    'fecha' => $g->created_at ? $g->created_at->toDateString() : date('Y-m-d'),
                ];
            });

        $actividadReciente = $comprasRecientes->concat($serviciosRecientes)->concat($alquileresRecientes)
            ->sortByDesc('fecha')
            ->values()
            ->take(6);

        return response()->json([
            'total_compras' => $totalCompras,
            'total_servicios' => $totalServicios,
            'gasto_compras' => $gastoTotalCompras,
            'gasto_servicios' => $gastoTotalServicios,
            'gasto_total' => $gastoTotal,
            'total_materiales' => $totalMateriales,
            'total_proveedores' => $totalProveedores,
            'total_bocaminas' => $totalBocaminas,
            'gastos_por_bocamina' => $gastosBocamina,
            'actividad_reciente' => $actividadReciente,
            'compras_recientes' => $comprasRecientes,
            'tendencia_mensual' => $tendenciaMensual,
            'tendencia_diaria' => $tendenciaDiaria
        ]);
    }

    public function generarReporte(Request $request)
    {
        // Normalizar bocamina_id: string vacío → null para que la validación no falle
        $bocaminaId = $request->query('bocamina_id');
        if ($bocaminaId === '' || $bocaminaId === 'null') {
            $bocaminaId = null;
        }
        $tipo = $request->query('tipo', 'todos'); // 'todos', 'compras', 'servicios'

        $request->validate([
            'inicio'      => 'nullable|date',
            'fin'         => 'nullable|date',
            'bocamina_id' => 'nullable|integer|exists:bocaminas,id',
        ]);

        // La columna `fecha` es de tipo DATE en la BD — usamos formato YYYY-MM-DD
        $inicioRaw = $request->query('inicio', now()->startOfMonth()->toDateString());
        $finRaw    = $request->query('fin',    now()->endOfMonth()->toDateString());

        $inicioStr = \Carbon\Carbon::parse($inicioRaw)->toDateString();
        $finStr    = \Carbon\Carbon::parse($finRaw)->toDateString();

        $comprasLista = collect();
        $gastoTotalCompras = 0;
        $totalOperacionesCompras = 0;
        
        $serviciosAll = collect();
        $gastoTotalServicios = 0;
        $totalOperacionesServicios = 0;

        // ── Compras ──
        if ($tipo === 'compras' || $tipo === 'todos') {
            $comprasQuery = Compra::whereDate('fecha', '>=', $inicioStr)
                                  ->whereDate('fecha', '<=', $finStr);
            if ($bocaminaId) {
                $comprasQuery->where('bocamina_id', $bocaminaId);
            }
            $comprasLista = $comprasQuery->with(['proveedor', 'bocamina', 'usuario', 'detalles.material'])->orderByDesc('fecha')->get();
            $gastoTotalCompras = (float)$comprasLista->sum('total');
            $totalOperacionesCompras = $comprasLista->count();
        }

        // ── Servicios ──
        if ($tipo === 'servicios' || $tipo === 'todos') {
            $serviciosQuery = \App\Models\Servicio::with(['costos', 'repuestos.material', 'bocamina', 'responsable', 'equipo'])
                ->whereDate('fecha', '>=', $inicioStr)
                ->whereDate('fecha', '<=', $finStr);
            if ($bocaminaId) {
                $serviciosQuery->where('boca_mina_id', $bocaminaId);
            }
            $serviciosAll = $serviciosQuery->orderByDesc('fecha')->get();
            foreach ($serviciosAll as $s) {
                $gastoTotalServicios += $s->costos->sum('monto')
                    + $s->repuestos->sum(fn($r) => $r->cantidad * $r->costo_unitario);
            }
            $totalOperacionesServicios = $serviciosAll->count();
        }

        $gastoTotal = $gastoTotalCompras + $gastoTotalServicios;
        $totalOperaciones = $totalOperacionesCompras + $totalOperacionesServicios;

        // ── Gastos por Bocamina ──
        $gastosBocamina = collect();
        if ($tipo === 'compras' || $tipo === 'todos') {
            $gastosBocaminaQuery = Compra::whereDate('compras.fecha', '>=', $inicioStr)
                                         ->whereDate('compras.fecha', '<=', $finStr);
            if ($bocaminaId) {
                $gastosBocaminaQuery->where('compras.bocamina_id', $bocaminaId);
            }
            $gastosBocamina = $gastosBocaminaQuery
                ->select('bocaminas.nombre', DB::raw('SUM(compras.total) as total_gastado'))
                ->join('bocaminas', 'compras.bocamina_id', '=', 'bocaminas.id')
                ->groupBy('bocaminas.id', 'bocaminas.nombre')
                ->get()
                ->keyBy('nombre');
        }

        if ($tipo === 'servicios' || $tipo === 'todos') {
            foreach ($serviciosAll as $s) {
                if ($s->boca_mina_id) {
                    $nombre = $s->bocamina->nombre ?? 'Central';
                    $costo  = $s->costos->sum('monto')
                        + $s->repuestos->sum(fn($r) => $r->cantidad * $r->costo_unitario);
                    if ($costo > 0) {
                        if (isset($gastosBocamina[$nombre])) {
                            $gastosBocamina[$nombre]->total_gastado += $costo;
                        } else {
                            $gastosBocamina[$nombre] = (object)['nombre' => $nombre, 'total_gastado' => $costo];
                        }
                    }
                }
            }
        }
        $gastosBocamina = collect($gastosBocamina)->sortByDesc('total_gastado')->values();

        // ── Gastos por Proveedor ──
        $gastosProveedor = collect();
        if ($tipo === 'compras' || $tipo === 'todos') {
            $gastosProveedorQuery = Compra::whereDate('compras.fecha', '>=', $inicioStr)
                                          ->whereDate('compras.fecha', '<=', $finStr);
            if ($bocaminaId) {
                $gastosProveedorQuery->where('compras.bocamina_id', $bocaminaId);
            }
            $gastosProveedor = $gastosProveedorQuery
                ->select('proveedores.nombre', DB::raw('SUM(compras.total) as total_gastado'))
                ->join('proveedores', 'compras.proveedor_id', '=', 'proveedores.id')
                ->groupBy('proveedores.id', 'proveedores.nombre')
                ->orderByDesc('total_gastado')
                ->get();
        }

        // ── Top Materiales ──
        $topMateriales = collect();
        if ($tipo === 'compras' || $tipo === 'todos') {
            $topMaterialesQuery = DB::table('detalle_compras')
                ->join('compras',    'detalle_compras.compra_id',   '=', 'compras.id')
                ->join('materiales', 'detalle_compras.material_id', '=', 'materiales.id')
                ->whereDate('compras.fecha', '>=', $inicioStr)
                ->whereDate('compras.fecha', '<=', $finStr);
            if ($bocaminaId) {
                $topMaterialesQuery->where('compras.bocamina_id', $bocaminaId);
            }
            $topMateriales = $topMaterialesQuery
                ->select(
                    'materiales.descripcion',
                    'materiales.codigo',
                    DB::raw('SUM(detalle_compras.cantidad) as total_cantidad'),
                    DB::raw('SUM(detalle_compras.subtotal) as total_gastado')
                )
                ->groupBy('materiales.id', 'materiales.descripcion', 'materiales.codigo')
                ->orderByDesc('total_cantidad')
                ->limit(15)
                ->get();
        }

        return response()->json([
            'resumen' => [
                'gasto_total'       => $gastoTotal,
                'total_operaciones' => $totalOperaciones,
            ],
            'gastos_bocamina'  => $gastosBocamina,
            'gastos_proveedor' => $gastosProveedor,
            'top_materiales'   => $topMateriales,
            'compras'          => $comprasLista,
            'servicios'        => $serviciosAll,
        ]);
    }

    // Other simple data endpoints
    public function gastos()
    {
        return response()->json(Compra::sum('total'));
    }

    public function gastosBocamina(Request $request)
    {
        $inicio = $request->query('inicio', now()->subDays(30)->startOfDay()->toDateString());
        $fin = $request->query('fin', now()->endOfDay()->toDateString());
        $bocaminaId = $request->query('bocamina_id');

        $inicioStr = \Carbon\Carbon::parse($inicio)->toDateString();
        $finStr = \Carbon\Carbon::parse($fin)->toDateString();

        $comprasQuery = Compra::whereDate('compras.fecha', '>=', $inicioStr)->whereDate('compras.fecha', '<=', $finStr);
        if ($bocaminaId) {
            $comprasQuery->where('compras.bocamina_id', $bocaminaId);
        }

        $gastosBocamina = $comprasQuery->select('bocaminas.nombre', 'bocaminas.id as bocamina_id', DB::raw('SUM(compras.total) as total_gastado'))
            ->join('bocaminas', 'compras.bocamina_id', '=', 'bocaminas.id')
            ->groupBy('bocaminas.id', 'bocaminas.nombre')
            ->get()
            ->keyBy('nombre');

        $serviciosQuery = \App\Models\Servicio::with(['costos', 'repuestos', 'bocamina'])
            ->whereDate('fecha', '>=', $inicioStr)->whereDate('fecha', '<=', $finStr);
            
        if ($bocaminaId) {
            $serviciosQuery->where('boca_mina_id', $bocaminaId);
        }

        $serviciosAll = $serviciosQuery->get();

        foreach ($serviciosAll as $s) {
            if ($s->boca_mina_id) {
                $nombre = $s->bocamina->nombre ?? 'Central';
                $costo = $s->costos->sum('monto') + $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });
                if ($costo > 0) {
                    if (isset($gastosBocamina[$nombre])) {
                        $gastosBocamina[$nombre]->total_gastado += $costo;
                    } else {
                        $gastosBocamina[$nombre] = clone $s->bocamina;
                        $gastosBocamina[$nombre]->bocamina_id = $s->boca_mina_id;
                        $gastosBocamina[$nombre]->nombre = $nombre;
                        $gastosBocamina[$nombre]->total_gastado = $costo;
                    }
                }
            }
        }
        
        $gastosBocaminaList = collect($gastosBocamina)->map(function ($item) {
            return [
                'bocamina_id' => $item->bocamina_id ?? null,
                'nombre' => $item->nombre,
                'total_gastado' => $item->total_gastado
            ];
        })->sortByDesc('total_gastado')->values();

        return response()->json($gastosBocaminaList);
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
        $inicioRaw = $request->query('inicio');
        $finRaw = $request->query('fin');
        $inicioStr = $inicioRaw ? \Carbon\Carbon::parse($inicioRaw)->toDateString() : null;
        $finStr    = $finRaw ? \Carbon\Carbon::parse($finRaw)->toDateString() : null;
        $bocaminaId = $request->query('bocamina_id');
        if ($bocaminaId === '' || $bocaminaId === 'null') {
            $bocaminaId = null;
        }
        $tipo = $request->query('tipo', 'todos'); // 'todos', 'compras', 'servicios'

        $compras = collect();
        $gastoTotalCompras = 0;
        $servicios = collect();
        $gastoTotalServicios = 0;

        $periodoTexto = ($inicioStr && $finStr) 
            ? 'Periodo: ' . \Carbon\Carbon::parse($inicioStr)->format('d/m/Y') . ' - ' . \Carbon\Carbon::parse($finStr)->format('d/m/Y')
            : 'Histórico Completo';

        if ($bocaminaId) {
            $bocamina = \App\Models\Bocamina::find($bocaminaId);
            $bocaminaNombre = $bocamina ? $bocamina->nombre : 'Desconocida';
            $periodoTexto .= ' | Bocamina: ' . $bocaminaNombre;
        }

        if ($tipo === 'compras' || $tipo === 'todos') {
            $query = Compra::with(['proveedor', 'bocamina', 'usuario', 'detalles.material'])->orderByDesc('fecha');
            if ($inicioStr && $finStr) {
                $query->whereDate('fecha', '>=', $inicioStr)->whereDate('fecha', '<=', $finStr);
            }
            if ($bocaminaId) {
                $query->where('bocamina_id', $bocaminaId);
            }
            $compras = $query->get();
            $gastoTotalCompras = $compras->sum('total');
        }

        if ($tipo === 'servicios' || $tipo === 'todos') {
            $queryServicios = \App\Models\Servicio::with(['costos', 'repuestos.material', 'bocamina', 'responsable', 'equipo']);
            if ($inicioStr && $finStr) {
                $queryServicios->whereDate('fecha', '>=', $inicioStr)->whereDate('fecha', '<=', $finStr);
            }
            if ($bocaminaId) {
                $queryServicios->where('boca_mina_id', $bocaminaId);
            }
            $servicios = $queryServicios->orderByDesc('fecha')->get();
            foreach ($servicios as $s) {
                $gastoTotalServicios += $s->costos->sum('monto') + $s->repuestos->sum(function ($r) {
                    return $r->cantidad * $r->costo_unitario;
                });
            }
        }

        $gastoTotal = $gastoTotalCompras + $gastoTotalServicios;
        $tz = config('app.timezone', 'America/La_Paz');
        $fecha = now()->setTimezone($tz)->format('d/m/Y H:i');
        $filename = 'reporte_' . $tipo . '_' . now()->setTimezone($tz)->format('Y-m-d') . '.pdf';

        $nombreEmpresa = \App\Models\EmpresaSetting::instance()->nombre_empresa;
        $titulo = 'Reporte de ' . ($tipo === 'todos' ? 'Compras y Servicios' : ($tipo === 'compras' ? 'Compras' : 'Servicios'));

        $pdf = Pdf::loadView('reportes.compras_pdf', compact(
            'compras', 'servicios', 'gastoTotal', 'gastoTotalCompras', 'gastoTotalServicios', 'periodoTexto', 'fecha', 'titulo', 'tipo', 'nombreEmpresa'
        ))->setPaper('a4', 'landscape');

        return $pdf->download($filename);
    }

    public function exportarExcel(Request $request)
    {
        $inicioRaw = $request->query('inicio');
        $finRaw    = $request->query('fin');
        $inicioStr = $inicioRaw ? \Carbon\Carbon::parse($inicioRaw)->toDateString() : null;
        $finStr    = $finRaw    ? \Carbon\Carbon::parse($finRaw)->toDateString()   : null;
        $bocaminaId = $request->query('bocamina_id');
        if ($bocaminaId === '' || $bocaminaId === 'null') {
            $bocaminaId = null;
        }
        $tipo = $request->query('tipo', 'todos'); // 'todos', 'compras', 'servicios'

        $empresaNombre = mb_strtoupper(\App\Models\EmpresaSetting::instance()->nombre_empresa ?: 'EMPRESA MINERA');
        $tz = config('app.timezone', 'America/La_Paz');
        $generadoEl = now()->setTimezone($tz)->format('d/m/Y H:i');

        $spreadsheet = new Spreadsheet();
        
        // Determinar qué hojas crearemos
        $crearCompras = ($tipo === 'compras' || $tipo === 'todos');
        $crearServicios = ($tipo === 'servicios' || $tipo === 'todos');

        $activeSheetIndex = 0;

        if ($crearCompras) {
            $sheet = $activeSheetIndex === 0 ? $spreadsheet->getActiveSheet() : $spreadsheet->createSheet();
            $sheet->setTitle('Compras');
            $activeSheetIndex++;

            $query = Compra::with(['proveedor', 'bocamina', 'usuario', 'detalles.material'])->orderByDesc('fecha');
            if ($inicioStr && $finStr) {
                $query->whereDate('fecha', '>=', $inicioStr)->whereDate('fecha', '<=', $finStr);
            }
            if ($bocaminaId) {
                $query->where('bocamina_id', $bocaminaId);
            }
            $compras = $query->get();

            // ── Título ──
            $sheet->mergeCells('A1:L1');
            $sheet->setCellValue('A1', 'REPORTE DE COMPRAS — ' . $empresaNombre);
            $sheet->getStyle('A1')->applyFromArray([
                'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1A2332']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
            $sheet->getRowDimension(1)->setRowHeight(28);

            // ── Sub-título periodo ──
            $periodoTexto = ($inicioStr && $finStr)
                ? \Carbon\Carbon::parse($inicioStr)->format('d/m/Y') . ' — ' . \Carbon\Carbon::parse($finStr)->format('d/m/Y')
                : 'Histórico Completo';
            if ($bocaminaId) {
                $bocamina = \App\Models\Bocamina::find($bocaminaId);
                $periodoTexto .= '  |  Bocamina: ' . ($bocamina ? $bocamina->nombre : 'Desconocida');
            }

            $sheet->mergeCells('A2:L2');
            $sheet->setCellValue('A2', 'Periodo: ' . $periodoTexto . '   |   Generado el: ' . $generadoEl);
            $sheet->getStyle('A2')->applyFromArray([
                'font'      => ['italic' => true, 'color' => ['rgb' => '64748B']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // ── Encabezados ──
            $headers = ['ID', 'Fecha', 'Materiales / Productos', 'Proveedor', 'NIT Proveedor', 'N° Factura', 'Bocamina', 'Responsable / A Nombre De', 'Registrado Por', 'Observaciones', 'Total (Bs.)', 'Estado'];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . '3', $header);
                $col++;
            }
            $sheet->getStyle('A3:L3')->applyFromArray([
                'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D96A43']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
            ]);
            $sheet->getRowDimension(3)->setRowHeight(20);

            // ── Datos ──
            $row = 4;
            $total = 0;
            foreach ($compras as $compra) {
                $isEven = ($row % 2 === 0);
                $fillColor = $isEven ? 'F8FAFC' : 'FFFFFF';

                $materialesTexto = isset($compra->detalles) && $compra->detalles->count() > 0
                    ? $compra->detalles->map(fn($d) => ($d->material->descripcion ?? $d->material->nombre ?? 'Material') . ' (' . (float)$d->cantidad . ' u.)')->join('; ')
                    : '-';

                $sheet->setCellValue('A' . $row, $compra->id);
                $sheet->setCellValue('B' . $row, $compra->fecha->format('d/m/Y'));
                $sheet->setCellValue('C' . $row, $materialesTexto);
                $sheet->setCellValue('D' . $row, $compra->proveedor->nombre ?? '-');
                $sheet->setCellValue('E' . $row, $compra->proveedor->nit ?? '-');
                $sheet->setCellValue('F' . $row, $compra->numero_factura ?: '-');
                $sheet->setCellValue('G' . $row, $compra->bocamina->nombre ?? 'Bodega Central');
                $sheet->setCellValue('H' . $row, $compra->comprador_responsable ?: ($compra->usuario->nombre ?? '-'));
                $sheet->setCellValue('I' . $row, $compra->usuario->nombre ?? '-');
                $sheet->setCellValue('J' . $row, $compra->observaciones ?: '-');
                $sheet->setCellValue('K' . $row, (float) $compra->total);
                $sheet->setCellValue('L' . $row, $compra->estado ?? 'completada');

                $sheet->getStyle('A' . $row . ':L' . $row)->applyFromArray([
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fillColor]],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                ]);
                $sheet->getStyle('K' . $row)->getNumberFormat()->setFormatCode('#,##0.00');

                $total += $compra->total;
                $row++;
            }

            // ── Fila TOTAL ──
            $sheet->mergeCells('A' . $row . ':J' . $row);
            $sheet->setCellValue('A' . $row, 'TOTAL GENERAL COMPRAS');
            $sheet->setCellValue('K' . $row, $total);
            $sheet->getStyle('A' . $row . ':L' . $row)->applyFromArray([
                'font'    => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1A2332']],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '334155']]],
            ]);
            $sheet->getStyle('K' . $row)->getNumberFormat()->setFormatCode('#,##0.00');

            foreach (range('A', 'L') as $colChar) {
                $sheet->getColumnDimension($colChar)->setAutoSize(true);
            }
        }

        if ($crearServicios) {
            $sheet = $activeSheetIndex === 0 ? $spreadsheet->getActiveSheet() : $spreadsheet->createSheet();
            $sheet->setTitle('Servicios');
            $activeSheetIndex++;

            $queryServicios = \App\Models\Servicio::with(['costos', 'repuestos.material', 'bocamina', 'responsable', 'equipo'])->orderByDesc('fecha');
            if ($inicioStr && $finStr) {
                $queryServicios->whereDate('fecha', '>=', $inicioStr)->whereDate('fecha', '<=', $finStr);
            }
            if ($bocaminaId) {
                $queryServicios->where('boca_mina_id', $bocaminaId);
            }
            $servicios = $queryServicios->get();

            // ── Título ──
            $sheet->mergeCells('A1:I1');
            $sheet->setCellValue('A1', 'REPORTE DE SERVICIOS Y MANTENIMIENTO — ' . $empresaNombre);
            $sheet->getStyle('A1')->applyFromArray([
                'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1A2332']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);
            $sheet->getRowDimension(1)->setRowHeight(28);

            // ── Sub-título periodo ──
            $periodoTexto = ($inicioStr && $finStr)
                ? \Carbon\Carbon::parse($inicioStr)->format('d/m/Y') . ' — ' . \Carbon\Carbon::parse($finStr)->format('d/m/Y')
                : 'Histórico Completo';
            if ($bocaminaId) {
                $bocamina = \App\Models\Bocamina::find($bocaminaId);
                $periodoTexto .= '  |  Bocamina: ' . ($bocamina ? $bocamina->nombre : 'Desconocida');
            }

            $sheet->mergeCells('A2:I2');
            $sheet->setCellValue('A2', 'Periodo: ' . $periodoTexto . '   |   Generado el: ' . $generadoEl);
            $sheet->getStyle('A2')->applyFromArray([
                'font'      => ['italic' => true, 'color' => ['rgb' => '64748B']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ]);

            // ── Encabezados ──
            $headers = ['Código', 'Fecha', 'Equipo', 'Materiales / Repuestos Usados', 'Bocamina', 'Responsable', 'Estado', 'Descripción', 'Costo Total (Bs.)'];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . '3', $header);
                $col++;
            }
            $sheet->getStyle('A3:I3')->applyFromArray([
                'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2DD4BF']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
            ]);
            $sheet->getRowDimension(3)->setRowHeight(20);

            // ── Datos ──
            $row = 4;
            $totalServicios = 0;
            foreach ($servicios as $s) {
                $isEven = ($row % 2 === 0);
                $fillColor = $isEven ? 'F8FAFC' : 'FFFFFF';

                $costoTotal = $s->costos->sum('monto') + $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });

                $tipoLimpio = class_basename($s->equipo_tipo);
                if ($tipoLimpio === 'Vehiculo') {
                    $tipoLimpio = 'Vehículo';
                }

                $repuestosTexto = isset($s->repuestos) && $s->repuestos->count() > 0
                    ? $s->repuestos->map(fn($r) => ($r->material->descripcion ?? $r->material->nombre ?? 'Repuesto') . ' (' . (float)$r->cantidad . ' u.)')->join('; ')
                    : ($s->descripcion ?: '-');

                $sheet->setCellValue('A' . $row, $s->codigo);
                $sheet->setCellValue('B' . $row, \Carbon\Carbon::parse($s->fecha)->format('d/m/Y'));
                $sheet->setCellValue('C' . $row, $tipoLimpio . ' (' . ($s->equipo->placa ?? $s->equipo->nombre_codigo ?? $s->equipo->codigo ?? '-') . ')');
                $sheet->setCellValue('D' . $row, $repuestosTexto);
                $sheet->setCellValue('E' . $row, $s->bocamina->nombre ?? 'Bodega Central');
                $sheet->setCellValue('F' . $row, $s->responsable->nombre ?? '-');
                $sheet->setCellValue('G' . $row, $s->estado);
                $sheet->setCellValue('H' . $row, $s->descripcion ?: '-');
                $sheet->setCellValue('I' . $row, (float) $costoTotal);

                $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                    'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fillColor]],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
                ]);
                $sheet->getStyle('I' . $row)->getNumberFormat()->setFormatCode('#,##0.00');

                $totalServicios += $costoTotal;
                $row++;
            }

            // ── Fila TOTAL ──
            $sheet->mergeCells('A' . $row . ':H' . $row);
            $sheet->setCellValue('A' . $row, 'TOTAL GENERAL SERVICIOS');
            $sheet->setCellValue('I' . $row, $totalServicios);
            $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                'font'    => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1A2332']],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '334155']]],
            ]);
            $sheet->getStyle('I' . $row)->getNumberFormat()->setFormatCode('#,##0.00');

            foreach (range('A', 'I') as $colChar) {
                $sheet->getColumnDimension($colChar)->setAutoSize(true);
            }
        }

        // Set active sheet back to 0
        $spreadsheet->setActiveSheetIndex(0);

        // ── Escritura y descarga ──
        $filename = 'reporte_' . $tipo . '_' . now()->format('Y-m-d') . '.xlsx';
        $tempPath = tempnam(sys_get_temp_dir(), 'xlsx_');

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return response()->download($tempPath, $filename, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ])->deleteFileAfterSend(true);
    }
}
