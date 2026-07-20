<?php

namespace App\Console\Commands;

use App\Models\Material;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanMaterialData extends Command
{
    protected $signature = 'materials:clean';
    protected $description = 'Clean material data: rename groups, fix names, remove header rows';

    public function handle(): int
    {
        $this->info('🔧 Limpiando datos de materiales...');

        // ─── 1. Remove or inactivate header/separator rows ───
        $headers = Material::where('descripcion', 'Sin descripción')
            ->orWhere('codigo', 'TOTALES')
            ->get();

        $deletedCount = 0;
        $inactivatedCount = 0;
        foreach ($headers as $header) {
            // Check if it has purchase details referencing it
            $hasReferences = DB::table('detalle_compras')
                ->where('material_id', $header->id)
                ->exists();

            if ($hasReferences) {
                // Can't delete - mark as inactive and give a proper description
                $groupName = $this->getGroupName($header->codigo);
                $header->update([
                    'estado' => 'inactivo',
                    'descripcion' => $groupName ?: 'Material de encabezado (inactivo)',
                    'grupo' => 'Otros',
                ]);
                $inactivatedCount++;
            } else {
                $header->delete();
                $deletedCount++;
            }
        }
        $this->info("🗑  Eliminadas {$deletedCount} filas de encabezado, {$inactivatedCount} inactivadas (referenciadas)");

        // ─── 2. Rename groups from G-X to descriptive names ───
        $groupMapping = [
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

        foreach ($groupMapping as $old => $new) {
            $updated = Material::where('grupo', $old)->update(['grupo' => $new]);
            if ($updated > 0) {
                $this->line("  ✅ {$old} → {$new} ({$updated} materiales)");
            }
        }

        // ─── 3. Fix common spelling errors in descriptions ───
        $corrections = [
            // STUCHE → ESTUCHE
            ['STUCHE DE BROCAS', 'ESTUCHE DE BROCAS'],
            ['STUCHE DE LLAVES', 'ESTUCHE DE LLAVES'],
            ['STUCHE DE SOLDAR', 'ESTUCHE DE SOLDAR'],
            ['STICHE DE TARRAJA', 'ESTUCHE DE TARRAJA'],
            // CIERRA → SIERRA
            ['CIERRA MECANICA', 'SIERRA MECÁNICA'],
            ['HOJAS DE CIERRA', 'HOJAS DE SIERRA'],
            ['MOTO CIERRA', 'MOTOSIERRA'],
            // STYLSON → STILLSON
            ['STYLSON', 'STILLSON'],
            // MANGERA → MANGUERA
            ['MANGERA', 'MANGUERA'],
            // SPIGA → ESPIGA
            ['SPIGA', 'ESPIGA'],
            // TAMAñO → TAMAÑO / PEQUEñO → PEQUEÑO
            ['TAMAñO', 'TAMAÑO'],
            ['PEQUEñO', 'PEQUEÑO'],
            // ELECTRICA → ELÉCTRICA
            ['ELECTRICA', 'ELÉCTRICA'],
            // TERMICO → TÉRMICO
            ['TERMICO TRIFASICO', 'TÉRMICO TRIFÁSICO'],
            ['TERMICO MONOFASICO', 'TÉRMICO MONOFÁSICO'],
            // NEUMATICO → NEUMÁTICO
            ['NEUMATICO', 'NEUMÁTICO'],
            // PLASTICO → PLÁSTICO
            ['PLASTICO', 'PLÁSTICO'],
            // ELECTRICO → ELÉCTRICO
            ['ELECTRICO', 'ELÉCTRICO'],
            // MECANICA → MECÁNICA (standalone)
            ['MECANICA', 'MECÁNICA'],
            // METALICO → METÁLICO
            ['METALICO', 'METÁLICO'],
            // NEUMATICO → NEUMÁTICO (already done above, but keep for safety)
            // OXIGENO → OXÍGENO
            ['OXIGENO', 'OXÍGENO'],
            // GASOGENO → GASÓGENO
            ['GASOGENO', 'GASÓGENO'],
        ];

        $fixCount = 0;
        foreach ($corrections as [$wrong, $correct]) {
            $materials = Material::where('descripcion', 'like', "%{$wrong}%")->get();
            foreach ($materials as $mat) {
                // Use word-boundary regex to avoid partial matches (e.g. STUCHE inside ESTUCHE)
                $pattern = '/\b' . preg_quote($wrong, '/') . '/';
                $newDesc = preg_replace($pattern, $correct, $mat->descripcion);
                if ($newDesc !== null && $newDesc !== $mat->descripcion) {
                    $mat->update(['descripcion' => $newDesc]);
                    $fixCount++;
                }
            }
        }

        $this->info("📝 Corregidos {$fixCount} nombres de materiales");

        $this->info('');
        $this->info('✅ Limpieza completada.');
        $this->info('   Total materiales activos: ' . Material::where('estado', 'disponible')->count());
        $this->info('   Grupos actuales:');
        $groups = Material::where('estado', 'disponible')
            ->select('grupo')
            ->selectRaw('count(*) as total')
            ->groupBy('grupo')
            ->orderBy('grupo')
            ->get();
        foreach ($groups as $g) {
            $this->line("     • {$g->grupo}: {$g->total}");
        }

        return 0;
    }

    private function getGroupName(string $codigo): string
    {
        if (str_contains($codigo, '—')) {
            $parts = explode('—', $codigo);
            return trim($parts[1] ?? '');
        }
        return '';
    }
}
