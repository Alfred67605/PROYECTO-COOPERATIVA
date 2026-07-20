<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class EmpresaSetting extends Model
{
    protected $table = 'empresa_settings';

    protected $fillable = [
        'nombre_empresa',
        'subtitulo',
        'logo',
    ];

    protected $appends = ['logo_url'];

    /**
     * Get the full URL for the logo.
     */
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo) {
            return null;
        }
        return asset('storage/' . $this->logo);
    }

    /**
     * Get the singleton instance (always first record).
     */
    public static function instance(): self
    {
        return self::firstOrCreate([], [
            'nombre_empresa' => 'MINERA COP',
            'subtitulo' => 'Sistema Empresarial',
        ]);
    }
}
