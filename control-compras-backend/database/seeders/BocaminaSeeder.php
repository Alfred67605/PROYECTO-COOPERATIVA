<?php

namespace Database\Seeders;

use App\Models\Bocamina;
use Illuminate\Database\Seeder;

class BocaminaSeeder extends Seeder
{
    public function run(): void
    {
        $bocaminas = [
            ['nombre' => 'Huari Huari', 'ubicacion' => 'Nivel 1, Sector Norte', 'responsable' => 'Juan Torrez'],
            ['nombre' => 'Gran Suraga', 'ubicacion' => 'Nivel 2, Sector Sur', 'responsable' => 'Juan Carlos Incata'],
            ['nombre' => '4 Estrellas', 'ubicacion' => 'Nivel 3, Sector Este', 'responsable' => 'Jose Luis Mencacho'],
            ['nombre' => '17 de Junio', 'ubicacion' => 'Nivel 4, Sector Oeste', 'responsable' => 'Emilio Torrez'],
            ['nombre' => 'San Lucas', 'ubicacion' => 'Nivel 5, Sector Centro', 'responsable' => 'Waldo Hanco'],
            ['nombre' => 'Bocamina Grande', 'ubicacion' => 'Nivel 6, Sector Principal', 'responsable' => 'Elio Caceres'],
        ];

        foreach ($bocaminas as $boca) {
            Bocamina::firstOrCreate(['nombre' => $boca['nombre']], $boca);
        }
    }
}
