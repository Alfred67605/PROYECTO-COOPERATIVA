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
        Schema::create('maquinarias', function (Blueprint $table) {
            $table->id();
            $table->string('tipo'); // Retroexcavadora, etc.
            $table->string('nombre_codigo');
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->string('placa')->nullable();
            $table->decimal('horometro', 10, 2)->default(0);
            $table->decimal('kilometraje', 10, 2)->default(0);
            $table->string('estado', 20)->default('operativa'); // operativa, en_mantenimiento, inactiva
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maquinarias');
    }
};
