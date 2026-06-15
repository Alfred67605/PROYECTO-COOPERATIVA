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
        Schema::table('materiales', function (Blueprint $table) {
            $table->dropColumn(['categoria', 'unidad', 'cantidad', 'precio_unitario', 'valor_total']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materiales', function (Blueprint $table) {
            $table->string('categoria')->nullable();
            $table->string('unidad')->nullable();
            $table->decimal('cantidad', 15, 2)->default(0);
            $table->decimal('precio_unitario', 15, 2)->default(0);
            $table->decimal('valor_total', 15, 2)->default(0);
        });
    }
};
