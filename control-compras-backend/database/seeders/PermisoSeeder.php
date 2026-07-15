<?php

namespace Database\Seeders;

use App\Models\Permiso;
use Illuminate\Database\Seeder;

class PermisoSeeder extends Seeder
{
    public function run(): void
    {
        $permisos = [
            [
                'nombre' => 'bocaminas',
                'descripcion' => 'Gestión de Bocaminas del sistema.',
            ],
            [
                'nombre' => 'proveedores',
                'descripcion' => 'Gestión de Proveedores.',
            ],
            [
                'nombre' => 'materiales',
                'descripcion' => 'Gestión de Inventario y Materiales.',
            ],
            [
                'nombre' => 'compras',
                'descripcion' => 'Gestión de Compras y Adquisiciones.',
            ],
            [
                'nombre' => 'servicios',
                'descripcion' => 'Gestión de Maquinaria, Grúas, Vehículos, Mantenimientos e Inspecciones.',
            ],
            [
                'nombre' => 'reportes',
                'descripcion' => 'Ver Reportes, Gráficos y Costos del Sistema.',
            ],
            [
                'nombre' => 'auditoria',
                'descripcion' => 'Ver Auditoría del Sistema (Historial/Bitácora).',
            ],
            [
                'nombre' => 'solo_lectura',
                'descripcion' => 'Forzar todas las operaciones a modo consulta (sin editar ni eliminar).',
            ],
        ];

        foreach ($permisos as $permiso) {
            Permiso::updateOrCreate(
                ['nombre' => $permiso['nombre']],
                ['descripcion' => $permiso['descripcion']]
            );
        }

        // Clean up old permission names that no longer exist
        Permiso::whereNotIn('nombre', array_column($permisos, 'nombre'))->delete();
    }
}
