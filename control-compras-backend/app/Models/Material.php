<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class Material extends Model
{
    use HasFactory;

    protected $table = 'materiales';

    protected $fillable = [
        'codigo',
        'descripcion',
        'grupo',
        'imagen',
        'estado',
    ];

    /**
     * Get the public URL for the material image.
     */
    protected function imagen(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($value) {
                    return asset('storage/' . $value);
                }

                // Fallback to checking if a file with slugified description exists
                // Uses file_exists() instead of Storage facade to avoid finfo dependency
                $slug = Str::slug($this->descripcion);
                $extensions = ['jpg', 'jpeg', 'png', 'webp'];
                $storagePath = storage_path('app/public');
                foreach ($extensions as $ext) {
                    $filename = "materiales/{$slug}.{$ext}";
                    if (file_exists($storagePath . '/' . $filename)) {
                        return asset('storage/' . $filename);
                    }
                }

                return null;
            }
        );
    }

    /**
     * Boot the model to handle deletion events.
     */
    protected static function booted()
    {
        static::deleting(function ($material) {
            $rawImagen = $material->getRawOriginal('imagen');
            if ($rawImagen) {
                $path = storage_path('app/public/' . $rawImagen);
                if (file_exists($path)) {
                    @unlink($path);
                }
            }
        });
    }

    public function detalleCompras()
    {
        return $this->hasMany(DetalleCompra::class);
    }
}

