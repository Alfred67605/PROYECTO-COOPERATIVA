<?php

namespace App\Policies;

use App\Models\Inspeccion;
use App\Models\User;

class InspeccionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccess('servicios');
    }

    public function view(User $user, Inspeccion $inspeccion): bool
    {
        if ($user->canAccess('servicios')) {
            return true;
        }
        return $user->id === $inspeccion->firma_responsable_id;
    }

    public function create(User $user): bool
    {
        return true; // Any authenticated user can create an inspection
    }

    public function update(User $user, Inspeccion $inspeccion): bool
    {
        if ($user->canWrite('servicios')) {
            return true;
        }
        return $user->id === $inspeccion->firma_responsable_id;
    }

    public function delete(User $user, Inspeccion $inspeccion): bool
    {
        return $user->canWrite('servicios');
    }
}
