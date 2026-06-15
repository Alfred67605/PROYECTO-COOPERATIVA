<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Rename 'name' to 'nombre'
            $table->renameColumn('name', 'nombre');

            // Add rol_id and estado
            $table->foreignId('rol_id')->nullable()->after('password')->constrained('roles')->onDelete('restrict');
            $table->boolean('estado')->default(true)->after('rol_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['rol_id']);
            $table->dropColumn(['rol_id', 'estado']);
            $table->renameColumn('nombre', 'name');
        });
    }
};
