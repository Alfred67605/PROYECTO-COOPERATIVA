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
        Schema::create('cargas_combustible', function (Blueprint $table) {
            $table->id();
            $table->string('tipo_combustible'); // 'diesel' o 'gasolina'
            $table->string('tipo_equipo'); // 'vehiculo' o 'maquinaria'
            $table->foreignId('vehiculo_id')->nullable()->constrained('vehiculos')->onDelete('set null');
            $table->foreignId('maquinaria_id')->nullable()->constrained('maquinarias')->onDelete('set null');
            $table->decimal('litros', 10, 2);
            $table->decimal('monto', 10, 2);
            $table->decimal('precio_por_litro', 10, 2)->nullable();
            $table->string('surtidor_grifo'); // Estación / Surtidor / Grifo
            $table->string('responsable'); // Responsable de la carga / chofer / operador
            $table->dateTime('fecha_hora');
            $table->text('observacion')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cargas_combustible');
    }
};
