<?php

namespace App\Policies;

use App\Models\Proveedor;
use App\Models\User;

class ProveedorPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Proveedor $proveedor): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->canWrite('proveedores');
    }

    public function update(User $user, Proveedor $proveedor): bool
    {
        return $user->canWrite('proveedores');
    }

    public function delete(User $user, Proveedor $proveedor): bool
    {
        return $user->canWrite('proveedores');
    }
}
