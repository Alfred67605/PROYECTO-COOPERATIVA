<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ServiciosController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', \App\Models\Servicio::class);
        $servicios = \App\Models\Servicio::with(['usuarioRegistro', 'responsable', 'equipo', 'repuestos.material', 'costos'])
            ->orderBy('id', 'desc')
            ->get();
        return response()->json($servicios);
    }

    public function store(Request $request)
    {
        $this->authorize('create', \App\Models\Servicio::class);

        $validated = $request->validate([
            'codigo' => 'required|string|max:50|unique:servicios',
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i',
            'usuario_registro_id' => 'required|exists:users,id',
            'responsable_id' => 'nullable|exists:users,id',
            'estado' => 'required|string|max:20',
            'equipo_tipo' => 'required|string|in:maquinaria,vehiculo,App\\Models\\Maquinaria,App\\Models\\Vehiculo',
            'equipo_id' => 'required|integer|min:1',
            'boca_mina_id' => 'nullable|exists:bocaminas,id',
            'ubicacion_detalle' => 'nullable|string|max:500',
            'tipo_mantenimiento_id' => 'nullable|exists:tipo_mantenimientos,id',
            'descripcion' => 'nullable|string|max:2000',
            'fallas' => 'nullable|string|max:2000',
            'solucion' => 'nullable|string|max:2000',
            'observaciones' => 'nullable|string|max:2000',
            'repuestos' => 'nullable|array',
            'repuestos.*.material_id' => 'required|exists:materiales,id',
            'repuestos.*.cantidad' => 'required|numeric|min:0.01|max:999999.99',
            'repuestos.*.costo_unitario' => 'nullable|numeric|min:0|max:999999.99',
            'costos' => 'nullable|array',
            'costos.*.tipo_costo' => 'required|string|max:100',
            'costos.*.monto' => 'required|numeric|min:0|max:999999.99',
            'costos.*.descripcion' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $repuestos = $validated['repuestos'] ?? [];
            $costos = $validated['costos'] ?? [];
            unset($validated['repuestos'], $validated['costos']);

            $servicio = \App\Models\Servicio::create($validated);

            if (!empty($repuestos)) {
                foreach ($repuestos as $repuesto) {
                    \App\Models\RepuestoServicio::create([
                        'servicio_id' => $servicio->id,
                        'material_id' => $repuesto['material_id'],
                        'cantidad' => $repuesto['cantidad'],
                        'costo_unitario' => $repuesto['costo_unitario'] ?? 0,
                    ]);
                }
            }

            if (!empty($costos)) {
                foreach ($costos as $costo) {
                    \App\Models\CostoServicio::create([
                        'servicio_id' => $servicio->id,
                        'tipo_costo' => $costo['tipo_costo'],
                        'monto' => $costo['monto'],
                        'descripcion' => $costo['descripcion'] ?? null,
                    ]);
                }
            }
            
            DB::commit();
            return response()->json($servicio->load(['repuestos.material', 'costos']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            // Log the actual error for internal debugging, never expose to client (CWE-209)
            Log::error('Error al crear servicio', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Error al crear el servicio'], 500);
        }
    }

    public function show(string $id)
    {
        $servicio = \App\Models\Servicio::with(['usuarioRegistro', 'responsable', 'equipo', 'repuestos.material', 'costos'])->findOrFail($id);
        $this->authorize('view', $servicio);
        return response()->json($servicio);
    }

    public function update(Request $request, string $id)
    {
        $servicio = \App\Models\Servicio::findOrFail($id);
        $this->authorize('update', $servicio);
        $oldEstado = $servicio->estado;
        
        $validated = $request->validate([
            'estado' => 'sometimes|required|string|max:20',
            'boca_mina_id' => 'nullable|exists:bocaminas,id',
            'ubicacion_detalle' => 'nullable|string|max:500',
            'tipo_mantenimiento_id' => 'nullable|exists:tipo_mantenimientos,id',
            'descripcion' => 'nullable|string|max:2000',
            'fallas' => 'nullable|string|max:2000',
            'solucion' => 'nullable|string|max:2000',
            'observaciones' => 'nullable|string|max:2000',
        ]);

        DB::beginTransaction();
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

            DB::commit();
            return response()->json($servicio->load(['repuestos.material', 'costos']));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar servicio', [
                'servicio_id' => $id,
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Error al actualizar el servicio'], 500);
        }
    }

    public function destroy(string $id)
    {
        $servicio = \App\Models\Servicio::withTrashed()->findOrFail($id);
        $this->authorize('delete', $servicio);
        try {
            $servicio->forceDelete();
            return response()->json(['message' => 'Servicio eliminado de manera definitiva']);
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'No se puede eliminar el servicio porque tiene registros asociados.'
            ], 422);
        }
    }
}
