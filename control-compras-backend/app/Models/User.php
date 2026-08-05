<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'rol_id',
        'estado',
        'avatar',
        'puede_eliminar',
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
            'puede_eliminar' => 'boolean',
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

    public function isAdmin(): bool
    {
        if ($this->rol_id == 1) {
            return true;
        }
        $roleName = strtolower($this->rol?->nombre ?? Rol::find($this->rol_id)?->nombre ?? '');
        return str_contains($roleName, 'admin');
    }

    /**
     * Verifica si el usuario puede eliminar registros.
     * Solo admin o usuarios con puede_eliminar = true.
     */
    public function canDelete(): bool
    {
        return $this->isAdmin() || (bool) $this->puede_eliminar;
    }

    public function hasPermission(string $permiso): bool
    {
        if (!$this->estado) {
            return false;
        }
        if ($this->isAdmin()) {
            return true;
        }
        return $this->permisos()->where('nombre', $permiso)->exists();
    }

    public function canAccess(string $module): bool
    {
        if (!$this->estado) {
            return false;
        }
        if ($this->isAdmin()) {
            return true;
        }

        if ($this->permisos()->where('nombre', $module)->exists()) {
            return true;
        }

        $roleDefaults = [
            'Gerencia' =>            ['dashboard', 'materiales', 'compras', 'servicios', 'reportes', 'auditoria'],
            'Compras' =>             ['dashboard', 'proveedores', 'materiales', 'compras'],
            'Contabilidad' =>        ['dashboard', 'materiales', 'compras', 'reportes'],
            'Supervisor Bocamina' => ['dashboard', 'bocaminas', 'materiales', 'servicios'],
            'Consulta' =>            ['dashboard', 'reportes', 'auditoria'],
        ];

        $defaults = $roleDefaults[$this->rol?->nombre] ?? [];
        return in_array($module, $defaults);
    }

    public function canWrite(string $module): bool
    {
        if (!$this->estado) {
            return false;
        }
        if ($this->isAdmin()) {
            return true;
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
