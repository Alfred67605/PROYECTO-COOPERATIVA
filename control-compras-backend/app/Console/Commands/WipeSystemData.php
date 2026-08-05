<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class WipeSystemData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:wipe-data {--keep-catalogs : No vaciar catálogos como proveedores o materiales}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vacía los datos del sistema para producción, manteniendo la cuenta de administrador.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->warn('Iniciando vaciado del sistema...');

        $connection = DB::connection()->getDriverName();
        if ($connection === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        $tablesToTruncate = [
            'historial_operaciones',
            'detalle_compras',
            'compras',
            'repuesto_servicios',
            'costo_servicios',
            'servicios',
            'cargas_combustible',
            'inspeccions',
            'alquiler_gruas',
            'asignacion_transportes',
            'respaldos',
        ];

        $catalogs = [
            'vehiculos',
            'gruas',
            'maquinarias',
            'materiales',
            'proveedores',
            'bocaminas',
            'tipo_mantenimientos',
            'categorias',
        ];

        foreach ($tablesToTruncate as $table) {
            try {
                DB::table($table)->truncate();
                $this->info("Tabla {$table} vaciada.");
            } catch (\Exception $e) {
                // Table might not exist or error
            }
        }

        if (!$this->option('keep-catalogs')) {
            foreach ($catalogs as $table) {
                try {
                    DB::table($table)->truncate();
                    $this->info("Catálogo {$table} vaciado.");
                } catch (\Exception $e) {
                }
            }
        }

        // Wipe Users (keep Admin)
        $adminRole = DB::table('roles')->where('nombre', 'Administrador General')->first();
        if ($adminRole) {
            DB::table('users')->where('rol_id', '!=', $adminRole->id)->delete();
            $this->info('Usuarios no-admin eliminados.');
        } else {
            // Si no se encuentra el rol de admin por alguna razón, no borramos nada para no romper el acceso
            $this->error('Rol de Administrador General no encontrado. No se eliminaron usuarios.');
        }

        // Wipe user permissions for deleted users
        DB::table('permiso_user')->whereNotIn('user_id', function ($query) {
            $query->select('id')->from('users');
        })->delete();

        if ($connection === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = ON;');
        } else {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $this->info('¡Vaciado completo de manera segura!');
    }
}
