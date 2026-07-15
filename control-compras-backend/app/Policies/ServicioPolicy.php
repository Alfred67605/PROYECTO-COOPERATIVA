<?php

namespace App\Policies;

use App\Models\Servicio;
use App\Models\User;

class ServicioPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Servicio $servicio): bool
    {
        if ($user->canAccess('servicios')) {
            return true;
        }
        return $user->id === $servicio->usuario_registro_id || $user->id === $servicio->responsable_id;
    }

    public function create(User $user): bool
    {
        return $user->canWrite('servicios');
    }

    public function update(User $user, Servicio $servicio): bool
    {
        return $user->canWrite('servicios');
    }

    public function delete(User $user, Servicio $servicio): bool
    {
        return $user->canWrite('servicios');
    }
}
