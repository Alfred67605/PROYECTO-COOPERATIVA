<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inspeccions', function (Blueprint $table) {
            $table->id();
            $table->string('equipo_tipo'); // 'maquinaria', 'grua', 'vehiculo'
            $table->unsignedBigInteger('equipo_id');
            $table->boolean('motor_ok')->default(true);
            $table->boolean('frenos_ok')->default(true);
            $table->boolean('aceite_ok')->default(true);
            $table->boolean('neumaticos_ok')->default(true);
            $table->boolean('luces_ok')->default(true);
            $table->boolean('seguridad_ok')->default(true);
            $table->text('observaciones')->nullable();
            $table->foreignId('firma_responsable_id')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->index(['equipo_tipo', 'equipo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspeccions');
    }
};
