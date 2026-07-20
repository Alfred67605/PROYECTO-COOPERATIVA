<?php

namespace App\Policies;

use App\Models\Bocamina;
use App\Models\User;

class BocaminaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Bocamina $bocamina): bool
    {
        return true;
    }

    /**
     * Only Administrador General can manage bocaminas.
     */
    public function create(User $user): bool
    {
        return $user->rol?->nombre === 'Administrador General';
    }

    public function update(User $user, Bocamina $bocamina): bool
    {
        return $user->rol?->nombre === 'Administrador General';
    }

    public function delete(User $user, Bocamina $bocamina): bool
    {
        return $user->rol?->nombre === 'Administrador General';
    }
}
