<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')->constrained('proveedores')->onDelete('restrict');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('bocamina_id')->nullable()->constrained('bocaminas')->onDelete('set null');
            $table->date('fecha');
            $table->string('numero_factura', 100)->nullable();
            $table->text('observaciones')->nullable();
            $table->decimal('total', 14, 2)->default(0);
            $table->string('estado', 20)->default('registrada');
            $table->timestamps();

            // Indexes
            $table->index('fecha');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
