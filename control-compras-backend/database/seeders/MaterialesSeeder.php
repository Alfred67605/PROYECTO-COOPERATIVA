<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MaterialesSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Materiales/Repuestos (10 datos)
        $repuestos = [
            ['Filtro de Aceite CAT', 'Repuestos Maquinaria'],
            ['Aceite Motor 15W40 (Litro)', 'Lubricantes'],
            ['Bomba de Agua', 'Repuestos Maquinaria'],
            ['Correa del Alternador', 'Repuestos Maquinaria'],
            ['Filtro de Aire', 'Repuestos Maquinaria'],
            ['Refrigerante (Galón)', 'Lubricantes'],
            ['Pastillas de Freno (Set)', 'Repuestos Vehículos'],
            ['Filtro de Combustible', 'Repuestos Vehículos'],
            ['Batería 12V 100Ah', 'Suministros'],
            ['Neumático 29.5R25', 'Llantas'],
        ];

        foreach ($repuestos as $i => $rep) {
            DB::table('materiales')->insert([
                'codigo' => 'MAT-00' . ($i + 1),
                'descripcion' => $rep[0],
                'grupo' => $rep[1],
                'estado' => 'activo',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
