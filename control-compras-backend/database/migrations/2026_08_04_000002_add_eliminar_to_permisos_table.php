<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Permiso;

return new class extends Migration
{
    /**
     * Agrega el permiso 'eliminar' a la tabla permisos.
     */
    public function up(): void
    {
        try {
            Permiso::updateOrCreate(
                ['nombre' => 'eliminar'],
                ['descripcion' => 'Permiso para eliminar registros en cualquier módulo.']
            );
        } catch (\Throwable $e) {
            // Silence if table or DB not migrated yet
        }
    }

    public function down(): void
    {
        try {
            Permiso::where('nombre', 'eliminar')->delete();
        } catch (\Throwable $e) {
            // Silence
        }
    }
};
