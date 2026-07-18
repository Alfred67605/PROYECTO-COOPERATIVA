<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardServiciosController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        if (!$request->user()->canAccess('servicios')) {
            throw new \Illuminate\Auth\Access\AuthorizationException();
        }
        $totalMaquinaria = \App\Models\Maquinaria::where('estado', 'operativa')->count();
        $equiposReparacion = \App\Models\Maquinaria::where('estado', 'en_mantenimiento')->count()
                           + \App\Models\Vehiculo::where('estado', 'en_mantenimiento')->count();
        
        $serviciosMes = \App\Models\Servicio::whereMonth('fecha', date('m'))
                            ->whereYear('fecha', date('Y'))
                            ->count();
                            
        $costosAcumulados = \App\Models\CostoServicio::whereHas('servicio', function($q) {
            $q->whereMonth('fecha', date('m'))->whereYear('fecha', date('Y'));
        })->sum('monto');
        
        $costosRepuestos = \App\Models\RepuestoServicio::whereHas('servicio', function($q) {
            $q->whereMonth('fecha', date('m'))->whereYear('fecha', date('Y'));
        })->sum(\Illuminate\Support\Facades\DB::raw('cantidad * costo_unitario'));

        $costosAcumulados += $costosRepuestos;

        // Mantenimientos proximos (ejemplo: horometro cercano al limite, simplificado)
        $proximosMantenimientos = \App\Models\Maquinaria::where('horometro', '>', 450)->count();

        // Gráficos de Costos por equipo
        $servicios = \App\Models\Servicio::with(['costos', 'repuestos'])->get();
        $costosPorEquipoRaw = [];
        foreach ($servicios as $s) {
            $tipo = $s->equipo_tipo; // ej. 'App\Models\Maquinaria'
            $nombreCorto = explode('\\', $tipo);
            $nombreCorto = end($nombreCorto); // 'Maquinaria'
            
            if (!isset($costosPorEquipoRaw[$nombreCorto])) {
                $costosPorEquipoRaw[$nombreCorto] = 0;
            }
            $costoAdicional = $s->costos->sum('monto');
            $costoRepuestos = $s->repuestos->sum(function($r) { return $r->cantidad * $r->costo_unitario; });
            $costosPorEquipoRaw[$nombreCorto] += $costoAdicional + $costoRepuestos;
        }
        $costosPorEquipo = collect($costosPorEquipoRaw)->map(function($total, $tipo) {
            return ['equipo_tipo' => $tipo, 'total' => $total];
        })->values();

        return response()->json([
            'kpis' => [
                'total_maquinaria_activa' => $totalMaquinaria,
                'equipos_reparacion' => $equiposReparacion,
                'servicios_mes' => $serviciosMes,
                'costos_acumulados' => $costosAcumulados,
                'proximos_mantenimientos' => $proximosMantenimientos
            ],
            'charts' => [
                'costos_por_equipo' => $costosPorEquipo
            ]
        ]);
    }
}
