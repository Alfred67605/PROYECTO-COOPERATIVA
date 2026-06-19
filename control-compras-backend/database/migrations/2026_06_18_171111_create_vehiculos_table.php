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
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('tipo'); // Camioneta, Volqueta, etc
            $table->string('placa');
            $table->string('marca')->nullable();
            $table->string('modelo')->nullable();
            $table->foreignId('conductor_id')->nullable()->constrained('users');
            $table->string('estado', 20)->default('operativo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
