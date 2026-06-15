<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bocamina extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'ubicacion',
        'estado',
        'responsable',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function compras()
    {
        return $this->hasMany(Compra::class);
    }
}
