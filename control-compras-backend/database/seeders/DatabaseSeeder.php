<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            RolSeeder::class,
            PermisoSeeder::class,
            UsuarioSeeder::class,
            ProveedorSeeder::class,
            BocaminaSeeder::class,
            MaterialesRealesSeeder::class,
            CompraSeeder::class,
            ServiciosSeeder::class,
            HistorialSeeder::class,
        ]);
    }
}
