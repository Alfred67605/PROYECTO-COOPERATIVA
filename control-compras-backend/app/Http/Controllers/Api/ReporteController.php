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
        // Normalizar bocamina_id: string vacío → null para que la validación no falle
        $bocaminaId = $request->query('bocamina_id');
        if ($bocaminaId === '' || $bocaminaId === 'null') {
            $bocaminaId = null;
        }

        $request->validate([
            'inicio'      => 'nullable|date',
            'fin'         => 'nullable|date',
            'bocamina_id' => 'nullable|integer|exists:bocaminas,id',
        ]);

        // La columna `fecha` es de tipo DATE en la BD — usamos solo fecha sin hora
        $inicio = $request->query('inicio', now()->startOfMonth()->toDateString());
        $fin    = $request->query('fin',    now()->endOfMonth()->toDateString());

        // Convertimos a Carbon para normalizar; comparamos solo la parte DATE
        $inicioCar = \Carbon\Carbon::parse($inicio)->startOfDay();
        $finCar    = \Carbon\Carbon::parse($fin)->endOfDay();

        // ── Compras ────────────────────────────────────────────────────
        $comprasQuery = Compra::whereDate('fecha', '>=', $inicioCar->toDateString())
                              ->whereDate('fecha', '<=', $finCar->toDateString());
        if ($bocaminaId) {
            $comprasQuery->where('bocamina_id', $bocaminaId);
        }

        $gastoTotalCompras = (float) $comprasQuery->sum('total');
        $totalOperaciones  = $comprasQuery->count();

        // ── Servicios ─────────────────────────────────────────────────
        $serviciosQuery = \App\Models\Servicio::with(['costos', 'repuestos', 'bocamina'])
            ->whereDate('fecha', '>=', $inicioCar->toDateString())
            ->whereDate('fecha', '<=', $finCar->toDateString());

        if ($bocaminaId) {
            $serviciosQuery->where('boca_mina_id', $bocaminaId);
        }

        $serviciosAll = $serviciosQuery->get();

        $gastoTotalServicios = 0;
        foreach ($serviciosAll as $s) {
            $gastoTotalServicios += $s->costos->sum('monto')
                + $s->repuestos->sum(fn($r) => $r->cantidad * $r->costo_unitario);
        }
        $gastoTotal = $gastoTotalCompras + $gastoTotalServicios;

        // ── Gastos por Bocamina ────────────────────────────────────────
        $gastosBocaminaQuery = Compra::whereDate('compras.fecha', '>=', $inicioCar->toDateString())
                                     ->whereDate('compras.fecha', '<=', $finCar->toDateString());
        if ($bocaminaId) {
            $gastosBocaminaQuery->where('compras.bocamina_id', $bocaminaId);
        }

        $gastosBocamina = $gastosBocaminaQuery
            ->select('bocaminas.nombre', DB::raw('SUM(compras.total) as total_gastado'))
            ->join('bocaminas', 'compras.bocamina_id', '=', 'bocaminas.id')
            ->groupBy('bocaminas.id', 'bocaminas.nombre')
            ->get()
            ->keyBy('nombre');

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
        $gastosBocamina = $gastosBocamina->sortByDesc('total_gastado')->values();

        // ── Gastos por Proveedor ───────────────────────────────────────
        $gastosProveedorQuery = Compra::whereDate('compras.fecha', '>=', $inicioCar->toDateString())
                                      ->whereDate('compras.fecha', '<=', $finCar->toDateString());
        if ($bocaminaId) {
            $gastosProveedorQuery->where('compras.bocamina_id', $bocaminaId);
        }

        $gastosProveedor = $gastosProveedorQuery
            ->select('proveedores.nombre', DB::raw('SUM(compras.total) as total_gastado'))
            ->join('proveedores', 'compras.proveedor_id', '=', 'proveedores.id')
            ->groupBy('proveedores.id', 'proveedores.nombre')
            ->orderByDesc('total_gastado')
            ->get();

        // ── Top Materiales ─────────────────────────────────────────────
        $topMaterialesQuery = DB::table('detalle_compras')
            ->join('compras',    'detalle_compras.compra_id',   '=', 'compras.id')
            ->join('materiales', 'detalle_compras.material_id', '=', 'materiales.id')
            ->whereDate('compras.fecha', '>=', $inicioCar->toDateString())
            ->whereDate('compras.fecha', '<=', $finCar->toDateString());

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

        // ── Lista Compras ──────────────────────────────────────────────
        $comprasListaQuery = Compra::with(['proveedor', 'bocamina', 'usuario'])
            ->whereDate('fecha', '>=', $inicioCar->toDateString())
            ->whereDate('fecha', '<=', $finCar->toDateString());

        if ($bocaminaId) {
            $comprasListaQuery->where('bocamina_id', $bocaminaId);
        }

        $comprasLista = $comprasListaQuery->orderByDesc('fecha')->get();

        return response()->json([
            'resumen' => [
                'gasto_total'       => $gastoTotal,
                'total_operaciones' => $totalOperaciones,
            ],
            'gastos_bocamina'  => $gastosBocamina,
            'gastos_proveedor' => $gastosProveedor,
            'top_materiales'   => $topMateriales,
            'compras'          => $comprasLista,
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

        $inicio = \Carbon\Carbon::parse($inicio)->startOfDay();
        $fin = \Carbon\Carbon::parse($fin)->endOfDay();

        $comprasQuery = Compra::whereBetween('compras.fecha', [$inicio, $fin]);
        if ($bocaminaId) {
            $comprasQuery->where('compras.bocamina_id', $bocaminaId);
        }

        $gastosBocamina = $comprasQuery->select('bocaminas.nombre', 'bocaminas.id as bocamina_id', DB::raw('SUM(compras.total) as total_gastado'))
            ->join('bocaminas', 'compras.bocamina_id', '=', 'bocaminas.id')
            ->groupBy('bocaminas.id', 'bocaminas.nombre')
            ->get()
            ->keyBy('nombre');

        $serviciosQuery = \App\Models\Servicio::with(['costos', 'repuestos', 'bocamina'])
            ->whereBetween('fecha', [$inicio, $fin]);
            
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
        $inicio = $request->query('inicio') ? \Carbon\Carbon::parse($request->query('inicio'))->startOfDay() : null;
        $fin = $request->query('fin') ? \Carbon\Carbon::parse($request->query('fin'))->endOfDay() : null;

        $query = Compra::with(['proveedor', 'bocamina', 'usuario', 'detalles.material'])->orderByDesc('fecha');

        if ($inicio && $fin) {
            $query->whereBetween('fecha', [$inicio, $fin]);
            $periodoTexto = 'Periodo: ' . $inicio->format('d/m/Y') . ' - ' . $fin->format('d/m/Y');
        } else {
            $periodoTexto = 'Histórico Completo';
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
            $gastoTotalServicios += $s->costos->sum('monto') + $s->repuestos->sum(function ($r) {
                return $r->cantidad * $r->costo_unitario;
            });
        }

        $gastoTotal   = $gastoTotalCompras + $gastoTotalServicios;
        $fecha        = now()->format('d/m/Y H:i');
        $filename     = 'reporte_compras_' . now()->format('Y-m-d') . '.pdf';

        $pdf = Pdf::loadView('reportes.compras_pdf', compact(
            'compras', 'gastoTotal', 'periodoTexto', 'fecha'
        ))->setPaper('a4', 'landscape');

        return $pdf->download($filename);
    }

    public function exportarExcel(Request $request)
    {
        $inicio = $request->query('inicio') ? \Carbon\Carbon::parse($request->query('inicio'))->startOfDay() : null;
        $fin    = $request->query('fin')    ? \Carbon\Carbon::parse($request->query('fin'))->endOfDay()   : null;

        $query = Compra::with(['proveedor', 'bocamina', 'usuario'])->orderByDesc('fecha');
        if ($inicio && $fin) {
            $query->whereBetween('fecha', [$inicio, $fin]);
        }
        $compras = $query->get();

        // ── Spreadsheet ────────────────────────────────────────────────
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Reporte Compras');

        // ── Título ─────────────────────────────────────────────────────
        $sheet->mergeCells('A1:J1');
        $sheet->setCellValue('A1', 'REPORTE DE COMPRAS — MINERA COP');
        $sheet->getStyle('A1')->applyFromArray([
            'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1A2332']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(28);

        // ── Sub-título periodo ──────────────────────────────────────────
        $periodoTexto = ($inicio && $fin)
            ? $inicio->format('d/m/Y') . ' — ' . $fin->format('d/m/Y')
            : 'Histórico Completo';

        $sheet->mergeCells('A2:J2');
        $sheet->setCellValue('A2', 'Periodo: ' . $periodoTexto . '   |   Generado el: ' . now()->format('d/m/Y H:i'));
        $sheet->getStyle('A2')->applyFromArray([
            'font'      => ['italic' => true, 'color' => ['rgb' => '64748B']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ]);

        // ── Encabezados ────────────────────────────────────────────────
        $headers = ['ID', 'Fecha', 'Proveedor', 'NIT Proveedor', 'N° Factura', 'Bocamina', 'Responsable', 'Observaciones', 'Total ($)', 'Estado'];
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . '3', $header);
            $col++;
        }
        $sheet->getStyle('A3:J3')->applyFromArray([
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D96A43']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FFFFFF']]],
        ]);
        $sheet->getRowDimension(3)->setRowHeight(20);

        // ── Datos ──────────────────────────────────────────────────────
        $row   = 4;
        $total = 0;
        foreach ($compras as $compra) {
            $isEven = ($row % 2 === 0);
            $fillColor = $isEven ? 'F8FAFC' : 'FFFFFF';

            $sheet->setCellValue('A' . $row, $compra->id);
            $sheet->setCellValue('B' . $row, $compra->fecha->format('d/m/Y'));
            $sheet->setCellValue('C' . $row, $compra->proveedor->nombre ?? '-');
            $sheet->setCellValue('D' . $row, $compra->proveedor->nit ?? '-');
            $sheet->setCellValue('E' . $row, $compra->numero_factura ?: '-');
            $sheet->setCellValue('F' . $row, $compra->bocamina->nombre ?? 'Bodega Central');
            $sheet->setCellValue('G' . $row, $compra->usuario->nombre ?? '-');
            $sheet->setCellValue('H' . $row, $compra->observaciones ?: '-');
            $sheet->setCellValue('I' . $row, (float) $compra->total);
            $sheet->setCellValue('J' . $row, $compra->estado ?? 'completada');

            $sheet->getStyle('A' . $row . ':J' . $row)->applyFromArray([
                'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fillColor]],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']]],
            ]);
            $sheet->getStyle('I' . $row)->getNumberFormat()->setFormatCode('#,##0.00');

            $total += $compra->total;
            $row++;
        }

        // ── Fila TOTAL ─────────────────────────────────────────────────
        $sheet->mergeCells('A' . $row . ':H' . $row);
        $sheet->setCellValue('A' . $row, 'TOTAL GENERAL');
        $sheet->setCellValue('I' . $row, $total);
        $sheet->getStyle('A' . $row . ':J' . $row)->applyFromArray([
            'font'    => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'    => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1A2332']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '334155']]],
        ]);
        $sheet->getStyle('I' . $row)->getNumberFormat()->setFormatCode('#,##0.00');

        // ── Ancho de columnas ──────────────────────────────────────────
        foreach (range('A', 'J') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // ── Escritura y descarga ───────────────────────────────────────
        $filename = 'reporte_compras_' . now()->format('Y-m-d') . '.xlsx';
        $tempPath = tempnam(sys_get_temp_dir(), 'xlsx_');

        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);

        return response()->download($tempPath, $filename, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ])->deleteFileAfterSend(true);
    }
}
