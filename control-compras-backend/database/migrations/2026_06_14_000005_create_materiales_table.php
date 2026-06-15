<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materiales', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->text('descripcion');
            $table->string('grupo', 100)->nullable();
            $table->string('categoria', 100)->nullable();
            $table->string('unidad', 50)->nullable();
            $table->decimal('cantidad', 12, 2)->default(0);
            $table->decimal('precio_unitario', 12, 2)->default(0);
            $table->decimal('valor_total', 14, 2)->default(0);
            $table->string('imagen', 255)->nullable();
            $table->string('estado', 20)->default('disponible');
            $table->timestamps();

            // Indexes for filtering
            $table->index('grupo');
            $table->index('categoria');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materiales');
    }
};
