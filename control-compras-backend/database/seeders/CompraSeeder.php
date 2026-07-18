<?php

namespace Database\Seeders;

use App\Models\Bocamina;
use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\Material;
use App\Models\Proveedor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class CompraSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Get seeded entities
        $proveedores = Proveedor::all();
        $materiales = Material::all();

        if ($proveedores->isEmpty() || $materiales->isEmpty()) {
            return;
        }

        // Bocaminas and their designated managers
        $mapping = [
            '4 Estrellas' => 'Jose Luis Mencacho',
            'Huari Huari' => 'Juan Torrez',
            'San Lucas' => 'Waldo Hanco',
            'Gran Suraga' => 'Juan Carlos Incata',
            '17 de Junio' => 'Emilio Torrez',
            'Bocamina Grande' => 'Elio Caceres',
        ];

        // Also get other users to act as secondary purchasers
        $eloy = User::where('nombre', 'Eloy Canabiri')->first();
        $admin = User::where('nombre', 'Admin Cooperativa')->first();

        // 2. Generate a substantial amount of historical purchases (25 total)
        for ($i = 1; $i <= 25; $i++) {
            // Determine bocamina and user
            // 80% of the time, use the designated mapping, 20% of the time assign randomly or to Eloy/Admin
            if (rand(1, 10) <= 8) {
                $bocaminaNombre = array_rand($mapping);
                $usuarioNombre = $mapping[$bocaminaNombre];
                $bocamina = Bocamina::where('nombre', $bocaminaNombre)->first();
                $usuario = User::where('nombre', $usuarioNombre)->first();
            } else {
                $bocamina = Bocamina::inRandomOrder()->first();
                $usuario = rand(1, 2) === 1 ? $eloy : $admin;
            }

            if (!$bocamina || !$usuario) {
                continue;
            }

            $proveedor = $proveedores->random();
            // Dates distributed over the last 6 months
            $fecha = Carbon::now()->subDays(rand(2, 180));
            $numeroFactura = 'FAC-' . str_pad(rand(100, 99999), 5, '0', STR_PAD_LEFT);
            
            $observacionesArray = [
                "Adquisición periódica de herramientas y repuestos de perforación para las labores en {$bocamina->nombre}.",
                "Compra de insumos químicos (ANFO/Dinamita) solicitada de emergencia para el avance de galería en {$bocamina->nombre}.",
                "Reposición de herramientas manuales (picos, palas, combos) para el personal de la bocamina {$bocamina->nombre}.",
                "Adquisición de maderas (callapos, tablas) para fortificación de galerías en {$bocamina->nombre}.",
                "Suministro de lubricantes y aceites de motor para las maquinarias operando en {$bocamina->nombre}."
            ];
            $observaciones = $observacionesArray[array_rand($observacionesArray)];

            // Create Compra
            $compra = Compra::create([
                'proveedor_id' => $proveedor->id,
                'usuario_id' => $usuario->id,
                'bocamina_id' => $bocamina->id,
                'fecha' => $fecha,
                'numero_factura' => $numeroFactura,
                'observaciones' => $observaciones,
                'total' => 0.00,
                'estado' => rand(1, 10) <= 9 ? 'completado' : 'pendiente',
            ]);

            // Add 1 to 4 details (items purchased)
            $detalleCount = rand(1, 4);
            $selectedMaterials = $materiales->random($detalleCount);
            $totalCompra = 0;

            foreach ($selectedMaterials as $material) {
                $cantidad = rand(2, 50);
                $precio = rand(10, 150) + (rand(0, 9) * 0.1);
                $subtotal = $cantidad * $precio;
                $totalCompra += $subtotal;

                DetalleCompra::create([
                    'compra_id' => $compra->id,
                    'material_id' => $material->id,
                    'cantidad' => $cantidad,
                    'precio' => $precio,
                    'subtotal' => $subtotal,
                ]);
            }

            // Update the total on the Compra model
            $compra->update(['total' => $totalCompra]);
        }
    }
}
