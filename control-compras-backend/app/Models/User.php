<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'rol_id',
        'estado',
        'avatar',
    ];

    protected $appends = ['avatar_url'];

    /**
     * Get the full URL for the avatar.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (!array_key_exists('avatar', $this->attributes) || !$this->avatar) {
            return null;
        }
        return asset('storage/' . $this->avatar);
    }

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'estado' => 'boolean',
        ];
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class);
    }

    public function permisos()
    {
        return $this->belongsToMany(Permiso::class);
    }

    public function hasPermission(string $permiso): bool
    {
        if (!$this->estado) {
            return false;
        }
        if ($this->rol?->nombre === 'Administrador General') {
            return true;
        }
        return $this->permisos()->where('nombre', $permiso)->exists();
    }

    public function canAccess(string $module): bool
    {
        if (!$this->estado) {
            return false;
        }
        if ($this->rol?->nombre === 'Administrador General') {
            return true;
        }

        $roleDefaults = [
            'Gerencia' =>            ['materiales', 'compras', 'servicios', 'reportes', 'auditoria'],
            'Compras' =>             ['proveedores', 'materiales', 'compras'],
            'Contabilidad' =>        ['materiales', 'compras', 'reportes'],
            'Supervisor Bocamina' => ['bocaminas', 'materiales', 'servicios'],
            'Consulta' =>            ['reportes', 'auditoria'],
        ];

        $defaults = $roleDefaults[$this->rol?->nombre] ?? [];
        return in_array($module, $defaults) || $this->hasPermission($module);
    }

    public function canWrite(string $module): bool
    {
        if (!$this->estado) {
            return false;
        }
        if ($this->rol?->nombre === 'Consulta') {
            return false;
        }
        if ($this->permisos()->where('nombre', 'solo_lectura')->exists()) {
            return false;
        }
        return $this->canAccess($module);
    }
}
