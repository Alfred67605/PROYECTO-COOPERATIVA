<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CargaCombustible;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CargaCombustibleController extends Controller
{
    public function index(Request $request)
    {
        $query = CargaCombustible::with(['vehiculo.conductor', 'maquinaria', 'usuario'])
            ->orderBy('fecha_hora', 'desc')
            ->orderBy('id', 'desc');

        if ($request->filled('tipo_combustible')) {
            $query->where('tipo_combustible', $request->input('tipo_combustible'));
        }

        if ($request->filled('tipo_equipo')) {
            $query->where('tipo_equipo', $request->input('tipo_equipo'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('surtidor_grifo', 'ilike', "%{$search}%")
                  ->orWhere('responsable', 'ilike', "%{$search}%")
                  ->orWhereHas('vehiculo', function ($vq) use ($search) {
                      $vq->where('placa', 'ilike', "%{$search}%")
                        ->orWhere('modelo', 'ilike', "%{$search}%")
                        ->orWhere('marca', 'ilike', "%{$search}%");
                  })
                  ->orWhereHas('maquinaria', function ($mq) use ($search) {
                      $mq->where('nombre_codigo', 'ilike', "%{$search}%")
                        ->orWhere('modelo', 'ilike', "%{$search}%")
                        ->orWhere('marca', 'ilike', "%{$search}%")
                        ->orWhere('placa', 'ilike', "%{$search}%");
                  });
            });
        }

        $cargas = $query->paginate(20);
        return response()->json($cargas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo_combustible' => 'required|string|in:diesel,gasolina,Diésel,Gasolina',
            'tipo_equipo' => 'required|string|in:vehiculo,maquinaria',
            'vehiculo_id' => 'required_if:tipo_equipo,vehiculo|nullable|exists:vehiculos,id',
            'maquinaria_id' => 'required_if:tipo_equipo,maquinaria|nullable|exists:maquinarias,id',
            'litros' => 'required|numeric|min:0.01|max:99999.99',
            'monto' => 'required|numeric|min:0|max:999999.99',
            'surtidor_grifo' => 'required|string|max:255',
            'responsable' => 'required|string|max:255',
            'fecha_hora' => 'required|date',
            'observacion' => 'nullable|string|max:1000',
        ]);

        $litros = floatval($validated['litros']);
        $monto = floatval($validated['monto']);
        $precioPorLitro = $litros > 0 ? round($monto / $litros, 2) : 0;

        // Normalizar tipo de combustible
        $tipoCombustible = strtolower($validated['tipo_combustible']);
        if ($tipoCombustible === 'diésel') $tipoCombustible = 'diesel';

        $carga = CargaCombustible::create([
            'tipo_combustible' => $tipoCombustible,
            'tipo_equipo' => $validated['tipo_equipo'],
            'vehiculo_id' => $validated['tipo_equipo'] === 'vehiculo' ? $validated['vehiculo_id'] : null,
            'maquinaria_id' => $validated['tipo_equipo'] === 'maquinaria' ? $validated['maquinaria_id'] : null,
            'litros' => $litros,
            'monto' => $monto,
            'precio_por_litro' => $precioPorLitro,
            'surtidor_grifo' => $validated['surtidor_grifo'],
            'responsable' => $validated['responsable'],
            'fecha_hora' => $validated['fecha_hora'],
            'observacion' => $validated['observacion'] ?? null,
            'user_id' => $request->user()?->id,
        ]);

        return response()->json($carga->load(['vehiculo.conductor', 'maquinaria', 'usuario']), 201);
    }

    public function show($id)
    {
        $carga = CargaCombustible::with(['vehiculo.conductor', 'maquinaria', 'usuario'])->findOrFail($id);
        return response()->json($carga);
    }

    public function update(Request $request, $id)
    {
        $carga = CargaCombustible::findOrFail($id);

        $validated = $request->validate([
            'tipo_combustible' => 'required|string|in:diesel,gasolina,Diésel,Gasolina',
            'tipo_equipo' => 'required|string|in:vehiculo,maquinaria',
            'vehiculo_id' => 'required_if:tipo_equipo,vehiculo|nullable|exists:vehiculos,id',
            'maquinaria_id' => 'required_if:tipo_equipo,maquinaria|nullable|exists:maquinarias,id',
            'litros' => 'required|numeric|min:0.01|max:99999.99',
            'monto' => 'required|numeric|min:0|max:999999.99',
            'surtidor_grifo' => 'required|string|max:255',
            'responsable' => 'required|string|max:255',
            'fecha_hora' => 'required|date',
            'observacion' => 'nullable|string|max:1000',
        ]);

        $litros = floatval($validated['litros']);
        $monto = floatval($validated['monto']);
        $precioPorLitro = $litros > 0 ? round($monto / $litros, 2) : 0;

        $tipoCombustible = strtolower($validated['tipo_combustible']);
        if ($tipoCombustible === 'diésel') $tipoCombustible = 'diesel';

        $carga->update([
            'tipo_combustible' => $tipoCombustible,
            'tipo_equipo' => $validated['tipo_equipo'],
            'vehiculo_id' => $validated['tipo_equipo'] === 'vehiculo' ? $validated['vehiculo_id'] : null,
            'maquinaria_id' => $validated['tipo_equipo'] === 'maquinaria' ? $validated['maquinaria_id'] : null,
            'litros' => $litros,
            'monto' => $monto,
            'precio_por_litro' => $precioPorLitro,
            'surtidor_grifo' => $validated['surtidor_grifo'],
            'responsable' => $validated['responsable'],
            'fecha_hora' => $validated['fecha_hora'],
            'observacion' => $validated['observacion'] ?? null,
        ]);

        return response()->json($carga->load(['vehiculo.conductor', 'maquinaria', 'usuario']));
    }

    public function destroy($id, Request $request)
    {
        $user = $request->user();
        if ($user && !$user->isAdmin() && !$user->puede_eliminar) {
            return response()->json([
                'message' => 'Usted no tiene permisos para eliminar registros del sistema.'
            ], 403);
        }

        $carga = CargaCombustible::findOrFail($id);
        $carga->delete();

        return response()->json(['message' => 'Registro de combustible eliminado exitosamente.']);
    }

    public function resumen()
    {
        $dieselLitros = CargaCombustible::where('tipo_combustible', 'diesel')->sum('litros');
        $gasolinaLitros = CargaCombustible::where('tipo_combustible', 'gasolina')->sum('litros');
        $montoTotal = CargaCombustible::sum('monto');
        $totalRegistros = CargaCombustible::count();

        return response()->json([
            'total_litros_diesel' => round($dieselLitros, 2),
            'total_litros_gasolina' => round($gasolinaLitros, 2),
            'total_monto_combustible' => round($montoTotal, 2),
            'total_registros' => $totalRegistros,
        ]);
    }
}
