<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ServiciosController extends Controller
{
    public function index()
    {
        $servicios = \App\Models\Servicio::with(['usuarioRegistro', 'responsable', 'equipo', 'repuestos.material', 'costos'])
            ->orderBy('id', 'desc')
            ->get();
        return response()->json($servicios);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|unique:servicios',
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i',
            'usuario_registro_id' => 'required|exists:users,id',
            'responsable_id' => 'nullable|exists:users,id',
            'estado' => 'required|string|max:20',
            'equipo_tipo' => 'required|string',
            'equipo_id' => 'required|integer',
            'boca_mina_id' => 'nullable|exists:bocaminas,id',
            'ubicacion_detalle' => 'nullable|string',
            'tipo_mantenimiento_id' => 'nullable|exists:tipo_mantenimientos,id',
            'descripcion' => 'nullable|string',
            'fallas' => 'nullable|string',
            'solucion' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'repuestos' => 'nullable|array',
            'costos' => 'nullable|array',
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $servicio = \App\Models\Servicio::create($validated);

            if (!empty($validated['repuestos'])) {
                foreach ($validated['repuestos'] as $repuesto) {
                    \App\Models\RepuestoServicio::create([
                        'servicio_id' => $servicio->id,
                        'material_id' => $repuesto['material_id'],
                        'cantidad' => $repuesto['cantidad'],
                        'costo_unitario' => $repuesto['costo_unitario'] ?? 0,
                    ]);
                }
            }

            if (!empty($validated['costos'])) {
                foreach ($validated['costos'] as $costo) {
                    \App\Models\CostoServicio::create([
                        'servicio_id' => $servicio->id,
                        'tipo_costo' => $costo['tipo_costo'],
                        'monto' => $costo['monto'],
                        'descripcion' => $costo['descripcion'] ?? null,
                    ]);
                }
            }
            
            \Illuminate\Support\Facades\DB::commit();
            return response()->json($servicio->load(['repuestos.material', 'costos']), 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Error al crear el servicio', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id)
    {
        $servicio = \App\Models\Servicio::with(['usuarioRegistro', 'responsable', 'equipo', 'repuestos.material', 'costos'])->findOrFail($id);
        return response()->json($servicio);
    }

    public function update(Request $request, string $id)
    {
        $servicio = \App\Models\Servicio::findOrFail($id);
        $oldEstado = $servicio->estado;
        
        $validated = $request->validate([
            'estado' => 'sometimes|required|string|max:20',
            'boca_mina_id' => 'nullable|exists:bocaminas,id',
            'ubicacion_detalle' => 'nullable|string',
            'tipo_mantenimiento_id' => 'nullable|exists:tipo_mantenimientos,id',
            'descripcion' => 'nullable|string',
            'fallas' => 'nullable|string',
            'solucion' => 'nullable|string',
            'observaciones' => 'nullable|string',
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $servicio->update($validated);

            // Integración con Inventario: registrar consumo en el historial si se finaliza el servicio
            if ($oldEstado !== 'Finalizado' && $servicio->estado === 'Finalizado') {
                $repuestos = $servicio->repuestos;
                foreach ($repuestos as $repuesto) {
                    \App\Models\HistorialOperacion::create([
                        'usuario_id' => $request->user()->id ?? 1,
                        'accion' => 'consumo_servicio',
                        'tabla' => 'materiales',
                        'registro_id' => $repuesto->material_id,
                        'datos_anteriores' => [],
                        'datos_nuevos' => ['cantidad_consumida' => $repuesto->cantidad, 'servicio_codigo' => $servicio->codigo],
                        'ip' => $request->ip(),
                        'fecha' => now(),
                    ]);
                }
            }

            \Illuminate\Support\Facades\DB::commit();
            return response()->json($servicio->load(['repuestos.material', 'costos']));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Error al actualizar el servicio', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(string $id)
    {
        $servicio = \App\Models\Servicio::findOrFail($id);
        $servicio->delete();
        return response()->json(null, 204);
    }
}
