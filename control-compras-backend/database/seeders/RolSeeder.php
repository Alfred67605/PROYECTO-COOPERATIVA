<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'Administrador General',
            'Gerencia',
            'Compras',
            'Supervisor Bocamina',
            'Contabilidad',
            'Consulta'
        ];

        foreach ($roles as $rol) {
            Rol::firstOrCreate(['nombre' => $rol]);
        }
    }
}
