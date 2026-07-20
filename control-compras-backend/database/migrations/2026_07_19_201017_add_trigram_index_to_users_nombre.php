<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Enable pg_trgm extension in PostgreSQL for fast text search
        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        
        // Create GIN index for case-insensitive LIKE/ILIKE searches on user name
        DB::statement('CREATE INDEX IF NOT EXISTS idx_users_nombre_trgm ON users USING gin (nombre gin_trgm_ops)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_users_nombre_trgm');
    }
};
