<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Respaldo;
use App\Models\HistorialOperacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class RespaldoController extends Controller
{
    /**
     * Listar todos los respaldos (paginado).
     */
    public function index(Request $request)
    {
        $this->verificarYEjecutarRespaldoProgramado();

        $respaldos = Respaldo::with('usuario')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($respaldos);
    }

    /**
     * Obtener la configuración actual de programación de respaldos.
     */
    public function getConfiguracion()
    {
        $setting = \App\Models\EmpresaSetting::instance();

        return response()->json([
            'backup_frecuencia' => $setting->backup_frecuencia ?? 'semanal',
            'backup_dia_semana' => $setting->backup_dia_semana ?? 'domingo',
            'backup_dia_mes' => (int)($setting->backup_dia_mes ?? 1),
            'backup_hora' => $setting->backup_hora ?? '02:00',
        ]);
    }

    /**
     * Actualizar la programación de respaldos automáticos.
     */
    public function updateConfiguracion(Request $request)
    {
        $validated = $request->validate([
            'backup_frecuencia' => 'required|in:diario,semanal,mensual,desactivado',
            'backup_dia_semana' => 'required|in:domingo,lunes,martes,miercoles,jueves,viernes,sabado',
            'backup_dia_mes' => 'required|integer|min:1|max:28',
            'backup_hora' => ['required', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d$/'],
        ]);

        $setting = \App\Models\EmpresaSetting::instance();
        $setting->update($validated);

        // Registrar Auditoría
        HistorialOperacion::create([
            'usuario_id' => $request->user()->id,
            'accion' => 'actualizar',
            'tabla' => 'empresa_settings',
            'registro_id' => $setting->id,
            'datos_nuevos' => $validated,
            'ip' => $request->ip() ?? '127.0.0.1',
            'fecha' => now(),
        ]);

        return response()->json([
            'message' => 'Programación de respaldos actualizada correctamente.',
            'configuracion' => [
                'backup_frecuencia' => $setting->backup_frecuencia,
                'backup_dia_semana' => $setting->backup_dia_semana,
                'backup_dia_mes' => (int)$setting->backup_dia_mes,
                'backup_hora' => $setting->backup_hora,
            ]
        ]);
    }

    /**
     * Generar un respaldo manual inmediato.
     */
    public function crear(Request $request)
    {
        try {
            $user = $request->user();
            
            // Ejecutar el comando de respaldo por clase directamente
            $exitCode = Artisan::call(\App\Console\Commands\RunBackup::class, [
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
     * Restaurar desde un respaldo listado en el sistema.
     */
    public function restaurar(Request $request, $id)
    {
        $respaldo = Respaldo::findOrFail($id);

        if ($respaldo->estado !== 'completado') {
            return response()->json([
                'message' => 'No se puede restaurar un respaldo que falló o no se completó.'
            ], 400);
        }

        $filePath = storage_path('app/respaldos/' . $respaldo->nombre_archivo);

        if (!file_exists($filePath)) {
            return response()->json([
                'message' => 'El archivo de respaldo no existe en el disco.'
            ], 404);
        }

        return $this->ejecutarRestauracion($filePath, $request->user());
    }

    /**
     * Restaurar desde un archivo ZIP de respaldo subido manualmente desde la PC del usuario.
     */
    public function restaurarUpload(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file|mimes:zip|max:512000'
        ]);

        $file = $request->file('backup_file');
        $tempPath = storage_path('app/temp_upload_' . time() . '_' . $file->getClientOriginalName());
        $file->move(dirname($tempPath), basename($tempPath));

        try {
            $response = $this->ejecutarRestauracion($tempPath, $request->user());
            if (file_exists($tempPath)) {
                @unlink($tempPath);
            }
            return $response;
        } catch (\Exception $e) {
            if (file_exists($tempPath)) {
                @unlink($tempPath);
            }
            throw $e;
        }
    }

    /**
     * Ejecuta el proceso de desempaquetado, restauración de archivos y fusión deduplicada de la BD.
     */
    private function ejecutarRestauracion($zipPath, $user)
    {
        $extractPath = storage_path('app/temp_restore_' . time());
        if (!file_exists($extractPath)) {
            mkdir($extractPath, 0755, true);
        }

        try {
            $zip = new \ZipArchive();
            if ($zip->open($zipPath) !== true) {
                throw new \Exception("No se pudo abrir el archivo ZIP de respaldo.");
            }

            $zip->extractTo($extractPath);
            $zip->close();

            $registrosProcesados = 0;
            $duplicadosOmitidos = 0;
            $tablasRestauradas = 0;
            $archivosRestaurados = 0;

            // 1. Restaurar Archivos / Imágenes de Storage
            $publicFolder = $extractPath . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'public';
            if (file_exists($publicFolder)) {
                $archivosRestaurados += $this->copyDirectory($publicFolder, storage_path('app/public'));
            }
            $privateFolder = $extractPath . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'private';
            if (file_exists($privateFolder)) {
                $archivosRestaurados += $this->copyDirectory($privateFolder, storage_path('app/private'));
            }

            // 2. Restaurar Base de Datos desde database.json con Deduplicación Inteligente
            $jsonFile = $extractPath . DIRECTORY_SEPARATOR . 'database.json';
            if (file_exists($jsonFile)) {
                $jsonContent = file_get_contents($jsonFile);
                $dbData = json_decode($jsonContent, true);

                if (is_array($dbData)) {
                    $tablesOrder = [
                        'roles', 'permisos', 'permiso_user', 'users', 
                        'categorias', 'materiales', 'bocaminas', 'proveedores', 
                        'compras', 'detalle_compras', 'servicios', 'repuesto_servicios', 
                        'costo_servicios', 'inspecciones', 'alquiler_gruas', 
                        'historial_operaciones', 'empresa_settings'
                    ];

                    DB::beginTransaction();

                    foreach ($tablesOrder as $table) {
                        if (!isset($dbData[$table]) || !is_array($dbData[$table])) {
                            continue;
                        }

                        $rows = $dbData[$table];
                        if (empty($rows)) {
                            continue;
                        }

                        $tablasRestauradas++;

                        foreach ($rows as $row) {
                            $registrosProcesados++;
                            $matchKeys = [];

                            switch ($table) {
                                case 'roles':
                                case 'permisos':
                                case 'categorias':
                                case 'bocaminas':
                                case 'proveedores':
                                    $matchKeys = ['nombre' => $row['nombre'] ?? null];
                                    break;
                                case 'users':
                                    $matchKeys = ['email' => $row['email'] ?? null];
                                    break;
                                case 'materiales':
                                case 'servicios':
                                    $matchKeys = ['codigo' => $row['codigo'] ?? null];
                                    break;
                                case 'compras':
                                    $matchKeys = ['numero_factura' => $row['numero_factura'] ?? null];
                                    break;
                                case 'empresa_settings':
                                    $matchKeys = ['key' => $row['key'] ?? ($row['id'] ?? null)];
                                    break;
                                default:
                                    $matchKeys = ['id' => $row['id'] ?? null];
                                    break;
                            }

                            // Quitar keys nulas de matchKeys
                            $matchKeys = array_filter($matchKeys, fn($v) => !is_null($v));
                            if (empty($matchKeys) && isset($row['id'])) {
                                $matchKeys = ['id' => $row['id']];
                            }

                            $existing = DB::table($table)->where($matchKeys)->first();
                            if ($existing) {
                                // Omitir duplicados idénticos / actualizar
                                $duplicadosOmitidos++;
                                DB::table($table)->where($matchKeys)->update($row);
                            } else {
                                DB::table($table)->insert($row);
                            }
                        }
                    }

                    DB::commit();
                }
            }

            // 3. Limpiar carpeta temporal
            $this->deleteDirectory($extractPath);

            // Auditoría
            HistorialOperacion::create([
                'usuario_id' => $user->id,
                'accion' => 'actualizar',
                'tabla' => 'respaldos',
                'registro_id' => null,
                'datos_nuevos' => [
                    'operacion' => 'restauracion_sistema',
                    'tablas_restauradas' => $tablasRestauradas,
                    'registros_procesados' => $registrosProcesados,
                    'duplicados_omitidos' => $duplicadosOmitidos,
                    'archivos_restaurados' => $archivosRestaurados,
                ],
                'ip' => request()->ip() ?? '127.0.0.1',
                'fecha' => now(),
            ]);

            return response()->json([
                'message' => 'Sistema y base de datos restaurados exitosamente.',
                'detalles' => [
                    'tablas_restauradas' => $tablasRestauradas,
                    'registros_procesados' => $registrosProcesados,
                    'duplicados_omitidos' => $duplicadosOmitidos,
                    'archivos_restaurados' => $archivosRestaurados,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            $this->deleteDirectory($extractPath);
            Log::error("Error en restauración de respaldo: " . $e->getMessage());

            return response()->json([
                'message' => 'Error al restaurar el respaldo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Copia recursivamente el contenido de un directorio.
     */
    private function copyDirectory($src, $dst)
    {
        $count = 0;
        if (!file_exists($dst)) {
            mkdir($dst, 0755, true);
        }

        $dir = opendir($src);
        while (false !== ($file = readdir($dir))) {
            if (($file != '.') && ($file != '..')) {
                $srcFile = $src . DIRECTORY_SEPARATOR . $file;
                $dstFile = $dst . DIRECTORY_SEPARATOR . $file;

                if (is_dir($srcFile)) {
                    $count += $this->copyDirectory($srcFile, $dstFile);
                } else {
                    copy($srcFile, $dstFile);
                    $count++;
                }
            }
        }
        closedir($dir);
        return $count;
    }

    /**
     * Elimina recursivamente un directorio temporal.
     */
    private function deleteDirectory($dir)
    {
        if (!file_exists($dir)) {
            return true;
        }

        if (!is_dir($dir)) {
            return unlink($dir);
        }

        foreach (scandir($dir) as $item) {
            if ($item == '.' || $item == '..') {
                continue;
            }

            if (!$this->deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
                return false;
            }
        }

        return rmdir($dir);
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

    /**
     * Verifica si existe un respaldo automático pendiente según la programación configurada.
     */
    private function verificarYEjecutarRespaldoProgramado()
    {
        try {
            $setting = \App\Models\EmpresaSetting::first();
            if (!$setting) return;

            $frecuencia = $setting->backup_frecuencia ?? 'semanal';
            if ($frecuencia === 'desactivado') return;

            $hora = $setting->backup_hora ?? '02:00';
            $diaSemana = strtolower($setting->backup_dia_semana ?? 'domingo');
            $diaMes = (int)($setting->backup_dia_mes ?? 1);

            $ahora = now();
            $horaActual = $ahora->format('H:i');

            // Verificar si ya pasó la hora programada hoy
            if ($horaActual < $hora) {
                return;
            }

            $esDebido = false;
            $startOfPeriod = null;

            if ($frecuencia === 'diario') {
                $esDebido = true;
                $startOfPeriod = $ahora->copy()->startOfDay();
            } elseif ($frecuencia === 'semanal') {
                $diasMap = [
                    'domingo' => 0, 'lunes' => 1, 'martes' => 2,
                    'miercoles' => 3, 'jueves' => 4, 'viernes' => 5, 'sabado' => 6,
                ];
                $diaNum = $diasMap[$diaSemana] ?? 0;
                if ($ahora->dayOfWeek === $diaNum) {
                    $esDebido = true;
                    $startOfPeriod = $ahora->copy()->startOfDay();
                }
            } elseif ($frecuencia === 'mensual') {
                if ($ahora->day === $diaMes) {
                    $esDebido = true;
                    $startOfPeriod = $ahora->copy()->startOfDay();
                }
            }

            if ($esDebido && $startOfPeriod) {
                $yaExiste = Respaldo::where('tipo', 'automatico')
                    ->where('created_at', '>=', $startOfPeriod)
                    ->exists();

                if (!$yaExiste) {
                    Artisan::call(\App\Console\Commands\RunBackup::class, [
                        '--manual' => false,
                        '--usuario_id' => null
                    ]);
                }
            }
        } catch (\Throwable $t) {
            Log::warning("Error al verificar respaldo programado: " . $t->getMessage());
        }
    }
}
