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
        Schema::create('asignacion_transportes', function (Blueprint $table) {
            $table->id();
            $table->string('placa_vehiculo', 50);
            $table->string('nombre_chofer', 100);
            $table->foreignId('bocamina_id')->constrained('bocaminas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asignacion_transportes');
    }
};
