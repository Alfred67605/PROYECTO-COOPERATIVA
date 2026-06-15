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

        if (!file_exists($filePath)) {
            $this->command->error('El archivo Excel no existe en storage/app/inventario.xlsx');
            return;
        }

        $spreadsheet = IOFactory::load($filePath);
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        // Eliminar encabezado (CÓDIGO, DESCRIPCIÓN, GRUPO, CATEGORÍA, UNIDAD, CANTIDAD, PRECIO UNITARIO, VALOR TOTAL)
        $header = array_shift($rows);

        foreach ($rows as $row) {
            // Verificar si el row no está vacío
            if (empty(trim($row[0]))) continue;

            Material::updateOrCreate(
                ['codigo' => trim($row[0])],
                [
                    'descripcion' => trim($row[1]),
                    'grupo' => trim($row[2]),
                    'categoria' => trim($row[3]),
                    'unidad' => trim($row[4]),
                    'cantidad' => is_numeric($row[5]) ? (float)$row[5] : 0,
                    'precio_unitario' => is_numeric($row[6]) ? (float)$row[6] : 0,
                    'valor_total' => is_numeric($row[7]) ? (float)$row[7] : 0,
                    'estado' => 'disponible',
                ]
            );
        }

        $this->command->info('Materiales importados correctamente desde Excel.');
    }
}
