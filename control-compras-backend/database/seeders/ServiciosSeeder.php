<?php

namespace Database\Seeders;

use App\Models\Bocamina;
use App\Models\Material;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ServiciosSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Tipo Mantenimientos (5 datos realistas)
        $tiposMantenimiento = [
            ['nombre' => 'Mantenimiento Preventivo de Rutina', 'descripcion' => 'Revisión técnica general, cambio de filtros, aceites y engrase de piezas.'],
            ['nombre' => 'Mantenimiento Correctivo de Emergencia', 'descripcion' => 'Reparación inmediata por falla mecánica inesperada en labores.'],
            ['nombre' => 'Calibración y Ajuste de Sistemas', 'descripcion' => 'Optimización de parámetros eléctricos, de presión e hidráulicos del equipo.'],
            ['nombre' => 'Reparación Mayor de Motor/Transmisión', 'descripcion' => 'Overhaul completo o intervención profunda de partes mecánicas críticas.'],
            ['nombre' => 'Inspección de Seguridad Estructural', 'descripcion' => 'Validación de fatiga de metales, soldaduras y sistemas de protección contra derrumbes.'],
        ];

        $tiposMantenimientoIds = [];
        foreach ($tiposMantenimiento as $tipo) {
            $tiposMantenimientoIds[] = DB::table('tipo_mantenimientos')->insertGetId(array_merge($tipo, [
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }

        // 2. Maquinarias (10 datos realistas de minería)
        $maquinarias = [
            ['tipo' => 'Perforadora Jumbo', 'nombre_codigo' => 'JUM-01', 'marca' => 'Sandvik', 'modelo' => 'DD311', 'horometro' => 1250, 'estado' => 'operativa'],
            ['tipo' => 'Perforadora Jumbo', 'nombre_codigo' => 'JUM-02', 'marca' => 'Epiroc', 'modelo' => 'M2C', 'horometro' => 3400, 'estado' => 'en_mantenimiento'],
            ['tipo' => 'Cargador de Bajo Perfil', 'nombre_codigo' => 'SCO-01', 'marca' => 'CAT', 'modelo' => 'R1300G', 'horometro' => 5200, 'estado' => 'operativa'],
            ['tipo' => 'Cargador de Bajo Perfil', 'nombre_codigo' => 'SCO-02', 'marca' => 'Sandvik', 'modelo' => 'LH203', 'horometro' => 850, 'estado' => 'operativa'],
            ['tipo' => 'Compresor de Aire', 'nombre_codigo' => 'COM-01', 'marca' => 'Atlas Copco', 'modelo' => 'XATS-350', 'horometro' => 8900, 'estado' => 'operativa'],
            ['tipo' => 'Compresor de Aire', 'nombre_codigo' => 'COM-02', 'marca' => 'Ingersoll Rand', 'modelo' => 'P185', 'horometro' => 4100, 'estado' => 'en_mantenimiento'],
            ['tipo' => 'Generador Eléctrico', 'nombre_codigo' => 'GEN-01', 'marca' => 'Caterpillar', 'modelo' => 'DE150', 'horometro' => 1800, 'estado' => 'operativa'],
            ['tipo' => 'Extractor Axial', 'nombre_codigo' => 'EXT-01', 'marca' => 'Howden', 'modelo' => 'Axipal 120', 'horometro' => 11200, 'estado' => 'operativa'],
            ['tipo' => 'Bomba Sumergible', 'nombre_codigo' => 'BOM-01', 'marca' => 'Flygt', 'modelo' => '2640', 'horometro' => 2900, 'estado' => 'operativa'],
            ['tipo' => 'Guinche Eléctrico', 'nombre_codigo' => 'WIN-01', 'marca' => 'Insemine', 'modelo' => 'GE-50HP', 'horometro' => 7800, 'estado' => 'operativa'],
        ];

        $maquinariasIds = [];
        foreach ($maquinarias as $maq) {
            $maquinariasIds[] = DB::table('maquinarias')->insertGetId(array_merge($maq, [
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }

        // 3. Vehículos (10 datos realistas)
        $vehiculos = [
            ['tipo' => 'Volqueta', 'placa' => '2245-LKP', 'marca' => 'Volvo', 'modelo' => 'FMX 460', 'estado' => 'operativo'],
            ['tipo' => 'Volqueta', 'placa' => '4890-SDF', 'marca' => 'Sinotruk', 'modelo' => 'Howo 371', 'estado' => 'operativo'],
            ['tipo' => 'Volqueta', 'placa' => '3122-JKC', 'marca' => 'Shacman', 'modelo' => 'X3000', 'estado' => 'en_mantenimiento'],
            ['tipo' => 'Camioneta', 'placa' => '5010-XYZ', 'marca' => 'Toyota', 'modelo' => 'Hilux 4x4', 'estado' => 'operativo'],
            ['tipo' => 'Camioneta', 'placa' => '4090-ABC', 'marca' => 'Nissan', 'modelo' => 'Frontier 4x4', 'estado' => 'operativo'],
            ['tipo' => 'Camioneta', 'placa' => '2811-UIO', 'marca' => 'Mitsubishi', 'modelo' => 'L200', 'estado' => 'operativo'],
            ['tipo' => 'Minibús', 'placa' => '3555-PLM', 'marca' => 'King Long', 'modelo' => 'Placer 15p', 'estado' => 'operativo'],
            ['tipo' => 'Minibús', 'placa' => '4112-QWE', 'marca' => 'Foton', 'modelo' => 'View CS2', 'estado' => 'operativo'],
            ['tipo' => 'Cisterna Agua', 'placa' => '1909-VBN', 'marca' => 'Iveco', 'modelo' => 'Tracker', 'estado' => 'operativo'],
            ['tipo' => 'Camión Plataforma', 'placa' => '5420-TYU', 'marca' => 'Mercedes-Benz', 'modelo' => 'Atego 1726', 'estado' => 'operativo'],
        ];

        $vehiculosIds = [];
        foreach ($vehiculos as $veh) {
            $vehiculosIds[] = DB::table('vehiculos')->insertGetId(array_merge($veh, [
                'created_at' => $now,
                'updated_at' => $now,
            ]));
        }

        // 4. Servicios de Mantenimiento (15 registros asociados a Maquinarias y Vehículos)
        $admin = User::first();
        $bocaminas = Bocamina::all();
        $materiales = Material::all();

        for ($i = 1; $i <= 15; $i++) {
            $esMaquinaria = rand(0, 1) === 1;
            $equipo_tipo = $esMaquinaria ? 'App\\Models\\Maquinaria' : 'App\\Models\\Vehiculo';
            $equipo_id = $esMaquinaria ? $maquinariasIds[array_rand($maquinariasIds)] : $vehiculosIds[array_rand($vehiculosIds)];
            $bocamina = $bocaminas->random();

            $fallaArray = [
                'Fuga de fluido hidráulico en mangueras de presión.',
                'Desgaste severo de pastillas de freno y zapatas.',
                'Filtros de aire completamente saturados y caída de rendimiento.',
                'Ruidos anormales en rodajes y falta de engrase en juntas.',
                'Arranque difícil en frío y desgaste de bujías/calentadores.'
            ];
            $solucionArray = [
                'Cambio completo de mangueras hidráulicas de 3/4 pulgadas y purgado de aire.',
                'Reemplazo de pastillas y zapatas de freno por repuestos nuevos homologados.',
                'Limpieza de ductos de admisión y colocación de nuevos filtros de aire y aceite.',
                'Engrase a presión de rodamientos de transmisión y juntas cardánicas.',
                'Instalación de kit de mantenimiento de motor, cambio de calentadores y revisión de inyectores.'
            ];

            $randIndex = array_rand($fallaArray);

            $servicioId = DB::table('servicios')->insertGetId([
                'codigo' => 'SRV-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'fecha' => $now->copy()->subDays(rand(1, 45))->format('Y-m-d'),
                'hora' => str_pad(rand(8, 17), 2, '0', STR_PAD_LEFT) . ':' . str_pad(rand(0, 59), 2, '0', STR_PAD_LEFT) . ':00',
                'usuario_registro_id' => $admin->id,
                'responsable_id' => $admin->id,
                'estado' => $i % 3 === 0 ? 'Pendiente' : 'Finalizado',
                'equipo_tipo' => $equipo_tipo,
                'equipo_id' => $equipo_id,
                'boca_mina_id' => $bocamina->id,
                'tipo_mantenimiento_id' => $tiposMantenimientoIds[array_rand($tiposMantenimientoIds)],
                'descripcion' => 'Servicio técnico periódico programado para asegurar vida útil.',
                'fallas' => $fallaArray[$randIndex],
                'solucion' => $solucionArray[$randIndex],
                'observaciones' => 'Inspección técnica general posterior al servicio arrojó resultados óptimos.',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // 5. Repuestos consumidos por el servicio (1 a 3 repuestos del catálogo)
            if ($i % 3 !== 0) { // Solo para finalizados
                $selectedMaterials = $materiales->random(rand(1, 3));
                foreach ($selectedMaterials as $mat) {
                    DB::table('repuesto_servicios')->insert([
                        'servicio_id' => $servicioId,
                        'material_id' => $mat->id,
                        'cantidad' => rand(1, 5),
                        'costo_unitario' => rand(25, 200),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }

            // 6. Costos asociados al servicio (mano de obra, flete, etc.)
            $tipoCosto = rand(0, 1) === 1 ? 'Mano de obra' : 'Servicios externos';
            DB::table('costo_servicios')->insert([
                'servicio_id' => $servicioId,
                'tipo_costo' => $tipoCosto,
                'descripcion' => $tipoCosto === 'Mano de obra' ? 'Mano de obra técnico especializado' : 'Servicio de Tornería externo',
                'monto' => rand(150, 1200),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 7. Inspecciones Técnicas Preventivas (15 datos realistas)
        for ($i = 1; $i <= 15; $i++) {
            $esMaquinaria = rand(0, 1) === 1;
            $equipo_tipo = $esMaquinaria ? 'App\\Models\\Maquinaria' : 'App\\Models\\Vehiculo';
            $equipo_id = $esMaquinaria ? $maquinariasIds[array_rand($maquinariasIds)] : $vehiculosIds[array_rand($vehiculosIds)];

            DB::table('inspeccions')->insert([
                'equipo_tipo' => $equipo_tipo,
                'equipo_id' => $equipo_id,
                'motor_ok' => rand(1, 10) <= 9,
                'frenos_ok' => rand(1, 10) <= 8,
                'aceite_ok' => rand(1, 10) <= 9,
                'neumaticos_ok' => rand(1, 10) <= 9,
                'luces_ok' => rand(1, 10) <= 8,
                'seguridad_ok' => rand(1, 10) <= 9,
                'observaciones' => $i % 4 === 0 ? 'Requiere ajuste de frenos a la brevedad y reposición de faro trasero roto.' : 'Equipo sin observaciones en su inspección estructural y de motor.',
                'firma_responsable_id' => $admin->id,
                'created_at' => $now->copy()->subDays(rand(1, 30)),
                'updated_at' => $now,
            ]);
        }

        // 8. Alquileres de Grúas Externas (15 datos realistas)
        $grúasExternas = [
            ['placa_grua' => 'ALQ-701', 'capacidad_carga' => '25 Toneladas', 'nombre_chofer' => 'Ramiro Soliz Choque', 'tiempo_trabajo' => '10 días', 'costo' => 3500.00],
            ['placa_grua' => 'ALQ-702', 'capacidad_carga' => '35 Toneladas', 'nombre_chofer' => 'Guzmán Quiroga Siles', 'tiempo_trabajo' => '2 semanas', 'costo' => 6800.00],
            ['placa_grua' => 'ALQ-703', 'capacidad_carga' => '50 Toneladas', 'nombre_chofer' => 'Zenón Ticona Alarcón', 'tiempo_trabajo' => '5 días', 'costo' => 5000.00],
            ['placa_grua' => 'ALQ-704', 'capacidad_carga' => '20 Toneladas', 'nombre_chofer' => 'Hugo Vedia López', 'tiempo_trabajo' => '3 semanas', 'costo' => 8200.00],
            ['placa_grua' => 'ALQ-705', 'capacidad_carga' => '40 Toneladas', 'nombre_chofer' => 'Jaime Mamani Flores', 'tiempo_trabajo' => '1 mes', 'costo' => 15000.00],
            ['placa_grua' => 'ALQ-706', 'capacidad_carga' => '30 Toneladas', 'nombre_chofer' => 'Félix Condori Quispe', 'tiempo_trabajo' => '8 días', 'costo' => 4200.00],
            ['placa_grua' => 'ALQ-707', 'capacidad_carga' => '25 Toneladas', 'nombre_chofer' => 'Mario Colque Cruz', 'tiempo_trabajo' => '15 días', 'costo' => 5500.00],
        ];

        for ($i = 0; $i < 15; $i++) {
            $grua = $grúasExternas[$i % count($grúasExternas)];
            $bocamina = $bocaminas->random();

            DB::table('alquiler_gruas')->insert([
                'placa_grua' => $grua['placa_grua'],
                'capacidad_carga' => $grua['capacidad_carga'],
                'nombre_chofer' => $grua['nombre_chofer'],
                'tiempo_trabajo' => $grua['tiempo_trabajo'],
                'costo' => $grua['costo'] + rand(-200, 500),
                'bocamina_id' => $bocamina->id,
                'created_at' => $now->copy()->subDays(rand(1, 60)),
                'updated_at' => $now,
            ]);
        }
    }
}
