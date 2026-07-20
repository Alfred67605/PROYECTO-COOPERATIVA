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
        try {
            // Enable pg_trgm extension in PostgreSQL for fast text search if available
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
            DB::statement('CREATE INDEX IF NOT EXISTS idx_users_nombre_trgm ON users USING gin (nombre gin_trgm_ops)');
        } catch (\Throwable $e) {
            // Gracefully ignore if pg_trgm extension is not installed on hosting server
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement('DROP INDEX IF EXISTS idx_users_nombre_trgm');
        } catch (\Throwable $e) {
            // Gracefully ignore
        }
    }
};
