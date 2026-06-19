<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maquinaria extends Model
{
    use HasFactory;

    protected $fillable = [
        'tipo',
        'nombre_codigo',
        'marca',
        'modelo',
        'placa',
        'horometro',
        'kilometraje',
        'estado'
    ];

    public function servicios()
    {
        return $this->hasMany(Servicio::class, 'equipo_id')->where('equipo_tipo', 'maquinaria');
    }
}
