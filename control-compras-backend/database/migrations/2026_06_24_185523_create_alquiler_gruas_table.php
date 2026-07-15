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
        Schema::dropIfExists('asignacion_transportes');

        Schema::create('alquiler_gruas', function (Blueprint $table) {
            $table->id();
            $table->string('placa_grua', 50);
            $table->string('capacidad_carga', 50)->nullable();
            $table->string('nombre_chofer', 100);
            $table->string('tiempo_trabajo', 50)->nullable();
            $table->decimal('costo', 10, 2)->nullable();
            $table->foreignId('bocamina_id')->constrained('bocaminas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alquiler_gruas');

        Schema::create('asignacion_transportes', function (Blueprint $table) {
            $table->id();
            $table->string('placa_vehiculo', 50);
            $table->string('nombre_chofer', 100);
            $table->foreignId('bocamina_id')->constrained('bocaminas')->onDelete('cascade');
            $table->timestamps();
        });
    }
};
