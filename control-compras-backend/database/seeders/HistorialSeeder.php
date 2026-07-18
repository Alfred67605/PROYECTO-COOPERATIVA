<?php

namespace Database\Seeders;

use App\Models\HistorialOperacion;
use App\Models\User;
use App\Models\Bocamina;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class HistorialSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('nombre', 'Admin Cooperativa')->first();
        $compradores = User::where('rol_id', '!=', $admin->rol_id)->get();
        $allUsers = $compradores->push($admin);

        $now = Carbon::now();

        // Simular historial de operaciones realistas realizadas por los usuarios del sistema
        $operaciones = [
            // === BOCAMINAS ===
            ['accion' => 'crear', 'tabla' => 'bocaminas', 'registro_id' => 1, 'datos_nuevos' => ['nombre' => 'Huari Huari', 'responsable' => 'Juan Torrez'], 'days_ago' => 45],
            ['accion' => 'crear', 'tabla' => 'bocaminas', 'registro_id' => 2, 'datos_nuevos' => ['nombre' => 'Gran Suraga', 'responsable' => 'Juan Carlos Incata'], 'days_ago' => 45],
            ['accion' => 'crear', 'tabla' => 'bocaminas', 'registro_id' => 3, 'datos_nuevos' => ['nombre' => '4 Estrellas', 'responsable' => 'Jose Luis Mencacho'], 'days_ago' => 45],
            ['accion' => 'crear', 'tabla' => 'bocaminas', 'registro_id' => 4, 'datos_nuevos' => ['nombre' => '17 de Junio', 'responsable' => 'Emilio Torrez'], 'days_ago' => 44],
            ['accion' => 'crear', 'tabla' => 'bocaminas', 'registro_id' => 5, 'datos_nuevos' => ['nombre' => 'San Lucas', 'responsable' => 'Waldo Hanco'], 'days_ago' => 44],
            ['accion' => 'crear', 'tabla' => 'bocaminas', 'registro_id' => 6, 'datos_nuevos' => ['nombre' => 'Bocamina Grande', 'responsable' => 'Elio Caceres'], 'days_ago' => 44],
            ['accion' => 'actualizar', 'tabla' => 'bocaminas', 'registro_id' => 1, 'datos_nuevos' => ['ubicacion' => 'Nivel 1, Sector Norte - Actualizado'], 'days_ago' => 20],

            // === USUARIOS ===
            ['accion' => 'crear', 'tabla' => 'usuarios', 'registro_id' => 2, 'datos_nuevos' => ['nombre' => 'Jose Luis Mencacho', 'email' => 'joseluis@cooperativa.com'], 'days_ago' => 43],
            ['accion' => 'crear', 'tabla' => 'usuarios', 'registro_id' => 3, 'datos_nuevos' => ['nombre' => 'Juan Carlos Incata', 'email' => 'juancarlos@cooperativa.com'], 'days_ago' => 43],
            ['accion' => 'crear', 'tabla' => 'usuarios', 'registro_id' => 4, 'datos_nuevos' => ['nombre' => 'Juan Torrez', 'email' => 'juantorrez@cooperativa.com'], 'days_ago' => 43],
            ['accion' => 'crear', 'tabla' => 'usuarios', 'registro_id' => 5, 'datos_nuevos' => ['nombre' => 'Waldo Hanco', 'email' => 'waldo@cooperativa.com'], 'days_ago' => 42],
            ['accion' => 'crear', 'tabla' => 'usuarios', 'registro_id' => 6, 'datos_nuevos' => ['nombre' => 'Emilio Torrez', 'email' => 'emilio@cooperativa.com'], 'days_ago' => 42],
            ['accion' => 'crear', 'tabla' => 'usuarios', 'registro_id' => 7, 'datos_nuevos' => ['nombre' => 'Elio Caceres', 'email' => 'elio@cooperativa.com'], 'days_ago' => 42],
            ['accion' => 'crear', 'tabla' => 'usuarios', 'registro_id' => 8, 'datos_nuevos' => ['nombre' => 'Eloy Canabiri', 'email' => 'eloy@cooperativa.com'], 'days_ago' => 42],

            // === MATERIALES ===
            ['accion' => 'crear', 'tabla' => 'materiales', 'registro_id' => 1, 'datos_nuevos' => ['descripcion' => 'NITRATO (ANFO)', 'grupo' => 'G-1'], 'days_ago' => 40],
            ['accion' => 'crear', 'tabla' => 'materiales', 'registro_id' => 2, 'datos_nuevos' => ['descripcion' => 'DINAMITA', 'grupo' => 'G-1'], 'days_ago' => 40],
            ['accion' => 'crear', 'tabla' => 'materiales', 'registro_id' => 3, 'datos_nuevos' => ['descripcion' => 'FULMINANTE (CAPSULAS)', 'grupo' => 'G-1'], 'days_ago' => 40],
            ['accion' => 'actualizar', 'tabla' => 'materiales', 'registro_id' => 1, 'datos_nuevos' => ['precio_unitario' => 28.00, 'stock' => 369.56], 'days_ago' => 15],

            // === PROVEEDORES ===
            ['accion' => 'crear', 'tabla' => 'proveedores', 'registro_id' => 1, 'datos_nuevos' => ['nombre' => 'Distribuidora Minera Potosí', 'nit' => '1234567890'], 'days_ago' => 39],
            ['accion' => 'crear', 'tabla' => 'proveedores', 'registro_id' => 2, 'datos_nuevos' => ['nombre' => 'Insumos Industriales S.R.L.', 'nit' => '9876543210'], 'days_ago' => 39],
            ['accion' => 'crear', 'tabla' => 'proveedores', 'registro_id' => 3, 'datos_nuevos' => ['nombre' => 'Ferretería Central Sucre', 'nit' => '5432109876'], 'days_ago' => 39],

            // === COMPRAS ===
            ['accion' => 'crear', 'tabla' => 'compras', 'registro_id' => 1, 'datos_nuevos' => ['numero_factura' => 'FAC-00101', 'total' => 3250.50, 'bocamina' => 'Huari Huari'], 'days_ago' => 35, 'user_index' => 4],
            ['accion' => 'crear', 'tabla' => 'compras', 'registro_id' => 2, 'datos_nuevos' => ['numero_factura' => 'FAC-00205', 'total' => 5120.00, 'bocamina' => '4 Estrellas'], 'days_ago' => 30, 'user_index' => 2],
            ['accion' => 'crear', 'tabla' => 'compras', 'registro_id' => 3, 'datos_nuevos' => ['numero_factura' => 'FAC-00312', 'total' => 1890.75, 'bocamina' => 'San Lucas'], 'days_ago' => 25, 'user_index' => 5],
            ['accion' => 'crear', 'tabla' => 'compras', 'registro_id' => 4, 'datos_nuevos' => ['numero_factura' => 'FAC-00419', 'total' => 7450.00, 'bocamina' => 'Gran Suraga'], 'days_ago' => 18, 'user_index' => 3],
            ['accion' => 'crear', 'tabla' => 'compras', 'registro_id' => 5, 'datos_nuevos' => ['numero_factura' => 'FAC-00520', 'total' => 2300.80, 'bocamina' => '17 de Junio'], 'days_ago' => 12, 'user_index' => 6],
            ['accion' => 'actualizar', 'tabla' => 'compras', 'registro_id' => 1, 'datos_nuevos' => ['estado' => 'completado'], 'days_ago' => 33, 'user_index' => 4],
            ['accion' => 'actualizar', 'tabla' => 'compras', 'registro_id' => 2, 'datos_nuevos' => ['estado' => 'completado'], 'days_ago' => 28, 'user_index' => 2],
            ['accion' => 'eliminar', 'tabla' => 'compras', 'registro_id' => 99, 'datos_nuevos' => null, 'days_ago' => 10],

            // === MAQUINARIA ===
            ['accion' => 'crear', 'tabla' => 'maquinaria', 'registro_id' => 1, 'datos_nuevos' => ['tipo' => 'Perforadora Jumbo', 'marca' => 'Sandvik', 'modelo' => 'DD311'], 'days_ago' => 38],
            ['accion' => 'crear', 'tabla' => 'maquinaria', 'registro_id' => 2, 'datos_nuevos' => ['tipo' => 'Perforadora Jumbo', 'marca' => 'Epiroc', 'modelo' => 'M2C'], 'days_ago' => 38],
            ['accion' => 'actualizar', 'tabla' => 'maquinaria', 'registro_id' => 2, 'datos_nuevos' => ['estado' => 'en_mantenimiento', 'horometro' => 3400], 'days_ago' => 8],

            // === VEHICULOS ===
            ['accion' => 'crear', 'tabla' => 'vehiculos', 'registro_id' => 1, 'datos_nuevos' => ['tipo' => 'Volqueta', 'placa' => '2245-LKP', 'marca' => 'Volvo FMX 460'], 'days_ago' => 37],
            ['accion' => 'crear', 'tabla' => 'vehiculos', 'registro_id' => 4, 'datos_nuevos' => ['tipo' => 'Camioneta', 'placa' => '5010-XYZ', 'marca' => 'Toyota Hilux 4x4'], 'days_ago' => 37],
            ['accion' => 'actualizar', 'tabla' => 'vehiculos', 'registro_id' => 3, 'datos_nuevos' => ['estado' => 'en_mantenimiento'], 'days_ago' => 5],

            // === SERVICIOS ===
            ['accion' => 'crear', 'tabla' => 'servicios', 'registro_id' => 1, 'datos_nuevos' => ['codigo' => 'SRV-0001', 'equipo' => 'Jumbo Sandvik DD311', 'fallas' => 'Fuga hidráulica'], 'days_ago' => 14],
            ['accion' => 'crear', 'tabla' => 'servicios', 'registro_id' => 2, 'datos_nuevos' => ['codigo' => 'SRV-0002', 'equipo' => 'Volqueta Volvo FMX', 'fallas' => 'Desgaste de frenos'], 'days_ago' => 10],
            ['accion' => 'actualizar', 'tabla' => 'servicios', 'registro_id' => 1, 'datos_nuevos' => ['estado' => 'Finalizado', 'solucion' => 'Cambio completo de mangueras hidráulicas'], 'days_ago' => 12],

            // === INSPECCIONES ===
            ['accion' => 'crear', 'tabla' => 'inspecciones', 'registro_id' => 1, 'datos_nuevos' => ['equipo' => 'Compresor Atlas Copco XATS-350', 'motor_ok' => true, 'frenos_ok' => true], 'days_ago' => 7],
            ['accion' => 'crear', 'tabla' => 'inspecciones', 'registro_id' => 2, 'datos_nuevos' => ['equipo' => 'Guinche Eléctrico GE-50HP', 'motor_ok' => true, 'frenos_ok' => false], 'days_ago' => 4],

            // === ALQUILER DE GRUAS ===
            ['accion' => 'crear', 'tabla' => 'alquiler-gruas', 'registro_id' => 1, 'datos_nuevos' => ['placa_grua' => 'ALQ-701', 'chofer' => 'Ramiro Soliz Choque', 'capacidad' => '25 Ton'], 'days_ago' => 20],
            ['accion' => 'crear', 'tabla' => 'alquiler-gruas', 'registro_id' => 2, 'datos_nuevos' => ['placa_grua' => 'ALQ-705', 'chofer' => 'Jaime Mamani Flores', 'capacidad' => '40 Ton'], 'days_ago' => 15],
            ['accion' => 'actualizar', 'tabla' => 'alquiler-gruas', 'registro_id' => 1, 'datos_nuevos' => ['costo' => 3800.00, 'tiempo_trabajo' => '12 días'], 'days_ago' => 9],

            // === OPERACIONES RECIENTES (hoy y ayer) ===
            ['accion' => 'crear', 'tabla' => 'compras', 'registro_id' => 20, 'datos_nuevos' => ['numero_factura' => 'FAC-01520', 'total' => 4100.00, 'bocamina' => 'Bocamina Grande'], 'days_ago' => 1, 'user_index' => 7],
            ['accion' => 'crear', 'tabla' => 'compras', 'registro_id' => 21, 'datos_nuevos' => ['numero_factura' => 'FAC-01625', 'total' => 2750.30, 'bocamina' => 'Huari Huari'], 'days_ago' => 0, 'user_index' => 4],
            ['accion' => 'actualizar', 'tabla' => 'maquinaria', 'registro_id' => 6, 'datos_nuevos' => ['estado' => 'en_mantenimiento', 'horometro' => 4100], 'days_ago' => 0],
            ['accion' => 'crear', 'tabla' => 'inspecciones', 'registro_id' => 15, 'datos_nuevos' => ['equipo' => 'Bomba Sumergible Flygt 2640', 'motor_ok' => true], 'days_ago' => 0],
        ];

        foreach ($operaciones as $op) {
            $daysAgo = $op['days_ago'] ?? 0;
            $userIndex = $op['user_index'] ?? null;
            $usuario = $userIndex !== null && isset($allUsers[$userIndex - 1]) ? $allUsers[$userIndex - 1] : $admin;

            $fecha = $now->copy()->subDays($daysAgo)->setHour(rand(7, 18))->setMinute(rand(0, 59))->setSecond(rand(0, 59));

            HistorialOperacion::create([
                'usuario_id' => $usuario->id,
                'accion' => $op['accion'],
                'tabla' => $op['tabla'],
                'registro_id' => $op['registro_id'],
                'datos_nuevos' => $op['datos_nuevos'],
                'ip' => '192.168.1.' . rand(10, 254),
                'fecha' => $fecha,
            ]);
        }
    }
}
