<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Rol;

class VaciarDatosOperativos extends Command
{
    /**
     * El nombre y firma del comando en consola.
     *
     * @var string
     */
    protected $signature = 'sistema:vaciar-datos {--force : Forzar ejecución sin confirmación}';

    /**
     * Descripción del comando.
     *
     * @var string
     */
    protected $description = 'Limpia y vacía de manera segura todos los datos del sistema preservando únicamente el usuario Administrador y sus permisos.';

    /**
     * Ejecuta el comando de consola.
     */
    public function handle()
    {
        if (!$this->option('force') && !$this->confirm('¿Está seguro de que desea vaciar todos los datos del sistema preservando solo el usuario admin? Esta acción NO se puede deshacer.')) {
            $this->info('Operación cancelada.');
            return 0;
        }

        $this->info('Iniciando vaciado completo de datos preservando el usuario Administrador...');

        // 1. Obtener usuario admin principal
        $adminRol = Rol::where('nombre', 'Administrador General')->first();
        $adminUser = User::where('email', 'admin@cooperativa.com')->first();
        if (!$adminUser && $adminRol) {
            $adminUser = User::where('rol_id', $adminRol->id)->first();
        }

        $adminId = $adminUser ? $adminUser->id : 1;

        // 2. Tablas a vaciar por completo en orden inverso de dependencias
        $tablesToTruncate = [
            'alquiler_gruas',
            'inspeccions',
            'inspecciones',
            'costo_servicios',
            'repuesto_servicios',
            'servicios',
            'detalle_compras',
            'compras',
            'tipo_mantenimientos',
            'vehiculos',
            'maquinarias',
            'materiales',
            'categorias',
            'proveedores',
            'bocaminas',
            'historial_operaciones',
            'respaldos',
        ];

        $driver = DB::connection()->getDriverName();

        try {
            DB::beginTransaction();

            foreach ($tablesToTruncate as $table) {
                if (Schema::hasTable($table)) {
                    if ($driver === 'pgsql') {
                        DB::statement("TRUNCATE TABLE \"{$table}\" RESTART IDENTITY CASCADE;");
                    } else {
                        DB::table($table)->truncate();
                    }
                    $this->line("Tabla {$table} vaciada.");
                }
            }

            // 3. Eliminar usuarios excepto Admin
            if (Schema::hasTable('users')) {
                DB::table('users')->where('id', '!=', $adminId)->delete();
                $this->line("Usuarios secundarios eliminados. Se conservó el usuario ID {$adminId} (admin@cooperativa.com).");
            }

            // 4. Limpiar permiso_user conservando solo permisos del admin
            if (Schema::hasTable('permiso_user')) {
                DB::table('permiso_user')->where('user_id', '!=', $adminId)->delete();
            }

            // Asignar todos los permisos al usuario admin si no los tiene
            if (Schema::hasTable('permisos') && Schema::hasTable('permiso_user') && $adminId) {
                $permisosIds = DB::table('permisos')->pluck('id');
                foreach ($permisosIds as $permisoId) {
                    DB::table('permiso_user')->updateOrInsert([
                        'permiso_id' => $permisoId,
                        'user_id' => $adminId,
                    ]);
                }
            }

            // 5. Resincronizar secuencias de Postgres
            if ($driver === 'pgsql') {
                $allTables = array_merge($tablesToTruncate, ['users', 'roles', 'permisos']);
                foreach ($allTables as $t) {
                    if (Schema::hasTable($t) && Schema::hasColumn($t, 'id')) {
                        try {
                            DB::statement("SELECT setval(pg_get_serial_sequence('\"{$t}\"', 'id'), coalesce(max(id), 1)) FROM \"{$t}\";");
                        } catch (\Throwable $e) {}
                    }
                }
            }

            DB::commit();

            $this->info('¡Vaciado de sistema completado con éxito! Se conservó únicamente al usuario Administrador.');
            return 0;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Error al vaciar los datos del sistema: ' . $e->getMessage());
            return 1;
        }
    }
}
