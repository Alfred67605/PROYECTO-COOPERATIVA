<?php

namespace Database\Seeders;

use App\Models\Proveedor;
use Illuminate\Database\Seeder;

class ProveedorSeeder extends Seeder
{
    public function run(): void
    {
        $proveedores = [
            ['nombre' => 'Maquinarias Mineras S.A.', 'telefono' => '2223344', 'nit' => '10203040'],
            ['nombre' => 'Herramientas del Sur Ltda.', 'telefono' => '5556677', 'nit' => '50607080'],
            ['nombre' => 'Insumos Industriales S.R.L.', 'telefono' => '8889900', 'nit' => '90102030'],
        ];

        foreach ($proveedores as $prov) {
            Proveedor::firstOrCreate(['nombre' => $prov['nombre']], $prov);
        }
    }
}
