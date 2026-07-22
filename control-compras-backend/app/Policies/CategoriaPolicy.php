<?php

namespace App\Policies;

use App\Models\Categoria;
use App\Models\User;

class CategoriaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Categoria $categoria): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->canWrite('compras') || $user->canWrite('materiales') || $user->canAccess('compras');
    }

    public function update(User $user, Categoria $categoria): bool
    {
        return $user->canWrite('compras') || $user->canWrite('materiales');
    }

    public function delete(User $user, Categoria $categoria): bool
    {
        return $user->canWrite('compras') || $user->canWrite('materiales');
    }
}
