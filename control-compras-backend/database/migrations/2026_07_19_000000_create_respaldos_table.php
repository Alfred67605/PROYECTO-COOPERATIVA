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
        Schema::create('respaldos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_archivo');
            $table->string('tipo'); // manual / automatico
            $table->unsignedBigInteger('tamano'); // tamaño en bytes
            $table->string('estado'); // completado / fallido
            $table->foreignId('creado_por')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('respaldos');
    }
};
