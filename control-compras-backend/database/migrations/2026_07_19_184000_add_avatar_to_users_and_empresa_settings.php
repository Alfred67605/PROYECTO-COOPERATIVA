<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add avatar column to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('estado');
        });

        // Create empresa_settings table
        Schema::create('empresa_settings', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_empresa')->default('MINERA COP');
            $table->string('subtitulo')->nullable()->default('Sistema Empresarial');
            $table->string('logo')->nullable();
            $table->timestamps();
        });

        // Insert default record
        DB::table('empresa_settings')->insert([
            'nombre_empresa' => 'MINERA COP',
            'subtitulo' => 'Sistema Empresarial',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });

        Schema::dropIfExists('empresa_settings');
    }
};
