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

        User::create([
            'nombre' => 'Admin Cooperativa',
            'email' => 'admin@cooperativa.com',
            'password' => Hash::make('Admin2026!'),
            'rol_id' => $adminRol->id,
            'estado' => true,
        ]);
    }
}
