<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $adminRol = Rol::where('nombre', 'Administrador General')->first();
        $comprasRol = Rol::where('nombre', 'Compras')->first();

        // Admin User
        User::updateOrCreate(
            ['email' => 'admin@cooperativa.com'],
            [
                'nombre' => 'Admin Cooperativa',
                'password' => Hash::make('Admin123$'),
                'rol_id' => $adminRol->id,
                'estado' => true,
            ]
        );

        // Compras Users requested by user
        $usuariosCompras = [
            ['nombre' => 'Jose Luis Mencacho', 'email' => 'joseluis@cooperativa.com'],
            ['nombre' => 'Juan Carlos Incata', 'email' => 'juancarlos@cooperativa.com'],
            ['nombre' => 'Juan Torrez', 'email' => 'juantorrez@cooperativa.com'],
            ['nombre' => 'Waldo Hanco', 'email' => 'waldo@cooperativa.com'],
            ['nombre' => 'Emilio Torrez', 'email' => 'emilio@cooperativa.com'],
            ['nombre' => 'Elio Caceres', 'email' => 'elio@cooperativa.com'],
            ['nombre' => 'Eloy Canabiri', 'email' => 'eloy@cooperativa.com'],
        ];

        foreach ($usuariosCompras as $u) {
            User::firstOrCreate(
                ['email' => $u['email']],
                [
                    'nombre' => $u['nombre'],
                    'password' => Hash::make('Password123!'),
                    'rol_id' => $comprasRol->id,
                    'estado' => true,
                ]
            );
        }
    }
}
