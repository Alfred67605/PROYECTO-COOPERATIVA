<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ServiciosSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Tipo Mantenimientos (10 datos)
        for ($i = 1; $i <= 10; $i++) {
            DB::table('tipo_mantenimientos')->insert([
                'nombre' => 'Mantenimiento Nivel ' . $i,
                'descripcion' => 'Revisión y mantenimiento general de tipo ' . $i,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 2. Maquinarias (10 datos)
        $maquinariasIds = [];
        $tiposMaquinaria = ['Excavadora', 'Retroexcavadora', 'Cargador Frontal', 'Volqueta', 'Perforadora'];
        for ($i = 1; $i <= 10; $i++) {
            $id = DB::table('maquinarias')->insertGetId([
                'tipo' => $tiposMaquinaria[array_rand($tiposMaquinaria)],
                'nombre_codigo' => 'MAQ-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'marca' => 'CAT',
                'modelo' => 'Mod-' . (2010 + $i),
                'horometro' => rand(100, 5000),
                'estado' => $i % 3 == 0 ? 'en_mantenimiento' : 'operativa',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $maquinariasIds[] = $id;
        }

        // 3. Gruas (10 datos)
        $gruasIds = [];
        for ($i = 1; $i <= 10; $i++) {
            $id = DB::table('gruas')->insertGetId([
                'tipo' => 'Torre',
                'codigo' => 'GRU-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'capacidad_carga' => rand(10, 50),
                'operador_id' => null,
                'estado' => $i % 4 == 0 ? 'en_mantenimiento' : 'operativa',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $gruasIds[] = $id;
        }

        // 4. Vehiculos (10 datos)
        $vehiculosIds = [];
        $tiposVehiculo = ['Camioneta', 'Minibus', 'Camion'];
        for ($i = 1; $i <= 10; $i++) {
            $id = DB::table('vehiculos')->insertGetId([
                'tipo' => $tiposVehiculo[array_rand($tiposVehiculo)],
                'placa' => 'ABC-' . rand(100, 999),
                'marca' => 'Toyota',
                'modelo' => 'Hilux',
                'conductor_id' => null,
                'estado' => 'operativo',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $vehiculosIds[] = $id;
        }

        // 5. Servicios (10 datos conectados a maquinarias, gruas o vehiculos)
        for ($i = 1; $i <= 10; $i++) {
            // Distribuir entre los 3 tipos
            $tipo = rand(1, 3);
            if ($tipo === 1) {
                $equipo_tipo = 'App\\Models\\Maquinaria';
                $equipo_id = $maquinariasIds[array_rand($maquinariasIds)];
            } elseif ($tipo === 2) {
                $equipo_tipo = 'App\\Models\\Grua';
                $equipo_id = $gruasIds[array_rand($gruasIds)];
            } else {
                $equipo_tipo = 'App\\Models\\Vehiculo';
                $equipo_id = $vehiculosIds[array_rand($vehiculosIds)];
            }

            DB::table('servicios')->insert([
                'codigo' => 'SRV-10' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'fecha' => $now->copy()->subDays(rand(1, 30))->format('Y-m-d'),
                'hora' => '10:00:00',
                'usuario_registro_id' => 1,
                'responsable_id' => 1,
                'estado' => $i % 2 == 0 ? 'Finalizado' : 'Pendiente',
                'equipo_tipo' => $equipo_tipo,
                'equipo_id' => $equipo_id,
                'tipo_mantenimiento_id' => rand(1, 10),
                'descripcion' => 'Cambio de aceite y filtros generales',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
