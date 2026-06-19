<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grua extends Model
{
    use HasFactory;

    protected $fillable = [
        'tipo',
        'codigo',
        'capacidad_carga',
        'operador_id',
        'estado'
    ];

    public function operador()
    {
        return $this->belongsTo(User::class, 'operador_id');
    }

    public function servicios()
    {
        return $this->hasMany(Servicio::class, 'equipo_id')->where('equipo_tipo', 'grua');
    }
}
