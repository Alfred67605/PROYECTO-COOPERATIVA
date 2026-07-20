<?php

namespace App\Policies;

use App\Models\Compra;
use App\Models\User;

class CompraPolicy
{
    /**
     * Determine whether the user can view any compras.
     * All authenticated users can list compras.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view a specific compra.
     */
    public function view(User $user, Compra $compra): bool
    {
        return $user->canAccess('compras');
    }

    public function create(User $user): bool
    {
        return $user->canWrite('compras');
    }

    /**
     * Determine whether the user can update compras.
     */
    public function update(User $user, Compra $compra): bool
    {
        return $user->canWrite('compras');
    }

    /**
     * Determine whether the user can delete compras.
     * Only Administrador General can delete.
     */
    public function delete(User $user, Compra $compra): bool
    {
        return $user->rol?->nombre === 'Administrador General';
    }
}
