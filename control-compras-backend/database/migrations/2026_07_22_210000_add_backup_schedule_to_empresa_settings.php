<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresa_settings', function (Blueprint $table) {
            $table->string('backup_frecuencia')->default('semanal')->after('logo'); // diario, semanal, mensual, desactivado
            $table->string('backup_dia_semana')->default('domingo')->after('backup_frecuencia'); // domingo, lunes, martes, etc.
            $table->integer('backup_dia_mes')->default(1)->after('backup_dia_semana'); // 1 al 28
            $table->string('backup_hora', 5)->default('02:00')->after('backup_dia_mes'); // HH:mm format
        });
    }

    public function down(): void
    {
        Schema::table('empresa_settings', function (Blueprint $table) {
            $table->dropColumn(['backup_frecuencia', 'backup_dia_semana', 'backup_dia_mes', 'backup_hora']);
        });
    }
};
