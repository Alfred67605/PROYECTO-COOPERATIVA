<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Respaldo;
use App\Models\HistorialOperacion;
use Illuminate\Support\Facades\Log;

class RunBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:run {--manual} {--usuario_id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Genera un respaldo zip de la base de datos y los archivos del storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isManual = $this->option('manual');
        $usuarioId = $this->option('usuario_id');
        $tipo = $isManual ? 'manual' : 'automatico';

        $this->info("Iniciando generación de respaldo ({$tipo})...");

        // 1. Obtener credenciales de la BD
        $connection = config('database.default');
        if ($connection !== 'pgsql') {
            $errorMsg = "Solo se soporta respaldo para bases de datos PostgreSQL.";
            $this->error($errorMsg);
            Respaldo::create([
                'nombre_archivo' => 'error_bd_not_supported.zip',
                'tipo' => $tipo,
                'tamano' => 0,
                'estado' => 'fallido',
                'creado_por' => $usuarioId,
            ]);
            return 1;
        }

        $dbConfig = config("database.connections.pgsql");
        $host = $dbConfig['host'] ?? '127.0.0.1';
        $port = $dbConfig['port'] ?? '5432';
        $database = $dbConfig['database'] ?? 'control_compras_db';
        $username = $dbConfig['username'] ?? 'postgres';
        $password = $dbConfig['password'] ?? 'admin';

        $timestamp = now()->format('Y-m-d_H-i-s');
        $sqlFileName = "db_dump_{$timestamp}.sql";
        $zipFileName = "backup_{$timestamp}.zip";

        $tempFolder = storage_path('app/temp_backup');
        if (!file_exists($tempFolder)) {
            mkdir($tempFolder, 0755, true);
        }
        $sqlPath = $tempFolder . DIRECTORY_SEPARATOR . $sqlFileName;

        $respaldoFolder = storage_path('app/respaldos');
        if (!file_exists($respaldoFolder)) {
            mkdir($respaldoFolder, 0755, true);
        }
        $zipPath = $respaldoFolder . DIRECTORY_SEPARATOR . $zipFileName;

        try {
            // 2. Intentar pg_dump si está disponible
            try {
                $pgDumpBinary = $this->getPgDumpBinary();
                $cmd = [
                    $pgDumpBinary,
                    '-h', $host,
                    '-p', $port,
                    '-U', $username,
                    '-F', 'p',
                    '-f', $sqlPath,
                    $database
                ];

                $env = array_merge(getenv() ?: [], [
                    'PGPASSWORD' => $password
                ]);

                $process = proc_open($cmd, [
                    0 => ["pipe", "r"],
                    1 => ["pipe", "w"],
                    2 => ["pipe", "w"]
                ], $pipes, null, $env);

                if (is_resource($process)) {
                    stream_get_contents($pipes[1]);
                    fclose($pipes[1]);
                    stream_get_contents($pipes[2]);
                    fclose($pipes[2]);
                    proc_close($process);
                }
            } catch (\Throwable $t) {
                Log::warning("pg_dump no ejecutado: " . $t->getMessage());
            }

            // 2b. Exportar JSON de la base de datos para restauración cruzada con deduplicación
            $jsonPath = $tempFolder . DIRECTORY_SEPARATOR . 'database.json';
            $this->exportDatabaseJson($jsonPath);

            // 3. Crear archivo Zip
            $this->info("Comprimiendo respaldo...");
            $zip = new \ZipArchive();
            if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
                throw new \Exception("No se pudo crear el archivo ZIP en: " . $zipPath);
            }

            // Agregar dump de base de datos SQL y JSON
            if (file_exists($sqlPath) && filesize($sqlPath) > 0) {
                $zip->addFile($sqlPath, 'database.sql');
            }
            if (file_exists($jsonPath) && filesize($jsonPath) > 0) {
                $zip->addFile($jsonPath, 'database.json');
            }

            // Agregar uploads de storage (public y private)
            $this->addFolderToZip(storage_path('app/public'), $zip, 'storage/public');
            $this->addFolderToZip(storage_path('app/private'), $zip, 'storage/private');

            $zip->close();

            // 4. Limpiar temporales
            if (file_exists($sqlPath)) {
                @unlink($sqlPath);
            }
            if (file_exists($jsonPath)) {
                @unlink($jsonPath);
            }
            if (file_exists($tempFolder) && is_dir($tempFolder)) {
                @rmdir($tempFolder);
            }

            // 5. Guardar en Base de Datos y Auditoría
            $tamano = file_exists($zipPath) ? filesize($zipPath) : 0;
            $respaldo = Respaldo::create([
                'nombre_archivo' => $zipFileName,
                'tipo' => $tipo,
                'tamano' => $tamano,
                'estado' => 'completado',
                'creado_por' => $usuarioId,
            ]);

            // Auditoría
            HistorialOperacion::create([
                'usuario_id' => $usuarioId ?? 1, // Si es automático, atribuir al admin default
                'accion' => 'crear',
                'tabla' => 'respaldos',
                'registro_id' => $respaldo->id,
                'datos_nuevos' => [
                    'nombre_archivo' => $zipFileName,
                    'tipo' => $tipo,
                    'tamano' => $tamano,
                    'estado' => 'completado',
                ],
                'ip' => request()->ip() ?? '127.0.0.1',
                'fecha' => now(),
            ]);

            $this->info("Respaldo completado con éxito: {$zipFileName} ({$tamano} bytes)");

            // 6. Aplicar política de retención GFS
            $this->info("Aplicando política de retención...");
            $this->enforceRetentionPolicy();

            return 0;

        } catch (\Exception $e) {
            $this->error("Error generando respaldo: " . $e->getMessage());
            Log::error("Error en comando backup:run: " . $e->getMessage());

            // Limpieza en caso de error
            if (file_exists($sqlPath)) {
                unlink($sqlPath);
            }
            if (file_exists($tempFolder) && is_dir($tempFolder)) {
                @rmdir($tempFolder);
            }
            if (file_exists($zipPath)) {
                unlink($zipPath);
            }

            Respaldo::create([
                'nombre_archivo' => $zipFileName,
                'tipo' => $tipo,
                'tamano' => 0,
                'estado' => 'fallido',
                'creado_por' => $usuarioId,
            ]);

            return 1;
        }
    }

    /**
     * Recursivamente añade una carpeta al ZIP.
     */
    private function addFolderToZip($folderPath, \ZipArchive $zip, $zipSubFolder)
    {
        if (!file_exists($folderPath)) {
            return;
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($folderPath, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $name => $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = $zipSubFolder . '/' . substr($filePath, strlen(realpath($folderPath)) + 1);
                $zip->addFile($filePath, ltrim($relativePath, '/'));
            }
        }
    }

    /**
     * Aplica la política de retención GFS (Grandfather-Father-Son).
     */
    private function enforceRetentionPolicy()
    {
        $backups = Respaldo::where('estado', 'completado')
            ->orderBy('created_at', 'desc')
            ->get();

        $toKeep = collect();
        $toDelete = collect();

        foreach ($backups as $backup) {
            $date = $backup->created_at;
            $dayKey = $date->format('Y-m-d');
            $weekKey = $date->format('Y-W');
            $monthKey = $date->format('Y-m');
            $yearKey = $date->format('Y');

            $keep = false;

            // 1. Mantener últimos 7 días (diarios)
            if ($date->diffInDays(now()) < 7) {
                $keep = true;
            }

            // 2. Mantener últimas 4 semanas (semanales, 1 por semana)
            if ($date->diffInWeeks(now()) < 4) {
                if (!$toKeep->contains(fn($b) => $b->created_at->format('Y-W') === $weekKey)) {
                    $keep = true;
                }
            }

            // 3. Mantener últimos 12 meses (mensuales, 1 por mes)
            if ($date->diffInMonths(now()) < 12) {
                if (!$toKeep->contains(fn($b) => $b->created_at->format('Y-m') === $monthKey)) {
                    $keep = true;
                }
            }

            // 4. Mantener últimos 5 años (anuales, 1 por año)
            if ($date->diffInYears(now()) < 5) {
                if (!$toKeep->contains(fn($b) => $b->created_at->format('Y') === $yearKey)) {
                    $keep = true;
                }
            }

            if ($keep) {
                $toKeep->push($backup);
            } else {
                $toDelete->push($backup);
            }
        }

        foreach ($toDelete as $backup) {
            $filePath = storage_path('app/respaldos/' . $backup->nombre_archivo);
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
            $backup->delete();
            $this->info("Eliminado respaldo antiguo por política de retención: {$backup->nombre_archivo}");
        }
    }

    /**
     * Obtiene la ruta del binario de pg_dump en Windows o retorna por defecto 'pg_dump'.
     */
    private function getPgDumpBinary()
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
            return 'pg_dump';
        }

        // Rutas comunes en Windows
        $paths = [
            'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
            'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        // Buscar vía glob cualquier versión instalada en la ruta común
        $globPaths = glob('C:\\Program Files\\PostgreSQL\\*\\bin\\pg_dump.exe');
        if (!empty($globPaths)) {
            rsort($globPaths);
            return $globPaths[0];
        }

        return 'pg_dump';
    }

    /**
     * Exporta todos los registros de la base de datos a un archivo JSON estructurado.
     */
    private function exportDatabaseJson($jsonPath)
    {
        $tables = [
            'roles', 'permisos', 'permiso_user', 'users',
            'categorias', 'materiales', 'bocaminas', 'proveedores',
            'compras', 'detalle_compras', 'servicios', 'repuesto_servicios',
            'costo_servicios', 'inspecciones', 'alquiler_gruas',
            'historial_operaciones', 'empresa_settings'
        ];

        $data = [];
        foreach ($tables as $table) {
            if (\Illuminate\Support\Facades\Schema::hasTable($table)) {
                $data[$table] = \DB::table($table)->get()->toArray();
            }
        }

        file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
}
