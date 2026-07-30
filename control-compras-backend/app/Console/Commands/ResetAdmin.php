<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Rol;
use Illuminate\Support\Facades\Hash;

class ResetAdmin extends Command
{
    /**
     * El nombre y firma del comando en consola.
     *
     * @var string
     */
    protected $signature = 'reset-admin';

    /**
     * Descripción del comando.
     *
     * @var string
     */
    protected $description = 'Restablece la contraseña del usuario admin@cooperativa.com a Admin2026!';

    /**
     * Ejecuta el comando de consola.
     */
    public function handle()
    {
        $adminRol = Rol::where('nombre', 'Administrador General')->first();
        if (!$adminRol) {
            $adminRol = Rol::create(['nombre' => 'Administrador General', 'descripcion' => 'Administrador del sistema']);
        }

        $adminUser = User::where('email', 'admin@cooperativa.com')->first();
        if (!$adminUser) {
            $adminUser = User::create([
                'nombre' => 'Admin Cooperativa',
                'email' => 'admin@cooperativa.com',
                'password' => Hash::make('Admin2026!'),
                'rol_id' => $adminRol->id,
                'estado' => true,
            ]);
            $this->info('Usuario admin@cooperativa.com creado exitosamente con clave: Admin2026!');
        } else {
            $adminUser->password = Hash::make('Admin2026!');
            $adminUser->estado = true;
            $adminUser->rol_id = $adminRol->id;
            $adminUser->save();
            $this->info('Contraseña de admin@cooperativa.com restablecida correctamente a: Admin2026!');
        }

        return 0;
    }
}
