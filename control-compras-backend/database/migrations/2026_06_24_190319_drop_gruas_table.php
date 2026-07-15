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
        Schema::dropIfExists('gruas');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('gruas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->string('tipo', 100);
            $table->string('capacidad_carga', 50)->nullable();
            $table->foreignId('operador_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('estado')->default('operativa'); // operativa, en_mantenimiento, inactiva
            $table->timestamps();
        });
    }
};
