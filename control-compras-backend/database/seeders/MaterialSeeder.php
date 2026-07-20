<?php

namespace Database\Seeders;

use App\Models\Material;
use Illuminate\Database\Seeder;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MaterialSeeder extends Seeder
{
    /**
     * Group name mapping from Excel codes to descriptive names.
     */
    private array $groupMapping = [
        'G-1'  => 'Material Explosivo',
        'G-2'  => 'Accesorios e Instalaciones',
        'G-3'  => 'Herramientas',
        'G-4'  => 'Lubricantes y Aceites',
        'G-5'  => 'Filtros y Correas',
        'G-6'  => 'Equipos de Protección Personal',
        'G-7'  => 'Herramientas de Mecánica',
        'G-8'  => 'Pinturas y Anticongelantes',
        'G-9'  => 'Material Eléctrico',
        'G-10' => 'Maderas y Tablones',
        'G-11' => 'Otros',
    ];

    /**
     * Common spelling corrections to apply to descriptions.
     */
    private array $corrections = [
        'STUCHE'    => 'ESTUCHE',
        'STICHE'    => 'ESTUCHE',
        'CIERRA MECANICA' => 'SIERRA MECÁNICA',
        'HOJAS DE CIERRA' => 'HOJAS DE SIERRA',
        'MOTO CIERRA' => 'MOTOSIERRA',
        'STYLSON'   => 'STILLSON',
        'MANGERA'   => 'MANGUERA',
        'SPIGA'     => 'ESPIGA',
        'TAMAñO'    => 'TAMAÑO',
        'PEQUEñO'   => 'PEQUEÑO',
        'ELECTRICA' => 'ELÉCTRICA',
        'ELECTRICO' => 'ELÉCTRICO',
        'TERMICO TRIFASICO' => 'TÉRMICO TRIFÁSICO',
        'TERMICO MONOFASICO' => 'TÉRMICO MONOFÁSICO',
        'NEUMATICO' => 'NEUMÁTICO',
        'PLASTICO'  => 'PLÁSTICO',
        'MECANICA'  => 'MECÁNICA',
        'METALICO'  => 'METÁLICO',
        'OXIGENO'   => 'OXÍGENO',
        'GASOGENO'  => 'GASÓGENO',
    ];

    public function run(): void
    {
        $filePath = storage_path('app/inventario.xlsx');

        // Case 1: Excel file is present, import from Excel
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

                    $codigo = trim($row[0]);
                    $descripcion = trim($row[1] ?? 'Sin descripción');
                    $grupo = trim($row[2] ?? 'Otros');

                    // Skip header/separator rows
                    if ($descripcion === 'Sin descripción' || $codigo === 'TOTALES') {
                        continue;
                    }

                    // Remap group code to descriptive name
                    $grupo = $this->groupMapping[$grupo] ?? $grupo;

                    // Apply spelling corrections
                    $descripcion = $this->fixSpelling($descripcion);

                    Material::updateOrCreate(
                        ['codigo' => $codigo],
                        [
                            'descripcion' => $descripcion,
                            'grupo' => $grupo,
                            'estado' => 'disponible',
                        ]
                    );
                }
                return;
            } catch (\Exception $e) {
                // Fallback to initial catalog if Excel loading fails
            }
        }

        // Case 2: Excel is not present, load initial structured catalog
        $categories = [
            'Material Explosivo' => [
                'NITRATO (ANFO)',
                'DINAMITA',
                'FULMINANTE (CÁPSULAS)',
                'GUÍA',
                'BARRENO 0.80',
                'BARRENO 1.20',
                'BARRENO 1.80',
                'BROCA N° 39 MM',
                'BROCA N° 41 MM',
                'CARGADOR DE ANFO CON ESPIGA DE 3/4',
            ],
            'Accesorios e Instalaciones' => [
                'LLAVE DE PASO 1" GALVANIZADO',
                'UNIÓN PATENTE 1" GALVANIZADO CON BRONCE',
                'NIPLE DE 1" GALVANIZADO',
                'COPLA DE 1" GALVANIZADO',
                'CODO DE 2" GALVANIZADO',
                'MANGUERA DE 1" REFORZADA',
                'TUBO GALVANIZADO DE 1"',
                'VÁLVULA CHECK 1"',
            ],
            'Herramientas' => [
                'PICOTA CON PALA ANCHA',
                'PICOTA NORMAL',
                'PALA PUNTA HUEVO',
                'COMBO DE 2K',
                'COMBO DE 12 LB',
                'STILLSON # 24',
                'STILLSON # 14',
                'SIERRA MECÁNICA N° 12',
                'CURVINA 24',
                'DISCO DE DESGASTE DE 9"',
                'DISCO DE CORTE 7"',
                'ELECTRODO E6013',
                'ELECTRODO E7018',
                'CABLE DE ACERO 1/2',
                'SOGA 3/4',
                'FLEXÓMETRO DE 5 MTS',
                'ALAMBRE GALVANIZADO 6',
                'ALAMBRE DE AMARRE 6',
            ],
            'Lubricantes y Aceites' => [
                'ACEITE DE MOTOR 15W40',
                'ACEITE HIDRÁULICO',
                'GRASA MULTIPROPÓSITO',
                'ACEITE PARA TORNILLO PERFORADOR',
                'ACEITE SAE 90',
                'ACEITE SAE 140',
                'ACEITE PARA ENGRANAJES',
            ],
            'Filtros y Correas' => [
                'FILTRO DE ACEITE',
                'FILTRO DE DIÉSEL',
                'FILTRO DE AIRE',
                'FILTRO HIDRÁULICO',
                'CORREA DE VENTILADOR',
                'CORREA DE ALTERNADOR',
            ],
            'Equipos de Protección Personal' => [
                'CASCO DE SEGURIDAD',
                'GUANTES DE CUERO',
                'GUANTES DE NITRILO',
                'LENTES DE SEGURIDAD',
                'BOTAS DE SEGURIDAD',
                'RESPIRADOR MEDIA CARA',
                'TAPONES AUDITIVOS',
                'CHALECO REFLECTIVO',
                'OVEROL DE TRABAJO',
                'ARNÉS DE SEGURIDAD',
                'PROTECTOR FACIAL',
                'RODILLERAS INDUSTRIALES',
            ],
            'Herramientas de Mecánica' => [
                'SOLDADORA ELÉCTRICA',
                'AMOLADORA TAMAÑO GRANDE',
                'AMOLADORA TAMAÑO PEQUEÑO',
                'MOTOSIERRA',
                'SOPLETE MANUAL',
                'ESTUCHE DE LLAVES DADO',
                'ESTUCHE DE BROCAS',
                'ENGRASADORA 5K',
                'HIDROLAVADORA',
            ],
            'Pinturas y Anticongelantes' => [
                'ANTICONGELANTE',
                'THINNER 900CC',
                'DESENGRASANTE DE MOTOR',
                'MONOPOL NEGRO',
                'MONOPOL AMARILLO',
                'MONOPOL AZUL',
                'AEROSOL VERDE',
                'AEROSOL ROJO',
                'LIMPIA CONTACTO',
            ],
            'Material Eléctrico' => [
                'CAJA DISTRIBUIDORA ELÉCTRICA',
                'TÉRMICO TRIFÁSICO',
                'TÉRMICO MONOFÁSICO',
                'REFLECTOR LED 200W',
                'REFLECTOR LED 50W',
                'FOCO 9W',
                'INTERRUPTOR MIXTO',
                'ENCHUFE',
                'CINTA ELÉCTRICA',
                'PRECINTO PLÁSTICO',
            ],
            'Maderas y Tablones' => [
                'CALLAPOS DE 2.50 MTS',
                'CHAJLLA REDONDA DE 2.50 MTS',
                'CHAJLLA RALLADA DE 2.50 MTS',
                'MADERA LABRADA DE 3x3x2.50 MTS',
                'DURMIENTE DE 3x6x1 MTS',
                'TABLÓN DE MADERA',
                'ESCALERA DE MADERA 4 MTS',
            ],
            'Otros' => [
                'BALDES',
                'SACOS',
                'GUINCHE',
                'RONDANAS',
                'FRENO DE GUINCHE',
                'GANCHOS',
                'SOGAS',
            ],
        ];

        $groupPrefixes = [
            'Material Explosivo' => 'G-1',
            'Accesorios e Instalaciones' => 'G-2',
            'Herramientas' => 'G-3',
            'Lubricantes y Aceites' => 'G-4',
            'Filtros y Correas' => 'G-5',
            'Equipos de Protección Personal' => 'G-6',
            'Herramientas de Mecánica' => 'G-7',
            'Pinturas y Anticongelantes' => 'G-8',
            'Material Eléctrico' => 'G-9',
            'Maderas y Tablones' => 'G-10',
            'Otros' => 'G-11',
        ];

        foreach ($categories as $groupName => $items) {
            $prefix = $groupPrefixes[$groupName] ?? 'MAT';
            $index = 1;
            foreach ($items as $itemName) {
                $code = $prefix . '/' . str_pad($index, 4, '0', STR_PAD_LEFT);

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

    /**
     * Apply known spelling corrections to a description.
     */
    private function fixSpelling(string $desc): string
    {
        foreach ($this->corrections as $wrong => $correct) {
            $desc = str_replace($wrong, $correct, $desc);
        }
        return $desc;
    }
}
