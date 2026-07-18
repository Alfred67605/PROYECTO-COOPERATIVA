<?php

namespace Database\Seeders;

use App\Models\Material;
use Illuminate\Database\Seeder;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $filePath = storage_path('app/inventario.xlsx');

        // Case 1: Excel file is present, import from Excel (using only active columns)
        if (file_exists($filePath)) {
            try {
                $spreadsheet = IOFactory::load($filePath);
                $worksheet = $spreadsheet->getActiveSheet();
                $rows = $worksheet->toArray();

                // Remove header row
                array_shift($rows);

                foreach ($rows as $row) {
                    if (empty($row[0]) || empty(trim($row[0]))) {
                        continue;
                    }

                    Material::updateOrCreate(
                        ['codigo' => trim($row[0])],
                        [
                            'descripcion' => trim($row[1] ?? 'Sin descripción'),
                            'grupo' => trim($row[2] ?? 'Otros'),
                            'estado' => 'disponible',
                        ]
                    );
                }
                return;
            } catch (\Exception $e) {
                // Fallback to initial catalog if Excel loading fails
            }
        }

        // Case 2: Excel is not present (or loading failed), load initial structured catalog
        $categories = [
            'Herramientas' => [
                'Carros de diferentes medidas',
                'Neumáticos',
                'Grasa',
                'Grasero'
            ],
            'Combustibles' => [
                'Diésel',
                'Gasolina'
            ],
            'Cambio de aceite' => [
                'Filtro de aceite',
                'Filtro de diésel',
                'Filtro de aire'
            ],
            'Lubricantes' => [
                'Aceite para tornillo',
                'Aceite para motor'
            ],
            'Automotores' => [
                'Volqueta',
                'Bus',
                'Vagonetas',
                'Gallina',
                'Camionetas'
            ],
            'Vehículos registrados' => [
                'Mitsubishi Blanco',
                'Mitsubishi Rojo',
                'Changan Blanco',
                'JAC Gris',
                'Haval Blanco',
                'Ford Raptor Blanco',
                'Toyota RAV4 Perla',
                'Haval Vagoneta',
                'GWM Gris'
            ],
            'Máquina de perforación' => [
                'Barreno',
                'Cargadora de ANFO',
                'Taqueadora'
            ],
            'Materiales' => [
                'ANFO',
                'Dinamita',
                'Guía',
                'Fulminante',
                'Polifil',
                'Aceite para máquina',
                'Neumol'
            ],
            'Herramientas manuales' => [
                'Pala',
                'Pico',
                'Combo',
                'Llave Stilson',
                'Llave Crescente',
                'Alicate',
                'Alambre de amarre',
                'Clavos de diferentes medidas',
                'Azuela',
                'Curvina',
                'Cincel',
                'Sierra mecánica',
                'Politubo',
                'Manguera'
            ],
            'Maderas' => [
                'Limas',
                'Callapos de diferentes medidas',
                'Tablones',
                'Callapos partidos',
                'Vigas',
                'Gradas',
                'Durmientes'
            ],
            'Reparaciones' => [
                'Aletas',
                'Rodamientos'
            ],
            'Otros' => [
                'Llave de paso',
                'Uniones de diferentes medidas',
                'Reductores',
                'Y de diferentes medidas',
                'Baldes',
                'Sacos',
                'Guinche',
                'Rondanas',
                'Sapos',
                'Freno de guinche',
                'Térmicos trifásicos',
                'Cable para guinche',
                'Cable para energía',
                'Ganchos',
                'Sogas',
                'Botas'
            ]
        ];

        $prefixMap = [
            'Herramientas' => 'HERR',
            'Combustibles' => 'COMB',
            'Cambio de aceite' => 'ACEI',
            'Lubricantes' => 'LUB',
            'Automotores' => 'AUTO',
            'Vehículos registrados' => 'VEHI',
            'Máquina de perforación' => 'PERF',
            'Materiales' => 'MAT',
            'Herramientas manuales' => 'MANU',
            'Maderas' => 'MADE',
            'Reparaciones' => 'REPA',
            'Otros' => 'OTRO'
        ];

        foreach ($categories as $groupName => $items) {
            $prefix = $prefixMap[$groupName] ?? 'MAT';
            $index = 1;
            foreach ($items as $itemName) {
                $code = $prefix . '-' . str_pad($index, 2, '0', STR_PAD_LEFT);
                
                Material::updateOrCreate(
                    ['descripcion' => $itemName, 'grupo' => $groupName],
                    [
                        'codigo' => $code,
                        'imagen' => null,
                        'estado' => 'disponible',
                    ]
                );
                
                $index++;
            }
        }
    }
}
