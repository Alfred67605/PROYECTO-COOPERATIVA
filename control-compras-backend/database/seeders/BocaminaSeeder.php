<?php

namespace Database\Seeders;

use App\Models\Bocamina;
use Illuminate\Database\Seeder;

class BocaminaSeeder extends Seeder
{
    public function run(): void
    {
        $bocaminas = [
            ['nombre' => 'Bocamina San José', 'ubicacion' => 'Nivel 1, Sector Norte', 'responsable' => 'Juan Pérez'],
            ['nombre' => 'Bocamina El Rosario', 'ubicacion' => 'Nivel 2, Sector Sur', 'responsable' => 'Carlos Gómez'],
            ['nombre' => 'Bocamina La Esperanza', 'ubicacion' => 'Nivel 3, Sector Este', 'responsable' => 'Luis Fernández'],
        ];

        foreach ($bocaminas as $boca) {
            Bocamina::create($boca);
        }
    }
}
