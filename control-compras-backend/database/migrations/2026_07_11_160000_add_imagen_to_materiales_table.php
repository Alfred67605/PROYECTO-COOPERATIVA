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
        if (!Schema::hasColumn('materiales', 'imagen')) {
            Schema::table('materiales', function (Blueprint $table) {
                $table->string('imagen', 255)->nullable()->after('grupo');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('materiales', 'imagen')) {
            Schema::table('materiales', function (Blueprint $table) {
                $table->dropColumn('imagen');
            });
        }
    }
};
