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
        Schema::create('gruas', function (Blueprint $table) {
            $table->id();
            $table->string('tipo');
            $table->string('codigo');
            $table->decimal('capacidad_carga', 10, 2)->nullable();
            $table->foreignId('operador_id')->nullable()->constrained('users');
            $table->string('estado', 20)->default('operativa');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gruas');
    }
};
