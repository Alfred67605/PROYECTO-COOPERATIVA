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
        Schema::create('servicios', function (Blueprint $table) {
            $table->id();
            $table->string('codigo')->unique();
            $table->date('fecha');
            $table->time('hora');
            $table->foreignId('usuario_registro_id')->constrained('users');
            $table->foreignId('responsable_id')->nullable()->constrained('users');
            $table->string('estado', 20)->default('Pendiente'); // Pendiente, En proceso, Finalizado, Cancelado
            $table->string('equipo_tipo'); // 'maquinaria', 'grua', 'vehiculo'
            $table->unsignedBigInteger('equipo_id');
            $table->foreignId('boca_mina_id')->nullable()->constrained('bocaminas');
            $table->string('ubicacion_detalle')->nullable(); // Nivel 300, etc.
            $table->foreignId('tipo_mantenimiento_id')->nullable()->constrained('tipo_mantenimientos');
            $table->text('descripcion')->nullable();
            $table->text('fallas')->nullable();
            $table->text('solucion')->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
            
            $table->index(['equipo_tipo', 'equipo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
