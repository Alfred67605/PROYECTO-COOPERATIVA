<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Respaldo;
use App\Models\HistorialOperacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class RespaldoController extends Controller
{
    /**
     * Listar todos los respaldos (paginado).
     */
    public function index(Request $request)
    {
        $respaldos = Respaldo::with('usuario')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($respaldos);
    }

    /**
     * Generar un respaldo manual inmediato.
     */
    public function crear(Request $request)
    {
        try {
            $user = $request->user();
            
            // Ejecutar el comando de respaldo
            $exitCode = Artisan::call('backup:run', [
                '--manual' => true,
                '--usuario_id' => $user->id
            ]);

            if ($exitCode === 0) {
                return response()->json([
                    'message' => 'Respaldo generado exitosamente.'
                ]);
            } else {
                return response()->json([
                    'message' => 'Hubo un error al generar el respaldo. Verifique los registros del sistema.'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error("Error en RespaldoController@crear: " . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al generar el respaldo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Descargar un archivo de respaldo.
     */
    public function descargar($id)
    {
        $respaldo = Respaldo::findOrFail($id);

        if ($respaldo->estado !== 'completado') {
            return response()->json([
                'message' => 'El respaldo seleccionado no se completó con éxito.'
            ], 400);
        }

        $filePath = storage_path('app/respaldos/' . $respaldo->nombre_archivo);

        if (!file_exists($filePath)) {
            return response()->json([
                'message' => 'El archivo de respaldo no existe en el disco.'
            ], 404);
        }

        return response()->download($filePath, $respaldo->nombre_archivo);
    }

    /**
     * Eliminar un respaldo.
     */
    public function destroy(Request $request, $id)
    {
        $respaldo = Respaldo::findOrFail($id);
        $user = $request->user();

        $filePath = storage_path('app/respaldos/' . $respaldo->nombre_archivo);

        if (file_exists($filePath)) {
            @unlink($filePath);
        }

        // Registrar en Auditoría
        HistorialOperacion::create([
            'usuario_id' => $user->id,
            'accion' => 'eliminar',
            'tabla' => 'respaldos',
            'registro_id' => $respaldo->id,
            'datos_nuevos' => [
                'nombre_archivo' => $respaldo->nombre_archivo,
                'tipo' => $respaldo->tipo,
                'tamano' => $respaldo->tamano,
            ],
            'ip' => $request->ip() ?? '127.0.0.1',
            'fecha' => now(),
        ]);

        $respaldo->delete();

        return response()->json([
            'message' => 'Respaldo eliminado exitosamente.'
        ]);
    }
}
